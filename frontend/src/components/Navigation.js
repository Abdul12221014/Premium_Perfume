import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/the-house", label: "The House" },
    { path: "/atelier", label: "Atelier" },
    { path: "/journal", label: "Journal" },
    { path: "/contact", label: "Contact" }
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
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
            onClick={handleLinkClick}
            className="heading-font text-2xl md:text-3xl tracking-tight text-[#F4F1EA] hover:text-[#BFA46D] transition-colors duration-500"
            aria-label="ARAR Parfums Home"
          >
            ARAR
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 md:gap-12">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                className={`body-font text-xs tracking-widest uppercase transition-colors duration-500 ${
                  isActive(link.path) ? 'text-[#BFA46D]' : 'text-[#F4F1EA]/70 hover:text-[#F4F1EA]'
                }`}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#F4F1EA] hover:text-[#BFA46D] transition-colors duration-500 p-2"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        data-testid="mobile-menu"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-700 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="absolute inset-0 bg-[#0F0E0D]/95 backdrop-blur-lg"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`relative h-full flex flex-col items-center justify-center transition-transform duration-700 ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-4'
        }`}>
          <nav className="flex flex-col items-center gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                onClick={handleLinkClick}
                className={`body-font text-lg tracking-widest uppercase transition-all duration-500 ${
                  isActive(link.path) ? 'text-[#BFA46D]' : 'text-[#F4F1EA]/70 hover:text-[#F4F1EA]'
                }`}
                style={{
                  transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navigation;
