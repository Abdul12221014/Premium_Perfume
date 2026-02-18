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
      const response = await axios.post(`${API}/create-checkout-session`, {
        fragrance_slug: slug
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Unable to proceed with acquisition. Please try again.");
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
      {/* Product Hero */}
      <section data-testid="product-hero" className="px-6 md:px-12 pb-24">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="animate-fade-in">
            <img
              src={fragrance.image_url}
              alt={fragrance.name}
              data-testid="product-image"
              className="w-full h-[700px] object-cover brightness-[0.8] contrast-[1.1] grayscale-[0.2]"
            />
          </div>
          <div className="flex flex-col justify-center animate-fade-in">
            <h1 data-testid="product-name" className="heading-font text-4xl md:text-6xl tracking-tight text-[#F4F1EA] mb-6">
              {fragrance.name}
            </h1>
            <p data-testid="product-description" className="body-font text-lg md:text-xl font-light text-[#BFA46D] mb-8 leading-relaxed">
              {fragrance.description}
            </p>
            <p data-testid="product-price" className="body-font text-2xl text-[#F4F1EA] mb-8">
              {fragrance.price}
            </p>
            {fragrance.batch_number && (
              <p data-testid="product-batch" className="body-font text-xs tracking-[0.2em] uppercase text-[#F4F1EA]/40 mb-12">
                {fragrance.batch_number}
              </p>
            )}
            <button
              onClick={handleAcquire}
              disabled={checkoutLoading}
              data-testid="product-acquire-button"
              className="inline-block w-fit bg-transparent text-[#F4F1EA] border border-[#BFA46D]/40 px-8 py-4 hover:bg-[#BFA46D] hover:text-[#0F0E0D] transition-colors duration-700 uppercase tracking-widest text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={checkoutLoading ? "Processing acquisition" : "Acquire fragrance"}
            >
              {checkoutLoading ? 'Processing...' : 'Acquire'}
            </button>
          </div>
        </div>
      </section>

      {/* The Identity */}
      <section data-testid="product-identity" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="identity-title" className="heading-font text-3xl md:text-4xl tracking-tight text-[#F4F1EA] mb-8">
            The Identity
          </h2>
          <p data-testid="identity-text" className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose max-w-3xl">
            {fragrance.identity}
          </p>
        </div>
      </section>

      {/* Olfactory Architecture */}
      <section data-testid="product-notes" className="py-24 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="notes-title" className="heading-font text-3xl md:text-4xl tracking-tight text-[#F4F1EA] mb-16">
            Olfactory Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div data-testid="notes-top">
              <h3 className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4">
                Top Notes
              </h3>
              <ul className="body-font text-base font-light text-[#F4F1EA]/80 space-y-2">
                {fragrance.notes_top.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
            <div data-testid="notes-heart">
              <h3 className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4">
                Heart Notes
              </h3>
              <ul className="body-font text-base font-light text-[#F4F1EA]/80 space-y-2">
                {fragrance.notes_heart.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
            <div data-testid="notes-base">
              <h3 className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4">
                Base Notes
              </h3>
              <ul className="body-font text-base font-light text-[#F4F1EA]/80 space-y-2">
                {fragrance.notes_base.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Ritual */}
      <section data-testid="product-ritual" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="ritual-title" className="heading-font text-3xl md:text-4xl tracking-tight text-[#F4F1EA] mb-8">
            The Ritual
          </h2>
          <p data-testid="ritual-text" className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose max-w-3xl">
            {fragrance.ritual}
          </p>
        </div>
      </section>

      {/* Craft */}
      <section data-testid="product-craft" className="py-24 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1200px] mx-auto">
          <h2 data-testid="craft-title" className="heading-font text-3xl md:text-4xl tracking-tight text-[#F4F1EA] mb-8">
            The Craft
          </h2>
          <p data-testid="craft-text" className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose max-w-3xl">
            {fragrance.craft}
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section data-testid="product-trust" className="py-16 px-6 md:px-12 bg-[#050505] border-t border-[#BFA46D]/10">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-center gap-16 text-center">
          <div>
            <p className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-2">
              Complimentary Shipping
            </p>
            <p className="body-font text-sm font-light text-[#F4F1EA]/60">
              Worldwide
            </p>
          </div>
          <div>
            <p className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-2">
              Secure Inquiry
            </p>
            <p className="body-font text-sm font-light text-[#F4F1EA]/60">
              Private & Confidential
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
