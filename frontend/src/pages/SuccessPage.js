import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderNumber] = useState(() => {
    return `ARAR-${Date.now().toString().slice(-8)}`;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="grain-overlay bg-[#0F0E0D] min-h-screen pt-32 flex items-center justify-center">
      <div className="max-w-[800px] mx-auto px-6 text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <CheckCircle 
            size={64} 
            strokeWidth={1} 
            className="text-[#BFA46D]"
            data-testid="success-icon"
          />
        </div>
        
        <h1 
          data-testid="success-title"
          className="heading-font text-4xl md:text-6xl tracking-tight text-[#F4F1EA] mb-6"
        >
          Acquisition Confirmed
        </h1>
        
        <p 
          data-testid="success-message"
          className="body-font text-base md:text-lg font-light text-[#F4F1EA]/80 leading-loose mb-8 max-w-2xl mx-auto"
        >
          Your fragrance is being prepared with care. You will receive confirmation details shortly via email.
        </p>

        {sessionId && (
          <p 
            data-testid="order-number"
            className="body-font text-xs tracking-[0.2em] uppercase text-[#BFA46D] mb-12"
          >
            Order Reference: {orderNumber}
          </p>
        )}

        <div className="space-y-4 flex flex-col items-center">
          <Link
            to="/"
            data-testid="return-home-button"
            className="inline-block bg-transparent text-[#F4F1EA] border border-[#BFA46D]/40 px-8 py-4 hover:bg-[#BFA46D] hover:text-[#0F0E0D] transition-colors duration-700 uppercase tracking-widest text-xs font-medium"
          >
            Return to the House
          </Link>
          
          <p className="body-font text-sm font-light text-[#F4F1EA]/40 mt-8">
            Questions? <Link to="/contact" className="text-[#BFA46D] hover:text-[#F4F1EA] transition-colors duration-500">Contact us</Link>
          </p>
        </div>

        <div className="mt-16 pt-16 border-t border-[#BFA46D]/10">
          <p className="body-font text-xs font-light text-[#F4F1EA]/60 leading-loose max-w-xl mx-auto">
            Each ARAR fragrance is produced in numbered batches. Your bottle will arrive with provenance documentation and care instructions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
