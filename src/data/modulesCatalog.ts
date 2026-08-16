import { ErpModuleInfo, ModuleId } from '../types';

export const ALL_ERP_MODULES: ErpModuleInfo[] = [
  {
    id: 'education',
    name: 'Education / School ERP',
    description: 'Comprehensive management for Universities, Colleges, TVETs, Vocational Training, and Schools.',
    category: 'Industry Specific',
    icon: 'GraduationCap',
    defaultPath: '/app/education'
  },
  {
    id: 'hospital',
    name: 'Hospital Healthcare',
    description: 'Patient records, appointments, triage, pharmacy, lab results, and medical billing.',
    category: 'Industry Specific',
    icon: 'Activity',
    defaultPath: '/app/hospital'
  },
  {
    id: 'pos',
    name: 'Point of Sale (POS)',
    description: 'Touchscreen cashier terminal, barcode scanning, thermal receipts, and shift reconciliation.',
    category: 'Industry Specific',
    icon: 'ShoppingBag',
    defaultPath: '/app/pos'
  },
  {
    id: 'retail',
    name: 'Retail Shop',
    description: 'Storefront inventory, sales order tracking, customer loyalty, and stock alerts.',
    category: 'Industry Specific',
    icon: 'Store',
    defaultPath: '/app/retail'
  },
  {
    id: 'wholesale',
    name: 'Wholesale Trade',
    description: 'Bulk order processing, tiered pricing, dispatch notes, and credit management.',
    category: 'Industry Specific',
    icon: 'Truck',
    defaultPath: '/app/wholesale'
  },
  {
    id: 'church',
    name: 'Church Management',
    description: 'Member directory, tithes & offerings, cell groups, event attendance, and ministry operations.',
    category: 'Industry Specific',
    icon: 'HeartHandshake',
    defaultPath: '/app/church'
  },
  {
    id: 'sacco',
    name: 'Chama & SACCO (Blessed to Bless)',
    description: 'Member shares, savings deposits, monthly contributions, loan management, welfare, and investments.',
    category: 'Industry Specific',
    icon: 'Coins',
    defaultPath: '/app/sacco'
  },
  {
    id: 'bar',
    name: 'Bar & Restaurant',
    description: 'Table order management, kitchen display, bottle tracking, menu management, and split billing.',
    category: 'Industry Specific',
    icon: 'Wine',
    defaultPath: '/app/bar'
  },
  {
    id: 'bookshop',
    name: 'Bookshop & Stationeries',
    description: 'ISBN cataloging, school book sets, stationeries inventory, and quick counter sales.',
    category: 'Industry Specific',
    icon: 'BookOpen',
    defaultPath: '/app/bookshop'
  },
  {
    id: 'general_erp',
    name: 'General ERP',
    description: 'Universal business process automation, task management, workflows, and document vault.',
    category: 'Core Enterprise',
    icon: 'Briefcase',
    defaultPath: '/app/general-erp'
  },
  {
    id: 'accounting',
    name: 'Accounting / Finance',
    description: 'General ledger, journal entries, accounts payable/receivable, financial statements, and tax reporting.',
    category: 'Core Enterprise',
    icon: 'Calculator',
    defaultPath: '/app/accounting'
  },
  {
    id: 'hr',
    name: 'HR & Payroll',
    description: 'Employee directory, attendance, leave requests, statutory deductions, and automated payslip generation.',
    category: 'Core Enterprise',
    icon: 'Users',
    defaultPath: '/app/hr'
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Multi-warehouse stock tracking, valuations, stock movements, and low stock threshold notifications.',
    category: 'Core Enterprise',
    icon: 'Package',
    defaultPath: '/app/inventory'
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Lead pipeline, sales opportunities, customer communication logs, and campaign tracking.',
    category: 'Core Enterprise',
    icon: 'UserCheck',
    defaultPath: '/app/crm'
  }
];

export function getModuleInfo(id: ModuleId): ErpModuleInfo | undefined {
  return ALL_ERP_MODULES.find(m => m.id === id);
}
