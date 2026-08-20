import React, { useState } from 'react';
import { 
  Settings, Store, Tag, UtensilsCrossed, Wine, 
  Hotel, Save, CheckCircle2, ShieldAlert, Sliders,
  Receipt, Building, Smartphone, FileText, Check
} from 'lucide-react';
import { PosTenantConfig, PosBusinessType, BusinessType } from '../../../types';

interface PosSettingsManagerProps {
  config: PosTenantConfig | null;
  currencySymbol: string;
  onSaveConfig: (updatedConfig: Partial<PosTenantConfig>) => Promise<void>;
}

export const PosSettingsManager: React.FC<PosSettingsManagerProps> = ({
  config,
  currencySymbol,
  onSaveConfig
}) => {
  const [formData, setFormData] = useState<PosTenantConfig>(
    config || {
      id: 'cfg-1',
      tenantId: 'tenant-1',
      businessType: 'RETAIL',
      businessName: 'Davetech Retail POS',
      tagline: 'Quality Goods & Reliable Service',
      phone: '0700000000',
      email: 'pos@davetech.co.ke',
      address: 'Biashara Street, Nairobi',
      taxRate: 16,
      taxEnabled: true,
      kraPin: 'P051234567Z',
      receiptHeader: 'THANK YOU FOR SHOPPING WITH US',
      receiptFooter: 'Goods once sold are only returnable within 48hrs with receipt.',
      currency: 'KES',
      currencySymbol: 'KES',
      receiptWidth: '80mm',
      allowNegativeStock: false,
      allowDiscounts: true,
      requireShiftToSell: false,
      enabledFeatures: {
        barcodeScanning: true,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: false,
        restaurantTables: false,
        kitchenTickets: false,
        barTabs: false,
        hotelRooms: false,
        multiBranch: true,
        wholesalePricing: true,
        customerCredit: true,
        promotionsAndDiscounts: true
      },
      updatedAt: new Date().toISOString()
    }
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const businessTypePresets: {
    type: PosBusinessType;
    label: string;
    description: string;
    features: any;
  }[] = [
    {
      type: 'GENERAL_RETAIL',
      label: 'General Retail / Minimart',
      description: 'Standard retail counter with barcode scanning, quick keys and M-Pesa checkout',
      features: {
        barcodeScanning: true,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: false,
        restaurantTables: false,
        kitchenTickets: false,
        barTabs: false,
        hotelRooms: false,
        multiBranch: true,
        wholesalePricing: true,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'SUPERMARKET',
      label: 'Supermarket / Hypermarket',
      description: 'High-speed barcode checkout, multiple cashier registers, batches, expiry alerts & wholesale pricing',
      features: {
        barcodeScanning: true,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: true,
        restaurantTables: false,
        kitchenTickets: false,
        barTabs: false,
        hotelRooms: false,
        multiBranch: true,
        wholesalePricing: true,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'BOUTIQUE',
      label: 'Mitumba / Clothing Boutique',
      description: 'Sizes (S/M/L/XL), colors, bale numbers, and garment condition grading (Creme/Grade 1/2)',
      features: {
        barcodeScanning: true,
        variantsAndSizes: true,
        clothingAttributes: true,
        batchesAndExpiry: false,
        restaurantTables: false,
        kitchenTickets: false,
        barTabs: false,
        hotelRooms: false,
        multiBranch: true,
        wholesalePricing: false,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'RESTAURANT_CAFE',
      label: 'Restaurant & Cafe',
      description: 'Floor dining tables, Kitchen Display System (KDS), waiter station orders & split bills',
      features: {
        barcodeScanning: false,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: false,
        restaurantTables: true,
        kitchenTickets: true,
        barTabs: false,
        hotelRooms: false,
        multiBranch: false,
        wholesalePricing: false,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'BAR_LOUNGE',
      label: 'Bar, Lounge & Club',
      description: 'Open customer drink tabs, fast drinks counter, bottle/tot measurements and night shift cash floats',
      features: {
        barcodeScanning: false,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: false,
        restaurantTables: true,
        kitchenTickets: false,
        barTabs: true,
        hotelRooms: false,
        multiBranch: false,
        wholesalePricing: false,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'HOTEL_LODGE',
      label: 'Hotel, Resort & Lodging',
      description: 'Room check-in/out, night rates, restaurant/bar folio charges billed to room accounts',
      features: {
        barcodeScanning: false,
        variantsAndSizes: false,
        clothingAttributes: false,
        batchesAndExpiry: false,
        restaurantTables: true,
        kitchenTickets: true,
        barTabs: true,
        hotelRooms: true,
        multiBranch: true,
        wholesalePricing: false,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'PHARMACY',
      label: 'Pharmacy / Chemist',
      description: 'Drug batch tracking, strict expiry date warnings, unit dosages and prescription customer accounts',
      features: {
        barcodeScanning: true,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: true,
        restaurantTables: false,
        kitchenTickets: false,
        barTabs: false,
        hotelRooms: false,
        multiBranch: true,
        wholesalePricing: true,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'HARDWARE',
      label: 'Hardware & Electronics',
      description: 'Serial numbers, multi-warehouse stock balances, builder trade credit & wholesale quotations',
      features: {
        barcodeScanning: true,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: false,
        restaurantTables: false,
        kitchenTickets: false,
        barTabs: false,
        hotelRooms: false,
        multiBranch: true,
        wholesalePricing: true,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    },
    {
      type: 'WHOLESALE',
      label: 'Wholesaler & Distributor',
      description: 'Bulk carton pricing, minimum order quantities, supplier purchase orders and sales reps credit',
      features: {
        barcodeScanning: true,
        variantsAndSizes: true,
        clothingAttributes: false,
        batchesAndExpiry: true,
        restaurantTables: false,
        kitchenTickets: false,
        barTabs: false,
        hotelRooms: false,
        multiBranch: true,
        wholesalePricing: true,
        customerCredit: true,
        promotionsAndDiscounts: true
      }
    }
  ];

  const applyPreset = (preset: typeof businessTypePresets[0]) => {
    setFormData({
      ...formData,
      businessType: preset.type,
      enabledFeatures: { ...preset.features }
    });
  };

  const handleToggleFeature = (key: keyof PosTenantConfig['enabledFeatures']) => {
    setFormData({
      ...formData,
      enabledFeatures: {
        ...formData.enabledFeatures,
        [key]: !formData.enabledFeatures[key]
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Universal POS & Business Configuration
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure business preset mode, customize thermal receipts, toggle hospitality/mitumba features and set tax compliance.
          </p>
        </div>

        <div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. BUSINESS PRESET SWITCHER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                1. Select Business Model Preset
              </h3>
              <p className="text-xs text-slate-500">
                Instantly reconfigures the POS layout, menu tabs and workflow for your exact business type.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              Current: {formData.businessType}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {businessTypePresets.map((preset) => {
              const isSelected = formData.businessType === preset.type;
              return (
                <button
                  type="button"
                  key={preset.type}
                  onClick={() => applyPreset(preset)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{preset.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{preset.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. FEATURE TOGGLES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              2. Granular POS Feature Toggles
            </h3>
            <p className="text-xs text-slate-500">
              Enable or disable specific modules and controls to match your shop's operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { key: 'barcodeScanning', label: 'Barcode Scanner Support', desc: 'Allow scanning barcodes & generating printable tags' },
              { key: 'clothingAttributes', label: 'Mitumba / Boutique Clothes', desc: 'Size, Color, Bale #, Condition (Creme/Grade 1)' },
              { key: 'batchesAndExpiry', label: 'Batches & Expiry Alerts', desc: 'Track batch numbers and expiration dates for drugs & food' },
              { key: 'restaurantTables', label: 'Restaurant Dining Tables', desc: 'Interactive floor plan, table reservations & bill split' },
              { key: 'kitchenTickets', label: 'Kitchen Display System (KDS)', desc: 'Live chef orders queue and station tickets' },
              { key: 'barTabs', label: 'Bar & Lounge Tabs', desc: 'Open running customer drink tabs' },
              { key: 'hotelRooms', label: 'Hotel Rooms & Folio Billing', desc: 'Guest check-in, room charges & lodging billing' },
              { key: 'multiBranch', label: 'Multi-Warehouse & Branches', desc: 'Manage stock across different locations and stores' },
              { key: 'wholesalePricing', label: 'Wholesale Tier Pricing', desc: 'Special bulk unit pricing with minimum quantities' },
              { key: 'customerCredit', label: 'Customer Credit Accounts', desc: 'Sell on credit (Pay Later) and manage customer debts' },
              { key: 'promotionsAndDiscounts', label: 'Discounts & Custom Price', desc: 'Allow cashiers to apply percentage / cash discounts' },
            ].map((f) => {
              const enabled = (formData.enabledFeatures as any)[f.key];
              return (
                <div
                  key={f.key}
                  onClick={() => handleToggleFeature(f.key as any)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    enabled ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/50 opacity-70'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => {}}
                    className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{f.label}</div>
                    <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. BUSINESS PROFILE & TAX / ETR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              3. Business Profile & KRA Tax Compliance
            </h3>
            <p className="text-xs text-slate-500">
              Details printed on customer receipts and audit reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address / City *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">KRA PIN Number</label>
              <input
                type="text"
                placeholder="e.g. P051234567Z"
                value={formData.kraPin}
                onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard VAT Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code & Symbol</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="KES"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
                />
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="KES"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. RECEIPT CUSTOMIZATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              4. Thermal Printer & Receipt Layout
            </h3>
            <p className="text-xs text-slate-500">
              Customize receipt width and disclaimer message.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Paper Width</label>
              <select
                value={formData.receiptWidth}
                onChange={(e) => setFormData({ ...formData, receiptWidth: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="80mm">80mm Standard POS Thermal Paper</option>
                <option value="58mm">58mm Compact POS Thermal Paper</option>
                <option value="A4">A4 Full Page Invoices</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Header Greeting</label>
              <input
                type="text"
                value={formData.receiptHeader}
                onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Footer Disclaimer / Terms</label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Apply POS Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
