import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Users, Link, RefreshCw, ArrowUpDown } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from("flink_profiles")
        .select("id, user_id, handle, created_at");

      const { data: links } = await supabase
        .from("social_links")
        .select("user_id");

      const linkCounts = {};
      (links || []).forEach((l) => {
        linkCounts[l.user_id] = (linkCounts[l.user_id] || 0) + 1;
      });

      setUsers(
        (profiles || []).map((p) => ({
          ...p,
          link_count: linkCounts[p.user_id] || 0,
        }))
      );
    } catch (err) {
      console.error("Admin fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "handle");
    }
  };

  const sorted = [...users].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return sortAsc ? -1 : 1;
    if (av > bv) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Flink Admin
          </h1>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-1">
              <Users size={18} className="text-zinc-400" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-1">
              <Link size={18} className="text-zinc-400" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Links</span>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">
              {users.reduce((sum, u) => sum + u.link_count, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 rounded-full animate-spin border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">#</th>
                  <SortHeader label="Handle" field="handle" current={sortField} asc={sortAsc} onSort={toggleSort} />
                  <th className="px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User ID</th>
                  <SortHeader label="Links" field="link_count" current={sortField} asc={sortAsc} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, i) => (
                  <tr key={u.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-zinc-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <a
                        href={`/${u.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-zinc-900 dark:text-white hover:underline"
                      >
                        {u.handle}
                      </a>
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {u.user_id}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-900 dark:text-white font-medium">
                      {u.link_count}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-zinc-400">
                      No users yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function SortHeader({ label, field, current, asc, onSort }) {
  const active = current === field;
  return (
    <th
      className="px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-900 dark:hover:text-white transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={active ? "text-zinc-900 dark:text-white" : "opacity-30"} />
        {active && <span className="text-[10px]">{asc ? "↑" : "↓"}</span>}
      </span>
    </th>
  );
}
