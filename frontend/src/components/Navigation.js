import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export const Navigation = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      data-testid="main-navigation"
      className={`fixed top-0 w-full z-50 py-6 px-6 md:px-12 transition-all duration-700 ${
        scrolled ? 'bg-[#0F0E0D]/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1800px] mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          data-testid="nav-logo"
          className="heading-font text-2xl md:text-3xl tracking-tight text-[#F4F1EA] hover:text-[#BFA46D] transition-colors duration-500"
        >
          ARAR
        </Link>
        
        <div className="flex items-center gap-8 md:gap-12">
          <Link
            to="/the-house"
            data-testid="nav-the-house"
            className={`body-font text-xs tracking-widest uppercase transition-colors duration-500 ${
              isActive('/the-house') ? 'text-[#BFA46D]' : 'text-[#F4F1EA]/70 hover:text-[#F4F1EA]'
            }`}
          >
            The House
          </Link>
          <Link
            to="/atelier"
            data-testid="nav-atelier"
            className={`body-font text-xs tracking-widest uppercase transition-colors duration-500 ${
              isActive('/atelier') ? 'text-[#BFA46D]' : 'text-[#F4F1EA]/70 hover:text-[#F4F1EA]'
            }`}
          >
            Atelier
          </Link>
          <Link
            to="/contact"
            data-testid="nav-contact"
            className={`body-font text-xs tracking-widest uppercase transition-colors duration-500 ${
              isActive('/contact') ? 'text-[#BFA46D]' : 'text-[#F4F1EA]/70 hover:text-[#F4F1EA]'
            }`}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
