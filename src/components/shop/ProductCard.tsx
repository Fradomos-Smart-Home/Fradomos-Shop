import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import StarRating from '@/components/ui/star-rating';
import { Product } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { Link } from 'react-router-dom';
import { fetchProductImageDataUrl, getCategoryById } from '@/data/products';
import { useEffect, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isLiked = isFavorite(product.id);

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
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

  return (
    <Link to={`/product/${id}`}>
      <Card className="product-card group cursor-pointer overflow-hidden">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageSrc ?? '/favicon.png'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.originalPrice && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              Sale
            </Badge>
          )}
          {!product.inStock && (
            <Badge className="absolute top-3 right-3 bg-gray-500 text-white">
              Out of Stock
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-white/80 hover:bg-white ${
              isLiked ? 'opacity-100' : ''
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{categoryLabel}</p>
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="price-highlight">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {product.inStock && (
                <Button
                  size="sm"
                  className="btn-cart opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;