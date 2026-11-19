export default function CompareEditorial({ articles }) {
  return (
    <section aria-labelledby="compare-buying-guides" className="grid gap-4">
      <h2 id="compare-buying-guides" className="text-xl font-bold">Car buying guides</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map(({ title, description, image, alt }) => (
          <article key={title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img src={image} alt={alt} loading="lazy" decoding="async" width={640} height={240} className="h-36 w-full object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
