import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const getDashboardAnalytics = async () => {
  // In a real app with large data, this should be done differently (e.g. cloud functions)
  // For small/medium scale, fetching and calculating locally is workable
  
  try {
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const productsSnap = await getDocs(collection(db, 'products'));
    const usersSnap = await getDocs(collection(db, 'users'));
    
    let totalRevenue = 0;
    const ordersByStatusMap: Record<string, number> = {};
    const recentOrders: any[] = [];
    
    ordersSnap.forEach((doc) => {
      const data = doc.data();
      
      // Revenue
      if (['Approved', 'Dispatched', 'Delivered'].includes(data.status)) {
         totalRevenue += (data.totalAmount || 0);
      }
      
      // Status counts
      const status = data.status || 'Pending';
      ordersByStatusMap[status] = (ordersByStatusMap[status] || 0) + 1;
      
      // Collect for recent extraction
      recentOrders.push({ _id: doc.id, ...data });
    });
    
    // Sort recent orders
    recentOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const ordersByStatus = Object.keys(ordersByStatusMap).map(key => ({
      _id: key,
      count: ordersByStatusMap[key]
    }));
    
    // Total Dealers
    let dealerCount = 0;
    usersSnap.forEach((doc) => {
       if (doc.data().role === 'Dealer') dealerCount++;
    });

    return {
      totalOrders: ordersSnap.size,
      totalProducts: productsSnap.size,
      totalDealers: dealerCount,
      totalRevenue,
      recentOrders: recentOrders.slice(0, 5),
      ordersByStatus
    };
  } catch (error) {
    console.error("Analytics fetch error:", error);
    throw error;
  }
};
