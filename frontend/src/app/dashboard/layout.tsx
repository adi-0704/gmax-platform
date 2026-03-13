'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) return <div className="h-screen flex items-center justify-center text-primary">Loading...</div>;
  if (!user && pathname !== '/login') return null;

  const role = user?.role || 'Dealer';

  // Navigation Links based on role
  const getNavLinks = () => {
    const links = [];
    if (role === 'Admin' || role === 'SalesManager') {
      links.push({ name: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={20} /> });
      links.push({ name: 'All Orders', href: '/dashboard/admin/orders', icon: <ClipboardList size={20} /> });
    }
    
    if (role === 'Admin') {
      links.push({ name: 'Products', href: '/dashboard/admin/products', icon: <Package size={20} /> });
      links.push({ name: 'Dealers', href: '/dashboard/admin/dealers', icon: <Users size={20} /> });
    }

    if (role === 'Dealer') {
      links.push({ name: 'Catalog', href: '/dashboard/products', icon: <Package size={20} /> });
      links.push({ name: 'My Cart', href: '/dashboard/cart', icon: <ShoppingCart size={20} /> });
      links.push({ name: 'My Orders', href: '/dashboard/orders', icon: <ClipboardList size={20} /> });
    }
    return links;
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border shadow-sm">
      <div className="p-6 flex items-center space-x-3 border-b border-border">
        <Zap className="text-primary" size={28} />
        <span className="text-xl font-bold tracking-tight text-foreground">Gmax Electric</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-card-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg bg-black/5 dark:bg-white/5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <span className="text-xs text-card-foreground/50 truncate">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Overlay */}
      <div className="md:hidden">
        <header className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm absolute top-0 w-full z-20">
          <div className="flex items-center space-x-2">
            <Zap className="text-primary" size={24} />
            <span className="font-bold text-lg">Gmax Portal</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-black/5 dark:bg-white/5 rounded-md">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className="relative w-72 max-w-[80%] h-full">
              <SidebarContent />
            </aside>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
