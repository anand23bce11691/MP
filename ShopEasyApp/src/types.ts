export interface ProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  description: string;
  stock: number;
  specs?: Record<string, string>;
  features?: string[];
  inStock?: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface WishlistItem {
  product: ProductItem;
  addedAt: string;
}

export interface PlacedOrderItem {
  orderId: number;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod';
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  telemetryTraceId: string;
}

export interface CouponItem {
  code: string;
  discountPercentage: number;
  description: string;
  minAmount: number;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProductIds?: number[];
}
