import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Package, ShoppingBag, Layers, AlertTriangle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { getAuthHeaders } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    collections: 0,
    lowStock: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = getAuthHeaders();
      const [productsRes, ordersRes, collectionsRes] = await Promise.all([
        axios.get(`${API}/admin/products`, { headers }),
        axios.get(`${API}/admin/orders`, { headers }),
        axios.get(`${API}/admin/collections`, { headers })
      ]);

      const products = productsRes.data;
      const lowStock = products.filter(p => p.stock_quantity < 5 && p.status === "published");

      setStats({
        products: products.length,
        orders: ordersRes.data.length,
        collections: collectionsRes.data.length,
        lowStock
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#5a5a5a] text-sm tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-[#e8e8e8] text-2xl tracking-[0.15em] font-light mb-2">
          Dashboard
        </h1>
        <p className="text-[#5a5a5a] text-sm">
          System overview and inventory status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <Package size={20} className="text-[#4a4a4a]" strokeWidth={1.5} />
            <span className="text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase">
              Products
            </span>
          </div>
          <div className="text-[#e8e8e8] text-3xl font-light">
            {stats.products}
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag size={20} className="text-[#4a4a4a]" strokeWidth={1.5} />
            <span className="text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase">
              Orders
            </span>
          </div>
          <div className="text-[#e8e8e8] text-3xl font-light">
            {stats.orders}
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <Layers size={20} className="text-[#4a4a4a]" strokeWidth={1.5} />
            <span className="text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase">
              Collections
            </span>
          </div>
          <div className="text-[#e8e8e8] text-3xl font-light">
            {stats.collections}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStock.length > 0 && (
        <div className="bg-[#151210] border border-[#2a2018] p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={18} className="text-[#c9a86c]" strokeWidth={1.5} />
            <h2 className="text-[#c9a86c] text-sm tracking-[0.1em] uppercase">
              Low Inventory Alert
            </h2>
          </div>
          <div className="space-y-3">
            {stats.lowStock.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 border-b border-[#2a2018] last:border-0"
              >
                <span className="text-[#9a9a9a] text-sm">{product.name}</span>
                <span className="text-[#c9a86c] text-sm">
                  {product.stock_quantity} units remaining
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6">
        <h3 className="text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-4">
          System Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#5a5a5a]">Environment</span>
            <span className="text-[#7a7a7a]">Production</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5a5a5a]">API Version</span>
            <span className="text-[#7a7a7a]">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5a5a5a]">Last Updated</span>
            <span className="text-[#7a7a7a]">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
