import { Link } from "react-router-dom";
import { ArrowRight, Mail, Instagram } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { ABOUT } from "../seo/about";

function AboutPage() {
  const { isDark } = useTheme();
  useDocumentMeta({ title: ABOUT.title, description: ABOUT.description, path: ABOUT.path });
  const muted = isDark ? "text-zinc-400" : "text-zinc-500";
  const contactLink = `inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
    isDark ? "border-zinc-800 hover:border-zinc-700 text-zinc-200" : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
  }`;

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
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-12">{ABOUT.h1}</h1>

        {ABOUT.sections.map(({ h, p }) => (
          <section key={h} className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-3">{h}</h2>
            <p className={`text-base leading-relaxed ${muted}`}>{p}</p>
          </section>
        ))}

        <section className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Contact</h2>
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${ABOUT.email}`} className={contactLink}>
              <Mail className="w-4 h-4" />
              {ABOUT.email}
            </a>
            <a href={ABOUT.instagram} target="_blank" rel="noopener noreferrer" className={contactLink}>
              <Instagram className="w-4 h-4" />
              {ABOUT.instagramHandle}
            </a>
          </div>
        </section>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
        >
          Create your free Flink
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    </div>
  );
}

export default AboutPage;
