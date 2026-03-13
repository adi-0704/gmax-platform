'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '@/firebase/orders';
import { useAuth } from '@/context/AuthContext';
import { ClipboardList, Search, Filter, Loader2, CheckCircle2, Clock, Truck, Package, XCircle } from 'lucide-react';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Dispatched' | 'Delivered' | 'Rejected';
  priority: 'Low' | 'Normal' | 'High';
  createdAt: string;
  items: OrderItem[];
  shippingAddress: string;
  dealer: {
    name: string;
    companyName: string;
    email: string;
    phone: string;
  };
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
  Rejected: <XCircle size={16} />,
};

const priorityColors = {
  Low: 'bg-card text-card-foreground',
  Normal: 'bg-primary/10 text-primary',
  High: 'bg-danger/10 text-danger font-bold',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data as any);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus as any } : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error('Status update failed', error);
      alert('Failed to update status');
    }
  };

  const updatePriority = async (orderId: string, newPriority: string) => {
    try {
      await updateOrderStatus(orderId, { priority: newPriority });
      setOrders(orders.map(o => o._id === orderId ? { ...o, priority: newPriority as any } : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, priority: newPriority as any });
      }
    } catch (error) {
      console.error('Priority update failed', error);
      alert('Failed to update priority');
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const matchSearch = 
      o._id.toLowerCase().includes(term) ||
      o.dealer.companyName?.toLowerCase().includes(term) ||
      o.dealer.name.toLowerCase().includes(term);
    
    const matchStatus = statusFilter ? o.status === statusFilter : true;
    
    return matchSearch && matchStatus;
  });

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
            <ClipboardList size={28} className="text-primary" />
            Order Processing
          </h1>
          <p className="text-card-foreground/70 mt-1">Review, approve, and dispatch dealer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table/List view */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 bg-black/5 dark:bg-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-card-foreground/50 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by Order ID or Dealer..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-card-foreground/50 h-4 w-4" />
              <select
                className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-card-foreground/60 uppercase bg-black/5 dark:bg-white/5 border-b border-border sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-3">Order Info</th>
                  <th className="px-6 py-3">Dealer</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-card-foreground/50">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr 
                      key={order._id} 
                      onClick={() => setSelectedOrder(order)}
                      className={`border-b border-border cursor-pointer transition-colors ${
                        selectedOrder?._id === order._id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-card-foreground/60 mb-1">
                          #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </p>
                        <p className="font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{order.dealer?.companyName || 'Unknown'}</p>
                        <p className="text-xs text-card-foreground/60">{order.dealer?.name}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-foreground font-mono">
                          ₹{(order.totalAmount * 1.18).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status]} flex items-center gap-1`}>
                            {statusIcons[order.status]}
                            {order.status}
                          </span>
                          {order.priority !== 'Normal' && (
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${priorityColors[order.priority]}`}>
                              {order.priority} PRIORITY
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Action Panel */}
        <div className="lg:col-span-1 border border-border bg-card rounded-xl shadow-sm flex flex-col h-[calc(100vh-180px)] overflow-hidden">
          {selectedOrder ? (
            <>
              <div className="p-6 border-b border-border bg-black/5 dark:bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold font-mono">#{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</h2>
                    <p className="text-sm text-card-foreground/60">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-semibold mb-2">Dealer Information</h3>
                  <p className="font-bold">{selectedOrder.dealer?.companyName}</p>
                  <p className="text-sm text-card-foreground/80">{selectedOrder.dealer?.name}</p>
                  <p className="text-sm text-card-foreground/60 mt-1">{selectedOrder.dealer?.phone}</p>
                  <p className="text-sm text-card-foreground/60">{selectedOrder.dealer?.email}</p>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="text-sm font-semibold mb-3">Order Items ({selectedOrder.items.length})</h3>
                <div className="space-y-3 mb-6">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm items-center p-2 rounded hover:bg-black/5 dark:hover:bg-white/5">
                      <div className="flex flex-col max-w-[60%]">
                        <span className="font-medium truncate" title={item.product?.name}>{item.product?.name || 'Unknown Product'}</span>
                        <span className="text-xs text-card-foreground/50 font-mono">SKU: {item.product?.sku || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-card-foreground/60 mr-4">{item.quantity}x @ ₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="font-bold w-20 inline-block">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
                  <p className="text-sm text-card-foreground/80 whitespace-pre-wrap">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-black/5 dark:bg-white/5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-card-foreground/60">Update Priority</label>
                  <div className="flex gap-2">
                    {['Low', 'Normal', 'High'].map(p => (
                      <button
                        key={p}
                        onClick={() => updatePriority(selectedOrder._id, p)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${
                          selectedOrder.priority === p 
                            ? (p === 'High' ? 'bg-danger text-white border-danger' : p === 'Normal' ? 'bg-primary text-white border-primary' : 'bg-card-foreground text-background border-card-foreground')
                            : 'bg-background hover:bg-black/5 border-input text-card-foreground/70'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-card-foreground/60">Update Workflow Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => updateStatus(selectedOrder._id, 'Approved')} disabled={['Approved', 'Dispatched', 'Delivered'].includes(selectedOrder.status)} className="py-2 px-3 text-xs font-bold rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center">Approve</button>
                    <button onClick={() => updateStatus(selectedOrder._id, 'Dispatched')} disabled={!['Approved'].includes(selectedOrder.status)} className="py-2 px-3 text-xs font-bold rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center">Dispatch</button>
                    <button onClick={() => updateStatus(selectedOrder._id, 'Delivered')} disabled={!['Dispatched'].includes(selectedOrder.status)} className="py-2 px-3 text-xs font-bold rounded-md bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center">Deliver</button>
                    <button onClick={() => updateStatus(selectedOrder._id, 'Rejected')} disabled={['Delivered', 'Dispatched', 'Rejected'].includes(selectedOrder.status)} className="py-2 px-3 text-xs font-bold rounded-md bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center">Reject</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-card-foreground/50 text-center">
              <ClipboardList className="w-16 h-16 mb-4 text-card-foreground/20" />
              <p className="text-lg font-medium">No order selected</p>
              <p className="text-sm max-w-xs mt-1">Select an order from the list to view its details, update workflow status, or change priority.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
