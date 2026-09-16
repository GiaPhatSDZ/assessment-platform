import { landingCopy } from "@/src/content/vi/site-copy";

export function Faq() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {landingCopy.faq.title}
          </h2>
        </div>

        <div className="mt-10 space-y-6">
          {landingCopy.faq.items.map((item) => (
            <div
              key={item.question}
              className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {item.question}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
