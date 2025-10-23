import { supabase } from './supabase';
import cache from './cache';

// Cache TTL constants
const CACHE_TTL = {
  CONNECTIONS: 120000, // 2 minutes
  PENDING: 60000,      // 1 minute
  SENT: 60000,         // 1 minute
  STATUS: 30000        // 30 seconds
};

/**
 * Invalidate cache for a specific user
 * @param {string} userId - User ID to invalidate cache for
 */
const invalidateUserCache = (userId) => {
  cache.delete(`connections:${userId}`);
  cache.delete(`pending:${userId}`);
  cache.delete(`sent:${userId}`);
  // console.log('Cache invalidated for user:', userId);
};

/**
 * Invalidate cache for multiple users
 * @param {string[]} userIds - Array of user IDs to invalidate cache for
 */
const invalidateUsersCache = (userIds) => {
  userIds.forEach(userId => invalidateUserCache(userId));
};

/**
 * Connection Management Service
 * Handles all user-to-user relationship operations using the connections table
 */

// Connection statuses
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted', 
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

/**
 * Send a friend request or create instant connection
 * @param {string} senderId - ID of user sending the request
 * @param {string} receiverId - ID of user receiving the request
 * @param {boolean} isProfilePrivate - Whether the target profile is private
 * @returns {Promise<{data, error}>}
 */
export const sendFriendRequest = async (senderId, receiverId, isProfilePrivate = false) => {
  try {
    // Check if connection already exists
    // Try first combination: senderId as sender, receiverId as receiver
    let { data: existingConnections, error: checkError } = await supabase
      .from('connections')
      .select('*')
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .limit(1);

    // If not found, try reverse combination: receiverId as sender, senderId as receiver
    if (checkError || !existingConnections || existingConnections.length === 0) {
      const { data: reverseConnections, error: reverseError } = await supabase
        .from('connections')
        .select('*')
        .eq('sender_id', receiverId)
        .eq('receiver_id', senderId)
        .limit(1);

      if (reverseError) {
        return { data: null, error: reverseError };
      }

      existingConnections = reverseConnections;
    }

    const existingConnection = existingConnections && existingConnections.length > 0 ? existingConnections[0] : null;

    if (existingConnection) {
      return { 
        data: null, 
        error: { 
          message: 'Connection already exists',
          code: 'CONNECTION_EXISTS',
          details: existingConnection
        }
      };
    }

    // Determine status based on profile privacy
    const status = isProfilePrivate ? CONNECTION_STATUS.PENDING : CONNECTION_STATUS.ACCEPTED;

    // Create new connection
    const { data, error } = await supabase
      .from('connections')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    // Invalidate cache for both users
    if (data && !error) {
      invalidateUsersCache([senderId, receiverId]);
    }

    return { data, error };
  } catch (err) {
    console.error('Error sending friend request:', err);
    return { data: null, error: err };
  }
};

/**
 * Accept a friend request
 * @param {string} connectionId - ID of the connection to accept
 * @returns {Promise<{data, error}>}
 */
export const acceptFriendRequest = async (connectionId) => {
  try {
    // First get the connection to know which users to invalidate cache for
    const { data: connectionData } = await supabase
      .from('connections')
      .select('sender_id, receiver_id')
      .eq('id', connectionId)
      .single();

    const { data, error } = await supabase
      .from('connections')
      .update({
        status: CONNECTION_STATUS.ACCEPTED,
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single();

    // Invalidate cache for both users
    if (data && !error && connectionData) {
      invalidateUsersCache([connectionData.sender_id, connectionData.receiver_id]);
    }

    return { data, error };
  } catch (err) {
    console.error('Error accepting friend request:', err);
    return { data: null, error: err };
  }
};

/**
 * Reject a friend request
 * @param {string} connectionId - ID of the connection to reject
 * @returns {Promise<{data, error}>}
 */
export const rejectFriendRequest = async (connectionId) => {
  try {
    // First get the connection to know which users to invalidate cache for
    const { data: connectionData } = await supabase
      .from('connections')
      .select('sender_id, receiver_id')
      .eq('id', connectionId)
      .single();

    const { data, error } = await supabase
      .from('connections')
      .update({
        status: CONNECTION_STATUS.REJECTED,
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single();

    // Invalidate cache for both users
    if (data && !error && connectionData) {
      invalidateUsersCache([connectionData.sender_id, connectionData.receiver_id]);
    }

    return { data, error };
  } catch (err) {
    console.error('Error rejecting friend request:', err);
    return { data: null, error: err };
  }
};

/**
 * Remove a connection (unfriend)
 * @param {string} connectionId - ID of the connection to remove
 * @returns {Promise<{data, error}>}
 */
export const removeConnection = async (connectionId) => {
  try {
    // First get the connection to know which users to invalidate cache for
    const { data: connectionData } = await supabase
      .from('connections')
      .select('sender_id, receiver_id')
      .eq('id', connectionId)
      .single();

    const { data, error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
      .select()
      .single();

    // Invalidate cache for both users
    if (data && !error && connectionData) {
      invalidateUsersCache([connectionData.sender_id, connectionData.receiver_id]);
    }

    return { data, error };
  } catch (err) {
    console.error('Error removing connection:', err);
    return { data: null, error: err };
  }
};

/**
 * Get all connections for a user (friends)
 * @param {string} userId - ID of the user
 * @returns {Promise<{data, error}>}
 */
export const getUserConnections = async (userId) => {
  try {
    const cacheKey = `connections:${userId}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // console.log('Cache hit for user connections:', userId);
      return { data: cachedData, error: null };
    }

    // console.log('Cache miss for user connections:', userId);
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        sender:users!connections_sender_id_fkey(
          id, 
          name, 
          profile_url, 
          created_at,
          flink_profiles(handle, bio, location)
        ),
        receiver:users!connections_receiver_id_fkey(
          id, 
          name, 
          profile_url, 
          created_at,
          flink_profiles(handle, bio, location)
        )
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', CONNECTION_STATUS.ACCEPTED)
      .order('created_at', { ascending: false });

    // Cache the result
    if (data && !error) {
      cache.set(cacheKey, data, CACHE_TTL.CONNECTIONS);
    }

    return { data, error };
  } catch (err) {
    console.error('Error fetching user connections:', err);
    return { data: null, error: err };
  }
};

/**
 * Get pending friend requests received by a user
 * @param {string} userId - ID of the user
 * @returns {Promise<{data, error}>}
 */
export const getPendingRequests = async (userId) => {
  try {
    const cacheKey = `pending:${userId}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // console.log('Cache hit for pending requests:', userId);
      return { data: cachedData, error: null };
    }

    // console.log('Cache miss for pending requests:', userId);
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        sender:users!connections_sender_id_fkey(
          id, 
          name, 
          profile_url, 
          created_at,
          flink_profiles(handle, bio, location)
        )
      `)
      .eq('receiver_id', userId)
      .eq('status', CONNECTION_STATUS.PENDING)
      .order('created_at', { ascending: false });

    // Cache the result
    if (data && !error) {
      cache.set(cacheKey, data, CACHE_TTL.PENDING);
    }

    return { data, error };
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    return { data: null, error: err };
  }
};

/**
 * Get sent friend requests by a user
 * @param {string} userId - ID of the user
 * @returns {Promise<{data, error}>}
 */
export const getSentRequests = async (userId) => {
  try {
    const cacheKey = `sent:${userId}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // console.log('Cache hit for sent requests:', userId);
      return { data: cachedData, error: null };
    }

    // console.log('Cache miss for sent requests:', userId);
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        receiver:users!connections_receiver_id_fkey(
          id, 
          name, 
          profile_url, 
          created_at,
          flink_profiles(handle, bio, location)
        )
      `)
      .eq('sender_id', userId)
      .eq('status', CONNECTION_STATUS.PENDING)
      .order('created_at', { ascending: false });

    // Cache the result
    if (data && !error) {
      cache.set(cacheKey, data, CACHE_TTL.SENT);
    }

    return { data, error };
  } catch (err) {
    console.error('Error fetching sent requests:', err);
    return { data: null, error: err };
  }
};

/**
 * Check connection status between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<{data, error}>}
 */
export const getConnectionStatus = async (userId1, userId2) => {
  try {
    // Try first combination: userId1 as sender, userId2 as receiver
    let { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('sender_id', userId1)
      .eq('receiver_id', userId2)
      .limit(1);

    // If not found, try reverse combination: userId2 as sender, userId1 as receiver
    if (error || !data || data.length === 0) {
      const { data: reverseData, error: reverseError } = await supabase
        .from('connections')
        .select('*')
        .eq('sender_id', userId2)
        .eq('receiver_id', userId1)
        .limit(1);

      if (reverseError || !reverseData || reverseData.length === 0) {
        // No connection exists in either direction
        return { data: null, error: null };
      }

      return { data: reverseData[0], error: null };
    }

    return { data: data[0], error: null };
  } catch (err) {
    console.error('Error checking connection status:', err);
    return { data: null, error: err };
  }
};

/**
 * Check if user can view another user's profile (privacy check)
 * @param {string} viewerId - ID of user trying to view
 * @param {string} profileUserId - ID of profile owner
 * @param {boolean} isProfilePrivate - Whether the profile is private
 * @returns {Promise<{canView: boolean, connection: object}>}
 */
export const canViewProfile = async (viewerId, profileUserId, isProfilePrivate) => {
  try {
    // If it's the same user, they can always view their own profile
    if (viewerId === profileUserId) {
      return { canView: true, connection: null };
    }

    // Check if there's an existing connection between users
    const { data: connection, error } = await getConnectionStatus(viewerId, profileUserId);
    
    if (error) {
      console.error('Error checking profile access:', error);
      return { canView: false, connection: null };
    }

    // TEMPORARILY DISABLE PRIVACY CHECKS - Allow all profiles to be viewed
    // TODO: Implement proper privacy system later
    return { canView: true, connection };
  } catch (err) {
    console.error('Error checking profile access:', err);
    return { canView: false, connection: null };
  }
};

/**
 * Get connection statistics for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<{data, error}>}
 */
export const getConnectionStats = async (userId) => {
  try {
    const [connectionsResult, pendingReceivedResult, pendingSentResult] = await Promise.all([
      getUserConnections(userId),
      getPendingRequests(userId),
      getSentRequests(userId)
    ]);

    if (connectionsResult.error || pendingReceivedResult.error || pendingSentResult.error) {
      return {
        data: null,
        error: connectionsResult.error || pendingReceivedResult.error || pendingSentResult.error
      };
    }

    const stats = {
      friendsCount: connectionsResult.data?.length || 0,
      pendingReceivedCount: pendingReceivedResult.data?.length || 0,
      pendingSentCount: pendingSentResult.data?.length || 0,
      totalConnections: (connectionsResult.data?.length || 0) + 
                       (pendingReceivedResult.data?.length || 0) + 
                       (pendingSentResult.data?.length || 0)
    };

    return { data: stats, error: null };
  } catch (err) {
    console.error('Error fetching connection stats:', err);
    return { data: null, error: err };
  }
};

// Export cache for debugging
export { cache };
