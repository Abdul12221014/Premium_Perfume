import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const [fragrance, setFragrance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchFragrance();
  }, [slug]);

  const fetchFragrance = async () => {
    try {
      const response = await axios.get(`${API}/fragrances/${slug}`);
      setFragrance(response.data);
    } catch (error) {
      console.error("Error fetching fragrance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcquire = async () => {
    if (checkoutLoading) return;
    
    setCheckoutLoading(true);
    try {
      // Send origin_url for dynamic success/cancel URL generation
      const response = await axios.post(`${API}/create-checkout-session`, {
        fragrance_slug: slug,
        origin_url: window.location.origin
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error.response?.data?.detail || "Unable to proceed with acquisition. Please try again.";
      toast.error(errorMessage);
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0E0D]">
        <p className="body-font text-[#F4F1EA]/60">Loading...</p>
      </div>
    );
  }

  if (!fragrance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E0D]">
        <p className="body-font text-[#F4F1EA]/60 mb-8">Fragrance not found</p>
        <Link to="/" className="body-font text-xs tracking-widest uppercase text-[#BFA46D] hover:text-[#F4F1EA] transition-colors duration-500">
          Return to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32">
      {/* Product Hero - Increased spacing */}
      <section data-testid="product-hero" className="px-6 md:px-12 pb-32 pt-12">
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28">
          <div className="animate-fade-in">
            {/* Abstract bottle placeholder */}
            <div className="w-full h-[750px] bg-gradient-to-b from-[#0F0E0D] to-[#1a1918] border border-[#BFA46D]/5 flex items-center justify-center">
              <svg viewBox="0 0 200 400" className="w-2/3 h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bottleDetailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(191, 164, 109, 0.1)" />
                    <stop offset="100%" stopColor="rgba(191, 164, 109, 0.03)" />
                  </linearGradient>
                </defs>
                <rect x="60" y="40" width="80" height="60" fill="url(#bottleDetailGradient)" opacity="0.4"/>
                <rect x="70" y="100" width="60" height="280" fill="url(#bottleDetailGradient)" opacity="0.5"/>
                <rect x="75" y="105" width="50" height="270" fill="rgba(244, 241, 234, 0.03)"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col justify-center animate-fade-in">
            <h1 data-testid="product-name" className="heading-font text-5xl md:text-7xl tracking-tight text-[#F4F1EA] mb-8">
              {fragrance.name}
            </h1>
            <p data-testid="product-description" className="body-font text-base md:text-lg font-light text-[#BFA46D]/70 mb-10 leading-relaxed">
              {fragrance.short_description || fragrance.description}
            </p>
            {/* Refined price - smaller, muted */}
            <p data-testid="product-price" className="body-font text-sm tracking-[0.2em] uppercase text-[#F4F1EA]/60 mb-4">
              {fragrance.price}
            </p>
            {fragrance.batch_number && (
              <p data-testid="product-batch" className="body-font text-[10px] tracking-[0.25em] uppercase text-[#F4F1EA]/30 mb-14">
                {fragrance.batch_number}
              </p>
            )}
            <button
              onClick={handleAcquire}
              disabled={checkoutLoading || fragrance.stock_quantity === 0}
              data-testid="product-acquire-button"
              className="inline-block w-fit bg-transparent text-[#F4F1EA] border border-[#BFA46D]/20 px-10 py-5 hover:border-[#BFA46D]/60 hover:bg-[#BFA46D]/5 transition-all duration-700 uppercase tracking-[0.3em] text-[10px] font-light disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={checkoutLoading ? "Processing acquisition" : fragrance.stock_quantity === 0 ? "Out of stock" : "Acquire fragrance"}
            >
              {checkoutLoading ? 'Processing' : fragrance.stock_quantity === 0 ? 'Currently Unavailable' : 'Acquire'}
            </button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* The Identity */}
      <section data-testid="product-identity" className="py-28 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1100px] mx-auto">
          <h2 data-testid="identity-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-10">
            The Identity
          </h2>
          <p data-testid="identity-text" className="body-font text-sm md:text-base font-light text-[#F4F1EA]/70 leading-loose max-w-3xl">
            {fragrance.identity}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* Olfactory Architecture */}
      <section data-testid="product-notes" className="py-28 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1100px] mx-auto">
          <h2 data-testid="notes-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-20">
            Olfactory Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div data-testid="notes-top">
              <h3 className="body-font text-[10px] tracking-[0.25em] uppercase text-[#BFA46D]/70 mb-6">
                Top Notes
              </h3>
              <ul className="body-font text-sm font-light text-[#F4F1EA]/70 space-y-3">
                {fragrance.notes_top.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
            <div data-testid="notes-heart">
              <h3 className="body-font text-[10px] tracking-[0.25em] uppercase text-[#BFA46D]/70 mb-6">
                Heart Notes
              </h3>
              <ul className="body-font text-sm font-light text-[#F4F1EA]/70 space-y-3">
                {fragrance.notes_heart.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
            <div data-testid="notes-base">
              <h3 className="body-font text-[10px] tracking-[0.25em] uppercase text-[#BFA46D]/70 mb-6">
                Base Notes
              </h3>
              <ul className="body-font text-sm font-light text-[#F4F1EA]/70 space-y-3">
                {fragrance.notes_base.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* The Ritual */}
      <section data-testid="product-ritual" className="py-28 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1100px] mx-auto">
          <h2 data-testid="ritual-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-10">
            The Ritual
          </h2>
          <p data-testid="ritual-text" className="body-font text-sm md:text-base font-light text-[#F4F1EA]/70 leading-loose max-w-3xl">
            {fragrance.ritual}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* Craft */}
      <section data-testid="product-craft" className="py-28 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1100px] mx-auto">
          <h2 data-testid="craft-title" className="heading-font text-3xl md:text-5xl tracking-tight text-[#F4F1EA] mb-10">
            The Craft
          </h2>
          <p data-testid="craft-text" className="body-font text-sm md:text-base font-light text-[#F4F1EA]/70 leading-loose max-w-3xl">
            {fragrance.craft}
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section data-testid="product-trust" className="py-20 px-6 md:px-12 bg-[#050505] border-t border-[#BFA46D]/5">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-center gap-20 text-center">
          <div>
            <p className="body-font text-[10px] tracking-[0.25em] uppercase text-[#BFA46D]/70 mb-3">
              Complimentary Shipping
            </p>
            <p className="body-font text-xs font-light text-[#F4F1EA]/50">
              Worldwide
            </p>
          </div>
          <div>
            <p className="body-font text-[10px] tracking-[0.25em] uppercase text-[#BFA46D]/70 mb-3">
              Secure Inquiry
            </p>
            <p className="body-font text-xs font-light text-[#F4F1EA]/50">
              Private & Confidential
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
