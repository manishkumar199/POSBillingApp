import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MenuItem,
  InventoryItem,
  CustomerKhata,
  KhataTransaction,
  SaleOrder,
  StallSettings,
  RestockLog,
  OrderItem,
  PaymentMethod,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_MENU_ITEMS,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_KHATA_TXNS,
} from '../data/initialData';
import { playSoundboxChime } from '../utils/soundAndUpi';
import { AppLanguage, TranslationKeys, TRANSLATIONS } from '../utils/translations';

interface StallContextType {
  settings: StallSettings;
  updateSettings: (newSettings: Partial<StallSettings>) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKeys) => string;
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestockedAt'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  restockItem: (id: string, quantity: number, totalCost: number, supplier: string) => void;
  restockLogs: RestockLog[];
  customers: CustomerKhata[];
  addCustomer: (cust: Omit<CustomerKhata, 'id' | 'createdAt' | 'lastTransactionAt' | 'currentBalance'>) => CustomerKhata;
  updateCustomer: (id: string, updates: Partial<CustomerKhata>) => void;
  deleteCustomer: (id: string) => void;
  orders: SaleOrder[];
  createSale: (data: {
    items: OrderItem[];
    paymentMethod: PaymentMethod;
    customerId?: string;
    cashReceived?: number;
    changeDue?: number;
    upiTransactionRef?: string;
  }) => SaleOrder;
  cancelSale: (orderId: string) => void;
  khataTransactions: KhataTransaction[];
  recordKhataPayment: (customerId: string, amount: number, paymentMode: 'cash' | 'upi', note?: string) => void;
  recordManualKhataDebit: (customerId: string, amount: number, description: string) => void;
  resetToDefaults: () => void;
  exportDatabase: () => string;
  importDatabase: (json: string) => boolean;
  lowStockItems: InventoryItem[];
}

const StallContext = createContext<StallContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'chaikhata_settings_v1',
  MENU: 'chaikhata_menu_v1',
  INVENTORY: 'chaikhata_inventory_v1',
  CUSTOMERS: 'chaikhata_customers_v1',
  ORDERS: 'chaikhata_orders_v1',
  KHATA_TXNS: 'chaikhata_khata_txns_v1',
  RESTOCK_LOGS: 'chaikhata_restock_logs_v1',
};

export const StallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StallSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [menu, setMenu] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      if (saved) {
        const parsed: MenuItem[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((m) => m.id));
        const missing = INITIAL_MENU_ITEMS.filter((m) => !existingIds.has(m.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
      return INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [customers, setCustomers] = useState<CustomerKhata[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [orders, setOrders] = useState<SaleOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [khataTransactions, setKhataTransactions] = useState<KhataTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KHATA_TXNS);
      return saved ? JSON.parse(saved) : INITIAL_KHATA_TXNS;
    } catch {
      return INITIAL_KHATA_TXNS;
    }
  });

  const [restockLogs, setRestockLogs] = useState<RestockLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTOCK_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KHATA_TXNS, JSON.stringify(khataTransactions));
  }, [khataTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESTOCK_LOGS, JSON.stringify(restockLogs));
  }, [restockLogs]);

  const updateSettings = (newSettings: Partial<StallSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `m_${Date.now()}`,
    };
    setMenu((prev) => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenu((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteMenuItem = (id: string) => {
    setMenu((prev) => prev.filter((item) => item.id !== id));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastRestockedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}`,
      lastRestockedAt: new Date().toISOString(),
    };
    setInventory((prev) => [...prev, newItem]);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const restockItem = (id: string, quantity: number, totalCost: number, supplier: string) => {
    const targetItem = inventory.find((i) => i.id === id);
    if (!targetItem) return;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              currentStock: +(item.currentStock + quantity).toFixed(2),
              lastRestockedAt: new Date().toISOString(),
            }
          : item
      )
    );

    const log: RestockLog = {
      id: `rst_${Date.now()}`,
      inventoryItemId: id,
      itemName: targetItem.name,
      quantityAdded: quantity,
      unit: targetItem.unit,
      totalCost,
      supplierName: supplier || 'Local Vendor',
      timestamp: new Date().toISOString(),
    };
    setRestockLogs((prev) => [log, ...prev]);
  };

  const addCustomer = (cust: Omit<CustomerKhata, 'id' | 'createdAt' | 'lastTransactionAt' | 'currentBalance'>) => {
    const newCustomer: CustomerKhata = {
      ...cust,
      id: `c_${Date.now()}`,
      currentBalance: 0,
      createdAt: new Date().toISOString(),
      lastTransactionAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<CustomerKhata>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const createSale = (data: {
    items: OrderItem[];
    paymentMethod: PaymentMethod;
    customerId?: string;
    cashReceived?: number;
    changeDue?: number;
    upiTransactionRef?: string;
  }): SaleOrder => {
    const totalAmount = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = (orders[0]?.orderNumber || 100) + 1;
    const now = new Date().toISOString();

    let customerName = undefined;
    let customerPhone = undefined;

    if (data.paymentMethod === 'udhar' && data.customerId) {
      const customer = customers.find((c) => c.id === data.customerId);
      if (customer) {
        customerName = customer.name;
        customerPhone = customer.phone;

        // Update customer balance
        const newBalance = customer.currentBalance + totalAmount;
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id
              ? { ...c, currentBalance: newBalance, lastTransactionAt: now }
              : c
          )
        );

        // Record debit in Khata
        const itemsSummary = data.items.map((it) => `${it.quantity}x ${it.name}`).join(', ');
        const khataTxn: KhataTransaction = {
          id: `ktx_${Date.now()}`,
          customerId: customer.id,
          type: 'debit',
          amount: totalAmount,
          orderId: `ord-${orderNumber}`,
          description: `Order #${orderNumber} (${itemsSummary})`,
          balanceAfter: newBalance,
          timestamp: now,
        };
        setKhataTransactions((prev) => [khataTxn, ...prev]);
      }
    }

    // Auto deduct inventory if enabled
    if (settings.autoDeductInventory) {
      setInventory((prevInv) => {
        const updated = [...prevInv];
        data.items.forEach((orderItem) => {
          const menuItem = menu.find((m) => m.id === orderItem.menuItemId);
          if (menuItem && menuItem.ingredients) {
            menuItem.ingredients.forEach((ing) => {
              const invIndex = updated.findIndex((i) => i.id === ing.ingredientId);
              if (invIndex !== -1) {
                const totalUsed = ing.amountUsed * orderItem.quantity;
                const newStock = Math.max(0, +(updated[invIndex].currentStock - totalUsed).toFixed(3));
                updated[invIndex] = {
                  ...updated[invIndex],
                  currentStock: newStock,
                };
              }
            });
          }
        });
        return updated;
      });
    }

    const newOrder: SaleOrder = {
      id: `ord-${orderNumber}`,
      orderNumber,
      items: data.items,
      totalAmount,
      paymentMethod: data.paymentMethod,
      customerId: data.customerId,
      customerName,
      customerPhone,
      cashReceived: data.cashReceived,
      changeDue: data.changeDue,
      upiTransactionRef: data.upiTransactionRef,
      timestamp: now,
      status: 'completed',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Sound alert
    if (settings.soundAlerts) {
      playSoundboxChime(totalAmount, settings.language || 'hi');
    }

    return newOrder;
  };

  const cancelSale = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === 'cancelled') return;

    // If order was Udhar, reverse Khata
    if (order.paymentMethod === 'udhar' && order.customerId) {
      const customer = customers.find((c) => c.id === order.customerId);
      if (customer) {
        const newBalance = Math.max(0, customer.currentBalance - order.totalAmount);
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id
              ? { ...c, currentBalance: newBalance, lastTransactionAt: new Date().toISOString() }
              : c
          )
        );

        const khataTxn: KhataTransaction = {
          id: `ktx_rev_${Date.now()}`,
          customerId: customer.id,
          type: 'credit',
          amount: order.totalAmount,
          description: `Cancelled Order #${order.orderNumber} - Reversal`,
          balanceAfter: newBalance,
          timestamp: new Date().toISOString(),
        };
        setKhataTransactions((prev) => [khataTxn, ...prev]);
      }
    }

    // Revert inventory if autoDeduct was active
    if (settings.autoDeductInventory) {
      setInventory((prevInv) => {
        const updated = [...prevInv];
        order.items.forEach((orderItem) => {
          const menuItem = menu.find((m) => m.id === orderItem.menuItemId);
          if (menuItem && menuItem.ingredients) {
            menuItem.ingredients.forEach((ing) => {
              const invIndex = updated.findIndex((i) => i.id === ing.ingredientId);
              if (invIndex !== -1) {
                const totalUsed = ing.amountUsed * orderItem.quantity;
                updated[invIndex] = {
                  ...updated[invIndex],
                  currentStock: +(updated[invIndex].currentStock + totalUsed).toFixed(3),
                };
              }
            });
          }
        });
        return updated;
      });
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  const recordKhataPayment = (
    customerId: string,
    amount: number,
    paymentMode: 'cash' | 'upi',
    note?: string
  ) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newBalance = Math.max(0, +(customer.currentBalance - amount).toFixed(2));
    const now = new Date().toISOString();

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, currentBalance: newBalance, lastTransactionAt: now }
          : c
      )
    );

    const khataTxn: KhataTransaction = {
      id: `ktx_pay_${Date.now()}`,
      customerId,
      type: 'credit',
      amount,
      paymentMode,
      description: note || `Payment received via ${paymentMode.toUpperCase()}`,
      balanceAfter: newBalance,
      timestamp: now,
    };
    setKhataTransactions((prev) => [khataTxn, ...prev]);

    if (settings.soundAlerts) {
      playSoundboxChime(amount);
    }
  };

  const recordManualKhataDebit = (customerId: string, amount: number, description: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newBalance = +(customer.currentBalance + amount).toFixed(2);
    const now = new Date().toISOString();

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, currentBalance: newBalance, lastTransactionAt: now }
          : c
      )
    );

    const khataTxn: KhataTransaction = {
      id: `ktx_man_${Date.now()}`,
      customerId,
      type: 'debit',
      amount,
      description: description || 'Manual credit entry',
      balanceAfter: newBalance,
      timestamp: now,
    };
    setKhataTransactions((prev) => [khataTxn, ...prev]);
  };

  const resetToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    setMenu(INITIAL_MENU_ITEMS);
    setInventory(INITIAL_INVENTORY);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setKhataTransactions(INITIAL_KHATA_TXNS);
    setRestockLogs([]);
    localStorage.clear();
  };

  const exportDatabase = () => {
    const payload = {
      settings,
      menu,
      inventory,
      customers,
      orders,
      khataTransactions,
      restockLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabase = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.settings) setSettings(data.settings);
      if (data.menu) setMenu(data.menu);
      if (data.inventory) setInventory(data.inventory);
      if (data.customers) setCustomers(data.customers);
      if (data.orders) setOrders(data.orders);
      if (data.khataTransactions) setKhataTransactions(data.khataTransactions);
      if (data.restockLogs) setRestockLogs(data.restockLogs);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const lowStockItems = inventory.filter((item) => item.currentStock <= item.minThreshold);

  const language: AppLanguage = settings.language || 'hi';
  const setLanguage = (lang: AppLanguage) => {
    updateSettings({ language: lang });
  };
  const t = (key: TranslationKeys): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || (key as string);
  };

  return (
    <StallContext.Provider
      value={{
        settings,
        updateSettings,
        language,
        setLanguage,
        t,
        menu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        restockItem,
        restockLogs,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        orders,
        createSale,
        cancelSale,
        khataTransactions,
        recordKhataPayment,
        recordManualKhataDebit,
        resetToDefaults,
        exportDatabase,
        importDatabase,
        lowStockItems,
      }}
    >
      {children}
    </StallContext.Provider>
  );
};

export const useStall = () => {
  const context = useContext(StallContext);
  if (!context) {
    throw new Error('useStall must be used within a StallProvider');
  }
  return context;
};
