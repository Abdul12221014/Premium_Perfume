export const AtelierPage = () => {
  return (
    <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32">
      {/* Hero */}
      <section data-testid="atelier-hero" className="px-6 md:px-12 pb-24">
        <div className="max-w-[1200px] mx-auto text-center animate-fade-in">
          <h1 data-testid="atelier-title" className="heading-font text-5xl md:text-7xl tracking-tight text-[#F4F1EA] mb-8">
            The Atelier
          </h1>
          <p data-testid="atelier-subtitle" className="body-font text-lg md:text-xl font-light text-[#BFA46D] leading-relaxed max-w-2xl mx-auto">
            An invitation to discovery. A commitment to rarity.
          </p>
        </div>
      </section>

      {/* Limited Releases */}
      <section data-testid="atelier-limited" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="limited-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-12">
            Limited by Design
          </h2>
          <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-8 max-w-3xl">
            <p data-testid="limited-text-1">
              The ARAR Atelier does not produce for mass markets. Each fragrance is released in numbered batches, rarely exceeding 500 bottles per cycle. When a batch is exhausted, it may return—or it may not.
            </p>
            <p data-testid="limited-text-2">
              This is not artificial scarcity. It is a natural consequence of craft: ingredients that require years to mature, formulas that demand precision, and a refusal to scale at the expense of quality.
            </p>
            <p data-testid="limited-text-3">
              Scarcity, for us, is not a marketing tactic. It is an inevitability of doing things properly.
            </p>
          </div>
        </div>
      </section>

      {/* Numbered Bottles */}
      <section data-testid="atelier-numbered" className="py-24 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 data-testid="numbered-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-8">
              Every Bottle, Numbered
            </h2>
            <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-6">
              <p data-testid="numbered-text-1">
                Each ARAR bottle bears a batch number and a production date. This is not ceremony—it is accountability. You know exactly when your fragrance was created, and how limited its production truly was.
              </p>
              <p data-testid="numbered-text-2">
                Transparency is a form of respect. We believe you deserve to know the provenance of what you wear.
              </p>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1709294993903-f6d8ef544e55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxwZXJmdW1lciUyMGJsZW5kaW5nJTIwaW5ncmVkaWVudHMlMjBkYXJrJTIwbGFib3JhdG9yeSUyMGNpbmVtYXRpYyUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3NzE0NTUwMzJ8MA&ixlib=rb-4.1.0&q=85"
              alt="Numbered Bottles"
              className="w-full h-[600px] object-cover brightness-[0.8] contrast-[1.1]"
            />
          </div>
        </div>
      </section>

      {/* Private Discovery */}
      <section data-testid="atelier-private" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="private-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-12">
            Private Discovery Sessions
          </h2>
          <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose space-y-8 max-w-3xl">
            <p data-testid="private-text-1">
              For those who wish to experience the collection in person, we offer private discovery sessions at select locations. These are not shopping appointments—they are consultations.
            </p>
            <p data-testid="private-text-2">
              You will meet with an ARAR specialist who will guide you through the olfactory architecture of each fragrance, help you understand the philosophy behind the house, and recommend compositions suited to your presence.
            </p>
            <p data-testid="private-text-3">
              Sessions are by invitation only and must be arranged in advance. We do not accommodate walk-ins.
            </p>
            <div className="pt-8">
              <a 
                href="/contact"
                data-testid="private-cta"
                className="inline-block bg-transparent text-[#F4F1EA] border border-[#BFA46D]/40 px-8 py-4 hover:bg-[#BFA46D] hover:text-[#0F0E0D] transition-colors duration-700 uppercase tracking-widest text-xs font-medium"
              >
                Request an Invitation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Philosophy */}
      <section data-testid="atelier-philosophy" className="py-24 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1200px] mx-auto text-center">
          <blockquote data-testid="philosophy-quote" className="heading-font text-2xl md:text-4xl tracking-tight text-[#F4F1EA] leading-relaxed max-w-4xl mx-auto">
            "We do not create for everyone. We create for those who understand that rarity is not about exclusion—it is about intention."
          </blockquote>
          <p data-testid="philosophy-attribution" className="body-font text-sm tracking-[0.2em] uppercase text-[#BFA46D] mt-8">
            — The House of ARAR
          </p>
        </div>
      </section>
    </div>
  );
};

export default AtelierPage;
