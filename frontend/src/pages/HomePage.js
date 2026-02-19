import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Abstract bottle silhouette placeholder (elegant SVG)
const BottleSilhouette = () => (
  <svg viewBox="0 0 200 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(191, 164, 109, 0.08)" />
        <stop offset="100%" stopColor="rgba(191, 164, 109, 0.02)" />
      </linearGradient>
    </defs>
    <rect x="60" y="40" width="80" height="60" fill="url(#bottleGradient)" opacity="0.3" />
    <rect x="70" y="100" width="60" height="280" fill="url(#bottleGradient)" opacity="0.4" />
    <rect x="75" y="105" width="50" height="270" fill="rgba(244, 241, 234, 0.02)" />
  </svg>
);

export const HomePage = () => {
  const [fragrances, setFragrances] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFragrances();
  }, []);

  const fetchFragrances = async () => {
    try {
      const response = await axios.get(`${API}/fragrances`);
      // Limit to first 3 for homepage (scarcity over abundance)
      setFragrances(response.data.slice(0, 3));
    } catch (error) {
      console.error("Error fetching fragrances:", error);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/newsletter`, { email });
      toast.success("Welcome to the Atelier. You will receive our occasional dispatches.");
      setEmail("");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("This email is already part of the Atelier.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain-overlay">
      {/* Hero Section - Increased padding */}
      <section
        data-testid="hero-section"
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 14, 13, 0.5), rgba(15, 14, 13, 0.75)), url('https://images.unsplash.com/photo-1586343785368-997d31ba8099?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxkYXJrJTIwdGV4dHVyZSUyMHdvb2QlMjBzaWxrJTIwc3RvbmUlMjBsdXh1cnklMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNDU1MDMxfDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="text-center px-6 animate-fade-in max-w-5xl">
          <h1 data-testid="hero-title" className="heading-font text-6xl md:text-8xl lg:text-[10rem] tracking-tighter text-[#F4F1EA] mb-8">
            ARAR Perfume
          </h1>
          <p data-testid="hero-tagline" className="body-font text-base md:text-lg font-light text-[#BFA46D]/80 mb-6 tracking-wide">
            Identity, Distilled.
          </p>
          <p data-testid="hero-subtitle" className="body-font text-sm md:text-base font-light text-[#F4F1EA]/50 mb-16 max-w-2xl mx-auto leading-loose">
            A presence you do not announce. A memory that remains.
          </p>
          <a
            href="#philosophy"
            data-testid="hero-cta"
            className="inline-block bg-transparent text-[#F4F1EA] border border-[#BFA46D]/20 px-10 py-5 hover:border-[#BFA46D]/60 hover:bg-[#BFA46D]/5 transition-all duration-700 uppercase tracking-[0.3em] text-[10px] font-light"
          >
            Discover the House
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* Philosophy Section - Increased spacing */}
      <section id="philosophy" data-testid="philosophy-section" className="py-32 md:py-52 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 data-testid="philosophy-title" className="heading-font text-4xl md:text-6xl tracking-tight text-[#F4F1EA] mb-12">
            The Invisible Architecture
          </h2>
          <div className="body-font text-sm md:text-base font-light text-[#F4F1EA]/70 leading-loose max-w-3xl mx-auto space-y-8">
            <p data-testid="philosophy-text-1">
              ARAR exists in the space between scent and memory, between presence and absence. We do not create fragrances to be worn—we distill identities to be inhabited.
            </p>
            <p data-testid="philosophy-text-2">
              Each composition is an architecture of the invisible: notes that build upon one another not to announce, but to resonate. Our work is quiet by design, confident in restraint, aristocratic in its refusal to seduce loudly.
            </p>
            <p data-testid="philosophy-text-3">
              This is perfumery as it was meant to be—deliberate, patient, and unapologetically rare.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* Collection Preview - Editorial Gallery (Limited to 3) */}
      <section data-testid="collection-section" className="py-32 md:py-52 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1600px] mx-auto">
          <h2 data-testid="collection-title" className="heading-font text-4xl md:text-6xl tracking-tight text-[#F4F1EA] mb-24 text-center">
            The Collection
          </h2>

          {/* Editorial asymmetric grid */}
          {fragrances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {fragrances.map((fragrance, index) => (
                <Link
                  key={fragrance.id}
                  to={`/fragrance/${fragrance.slug}`}
                  data-testid={`fragrance-card-${fragrance.slug}`}
                  className="group relative overflow-hidden"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    marginTop: index % 2 === 0 ? '0' : '4rem'
                  }}
                >
                  {/* Abstract bottle placeholder */}
                  <div className="aspect-[3/4] overflow-hidden bg-gradient-to-b from-[#0F0E0D] to-[#1a1918] border border-[#BFA46D]/5 mb-8 flex items-center justify-center group-hover:border-[#BFA46D]/15 transition-all duration-700">
                    <BottleSilhouette />
                  </div>

                  <div className="px-2">
                    <h3 data-testid={`fragrance-name-${fragrance.slug}`} className="heading-font text-2xl md:text-3xl text-[#F4F1EA] mb-4 tracking-tight">
                      {fragrance.name}
                    </h3>
                    <p data-testid={`fragrance-description-${fragrance.slug}`} className="body-font text-xs md:text-sm font-light text-[#F4F1EA]/50 mb-6 leading-relaxed">
                      {fragrance.short_description || fragrance.description}
                    </p>
                    {/* Refined price hierarchy - smaller and muted */}
                    <p data-testid={`fragrance-price-${fragrance.slug}`} className="body-font text-[11px] tracking-[0.2em] uppercase text-[#BFA46D]/60 mb-6">
                      {fragrance.price}
                    </p>
                    <span data-testid={`fragrance-explore-${fragrance.slug}`} className="body-font text-[10px] tracking-[0.3em] uppercase text-[#F4F1EA]/40 group-hover:text-[#F4F1EA]/70 group-hover:tracking-[0.35em] transition-all duration-700">
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <p className="body-font text-sm font-light text-[#F4F1EA]/30 tracking-[0.2em] uppercase">
                The collection is currently resting.
              </p>
            </div>
          )}

          {/* View all link */}
          <div className="text-center mt-20">
            <Link
              to="/"
              className="body-font text-[10px] tracking-[0.3em] uppercase text-[#BFA46D]/60 hover:text-[#BFA46D] transition-all duration-700"
            >
              View Complete Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* Craft & Rarity - Increased spacing */}
      <section data-testid="craft-section" className="py-32 md:py-52 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1709294993903-f6d8ef544e55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxwZXJmdW1lciUyMGJsZW5kaW5nJTIwaW5ncmVkaWVudHMlMjBkYXJrJTIwbGFib3JhdG9yeSUyMGNpbmVtYXRpYyUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3NzE0NTUwMzJ8MA&ixlib=rb-4.1.0&q=85"
              alt="Craft and Rarity"
              className="w-full h-[650px] object-cover brightness-[0.7] contrast-[1.15] grayscale-[0.3]"
            />
          </div>
          <div>
            <h2 data-testid="craft-title" className="heading-font text-4xl md:text-6xl tracking-tight text-[#F4F1EA] mb-10">
              Craft & Rarity
            </h2>
            <div className="body-font text-sm md:text-base font-light text-[#F4F1EA]/70 leading-loose space-y-8">
              <p data-testid="craft-text-1">
                Each ARAR fragrance is produced in small, numbered batches. We do not manufacture to meet demand—we create what can be created properly, and no more.
              </p>
              <p data-testid="craft-text-2">
                Our ingredients are sourced from single estates and aged in our atelier. Oud from Assam. Rose from Grasse. Frankincense from Dhofar. Every element is traceable, every choice intentional.
              </p>
              <p data-testid="craft-text-3">
                Maturation periods range from 18 to 36 months. We do not rush what time perfects.
              </p>
              <div className="pt-10">
                <span className="body-font text-[10px] tracking-[0.25em] uppercase text-[#BFA46D]/50">
                  Crafted in limited presence. Produced in numbered batches.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* Newsletter Section - Refined */}
      <section data-testid="newsletter-section" className="py-32 md:py-48 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 data-testid="newsletter-title" className="heading-font text-4xl md:text-5xl tracking-tight text-[#F4F1EA] mb-8">
            Join the ARAR Atelier
          </h2>
          <p data-testid="newsletter-subtitle" className="body-font text-sm font-light text-[#F4F1EA]/50 mb-16 leading-loose">
            Occasional dispatches from the House. No urgency. No excess.
          </p>
          <form onSubmit={handleNewsletterSubmit} data-testid="newsletter-form" className="max-w-[500px] mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                data-testid="newsletter-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="flex-1 bg-transparent border-b border-white/10 px-0 py-5 text-[#F4F1EA] text-sm placeholder:text-white/15 focus:outline-none focus:border-[#BFA46D]/40 transition-all duration-700 body-font font-light"
              />
              <button
                type="submit"
                data-testid="newsletter-submit-button"
                disabled={loading}
                className="bg-transparent text-[#F4F1EA] border border-[#BFA46D]/20 px-8 py-5 hover:border-[#BFA46D]/50 hover:bg-[#BFA46D]/5 transition-all duration-700 uppercase tracking-[0.3em] text-[10px] font-light disabled:opacity-30"
              >
                {loading ? 'Submitting' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
