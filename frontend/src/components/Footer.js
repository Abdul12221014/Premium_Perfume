import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer data-testid="main-footer" className="bg-[#050505] border-t border-[#BFA46D]/10 py-16 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div>
            <h3 className="heading-font text-2xl mb-4 text-[#F4F1EA]">ARAR</h3>
            <p className="body-font text-xs text-[#F4F1EA]/60 leading-loose">
              Pronounced ah-RAHR<br />
              Identity, Distilled.
            </p>
          </div>
          
          <div>
            <h4 className="body-font text-xs tracking-widest uppercase mb-4 text-[#BFA46D]">Discover</h4>
            <div className="flex flex-col gap-3">
              <Link to="/the-house" data-testid="footer-the-house" className="body-font text-xs text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors duration-500">
                The House
              </Link>
              <Link to="/atelier" data-testid="footer-atelier" className="body-font text-xs text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors duration-500">
                Atelier
              </Link>
              <Link to="/journal" data-testid="footer-journal" className="body-font text-xs text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors duration-500">
                Journal
              </Link>
              <Link to="/" data-testid="footer-collections" className="body-font text-xs text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors duration-500">
                Collections
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="body-font text-xs tracking-widest uppercase mb-4 text-[#BFA46D]">Connect</h4>
            <div className="flex flex-col gap-3">
              <Link to="/contact" data-testid="footer-contact" className="body-font text-xs text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors duration-500">
                Contact
              </Link>
              <a href="mailto:atelier@arar-parfums.com" data-testid="footer-email" className="body-font text-xs text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors duration-500">
                atelier@arar-parfums.com
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="body-font text-xs tracking-widest uppercase mb-4 text-[#BFA46D]">Follow</h4>
            <div className="flex gap-4">
              <a href="#" data-testid="footer-instagram" className="body-font text-xs text-[#F4F1EA]/60 hover:text-[#F4F1EA] transition-colors duration-500">
                Instagram
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#BFA46D]/10">
          <p className="body-font text-xs text-[#F4F1EA]/40 text-center">
            © 2024 ARAR Parfums. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
