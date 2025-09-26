import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Header from '@/components/layout/Header';
import ProductCard from '@/components/shop/ProductCard';
import FilterSidebar from '@/components/shop/FilterSidebar';
import { FilterOptions } from '@/types/product';
import { getCategories } from '@/data/products';

const Shop = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 2000],
    minRating: 0,
    inStockOnly: false,
  });
  
  const [sortBy, setSortBy] = useState<string>('featured');
  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // categories from API
  const [categories, setCategories] = useState<string[]>([]);

  // search state
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        if (mounted) setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Always use the remote API for products
        const apiBase = (import.meta.env.VITE_API_URL ?? 'https://shop.fradomos.al').toString().replace(/\/$/, '');
        const res = await fetch(`${apiBase}/products`);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        const data = await res.json();
        // Map API rows to UI product shape and normalize image URLs
        const mapped = data.map((p: any) => {
          const rawImage: string = p.image || '';
          let imageUrl = rawImage;

          // Always use the direct image endpoint for <img src="">
          imageUrl = `${apiBase}/product-images/${encodeURIComponent(p.product_id ?? p.id ?? '')}/image`;

          return {
            id: p.product_id ?? p.id, // always set id for routing
            name: p.name,
            description: p.description,
            price: Number(p.price),
            rating: p.rating ?? 0,
            reviewCount: p.review_count ?? 0, // <-- add reviewCount from API
            inStock: (p.stock_quantity ?? 0) > 0,
            image: imageUrl,
            category: p.category || 'Uncategorized',
            featured: p.featured === 1 || p.featured === true,
          };
        });
        if (mounted) setProductsData(mapped);
      } catch (err: any) {
        console.error('Fetch products error:', err);
        if (mounted) setError(err.message || 'Failed to fetch products');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = productsData.filter(product => {
      // Search filter
      if (
        search &&
        !(
          product.name?.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
        )
      ) {
        return false;
      }
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      
      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Rating filter
      if (product.rating < filters.minRating) {
        return false;
      }
      
      // Stock filter
      if (filters.inStockOnly && !product.inStock) {
        return false;
      }
      
      return true;
    });

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order for 'featured'
        break;
    }

    return filtered;
  }, [filters, sortBy, productsData, search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* existing styled loading / error / content handling below */}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} categories={categories} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">Shop</h1>
                <p className="text-muted-foreground mt-1">
                  {filteredAndSortedProducts.length} products found
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>
                        Filter products by category, price, rating, and availability.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar filters={filters} onFiltersChange={setFilters} categories={categories} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-96 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">Error: {error}</div>
            ) : (
              // Use grid with gap-3 and auto-cols for better sizing and less margin
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-5">
                {filteredAndSortedProducts.map((product) => {
                  // Ensure product.id is always present and correct
                  const id = product.product_id ?? product.id;
                  return (
                    <ProductCard 
                      key={id} 
                      product={{ 
                        ...product, 
                        id, 
                        rating: product.rating, // pass rating explicitly
                        reviewCount: product.reviewCount // pass reviewCount explicitly
                      }} 
                    />
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    categories: [],
                    priceRange: [0, 2000],
                    minRating: 0,
                    inStockOnly: false,
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
