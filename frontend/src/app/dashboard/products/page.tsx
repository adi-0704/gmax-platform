'use client';

import { useState, useEffect } from 'react';
import { getProducts, Product } from '@/firebase/products';
import { useCartStore } from '@/store/cartStore';
import { Search, Filter, ShoppingCart, Loader2, Image as ImageIcon, Package, X, Eye, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { user } = useAuth();

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

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const attemptAddToCart = () => {
    if (!selectedProduct) return;
    addItem({
      product: selectedProduct._id || '',
      name: selectedProduct.name,
      sku: selectedProduct.sku,
      price: selectedProduct.price,
      quantity,
      image: selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : ''
    });
    alert(`${quantity}x ${selectedProduct.name} added to cart!`);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Catalog</h1>
          <p className="text-card-foreground/70 mt-1">Browse and order electrical supplies</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-card-foreground/50 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-card-foreground/50 h-5 w-5" />
          <select
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background appearance-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product._id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
              <div className="h-48 relative overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center p-6">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/products/product_placeholder.png";
                    }}
                  />
                ) : (
                  <img 
                    src="/images/products/product_placeholder.png" 
                    alt="Placeholder"
                    className="w-full h-full object-contain opacity-50 mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-500"
                  />
                )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                  <span className="bg-danger text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                  {product.category}
                </span>
                <h3 className="font-bold text-lg leading-tight line-clamp-2 mt-1">{product.name}</h3>
                <p className="text-xs text-card-foreground/60 mt-1 font-mono">SKU: {product.sku}</p>
              </div>
              
              <div className="mt-auto pt-4 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-foreground">₹{product.price.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-card-foreground/60 mt-0.5">Stock: {product.stock}</p>
                </div>
                
                {user?.role === 'Dealer' && (
                  <button
                    onClick={() => openProductModal(product)}
                    disabled={product.stock <= 0}
                    className="h-10 w-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-card-foreground/50 border-2 border-dashed border-border rounded-xl">
            <Package className="h-16 w-16 mb-4 text-card-foreground/30" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Product Details & Add to Cart Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col md:flex-row shadow-primary/10">
            {/* Modal Image Area */}
            <div className="w-full md:w-2/5 md:min-h-full bg-black/5 flex items-center justify-center p-8 relative">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <img 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/products/product_placeholder.png";
                  }}
                />
              ) : (
                <img 
                  src="/images/products/product_placeholder.png" 
                  alt="Placeholder"
                  className="w-full h-full object-contain opacity-50 mix-blend-multiply"
                />
              )}
            </div>

            {/* Modal Copy & Controls Area */}
            <div className="w-full md:w-3/5 p-6 flex flex-col relative">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-4 pr-8">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mb-3 inline-block">
                  {selectedProduct.category}
                </span>
                <h2 className="text-2xl font-bold leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  {selectedProduct.brand && (
                    <span className="text-sm font-semibold text-primary">{selectedProduct.brand}</span>
                  )}
                  <p className="text-sm text-card-foreground/60 font-mono">SKU: {selectedProduct.sku}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-card-foreground/80 mb-4 leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}

              {/* Specifications Block */}
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl mb-6 flex flex-col gap-2">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                  <Info size={16} className="text-primary"/> Technical Specifications
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  {selectedProduct.length && (
                    <>
                     <span className="text-card-foreground/60">Length:</span>
                     <span className="font-semibold text-right">{selectedProduct.length}</span>
                    </>
                  )}
                  {selectedProduct.diameter && (
                    <>
                     <span className="text-card-foreground/60">Diameter:</span>
                     <span className="font-semibold text-right">{selectedProduct.diameter}</span>
                    </>
                  )}
                </div>
                {selectedProduct.specifications && (
                  <div className="pt-2 border-t border-border/50 mt-1">
                    <p className="text-xs text-card-foreground/80 leading-relaxed italic whitespace-pre-wrap">{selectedProduct.specifications}</p>
                  </div>
                )}
                
                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div className="pt-2 border-t border-border/50 mt-1">
                    <h4 className="text-xs font-bold mb-2">Key Features</h4>
                    <ul className="text-xs text-card-foreground/80 list-disc list-inside space-y-1">
                      {selectedProduct.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-sm text-card-foreground/60 mb-1">Price per unit</p>
                    <p className="text-3xl font-black text-primary">₹{selectedProduct.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Stock: <span className={selectedProduct.stock > 10 ? 'text-success' : 'text-warning'}>{selectedProduct.stock}</span></p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex items-center border border-input rounded-xl bg-background overflow-hidden h-12">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold text-lg"
                    >-</button>
                    <input 
                      type="number" 
                      min="1" 
                      max={selectedProduct.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(selectedProduct.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center bg-transparent font-bold focus:outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold text-lg"
                    >+</button>
                  </div>
                  <button 
                    onClick={attemptAddToCart}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
                  >
                    <ShoppingCart size={20} />
                    Add {quantity} to Cart
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
