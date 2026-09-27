const AVATAR_URL_MARKERS = [
  "/storage/v1/object/public/avatars/",
  "/mock-storage/avatars/",
];

export const getAvatarStoragePath = (publicUrl) => {
  if (!publicUrl || typeof publicUrl !== "string") return null;

  for (const marker of AVATAR_URL_MARKERS) {
    const markerIndex = publicUrl.indexOf(marker);
    if (markerIndex !== -1) {
      const encodedPath = publicUrl.slice(markerIndex + marker.length).split("?")[0];
      try {
        return decodeURIComponent(encodedPath);
      } catch {
        return encodedPath;
      }
    }
  }

  return null;
};
