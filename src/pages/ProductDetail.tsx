import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/layout/Header';
import StarRating from '@/components/ui/star-rating';
import { getProductById, getComments } from '@/data/products';
import type { Product, Review } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from '@/hooks/use-toast';

const ProductDetail = () => {
  // Use string id, fallback to empty string if undefined
  const { id } = useParams<{ id?: string }>();

  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState('');
  const [userRating, setUserRating] = useState(5);

  const [product, setProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setError('Missing product id');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch product details from API
        const apiBase = (import.meta.env.VITE_API_URL ?? 'https://shop.fradomos.al').toString().replace(/\/$/, '');
        const res = await fetch(`${apiBase}/products/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Product not found');
        const p = await res.json();

        // Map API response to Product shape
        const mappedProduct: Product = {
          id: p.product_id ?? p.id ?? id,
          name: p.name ?? '',
          description: p.description ?? '',
          price: Number(p.price ?? 0),
          originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
          image: `${apiBase}/product-images/${encodeURIComponent(p.product_id ?? p.id ?? id)}/image`,
          category: p.category ?? p.category_name ?? p.category_id ?? 'Uncategorized',
          rating: p.rating != null ? Number(p.rating) : 0,
          reviewCount: p.review_count != null ? Number(p.review_count) : 0,
          features: Array.isArray(p.features) ? p.features : [],
          inStock: p.in_stock != null ? Boolean(p.in_stock) : ((p.stock_quantity ?? 0) > 0),
        };

        if (!mounted) return;
        setProduct(mappedProduct);

        // Fetch comments/reviews
        const comments = await getComments(id);
        if (!mounted) return;
        setProductReviews(comments);
      } catch (err: any) {
        console.error('Failed to load product or comments', err);
        if (mounted) setError(err.message || 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{error ?? 'Product not found'}</h1>
            <Link to="/">
              <Button>Return to Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) addToCart(product, quantity);
  };

  const handleToggleFavorite = () => {
    if (product) toggleFavorite(product);
  };

  const isLiked = product ? isFavorite(product.id) : false;

  const handleSubmitReview = () => {
    toast({
      title: "Review Submitted",
      description: "Thank you for your review! It will be published after moderation.",
    });
    setNewReview('');
    setUserRating(5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img 
                src={product?.image} 
                alt={product?.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <StarRating rating={product.rating} showRating />
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <Badge variant="destructive">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Add to Cart Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>

                {product.inStock ? (
                  <Badge variant="outline" className="text-success border-success">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive border-destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 btn-shop"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleToggleFavorite}
                  className={isLiked ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart 
                    className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} 
                  />
                </Button>
                
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">2-year warranty included</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          
          {/* Review Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{product.rating}</div>
                  <StarRating rating={product.rating} size="lg" className="justify-center mb-2" />
                  <p className="text-muted-foreground">Based on {product.reviewCount} reviews</p>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-3">{stars}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-yellow-400 rounded-full" 
                          style={{ width: `${Math.random() * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {Math.floor(Math.random() * 50)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Write Review */}
          <Card>
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Your Review</p>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button onClick={handleSubmitReview} disabled={!newReview.trim()}>
                Submit Review
              </Button>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {productReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {review.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;