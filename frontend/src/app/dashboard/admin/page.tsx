'use client';

import { useState, useEffect } from 'react';
import { getDashboardAnalytics } from '@/firebase/analytics';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  Loader2,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

interface DashboardData {
  totalOrders: number;
  totalProducts: number;
  totalDealers: number;
  totalRevenue: number;
  recentOrders: any[];
  ordersByStatus: { _id: string, count: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const fetchedData = await getDashboardAnalytics();
        setData(fetchedData as any);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && (user.role === 'Admin' || user.role === 'SalesManager')) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return <div>Error loading dashboard.</div>;
  }

  const chartData = data.ordersByStatus.map(item => ({
    name: item._id,
    Orders: item.count
  }));

  // Dummy monthly data for aesthetics (SaaS look)
  const monthlyRevenue = [
    { name: 'Jan', Revenue: 400000 },
    { name: 'Feb', Revenue: 300000 },
    { name: 'Mar', Revenue: 550000 },
    { name: 'Apr', Revenue: 480000 },
    { name: 'May', Revenue: 620000 },
    { name: 'Jun', Revenue: data.totalRevenue }, // Current
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview Dashboard</h1>
          <p className="text-card-foreground/70 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <TrendingUp size={18} />
          <span>System Healthy</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-card-foreground/60 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{data.totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <IndianRupee size={20} />
            </div>
          </div>
          <p className="text-xs text-success flex items-center mt-4">
            <ArrowUpRight size={14} className="mr-1" />
            <span>+12.5% from last month</span>
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-card-foreground/60 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold">{data.totalOrders}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-card-foreground/60 mb-1">Registered Dealers</p>
              <h3 className="text-2xl font-bold">{data.totalDealers}</h3>
            </div>
            <div className="p-3 bg-warning/10 text-warning rounded-lg">
              <Building2 size={20} />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-card-foreground/60 mb-1">Total Products</p>
              <h3 className="text-2xl font-bold">{data.totalProducts}</h3>
            </div>
            <div className="p-3 bg-success/10 text-success rounded-lg">
              <Package size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="Revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{fill: 'var(--foreground)', opacity: 0.5}} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{fill: 'var(--foreground)', opacity: 0.5}} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{stroke: 'var(--border)', strokeWidth: 1}}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Orders by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{fill: 'var(--foreground)', opacity: 0.5}} tickLine={false} axisLine={false} />
                <YAxis tick={{fill: 'var(--foreground)', opacity: 0.5}} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'var(--primary)', opacity: 0.05}}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="Orders" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
