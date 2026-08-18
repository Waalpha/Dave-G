/**
 * Multi-Tenant SaaS ERP Types & Interface Definitions
 */

export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';

export type FacilityType = 
  | 'HOSPITAL'
  | 'CLINIC'
  | 'MEDICAL_CENTRE'
  | 'HEALTH_CENTRE'
  | 'DIAGNOSTIC_CENTRE'
  | 'PHARMACY'
  | 'SPECIALIZED_CLINIC';

export type TenantType = 
  | 'EDUCATION'
  | 'HOSPITAL'
  | 'HEALTHCARE'
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

export interface PublicWebsiteMediaItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
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
  publicLogoUrl?: string;
  announcementBarEnabled?: boolean;
  announcementBarText?: string;
  announcementBarLink?: string;
  heroSlides?: PlatformHeroSlide[];
  mediaSlides?: PublicWebsiteMediaItem[];
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
  logoUrl?: string; // Internal authenticated ERP logo
  publicWebsiteLogoUrl?: string; // Public marketing website logo
  publicWebsiteMedia?: PublicWebsiteMediaItem[]; // Promotional image carousel
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
  facilityType?: FacilityType;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  planId: string;
  websiteEnabled?: boolean;
  websiteTitle?: string;
  websiteDescription?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  county?: string;
  subCounty?: string;
  mflCode?: string;
  kmpdcRegistration?: string;
  operatingHours?: string;
  emergencyHotline?: string;
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
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYear {
  id: string;
  tenantId: string;
  yearName: string; // e.g. "2025/2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt?: string;
}

export interface AcademicTerm {
  id: string;
  tenantId: string;
  academicYearId: string;
  academicYearName?: string;
  termName: string; // e.g. "Semester 1", "Term 2"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt?: string;
}
export type Term = AcademicTerm;

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
  departmentName?: string;
  name: string; // e.g. "Diploma in Information Technology"
  code: string; // e.g. "DIT"
  level: string; // Diploma, Certificate, Degree, Higher Diploma, Artisan, Short Course
  durationYears: number;
  description?: string;
  totalCredits?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface UnitSubject {
  id: string;
  tenantId: string;
  programId: string;
  programName?: string;
  departmentId?: string;
  code: string; // e.g. "BIT 1102"
  name: string; // e.g. "Database Systems Architecture"
  creditHours: number;
  credits?: number;
  description?: string;
  yearLevel?: number;
  semester?: number;
  lecturerId?: string;
  lecturerName?: string;
  createdAt?: string;
}
export type Unit = UnitSubject;

export interface SchoolClass {
  id: string;
  tenantId: string;
  name: string; // e.g. "DIT Jan 2025 Group A"
  code: string; // e.g. "DIT-2025-A"
  programId: string;
  programName: string;
  academicYear: string;
  academicTerm?: string;
  term?: string;
  campusId?: string;
  campusName?: string;
  capacity?: number;
  classTeacherId?: string;
  classTeacherName?: string;
  roomVenue?: string;
  room?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt?: string;
}

export interface Student {
  id: string;
  tenantId: string;
  admissionNo: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  nationalId?: string;
  address?: string;
  programId: string;
  programName: string;
  departmentId?: string;
  departmentName?: string;
  classId?: string;
  className?: string;
  campusId: string;
  campusName: string;
  intake?: string; // e.g. "January 2026"
  academicYear: string;
  academicTerm?: string;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'APPLICANT' | 'DEFERRED' | 'ALUMNI';
  feeBalance: number;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelation?: string;
  enrolledAt: string;
  avatarUrl?: string;
}

export interface LecturerStaff {
  id: string;
  tenantId: string;
  staffNo: string;
  staffNumber?: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  campusId?: string;
  campusName?: string;
  designation: string; // e.g. Senior Lecturer, Dean, Head of Department, Instructor
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  specialization?: string;
  qualification?: string;
  nationalId?: string;
  status?: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  hireDate?: string;
  createdAt?: string;
}

export interface TimetableEntry {
  id: string;
  tenantId: string;
  unitId?: string;
  unitCode: string;
  unitName: string;
  lecturerId?: string;
  lecturerName: string;
  classId?: string;
  groupName: string;
  roomVenue: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  campusId?: string;
  campusName?: string;
}

export interface StudentAttendance {
  id: string;
  tenantId: string;
  date: string;
  classId?: string;
  className?: string;
  unitId?: string;
  unitCode?: string;
  unitName?: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedBy?: string;
  createdAt?: string;
}

export interface FeeStructure {
  id: string;
  tenantId: string;
  programId: string;
  programName: string;
  academicYear?: string;
  academicTerm: string;
  tuitionFee: number;
  examFee: number;
  libraryFee: number;
  activityFee: number;
  otherFees?: number;
  totalFee: number;
  createdAt?: string;
}

export interface StudentInvoice {
  id: string;
  tenantId: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  programId: string;
  programName: string;
  academicTerm: string;
  academicYear: string;
  feeStructureId?: string;
  items: Array<{ description: string; amount: number }>;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  issueDate: string;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  createdAt?: string;
}

export interface FeePayment {
  id: string;
  tenantId: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  invoiceId?: string;
  invoiceNo?: string;
  amount: number;
  paymentMethod: 'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'CASH';
  referenceNo: string;
  paidAt: string;
  receivedBy: string;
  bankName?: string;
  notes?: string;
}

export interface StudentGradeRecord {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  programId?: string;
  classId?: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  academicTerm: string;
  term?: string;
  academicYear: string;
  catScore: number; // Continuous Assessment Tests (e.g., out of 30 or 40)
  examScore: number; // Final Exam (e.g., out of 70 or 60)
  totalScore: number; // 0 - 100
  grade: string; // A, B, C, D, E, F / Distinction, Credit, Pass, Referral
  points?: number; // Grade points (e.g., 4.0, 3.0, etc.)
  gradePoint?: number;
  remarks?: string; // Excellent, Good, Satisfactory, Needs Improvement
  lecturerName?: string;
  publishedAt?: string;
}

export interface LibraryBook {
  id: string;
  tenantId: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  edition?: string;
  category: string;
  shelfLocation?: string;
  copiesTotal: number;
  copiesAvailable: number;
  createdAt?: string;
}

export interface LibraryLoan {
  id: string;
  tenantId: string;
  bookId: string;
  bookTitle: string;
  isbn?: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
  issuedBy: string;
}

export interface HostelRoom {
  id: string;
  tenantId: string;
  campusId?: string;
  blockName: string;
  roomNumber: string;
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  capacity: number;
  occupied: number;
  feePerTerm: number;
  status?: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
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

// ==========================================
// HEALTHCARE & HOSPITAL ERP DATA MODELS
// ==========================================

export type HealthcareStaffRole =
  | 'DOCTOR'
  | 'SPECIALIST'
  | 'SURGEON'
  | 'ANAESTHETIST'
  | 'CLINICAL_OFFICER'
  | 'NURSE'
  | 'PHARMACIST'
  | 'PHARMACY_TECH'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGIST'
  | 'RADIOGRAPHER'
  | 'RECEPTIONIST'
  | 'CASHIER'
  | 'ACCOUNTANT'
  | 'INVENTORY_MANAGER'
  | 'AMBULANCE_PARAMEDIC'
  | 'AMBULANCE_DRIVER'
  | 'MORTUARY_ATTENDANT'
  | 'ADMINISTRATOR'
  | 'SUPPORT_STAFF';

export type TriagePriority = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface PatientRecord {
  id: string;
  tenantId: string;
  patientNumber: string; // e.g. PAT-2026-0001
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationalIdOrPassport?: string;
  phone: string;
  email?: string;
  address?: string;
  county?: string;
  subCounty?: string;
  bloodGroup?: BloodGroup;
  allergies?: string[];
  chronicConditions?: string[];
  disabilityInformation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  insuranceProviderId?: string;
  insuranceProviderName?: string;
  insurancePolicyNumber?: string;
  photoUrl?: string;
  documents?: { id: string; name: string; type: string; url: string; date: string }[];
  status: 'ACTIVE' | 'INACTIVE' | 'DECEASED';
  createdAt: string;
  updatedAt: string;
}

export interface HealthcareDepartment {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  headOfDepartment?: string;
  location?: string;
  phoneExtension?: string;
  status: 'ACTIVE' | 'INACTIVE';
  servicesCount?: number;
}

export interface HealthcareStaffRecord {
  id: string;
  tenantId: string;
  employeeNumber: string;
  fullName: string;
  professionalRole: HealthcareStaffRole;
  departmentId: string;
  departmentName: string;
  email: string;
  phone: string;
  nationalId: string;
  licenseNumber?: string; // KMPDC / NCK / PPB / KMLTTB
  qualifications?: string;
  employmentDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  shiftSchedule?: string;
}

export interface AppointmentRecord {
  id: string;
  tenantId: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'GENERAL_CONSULTATION' | 'SPECIALIST' | 'FOLLOW_UP' | 'ANTENATAL' | 'DENTAL' | 'OPTICAL' | 'VACCINATION' | 'PROCEDURE';
  reason: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
}

export interface QueueRecord {
  id: string;
  tenantId: string;
  queueNumber: string; // e.g. Q-001
  patientId: string;
  patientName: string;
  patientNumber: string;
  appointmentId?: string;
  departmentId: string;
  departmentName: string;
  doctorId?: string;
  doctorName?: string;
  priority: TriagePriority;
  status: 'WAITING' | 'IN_TRIAGE' | 'WAITING_FOR_DOCTOR' | 'IN_CONSULTATION' | 'WAITING_FOR_LAB' | 'WAITING_FOR_PHARMACY' | 'WAITING_FOR_PAYMENT' | 'COMPLETED' | 'CANCELLED';
  checkInTime: string;
  calledTime?: string;
  completedTime?: string;
}

export interface TriageRecord {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  queueId?: string;
  temperatureCelsius: number; // e.g. 36.8
  pulseRateBpm: number; // e.g. 72
  systolicBp: number; // e.g. 120
  diastolicBp: number; // e.g. 80
  respiratoryRate: number; // e.g. 18
  oxygenSaturationPercent: number; // e.g. 98
  weightKg: number;
  heightCm: number;
  bmi: number; // Calculated
  painScore: number; // 0-10
  bloodSugarMgDl?: number;
  chiefComplaint: string;
  triageNotes?: string;
  priority: TriagePriority;
  nurseId: string;
  nurseName: string;
  recordedAt: string;
}

export interface DiagnosisItem {
  code?: string; // ICD-10 or custom code e.g. "J00", "A09", "E11"
  description: string;
  type: 'PRIMARY' | 'SECONDARY' | 'PROVISIONAL';
}

export interface ConsultationEncounter {
  id: string;
  tenantId: string;
  encounterNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  patientGender: string;
  patientAge: number;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  encounterDate: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  systemicReview?: string;
  diagnoses: DiagnosisItem[];
  treatmentPlan: string;
  proceduresDone?: string;
  clinicalNotes?: string;
  followUpDate?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ADMITTED' | 'REFERRED';
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string; // e.g. "500mg"
  route: 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL' | 'INHALATION' | 'OPHTHALMIC' | 'OTIC' | 'RECTAL';
  frequency: 'OD' | 'BD' | 'TDS' | 'QID' | 'PRN' | 'STAT' | 'NOCTE';
  durationDays: number;
  quantityPrescribed: number;
  quantityDispensed: number;
  instructions: string; // e.g. "After meals with plenty of water"
  unitPrice: number;
  totalPrice: number;
  dispensedBatch?: string;
}

export interface PrescriptionRecord {
  id: string;
  tenantId: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId: string;
  doctorName: string;
  encounterId?: string;
  items: PrescriptionItem[];
  notes?: string;
  datePrescribed: string;
  status: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'CANCELLED';
  dispensedAt?: string;
  dispensedBy?: string;
}

export interface MedicineCatalogueItem {
  id: string;
  tenantId: string;
  name: string;
  genericName: string;
  brandName?: string;
  category: 'ANTIBIOTICS' | 'ANALGESICS' | 'ANTIHYPERTENSIVES' | 'ANTIDIABETICS' | 'ANTIHISTAMINES' | 'ANTIMALARIALS' | 'IV_FLUIDS' | 'VACCINES' | 'TOPICAL' | 'GASTROINTESTINAL' | 'RESPIRATORY' | 'OTHER';
  form: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'OINTMENT' | 'DROPS' | 'INHALER' | 'SUPPOSITORY' | 'SUSPENSION';
  strength: string; // e.g. "500mg", "250mg/5ml"
  unit: string; // e.g. "Tablets", "Vials", "Bottles", "Blister"
  supplier?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  stockOnHand: number;
  requiresPrescription: boolean;
  status: 'ACTIVE' | 'DISCONTINUED';
}

export interface MedicineBatch {
  id: string;
  tenantId: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantityInitial: number;
  quantityRemaining: number;
  purchaseCost: number;
  sellingPrice: number;
  receivedDate: string;
  supplierName?: string;
}

export interface PharmacyDispenseRecord {
  id: string;
  tenantId: string;
  dispenseNumber: string;
  prescriptionId?: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  items: {
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  paymentStatus: 'PAID' | 'BILLED_TO_INVOICE' | 'INSURANCE_CLAIM';
  dispensedBy: string;
  dispensedAt: string;
}

export interface LabTestCatalogueItem {
  id: string;
  tenantId: string;
  testName: string;
  testCode: string;
  category: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'MICROBIOLOGY' | 'PARASITOLOGY' | 'IMMUNOLOGY' | 'SEROLOGY' | 'URINALYSIS' | 'HISTOLOGY' | 'MOLECULAR';
  sampleType: 'WHOLE_BLOOD' | 'SERUM' | 'PLASMA' | 'URINE' | 'STOOL' | 'SPUTUM' | 'SWAB' | 'CSF' | 'TISSUE' | 'OTHER';
  price: number;
  referenceRange: string;
  units?: string;
  turnaroundTimeHours: number;
  isAvailable: boolean;
}

export interface LabTestRequestItem {
  testId: string;
  testName: string;
  price: number;
  sampleType: string;
  status: 'REQUESTED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  result?: string;
  referenceRange?: string;
  units?: string;
  flags?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  notes?: string;
}

export interface LabRequestRecord {
  id: string;
  tenantId: string;
  requestNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId: string;
  doctorName: string;
  encounterId?: string;
  clinicalNotes?: string;
  tests: LabTestRequestItem[];
  status: 'REQUESTED' | 'SAMPLE_COLLECTED' | 'IN_ANALYSIS' | 'VERIFIED' | 'RELEASED';
  requestedAt: string;
  sampleCollectedAt?: string;
  sampleCollectorName?: string;
  technicianName?: string;
  completedAt?: string;
  verifiedByName?: string;
  verifiedAt?: string;
}

export interface RadiologyServiceItem {
  id: string;
  tenantId: string;
  serviceName: string;
  serviceCode: string;
  modality: 'X_RAY' | 'ULTRASOUND' | 'CT_SCAN' | 'MRI' | 'MAMMOGRAPHY' | 'ECHOCARDIOGRAM' | 'DENTAL_XRAY' | 'OTHER';
  bodyPart: string;
  price: number;
  preparationInstructions?: string;
  isAvailable: boolean;
}

export interface RadiologyRequestRecord {
  id: string;
  tenantId: string;
  requestNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  modality: string;
  clinicalIndications: string;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  scheduledDate?: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'PERFORMED' | 'REPORTED' | 'VERIFIED';
  requestedAt: string;
  performedAt?: string;
  findings?: string;
  impression?: string;
  radiologistName?: string;
  verifiedAt?: string;
  reportAttachmentUrl?: string;
}

export interface WardRecord {
  id: string;
  tenantId: string;
  wardName: string;
  wardType: 'MALE_SURGICAL' | 'FEMALE_SURGICAL' | 'MALE_MEDICAL' | 'FEMALE_MEDICAL' | 'PEDIATRIC' | 'MATERNITY' | 'ICU' | 'HDU' | 'ISOLATION' | 'GENERAL' | 'VIP_PRIVATE';
  floorWing: string;
  dailyRate: number;
  nurseInCharge?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BedRecord {
  id: string;
  tenantId: string;
  wardId: string;
  wardName: string;
  roomNumber: string;
  bedNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
  currentPatientId?: string;
  currentPatientName?: string;
  currentPatientNumber?: string;
  currentAdmissionId?: string;
}

export interface InpatientAdmissionRecord {
  id: string;
  tenantId: string;
  admissionNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  admittingDoctorId: string;
  admittingDoctorName: string;
  admissionDate: string;
  dischargeDate?: string;
  wardId: string;
  wardName: string;
  bedId: string;
  bedNumber: string;
  admissionReason: string;
  primaryDiagnosis: string;
  status: 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED' | 'DECEASED';
  dischargeSummary?: {
    conditionAtDischarge: string;
    dischargeMedications: string;
    followUpInstructions: string;
    dischargeType: 'NORMAL' | 'AGAINST_MEDICAL_ADVICE' | 'TRANSFERRED' | 'DECEASED';
  };
  totalDays: number;
  totalCost?: number;
  createdAt: string;
}

export interface NursingCareRecord {
  id: string;
  tenantId: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  wardName: string;
  bedNumber: string;
  shiftType: 'DAY' | 'NIGHT';
  vitals: {
    temperature: number;
    pulse: number;
    systolicBp: number;
    diastolicBp: number;
    respRate: number;
    spO2: number;
  };
  fluidIntakeMl: number;
  fluidOutputMl: number;
  nursingAssessment: string;
  carePlan: string;
  notes: string;
  recordedBy: string;
  recordedAt: string;
}

export interface MedicationAdministrationRecord {
  id: string;
  tenantId: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  administeredTime?: string;
  status: 'ADMINISTERED' | 'REFUSED' | 'HELD' | 'MISSED';
  administeredBy: string;
  notes?: string;
}

export interface TheatreRoomRecord {
  id: string;
  tenantId: string;
  roomName: string;
  roomNumber: string;
  theatreType: 'MAIN_OR' | 'MINOR_THEATRE' | 'OB_GYN_THEATRE' | 'OPHTHALMIC_THEATRE' | 'EMERGENCY_OR';
  status: 'AVAILABLE' | 'IN_SURGERY' | 'CLEANING' | 'MAINTENANCE';
}

export interface TheatreSurgeryRecord {
  id: string;
  tenantId: string;
  bookingNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  procedureName: string;
  theatreRoomId: string;
  theatreRoomName: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  leadSurgeonName: string;
  anaesthetistName: string;
  scrubNurseName?: string;
  circulatingNurseName?: string;
  anaesthesiaType: 'GENERAL' | 'SPINAL' | 'EPIDURAL' | 'LOCAL' | 'SEDATION';
  preOpDiagnosis: string;
  postOpDiagnosis?: string;
  procedureFindings?: string;
  surgicalNotes?: string;
  consumablesUsed?: { itemName: string; quantity: number; cost: number }[];
  recoveryStatus: 'PRE_OP' | 'IN_THEATRE' | 'PACU_RECOVERY' | 'TRANSFERRED_TO_WARD' | 'DISCHARGED';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface BillingInvoiceItem {
  id: string;
  category: 'CONSULTATION' | 'PHARMACY' | 'LABORATORY' | 'RADIOLOGY' | 'PROCEDURE' | 'WARD_BED' | 'THEATRE' | 'NURSING' | 'AMBULANCE' | 'OTHER';
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  coveredByInsurance?: boolean;
}

export interface MedicalBillingInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentType: 'CASH' | 'INSURANCE' | 'CORPORATE' | 'SPLIT';
  insuranceProviderName?: string;
  claimNumber?: string;
  preAuthCode?: string;
  items: BillingInvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CLAIM_PENDING' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface MedicalPaymentRecord {
  id: string;
  tenantId: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  paymentMethod: 'MPESA' | 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'INSURANCE_CLAIM';
  transactionReference: string;
  mpesaPhone?: string;
  receivedBy: string;
  receivedAt: string;
  notes?: string;
}

export interface InsuranceProviderRecord {
  id: string;
  tenantId: string;
  providerName: string; // e.g. "SHA / NHIF", "Jubilee Health", "AAR Insurance", "Britam", "CIC Health"
  providerCode: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  acceptedSchemes: string[];
  portalUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface InsuranceClaimRecord {
  id: string;
  tenantId: string;
  claimNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  insuranceProviderId: string;
  insuranceProviderName: string;
  schemeName: string;
  memberNumber: string;
  policyNumber: string;
  principalMemberName: string;
  preAuthCode?: string;
  diagnosisCode?: string;
  totalClaimAmount: number;
  approvedAmount: number;
  status: 'DRAFT' | 'SUBMITTED' | 'PRE_AUTHORIZED' | 'APPROVED' | 'REJECTED' | 'RECONCILED';
  dateSubmitted: string;
  dateProcessed?: string;
  rejectionReason?: string;
  reconciliationNotes?: string;
}

export interface HealthcareSupplier {
  id: string;
  tenantId: string;
  supplierName: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  categoriesSupplied: string[];
  taxPin?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface HealthcareInventoryItem {
  id: string;
  tenantId: string;
  itemCode: string;
  itemName: string;
  category: 'MEDICAL_SUPPLIES' | 'SURGICAL_CONSUMABLES' | 'LAB_REAGENTS' | 'RADIOLOGY_FILMS' | 'EQUIPMENT' | 'OFFICE_SUPPLIES' | 'OTHER';
  unitOfMeasure: string; // e.g. "Box of 100", "Pieces", "Rolls", "Pack"
  stockOnHand: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  locationRoom?: string;
  supplierName?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface AmbulanceRecord {
  id: string;
  tenantId: string;
  registrationNumber: string; // e.g. "KDA 123A"
  callSign: string; // e.g. "MED-01"
  vehicleModel: string;
  equipmentLevel: 'BASIC_LIFE_SUPPORT' | 'ADVANCED_LIFE_SUPPORT' | 'PATIENT_TRANSPORT' | 'ICU_MOBILE';
  driverName: string;
  driverPhone: string;
  paramedicName?: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'ON_TRIP' | 'MAINTENANCE' | 'OFF_DUTY';
  fuelLevel: string;
  mileageKm: number;
}

export interface AmbulanceTripRecord {
  id: string;
  tenantId: string;
  tripNumber: string;
  ambulanceId: string;
  registrationNumber: string;
  patientName?: string;
  pickupLocation: string;
  destinationLocation: string;
  emergencyType: string;
  requestTime: string;
  dispatchTime?: string;
  arrivalSceneTime?: string;
  arrivalHospitalTime?: string;
  driverName: string;
  crewMembers?: string;
  tripStatus: 'REQUESTED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED' | 'CANCELLED';
  tripCost: number;
  paymentStatus: 'BILLED' | 'PAID' | 'FREE_SERVICE';
}

export interface BloodDonorRecord {
  id: string;
  tenantId: string;
  donorNumber: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  bloodGroup: BloodGroup;
  phone: string;
  email?: string;
  dateOfBirth: string;
  lastDonationDate?: string;
  totalDonations: number;
  status: 'ELIGIBLE' | 'DEFERRED' | 'PERMANENTLY_INELIGIBLE';
}

export interface BloodUnitRecord {
  id: string;
  tenantId: string;
  unitNumber: string;
  donorNumber?: string;
  bloodGroup: BloodGroup;
  componentType: 'WHOLE_BLOOD' | 'PACKED_RED_CELLS' | 'FRESH_FROZEN_PLASMA' | 'PLATELETS' | 'CRYOPRECIPITATE';
  volumeMl: number;
  collectionDate: string;
  expiryDate: string;
  testingStatus: 'TESTING_PENDING' | 'SCREENED_NEGATIVE' | 'SCREENED_POSITIVE' | 'DISCARDED';
  storageLocation: string; // e.g. "Fridge 1 - Shelf B"
  status: 'AVAILABLE' | 'RESERVED' | 'ISSUED' | 'TRANSFUSED' | 'EXPIRED' | 'DISCARDED';
}

export interface BloodTransfusionRecord {
  id: string;
  tenantId: string;
  transfusionNumber: string;
  unitId: string;
  unitNumber: string;
  bloodGroup: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorName: string;
  crossMatchResult: 'COMPATIBLE' | 'INCOMPATIBLE';
  transfusionDate: string;
  reactionsObserved: boolean;
  reactionNotes?: string;
  administeredBy: string;
}

export interface MortuaryRecord {
  id: string;
  tenantId: string;
  mortuaryNumber: string; // e.g. "MORT-2026-001"
  deceasedFullName: string;
  deceasedGender: 'MALE' | 'FEMALE';
  deceasedAge: number;
  nationalId?: string;
  dateOfDeath: string;
  dateReceived: string;
  timeReceived: string;
  causeOfDeath?: string;
  receivedFromFacility?: string;
  receivingOfficer: string;
  coldChamberNumber: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelation: string;
  releaseDate?: string;
  releasedToName?: string;
  releasedToId?: string;
  burialPermitNumber?: string;
  status: 'ADMITTED' | 'AUTOPSY_PENDING' | 'READY_FOR_RELEASE' | 'RELEASED';
  dailyStorageRate: number;
  totalDays: number;
  billTotal: number;
  billPaid: boolean;
}

export interface StaffShiftRecord {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  professionalRole: string;
  departmentName: string;
  shiftDate: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'ON_CALL';
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
  clockInTime?: string;
  clockOutTime?: string;
}

// Healthcare Universal Type Definitions & Aliases for Component Views
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'DECEASED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type TriageCategory = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export interface Patient {
  id: string;
  tenantId: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string;
  age?: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: BloodGroup;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    principalMember?: string;
  };
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QueueEntry {
  id: string;
  tenantId: string;
  queueNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  department: string;
  priority: TriageCategory;
  status: 'WAITING' | 'TRIAGED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  checkInTime: string;
  vitalsRecorded?: boolean;
}

export interface TriageAssessment {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  vitals: {
    bloodPressure: string;
    temperatureCelsius: number;
    heartRateBpm: number;
    respiratoryRateBpm: number;
    oxygenSaturationSpo2: number;
    weightKg: number;
    heightCm: number;
    bmi: number;
    randomBloodSugarMgDl?: number;
    painScale: number;
  };
  category: TriageCategory;
  chiefComplaint: string;
  nurseNotes?: string;
  triagedBy: string;
  triagedByName: string;
  triagedAt: string;
}

export interface Prescription {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  doctorId: string;
  doctorName: string;
  items: {
    id: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    instructions: string;
    unitPrice: number;
    totalPrice: number;
    isDispensed?: boolean;
  }[];
  notes?: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  prescribedAt: string;
}

export interface LabRequest {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  doctorId: string;
  doctorName: string;
  testId?: string;
  testName?: string;
  testCategory?: string;
  tests?: {
    testId: string;
    testName: string;
    category: string;
    price: number;
    status: 'REQUESTED' | 'SAMPLE_COLLECTED' | 'COMPLETED';
    result?: string;
    referenceRange?: string;
    flag?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
    notes?: string;
  }[];
  result?: {
    parameter?: string;
    value?: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal?: boolean;
    interpretation?: string;
  };
  technicianId?: string;
  technicianName?: string;
  clinicalNotes?: string;
  status: 'REQUESTED' | 'COLLECTED' | 'PROCESSING' | 'COMPLETED';
  requestedAt: string;
  completedAt?: string;
}

export interface LabTestItem {
  id: string;
  name: string;
  category: string;
  sampleType?: string;
  price: number;
  unit?: string;
  referenceRange: string;
  tatHours?: number;
}

export interface RadiologyRequest {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  doctorId: string;
  doctorName: string;
  modality: 'X_RAY' | 'ULTRASOUND' | 'CT_SCAN' | 'MRI' | 'MAMMOGRAPHY' | 'ECHOCARDIOGRAM' | 'DENTAL_XRAY' | 'OTHER';
  procedureName: string;
  clinicalNotes: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  findings?: string;
  impression?: string;
  status: 'REQUESTED' | 'PERFORMED' | 'REPORTED';
  requestedAt: string;
}

export interface InpatientWard {
  id: string;
  tenantId: string;
  name: string;
  wardType: 'GENERAL' | 'ICU' | 'HDU' | 'PEDIATRIC' | 'MATERNITY' | 'SURGICAL' | 'ISOLATION' | 'VIP';
  gender: 'MALE' | 'FEMALE' | 'MIXED' | 'PEDIATRIC';
  floorNumber: string;
  dailyRate: number;
  isActive: boolean;
}

export interface InpatientBed {
  id: string;
  tenantId: string;
  wardId: string;
  wardName: string;
  bedNumber: string;
  bedType: 'STANDARD' | 'ICU' | 'ELECTRIC' | 'PEDIATRIC_COT' | 'INCUBATOR';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
  dailyRate: number;
  currentPatientId?: string;
  currentPatientName?: string;
}

export interface InpatientAdmission {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  wardId: string;
  wardName: string;
  bedId?: string;
  bedNumber: string;
  admittingDoctorId: string;
  admittingDoctorName: string;
  diagnosis: string;
  reason: string;
  admissionDate: string;
  dischargeDate?: string;
  status: 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED';
  dischargeSummary?: string;
}

export interface MedicationAdministration {
  id: string;
  tenantId: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  medicineName: string;
  dosage: string;
  route: 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL' | 'INHALATION';
  administeredByNurseId: string;
  administeredByNurseName: string;
  administeredAt: string;
  status: 'GIVEN' | 'REFUSED' | 'OMITTED';
  notes?: string;
}

export interface MedicineItem {
  id: string;
  tenantId: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockOnHand: number;
  reorderLevel: number;
  status: 'ACTIVE' | 'DISCONTINUED';
}

export interface PharmacyDispense {
  id: string;
  tenantId: string;
  prescriptionId?: string;
  patientId: string;
  patientName: string;
  mrn: string;
  items: {
    medicineId: string;
    medicineName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  dispensedBy: string;
  dispensedAt: string;
}

export interface TheatreBooking {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  theatreRoom: string;
  procedureName: string;
  procedureType: 'ELECTIVE' | 'EMERGENCY' | 'DAY_CARE';
  scheduledStartTime: string;
  scheduledEndTime: string;
  leadSurgeonId: string;
  leadSurgeonName: string;
  anesthesiologistName?: string;
  anesthesiaType?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  operationNotes?: string;
  postOpInstructions?: string;
}

export interface MedicalInvoiceItem {
  id: string;
  description: string;
  category: 'CONSULTATION' | 'PHARMACY' | 'LABORATORY' | 'RADIOLOGY' | 'WARD_BED' | 'SURGERY' | 'PROCEDURE' | 'OTHER';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MedicalInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  paymentType: 'CASH' | 'INSURANCE' | 'CO_PAY';
  insuranceProvider?: string;
  policyNumber?: string;
  items: MedicalInvoiceItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

export interface InsuranceClaim {
  id: string;
  tenantId: string;
  claimNumber: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  insuranceProvider: string;
  policyNumber: string;
  claimAmount: number;
  preAuthCode?: string;
  diagnosisCode?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SETTLED';
  createdAt: string;
}

export interface AmbulanceVehicle {
  id: string;
  tenantId: string;
  vehicleRegNumber: string;
  model: string;
  type: string;
  driverName?: string;
  paramedicName?: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE';
}

export interface AmbulanceTrip {
  id: string;
  tenantId: string;
  ambulanceId: string;
  vehicleRegNumber: string;
  driverName: string;
  paramedicName: string;
  patientName: string;
  pickupLocation: string;
  destinationLocation: string;
  priority: 'CRITICAL' | 'URGENT' | 'ROUTINE';
  chiefComplaint: string;
  dispatchedAt: string;
}

export interface BloodInventoryUnit {
  id: string;
  tenantId: string;
  unitNumber: string;
  bloodGroup: string;
  donorName?: string;
  volumeMl: number;
  collectionDate: string;
  expiryDate: string;
  screeningStatus: 'PASSED' | 'FAILED' | 'PENDING';
  status: 'AVAILABLE' | 'TRANSFUSED' | 'EXPIRED' | 'DISCARDED';
}

export interface MortuaryIntake {
  id: string;
  tenantId: string;
  tagNumber: string;
  deceasedName: string;
  dateOfDeath: string;
  causeOfDeath: string;
  chamberNumber: string;
  nextOfKin?: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'INTAKE' | 'RELEASED';
}


