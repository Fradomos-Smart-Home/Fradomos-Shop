import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import StarRating from '@/components/ui/star-rating';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import { fetchProductImageDataUrl, getCategoryById } from '@/data/products';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const isLiked = false; // Placeholder, since we're removing the like button

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [reviewStats, setReviewStats] = useState<{ count: number; avg: number }>({ count: 0, avg: 0 });
  const [stockQty, setStockQty] = useState<number | null>(null);
  const [inStock, setInStock] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    // Fetch product image
    const loadImage = async () => {
      if (!product.image) {
        const dataUrl = await fetchProductImageDataUrl(product.id);
        if (mounted && dataUrl) setImageSrc(dataUrl);
      } else {
        setImageSrc(product.image);
      }
    };
    loadImage();
    return () => { mounted = false; };
  }, [product]);

  useEffect(() => {
    let mounted = true;
    // Fetch in_stock count from API
    const fetchStock = async () => {
      try {
        const res = await fetch(`https://shop.fradomos.al/products/${product.id}/in_stock`);
        if (!res.ok) throw new Error('Failed to fetch stock');
        const data = await res.json();
        if (mounted) {
          setStockQty(typeof data === 'number' ? data : (data?.in_stock ?? null));
          setInStock((typeof data === 'number' ? data : (data?.in_stock ?? 0)) > 0);
        }
      } catch {
        if (mounted) {
          setStockQty(null);
          setInStock(false);
        }
      }
    };
    fetchStock();
    return () => { mounted = false; };
  }, [product.id]);

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`https://shop.fradomos.al/product-reviews/product/${product.id}`);
        const text = await res.text();
        let reviews: any[] = [];
        try {
          reviews = JSON.parse(text);
        } catch {
          reviews = [];
        }
        const count = reviews.length;
        const avg = count > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count : 0;
        if (mounted) setReviewStats({ count, avg: Number(avg.toFixed(2)) });
      } catch {
        if (mounted) setReviewStats({ count: 0, avg: 0 });
      }
    };
    fetchReviews();
    return () => { mounted = false; };
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // derive initial category label from product object (p.category ?? p.category_name ?? 'Uncategorized')
  const resolveInitialCategory = (p: Product) => {
    if (!p) return 'Uncategorized';
    // primary: product.category when it's already a string
    if (typeof p.category === 'string' && p.category.trim()) return p.category;
    // secondary: maybe API mapped category_name exists on the original payload shape
    const anyP = p as any;
    if (typeof anyP.category_name === 'string' && anyP.category_name.trim()) return anyP.category_name;
    // if category was an object { id, name } or similar
    if (anyP.category && typeof anyP.category === 'object') {
      return anyP.category.name ?? anyP.category.title ?? String(anyP.category);
    }
    return 'Uncategorized';
  };

  const [categoryLabel, setCategoryLabel] = useState<string>(resolveInitialCategory(product));

  useEffect(() => {
    let mounted = true;

    // raw value we might have received from server: could be id or name
    const rawCategory = ((product as any).category ?? (product as any).category_name ?? '') as string;

    // heuristic: only call GET /categories/{id} if rawCategory looks like an ID (numeric or GUID-like)
    const isLikelyId = (s: string) => {
      if (!s) return false;
      const trimmed = s.trim();
      if (/^\d+$/.test(trimmed)) return true; // numeric id
      if (/^[a-f0-9-]{8,}$/.test(trimmed) && trimmed.includes('-')) return true; // uuid-ish
      return false;
    };

    // set initial label immediately
    setCategoryLabel(resolveInitialCategory(product));

    const resolveCategory = async () => {
      if (!rawCategory || !isLikelyId(rawCategory)) return;
      try {
        const name = await getCategoryById(String(rawCategory));
        if (mounted && name) setCategoryLabel(name);
      } catch {
        // keep initial label on error
      }
    };

    resolveCategory();
    return () => { mounted = false; };
  }, [product]);

  // Debug: log product object and id for troubleshooting
  // Remove or comment this after confirming correct id mapping
  console.log("ProductCard product:", product);

  // Ensure product.id is always present and correct for routing
  const id = product.product_id ?? product.id;
  if (!id) {
    console.warn("ProductCard: missing id for product", product);
  }

  // Compute review average and count for display
  // Prefer reviewStats if present, fallback to product.rating/reviewCount
  const reviewAvg =
    (product as any).reviewStats?.avg ??
    product.rating ??
    0;
  const reviewCount =
    (product as any).reviewStats?.count ??
    product.reviewCount ??
    0;

  return (
    <Link to={`/product/${id}`}>
      <Card
        className="
          product-card group cursor-pointer overflow-hidden
          w-full
          p-1
          transition-shadow
          hover:shadow-lg
          flex flex-col
          basis-1/2 max-w-1/2
          sm:basis-1/2 sm:max-w-1/2
          md:basis-1/3 md:max-w-1/3
          lg:basis-1/4 lg:max-w-1/4
          min-w-0
          h-full
        "
        style={{ minWidth: 0 }}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageSrc ?? '/favicon.png'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.originalPrice && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1">
              Sale
            </Badge>
          )}
          {!inStock && (
            <Badge className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1">
              Out of Stock
            </Badge>
          )}
        </div>

        <CardContent className="p-2 flex flex-col flex-1">
          <div className="space-y-1 flex flex-col flex-1">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-1">
              <StarRating rating={product.rating} size="sm" showRating={false} />
              <span className="text-xs text-muted-foreground">
                ({reviewStats.count})
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1">
                <span className="price-highlight text-sm">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end min-h-[20px]">
                {/* Always reserve space for stock info to keep height consistent */}
                {inStock ? (
                  <span className="text-xs text-muted-foreground">
                    {typeof stockQty === 'number' ? `${stockQty} left` : 'In stock'}
                  </span>
                ) : (
                  <span className="text-xs text-destructive font-semibold">Out</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;