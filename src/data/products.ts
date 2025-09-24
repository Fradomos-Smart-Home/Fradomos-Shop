import { Product, Review } from '@/types/product';
import headphonesImg from '@/assets/headphones.jpg';
import smartphoneImg from '@/assets/smartphone.jpg';
import laptopImg from '@/assets/laptop.jpg';
import smartwatchImg from '@/assets/smartwatch.jpg';
import earbudsImg from '@/assets/earbuds.jpg';
import gamingMouseImg from '@/assets/gaming-mouse.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: headphonesImg,
    category: 'Audio',
    rating: 4.8,
    reviewCount: 1245,
    description: 'Experience superior sound quality with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort.',
    features: [
      'Active Noise Cancellation',
      '30-hour battery life',
      'Premium comfort padding',
      'High-quality drivers',
      'Quick charge technology'
    ],
    inStock: true,
    product_id: ''
  },
  {
    id: '2',
    name: 'Ultra-Slim Smartphone',
    price: 899.99,
    image: smartphoneImg,
    category: 'Mobile',
    rating: 4.6,
    reviewCount: 856,
    description: 'Cutting-edge smartphone with advanced camera system, lightning-fast processor, and all-day battery life in an elegant design.',
    features: [
      '108MP triple camera system',
      '6.7" OLED display',
      '12GB RAM, 256GB storage',
      '5G connectivity',
      'Wireless charging'
    ],
    inStock: true,
    product_id: ''
  },
  {
    id: '3',
    name: 'Professional Laptop',
    price: 1299.99,
    originalPrice: 1499.99,
    image: laptopImg,
    category: 'Computers',
    rating: 4.7,
    reviewCount: 623,
    description: 'High-performance laptop perfect for professionals and creators. Features latest processor, ample storage, and stunning display.',
    features: [
      'Intel Core i7 processor',
      '16GB RAM, 512GB SSD',
      '15.6" 4K display',
      'All-day battery life',
      'Thunderbolt 4 ports'
    ],
    inStock: true,
    product_id: ''
  },
  {
    id: '4',
    name: 'Smart Fitness Watch',
    price: 249.99,
    image: smartwatchImg,
    category: 'Wearables',
    rating: 4.5,
    reviewCount: 1876,
    description: 'Advanced fitness tracking, health monitoring, and smart features in a stylish, comfortable design that goes with everything.',
    features: [
      'GPS + Cellular connectivity',
      'Health and fitness tracking',
      'Water resistant to 50m',
      '18-hour battery life',
      'ECG and blood oxygen monitoring'
    ],
    inStock: true,
    product_id: ''
  },
  {
    id: '5',
    name: 'True Wireless Earbuds',
    price: 179.99,
    originalPrice: 199.99,
    image: earbudsImg,
    category: 'Audio',
    rating: 4.4,
    reviewCount: 2341,
    description: 'Perfect sound in a compact design. Features adaptive audio, transparency mode, and seamless device switching.',
    features: [
      'Adaptive audio technology',
      'Transparency mode',
      '6 hours playback + 24 with case',
      'Sweat and water resistant',
      'Wireless charging case'
    ],
    inStock: false,
    product_id: ''
  },
  {
    id: '6',
    name: 'Gaming Mouse Pro',
    price: 79.99,
    image: gamingMouseImg,
    category: 'Gaming',
    rating: 4.9,
    reviewCount: 1567,
    description: 'Professional gaming mouse with precision sensor, customizable RGB lighting, and ergonomic design for extended gaming sessions.',
    features: [
      '25,000 DPI precision sensor',
      'Customizable RGB lighting',
      'Programmable buttons',
      'Lightweight design (65g)',
      'Ultra-fast wireless connectivity'
    ],
    inStock: true,
    product_id: ''
  },
];

export const reviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userName: 'John D.',
    rating: 5,
    comment: 'Absolutely amazing sound quality! The noise cancellation works perfectly and they\'re incredibly comfortable for long listening sessions.',
    date: '2024-01-15',
    verified: true,
  },
  {
    id: '2',
    productId: '1',
    userName: 'Sarah M.',
    rating: 4,
    comment: 'Great headphones overall. Sound quality is excellent, though I wish the bass was a bit stronger. Battery life is fantastic!',
    date: '2024-01-10',
    verified: true,
  },
  {
    id: '3',
    productId: '2',
    userName: 'Mike R.',
    rating: 5,
    comment: 'Best smartphone I\'ve ever owned. Camera quality is outstanding and the performance is lightning fast. Highly recommend!',
    date: '2024-01-12',
    verified: true,
  },
];

export const categories = [
  'All',
  'Audio',
  'Mobile',
  'Computers', 
  'Wearables',
  'Gaming',
];

// Helpers to fetch product details and comments from backend API.
// Uses VITE_API_URL when set, otherwise falls back to relative paths (works with Vite proxy).

function apiBase() {
  // prefer VITE_API_URL, fallback to the public server
  const env = (import.meta.env.VITE_API_URL ?? '').toString().trim();
  return (env || 'https://shop.fradomos.al').replace(/\/$/, '');
}

function imageEndpointForProduct(productId: string) {
  const base = apiBase();
  // Use the direct image endpoint for <img src="">
  return `${base}/product-images/${productId}/image`;
}

/**
 * Fetch single product metadata from backend (/products/:product_id).
 * Returns mapped Product or null on not found/error.
 */
export async function getProductById(product_id: string): Promise<Product | null> {
  const base = apiBase();
  const url = base ? `${base}/products/${encodeURIComponent(product_id)}` : `/products/${encodeURIComponent(product_id)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch product ${product_id}: ${res.status}`);
    }
    const p = await res.json();
    const prodId = String(p.product_id ?? p.id ?? product_id);
    return {
      product_id: prodId,
      id: prodId,
      name: p.name ?? '',
      description: p.description ?? '',
      price: Number(p.price ?? 0),
      originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
      // Use the direct image endpoint for <img src="">
      image: p.image ? (typeof p.image === 'string' && /^https?:\/\//i.test(p.image) ? p.image : (base ? `${base}${p.image.startsWith('/') ? p.image : `/${p.image}`}` : p.image)) : imageEndpointForProduct(prodId),
      category: p.category ?? p.category_name ?? 'Uncategorized',
      rating: p.rating != null ? Number(p.rating) : 0,
      reviewCount: p.review_count != null ? Number(p.review_count) : 0,
      features: Array.isArray(p.features) ? p.features : [],
      inStock: p.in_stock != null ? Boolean(p.in_stock) : ((p.stock_quantity ?? 0) > 0),
    };
  } catch (err) {
    console.error('getProductById error:', err);
    // Try to return static fallback by id
    const fallback = products.find((x) => x.id === String(product_id));
    return fallback ?? null;
  }
}

/**
 * Fetch comments for a product from backend (/products/:product_id/comments).
 * Maps response to Review[] shape used by the app.
 */
export async function getComments(product_id: string): Promise<Review[]> {
  const base = apiBase();
  const url = base ? `${base}/products/${encodeURIComponent(product_id)}/comments` : `/products/${encodeURIComponent(product_id)}/comments`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // return empty array on error
      console.error(`Failed to fetch comments for product ${product_id}: ${res.status}`);
      return [];
    }
    const data = await res.json();
    // map API comment shape to Review
    return (data || []).map((c: any) => ({
      id: String(c.id ?? ''),
      productId: String(c.product_id ?? product_id),
      userName: c.user_name ?? c.userName ?? 'Anonymous',
      rating: c.rating != null ? Number(c.rating) : 0,
      comment: c.comment ?? '',
      date: c.date ? String(c.date) : '',
      verified: c.verified != null ? Boolean(c.verified) : false,
    }));
  } catch (err) {
    console.error('getComments error:', err);
    return [];
  }
}

// simple in-memory cache for category id -> name
const categoryCache = new Map<string, string>();

/**
 * Fetch categories from backend (/categories).
 * Returns array of category names with a top-level "All" option.
 */
export async function getCategories(): Promise<string[]> {
  const base = apiBase();
  const url = `${base}/categories`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`getCategories failed: ${res.status}`);
      return categories;
    }
    const data = await res.json();

    // data might be array of objects { id, name } or simple strings or { category_id, category_name }
    const names: string[] = [];
    (data || []).forEach((c: any) => {
      if (c == null) return;
      if (typeof c === 'string') {
        names.push(c);
      } else if (typeof c === 'object') {
        // try common fields
        const id = String(c.id ?? c.category_id ?? c.key ?? '');
        const name = String((c.name ?? c.category_name ?? c.title ?? id) || '');
        if (id && name) {
          // populate cache for lookups
          if (id) categoryCache.set(id, name);
        }
        if (name) names.push(name);
      } else {
        names.push(String(c));
      }
    });

    const unique = Array.from(new Set(names.filter(Boolean)));
    return ['All', ...unique.map(String)];
  } catch (err) {
    console.error('getCategories error, returning fallback:', err);
    return categories;
  }
}

/**
 * Fetch single category name from backend (/categories/:category_id).
 * Uses cache when available. Returns the category name string, or falls back to the provided id on error.
 */
export async function getCategoryById(category_id: string): Promise<string> {
  const base = apiBase();
  if (!category_id) return '';

  // check cache first
  if (categoryCache.has(category_id)) {
    return categoryCache.get(category_id)!;
  }

  const url = `${base}/categories/${encodeURIComponent(category_id)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`getCategoryById failed for ${category_id}: ${res.status}`);
      return category_id;
    }
    const data = await res.json();
    let name = '';

    if (typeof data === 'string') name = data;
    else if (data && typeof data === 'object') {
      name = data.name ?? data.category_name ?? data.title ?? String(data?.label ?? '');
    } else {
      name = String(data ?? category_id);
    }

    if (name) categoryCache.set(category_id, name);
    return name || category_id;
  } catch (err) {
    console.error('getCategoryById error:', err);
    return category_id;
  }
}

/**
 * Fetch all products from backend (/products).
 * Returns array of mapped Product objects.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  const base = apiBase();
  const url = `${base}/products`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    const data = await res.json();
    // Map API rows to UI product shape and normalize image URLs
    return (data || []).map((p: any) => {
      // Ensure id is always present for routing and linking
      const id = p.product_id ?? p.id;
      let rawImage = p.image;
      if (rawImage == null) rawImage = '';
      rawImage = String(rawImage);

      let imageUrl = rawImage;

      // Always use the direct image endpoint for <img src="">
      imageUrl = `${base}/product-images/${encodeURIComponent(id)}/image`;

      return {
        product_id: String(p.product_id ?? p.id ?? id),
        id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
        image: imageUrl,
        category: p.category ?? p.category_name ?? 'Uncategorized',
        rating: p.rating ?? 0,
        reviewCount: p.review_count ?? 0,
        features: Array.isArray(p.features) ? p.features : [],
        inStock: (p.stock_quantity ?? 0) > 0,
      };
    });
  } catch (err) {
    console.error('fetchAllProducts error:', err);
    // fallback to static products
    return products;
  }
}

/**
 * Fetch product image as base64 and return a data URL.
 */
export async function fetchProductImageDataUrl(productId: string): Promise<string | null> {
  const base = apiBase();
  const url = `${base}/product-images/${encodeURIComponent(productId)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.image) {
      return `data:image/jpeg;base64,${data.image}`;
    }
    return null;
  } catch (err) {
    console.error('fetchProductImageDataUrl error:', err);
    return null;
  }
}