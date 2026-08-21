import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Plus, Trash2, CreditCard, 
  Banknote, Receipt, User, DollarSign, Package, 
  AlertTriangle, RefreshCw, Barcode, CheckCircle2,
  Printer, RotateCw, Eye
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { PosProduct, PosSaleItem, PosSaleOrder, UniversalReceipt } from '../../../types';
import { UniversalReceiptModal } from '../../../components/receipts/UniversalReceiptModal';
import { printService } from '../../../lib/printService';
import { offlineSyncService, OfflineServiceState } from '../../../lib/offlineSyncService';
import { WifiOff, Database } from 'lucide-react';

interface PosTerminalProps {
  saleType?: 'POS' | 'RETAIL' | 'WHOLESALE' | 'RESTAURANT' | 'BOOKSHOP';
  title?: string;
  subtitle?: string;
}

export const PosTerminalView: React.FC<PosTerminalProps> = ({
  saleType = 'POS',
  title = 'Point of Sale (POS) Terminal',
  subtitle = 'Fast counter billing, barcode scanning, M-Pesa & cash checkout'
}) => {
  const { currentTenant, token, user } = useAuth();
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [salesHistory, setSalesHistory] = useState<PosSaleOrder[]>([]);
  const [cart, setCart] = useState<PosSaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Universal Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState<UniversalReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA' | 'CARD'>('MPESA');
  const [paymentRef, setPaymentRef] = useState(`REF-${Date.now().toString(36).toUpperCase()}`);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: '',
    name: '',
    category: 'General Goods',
    costPrice: 100,
    sellingPrice: 150,
    wholesalePrice: 130,
    quantityInStock: 50,
    minStockAlert: 5,
    unit: 'pcs',
    authorOrBrand: '',
    isbnOrCode: '',
    status: 'ACTIVE' as const
  });

  const currencySymbol = currentTenant?.branding?.currencySymbol || 'KES';
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchProductsAndSales = async () => {
    setLoading(true);
    const tenantId = currentTenant?.id || '';
    try {
      const [prodRes, salesRes] = await Promise.all([
        fetch('/api/app/pos/products', { headers: authHeaders }),
        fetch('/api/app/pos/sales', { headers: authHeaders })
      ]);
      if (prodRes.ok) {
        const d = await prodRes.json();
        const prods = d.products || [];
        setProducts(prods);
        if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'pos_products', prods);
      }
      if (salesRes.ok) {
        const s = await salesRes.json();
        const sales = s.sales || [];
        setSalesHistory(sales);
        if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'pos_sales', sales);
      }
    } catch (e) {
      console.warn('[PosTerminalView] Network fetch error, attempting offline cache lookup:', e);
      if (tenantId) {
        const cachedProds = await offlineSyncService.getCachedLookupData<PosProduct[]>(tenantId, 'pos_products');
        if (cachedProds && cachedProds.length > 0) {
          setProducts(cachedProds);
        }
        const cachedSales = await offlineSyncService.getCachedLookupData<PosSaleOrder[]>(tenantId, 'pos_sales');
        if (cachedSales && cachedSales.length > 0) {
          setSalesHistory(cachedSales);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndSales();
  }, [currentTenant?.id]);

  const addToCart = (product: PosProduct) => {
    if (product.quantityInStock <= 0) {
      setWarningMessage(`"${product.name}" is currently out of stock.`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }
    const unitPrice = saleType === 'WHOLESALE' && product.wholesalePrice ? product.wholesalePrice : product.sellingPrice;
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      if (updated[existingIndex].quantity + 1 > product.quantityInStock) {
        setWarningMessage(`Cannot exceed available stock of ${product.quantityInStock} for "${product.name}".`);
        setTimeout(() => setWarningMessage(null), 3000);
        return;
      }
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice,
          quantity: 1,
          total: unitPrice
        }
      ]);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.quantityInStock) {
      alert(`Max available stock is ${product.quantityInStock}`);
      return;
    }
    setCart(
      cart.map(item => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity,
            total: quantity * item.unitPrice
          };
        }
        return item;
      })
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Check offline permission and subscription lease validity
    const writeCheck = offlineSyncService.canPerformOfflineWrite('pos');
    if (!writeCheck.allowed) {
      setWarningMessage(writeCheck.reason || 'Offline POS sales are currently blocked.');
      setTimeout(() => setWarningMessage(null), 5000);
      return;
    }

    const tenantId = currentTenant?.id || '';
    const userId = user?.id || '';
    const receiptNo = `RCT-${Date.now().toString().slice(-6)}`;
    const saleId = `sale_pos_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload: PosSaleOrder = {
      id: saleId,
      tenantId,
      receiptNo,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: 0,
      grandTotal,
      paymentMethod,
      paymentReference: paymentRef,
      customerName,
      customerPhone,
      saleType: (saleType as PosSaleOrder['saleType']) || 'POS',
      status: 'COMPLETED',
      cashierId: userId,
      cashierName: user?.name || 'Cashier',
      date: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/app/pos/sales', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setCart([]);
        setShowCheckoutModal(false);
        setDiscountAmount(0);
        setPaymentRef(`REF-${Date.now().toString(36).toUpperCase()}`);
        fetchProductsAndSales();

        // Fetch the generated Universal Receipt & open modal/dispatch print
        try {
          const rcptRes = await fetch(`/api/app/receipts?search=${payload.receiptNo}`, { headers: authHeaders });
          if (rcptRes.ok) {
            const rcptData = await rcptRes.json();
            const r = rcptData.receipts?.[0];
            if (r) {
              setSelectedReceipt(r);
              setIsReceiptModalOpen(true);
              printService.printReceipt(r).catch(() => {});
            }
          }
        } catch {
          // Silent catch for receipt pop
        }
      } else {
        throw new Error('Server sale record failed, engaging offline sync queue.');
      }
    } catch (err) {
      console.warn('[PosTerminalView] Offline sale fallback initiated:', err);
      
      // 1. Locally decrement in-memory stock
      const updatedProducts = products.map(p => {
        const inCart = cart.find(c => c.productId === p.id);
        if (inCart) {
          const newQty = Math.max(0, p.quantityInStock - inCart.quantity);
          return { ...p, quantityInStock: newQty, status: newQty === 0 ? 'OUT_OF_STOCK' : p.status };
        }
        return p;
      });
      setProducts(updatedProducts);
      if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'pos_products', updatedProducts);

      // 2. Enqueue offline mutation into IndexedDB
      await offlineSyncService.enqueueMutation(tenantId, userId, 'pos', 'pos.create_sale', payload);

      // 3. Update local sales history
      const updatedSales = [payload, ...salesHistory];
      setSalesHistory(updatedSales);
      if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'pos_sales', updatedSales);

      // 4. Generate local offline Universal Receipt for immediate thermal printing
      const fallbackReceipt: UniversalReceipt = {
        id: `rcpt_${payload.id}`,
        tenantId,
        sourceModule: 'POS_RETAIL',
        sourceReferenceId: payload.id,
        receiptNumber: payload.receiptNo,
        businessName: currentTenant?.branding?.companyName || currentTenant?.name || 'Retail Store',
        customerName: payload.customerName || 'Walk-in Customer',
        customerPhone: payload.customerPhone,
        currency: 'KES',
        currencySymbol,
        items: payload.items.map(i => ({
          name: i.productName || 'Item',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total
        })),
        subtotal: payload.subtotal,
        taxAmount: payload.tax || 0,
        discountAmount: payload.discount || 0,
        grandTotal: payload.grandTotal,
        paymentMethod: (payload.paymentMethod as any) || 'CASH',
        cashierName: payload.cashierName || user?.name || 'Cashier',
        issuedAt: payload.date,
        createdAt: payload.date,
        isReprint: false,
        reprintCount: 0,
        status: 'ISSUED',
        customFooter: 'Offline Transaction (Will Sync Automatically)'
      };

      setCart([]);
      setShowCheckoutModal(false);
      setDiscountAmount(0);
      setPaymentRef(`REF-${Date.now().toString(36).toUpperCase()}`);
      setSelectedReceipt(fallbackReceipt);
      setIsReceiptModalOpen(true);
      printService.printReceipt(fallbackReceipt).catch(() => {});

      setWarningMessage('Sale completed in Controlled Offline Mode. Will synchronize automatically when online.');
      setTimeout(() => setWarningMessage(null), 5000);
    }
  };

  const openReceiptForSale = async (sale: PosSaleOrder) => {
    try {
      const res = await fetch(`/api/app/receipts?search=${sale.receiptNo}`, { headers: authHeaders });
      if (res.ok) {
        const d = await res.json();
        const r = d.receipts?.[0];
        if (r) {
          setSelectedReceipt(r);
          setIsReceiptModalOpen(true);
          return;
        }
      }
      // Fallback build UniversalReceipt from PosSaleOrder
      const fallbackReceipt: UniversalReceipt = {
        id: `rcpt_${sale.id}`,
        tenantId: currentTenant?.id || '',
        sourceModule: 'POS_RETAIL',
        sourceReferenceId: sale.id,
        receiptNumber: sale.receiptNo,
        businessName: currentTenant?.branding?.companyName || currentTenant?.name || 'Retail Store',
        tradingName: currentTenant?.name,
        address: currentTenant?.branding?.address,
        phone: currentTenant?.branding?.contactPhone,
        email: currentTenant?.branding?.contactEmail,
        currency: currentTenant?.branding?.currency || 'KES',
        currencySymbol: currencySymbol,
        customerName: sale.customerName || 'Walk-in Customer',
        customerPhone: sale.customerPhone,
        items: sale.items.map(i => ({
          name: i.productName || 'Item',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total || (i.quantity * i.unitPrice)
        })),
        subtotal: sale.subtotal,
        discountAmount: sale.discount || 0,
        taxAmount: sale.tax || 0,
        grandTotal: sale.grandTotal,
        paymentMethod: (sale.paymentMethod === 'MPESA' ? 'M-PESA' : sale.paymentMethod === 'CARD' ? 'CREDIT_CARD' : 'CASH'),
        paymentReference: sale.paymentReference,
        cashierId: sale.cashierId || user?.id,
        cashierName: sale.cashierName || user?.name || 'Cashier',
        issuedAt: sale.date || new Date().toISOString(),
        isReprint: false,
        reprintCount: 0,
        status: 'ISSUED',
        createdAt: sale.date || new Date().toISOString()
      };
      setSelectedReceipt(fallbackReceipt);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error('Failed to open receipt:', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/pos/products', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(newProductForm)
      });
      if (res.ok) {
        setShowAddProductModal(false);
        fetchProductsAndSales();
        setNewProductForm({
          sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          barcode: '',
          name: '',
          category: 'General Goods',
          costPrice: 100,
          sellingPrice: 150,
          wholesalePrice: 130,
          quantityInStock: 50,
          minStockAlert: 5,
          unit: 'pcs',
          authorOrBrand: '',
          isbnOrCode: '',
          status: 'ACTIVE'
        });
      }
    } catch (err) {
      console.error('Product add error:', err);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery)) ||
      (p.authorOrBrand && p.authorOrBrand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
          <button
            onClick={fetchProductsAndSales}
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {warningMessage && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* POS Grid: Catalog on Left, Live Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selection (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Scan barcode or type product name / SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map(product => {
              const displayPrice = saleType === 'WHOLESALE' && product.wholesalePrice ? product.wholesalePrice : product.sellingPrice;
              const isLowStock = product.quantityInStock <= product.minStockAlert;
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`p-4 bg-white border rounded-xl cursor-pointer hover:shadow-md transition flex flex-col justify-between ${
                    product.quantityInStock === 0 ? 'opacity-50 pointer-events-none' : 'border-gray-200 hover:border-blue-500'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-gray-400">{product.sku}</span>
                      {isLowStock && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mt-1 line-clamp-2">{product.name}</h4>
                    {product.authorOrBrand && (
                      <p className="text-xs text-gray-500 mt-0.5">{product.authorOrBrand}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-600">
                      {currencySymbol} {displayPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.quantityInStock} {product.unit}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-3 bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                No products found. Click "Add Stock Item" to add your inventory.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Register / Cart (1/3) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between h-fit space-y-4">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Current Order ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto mt-2">
              {cart.map(item => (
                <div key={item.productId} className="py-3 flex justify-between items-center">
                  <div className="flex-1 pr-2">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      {currencySymbol} {item.unitPrice.toLocaleString()} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 text-xs font-semibold text-gray-900 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-bold text-gray-900 min-w-16 text-right">
                      {currencySymbol} {item.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">
                  Cart is empty. Click any item on the left to add to bill.
                </div>
              )}
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{currencySymbol} {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>-{currencySymbol} {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total Payable:</span>
              <span className="text-blue-600">{currencySymbol} {grandTotal.toLocaleString()}</span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setShowCheckoutModal(true)}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT REGISTER SALES & UNIVERSAL RECEIPT CENTER */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-base">Recent Register Sales &amp; Thermal Receipts</h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Click any receipt to preview, print directly to ESC/POS thermal printer, or issue official reprint
          </span>
        </div>

        {salesHistory.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            No completed sales in this session yet. Completed transactions generate receipts automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-600 font-medium">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items Sold</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3 text-right">Receipt Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salesHistory.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-700">
                      <button
                        onClick={() => openReceiptForSale(sale)}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{sale.receiptNo}</span>
                      </button>
                    </td>
                    <td className="p-3 text-gray-500">{new Date(sale.date || sale.createdAt).toLocaleTimeString()}</td>
                    <td className="p-3 text-gray-800 font-medium">{sale.customerName || 'Walk-in'}</td>
                    <td className="p-3 text-gray-600">
                      {sale.items.length} item(s) ({sale.items.reduce((s, i) => s + i.quantity, 0)} units)
                    </td>
                    <td className="p-3">
                      <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      {currencySymbol} {sale.grandTotal.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openReceiptForSale(sale)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 shadow-2xs"
                        >
                          <Eye className="w-3 h-3 text-sky-600" />
                          <span>View Slip</span>
                        </button>
                        <button
                          onClick={() => openReceiptForSale(sale)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <Printer className="w-3 h-3 text-emerald-600" />
                          <span>Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-bold text-gray-900">Complete Payment</h3>
              <span className="text-lg font-bold text-emerald-600">{currencySymbol} {grandTotal.toLocaleString()}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { id: 'MPESA', label: 'M-Pesa', icon: Banknote },
                    { id: 'CASH', label: 'Cash', icon: DollarSign },
                    { id: 'CARD', label: 'Card', icon: CreditCard }
                  ].map(mode => {
                    const Icon = mode.icon;
                    return (
                      <button
                        type="button"
                        key={mode.id}
                        onClick={() => setPaymentMethod(mode.id as any)}
                        className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1 transition ${
                          paymentMethod === mode.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Payment Ref / Receipt Code</label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone (for receipt SMS)</label>
                  <input
                    type="text"
                    placeholder="+254 700 000 000"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Apply Discount ({currencySymbol})</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow transition"
                >
                  Finalize & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">Add Stock Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">SKU / Item Code</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.sku}
                    onChange={e => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Barcode / ISBN</label>
                  <input
                    type="text"
                    placeholder="Optional barcode"
                    value={newProductForm.barcode}
                    onChange={e => setNewProductForm({ ...newProductForm, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Basmati Rice 5kg"
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.category}
                    onChange={e => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.unit}
                    onChange={e => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Cost Price</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.costPrice}
                    onChange={e => setNewProductForm({ ...newProductForm, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Retail Price</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.sellingPrice}
                    onChange={e => setNewProductForm({ ...newProductForm, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Wholesale Price</label>
                  <input
                    type="number"
                    value={newProductForm.wholesalePrice}
                    onChange={e => setNewProductForm({ ...newProductForm, wholesalePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Quantity in Stock</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.quantityInStock}
                    onChange={e => setNewProductForm({ ...newProductForm, quantityInStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Min Alert Quantity</label>
                  <input
                    type="number"
                    value={newProductForm.minStockAlert}
                    onChange={e => setNewProductForm({ ...newProductForm, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIVERSAL RECEIPT & THERMAL PRINT MODAL */}
      <UniversalReceiptModal
        isOpen={isReceiptModalOpen}
        receipt={selectedReceipt}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceipt(null);
        }}
        onReprint={(updatedReceipt) => {
          setSelectedReceipt(updatedReceipt);
        }}
      />
    </div>
  );
};
