import { HOME_FAQ } from "../seo/faq";

function HomeFaq({ isDark }) {
  return (
    <section className="py-24 px-5">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">
          Frequently asked questions
        </h2>
        <div className={`divide-y border-y ${isDark ? "divide-zinc-800 border-zinc-800" : "divide-zinc-100 border-zinc-100"}`}>
          {HOME_FAQ.map(({ q, a }) => (
            <div key={q} className="py-6">
              <h3 className="text-base font-semibold mb-2">{q}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeFaq;
