import { ModuleId } from '../types';

export interface ModuleFeatureDetail {
  title: string;
  description: string;
  highlight?: string;
}

export interface DavetechModuleDetail {
  id: ModuleId;
  name: string;
  badge: string;
  tagline: string;
  category: 'Industry Specific' | 'Core Enterprise' | 'Specialized';
  industry: string;
  iconName: string;
  color: string;
  gradient: string;
  shortDescription: string;
  longDescription: string;
  keyFeatures: ModuleFeatureDetail[];
  targetAudience: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  workflows: string[];
  samplePath: string;
}

export const DAVETECH_MODULES_DETAILS: DavetechModuleDetail[] = [
  {
    id: 'education',
    name: 'Education / School & TVET ERP',
    badge: 'Higher Ed, TVET & K-12',
    tagline: 'All-in-one Campus & Academic Administration System',
    category: 'Industry Specific',
    industry: 'Education & Higher Learning',
    iconName: 'GraduationCap',
    color: '#1D53D9',
    gradient: 'from-blue-600 to-indigo-700',
    shortDescription: 'Complete institutional automation from online student applications to fee collection, curriculum grading, timetables, and multi-campus sync.',
    longDescription: 'Engineered specifically for Universities, TVET Colleges, Polytechnics, Vocational Centers, and Schools. Davetech Education ERP streamlines student lifecycles, automates fee reconciliations via M-Pesa STK push, handles CBC & semester grading, and delivers real-time student portals.',
    keyFeatures: [
      {
        title: 'Online Admissions & Student Information System (SIS)',
        description: 'Self-service public application portal with instant intake tracking, document upload, student bio-data, and automatic admission letter generation.',
        highlight: 'Zero Paper Admissions'
      },
      {
        title: 'Automated Fee Management & M-Pesa STK Integration',
        description: 'Instant mobile money fee payments, automated student ledger balancing, fee structure templates, and overdue fee SMS/email reminders.',
        highlight: 'Real-time Payment Sync'
      },
      {
        title: 'Curriculum, Exam Grading & Digital Transcripts',
        description: 'Flexible grading scales (CBC, TVET KNEC, GPA, Marks), exam entry, performance analytics, and tamper-proof digital transcripts.',
        highlight: 'Automated Transcripts'
      },
      {
        title: 'Multi-Campus & Faculty Department Coordination',
        description: 'Manage main and satellite campuses, faculty departments, lecturer unit allocations, and shared resources in one unified database.',
        highlight: 'Multi-Campus Ready'
      }
    ],
    targetAudience: ['Universities & Colleges', 'TVET & Technical Institutes', 'Vocational Training Centers', 'High Schools & Academies'],
    metrics: [
      { label: 'Time Saved on Admissions', value: '75%' },
      { label: 'Fee Collection Accuracy', value: '100%' },
      { label: 'Student Data Security', value: 'Bank-Grade' }
    ],
    workflows: ['Student Application', 'Document Review & Admission', 'Course Registration', 'Fee Payment via M-Pesa', 'Exam Grading & Results Publication'],
    samplePath: '/app/education'
  },
  {
    id: 'sacco',
    name: 'SACCO, Microfinance & Chama ERP',
    badge: 'Financial Services & Chamas',
    tagline: 'Autonomous Savings, Micro-Loans & Member Dividends',
    category: 'Industry Specific',
    industry: 'Financial Cooperatives & Micro-Credit',
    iconName: 'Coins',
    color: '#059669',
    gradient: 'from-emerald-600 to-teal-700',
    shortDescription: 'Empower savings groups, investment chamas, and SACCOs with automated share capital, member contributions, micro-loans, and dividend payouts.',
    longDescription: 'Built with the rigor of cooperative finance principles. Manage member registries, monthly mandatory contributions, share capital tiers, loan eligibility checks, guarantor approvals, automated interest amortization, and instant M-Pesa disbursements.',
    keyFeatures: [
      {
        title: 'Member Share Capital & Savings Ledger',
        description: 'Maintain individual member balances, monthly savings deposits, share transfers, and transparent member account statements.',
        highlight: 'Live Member Ledgers'
      },
      {
        title: 'Micro-Loan Processing & Guarantor Workflow',
        description: 'Configurable loan products (reducing balance, flat rate), guarantor verification, 1-click approval queues, and repayment tracking.',
        highlight: 'Automated Amortization'
      },
      {
        title: 'Welfare, Benevolent Funds & Projects',
        description: 'Segregated accounting for welfare collections, emergency funds, and collective real estate or asset investments.',
        highlight: 'Dedicated Welfare Funds'
      },
      {
        title: 'Dividend Calculator & AGM Financial Reports',
        description: 'Instant yearly dividend computations based on active shares, with automated AGM balance sheets and regulatory reports.',
        highlight: '1-Click Dividend Calculation'
      }
    ],
    targetAudience: ['Savings & Credit Cooperatives (SACCOs)', 'Investment Chamas & Table Banking', 'Employee Welfare Associations', 'Microfinance Lenders'],
    metrics: [
      { label: 'Loan Processing Speed', value: '< 2 Mins' },
      { label: 'Reconciliation Errors', value: '0%' },
      { label: 'Member Transparency', value: 'Real-Time' }
    ],
    workflows: ['Member Registration', 'Monthly Contribution Check-in', 'Loan Request & Guarantor Sign-off', 'Disbursement', 'Automated Dividend Distribution'],
    samplePath: '/app/sacco'
  },
  {
    id: 'church',
    name: 'Church & Ministry Management ERP',
    badge: 'Churches & Non-Profit Ministries',
    tagline: 'Spiritual Community Growth & Transparent Financial Stewardship',
    category: 'Industry Specific',
    industry: 'Faith-Based & Community Organizations',
    iconName: 'HeartHandshake',
    color: '#7C3AED',
    gradient: 'from-purple-600 to-indigo-800',
    shortDescription: 'Comprehensive church records, digital tithes & offerings, cell groups, pledge drives, attendance tracking, and ministry operations.',
    longDescription: 'Equip pastoral teams and church boards with modern digital administration tools. From member and family directories to cell group oversight, sermons repository, pledge tracking, and accountable tithe collections.',
    keyFeatures: [
      {
        title: 'Member & Family Directory with Cell Groups',
        description: 'Holistic congregant profiles, spiritual milestones (Baptism, Confirmation), and localized home cell fellowship management.',
        highlight: 'Connected Congregations'
      },
      {
        title: 'Tithes, Offerings & Project Pledges',
        description: 'Digital tithe recording, mobile giving reconciliation, dedicated building project pledge tracking, and donor receipts.',
        highlight: 'Financial Transparency'
      },
      {
        title: 'Service Attendance & Visitor Follow-Up',
        description: 'Track weekly service headcounts, first-time visitor contact logs, automated welcome SMS, and follow-up pipelines.',
        highlight: 'Visitor Retention'
      },
      {
        title: 'Events, Ministry Departments & Sermons',
        description: 'Manage church calendar, youth/women/men ministries, sermon audio/notes archive, and volunteer duty rosters.',
        highlight: 'Active Ministry Coordination'
      }
    ],
    targetAudience: ['Churches & Dioceses', 'Ministry Networks & Fellowships', 'Faith-Based Charities', 'Community Centers'],
    metrics: [
      { label: 'Visitor Follow-Up Rate', value: '92%' },
      { label: 'Tithe Audit Compliance', value: '100%' },
      { label: 'Member Engagement', value: 'High' }
    ],
    workflows: ['First-Time Visitor Registration', 'Cell Group Assignment', 'Weekly Giving & Tithe Entry', 'Pledge Fulfillment', 'Financial Stewardship Report'],
    samplePath: '/app/church'
  },
  {
    id: 'pos',
    name: 'Point of Sale (POS) Terminal',
    badge: 'Retail, Supermarkets & Hardware',
    tagline: 'High-Speed Touchscreen Checkout & Shift Reconciliation',
    category: 'Industry Specific',
    industry: 'Retail & Commerce',
    iconName: 'ShoppingBag',
    color: '#0284C7',
    gradient: 'from-sky-600 to-blue-700',
    shortDescription: 'Touchscreen cashier terminal with instant barcode scanning, cash/M-Pesa split payments, thermal receipts, and shift float balancing.',
    longDescription: 'Engineered for high-volume retail environments. Features lightning-fast item lookups, barcode scanner integration, offline sales queue, hold/resume carts, multi-tender split checkout, and daily cashier X/Z shift audit reports.',
    keyFeatures: [
      {
        title: 'Ultra-Fast Touchscreen & Barcode Register',
        description: 'Optimized for high-speed counter transactions with keyboard shortcuts, barcode scanners, and visual quick-key grids.',
        highlight: '< 3s Checkout Time'
      },
      {
        title: 'Multi-Tender Payments & M-Pesa STK Push',
        description: 'Accept Cash, M-Pesa, Card, and Store Credit seamlessly in single or split payments with instant receipt generation.',
        highlight: 'Split-Tender Support'
      },
      {
        title: 'Cashier Shifts & Float Balancing (X/Z Reports)',
        description: 'Mandatory shift opening float, cash drop tracking, closing balance reconciliation, and manager override protection.',
        highlight: 'Tamper-Proof Audit'
      },
      {
        title: 'Offline Resilient Mode & Thermal Receipt Printing',
        description: 'Keep ringing up sales even during internet outages; queues transactions and syncs automatically when connection restores.',
        highlight: '100% Uptime Checkout'
      }
    ],
    targetAudience: ['Supermarkets & Mini-Marts', 'Boutiques & Apparel Shops', 'Hardware & Electronics Stores', 'Pharmacies & Beauty Stores'],
    metrics: [
      { label: 'Average Transaction Speed', value: '< 4 Sec' },
      { label: 'Offline Resilience', value: '100%' },
      { label: 'Cash Variance Reduction', value: '98%' }
    ],
    workflows: ['Shift Opening with Float', 'Barcode Scan & Quick Keys', 'M-Pesa / Cash Checkout', 'Thermal Receipt Print', 'Shift Closing & Z-Report'],
    samplePath: '/app/pos'
  },
  {
    id: 'bar',
    name: 'Bar, Restaurant & Hospitality POS',
    badge: 'Restaurants, Lounges & Cafes',
    tagline: 'Visual Table Ordering, Kitchen Tickets & Bottle Tracking',
    category: 'Industry Specific',
    industry: 'Food & Beverage Hospitality',
    iconName: 'Wine',
    color: '#EA580C',
    gradient: 'from-orange-600 to-amber-700',
    shortDescription: 'Interactive floor layouts, Kitchen Order Tickets (KOT), room/table tabs, bottle & shot recipe costing, and split bills.',
    longDescription: 'Specially crafted for the dynamic hospitality industry. Manage dining tables, bar tabs, kitchen display stations, recipe variance, waiter shifts, happy hour pricing, and automated inventory depletion per shot or meal ingredient.',
    keyFeatures: [
      {
        title: 'Visual Interactive Table & Bar Floorplan',
        description: 'Real-time color-coded floor maps showing occupied tables, open tabs, reserved seating, and time seated.',
        highlight: 'Live Floor Status'
      },
      {
        title: 'Kitchen Order Tickets (KOT) & Bar Dispatch',
        description: 'Instant order routing to kitchen thermal printers or digital display screens with custom prep instructions.',
        highlight: 'Instant Kitchen Routing'
      },
      {
        title: 'Shot & Bottle Inventory Tracking with Recipe Costing',
        description: 'Track alcoholic beverage inventory down to individual tot/milliliter measures and calculate recipe profit margins.',
        highlight: 'Zero Liquor Pilferage'
      },
      {
        title: 'Split Billing, Table Transfers & Room Charges',
        description: 'Effortlessly split bills by seat or item, transfer orders between tables, and charge tabs to guest accounts.',
        highlight: 'Flexible Bill Splitting'
      }
    ],
    targetAudience: ['Restaurants & Fine Dining', 'Bars, Lounges & Nightclubs', 'Cafes & Bakeries', 'Hotels & Guest Resorts'],
    metrics: [
      { label: 'Kitchen Delivery Speed', value: '+40%' },
      { label: 'Liquor Shrinkage Reduction', value: '95%' },
      { label: 'Table Turnover Increase', value: '+25%' }
    ],
    workflows: ['Table Selection', 'Waiter Order Taking', 'Automated KOT to Kitchen', 'Tab Additions', 'Split Bill Payment & Table Reset'],
    samplePath: '/app/bar'
  },
  {
    id: 'retail',
    name: 'Retail Storefront Management',
    badge: 'Multi-Branch Retail Chains',
    tagline: 'Centralized Stock, Expiry Tracking & Customer Loyalty',
    category: 'Industry Specific',
    industry: 'Retail & Multi-Store Commerce',
    iconName: 'Store',
    color: '#0D9488',
    gradient: 'from-teal-600 to-cyan-700',
    shortDescription: 'Multi-store inventory management, batch/expiry alerts, automated replenishment orders, and customer loyalty reward programs.',
    longDescription: 'Designed for scaling retail chains and modern storefronts. Connect multiple store locations, centralize product pricing, track fast vs slow-moving stock, prevent stockouts, and retain customers with automated loyalty points.',
    keyFeatures: [
      {
        title: 'Multi-Store Central Catalog & Pricing',
        description: 'Manage master product SKUs across all branches with branch-specific pricing tiers and tax rules.',
        highlight: 'Centralized Control'
      },
      {
        title: 'Batch & Expiry Date Early Warning Alerts',
        description: 'Automatic notifications for approaching product expiry to implement promotional markdowns and reduce wastage.',
        highlight: 'Waste Prevention'
      },
      {
        title: 'Customer Loyalty & Reward Points Program',
        description: 'Build recurring customer loyalty with automatic point accumulation, redeemable discounts, and promotional SMS.',
        highlight: 'Customer Retention'
      },
      {
        title: 'Inter-Branch Stock Transfers & Replenishment',
        description: 'Seamless stock transfer requests and dispatches between warehouse and storefront branches.',
        highlight: 'Automated Stock Transfers'
      }
    ],
    targetAudience: ['Retail Superstores', 'Fashion & Footwear Outlets', 'Electronics Chains', 'Cosmetics & Beauty Retailers'],
    metrics: [
      { label: 'Stockout Reduction', value: '85%' },
      { label: 'Inventory Turnover', value: '+35%' },
      { label: 'Repeat Customer Rate', value: '+28%' }
    ],
    workflows: ['Item Cataloging', 'Inter-Branch Stock Inward', 'Counter Sales & Loyalty Accumulation', 'Expiry Audits', 'Automated Purchase Reordering'],
    samplePath: '/app/retail'
  },
  {
    id: 'wholesale',
    name: 'Wholesale & B2B Distribution ERP',
    badge: 'Wholesalers & Distributors',
    tagline: 'Bulk Order Fulfillment, Tiered Pricing & Route Sales',
    category: 'Industry Specific',
    industry: 'Supply Chain & Bulk Trade',
    iconName: 'Truck',
    color: '#4F46E5',
    gradient: 'from-indigo-600 to-blue-800',
    shortDescription: 'Tiered volume price lists, credit limits, dispatch notes, delivery routing, and B2B customer accounts with automated aging statements.',
    longDescription: 'High-octane operational backbone for FMCG wholesalers and distributors. Manage large carton/pallet units of measure, enforce customer credit limits, assign sales reps to delivery routes, and generate instant tax invoices.',
    keyFeatures: [
      {
        title: 'Tiered Wholesale Price Matrix',
        description: 'Custom pricing lists based on customer classification (Platinum, Gold, Silver) and volume break thresholds.',
        highlight: 'Dynamic Price Lists'
      },
      {
        title: 'Credit Limits & Debt Aging Management',
        description: 'Automated credit stop checks at sales order creation, 30/60/90-day debt aging reports, and debt collection logs.',
        highlight: 'Credit Risk Control'
      },
      {
        title: 'Packing Slips, Dispatch Manifests & Delivery Notes',
        description: 'Warehouse pick-and-pack workflows, driver delivery manifests, and signed proof of delivery documentation.',
        highlight: 'Accurate Dispatch'
      },
      {
        title: 'Sales Rep Field Orders & Route Tracking',
        description: 'Empower van sales reps to take orders in the field, issue receipts, and reconcile vehicle stock daily.',
        highlight: 'Field Sales Enablement'
      }
    ],
    targetAudience: ['FMCG Wholesalers', 'Beverage & Food Distributors', 'Construction & Hardware Wholesalers', 'Import/Export Merchants'],
    metrics: [
      { label: 'Order Processing Speed', value: '3x Faster' },
      { label: 'Credit Collection Rate', value: '+45%' },
      { label: 'Dispatch Accuracy', value: '99.8%' }
    ],
    workflows: ['Bulk Sales Order Booking', 'Credit Limit Check', 'Warehouse Picking & Dispatch', 'Delivery Route Execution', 'Customer Statement Reconciliation'],
    samplePath: '/app/wholesale'
  },
  {
    id: 'hospital',
    name: 'Hospital & Healthcare Management ERP',
    badge: 'Hospitals, Clinics & Labs',
    tagline: 'Electronic Medical Records, Triage & Pharmacy Dispensation',
    category: 'Industry Specific',
    industry: 'Healthcare & Medical Services',
    iconName: 'Activity',
    color: '#E11D48',
    gradient: 'from-rose-600 to-red-700',
    shortDescription: 'Patient Electronic Medical Records (EMR), OPD/IPD triage, doctor clinical notes, pharmacy stock, lab tests, and medical billing.',
    longDescription: 'An integrated clinical and administrative management solution for medical centers. Connect reception patient registries, nursing triage, doctor consultation chambers, diagnostic laboratory queues, pharmacy dispensaries, and health insurance claims.',
    keyFeatures: [
      {
        title: 'Electronic Medical Records (EMR) & Patient Registry',
        description: 'Comprehensive medical history, allergy alerts, vital signs timeline, past visits, and family medical backgrounds.',
        highlight: 'Confidential EMR'
      },
      {
        title: 'OPD/IPD Queue & Doctor Clinical Notes',
        description: 'Seamless departmental patient transfers from triage to doctor chambers, diagnosis coding (ICD-10), and digital prescriptions.',
        highlight: 'Streamlined Patient Flow'
      },
      {
        title: 'Pharmacy Dispensation & Expiry Control',
        description: 'Prescription-linked drug dispensation, real-time medicine inventory depletion, batch tracking, and controlled substance logs.',
        highlight: 'Prescription-Locked Dispensing'
      },
      {
        title: 'Laboratory Workflows & Medical Invoicing',
        description: 'Lab test requisitions, specimen tracking, digital result approval by pathologists, and unified patient bill compilation.',
        highlight: 'Unified Health Billing'
      }
    ],
    targetAudience: ['Hospitals & Medical Centers', 'Specialist Clinics & Polyclinics', 'Diagnostic Laboratories', 'Maternity & Nursing Homes'],
    metrics: [
      { label: 'Patient Waiting Time', value: '-60%' },
      { label: 'Prescription Accuracy', value: '100%' },
      { label: 'Billing Leakage Prevention', value: '100%' }
    ],
    workflows: ['Patient Check-in & Triage', 'Doctor Consultation & Prescription', 'Lab Test Request & Results', 'Pharmacy Dispense', 'Discharge & Billing'],
    samplePath: '/app/hospital'
  },
  {
    id: 'bookshop',
    name: 'Bookshop & Stationeries ERP',
    badge: 'Academic Bookstores & Supplies',
    tagline: 'ISBN Barcoding, School Book Sets & Term Restock Planner',
    category: 'Industry Specific',
    industry: 'Bookstores & Academic Supplies',
    iconName: 'BookOpen',
    color: '#D97706',
    gradient: 'from-amber-600 to-yellow-700',
    shortDescription: 'ISBN book cataloging, grade-level syllabus book packs, stationery inventory, and rapid back-to-school rush checkout.',
    longDescription: 'Tailored for academic bookshops, commercial stationers, and school supply stores. Manage massive book databases by publisher, edition, and curriculum grade level with rapid barcode lookup and seasonal restock projections.',
    keyFeatures: [
      {
        title: 'ISBN Barcode Integration & Fast Catalog Search',
        description: 'Lookup books instantly by ISBN, author, title, publisher, or school grade with real-time stock availability.',
        highlight: 'Instant ISBN Lookup'
      },
      {
        title: 'Class/Grade Curriculum Book Bundles',
        description: 'Create 1-click sales packages for standard class booklists (e.g. Grade 7 CBC Complete Pack) for rapid checkout.',
        highlight: '1-Click Book Bundles'
      },
      {
        title: 'Stationery & Supply Reorder Thresholds',
        description: 'Manage individual pens, reams, art supplies, and exercise book packs with automated supplier restock triggers.',
        highlight: 'Automated Restocking'
      },
      {
        title: 'Back-to-School Peak Rush Optimization',
        description: 'High-speed counter checkout modes designed to handle hundreds of customers per hour during peak intake seasons.',
        highlight: 'Peak Rush Scalability'
      }
    ],
    targetAudience: ['Academic Bookshops', 'University & College Bookstores', 'Commercial Stationers', 'School Uniform & Book Suppliers'],
    metrics: [
      { label: 'Peak Rush Checkout Speed', value: '< 5 Sec' },
      { label: 'Inventory Search Time', value: 'Instant' },
      { label: 'Restock Forecasting Accuracy', value: '96%' }
    ],
    workflows: ['ISBN Intake & Cataloging', 'Curriculum Bundle Creation', 'Peak Intake POS Counter Sales', 'Low Stock Alert', 'Supplier PO Generation'],
    samplePath: '/app/bookshop'
  },
  {
    id: 'accounting',
    name: 'Core Financial Accounting & General Ledger',
    badge: 'Enterprise Financial Suite',
    tagline: 'Double-Entry Accounting, Multi-Currency & Real-Time Financial Statements',
    category: 'Core Enterprise',
    industry: 'Enterprise Finance & Accounting',
    iconName: 'Calculator',
    color: '#2563EB',
    gradient: 'from-blue-700 to-indigo-900',
    shortDescription: 'Double-entry general ledger, Accounts Payable & Receivable, automated bank reconciliation, P&L, Balance Sheet, and VAT compliance.',
    longDescription: 'The enterprise financial nerve center. Enforce strict double-entry ledger bookkeeping, customizable Chart of Accounts, multi-currency support, automated depreciation, audit-proof journal entries, and instant executive financial dashboards.',
    keyFeatures: [
      {
        title: 'Comprehensive Chart of Accounts & General Ledger',
        description: 'Flexible multi-level account hierarchy covering Assets, Liabilities, Equity, Revenues, and Expenses with drill-down audits.',
        highlight: 'Audit-Proof Ledgers'
      },
      {
        title: 'Accounts Receivable (AR) & Accounts Payable (AP)',
        description: 'Vendor bill management, aging analyses, recurring customer invoicing, credit notes, and automated payment reminders.',
        highlight: 'Cash Flow Control'
      },
      {
        title: 'Real-Time Financial Statements (P&L, Balance Sheet, Cash Flow)',
        description: 'Generate real-time Trial Balances, Profit & Loss statements, and Balance Sheets with comparative period analytics.',
        highlight: 'Instant Financial Reports'
      },
      {
        title: 'Tax Compliance, VAT Schedules & Bank Reconciliation',
        description: 'Automated VAT withholding calculations, tax output/input schedules, and smart bank statement reconciliation matching.',
        highlight: 'Tax & VAT Ready'
      }
    ],
    targetAudience: ['CFOs & Finance Controllers', 'Corporate Accounting Teams', 'Auditors & Tax Consultants', 'Growing Small & Medium Enterprises'],
    metrics: [
      { label: 'Month-End Closing Time', value: '-80%' },
      { label: 'Calculation Accuracy', value: '100%' },
      { label: 'Audit Trail Completeness', value: '100%' }
    ],
    workflows: ['Journal Entry Creation', 'Invoice Generation', 'Payment Application', 'Bank Statement Matching', 'Month-End Financial Close'],
    samplePath: '/app/accounting'
  },
  {
    id: 'hr',
    name: 'HR & Automated Payroll Management',
    badge: 'Human Capital & Payroll',
    tagline: 'Digital Employee Records, Leave Automation & 1-Click Compliant Payroll',
    category: 'Core Enterprise',
    industry: 'Human Resource Management',
    iconName: 'Users',
    color: '#9333EA',
    gradient: 'from-purple-700 to-pink-800',
    shortDescription: 'Employee profiles, biometric clock-in, leave approval workflows, 1-click payroll with statutory taxes (PAYE, NSSF, NHIF/SHIF), and digital payslips.',
    longDescription: 'Modernize human capital management. From onboarding and digital contract vaults to multi-tier leave approval hierarchies, biometric attendance integration, and automated statutory tax computations with direct PDF payslip distribution.',
    keyFeatures: [
      {
        title: 'Employee Master Database & Digital File Vault',
        description: 'Store contracts, identification documents, emergency contacts, job descriptions, and salary history securely.',
        highlight: 'Paperless HR'
      },
      {
        title: 'Automated Statutory Payroll Calculation (PAYE, NSSF, SHIF, Housing Levy)',
        description: '1-click payroll generation with automatic calculation of progressive income taxes, relief, and statutory national deductions.',
        highlight: '100% Tax Compliant'
      },
      {
        title: 'Self-Service Leave Management & Approval Chains',
        description: 'Employees request annual, sick, maternity, or compassionate leave; managers approve with live leave balance tracking.',
        highlight: 'Streamlined Approvals'
      },
      {
        title: 'Digital Payslip Generation & Bank Disbursement Schedules',
        description: 'Generate encrypted PDF payslips sent directly via email, along with bank batch payment schedule files for salary transfer.',
        highlight: '1-Click Payslip Distribution'
      }
    ],
    targetAudience: ['HR Directors & Managers', 'Operations Executives', 'Payroll Administrators', 'Businesses with 5 to 5,000+ Staff'],
    metrics: [
      { label: 'Payroll Processing Time', value: '< 5 Mins' },
      { label: 'Tax Penalty Exposure', value: '0%' },
      { label: 'Employee Satisfaction', value: '98%' }
    ],
    workflows: ['Employee Onboarding', 'Attendance Sync', 'Leave Request & Approval', 'Monthly Payroll Execution', 'Payslip Emailing & Bank File Export'],
    samplePath: '/app/hr'
  },
  {
    id: 'inventory',
    name: 'Multi-Warehouse Inventory & Supply Chain',
    badge: 'Inventory & Warehousing',
    tagline: 'Real-Time Stock Valuations, Batch Tracking & Inter-Warehouse Transfers',
    category: 'Core Enterprise',
    industry: 'Supply Chain & Logistics',
    iconName: 'Package',
    color: '#0891B2',
    gradient: 'from-cyan-700 to-teal-900',
    shortDescription: 'Multi-location inventory tracking, live stock valuations (FIFO/Weighted Average), batch/serial tracking, and automatic purchase reorder alerts.',
    longDescription: 'End-to-end stock control across multiple warehouses and branches. Maintain exact stock quantities, prevent shrinkage with stock take reconciliations, track cost of goods sold (COGS) in real time, and automate supplier purchase orders.',
    keyFeatures: [
      {
        title: 'Multi-Location & Warehouse Bin Management',
        description: 'Track inventory across central distribution hubs, regional warehouses, transit stock, and retail sales floors.',
        highlight: 'Multi-Warehouse Tracking'
      },
      {
        title: 'Real-Time Valuation Methods (FIFO, Average Cost, Standard)',
        description: 'Accurate Cost of Goods Sold (COGS) calculations dynamically integrated with the core financial accounting ledger.',
        highlight: 'Real-Time COGS'
      },
      {
        title: 'Batch, Lot & Serial Number Tracking',
        description: 'Full traceability from supplier receipt to end-customer delivery for quality control, warranty, and expiry management.',
        highlight: 'End-to-End Traceability'
      },
      {
        title: 'Automated Minimum Reorder Point Triggers',
        description: 'System automatically flags items falling below safety thresholds and generates draft Purchase Orders to preferred vendors.',
        highlight: 'Zero Stockouts'
      }
    ],
    targetAudience: ['Warehouse & Logistics Managers', 'Manufacturing & Assembly Plants', 'Import Distributors', 'Retail & POS Operations'],
    metrics: [
      { label: 'Inventory Shrinkage Reduction', value: '95%' },
      { label: 'Stock Valuation Accuracy', value: '100%' },
      { label: 'Reorder Processing Time', value: '-70%' }
    ],
    workflows: ['Goods Received Note (GRN)', 'Bin Location Assignment', 'Inter-Warehouse Transfer', 'Physical Stock Count Reconciliation', 'Automated Purchase Reordering'],
    samplePath: '/app/inventory'
  },
  {
    id: 'crm',
    name: 'CRM & Sales Pipeline Management',
    badge: 'Customer Relationship & Sales',
    tagline: 'Lead Conversion Funnels, Deal Pipelines & Omnichannel Communications',
    category: 'Core Enterprise',
    industry: 'Sales, Marketing & Client Relations',
    iconName: 'UserCheck',
    color: '#16A34A',
    gradient: 'from-green-600 to-emerald-800',
    shortDescription: 'Visual Kanban deal pipeline, lead scoring, customer interaction timeline, quotation generation, and sales team performance analytics.',
    longDescription: 'Accelerate revenue growth and customer retention. Capture leads from public portals and campaigns, assign them to sales reps, track stage-by-stage deal progression, send branded price proposals, and convert deals to invoices in one click.',
    keyFeatures: [
      {
        title: 'Visual Drag-and-Drop Kanban Deal Pipeline',
        description: 'Track opportunities through qualification, demo, proposal, negotiation, and won/lost stages with deal values.',
        highlight: 'Visual Pipeline'
      },
      {
        title: 'Complete 360° Customer Interaction Timeline',
        description: 'Centralized log of phone calls, emails, meeting notes, purchased products, and open support tickets per contact.',
        highlight: '360° Client History'
      },
      {
        title: '1-Click Quotation to Sales Order & Invoice Conversion',
        description: 'Generate professional branded PDF quotes and instantly convert accepted proposals into active sales orders.',
        highlight: 'Fast Sales Cycle'
      },
      {
        title: 'Sales Rep Targets & Commission Tracking',
        description: 'Set monthly revenue quotas, measure conversion velocities, and automatically calculate sales commissions.',
        highlight: 'Performance Analytics'
      }
    ],
    targetAudience: ['Sales Directors & Account Executives', 'Business Development Teams', 'Client Success Managers', 'Service & Consulting Firms'],
    metrics: [
      { label: 'Lead Conversion Rate', value: '+38%' },
      { label: 'Sales Cycle Duration', value: '-45%' },
      { label: 'Customer Retention', value: '+30%' }
    ],
    workflows: ['Lead Capture', 'Opportunity Qualification', 'Quote Generation & Delivery', 'Deal Negotiation & Closing', 'Account Onboarding'],
    samplePath: '/app/crm'
  },
  {
    id: 'general_erp',
    name: 'General Enterprise ERP & Workflows',
    badge: 'Enterprise Governance',
    tagline: 'Universal Process Automation, Approval Chains & Document Vault',
    category: 'Core Enterprise',
    industry: 'Corporate Administration & Operations',
    iconName: 'Briefcase',
    color: '#475569',
    gradient: 'from-slate-700 to-slate-900',
    shortDescription: 'Universal business process automation, cross-department approval chains, secure document repository, and audit compliance logging.',
    longDescription: 'The enterprise connective tissue. Design custom approval workflows for purchase requisitions, capital expenditures, contract sign-offs, and policy compliance with full immutable audit logs and notification alerts.',
    keyFeatures: [
      {
        title: 'Multi-Tier Departmental Approval Chains',
        description: 'Enforce threshold-based authorization for expense requests, budget disbursements, and operational sign-offs.',
        highlight: 'Governance & Control'
      },
      {
        title: 'Encrypted Digital Document Vault & Archiving',
        description: 'Secure centralized storage for corporate licenses, lease agreements, board minutes, and regulatory filings.',
        highlight: 'Encrypted Storage'
      },
      {
        title: 'Cross-Functional Task Management & Deadlines',
        description: 'Assign tasks across departments, set milestone reminders, and track institutional project execution.',
        highlight: 'Operational Efficiency'
      },
      {
        title: 'System-Wide Immutable Audit Logging',
        description: 'Complete forensic record of every user action, record edit, financial posting, and login timestamp.',
        highlight: '100% Audit Compliance'
      }
    ],
    targetAudience: ['CEOs, Managing Directors & Board Members', 'Corporate Administrators', 'Compliance & Internal Audit Officers', 'Operations Executives'],
    metrics: [
      { label: 'Approval Turnaround Time', value: '-75%' },
      { label: 'Regulatory Compliance', value: '100%' },
      { label: 'Process Transparency', value: '100%' }
    ],
    workflows: ['Requisition Submission', 'Tiered Management Approval', 'Document Archival', 'Audit Log Review', 'Corporate Performance Review'],
    samplePath: '/app/general-erp'
  }
];

export const DAVETECH_INDUSTRIES = [
  {
    id: 'education',
    name: 'Higher Education & TVETs',
    tagline: 'Universities, TVETs, Colleges & Schools',
    description: 'Transform campus operations with automated admissions, fee collection, CBC & KNEC grading, and multi-campus sync.',
    icon: 'GraduationCap',
    modules: ['education', 'accounting', 'hr', 'pos', 'inventory'],
    bannerColor: 'bg-blue-600',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sacco',
    name: 'SACCOs & Chamas',
    tagline: 'Savings, Chamas & Microfinance',
    description: 'Manage member shares, savings ledgers, micro-loans, welfare funds, and instant M-Pesa reconciliations.',
    icon: 'Coins',
    modules: ['sacco', 'accounting', 'crm', 'general_erp'],
    bannerColor: 'bg-emerald-600',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'church',
    name: 'Churches & Ministries',
    tagline: 'Churches, Dioceses & Faith Non-Profits',
    description: 'Nurture your congregation with member directories, cell groups, digital tithes & offerings, and event coordination.',
    icon: 'HeartHandshake',
    modules: ['church', 'accounting', 'crm', 'general_erp'],
    bannerColor: 'bg-purple-600',
    image: 'https://images.unsplash.com/photo-1548625361-165b44d32eb7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'retail',
    name: 'Retail & Supermarkets',
    tagline: 'Supermarkets, Boutiques & Multi-Store Chains',
    description: 'High-speed touchscreen POS, barcode scanning, loyalty points, multi-branch stock transfers, and cash reconciliation.',
    icon: 'ShoppingBag',
    modules: ['pos', 'retail', 'inventory', 'accounting', 'crm'],
    bannerColor: 'bg-sky-600',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hospitality',
    name: 'Bars & Restaurants',
    tagline: 'Fine Dining, Lounges, Bars & Cafes',
    description: 'Interactive table maps, kitchen order tickets (KOT), shot & bottle recipe costing, and flexible bill splitting.',
    icon: 'Wine',
    modules: ['bar', 'inventory', 'pos', 'accounting', 'hr'],
    bannerColor: 'bg-orange-600',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'wholesale',
    name: 'Wholesale & Distribution',
    tagline: 'FMCG Distributors & Bulk Importers',
    description: 'Tiered volume pricing, credit limits, dispatch notes, delivery routing, and B2B customer aging statements.',
    icon: 'Truck',
    modules: ['wholesale', 'inventory', 'accounting', 'crm', 'pos'],
    bannerColor: 'bg-indigo-600',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hospital',
    name: 'Hospitals & Healthcare',
    tagline: 'Hospitals, Clinics & Diagnostic Labs',
    description: 'Electronic medical records, triage, digital prescriptions, pharmacy inventory, lab tests, and medical invoicing.',
    icon: 'Activity',
    modules: ['hospital', 'accounting', 'inventory', 'hr'],
    bannerColor: 'bg-rose-600',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'
  }
];

export const DAVETECH_PLATFORM_PLANS = [
  {
    id: 'starter',
    name: 'Starter Business',
    priceMonthly: 'KSh 4,999',
    priceAnnual: 'KSh 49,990',
    tagline: 'Ideal for single-branch stores, chamas, and growing small businesses.',
    badge: 'Popular for Starters',
    isPopular: false,
    features: [
      'Up to 3 Active ERP Modules',
      'Up to 5 User Accounts',
      'Single Branch / Location',
      'M-Pesa STK Push Integration',
      'Standard Thermal Receipts & Invoices',
      'Daily Automated Cloud Backups',
      'Email & Community Support'
    ],
    recommendedFor: 'Small Retail Shops, Table Banking Chamas, Single Clinics'
  },
  {
    id: 'professional',
    name: 'Growth & Professional',
    priceMonthly: 'KSh 12,499',
    priceAnnual: 'KSh 124,990',
    tagline: 'Comprehensive solution for TVET colleges, established SACCOs, and retail chains.',
    badge: 'Most Popular',
    isPopular: true,
    features: [
      'Up to 8 Active ERP Modules',
      'Up to 25 User Accounts',
      'Up to 3 Branches / Campuses',
      'Public Institutional Website & Student Portal',
      'Full Accounting & Automated Statutory Payroll',
      'Inventory Batch & Expiry Date Tracking',
      'Multi-Tender POS with Offline Resilience',
      'Priority Phone & WhatsApp Support'
    ],
    recommendedFor: 'TVET Colleges, SACCOs, Churches, Supermarkets, Multi-Branch Bars'
  },
  {
    id: 'enterprise',
    name: 'Enterprise & Group',
    priceMonthly: 'KSh 29,999',
    priceAnnual: 'KSh 299,990',
    tagline: 'Unlimited scale for Universities, large financial institutions, and corporate holdings.',
    badge: 'Unlimited Power',
    isPopular: false,
    features: [
      'All 14+ ERP Modules Unlocked',
      'Unlimited User Accounts & Roles',
      'Unlimited Campuses / Branches / Warehouses',
      'Custom Domain White-labeling (yourdomain.com)',
      'Dedicated Isolated Database Instance',
      'Advanced Custom Workflow & API Integrations',
      '24/7 Dedicated Account Manager & SLA Guarantee',
      'On-site Staff Training & Data Migration Assistance'
    ],
    recommendedFor: 'Universities, National SACCOs, Hospital Networks, FMCG Distributors'
  }
];
