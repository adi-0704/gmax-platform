'use client';

import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from '@/firebase/products';
import { useAuth } from '@/context/AuthContext';
import { Package, Plus, Search, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  // Basic Form State (For Demo purposes, integrated inline modal could be used)
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', sku: '', price: 0, stock: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Delete failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newProduct = await createProduct({ ...formData, images: [] });
      setProducts([...products, newProduct as any]);
      setIsAdding(false);
      setFormData({ name: '', category: '', sku: '', price: 0, stock: 0 });
    } catch (error: any) {
      alert('Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package size={28} className="text-primary" />
            Product Management
          </h1>
          <p className="text-card-foreground/70 mt-1">Manage catalog, inventory, and pricing</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          {isAdding ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-lg font-bold mb-4">Add New Product</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input required type="text" className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-primary focus:border-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input required type="text" className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-primary focus:border-primary" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input required type="text" className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-primary focus:border-primary uppercase" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input required type="number" min="0" className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-primary focus:border-primary" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Initial Stock</label>
              <input required type="number" min="0" className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-primary focus:border-primary" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-success text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-success/90 transition-colors disabled:opacity-70"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-black/5 dark:bg-white/5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-card-foreground/50 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-card-foreground/60 font-medium">
            {filteredProducts.length} items
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-card-foreground/60 uppercase bg-black/5 dark:bg-white/5 border-b border-border">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 w-32">Price</th>
                <th className="px-6 py-3 w-28">Stock</th>
                <th className="px-6 py-3 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-card-foreground/50">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-black/10 dark:bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-card-foreground/40" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs text-card-foreground/60">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-card-foreground/80">{product.sku}</td>
                    <td className="px-6 py-4 font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock > 10 ? 'bg-success/10 text-success' : product.stock > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-card-foreground/50 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => { if (product._id) handleDelete(product._id); }}
                          className="p-1.5 text-card-foreground/50 hover:text-danger hover:bg-danger/10 rounded transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
