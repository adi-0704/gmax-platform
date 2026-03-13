'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Zap, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '@/firebase/auth';
import { getUserDocument } from '@/firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // kept for backwards compatibility stub
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let firebaseUser;
      
      if (isLogin) {
        firebaseUser = await loginUser(email, password);
      } else {
        const userData = { name, companyName, phone, role: 'Dealer' }; // Default role
        firebaseUser = await registerUser(email, password, userData);
      }
      
      // Fetch role context to determine where to send the user immediately
      const fsUser = await getUserDocument(firebaseUser.uid);
      const role = fsUser?.role || 'Dealer';
      
      // Redirect based on role
      if (role === 'Admin' || role === 'SalesManager') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/products');
      }
    } catch (err: any) {
       // Map Firebase errors to user-friendly messages
       if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
         setError('Invalid email or password.');
       } else if (err.code === 'auth/email-already-in-use') {
         setError('This email is already registered.');
       } else if (err.code === 'auth/network-request-failed') {
         setError('Network connection failed. Please check your internet connection.');
       } else {
         setError(err.message || 'Authentication failed.');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
            <Zap className="text-white" size={32} />
          </div>
          <h2 className="text-center text-3xl tracking-tight font-extrabold text-foreground">
            {isLogin ? 'Sign in to Gmax Portal' : 'Apply for Dealer Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-card-foreground/70">
            {isLogin ? 'Or ' : 'Already have an account? '}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              {isLogin ? 'apply to become a dealer' : 'sign in here'}
            </button>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-xl shadow-black/5 dark:shadow-white/5 sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground">Full Name</label>
                  <div className="mt-1">
                    <input
                      required
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-card-foreground/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background dark:bg-black/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Company/Shop Name</label>
                  <div className="mt-1">
                    <input
                      required
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-card-foreground/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background dark:bg-black/20"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Phone Number</label>
                  <div className="mt-1">
                    <input
                      required
                      type="tel"
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-card-foreground/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background dark:bg-black/20"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground">Email address</label>
              <div className="mt-1">
                <input
                  required
                  type="email"
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-card-foreground/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background dark:bg-black/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <div className="mt-1">
                <input
                  required
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-card-foreground/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background dark:bg-black/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Register')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
