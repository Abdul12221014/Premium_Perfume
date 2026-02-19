import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Package, Layers, ShoppingBag, Settings, LogOut, Home } from "lucide-react";

const AdminLayout = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin", icon: Home, label: "Dashboard", exact: true },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/collections", icon: Layers, label: "Collections" },
    { path: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <div className="text-[#e8e8e8] text-lg tracking-[0.3em] font-light">
            ARAR
          </div>
          <div className="text-[#5a5a5a] text-[10px] tracking-[0.2em] uppercase mt-1">
            Control Panel
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-[#1a1a1a] text-[#d4c5a0]"
                    : "text-[#6a6a6a] hover:text-[#9a9a9a] hover:bg-[#141414]"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.5} />
              <span className="tracking-wider">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="px-4 py-3 mb-2">
            <div className="text-[#7a7a7a] text-xs truncate">
              {admin?.email}
            </div>
            <div className="text-[#4a4a4a] text-[10px] tracking-wider uppercase mt-1">
              {admin?.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded text-sm text-[#6a6a6a] hover:text-[#9a9a9a] hover:bg-[#141414] transition-all duration-300"
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span className="tracking-wider">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
