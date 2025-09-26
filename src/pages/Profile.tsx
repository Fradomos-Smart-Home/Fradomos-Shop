import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/layout/Header';
import { User, ShoppingCart, LogOut, Mail, Phone, Calendar, Package, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get<{ name: string; email: string; phone?: string }>('https://shop.fradomos.al/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUser(res.data);
      return axios.get<any[]>('https://shop.fradomos.al/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
    })
    .then(res => {
      setOrders(res.data);
      setLoading(false);
    })
    .catch(() => {
      navigate('/login');
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Dashboard stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const lastOrder = orders.length > 0 ? orders[0] : null;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  if (loading) return <div className="container mx-auto px-4 py-16">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" /> {user.email}
                {user.phone && (
                  <>
                    {/* Desktop: inline phone */}
                    <span className="mx-2 hidden sm:inline-flex">|</span>
                    <span className="hidden sm:inline-flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {user.phone}
                    </span>
                  </>
                )}
              </div>
              {/* Mobile: phone under email */}
              {user.phone && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1 block sm:hidden">
                  <Phone className="h-4 w-4" /> {user.phone}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <Package className="h-6 w-6 text-primary mb-1" />
              <span className="text-lg font-bold">{totalOrders}</span>
              <span className="text-xs text-muted-foreground">Orders</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <DollarSign className="h-6 w-6 text-primary mb-1" />
              <span className="text-lg font-bold">${totalSpent.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">Total Spent</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <CheckCircle className="h-6 w-6 text-green-500 mb-1" />
              <span className="text-lg font-bold">{deliveredOrders}</span>
              <span className="text-xs text-muted-foreground">Delivered</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <XCircle className="h-6 w-6 text-yellow-500 mb-1" />
              <span className="text-lg font-bold">{pendingOrders}</span>
              <span className="text-xs text-muted-foreground">Pending</span>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>
              {orders.length === 0 ? 'You have no orders yet.' : 'Your recent orders:'}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">No orders found.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Order ID</th>
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">Status</th>
                    <th className="py-2 px-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2">{order.id}</td>
                      <td className="py-2 px-2">{order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</td>
                      <td className="py-2 px-2">
                        <span className={
                          order.status === 'delivered'
                            ? 'text-green-600 font-semibold'
                            : order.status === 'pending'
                            ? 'text-yellow-600 font-semibold'
                            : 'text-muted-foreground'
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2">${order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
