'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ArrowRight, Loader2, PackageX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/firebase/orders';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const [shippingAddress, setShippingAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }

    setPlacingOrder(true);
    setError('');

    try {
      const payload = {
        items: items.map(i => ({ 
          product: { _id: i.product, name: i.name, sku: i.sku, price: i.price }, 
          quantity: i.quantity, 
          price: i.price 
        })),
        shippingAddress,
        totalAmount: getTotal(),
        status: 'Pending',
        priority: 'Normal',
        dealerId: user?._id || 'unknown',
        dealer: {
          name: user?.name || '',
          email: user?.email || '',
        }
      };
      
      await createOrder(payload);
      clearCart();
      router.push('/dashboard/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <PackageX className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Your Cart is Empty</h2>
        <p className="text-card-foreground/60 max-w-sm">Looks like you haven't added any electrical supplies to your bulk order yet.</p>
        <Link 
          href="/dashboard/products"
          className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bulk Order Cart</h1>
        <p className="text-card-foreground/70 mt-1">Review your items before finalizing the order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-card-foreground/40">No Image</div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground truncate">{item.name}</h3>
                <p className="text-sm text-card-foreground/60 font-mono">SKU: {item.sku}</p>
                <div className="mt-2 text-primary font-bold">
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button 
                  onClick={() => removeItem(item.product)}
                  className="text-card-foreground/40 hover:text-danger transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1))}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 border border-border bg-card rounded-xl shadow-sm p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-3 pb-6 border-b border-border">
            <div className="flex justify-between text-card-foreground/80">
              <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span className="font-medium">₹{getTotal().toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-card-foreground/80">
              <span>Taxes (18% GST Estimated)</span>
              <span className="font-medium">₹{(getTotal() * 0.18).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="flex justify-between py-4 text-lg font-bold">
            <span>Total Value</span>
            <span className="text-primary">₹{(getTotal() * 1.18).toLocaleString('en-IN')}</span>
          </div>

          <div className="mb-6 space-y-2">
            <label className="block text-sm font-medium text-foreground">Delivery Address</label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-primary focus:border-primary text-sm resize-none"
              rows={3}
              placeholder="Enter full shipping address..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            ></textarea>
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            {placingOrder ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Place Order</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
