import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const articlesContent = {
  "the-anatomy-of-memory": {
    title: "The Anatomy of Memory",
    subtitle: "How scent bypasses consciousness to embed itself in the limbic system.",
    date: "December 2024",
    image: "https://images.unsplash.com/photo-1586343785368-997d31ba8099?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxkYXJrJTIwdGV4dHVyZSUyMHdvb2QlMjBzaWxrJTIwc3RvbmUlMjBsdXh1cnklMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNDU1MDMxfDA&ixlib=rb-4.1.0&q=85",
    content: [
      "Memory is not a filing cabinet. It is a web, delicate and interconnected, woven through experience and emotion. And at the center of this web, scent holds a singular power.",
      "Unlike sight or sound, which pass through the thalamus for processing before reaching the cortex, scent travels directly to the limbic system—the brain's emotional core. It bypasses logic. It bypasses language. It speaks to the oldest parts of ourselves.",
      "This is why a fragrance can transport you to a moment decades past. Why the scent of rain on pavement might evoke a childhood summer. Why a stranger's perfume can resurrect a relationship long forgotten.",
      "At ARAR, we understand this phenomenon not as poetry, but as architecture. Each fragrance is designed with intention: to anchor itself not in the present moment, but in the memory of the wearer and those around them.",
      "We do not chase trends. We build monuments—invisible, enduring, carved into the mind."
    ]
  },
  "oud-the-patience-of-darkness": {
    title: "Oud: The Patience of Darkness",
    subtitle: "Fifty years to mature. A lifetime to understand.",
    date: "November 2024",
    image: "https://images.unsplash.com/photo-1709294993903-f6d8ef544e55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxwZXJmdW1lciUyMGJsZW5kaW5nJTIwaW5ncmVkaWVudHMlMjBkYXJrJTIwbGFib3JhdG9yeSUyMGNpbmVtYXRpYyUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3NzE0NTUwMzJ8MA&ixlib=rb-4.1.0&q=85",
    content: [
      "True oud does not announce itself. It unfolds—layer by layer, hour by hour—revealing its complexity only to those willing to wait.",
      "The agarwood tree must be infected by a specific mold. This infection triggers a defense mechanism: the tree produces a dark, fragrant resin to protect itself. This resin is oud.",
      "But the tree does not surrender it easily. It takes decades—sometimes fifty years—for the resin to mature. Only then can it be harvested, distilled, and transformed into the essence that perfumers covet.",
      "At ARAR, we source our oud from Assam, where families have cultivated agarwood for generations. They know which trees are ready. They know when to wait. They understand that patience is not passivity—it is precision.",
      "When you wear Eclipse Noir, you are not wearing perfume. You are wearing fifty years of patience, distilled into a single drop."
    ]
  },
  "restraint-as-power": {
    title: "Restraint as Power",
    subtitle: "Why the most compelling fragrances whisper rather than shout.",
    date: "October 2024",
    image: "https://images.unsplash.com/photo-1748113738327-878482a6e3d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdGV4dHVyZSUyMHdvb2QlMjBzaWxrJTIwc3RvbmUlMjBsdXh1cnklMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNDU1MDMxfDA&ixlib=rb-4.1.0&q=85",
    content: [
      "In an industry obsessed with projection and sillage, ARAR chooses a different path. We design fragrances that linger in memory, not in hallways.",
      "Loudness is not confidence. It is compensation. True authority does not need to announce itself—it simply exists, undeniable and self-evident.",
      "This principle guides every composition we create. Our fragrances are built for proximity, for intimacy, for the moment when someone leans in and asks, 'What are you wearing?'",
      "We believe that a fragrance should be discovered, not imposed. It should be a question, not an answer. An invitation, not a declaration.",
      "Restraint is not the absence of power. It is power, refined."
    ]
  }
};

export const ArticleDetailPage = () => {
  const { slug } = useParams();
  const article = articlesContent[slug];

  if (!article) {
    return (
      <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32 flex flex-col items-center justify-center">
        <p className="body-font text-[#F4F1EA]/60 mb-8">Article not found</p>
        <Link to="/journal" className="body-font text-xs tracking-widest uppercase text-[#BFA46D] hover:text-[#F4F1EA] transition-colors duration-500">
          Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32">
      {/* Back Link */}
      <div className="px-6 md:px-12 mb-12">
        <div className="max-w-[900px] mx-auto">
          <Link
            to="/journal"
            data-testid="back-to-journal"
            className="inline-flex items-center gap-2 body-font text-xs tracking-widest uppercase text-[#BFA46D] hover:text-[#F4F1EA] transition-colors duration-500"
          >
            <ArrowLeft size={16} strokeWidth={1} />
            Back to Journal
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-[900px] mx-auto animate-fade-in">
          <p data-testid="article-date" className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-6">
            {article.date}
          </p>
          <h1 data-testid="article-title" className="heading-font text-4xl md:text-6xl tracking-tight text-[#F4F1EA] mb-6">
            {article.title}
          </h1>
          <p data-testid="article-subtitle" className="body-font text-lg md:text-xl font-light text-[#BFA46D] leading-relaxed">
            {article.subtitle}
          </p>
        </div>
      </section>

      {/* Article Image */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-[600px] object-cover brightness-[0.8] contrast-[1.1]"
          />
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[900px] mx-auto">
          <div data-testid="article-content" className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-8">
            {article.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="px-6 md:px-12 py-16 bg-[#050505] border-t border-[#BFA46D]/10">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-8">
            Continue Reading
          </p>
          <Link
            to="/journal"
            data-testid="view-all-articles"
            className="inline-block bg-transparent text-[#F4F1EA] border border-[#BFA46D]/40 px-8 py-4 hover:bg-[#BFA46D] hover:text-[#0F0E0D] transition-colors duration-700 uppercase tracking-widest text-xs font-medium"
          >
            View All Articles
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetailPage;
