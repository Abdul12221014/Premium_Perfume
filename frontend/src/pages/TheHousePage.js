export const TheHousePage = () => {
  return (
    <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32">
      {/* Hero */}
      <section data-testid="house-hero" className="px-6 md:px-12 pb-24">
        <div className="max-w-[1200px] mx-auto text-center animate-fade-in">
          <h1 data-testid="house-title" className="heading-font text-5xl md:text-7xl tracking-tight text-[#F4F1EA] mb-8">
            The House
          </h1>
          <p data-testid="house-pronunciation" className="body-font text-sm tracking-[0.2em] uppercase text-[#BFA46D] mb-16">
            Pronounced ah-RAHR
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section data-testid="house-origin" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="origin-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-12">
            Origins
          </h2>
          <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-8 max-w-3xl">
            <p data-testid="origin-text-1">
              ARAR was born in the liminal hours—between dusk and darkness, between trade routes and stillness. The name itself comes from the juniper tree, ar'ar in Arabic, a plant that grows in harsh climates and yields a resin both sacred and scarce.
            </p>
            <p data-testid="origin-text-2">
              Like the juniper, ARAR does not flourish everywhere. It exists only where conditions allow: patience, precision, and the refusal to compromise.
            </p>
            <p data-testid="origin-text-3">
              The house was founded not to fill a market gap, but to answer a question: What does scent become when it is no longer decoration, but identity?
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section data-testid="house-philosophy" className="py-24 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="philosophy-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-12">
            Presence Over Proclamation
          </h2>
          <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-8 max-w-3xl">
            <p data-testid="philosophy-text-1">
              We do not believe in perfume as announcement. A fragrance should not enter a room before you do. It should linger after you've left—a trace, a question, a presence felt rather than declared.
            </p>
            <p data-testid="philosophy-text-2">
              ARAR fragrances are designed for those who understand that true authority does not need volume. They are compositions of restraint, built on the principle that memory is more powerful than first impressions.
            </p>
            <p data-testid="philosophy-text-3">
              This is perfumery as architecture: deliberate, structural, enduring. Each note is a pillar, each accord a corridor. Together, they form an invisible space—a house you carry with you.
            </p>
          </div>
        </div>
      </section>

      {/* The Juniper Symbol */}
      <section data-testid="house-juniper" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1748113738327-878482a6e3d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdGV4dHVyZSUyMHdvb2QlMjBzaWxrJTIwc3RvbmUlMjBsdXh1cnklMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNDU1MDMxfDA&ixlib=rb-4.1.0&q=85"
              alt="Juniper Symbolism"
              className="w-full h-[600px] object-cover brightness-[0.8] contrast-[1.1]"
            />
          </div>
          <div>
            <h2 data-testid="juniper-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-8">
              The Juniper
            </h2>
            <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-6">
              <p data-testid="juniper-text-1">
                The juniper tree has long been a symbol of protection and purification. In ancient trade routes, its resin was burned to cleanse spaces and mark sacred thresholds.
              </p>
              <p data-testid="juniper-text-2">
                For ARAR, the juniper represents resilience—the ability to thrive in scarcity, to produce something rare and potent even when the conditions are unforgiving.
              </p>
              <p data-testid="juniper-text-3">
                We channel this spirit into every bottle: nothing excess, nothing wasted, everything intentional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfume as Memory */}
      <section data-testid="house-memory" className="py-24 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="memory-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-12">
            Perfume as Memory
          </h2>
          <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-8 max-w-3xl">
            <p data-testid="memory-text-1">
              Scent is the most direct path to memory. It bypasses language, logic, and reason, speaking directly to the limbic system—the seat of emotion and recall.
            </p>
            <p data-testid="memory-text-2">
              At ARAR, we design fragrances not to be forgotten. Each composition is engineered to embed itself in the mind of the wearer and those around them. Not through force, but through resonance.
            </p>
            <p data-testid="memory-text-3">
              When you wear an ARAR fragrance, you are not just wearing a scent. You are becoming a memory—one that will outlast the moment, the evening, the season.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheHousePage;
