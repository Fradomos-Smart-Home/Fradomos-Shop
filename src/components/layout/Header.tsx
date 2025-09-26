import { useState, useEffect } from 'react';
import { ShoppingCart, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import axios from 'axios';

const Header = () => {
  const { getTotalItems } = useCart();
  const { getFavoritesCount } = useFavorites();
  const totalItems = getTotalItems();
  const favoritesCount = getFavoritesCount();

  // User info state
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserName(null);
      return;
    }
    axios.get<{ name: string }>('https://shop.fradomos.al/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log('API response:', res.data); // Debug log
      setUserName(res.data.name);
    })
    .catch((err) => {
      console.log('API error:', err); // Debug log
      setUserName(null);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={`${import.meta.env.BASE_URL ?? '/'}favicon.png`}
              alt="Fradomos Shop"
              title="Fradomos Shop"
              className="h-8 w-8 rounded-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).src = '/favicon.png'; }}
            />
            <span className="text-xl font-bold hidden md:inline">Fradomos Shop</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Fradomos website button: icon for mobile, text for desktop */}
            <a
              href="https://fradomos.al"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="font-semibold flex items-center">
                <Globe className="h-5 w-5 md:hidden" />
                <span className="hidden md:inline">Fradomos Website</span>
              </Button>
            </a>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile icon clickable, name displayed only */}
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center justify-center"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            {userName && userName.trim().length > 0 ? (
              <span
                className="ml-2 px-2 py-1 text-base font-bold bg-muted/60 rounded-lg truncate max-w-[180px]"
              >
                {userName.trim()}
              </span>
            ) : (
              <span className="ml-2 text-xs text-muted-foreground">No user</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;