import React, { useState } from 'react';
import { 
  Package, Plus, Search, Filter, AlertTriangle, 
  Barcode, Tag, CheckCircle2, Edit3, Trash2, 
  ArrowUpRight, ArrowDownRight, Layers, RefreshCw, Printer, X
} from 'lucide-react';
import { PosProduct, PosTenantConfig, Warehouse, Branch, InventoryMovement } from '../../../types';

interface PosInventoryManagerProps {
  products: PosProduct[];
  warehouses: Warehouse[];
  branches: Branch[];
  movements: InventoryMovement[];
  config: PosTenantConfig | null;
  currencySymbol: string;
  onAddProduct: (productData: any) => Promise<void>;
  onUpdateProduct: (id: string, productData: any) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRecordMovement: (movementData: any) => Promise<void>;
  onRefresh: () => void;
}

export const PosInventoryManager: React.FC<PosInventoryManagerProps> = ({
  products,
  warehouses,
  branches,
  movements,
  config,
  currencySymbol,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRecordMovement,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT' | 'EXPIRING'>('ALL');
  const [activeTab, setActiveTab] = useState<'catalog' | 'movements' | 'warehouses'>('catalog');

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<PosProduct | null>(null);
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<PosProduct | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: '',
    name: '',
    category: 'General Goods',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    minWholesaleQty: 5,
    quantityInStock: 10,
    minStockAlert: 5,
    unit: 'pcs',
    size: '',
    color: '',
    gender: 'UNISEX' as 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX',
    clothingCondition: 'BRAND_NEW' as 'BRAND_NEW' | 'GRADE_1' | 'GRADE_2' | 'CREME',
    baleNumber: '',
    batchNumber: '',
    expiryDate: '',
    warehouseId: warehouses[0]?.id || '',
    branchId: branches[0]?.id || '',
    taxRate: 16,
    status: 'ACTIVE' as const
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    movementType: 'RESTOCK' as 'RESTOCK' | 'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUBTRACT' | 'DAMAGE' | 'EXPIRED',
    quantity: 1,
    notes: ''
  });

  const features = config?.enabledFeatures || {
    barcodeScanning: true,
    variantsAndSizes: true,
    clothingAttributes: true,
    batchesAndExpiry: true,
    multiBranch: true,
    wholesalePricing: true
  };

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category || 'General Goods')))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.size && p.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.color && p.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.baleNumber && p.baleNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'LOW') matchesStock = p.quantityInStock > 0 && p.quantityInStock <= p.minStockAlert;
    if (stockFilter === 'OUT') matchesStock = p.quantityInStock <= 0;
    if (stockFilter === 'EXPIRING' && p.expiryDate) {
      const exp = new Date(p.expiryDate).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      matchesStock = exp - Date.now() < thirtyDays;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setProductForm({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: '',
      category: 'General Goods',
      costPrice: 100,
      sellingPrice: 150,
      wholesalePrice: 130,
      minWholesaleQty: 5,
      quantityInStock: 20,
      minStockAlert: 5,
      unit: 'pcs',
      size: '',
      color: '',
      gender: 'UNISEX',
      clothingCondition: 'BRAND_NEW',
      baleNumber: '',
      batchNumber: '',
      expiryDate: '',
      warehouseId: warehouses[0]?.id || '',
      branchId: branches[0]?.id || '',
      taxRate: 16,
      status: 'ACTIVE'
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p: PosProduct) => {
    setEditingProductId(p.id);
    setProductForm({
      sku: p.sku,
      barcode: p.barcode || '',
      name: p.name,
      category: p.category || 'General Goods',
      costPrice: p.costPrice || 0,
      sellingPrice: p.sellingPrice || 0,
      wholesalePrice: p.wholesalePrice || 0,
      minWholesaleQty: p.minWholesaleQty || 5,
      quantityInStock: p.quantityInStock,
      minStockAlert: p.minStockAlert,
      unit: p.unit || 'pcs',
      size: p.size || '',
      color: p.color || '',
      gender: p.gender || 'UNISEX',
      clothingCondition: p.clothingCondition || 'BRAND_NEW',
      baleNumber: p.baleNumber || '',
      batchNumber: p.batchNumber || '',
      expiryDate: p.expiryDate || '',
      warehouseId: p.warehouseId || '',
      branchId: p.branchId || '',
      taxRate: p.taxRate ?? 16,
      status: p.status
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      await onUpdateProduct(editingProductId, productForm);
    } else {
      await onAddProduct(productForm);
    }
    setShowProductModal(false);
  };

  const handleStockAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;

    let qtyDelta = Number(adjustmentForm.quantity);
    if (['DAMAGE', 'EXPIRED', 'ADJUSTMENT_SUBTRACT'].includes(adjustmentForm.movementType)) {
      qtyDelta = -Math.abs(qtyDelta);
    } else {
      qtyDelta = Math.abs(qtyDelta);
    }

    await onRecordMovement({
      productId: selectedProductForStock.id,
      movementType: adjustmentForm.movementType,
      quantityChanged: qtyDelta,
      notes: adjustmentForm.notes || `Manual ${adjustmentForm.movementType} adjustment`
    });

    setShowAdjustStockModal(false);
    setSelectedProductForStock(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subnav */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Inventory, Products & Stock Control
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage product catalog, sizes/colors, Mitumba bale grades, expiry dates, barcodes and multi-warehouse balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'movements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock Audit Movements ({movements.length})
        </button>
      </div>

      {/* CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by Name, SKU, Barcode, Size, Color, Bale #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c}
                  </option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="LOW">Low Stock Alert</option>
                <option value="OUT">Out of Stock (0)</option>
                {features.batchesAndExpiry && <option value="EXPIRING">Expiring within 30 days</option>}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3.5 px-4">Item & SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    {features.clothingAttributes && <th className="py-3.5 px-4">Size / Color / Grade</th>}
                    {features.batchesAndExpiry && <th className="py-3.5 px-4">Batch & Expiry</th>}
                    <th className="py-3.5 px-4 text-right">Cost Price</th>
                    <th className="py-3.5 px-4 text-right">Selling Price</th>
                    {features.wholesalePricing && <th className="py-3.5 px-4 text-right">Wholesale</th>}
                    <th className="py-3.5 px-4 text-center">Stock on Hand</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No products found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click "Add New Product" above to create your first item.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLowStock = p.quantityInStock > 0 && p.quantityInStock <= p.minStockAlert;
                      const isOutOfStock = p.quantityInStock <= 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>SKU: {p.sku}</span>
                              {p.barcode && (
                                <span className="flex items-center gap-0.5 text-indigo-600 font-mono">
                                  <Barcode className="w-3 h-3" />
                                  {p.barcode}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {p.category || 'General'}
                            </span>
                          </td>
                          {features.clothingAttributes && (
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 text-xs">
                                {p.size && (
                                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded">
                                    {p.size}
                                  </span>
                                )}
                                {p.color && (
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                    {p.color}
                                  </span>
                                )}
                                {p.clothingCondition && p.clothingCondition !== 'BRAND_NEW' && (
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-medium">
                                    {p.clothingCondition}
                                  </span>
                                )}
                                {p.baleNumber && (
                                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                                    Bale: {p.baleNumber}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                          {features.batchesAndExpiry && (
                            <td className="py-3.5 px-4 text-xs">
                              {p.batchNumber && <div className="text-slate-700">Batch: {p.batchNumber}</div>}
                              {p.expiryDate && (
                                <div className="text-slate-500">Exp: {p.expiryDate}</div>
                              )}
                              {!p.batchNumber && !p.expiryDate && <span className="text-slate-400">—</span>}
                            </td>
                          )}
                          <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                            {currencySymbol} {Number(p.costPrice || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            {currencySymbol} {Number(p.sellingPrice || 0).toLocaleString()}
                          </td>
                          {features.wholesalePricing && (
                            <td className="py-3.5 px-4 text-right text-xs text-indigo-700 font-medium">
                              {p.wholesalePrice ? (
                                <>
                                  {currencySymbol} {Number(p.wholesalePrice).toLocaleString()}
                                  <div className="text-[10px] text-slate-400">Min: {p.minWholesaleQty || 5}</div>
                                </>
                              ) : (
                                '—'
                              )}
                            </td>
                          )}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isOutOfStock
                                    ? 'bg-rose-100 text-rose-700'
                                    : isLowStock
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {p.quantityInStock} {p.unit || 'pcs'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedProductForStock(p);
                                  setShowAdjustStockModal(true);
                                }}
                                title="Adjust / Restock"
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProductForBarcode(p);
                                  setShowBarcodePrintModal(true);
                                }}
                                title="Print Barcode Tag"
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Barcode className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                title="Edit Product"
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${p.name}"?`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                title="Delete Product"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOVEMENTS AUDIT VIEW */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Real-Time Inventory Movement Ledger</h3>
            <span className="text-xs text-slate-500">Chronological stock entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-right">Change</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.slice(0, 50).map((m) => {
                    const isPositive = m.quantityChanged > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(m.date).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {m.productName}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            m.movementType === 'SALE' 
                              ? 'bg-blue-100 text-blue-700'
                              : m.movementType === 'RESTOCK'
                              ? 'bg-emerald-100 text-emerald-700'
                              : m.movementType === 'DAMAGE' || m.movementType === 'EXPIRED'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.movementType}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? `+${m.quantityChanged}` : m.quantityChanged}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          {m.balanceAfter}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {m.recordedBy || 'System'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {m.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProductId ? 'Edit Product Details' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product / Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Denim Jeans / Panadol Extra / Unga 2kg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="e.g. T-Shirts / Groceries / Drinks"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Barcode / EAN-13
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productForm.barcode}
                      onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                      placeholder="e.g. 616400012345"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}` })}
                      className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium whitespace-nowrap"
                    >
                      Gen Barcode
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost / Buying Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Retail Selling Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                {features.wholesalePricing && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Wholesale Price ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.wholesalePrice}
                      onChange={(e) => setProductForm({ ...productForm, wholesalePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock on Hand *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.quantityInStock}
                    onChange={(e) => setProductForm({ ...productForm, quantityInStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.minStockAlert}
                    onChange={(e) => setProductForm({ ...productForm, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters (L)</option>
                    <option value="pairs">Pairs</option>
                    <option value="cartons">Cartons / Boxes</option>
                    <option value="bottles">Bottles</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>

              {/* Clothing / Boutique Attributes */}
              {features.clothingAttributes && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    Clothing, Boutique & Mitumba Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Size</label>
                      <input
                        type="text"
                        placeholder="e.g. S, M, L, 32, 44"
                        value={productForm.size}
                        onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Color</label>
                      <input
                        type="text"
                        placeholder="e.g. Navy Blue, Floral"
                        value={productForm.color}
                        onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Grade / Condition</label>
                      <select
                        value={productForm.clothingCondition}
                        onChange={(e) => setProductForm({ ...productForm, clothingCondition: e.target.value as any })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="BRAND_NEW">Brand New</option>
                        <option value="CREME">Creme / Grade A</option>
                        <option value="GRADE_1">Grade 1</option>
                        <option value="GRADE_2">Grade 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Bale Number</label>
                      <input
                        type="text"
                        placeholder="e.g. BALE-044"
                        value={productForm.baleNumber}
                        onChange={(e) => setProductForm({ ...productForm, baleNumber: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Batch & Expiry Attributes */}
              {features.batchesAndExpiry && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Batch & Expiry Controls
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Batch Number</label>
                      <input
                        type="text"
                        placeholder="e.g. BATCH-2026-X"
                        value={productForm.batchNumber}
                        onChange={(e) => setProductForm({ ...productForm, batchNumber: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={productForm.expiryDate}
                        onChange={(e) => setProductForm({ ...productForm, expiryDate: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm cursor-pointer"
                >
                  {editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {showAdjustStockModal && selectedProductForStock && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Stock Adjustment: {selectedProductForStock.name}
              </h3>
              <button
                onClick={() => setShowAdjustStockModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 flex justify-between">
              <span>Current Stock on Hand:</span>
              <span className="font-bold text-slate-900">
                {selectedProductForStock.quantityInStock} {selectedProductForStock.unit || 'pcs'}
              </span>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Reason / Type
                </label>
                <select
                  value={adjustmentForm.movementType}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, movementType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="RESTOCK">Restock (Received Stock)</option>
                  <option value="ADJUSTMENT_ADD">Inventory Count Surplus (+)</option>
                  <option value="ADJUSTMENT_SUBTRACT">Inventory Count Shortage (-)</option>
                  <option value="DAMAGE">Damaged / Broken Stock (-)</option>
                  <option value="EXPIRED">Expired Goods (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Changed
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physical stock count audit / Spillage"
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustStockModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Apply Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARCODE TAG PRINT PREVIEW MODAL */}
      {showBarcodePrintModal && selectedProductForBarcode && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Product Tag / Barcode</h3>
              <button
                onClick={() => setShowBarcodePrintModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Tag Card */}
            <div className="border-2 border-dashed border-slate-300 p-4 rounded-xl text-center space-y-2 bg-white">
              <div className="text-xs font-extrabold uppercase text-slate-800">
                {config?.businessName || 'DAVETECH STORE'}
              </div>
              <div className="text-sm font-bold text-slate-900 leading-tight">
                {selectedProductForBarcode.name}
              </div>
              {selectedProductForBarcode.size && (
                <div className="text-xs font-semibold text-indigo-700">
                  Size: {selectedProductForBarcode.size} {selectedProductForBarcode.color ? `| ${selectedProductForBarcode.color}` : ''}
                </div>
              )}
              <div className="py-2 flex flex-col items-center justify-center bg-slate-50 rounded-lg">
                <div className="font-mono text-xl tracking-widest font-black text-slate-900">
                  ||||| | |||| ||| |||| |
                </div>
                <div className="text-[11px] font-mono text-slate-600 tracking-wider">
                  {selectedProductForBarcode.barcode || selectedProductForBarcode.sku}
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">
                {currencySymbol} {Number(selectedProductForBarcode.sellingPrice).toLocaleString()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
