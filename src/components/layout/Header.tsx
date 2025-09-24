import { useState } from 'react';
import { ShoppingCart, User, Search, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';

const Header = () => {
  const { getTotalItems } = useCart();
  const { getFavoritesCount } = useFavorites();
  const totalItems = getTotalItems();
  const favoritesCount = getFavoritesCount();

  // Mobile search visibility
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
            <span className="text-xl font-bold">Fradomos Shop</span>
          </Link>

          {/* Search Bar: hidden on small screens, visible md+ */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Mobile search overlay input (absolute, toggled) */}
          {mobileSearchOpen && (
            <div className="absolute left-0 right-0 top-full z-50 bg-background border-b px-4 py-3 md:hidden">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  onBlur={() => setMobileSearchOpen(false)}
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 w-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  onClick={() => setMobileSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile search button (visible only on small screens) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {favoritesCount}
                </Badge>
              )}
            </Button>
            
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

            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;