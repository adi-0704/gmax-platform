'use client';

import { useState, useEffect } from 'react';
import { getDealerOrders } from '@/firebase/orders';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Package, CheckCircle2, Clock, Truck, Download, FileText } from 'lucide-react';

interface OrderItem {
  _id: string;
  product: {
    name: string;
    sku: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Dispatched' | 'Delivered' | 'Rejected';
  createdAt: string;
  items: OrderItem[];
  shippingAddress: string;
}

const statusColors = {
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Approved: 'bg-primary/10 text-primary border-primary/20',
  Dispatched: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  Delivered: 'bg-success/10 text-success border-success/20',
  Rejected: 'bg-danger/10 text-danger border-danger/20',
};

const statusIcons = {
  Pending: <Clock size={16} />,
  Approved: <CheckCircle2 size={16} />,
  Dispatched: <Truck size={16} />,
  Delivered: <Package size={16} />,
  Rejected: <CheckCircle2 size={16} />,
};

export default function DealerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user?._id) {
       fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await getDealerOrders(user?._id || '');
      setOrders(data as any);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    // In a real application, this would trigger a PDF generation pipeline 
    // from the backend or using a library like jsPDF.
    // We'll simulate it with window.print()
    alert(`Downloading Invoice for Order ID: ${order._id}`);
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Order History</h1>
        <p className="text-card-foreground/70 mt-1">Track your bulk orders and download invoices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {orders.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-card-foreground/60">
              <FileText className="mx-auto h-12 w-12 text-card-foreground/30 mb-3" />
              <p>You have not placed any orders yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <div 
                key={order._id} 
                onClick={() => setSelectedOrder(order)}
                className={`bg-card p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                  selectedOrder?._id === order._id ? 'border-primary ring-1 ring-primary/50' : 'border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-mono text-sm text-card-foreground/60 mb-1">
                      Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </h3>
                    <p className="font-semibold text-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">₹{(order.totalAmount * 1.18).toLocaleString('en-IN')}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                      {statusIcons[order.status]}
                      <span>{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md">
                      <span className="truncate max-w-[120px] text-xs font-medium">{item.product.name}</span>
                      <span className="text-xs text-card-foreground/50">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-md">
                      <span className="text-xs text-card-foreground/50">+{order.items.length - 4} more</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-card border border-border rounded-xl p-6 sticky top-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Order Details
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-card-foreground/50 uppercase tracking-wider font-semibold mb-1">Status</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedOrder.status]}`}>
                    {statusIcons[selectedOrder.status]}
                    <span>{selectedOrder.status}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-card-foreground/50 uppercase tracking-wider font-semibold mb-1">Shipping Address</p>
                  <p className="text-sm border l border-border bg-black/5 dark:bg-white/5 p-3 rounded text-card-foreground/80 break-words">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <h3 className="text-sm font-semibold mb-3">Items ({selectedOrder.items.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex text-card-foreground/80 truncate pr-4">
                        <span className="font-medium mr-2">{item.quantity}x</span>
                        <span className="truncate">{item.product.name}</span>
                      </div>
                      <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-card-foreground/70">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-card-foreground/70">
                  <span>Estimated Tax (18%)</span>
                  <span>₹{(selectedOrder.totalAmount * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{(selectedOrder.totalAmount * 1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {['Approved', 'Dispatched', 'Delivered'].includes(selectedOrder.status) && (
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="w-full flex items-center justify-center space-x-2 bg-primary/10 text-primary py-2.5 rounded-lg font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Download size={18} />
                  <span>Download Invoice PDF</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-card-foreground/60 sticky top-6">
              Select an order to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
