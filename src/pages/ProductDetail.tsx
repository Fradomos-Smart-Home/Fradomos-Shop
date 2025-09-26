import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ShoppingCart, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/layout/Header';
import StarRating from '@/components/ui/star-rating';
import { getProductById } from '@/data/products';
import type { Product, Review } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

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
  const [reviewStats, setReviewStats] = useState<{ count: number; avg: number }>({ count: 0, avg: 0 });
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [stockQty, setStockQty] = useState<number | null>(null);
  const [inStock, setInStock] = useState<boolean>(true);
  const [features, setFeatures] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch product details from API
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
          category_name: p.category_name ?? p.category ?? 'Uncategorized',
          rating: p.rating != null ? Number(p.rating) : 0,
          reviewCount: p.review_count != null ? Number(p.review_count) : 0,
          features: Array.isArray(p.features) ? p.features : [],
          inStock: p.in_stock != null ? Boolean(p.in_stock) : ((p.stock_quantity ?? 0) > 0),
          product_id: p.product_id ?? p.id ?? id,
          stock_quantity: undefined
        };

        if (!mounted) return;
        setProduct(mappedProduct);

        // Fetch features from API
        try {
          const featuresRes = await fetch(`https://shop.fradomos.al/products/${encodeURIComponent(id)}/features`);
          if (featuresRes.ok) {
            const featuresData = await featuresRes.json();
            if (mounted && Array.isArray(featuresData)) {
              setFeatures(featuresData.map((f: any) => typeof f === 'string' ? f : (f?.feature ?? '')));
            }
          }
        } catch {
          // ignore features error, fallback to product.features
        }

        // Fetch stock count
        try {
          const stockRes = await fetch(`https://shop.fradomos.al/products/${encodeURIComponent(id)}/in_stock`);
          if (stockRes.ok) {
            const stockData = await stockRes.json();
            const qty = typeof stockData === 'number' ? stockData : (stockData?.in_stock ?? null);
            if (mounted) {
              setStockQty(qty);
              setInStock(qty > 0);
            }
          } else {
            if (mounted) {
              setStockQty(null);
              setInStock(false);
            }
          }
        } catch {
          if (mounted) {
            setStockQty(null);
            setInStock(false);
          }
        }

        // Fetch reviews from API
        const reviewsRes = await fetch(`https://shop.fradomos.al/product-reviews/product/${id}`);
        const text = await reviewsRes.text();
        let reviews: any[] = [];
        try {
          reviews = JSON.parse(text);
        } catch {
          reviews = [];
        }
        // Normalize review fields for display
        const normalizedReviews = reviews.map((r: any) => ({
          id: r.id,
          productId: r.product_id ?? id,
          userName: r.reviewer_name || r.user_name || r.userName || r.name || r.buyer_name || r.user || 'Anonymous',
          rating: r.rating,
          comment: r.comment,
          verified: r.verified,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
        }));
        if (mounted) setProductReviews(normalizedReviews);

        // Calculate review stats from fetched reviews
        if (mounted) {
          const count = normalizedReviews.length;
          const avg = count > 0 ? normalizedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count : 0;
          setReviewStats({ count, avg: Number(avg.toFixed(2)) });
        }
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

  // State for paginated reviews
  // (removed duplicate declaration)

  // Reset visible reviews when productReviews change (e.g. after submitting a review)
  useEffect(() => {
    setVisibleReviews(5);
  }, [productReviews]);

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

  const handleAddToCart = async () => {
    if (!product) return;
    if (!inStock) return; // Prevent adding if not in stock
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Not Logged In",
        description: "Please log in to add products to your cart.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    try {
      await axios.post(
        'https://shop.fradomos.al/cart/items',
        { product_id: product.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Could not add to cart.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = () => {
    if (product) toggleFavorite(product);
  };

  const isLiked = product ? isFavorite(product.id) : false;

  const handleSubmitReview = async () => {
    if (!product) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Not Logged In",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    try {
      await axios.post(
        'https://shop.fradomos.al/product-reviews',
        {
          product_id: product.id,
          rating: userRating,
          comment: newReview,
          verified: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Review Submitted",
        description: "Thank you for your review! It will be published after moderation.",
      });
      setNewReview('');
      setUserRating(5);
      // Refresh reviews
      const reviewsRes = await fetch(`https://shop.fradomos.al/product-reviews/product/${product.id}`);
      const text = await reviewsRes.text();
      let reviews: any[] = [];
      try {
        reviews = JSON.parse(text);
      } catch {
        reviews = [];
      }
      const normalizedReviews = reviews.map((r: any) => ({
        id: r.id,
        productId: r.product_id ?? id,
        userName: r.reviewer_name || r.user_name || r.userName || r.name || r.buyer_name || r.user || 'Anonymous',
        rating: r.rating,
        comment: r.comment,
        verified: r.verified,
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
      }));
      setProductReviews(normalizedReviews);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Could not submit review.",
        variant: "destructive",
      });
    }
  };

  // Share handler
  const handleShare = async () => {
    if (!product) return;
    const url = window.location.href;
    const shareData = {
      title: product.name,
      text: product.description,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        toast({
          title: "Share Cancelled",
          description: "Product was not shared.",
        });
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Product link copied to clipboard.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Could not copy link.",
          variant: "destructive",
        });
      }
    }
  };

  // Helper to count reviews by star
  const getStarCounts = () => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    productReviews.forEach(r => {
      const rating = Math.round(r.rating);
      if (counts[rating] !== undefined) counts[rating]++;
    });
    return counts;
  };
  const starCounts = getStarCounts();

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
          <div className="space-y-4 flex justify-center">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted max-w-sm w-full h-64 mx-auto flex items-center justify-center">
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
              
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                {/* Show correct review average and count */}
                <StarRating rating={reviewStats.avg} showRating />
                <span className="text-sm text-muted-foreground">
                  ({reviewStats.count} reviews)
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
                {(features.length > 0 ? features : product.features)?.map((feature, index) => (
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
                    disabled={!inStock || (stockQty !== null && quantity >= stockQty)}
                  >
                    +
                  </Button>
                </div>

                {inStock ? (
                  <Badge variant="outline" className="text-success border-success">
                    {typeof stockQty === 'number' ? `${stockQty} in stock` : 'In Stock'}
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
                  disabled={!inStock || (stockQty !== null && quantity > stockQty)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button variant="outline" size="lg" onClick={handleShare}>
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
                  <div className="text-4xl font-bold mb-2">{reviewStats.avg}</div>
                  <StarRating rating={reviewStats.avg} size="lg" className="justify-center mb-2" />
                  <p className="text-muted-foreground">Based on {reviewStats.count} reviews</p>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-3">{stars}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-yellow-400 rounded-full" 
                          style={{
                            width: reviewStats.count > 0
                              ? `${(starCounts[stars] / reviewStats.count) * 100}%`
                              : '0%'
                          }}
                        />
                      </div>
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
            {productReviews.length === 0 ? (
              <div className="text-muted-foreground text-center">No reviews yet.</div>
            ) : (
              <>
                {productReviews.slice(0, visibleReviews).map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.userName ? review.userName.charAt(0) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              {/* Always show the reviewer's name */}
                              <p className="font-medium">{review.userName || 'Anonymous'}</p>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.date || ''}</p>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {visibleReviews < productReviews.length && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setVisibleReviews(v => v + 5)}>
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;