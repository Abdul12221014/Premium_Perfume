import { Link } from "react-router-dom";

const articles = [
  {
    slug: "the-anatomy-of-memory",
    title: "The Anatomy of Memory",
    subtitle: "How scent bypasses consciousness to embed itself in the limbic system.",
    date: "December 2024",
    excerpt: "Memory is not a filing cabinet. It is a web, delicate and interconnected, woven through experience and emotion. And at the center of this web, scent holds a singular power.",
    image: "https://images.unsplash.com/photo-1586343785368-997d31ba8099?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxkYXJrJTIwdGV4dHVyZSUyMHdvb2QlMjBzaWxrJTIwc3RvbmUlMjBsdXh1cnklMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNDU1MDMxfDA&ixlib=rb-4.1.0&q=85"
  },
  {
    slug: "oud-the-patience-of-darkness",
    title: "Oud: The Patience of Darkness",
    subtitle: "Fifty years to mature. A lifetime to understand.",
    date: "November 2024",
    excerpt: "True oud does not announce itself. It unfolds—layer by layer, hour by hour—revealing its complexity only to those willing to wait.",
    image: "https://images.unsplash.com/photo-1709294993903-f6d8ef544e55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxwZXJmdW1lciUyMGJsZW5kaW5nJTIwaW5ncmVkaWVudHMlMjBkYXJrJTIwbGFib3JhdG9yeSUyMGNpbmVtYXRpYyUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3NzE0NTUwMzJ8MA&ixlib=rb-4.1.0&q=85"
  },
  {
    slug: "restraint-as-power",
    title: "Restraint as Power",
    subtitle: "Why the most compelling fragrances whisper rather than shout.",
    date: "October 2024",
    excerpt: "In an industry obsessed with projection and sillage, ARAR chooses a different path. We design fragrances that linger in memory, not in hallways.",
    image: "https://images.unsplash.com/photo-1748113738327-878482a6e3d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdGV4dHVyZSUyMHdvb2QlMjBzaWxrJTIwc3RvbmUlMjBsdXh1cnklMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNDU1MDMxfDA&ixlib=rb-4.1.0&q=85"
  }
];

export const JournalPage = () => {
  return (
    <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32">
      {/* Hero */}
      <section data-testid="journal-hero" className="px-6 md:px-12 pb-24">
        <div className="max-w-[1200px] mx-auto text-center animate-fade-in">
          <h1 data-testid="journal-title" className="heading-font text-5xl md:text-7xl tracking-tight text-[#F4F1EA] mb-8">
            Journal
          </h1>
          <p data-testid="journal-subtitle" className="body-font text-base md:text-lg font-light text-[#F4F1EA]/60 leading-loose max-w-2xl mx-auto">
            Reflections on scent, craft, and the invisible architecture of memory.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section data-testid="journal-articles" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Link
                key={article.slug}
                to={`/journal/${article.slug}`}
                data-testid={`article-card-${article.slug}`}
                className="group relative border border-white/5 hover:border-[#BFA46D]/30 transition-colors duration-700 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover brightness-[0.8] contrast-[1.1] grayscale-[0.2] group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <p data-testid={`article-date-${article.slug}`} className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4">
                    {article.date}
                  </p>
                  <h3 data-testid={`article-title-${article.slug}`} className="heading-font text-2xl text-[#F4F1EA] mb-3">
                    {article.title}
                  </h3>
                  <p data-testid={`article-subtitle-${article.slug}`} className="body-font text-sm font-light text-[#BFA46D] mb-4 leading-relaxed">
                    {article.subtitle}
                  </p>
                  <p data-testid={`article-excerpt-${article.slug}`} className="body-font text-sm font-light text-[#F4F1EA]/60 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <span data-testid={`article-read-${article.slug}`} className="body-font text-xs tracking-widest uppercase text-[#F4F1EA]/70 group-hover:text-[#F4F1EA] transition-colors duration-500">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default JournalPage;
