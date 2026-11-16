import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { COMPARE } from "../seo/compare";

function LinktreeAlternative() {
  const { isDark } = useTheme();
  useDocumentMeta({ title: COMPARE.title, description: COMPARE.description, path: COMPARE.path });
  const muted = isDark ? "text-zinc-400" : "text-zinc-500";
  const line = isDark ? "border-zinc-800" : "border-zinc-100";

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"}`}>
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-b from-purple-950/20 via-transparent to-transparent"
            : "bg-gradient-to-b from-purple-100/30 via-pink-50/10 to-transparent"
        }`} />
      </div>

      <nav className="max-w-3xl mx-auto px-5 py-5">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Flink
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-5 pt-12 pb-24">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">{COMPARE.h1}</h1>
        <p className={`text-base sm:text-lg leading-relaxed mb-12 ${muted}`}>{COMPARE.intro}</p>

        <div className={`overflow-x-auto rounded-xl border ${line} mb-16`}>
          <table className="w-full text-sm text-left">
            <thead className={isDark ? "bg-zinc-900" : "bg-zinc-50"}>
              <tr>
                <th className="px-4 py-3 font-semibold">Feature</th>
                <th className="px-4 py-3 font-semibold">Flink</th>
                <th className="px-4 py-3 font-semibold">Linktree</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.rows.map(([feature, flink, linktree]) => (
                <tr key={feature} className={`border-t ${line}`}>
                  <td className="px-4 py-3 font-medium">{feature}</td>
                  <td className="px-4 py-3">{flink}</td>
                  <td className={`px-4 py-3 ${muted}`}>{linktree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {COMPARE.sections.map(({ h, p }) => (
          <section key={h} className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-3">{h}</h2>
            <p className={`text-base leading-relaxed ${muted}`}>{p}</p>
          </section>
        ))}

        <Link
          to="/login"
          className="inline-flex items-center gap-2 mt-4 text-sm font-semibold px-6 py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
        >
          Create your free Flink
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    </div>
  );
}

export default LinktreeAlternative;
