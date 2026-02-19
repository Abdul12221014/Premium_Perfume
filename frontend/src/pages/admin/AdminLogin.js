import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Access granted");
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.detail || "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-[#e8e8e8] text-2xl tracking-[0.4em] font-light mb-2">
            ARAR
          </div>
          <div className="text-[#5a5a5a] text-[10px] tracking-[0.25em] uppercase">
            Administrative Access
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-[#1a1010] border border-[#3a1a1a] text-[#c88] text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="admin-login-email"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-3 text-[#c8c8c8] text-sm focus:outline-none focus:border-[#3a3a3a] transition-colors"
                placeholder="admin@arar-perfume.com"
              />
            </div>

            <div>
              <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="admin-login-password"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] px-4 py-3 text-[#c8c8c8] text-sm focus:outline-none focus:border-[#3a3a3a] transition-colors"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit"
              className="w-full bg-[#1a1a1a] text-[#9a9a9a] py-4 text-xs tracking-[0.2em] uppercase hover:bg-[#242424] hover:text-[#c8c8c8] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Access System"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-[#4a4a4a] text-[10px] tracking-[0.15em] uppercase hover:text-[#6a6a6a] transition-colors"
          >
            Return to Public Site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
