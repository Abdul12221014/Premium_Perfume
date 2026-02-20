import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
    Package,
    Plus,
    Search,
    MoreVertical,
    Eye,
    Edit3,
    Trash2,
    CheckCircle2,
    Circle,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import FragranceEditor from "@/components/admin/FragranceEditor";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProductsPage = () => {
    const { getAuthHeaders } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingFragrance, setEditingFragrance] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${API}/admin/products`, { headers });
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load catalog");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (productId, currentStatus) => {
        const newStatus = currentStatus === "published" ? "draft" : "published";
        try {
            const headers = getAuthHeaders();
            await axios.patch(`${API}/admin/products/${productId}/status`, { status: newStatus }, { headers });

            setProducts(products.map(p =>
                p.id === productId ? { ...p, status: newStatus } : p
            ));

            toast.success(`Product ${newStatus === "published" ? "published" : "moved to drafts"}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const deleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this fragrance? This action cannot be undone.")) return;

        try {
            const headers = getAuthHeaders();
            await axios.delete(`${API}/admin/products/${productId}`, { headers });
            setProducts(products.filter(p => p.id !== productId));
            toast.success("Fragrance removed from collection");
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || product.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#5a5a5a] text-sm tracking-widest uppercase animate-pulse">
                    Retrieving Collection...
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-[#e8e8e8] text-2xl tracking-[0.15em] font-light mb-2">
                        Fragrance Catalog
                    </h1>
                    <p className="text-[#5a5a5a] text-sm italic">
                        Management of the house's signature scents
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingFragrance(null);
                        setIsEditorOpen(true);
                    }}
                    className="flex items-center gap-2 bg-[#d4c5a0] text-[#0a0a0a] px-6 py-3 rounded-sm text-xs tracking-widest uppercase hover:bg-[#e5d5b0] transition-colors"
                >
                    <Plus size={16} />
                    Add New Scent
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4a4a]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0d0d0d] border border-[#1a1a1a] pl-12 pr-4 py-3 text-sm text-[#9a9a9a] focus:outline-none focus:border-[#d4c5a0]/30 transition-colors"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-3 text-sm text-[#9a9a9a] focus:outline-none focus:border-[#d4c5a0]/30 transition-colors min-w-[150px]"
                >
                    <option value="all">All States</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Product List */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[#1a1a1a] bg-[#111111]">
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Product</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Status</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Stock</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium">Price</th>
                            <th className="px-6 py-4 text-[#4a4a4a] text-[10px] tracking-[0.2em] uppercase font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-[#141414] transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center border border-[#d4c5a0]/5 group-hover:border-[#d4c5a0]/20 transition-colors">
                                            <Package size={20} className="text-[#3a3a3a]" />
                                        </div>
                                        <div>
                                            <div className="text-[#e8e8e8] text-sm font-light mb-1">{product.name}</div>
                                            <div className="text-[#4a4a4a] text-[10px] tracking-wider uppercase">{product.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <button
                                        onClick={() => toggleStatus(product.id, product.status)}
                                        className={`flex items-center gap-2 text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-all duration-500 $ {
                      product.status === "published" 
                        ? "border-[#d4c5a0]/20 text-[#d4c5a0] bg-[#d4c5a0]/5 hover:bg-[#d4c5a0]/10" 
                        : "border-[#3a3a3a] text-[#4a4a4a] hover:bg-[#1a1a1a]"
                    }`}
                                    >
                                        {product.status === "published" ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                        {product.status}
                                    </button>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm ${product.stock_quantity < 5 ? 'text-red-400/70' : 'text-[#8a8a8a]'}`}>
                                            {product.stock_quantity}
                                        </span>
                                        {product.stock_quantity < 5 && <AlertCircle size={14} className="text-red-400/50" />}
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-sm text-[#8a8a8a]">
                                    {product.price}
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            to={`/fragrance/${product.slug}`}
                                            className="p-2 text-[#4a4a4a] hover:text-[#e8e8e8] hover:bg-[#1a1a1a] rounded transition-all"
                                            title="View Public Page"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setEditingFragrance(product);
                                                setIsEditorOpen(true);
                                            }}
                                            className="p-2 text-[#4a4a4a] hover:text-[#d4c5a0] hover:bg-[#1a1a1a] rounded transition-all"
                                            title="Edit Scent"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="p-2 text-[#4a4a4a] hover:text-red-400/70 hover:bg-[#1a1010] rounded transition-all"
                                            title="Delete Scent"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-[#4a4a4a] text-sm italic">No fragrances found matching your search</p>
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            <FragranceEditor
                isOpen={isEditorOpen}
                fragrance={editingFragrance}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingFragrance(null);
                }}
                onSave={() => {
                    setIsEditorOpen(false);
                    setEditingFragrance(null);
                    fetchProducts(); // Refresh the list
                }}
            />
        </div>
    );
};

export default AdminProductsPage;
