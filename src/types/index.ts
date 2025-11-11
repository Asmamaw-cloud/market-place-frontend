// Enums from Prisma schema
export enum Role {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN'
}

export enum UnitType {
  PIECE = 'PIECE',
  KG = 'KG',
  LITER = 'LITER',
  METER = 'METER'
}

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FULFILLING = 'FULFILLING',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CARD = 'CARD',
  AMOLE = 'AMOLE',
  CBE_BIRR = 'CBE_BIRR',
  TELEBIRR = 'TELEBIRR',
  HELLO_CASH = 'HELLO_CASH',
  KEBEHA = 'KEBEHA',
}

export enum EscrowStatus {
  HOLD = 'HOLD',
  RELEASED = 'RELEASED',
  PARTIALLY_RELEASED = 'PARTIALLY_RELEASED',
  REFUNDED = 'REFUNDED'
}

export enum ShipmentStatus {
  CREATED = 'CREATED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

export enum MessageType {
  TEXT = 'TEXT',
  SIGNAL = 'SIGNAL'
}

export enum SenderRole {
  BUYER = 'BUYER',
  MERCHANT = 'MERCHANT'
}

export enum ReportStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED'
}

// Core types
export interface User {
  id: string;
  phone?: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
  carts?: Cart[];
  orders?: Order[];
  reviews?: Review[];
  loyalty?: LoyaltyTransaction[];
  merchant?: Merchant;
  qnas?: Qna[];
  conversations?: Conversation[];
  messages?: Message[];
  messageReports?: MessageReport[];
  refreshTokens?: RefreshToken[];
}

export interface Address {
  id: string;
  userId?: string;
  user?: User;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;
  plusCode?: string;
  landmark?: string;
  lat?: number;
  lon?: number;
  createdAt: string;
  updatedAt: string;
  orders?: Order[];
}

export interface CreateAddressRequest {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;
  plusCode?: string;
  landmark?: string;
  lat?: number;
  lon?: number;
}

export interface UpdateAddressRequest {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  plusCode?: string;
  landmark?: string;
  lat?: number;
  lon?: number;
}

export interface Merchant {
  id: string;
  ownerId: string;
  owner: User;
  displayName: string;
  legalName?: string;
  description?: string;
  logoUrl?: string;
  kyc?: MerchantKyc;
  payout?: MerchantPayout;
  rating: number;
  lat?: number;
  lon?: number;
  serviceAreas: string[];
  createdAt: string;
  updatedAt: string;
  products?: Product[];
  inventoryLots?: InventoryLot[];
  orders?: Order[];
  payouts?: Payout[];
  conversations?: Conversation[];
  messages?: Message[];
}

export interface CreateMerchantRequest {
  displayName: string;
  legalName?: string;
  description?: string;
  logoUrl?: string;
  lat?: number;
  lon?: number;
  serviceAreas: string[];
}

export interface UpdateMerchantRequest {
  displayName?: string;
  legalName?: string;
  description?: string;
  logoUrl?: string;
  lat?: number;
  lon?: number;
  serviceAreas?: string[];
}

export interface MerchantKyc {
  id: string;
  merchantId: string;
  merchant: Merchant;
  status: KycStatus;
  documentUrl?: string;
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface MerchantPayout {
  id: string;
  merchantId: string;
  merchant: Merchant;
  method: string;
  accountRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface Product {
  id: string;
  merchantId: string;
  merchant: Merchant;
  categoryId?: string;
  category?: Category;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  skus?: Sku[];
  reviews?: Review[];
  qnas?: Qna[];
}

export interface Sku {
  id: string;
  productId: string;
  product: Product;
  name: string;
  unitType: UnitType;
  unitIncrement: number;
  packageSize?: number;
  pricePerCanonicalUnit: number;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  inventoryLots?: InventoryLot[];
  prices?: Price[];
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
}

export interface InventoryLot {
  id: string;
  merchantId: string;
  merchant: Merchant;
  skuId: string;
  sku: Sku;
  quantity: number;
  expiry?: string;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: string;
  skuId: string;
  sku: Sku;
  amount: number;
  startsAt: string;
  endsAt?: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  percentage?: number;
  amountOff?: number;
  active: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  skuIds: string[];
  amount: number;
}

export interface Cart {
  id: string;
  userId: string;
  user: User;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  cart: Cart;
  skuId: string;
  sku: Sku;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  merchantId: string;
  merchant: Merchant;
  addressId?: string;
  address?: Address;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: Payment[];
  shipments: Shipment[];
  invoice?: Invoice;
}

export interface OrderItem {
  id: string;
  orderId: string;
  order: Order;
  skuId: string;
  sku: Sku;
  requestedQty: number;
  settledQty?: number;
  unitPrice: number;
}

export interface Payment {
  id: string;
  orderId: string;
  order: Order;
  provider: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  escrow?: Escrow;
  providerTx: PaymentProviderTx[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  provider: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  images: string[];
  skus: {
    name: string;
    unitType: UnitType;
    unitIncrement: number;
    packageSize?: number;
    pricePerCanonicalUnit: number;
    currency: string;
    active: boolean;
  }[];
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  images?: string[];
  skus?: {
    name: string;
    unitType: UnitType;
    unitIncrement: number;
    packageSize?: number;
    pricePerCanonicalUnit: number;
    currency: string;
    active: boolean;
  }[];
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  images?: string[];
}

export interface PaymentProviderTx {
  id: string;
  paymentId: string;
  payment: Payment;
  extId?: string;
  payload: any;
  createdAt: string;
}

export interface Escrow {
  id: string;
  paymentId: string;
  payment: Payment;
  status: EscrowStatus;
  holdAmount: number;
  released: number;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  order: Order;
  carrier: string;
  trackingCode?: string;
  otp?: string;
  status: ShipmentStatus;
  proofPhotoUrl?: string;
  events: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  shipment: Shipment;
  status: ShipmentStatus;
  message?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  productId: string;
  product: Product;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
}

export interface Qna {
  id: string;
  productId: string;
  product: Product;
  userId: string;
  user: User;
  question: string;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  user: User;
  points: number;
  reason: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  merchantId: string;
  merchant: Merchant;
  amount: number;
  status: string;
  createdAt: string;
  processedAt?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  order: Order;
  number: string;
  issuedAt: string;
  totalAmount: number;
  vatAmount: number;
  pdfUrl?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  user: User;
  merchantId: string;
  merchant: Merchant;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  invites: ChatInvite[];
}

export interface Message {
  id: string;
  conversationId: string;
  conversation: Conversation;
  senderUserId?: string;
  senderUser?: User;
  senderMerchantId?: string;
  senderMerchant?: Merchant;
  senderRole: SenderRole;
  type: MessageType;
  content?: string;
  payload?: any;
  readAt?: string;
  attachments: string[];
  createdAt: string;
  reports: MessageReport[];
}

export interface MessageReport {
  id: string;
  messageId: string;
  message: Message;
  reporterId: string;
  reporter: User;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface ChatInvite {
  id: string;
  token: string;
  conversationId: string;
  conversation: Conversation;
  expiresAt: string;
  createdByUserId: string;
  createdAt: string;
}

export interface RefreshToken {
  id: string;
  userId: string;
  user: User;
  tokenId: string;
  secretHash: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  ok?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Auth types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface LoginResponse {
  access_token: string;
}

// Cart types
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
}

export interface AddToCartRequest {
  skuId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order types
export interface CreateOrderRequest {
  addressId: string;
  paymentProvider: string;
}

export interface UpdateOrderRequest {
  status?: string;
  notes?: string;
}

// Chat types
export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  attachments?: string[];
}

// Notification types
export interface Notification {
  id: string;
  type: 'order' | 'message' | 'payment' | 'shipment' | 'general';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

// Utility types
export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'range' | 'checkbox' | 'text';
  options?: SelectOption[];
  min?: number;
  max?: number;
}

// Form types
export interface AddressFormData {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;
  plusCode?: string;
  landmark?: string;
  lat?: number;
  lon?: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  images: string[];
  skus: SkuFormData[];
}

export interface SkuFormData {
  name: string;
  unitType: UnitType;
  unitIncrement: number;
  packageSize?: number;
  pricePerCanonicalUnit: number;
  currency: string;
  active: boolean;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
  images: string[];
}

// Pusher event types (replacing WebSocket)
export interface PusherEvents {
  'message': (message: Message) => void;
  'new-message': (message: Message) => void;
  'new-conversation': (data: { conversationId: string; userId: string; merchantId: string }) => void;
  'message-read': (data: { messageId: string; conversationId: string; readAt: string }) => void;
}

// Re-export additional types
export * from './wishlist'
export * from './price-alerts'
export * from './stock-notifications'
export * from './gift-registry'
export * from './referral'
export * from './bulk-ordering'
export * from './inventory'
