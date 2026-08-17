import React from 'react';
import { 
  ShoppingBag, 
  Barcode, 
  Receipt, 
  CreditCard, 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface RetailSolutionSectionProps {
  onOpenDemoModal: () => void;
}

export const RetailSolutionSection: React.FC<RetailSolutionSectionProps> = ({
  onOpenDemoModal
}) => {
  const retailFeatures = [
    { title: 'Touch POS Terminal', desc: 'Lightning-fast counter checkouts with keyboard shortcuts and touchscreen support.' },
    { title: 'Barcode Scanning', desc: 'Instant barcode lookup via wireless or USB laser scanners.' },
    { title: 'Multi-Tender Payments', desc: 'Accept Cash, M-Pesa STK Push, Credit Cards, Split Payments, and Store Credits.' },
    { title: 'Thermal Receipts', desc: '58mm/80mm ESC/POS receipt printing with customized business logos and tax PIN.' },
    { title: 'Stock & Inventory', desc: 'Live deduction on checkout with automatic low-stock reorder warnings.' },
    { title: 'Purchasing & Suppliers', desc: 'Purchase orders, supplier invoices, goods received notes (GRN), and payment terms.' },
    { title: 'Customers & Loyalty', desc: 'Customer phone registry, credit limit controls, and purchasing history.' },
    { title: 'Shift Balancing', desc: 'Opening cash drawer declaration, intermediate drops, and end-of-day X/Z reports.' }
  ];

  return (
    <section id="retail-showcase" className="py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Retail, Supermarkets & Wholesale</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
              RETAIL & POS MANAGEMENT
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              High-speed counter checkouts, synchronized multi-store inventory, automated supplier purchasing, and customer loyalty built directly into your unified ERP.
            </p>
          </div>

          <div>
            <button
              onClick={onOpenDemoModal}
              className="px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-all flex items-center space-x-2 whitespace-nowrap"
            >
              <span>Book POS Terminal Demo</span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Interactive POS Terminal Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* POS Terminal Visual Screen */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl bg-slate-950 p-4 sm:p-5 border border-slate-800 shadow-2xl text-white space-y-4">
              
              {/* POS Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-extrabold text-white">POS Register #01</span>
                  <span className="text-slate-400 font-mono text-[11px]">• Shift: Main Counter</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  Online Sync
                </span>
              </div>

              {/* Sample Cart Table */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Current Cart (3 Items)</span>
                  <span className="text-slate-500 font-mono">Receipt #ORD-8492</span>
                </div>

                <div className="divide-y divide-slate-800 text-xs">
                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Davetech Premium Executive Diary 2026</div>
                      <div className="text-[11px] text-slate-400">1 x KES 1,200 (SKU: BKS-001)</div>
                    </div>
                    <span className="font-mono font-bold text-white">KES 1,200</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Wireless Bluetooth Laser Barcode Scanner</div>
                      <div className="text-[11px] text-slate-400">1 x KES 4,500 (SKU: POS-991)</div>
                    </div>
                    <span className="font-mono font-bold text-white">KES 4,500</span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Thermal Printing Rolls 80mm (Box of 10)</div>
                      <div className="text-[11px] text-slate-400">2 x KES 850 (SKU: STR-102)</div>
                    </div>
                    <span className="font-mono font-bold text-white">KES 1,700</span>
                  </div>
                </div>

                {/* Total Calculations */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">Subtotal: KES 6,379.31 | VAT (16%): KES 1,020.69</div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Payable</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">KES 7,400.00</div>
                  </div>
                </div>
              </div>

              {/* Payment Tender Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex flex-col items-center justify-center space-y-1">
                  <Smartphone className="w-4 h-4" />
                  <span>M-Pesa STK</span>
                </button>
                <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex flex-col items-center justify-center space-y-1 border border-slate-700">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>Cash Drawer</span>
                </button>
                <button className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex flex-col items-center justify-center space-y-1 border border-slate-700">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Card POS</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right: Retail Capabilities List */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              One Unified Commerce Engine for Counters & Warehouses
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Say goodbye to disconnected cash registers. With Davetech ERP, every transaction at the counter automatically updates your central stock, records accounting revenue journals, and attributes sales rep performance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {retailFeatures.map((feat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h4 className="font-extrabold text-xs text-slate-900">{feat.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal pl-6">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
