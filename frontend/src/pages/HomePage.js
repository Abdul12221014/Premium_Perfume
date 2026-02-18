import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      setFragrances(response.data);
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
      {/* Hero Section */}
      <section 
        data-testid="hero-section"
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 14, 13, 0.4), rgba(15, 14, 13, 0.7)), url('https://images.unsplash.com/photo-1586343785368-997d31ba8099?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxkYXJrJTIwdGV4dHVyZSUyMHdvb2QlMjBzaWxrJTIwc3RvbmUlMjBsdXh1cnklMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNDU1MDMxfDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="text-center px-6 animate-fade-in">
          <h1 data-testid="hero-title" className="heading-font text-5xl md:text-7xl lg:text-9xl tracking-tight text-[#F4F1EA] mb-6">
            ARAR Parfums
          </h1>
          <p data-testid="hero-tagline" className="body-font text-lg md:text-xl font-light text-[#BFA46D] mb-4">
            Identity, Distilled.
          </p>
          <p data-testid="hero-subtitle" className="body-font text-base font-light text-[#F4F1EA]/60 mb-12 max-w-2xl mx-auto leading-loose">
            A presence you do not announce. A memory that remains.
          </p>
          <a 
            href="#philosophy"
            data-testid="hero-cta"
            className="inline-block bg-transparent text-[#F4F1EA] border border-[#BFA46D]/40 px-8 py-4 hover:bg-[#BFA46D] hover:text-[#0F0E0D] transition-colors duration-700 uppercase tracking-widest text-xs font-medium"
          >
            Discover the House
          </a>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" data-testid="philosophy-section" className="py-24 md:py-40 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 data-testid="philosophy-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-8">
            The Invisible Architecture
          </h2>
          <div className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose max-w-3xl mx-auto space-y-6">
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

      {/* Collection Preview */}
      <section data-testid="collection-section" className="py-24 md:py-40 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1800px] mx-auto">
          <h2 data-testid="collection-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-16 text-center">
            The Collection
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fragrances.map((fragrance, index) => (
              <Link
                key={fragrance.id}
                to={`/fragrance/${fragrance.slug}`}
                data-testid={`fragrance-card-${fragrance.slug}`}
                className="group relative border border-white/5 hover:border-[#BFA46D]/30 transition-colors duration-700 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={fragrance.image_url}
                    alt={fragrance.name}
                    className="w-full h-full object-cover brightness-[0.8] contrast-[1.1] grayscale-[0.2] group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <h3 data-testid={`fragrance-name-${fragrance.slug}`} className="heading-font text-2xl text-[#F4F1EA] mb-3">
                    {fragrance.name}
                  </h3>
                  <p data-testid={`fragrance-description-${fragrance.slug}`} className="body-font text-sm font-light text-[#F4F1EA]/60 mb-4 leading-relaxed">
                    {fragrance.description}
                  </p>
                  <p data-testid={`fragrance-price-${fragrance.slug}`} className="body-font text-xs tracking-widest uppercase text-[#BFA46D] mb-4">
                    {fragrance.price}
                  </p>
                  <span data-testid={`fragrance-explore-${fragrance.slug}`} className="body-font text-xs tracking-widest uppercase text-[#F4F1EA]/70 group-hover:text-[#F4F1EA] transition-colors duration-500">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Craft & Rarity */}
      <section data-testid="craft-section" className="py-24 md:py-40 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1709294993903-f6d8ef544e55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwyfHxwZXJmdW1lciUyMGJsZW5kaW5nJTIwaW5ncmVkaWVudHMlMjBkYXJrJTIwbGFib3JhdG9yeSUyMGNpbmVtYXRpYyUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3NzE0NTUwMzJ8MA&ixlib=rb-4.1.0&q=85"
              alt="Craft and Rarity"
              className="w-full h-[600px] object-cover brightness-[0.8] contrast-[1.1]"
            />
          </div>
          <div>
            <h2 data-testid="craft-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-8">
              Craft & Rarity
            </h2>
            <div className="body-font text-base font-light text-[#F4F1EA]/80 leading-loose space-y-6">
              <p data-testid="craft-text-1">
                Each ARAR fragrance is produced in small, numbered batches. We do not manufacture to meet demand—we create what can be created properly, and no more.
              </p>
              <p data-testid="craft-text-2">
                Our ingredients are sourced from single estates and aged in our atelier. Oud from Assam. Rose from Grasse. Frankincense from Dhofar. Every element is traceable, every choice intentional.
              </p>
              <p data-testid="craft-text-3">
                Maturation periods range from 18 to 36 months. We do not rush what time perfects.
              </p>
              <div className="pt-8">
                <span className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D]">
                  Crafted in limited presence. Produced in numbered batches.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section data-testid="newsletter-section" className="py-24 md:py-40 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 data-testid="newsletter-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-6">
            Join the ARAR Atelier
          </h2>
          <p data-testid="newsletter-subtitle" className="body-font text-base font-light text-[#F4F1EA]/60 mb-12 leading-loose">
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
                className="flex-1 bg-transparent border-b border-white/20 px-0 py-4 text-[#F4F1EA] placeholder:text-white/20 focus:outline-none focus:border-[#BFA46D] transition-colors duration-700 body-font font-light"
              />
              <button
                type="submit"
                data-testid="newsletter-submit-button"
                disabled={loading}
                className="bg-transparent text-[#F4F1EA] border border-[#BFA46D]/40 px-8 py-4 hover:bg-[#BFA46D] hover:text-[#0F0E0D] transition-colors duration-700 uppercase tracking-widest text-xs font-medium disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
