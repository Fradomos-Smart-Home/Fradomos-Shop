export interface Product {
  product_id: string;
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  inStock: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
}