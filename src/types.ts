export type ItemCategory =
  | 'tea'
  | 'coffee'
  | 'biscuits'
  | 'candies'
  | 'pan_masala'
  | 'tobacco'
  | 'bakery'
  | 'snacks'
  | 'beverages'
  | 'packaged';

export interface IngredientRequirement {
  ingredientId: string;
  amountUsed: number; // e.g. 0.08L milk, 5g tea leaves
}

export interface MenuItem {
  id: string;
  name: string;
  localName?: string; // Hindi/Local dialect e.g. "कड़क चाय"
  category: ItemCategory;
  price: number;
  iconName: string;
  isAvailable: boolean;
  ingredients?: IngredientRequirement[];
}

export type InventoryCategory = 'dairy' | 'dry_goods' | 'spices' | 'disposables' | 'bakery' | 'packaged';

export interface InventoryItem {
  id: string;
  name: string;
  localName?: string;
  category: InventoryCategory;
  currentStock: number;
  unit: 'L' | 'kg' | 'g' | 'pcs';
  minThreshold: number;
  costPerUnit: number; // in INR
  lastRestockedAt: string;
}

export interface RestockLog {
  id: string;
  inventoryItemId: string;
  itemName: string;
  quantityAdded: number;
  unit: string;
  totalCost: number;
  supplierName: string;
  timestamp: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'udhar';

export interface SaleOrder {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashReceived?: number;
  changeDue?: number;
  upiTransactionRef?: string;
  timestamp: string;
  status: 'completed' | 'cancelled';
}

export interface CustomerKhata {
  id: string;
  name: string;
  phone: string;
  workplaceOrTag?: string; // e.g. "SBI Bank Guard", "Auto Stand #4", "Sharma Sweets"
  creditLimit: number;
  currentBalance: number; // Positive means customer owes money
  createdAt: string;
  lastTransactionAt: string;
  notes?: string;
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  type: 'debit' | 'credit'; // 'debit' = customer took items on credit (balance increases), 'credit' = customer paid money (balance decreases)
  amount: number;
  paymentMode?: 'cash' | 'upi';
  orderId?: string;
  description: string;
  balanceAfter: number;
  timestamp: string;
}

export interface StallSettings {
  stallName: string;
  stallTagline: string;
  ownerName: string;
  phone: string;
  upiId: string;
  upiMerchantName: string;
  autoDeductInventory: boolean;
  soundAlerts: boolean;
  currencySymbol: string;
  logoUrl?: string;
  language?: 'hi' | 'en';
}
