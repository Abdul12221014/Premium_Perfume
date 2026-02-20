import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
    ShoppingBag,
    Search,
    ExternalLink,
    Calendar,
    User,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    HelpCircle
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminOrdersPage = () => {
    const { getAuthHeaders } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${API}/admin/orders`, { headers });
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load order ledger");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
            case "paid":
                return <CheckCircle size={14} className="text-green-500/70" />;
            case "expired":
            case "cancelled":
                return <XCircle size={14} className="text-red-400/70" />;
            case "pending":
            case "initiated":
                return <Clock size={14} className="text-amber-400/70" />;
            default:
                return <HelpCircle size={14} className="text-[#4a4a4a]" />;
        }
    };

    const filteredOrders = orders.filter(order => {
        return (
            order.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#5a5a5a] text-sm tracking-widest uppercase animate-pulse">
                    Opening Ledger...
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-[#e8e8e8] text-2xl tracking-[0.15em] font-light mb-2">
                    Acquisition Ledger
                </h1>
                <p className="text-[#5a5a5a] text-sm italic">
                    Historical record of house acquisitions
                </p>
            </div>

            {/* Controls */}
            <div className="relative mb-8 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4a4a]" size={18} />
                <input
                    type="text"
                    placeholder="Search by session, product, or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] pl-12 pr-4 py-3 text-sm text-[#9a9a9a] focus:outline-none focus:border-[#d4c5a0]/30 transition-colors"
                />
            </div>

            {/* Order Ledger */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[#1a1a1a] bg-[#111111]">
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Acquisition ID</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Fragrance</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Date</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Value</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Status</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                        {filteredOrders.map((order) => (
                            <tr key={order.session_id} className="hover:bg-[#141414] transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-[#e8e8e8] text-xs font-mono tracking-tight mb-1 truncate max-w-[120px]">
                                            {order.session_id}
                                        </span>
                                        <span className="text-[#4a4a4a] text-[9px] tracking-wider uppercase">Stripe Session</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#1a1a1a] flex items-center justify-center border border-[#d4c5a0]/5">
                                            <ShoppingBag size={14} className="text-[#3a3a3a]" />
                                        </div>
                                        <div>
                                            <div className="text-[#8a8a8a] text-sm font-light leading-tight">{order.product_name || order.product_slug}</div>
                                            <div className="text-[#4a4a4a] text-[9px] tracking-wider uppercase">Signature Scent</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2 text-[#7a7a7a] text-xs">
                                        <Calendar size={12} strokeWidth={1.5} />
                                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Historical"}
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-light text-[#8a8a8a] text-sm">
                                    ${order.amount?.toFixed(2) || "0.00"}
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(order.status || order.payment_status)}
                                        <span className="text-[10px] tracking-widest uppercase text-[#7a7a7a]">
                                            {order.status || order.payment_status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button
                                        className="p-2 text-[#4a4a4a] hover:text-[#d4c5a0] hover:bg-[#1a1a1a] rounded transition-all"
                                        title="View Transaction Details"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-[#4a4a4a] text-sm italic">No house acquisitions found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersPage;
