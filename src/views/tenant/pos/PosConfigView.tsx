import React, { useState } from 'react';
import { 
  Sliders, Save, CheckCircle2, Store, UtensilsCrossed, 
  Wine, Hotel, Layers, ShieldCheck, Tag, Barcode, DollarSign,
  Coffee, ShoppingCart, BookOpen, Wrench, Pill, Sparkles
} from 'lucide-react';
import { PosTenantConfig, PosBusinessType } from '../../../types';

interface PosConfigViewProps {
  config: PosTenantConfig | null;
  onUpdateConfig: (updated: Partial<PosTenantConfig>) => Promise<void>;
  currencySymbol: string;
}

const BUSINESS_TYPE_PRESETS: Record<string, {
  type: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultFeatures: any;
}> = {
  GENERAL_RETAIL: {
    type: 'GENERAL_RETAIL',
    label: 'General Retail Store',
    desc: 'Standard counter sales, barcode scanning, stock tracking and receipts',
    icon: Store,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: false,
      clothingAttributes: false,
      batchesAndExpiry: false,
      multiBranch: false,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: false,
      kitchenTickets: false,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: false
    }
  },
  SUPERMARKET: {
    type: 'SUPERMARKET',
    label: 'Supermarket / Minimart',
    desc: 'High-speed barcode scanning, multi-tills, fast cashier shifts, and bulk inventory',
    icon: ShoppingCart,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: false,
      clothingAttributes: false,
      batchesAndExpiry: true,
      multiBranch: true,
      purchasingAndGRN: true,
      customerCredit: false,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: false,
      kitchenTickets: false,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: false
    }
  },
  BOUTIQUE_MITUMBA: {
    type: 'BOUTIQUE_MITUMBA',
    label: 'Boutique & Mitumba (Clothing)',
    desc: 'Sizes (S/M/L/XL), colors, bale/bale-grade tracking, garment condition & unique tags',
    icon: Tag,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: true,
      clothingAttributes: true,
      batchesAndExpiry: false,
      multiBranch: false,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: false,
      kitchenTickets: false,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: false
    }
  },
  RESTAURANT_CAFE: {
    type: 'RESTAURANT_CAFE',
    label: 'Restaurant & Cafe',
    desc: 'Dine-in table floor plans, Kitchen Display System (KDS) tickets, food modifiers',
    icon: UtensilsCrossed,
    defaultFeatures: {
      barcodeScanning: false,
      variantsAndSizes: true,
      clothingAttributes: false,
      batchesAndExpiry: false,
      multiBranch: false,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: true,
      kitchenTickets: true,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: false
    }
  },
  BAR_LOUNGE: {
    type: 'BAR_LOUNGE',
    label: 'Bar & Lounge',
    desc: 'Open running customer tabs, bottle vs shot pricing, quick drink orders, cashier shifts',
    icon: Wine,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: true,
      clothingAttributes: false,
      batchesAndExpiry: false,
      multiBranch: false,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: false,
      restaurantTables: true,
      kitchenTickets: false,
      barTabs: true,
      hotelRooms: false,
      wholesalePricing: false
    }
  },
  HOTEL_ACCOMMODATION: {
    type: 'HOTEL_ACCOMMODATION',
    label: 'Hotel & Lodging',
    desc: 'Room bookings, check-in/out, folio guest charges (dining/laundry/spa) & bills',
    icon: Hotel,
    defaultFeatures: {
      barcodeScanning: false,
      variantsAndSizes: false,
      clothingAttributes: false,
      batchesAndExpiry: false,
      multiBranch: false,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: true,
      kitchenTickets: true,
      barTabs: true,
      hotelRooms: true,
      wholesalePricing: false
    }
  },
  HARDWARE_STORE: {
    type: 'HARDWARE_STORE',
    label: 'Hardware & Building Supplies',
    desc: 'Units (bags, pieces, meters, kg), trade credit, delivery dispatches & volume pricing',
    icon: Wrench,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: true,
      clothingAttributes: false,
      batchesAndExpiry: false,
      multiBranch: true,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: false,
      kitchenTickets: false,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: true
    }
  },
  ELECTRONICS_SHOP: {
    type: 'ELECTRONICS_SHOP',
    label: 'Electronics & Gadgets',
    desc: 'Serial number/IMEI tracking, warranty periods, accessories and model specs',
    icon: Sparkles,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: true,
      clothingAttributes: false,
      batchesAndExpiry: false,
      multiBranch: true,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: false,
      kitchenTickets: false,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: false
    }
  },
  PHARMACY_CHEMIST: {
    type: 'PHARMACY_CHEMIST',
    label: 'Pharmacy / Chemist',
    desc: 'Batch numbers, expiry date control, dosage instructions & generic alternatives',
    icon: Pill,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: false,
      clothingAttributes: false,
      batchesAndExpiry: true,
      multiBranch: false,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: false,
      kitchenTickets: false,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: false
    }
  },
  WHOLESALE_DISTRIBUTOR: {
    type: 'WHOLESALE_DISTRIBUTOR',
    label: 'Wholesale & Distribution',
    desc: 'Tiered wholesale pricing, cartons/crates, credit terms and multi-warehouse routing',
    icon: BookOpen,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: true,
      clothingAttributes: false,
      batchesAndExpiry: true,
      multiBranch: true,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: false,
      kitchenTickets: false,
      barTabs: false,
      hotelRooms: false,
      wholesalePricing: true
    }
  },
  MIXED_ENTERPRISE: {
    type: 'MIXED_ENTERPRISE',
    label: 'Universal / Mixed Enterprise (All Features)',
    desc: 'All capabilities enabled: Retail + Restaurant + Bar + Hotel + Wholesale + Credit',
    icon: Layers,
    defaultFeatures: {
      barcodeScanning: true,
      variantsAndSizes: true,
      clothingAttributes: true,
      batchesAndExpiry: true,
      multiBranch: true,
      purchasingAndGRN: true,
      customerCredit: true,
      cashierShifts: true,
      discountsAndPromos: true,
      returnsAndRefunds: true,
      restaurantTables: true,
      kitchenTickets: true,
      barTabs: true,
      hotelRooms: true,
      wholesalePricing: true
    }
  }
};

export const PosConfigView: React.FC<PosConfigViewProps> = ({
  config,
  onUpdateConfig,
  currencySymbol
}) => {
  const [businessType, setBusinessType] = useState<PosBusinessType>(
    config?.businessType || 'GENERAL_RETAIL'
  );
  const [features, setFeatures] = useState(
    config?.enabledFeatures || BUSINESS_TYPE_PRESETS.GENERAL_RETAIL.defaultFeatures
  );
  const [taxRate, setTaxRate] = useState(config?.taxRate ?? 16);
  const [taxInclusive, setTaxInclusive] = useState(config?.taxInclusive ?? true);
  const [currency, setCurrency] = useState(config?.currency || currencySymbol);
  const [receiptHeader, setReceiptHeader] = useState(config?.receiptHeader || '');
  const [receiptFooter, setReceiptFooter] = useState(config?.receiptFooter || 'Thank you for shopping with us!');
  const [mpesaTillNumber, setMpesaTillNumber] = useState(config?.mpesaTillNumber || '');
  const [mpesaPaybillNumber, setMpesaPaybillNumber] = useState(config?.mpesaPaybillNumber || '');
  const [mpesaAccountReference, setMpesaAccountReference] = useState(config?.mpesaAccountReference || '');
  const [requireShiftToSell, setRequireShiftToSell] = useState(config?.requireShiftToSell ?? false);
  const [allowNegativeStock, setAllowNegativeStock] = useState(config?.allowNegativeStock ?? false);
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApplyPreset = (type: PosBusinessType) => {
    const preset = BUSINESS_TYPE_PRESETS[type];
    if (preset) {
      setBusinessType(type);
      setFeatures({ ...preset.defaultFeatures });
    }
  };

  const handleToggleFeature = (key: string) => {
    setFeatures((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateConfig({
        businessType,
        enabledFeatures: features,
        taxRate: Number(taxRate),
        taxInclusive,
        currency,
        receiptHeader,
        receiptFooter,
        mpesaTillNumber,
        mpesaPaybillNumber,
        mpesaAccountReference,
        requireShiftToSell,
        allowNegativeStock
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      {/* Header info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Universal POS Engine Configuration
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select your business profile to auto-configure optimal settings or toggle specific feature modules tailored for your operations.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            {saving ? (
              <span>Saving...</span>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Profiles Grid */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          1. Select Primary Business Profile
        </h3>
        <p className="text-xs text-slate-500">
          Choosing a profile sets recommended defaults. You can still toggle individual features below at any time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(BUSINESS_TYPE_PRESETS).map((preset) => {
            const Icon = preset.icon;
            const isSelected = businessType === preset.type;
            return (
              <button
                type="button"
                key={preset.type}
                onClick={() => handleApplyPreset(preset.type as PosBusinessType)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                        Active Profile
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{preset.label}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{preset.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Feature Toggles */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          2. Enabled Feature Modules
        </h3>
        <p className="text-xs text-slate-500">
          Control which operational tabs, fields, and subsystems appear across the Universal POS for staff and managers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              key: 'barcodeScanning' as const,
              label: 'Barcode & SKU Scanning',
              desc: 'Enables instant camera/hardware barcode scanner lookup in checkout'
            },
            {
              key: 'clothingAttributes' as const,
              label: 'Clothing, Boutique & Mitumba Details',
              desc: 'Enables size, color, bale grade (Grade 1/2/Creme), and garment condition'
            },
            {
              key: 'variantsAndSizes' as const,
              label: 'Product Variants & Sizes',
              desc: 'Allows multiple size/color/flavor child variants per parent product'
            },
            {
              key: 'batchesAndExpiry' as const,
              label: 'Batch Numbers & Expiry Dates',
              desc: 'Enables medicine/food expiry date tracking and low-shelf-life alerts'
            },
            {
              key: 'restaurantTables' as const,
              label: 'Restaurant Tables & Floor Plan',
              desc: 'Interactive table management with guest counts, status and orders'
            },
            {
              key: 'kitchenTickets' as const,
              label: 'Kitchen Display System (KDS)',
              desc: 'Sends food and drink orders directly to the kitchen preparation screen'
            },
            {
              key: 'barTabs' as const,
              label: 'Bar Tabs & Running Drink Bills',
              desc: 'Enables opening, adding drinks, and closing customer bar tabs'
            },
            {
              key: 'hotelRooms' as const,
              label: 'Hotel Rooms & Guest Folio Billing',
              desc: 'Enables room check-in/out and charging POS food/drinks to guest room folios'
            },
            {
              key: 'wholesalePricing' as const,
              label: 'Wholesale & Volume Pricing',
              desc: 'Enables wholesale tier prices, bulk cartons and min wholesale quantities'
            },
            {
              key: 'purchasingAndGRN' as const,
              label: 'Purchasing & Goods Received Notes (GRN)',
              desc: 'Manage supplier purchase orders, stock receipts, and supplier ledgers'
            },
            {
              key: 'customerCredit' as const,
              label: 'Customer Credit & Accounts (Pay Later)',
              desc: 'Track customer balances, credit limits, and credit repayments'
            },
            {
              key: 'cashierShifts' as const,
              label: 'Cashier Shifts & Float Reconciliation',
              desc: 'Track opening float, cash drawer counts, shift sales, and discrepancies'
            },
            {
              key: 'discountsAndPromos' as const,
              label: 'Discounts & Price Overrides',
              desc: 'Allow item-level or order-level flat and percentage discounts'
            },
            {
              key: 'returnsAndRefunds' as const,
              label: 'Sale Returns & Refunds',
              desc: 'Process customer returns with automatic stock restoration and credit notes'
            },
            {
              key: 'multiBranch' as const,
              label: 'Multi-Branch & Warehouses',
              desc: 'Track stock across multiple branch stores and central warehouses'
            }
          ].map(({ key, label, desc }) => {
            const isChecked = features[key];
            return (
              <label
                key={key}
                className={`p-4 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                  isChecked
                    ? 'border-indigo-200 bg-indigo-50/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="pr-4">
                  <div className="font-semibold text-slate-900 text-sm">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleFeature(key)}
                  className="mt-1 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Tax, Payment & Receipts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax & Operational Policies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Tax & Register Rules
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Standard VAT Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={taxInclusive}
                onChange={(e) => setTaxInclusive(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <div>
                <div className="text-sm font-medium text-slate-800">Prices are Tax-Inclusive (VAT Included)</div>
                <div className="text-xs text-slate-500">Displayed shelf price already includes VAT</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireShiftToSell}
                onChange={(e) => setRequireShiftToSell(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <div>
                <div className="text-sm font-medium text-slate-800">Require Active Cashier Shift</div>
                <div className="text-xs text-slate-500">Cashier must open a shift with float before checkout</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowNegativeStock}
                onChange={(e) => setAllowNegativeStock(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <div>
                <div className="text-sm font-medium text-slate-800">Allow Negative Inventory Selling</div>
                <div className="text-xs text-slate-500">Permit checkout even if recorded stock quantity is zero</div>
              </div>
            </label>
          </div>
        </div>

        {/* M-Pesa & Payment Integrations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            M-Pesa & Payment Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              M-Pesa Buy Goods Till Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 522123"
              value={mpesaTillNumber}
              onChange={(e) => setMpesaTillNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              M-Pesa Paybill Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 400222"
              value={mpesaPaybillNumber}
              onChange={(e) => setMpesaPaybillNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Paybill Account Reference
            </label>
            <input
              type="text"
              placeholder="e.g. SHOP / INVOICE"
              value={mpesaAccountReference}
              onChange={(e) => setMpesaAccountReference(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Receipt Customization */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          3. Printed Thermal Receipt Customization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt Header Notes (appears under store name)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Main Branch, Kenyatta Avenue | Tel: +254 700 000000 | PIN: P051234567A"
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Receipt Footer Note (appears at bottom)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Goods once sold are not returnable without original receipt within 7 days."
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Apply & Save POS Configuration'}</span>
        </button>
      </div>
    </form>
  );
};
