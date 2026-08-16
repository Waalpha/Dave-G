/**
 * Multi-Tenant SaaS ERP Types & Interface Definitions
 */

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';

export type TenantType = 
  | 'EDUCATION'
  | 'HOSPITAL'
  | 'POS'
  | 'RETAIL'
  | 'WHOLESALE'
  | 'BOOKSHOP'
  | 'RESTAURANT'
  | 'CHURCH'
  | 'SACCO'
  | 'BAR'
  | 'GENERAL_ERP';

export type EducationType = 
  | 'UNIVERSITY'
  | 'COLLEGE'
  | 'TVET'
  | 'VOCATIONAL_TRAINING'
  | 'SECONDARY_SCHOOL'
  | 'PRIMARY_SCHOOL'
  | 'TRAINING_INSTITUTE';

export type ModuleId = 
  | 'education'
  | 'hospital'
  | 'pos'
  | 'retail'
  | 'wholesale'
  | 'church'
  | 'sacco'
  | 'bar'
  | 'general_erp'
  | 'accounting'
  | 'hr'
  | 'inventory'
  | 'crm'
  | 'bookshop'
  | 'restaurant';

export interface ErpModuleInfo {
  id: ModuleId;
  name: string;
  description: string;
  category: 'Industry Specific' | 'Core Enterprise' | 'Specialized';
  icon: string;
  defaultPath: string;
}

export interface PublicWebsiteTypographyConfig {
  fontFamily?: 'sans' | 'poppins' | 'outfit' | 'serif' | 'display' | 'mono';
  headingSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  headingWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  headingAlign?: 'left' | 'center' | 'right';
  headingItalic?: boolean;
  bodySize?: 'sm' | 'base' | 'lg';
  bodyWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  bodyItalic?: boolean;
}

export interface TenantHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tagline?: string;
  badgeText?: string;
  imageUrl: string;
  primaryBtnText?: string;
  primaryBtnAction?: 'apply' | 'programs' | 'departments' | 'admissions' | 'campuses' | 'news' | 'about' | 'login';
  secondaryBtnText?: string;
  secondaryBtnAction?: 'apply' | 'programs' | 'departments' | 'admissions' | 'campuses' | 'news' | 'about' | 'login';
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number; // 0-100
  fontFamily?: 'sans' | 'poppins' | 'outfit' | 'serif' | 'display' | 'mono';
  titleFontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  titleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  titleItalic?: boolean;
  subtitleFontSize?: 'sm' | 'base' | 'lg';
  subtitleItalic?: boolean;
}

export interface TenantPublicNews {
  id: string;
  title: string;
  category: 'Announcement' | 'Academic' | 'Event' | 'Admissions';
  date: string;
  summary: string;
  imageUrl?: string;
}

export interface TenantPublicEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
}

export interface TenantPublicWebsiteConfig {
  enabled: boolean;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  heroSlides?: TenantHeroSlide[];
  autoSlideInterval?: number; // seconds
  aboutText?: string;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  tagline?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  admissionNotice?: string;
  admissionRequirements?: string[];
  news?: TenantPublicNews[];
  events?: TenantPublicEvent[];
  customMetaTitle?: string;
  customMetaDescription?: string;
  typography?: PublicWebsiteTypographyConfig;
}

export interface PublicTenantInfo {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  domainType?: 'subdomain' | 'custom';
  customDomain?: string | null;
  type: TenantType;
  educationType?: EducationType;
  branding: TenantBranding;
  publicWebsite?: TenantPublicWebsiteConfig;
}

export interface PublicTenantResponse {
  tenant: PublicTenantInfo;
  products?: PosProduct[];
  categories?: string[];
  departments?: Department[];
  programs?: Program[];
  campuses?: Campus[];
  investments?: ChamaInvestment[];
  menuItems?: RestaurantMenuItem[];
  stats: Record<string, number | string>;
}

export interface PublicInquiryPayload {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  inquiryType?: 'WHOLESALE_QUOTE' | 'BULK_ORDER' | 'ADMISSION' | 'MEMBERSHIP' | 'APPOINTMENT' | 'PRAYER_REQUEST' | 'GENERAL';
  productOrProgramId?: string;
  targetItemName?: string;
  quantity?: number;
  location?: string;
  message?: string;
}

export interface TenantBranding {
  companyName: string;
  logoUrl?: string;
  primaryColor: string; // Hex color
  secondaryColor: string;
  currency: string; // e.g. KES, USD, EUR
  currencySymbol: string; // e.g. KSh, $, €
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxRegistrationNumber?: string;
  fiscalYearStartMonth: number; // 1 = January
}

export interface PlatformHeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  primaryAction: string;
  primaryText: string;
  secondaryAction: string;
  secondaryText: string;
  stats?: { label: string; val: string }[];
  fontFamily?: 'sans' | 'poppins' | 'outfit' | 'serif' | 'display' | 'mono';
  titleFontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  titleFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  titleItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  subtitleFontSize?: 'sm' | 'base' | 'lg';
  subtitleItalic?: boolean;
}

export interface PlatformPricingPlanConfig {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: string;
  priceAnnual: string;
  isPopular?: boolean;
  features: string[];
}

export interface PlatformPublicWebsiteConfig {
  enabled: boolean;
  announcementBarEnabled?: boolean;
  announcementBarText?: string;
  announcementBarLink?: string;
  heroSlides?: PlatformHeroSlide[];
  autoSlideInterval?: number; // seconds
  heroLayout?: 'split' | 'overlay' | 'banner';
  heroPhotoOverlayOpacity?: number; // 0 - 100
  typography?: PublicWebsiteTypographyConfig;
  aboutHeadline?: string;
  aboutDescription?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  stats?: { label: string; val: string; icon?: string }[];
  contactEmail?: string;
  salesEmail?: string;
  contactPhone?: string;
  officeAddress?: string;
  pricingPlans?: PlatformPricingPlanConfig[];
  customMetaTitle?: string;
  customMetaDescription?: string;
}

export interface PlatformNotification {
  id: string;
  tenantId?: string; // 'platform_super_admin' or specific tenantId
  type: 'DEMO_REQUEST' | 'NEW_TENANT' | 'SYSTEM' | 'SECURITY' | 'SUBSCRIPTION' | 'GENERAL';
  title: string;
  message: string;
  metadata?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    industry?: string;
    interestedModules?: string[];
    message?: string;
    selectedPlan?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  supportEmail: string;
  supportPhone?: string;
  companyName: string;
  copyrightText: string;
  allowSelfRegistration: boolean;
  systemNotice?: string;
  publicWebsite?: PlatformPublicWebsiteConfig;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  domainType?: 'subdomain' | 'custom';
  customDomain?: string | null;
  type: TenantType;
  educationType?: EducationType;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  planId: string;
  websiteEnabled?: boolean;
  websiteTitle?: string;
  websiteDescription?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  branding: TenantBranding;
  publicWebsite?: TenantPublicWebsiteConfig;
  enabledModules: ModuleId[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string; // 'platform_super_admin' or actual tenantId
  email: string;
  name: string;
  role: UserRole;
  customRoleName?: string;
  avatarUrl?: string;
  department?: string;
  permissions: string[]; // e.g. ['education.view', 'students.create']
  passwordHash?: string;
  resetToken?: string;
  resetTokenExpiresAt?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  maxUsers: number;
  includedModules: ModuleId[];
  description: string;
}

// Education Module Specific Models
export interface Campus {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  location: string;
  isMain: boolean;
}

export interface AcademicYear {
  id: string;
  tenantId: string;
  yearName: string; // e.g. "2025/2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicTerm {
  id: string;
  tenantId: string;
  academicYearId: string;
  termName: string; // e.g. "Semester 1", "Term 2"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Department {
  id: string;
  tenantId: string;
  campusId?: string;
  campusName?: string;
  code: string;
  name: string;
  description?: string;
  headOfDepartmentId?: string;
  headOfDepartmentName?: string;
  headOfDepartment?: string; // Legacy string fallback
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Program {
  id: string;
  tenantId: string;
  departmentId: string;
  name: string; // e.g. "Diploma in Information Technology"
  code: string; // e.g. "DIT"
  level: string; // Diploma, Certificate, Degree, Higher Diploma
  durationYears: number;
}

export interface UnitSubject {
  id: string;
  tenantId: string;
  programId: string;
  code: string; // e.g. "BIT 1102"
  name: string; // e.g. "Database Systems Architecture"
  creditHours: number;
}

export interface Student {
  id: string;
  tenantId: string;
  admissionNo: string;
  fullName: string;
  email: string;
  phone: string;
  programId: string;
  programName: string;
  campusId: string;
  campusName: string;
  academicYear: string;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'APPLICANT';
  feeBalance: number;
  gender: string;
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
  enrolledAt: string;
}

export interface LecturerStaff {
  id: string;
  tenantId: string;
  staffNo: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string; // e.g. Senior Lecturer, Dean, Instructor
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
}

export interface TimetableEntry {
  id: string;
  tenantId: string;
  unitCode: string;
  unitName: string;
  lecturerName: string;
  roomVenue: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  groupName: string;
}

export interface FeeStructure {
  id: string;
  tenantId: string;
  programId: string;
  programName: string;
  academicTerm: string;
  tuitionFee: number;
  examFee: number;
  libraryFee: number;
  activityFee: number;
  totalFee: number;
}

export interface FeePayment {
  id: string;
  tenantId: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  amount: number;
  paymentMethod: 'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD';
  referenceNo: string;
  paidAt: string;
  receivedBy: string;
}

export interface LibraryBook {
  id: string;
  tenantId: string;
  isbn: string;
  title: string;
  author: string;
  copiesTotal: number;
  copiesAvailable: number;
  category: string;
}

export interface HostelRoom {
  id: string;
  tenantId: string;
  blockName: string;
  roomNumber: string;
  capacity: number;
  occupied: number;
  feePerTerm: number;
}

// ==========================================
// CHAMA / SACCO MODULE TYPES (Blessed to Bless)
// ==========================================
export interface ChamaMember {
  id: string;
  tenantId: string;
  memberNo: string;
  fullName: string;
  idNumber: string;
  phone: string;
  email?: string;
  joinDate: string;
  status: 'ACTIVE' | 'DORMANT' | 'SUSPENDED' | 'EXITED';
  totalSavings: number;
  welfareFund: number;
  shareCapital: number;
  activeLoansBalance: number;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelation: string;
}

export interface ChamaContribution {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  amount: number;
  type: 'MONTHLY_SAVINGS' | 'WELFARE' | 'SHARE_CAPITAL' | 'DEVELOPMENT_FUND' | 'FINE' | 'OTHER';
  paymentMethod: 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE';
  reference: string;
  date: string;
  recordedBy: string;
  notes?: string;
}

export interface ChamaLoan {
  id: string;
  tenantId: string;
  loanNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  principalAmount: number;
  interestRatePercent: number;
  totalInterest: number;
  totalPayable: number;
  repaymentPeriodMonths: number;
  monthlyInstallment: number;
  amountPaid: number;
  balance: number;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'DISBURSED' | 'COMPLETED' | 'DEFAULTED' | 'REJECTED';
  guarantors: {
    memberId: string;
    memberName: string;
    guaranteedAmount: number;
    status: 'ACCEPTED' | 'PENDING' | 'DECLINED';
  }[];
  disbursementDate?: string;
  dueDate?: string;
  purpose: string;
}

export interface ChamaRepayment {
  id: string;
  tenantId: string;
  loanId: string;
  loanNo: string;
  memberId: string;
  memberName: string;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  date: string;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER' | 'CASH';
  reference: string;
  recordedBy: string;
}

export interface ChamaInvestment {
  id: string;
  tenantId: string;
  title: string;
  category: 'LAND_REAL_ESTATE' | 'MONEY_MARKET' | 'SHARES' | 'AGRIBUSINESS' | 'FIXED_DEPOSIT' | 'OTHER';
  investedAmount: number;
  currentValuation: number;
  startDate: string;
  maturityDate?: string;
  status: 'ACTIVE' | 'MATURED' | 'SOLD';
  expectedYieldPercent: number;
  dividendsEarned: number;
  locationOrInstitution: string;
  notes?: string;
}

// ==========================================
// POS, RETAIL, WHOLESALE & BOOKSHOP MODULE TYPES
// ==========================================
export interface PosProduct {
  id: string;
  tenantId: string;
  barcode?: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  quantityInStock: number;
  minStockAlert: number;
  unit: string;
  authorOrBrand?: string;
  isbnOrCode?: string;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
}

export interface PosSaleItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  taxPercent?: number;
  discountAmount?: number;
  total: number;
}

export interface PosSaleOrder {
  id: string;
  tenantId: string;
  receiptNo: string;
  items: PosSaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'MPESA' | 'CARD' | 'CREDIT' | 'BANK_TRANSFER';
  paymentReference?: string;
  cashierId: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  date: string;
  saleType: 'RETAIL' | 'WHOLESALE' | 'POS' | 'RESTAURANT' | 'BOOKSHOP';
  tableOrRoomNo?: string;
  status: 'COMPLETED' | 'HOLD' | 'CANCELLED';
}

// ==========================================
// RESTAURANT & BAR MODULE TYPES
// ==========================================
export interface RestaurantTable {
  id: string;
  tenantId: string;
  tableNumber: string;
  capacity: number;
  section: 'MAIN_DINING' | 'BALCONY' | 'VIP_LOUNGE' | 'BAR_COUNTER' | 'OUTDOOR';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING';
  currentOrderId?: string;
  guestCount?: number;
}

export interface RestaurantMenuItem {
  id: string;
  tenantId: string;
  name: string;
  category: 'APPETIZERS' | 'MAIN_DISHES' | 'BEVERAGES_SOFT' | 'ALCOHOL_BEER' | 'WINES_SPIRITS' | 'DESSERTS' | 'SPECIALS';
  price: number;
  costPrice: number;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  portionSize?: string;
}

// ==========================================
// INVENTORY, ACCOUNTING, HR, CRM, CHURCH
// ==========================================
export interface InventoryMovement {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  movementType: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'DAMAGE_WASTE' | 'TRANSFER';
  quantityChanged: number;
  balanceAfter: number;
  recordedBy: string;
  date: string;
  notes?: string;
}

export interface AccountingLedgerEntry {
  id: string;
  tenantId: string;
  transactionDate: string;
  accountCategory: 'REVENUE' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'EQUITY';
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  referenceNo: string;
  paymentMethod: string;
  recordedBy: string;
}

export interface EmployeeRecord {
  id: string;
  tenantId: string;
  employeeNo: string;
  fullName: string;
  nationalId: string;
  department: string;
  jobTitle: string;
  phone: string;
  email: string;
  hireDate: string;
  basicSalary: number;
  employmentStatus: 'FULL_TIME' | 'CONTRACT' | 'PROBATION' | 'TERMINATED';
  allowances: number;
  deductions: number;
}

export interface CrmLeadCustomer {
  id: string;
  tenantId: string;
  fullName: string;
  companyOrOrg?: string;
  phone: string;
  email: string;
  stage: 'PROSPECT' | 'CONTACTED' | 'PROPOSAL_SENT' | 'WON_CUSTOMER' | 'LOST';
  estimatedValue: number;
  assignedTo: string;
  source: 'WALK_IN' | 'WEBSITE' | 'REFERRAL' | 'PHONE_INQUIRY' | 'SOCIAL_MEDIA';
  lastContactDate: string;
  notes?: string;
}

export interface ChurchMemberRecord {
  id: string;
  tenantId: string;
  memberNo: string;
  fullName: string;
  phone: string;
  email?: string;
  ministryOrFellowship: string;
  membershipStatus: 'COMMUNICANT' | 'ADHERENT' | 'YOUTH' | 'CHILD';
  baptismDate?: string;
  titheNumber?: string;
  joinDate: string;
}

export interface ChurchGivingRecord {
  id: string;
  tenantId: string;
  memberId?: string;
  giverName: string;
  amount: number;
  category: 'TITHE' | 'OFFERING' | 'BUILDING_PROJECT' | 'MISSIONS' | 'THANKSGIVING' | 'HARVEST';
  paymentMethod: 'MPESA' | 'CASH' | 'BANK';
  reference: string;
  date: string;
  serviceName: string;
}
