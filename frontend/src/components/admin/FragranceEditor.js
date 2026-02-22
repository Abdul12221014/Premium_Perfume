import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { X, Plus, Trash2, Save, Upload, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FragranceEditor = ({ fragrance, isOpen, onClose, onSave }) => {
    const { getAuthHeaders } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize form state
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        short_description: "",
        long_description: "",
        price: "",
        price_amount: 0,
        stock_quantity: 0,
        is_limited: false,
        batch_number: "",
        status: "draft",
        hero_image_url: "",
        gallery_images: [],
        notes_top: [],
        notes_heart: [],
        notes_base: [],
        identity: "",
        ritual: "",
        craft: ""
    });

    // Populate data when editing
    useEffect(() => {
        if (fragrance && isOpen) {
            setFormData({
                ...fragrance,
                gallery_images: fragrance.gallery_images || [],
                notes_top: fragrance.notes_top || [],
                notes_heart: fragrance.notes_heart || [],
                notes_base: fragrance.notes_base || []
            });
        } else if (isOpen) {
            // Reset for new creation
            setFormData({
                name: "", slug: "", short_description: "", long_description: "",
                price: "", price_amount: 0, stock_quantity: 0, is_limited: false,
                batch_number: "", status: "draft", hero_image_url: "",
                gallery_images: [], notes_top: [], notes_heart: [], notes_base: [],
                identity: "", ritual: "", craft: ""
            });
        }
    }, [fragrance, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
        }));
    };

    const generateSlug = () => {
        if (formData.name) {
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleArrayChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
    };

    const removeArrayItem = (field, index) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const onDrop = async (acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
            toast.error("File rejected. Must be an image under 3MB.");
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Get Signature from Backend
            const headers = getAuthHeaders();
            const sigRes = await axios.get(`${API}/media/upload-signature`, { headers });
            const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;

            // 2. Upload directly to Cloudinary
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("api_key", api_key);
            uploadData.append("timestamp", timestamp);
            uploadData.append("signature", signature);
            uploadData.append("folder", folder);

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                uploadData
            );

            // 3. Save secure URL
            setFormData(prev => ({ ...prev, hero_image_url: uploadRes.data.secure_url }));
            toast.success("Asset uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            if (error.response?.data?.detail) {
                toast.error(`Upload Failed: ${error.response.data.detail}`);
            } else {
                toast.error("Cloudinary upload failed. Check keys.");
            }
        } finally {
            setIsUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 1,
        maxSize: 3 * 1024 * 1024 // 3MB limit
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const headers = getAuthHeaders();
            let response;

            // Clean up empty array items
            const cleanedData = {
                ...formData,
                notes_top: formData.notes_top.filter(n => n.trim() !== ""),
                notes_heart: formData.notes_heart.filter(n => n.trim() !== ""),
                notes_base: formData.notes_base.filter(n => n.trim() !== ""),
                gallery_images: formData.gallery_images.filter(url => url.trim() !== ""),
            };

            if (fragrance?.id) {
                response = await axios.put(`${API}/admin/products/${fragrance.id}`, cleanedData, { headers });
                toast.success("Fragrance updated securely");
            } else {
                response = await axios.post(`${API}/admin/products`, cleanedData, { headers });
                toast.success("New fragrance codified");
            }

            onSave(); // Refresh list
        } catch (error) {
            console.error("Save error:", error);
            toast.error(error.response?.data?.detail || "Failed to save fragrance data");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
            {/* Editor Panel */}
            <div className="w-full max-w-4xl bg-[#0a0a0a] h-full flex flex-col border-l border-[#1a1a1a] shadow-2xl relative">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a] bg-[#0d0d0d] sticky top-0 z-10">
                    <div>
                        <h2 className="text-[#e8e8e8] text-xl tracking-[0.15em] font-light">
                            {fragrance ? "Edit Formulation" : "New Formulation"}
                        </h2>
                        <p className="text-[#5a5a5a] text-xs uppercase tracking-wider mt-1">
                            {formData.name || "Unnamed Scent"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#4a4a4a] hover:text-[#e8e8e8] transition-colors rounded-full hover:bg-[#1a1a1a]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="fragrance-form" onSubmit={handleSubmit} className="space-y-12">

                        {/* 1. Core Identity */}
                        <section className="space-y-6">
                            <h3 className="text-[#d4c5a0] text-sm tracking-[0.2em] uppercase border-b border-[#1a1a1a] pb-2">
                                Core Identity
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Fragrance Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" />
                                </div>
                                <div>
                                    <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2 flex justify-between">
                                        <span>URL Slug</span>
                                        <button type="button" onClick={generateSlug} className="text-[#d4c5a0] hover:text-[#fff]">Auto-generate</button>
                                    </label>
                                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} required
                                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Short Description</label>
                                <input type="text" name="short_description" value={formData.short_description} onChange={handleChange} required
                                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" />
                            </div>
                        </section>

                        {/* 2. Commerce & Logistics */}
                        <section className="space-y-6">
                            <h3 className="text-[#d4c5a0] text-sm tracking-[0.2em] uppercase border-b border-[#1a1a1a] pb-2">
                                Commerce & Logistics
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Display Price</label>
                                    <input type="text" name="price" value={formData.price} onChange={handleChange} required
                                        placeholder="e.g. $280"
                                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" />
                                </div>
                                <div>
                                    <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Price Amount (Cents)</label>
                                    <input type="number" name="price_amount" value={formData.price_amount} onChange={handleChange} required
                                        placeholder="e.g. 28000"
                                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" />
                                </div>
                                <div>
                                    <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Stock Level</label>
                                    <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required
                                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Batch Number</label>
                                    <input type="text" name="batch_number" value={formData.batch_number} onChange={handleChange}
                                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" />
                                </div>
                                <div>
                                    <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange}
                                        className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50" >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="is_limited" checked={formData.is_limited} onChange={handleChange}
                                            className="w-4 h-4 accent-[#d4c5a0] bg-[#111] border-[#222]" />
                                        <span className="text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase">Limited Edition</span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* 3. Olfactory Architecture */}
                        <section className="space-y-6">
                            <h3 className="text-[#d4c5a0] text-sm tracking-[0.2em] uppercase border-b border-[#1a1a1a] pb-2">
                                Olfactory Architecture
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Top Notes */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[#8a8a8a] text-xs uppercase tracking-widest">Top Notes</label>
                                        <button type="button" onClick={() => addArrayItem('notes_top')} className="text-[#4a4a4a] hover:text-[#d4c5a0]">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.notes_top.map((note, idx) => (
                                            <div key={`top-${idx}`} className="flex gap-2">
                                                <input type="text" value={note} onChange={(e) => handleArrayChange('notes_top', idx, e.target.value)}
                                                    className="flex-1 bg-[#111] border border-[#222] px-3 py-2 text-[#e8e8e8] text-xs focus:outline-none focus:border-[#d4c5a0]/50" />
                                                <button type="button" onClick={() => removeArrayItem('notes_top', idx)} className="text-[#4a4a4a] hover:text-red-400">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.notes_top.length === 0 && <p className="text-[#4a4a4a] text-xs italic">No top notes defined.</p>}
                                    </div>
                                </div>

                                {/* Heart Notes */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[#8a8a8a] text-xs uppercase tracking-widest">Heart Notes</label>
                                        <button type="button" onClick={() => addArrayItem('notes_heart')} className="text-[#4a4a4a] hover:text-[#d4c5a0]">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.notes_heart.map((note, idx) => (
                                            <div key={`heart-${idx}`} className="flex gap-2">
                                                <input type="text" value={note} onChange={(e) => handleArrayChange('notes_heart', idx, e.target.value)}
                                                    className="flex-1 bg-[#111] border border-[#222] px-3 py-2 text-[#e8e8e8] text-xs focus:outline-none focus:border-[#d4c5a0]/50" />
                                                <button type="button" onClick={() => removeArrayItem('notes_heart', idx)} className="text-[#4a4a4a] hover:text-red-400">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.notes_heart.length === 0 && <p className="text-[#4a4a4a] text-xs italic">No heart notes defined.</p>}
                                    </div>
                                </div>

                                {/* Base Notes */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[#8a8a8a] text-xs uppercase tracking-widest">Base Notes</label>
                                        <button type="button" onClick={() => addArrayItem('notes_base')} className="text-[#4a4a4a] hover:text-[#d4c5a0]">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.notes_base.map((note, idx) => (
                                            <div key={`base-${idx}`} className="flex gap-2">
                                                <input type="text" value={note} onChange={(e) => handleArrayChange('notes_base', idx, e.target.value)}
                                                    className="flex-1 bg-[#111] border border-[#222] px-3 py-2 text-[#e8e8e8] text-xs focus:outline-none focus:border-[#d4c5a0]/50" />
                                                <button type="button" onClick={() => removeArrayItem('notes_base', idx)} className="text-[#4a4a4a] hover:text-red-400">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.notes_base.length === 0 && <p className="text-[#4a4a4a] text-xs italic">No base notes defined.</p>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Brand Narrative */}
                        <section className="space-y-6">
                            <h3 className="text-[#d4c5a0] text-sm tracking-[0.2em] uppercase border-b border-[#1a1a1a] pb-2">
                                Brand Narrative
                            </h3>

                            <div>
                                <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Long Description</label>
                                <textarea name="long_description" value={formData.long_description} onChange={handleChange} rows={4} required
                                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50 custom-scrollbar" />
                            </div>

                            <div>
                                <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">The Identity</label>
                                <textarea name="identity" value={formData.identity} onChange={handleChange} rows={4}
                                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50 custom-scrollbar" />
                            </div>

                            <div>
                                <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">The Ritual</label>
                                <textarea name="ritual" value={formData.ritual} onChange={handleChange} rows={3}
                                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50 custom-scrollbar" />
                            </div>

                            <div>
                                <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">The Craft</label>
                                <textarea name="craft" value={formData.craft} onChange={handleChange} rows={3}
                                    className="w-full bg-[#111] border border-[#222] px-4 py-3 text-[#e8e8e8] text-sm focus:outline-none focus:border-[#d4c5a0]/50 custom-scrollbar" />
                            </div>
                        </section>

                        {/* 5. Visualization (Media) */}
                        <section className="space-y-6">
                            <h3 className="text-[#d4c5a0] text-sm tracking-[0.2em] uppercase border-b border-[#1a1a1a] pb-2">
                                Visual Assets
                            </h3>

                            <div>
                                <label className="block text-[#6a6a6a] text-[10px] tracking-[0.2em] uppercase mb-2">Hero Image</label>

                                {formData.hero_image_url ? (
                                    <div className="relative w-full h-80 bg-[#111] border border-[#222] flex items-center justify-center overflow-hidden group rounded-sm">
                                        <img src={formData.hero_image_url} alt="Hero preview" className="object-cover w-full h-full opacity-80 group-hover:opacity-20 transition-opacity duration-300" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, hero_image_url: '' }))}
                                                className="bg-[#222] border border-[#333] text-[#e8e8e8] px-6 py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                <Trash2 size={16} /> Remove Asset
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps()}
                                        className={`w-full h-48 border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-sm ${isDragActive ? 'border-[#d4c5a0] bg-[#d4c5a0]/5 scale-[0.99]' : 'border-[#333] bg-[#111] hover:border-[#555]'}`}
                                    >
                                        <input {...getInputProps()} />
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-[#d4c5a0]" size={28} />
                                                <p className="text-[#8a8a8a] text-[10px] uppercase tracking-widest">Encrypting & Uploading...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-center px-6">
                                                <div className={`p-3 rounded-full ${isDragActive ? 'bg-[#d4c5a0]/10' : 'bg-[#1a1a1a]'}`}>
                                                    <Upload className={isDragActive ? "text-[#d4c5a0]" : "text-[#5a5a5a]"} size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[#e8e8e8] text-xs font-medium mb-1">Drop high-resolution asset here</p>
                                                    <p className="text-[#6a6a6a] text-[10px] uppercase tracking-widest">or click to browse local files</p>
                                                </div>
                                                <div className="flex gap-3 text-[9px] uppercase tracking-widest text-[#4a4a4a]">
                                                    <span>JPG, PNG, WEBP</span>
                                                    <span>•</span>
                                                    <span>Max 3MB</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#1a1a1a] bg-[#0d0d0d] flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-xs tracking-widest uppercase text-[#8a8a8a] hover:text-[#e8e8e8] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="fragrance-form"
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#d4c5a0] text-[#0a0a0a] px-8 py-3 rounded-sm text-xs tracking-widest uppercase hover:bg-[#e5d5b0] transition-colors disabled:opacity-50"
                    >
                        <Save size={16} />
                        {loading ? "Committing..." : "Save Formulation"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FragranceEditor;
