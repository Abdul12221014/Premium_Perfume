import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success("Your inquiry has been received. We will respond within 48 hours.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32">
      {/* Hero */}
      <section data-testid="contact-hero" className="px-6 md:px-12 pb-24">
        <div className="max-w-[1200px] mx-auto text-center animate-fade-in">
          <h1 data-testid="contact-title" className="heading-font text-5xl md:text-7xl tracking-tight text-[#F4F1EA] mb-8">
            Contact
          </h1>
          <p data-testid="contact-subtitle" className="body-font text-base md:text-lg font-light text-[#F4F1EA]/60 leading-loose max-w-2xl mx-auto">
            For inquiries regarding acquisitions, private sessions, or general correspondence, please reach out below. We respond to all messages within 48 hours.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section data-testid="contact-form-section" className="py-24 px-6 md:px-12 bg-[#050505]">
        <div className="max-w-[800px] mx-auto">
          <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-8">
            <div>
              <label htmlFor="name" className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4 block">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                data-testid="contact-name-input"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-[#F4F1EA] placeholder:text-white/20 focus:outline-none focus:border-[#BFA46D] transition-colors duration-700 body-font font-light"
              />
            </div>

            <div>
              <label htmlFor="email" className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4 block">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                data-testid="contact-email-input"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-[#F4F1EA] placeholder:text-white/20 focus:outline-none focus:border-[#BFA46D] transition-colors duration-700 body-font font-light"
              />
            </div>

            <div>
              <label htmlFor="message" className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4 block">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                data-testid="contact-message-input"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-transparent border-b border-white/20 px-0 py-4 text-[#F4F1EA] placeholder:text-white/20 focus:outline-none focus:border-[#BFA46D] transition-colors duration-700 body-font font-light resize-none"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                data-testid="contact-submit-button"
                disabled={loading}
                className="w-full md:w-auto bg-transparent text-[#F4F1EA] border border-[#BFA46D]/40 px-8 py-4 hover:bg-[#BFA46D] hover:text-[#0F0E0D] transition-colors duration-700 uppercase tracking-widest text-xs font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Additional Contact Info */}
      <section data-testid="contact-info" className="py-24 px-6 md:px-12 bg-[#0F0E0D]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 text-center md:text-left">
          <div>
            <h3 className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4">
              Email
            </h3>
            <a href="mailto:atelier@arar-parfums.com" className="body-font text-base text-[#F4F1EA]/80 hover:text-[#F4F1EA] transition-colors duration-500">
              atelier@arar-parfums.com
            </a>
          </div>
          <div>
            <h3 className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-4">
              Response Time
            </h3>
            <p className="body-font text-base text-[#F4F1EA]/80">
              Within 48 hours
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
