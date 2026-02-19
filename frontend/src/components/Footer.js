import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer data-testid="main-footer" className="bg-[#050505] border-t border-[#BFA46D]/5">
      {/* Top divider */}
      <div className="luxury-divider" />
      
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12 mb-16">
          <div>
            <h3 className="heading-font text-3xl mb-6 text-[#F4F1EA] tracking-tight">ARAR</h3>
            <p className="body-font text-[10px] text-[#F4F1EA]/40 leading-loose tracking-wider mb-4">
              Pronounced ah-RAHR
            </p>
            <p className="body-font text-xs text-[#F4F1EA]/50 leading-relaxed italic">
              Identity, Distilled.
            </p>
            <p className="body-font text-[9px] text-[#F4F1EA]/30 mt-8 tracking-[0.2em] uppercase">
              Established 2024
            </p>
          </div>
          
          <div>
            <h4 className="body-font text-[10px] tracking-[0.25em] uppercase mb-6 text-[#BFA46D]/80">Discover</h4>
            <div className="flex flex-col gap-4">
              <Link to="/the-house" data-testid="footer-the-house" className="body-font text-xs text-[#F4F1EA]/50 hover:text-[#F4F1EA]/80 transition-all duration-700 hover:translate-x-1">
                The House
              </Link>
              <Link to="/atelier" data-testid="footer-atelier" className="body-font text-xs text-[#F4F1EA]/50 hover:text-[#F4F1EA]/80 transition-all duration-700 hover:translate-x-1">
                Atelier
              </Link>
              <Link to="/journal" data-testid="footer-journal" className="body-font text-xs text-[#F4F1EA]/50 hover:text-[#F4F1EA]/80 transition-all duration-700 hover:translate-x-1">
                Journal
              </Link>
              <Link to="/" data-testid="footer-collections" className="body-font text-xs text-[#F4F1EA]/50 hover:text-[#F4F1EA]/80 transition-all duration-700 hover:translate-x-1">
                Collections
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="body-font text-[10px] tracking-[0.25em] uppercase mb-6 text-[#BFA46D]/80">Connect</h4>
            <div className="flex flex-col gap-4">
              <Link to="/contact" data-testid="footer-contact" className="body-font text-xs text-[#F4F1EA]/50 hover:text-[#F4F1EA]/80 transition-all duration-700 hover:translate-x-1">
                Contact
              </Link>
              <a href="mailto:atelier@arar-parfums.com" data-testid="footer-email" className="body-font text-xs text-[#F4F1EA]/50 hover:text-[#F4F1EA]/80 transition-all duration-700 hover:translate-x-1">
                atelier@arar-parfums.com
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="body-font text-[10px] tracking-[0.25em] uppercase mb-6 text-[#BFA46D]/80">Follow</h4>
            <div className="flex gap-6">
              <a href="#" data-testid="footer-instagram" className="body-font text-xs text-[#F4F1EA]/50 hover:text-[#F4F1EA]/80 transition-all duration-700">
                Instagram
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-[#BFA46D]/5">
          <p className="body-font text-[10px] text-[#F4F1EA]/30 text-center tracking-wider">
            © 2024 ARAR Parfums. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
