/**
 * Multi-Tenant SaaS ERP Types & Interface Definitions
 */

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'TENANT_ADMIN' 
  | 'TENANT_USER'
  | 'STUDENT'
  | 'CANDIDATE'
  | 'TEACHER'
  | 'EXAMINER'
  | 'MODERATOR'
  | 'RPL_ASSESSOR'
  | 'EXAMINATION_OFFICER'
  | 'REGISTRAR'
  | 'ACADEMIC_ADMIN'
  | 'MEDIA_ADMIN'
  | 'FINANCE_OFFICER';

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
  | 'BASIC_EDUCATION'
  | 'JUNIOR_SECONDARY'
  | 'COMPREHENSIVE_SCHOOL'
  | 'TRAINING_INSTITUTE';

export type AcademicStructureMode = 
  | 'GRADE_STREAM' 
  | 'COURSE_CLASS_UNIT' 
  | 'HYBRID';

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
  | 'restaurant'
  | 'theology'
  | 'media';

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
  primaryBtnAction?: 'apply' | 'programs' | 'departments' | 'admissions' | 'campuses' | 'news' | 'about' | 'login' | 'quote' | 'catalog' | 'appointment' | 'contact' | 'custom';
  primaryBtnUrl?: string;
  secondaryBtnText?: string;
  secondaryBtnAction?: 'apply' | 'programs' | 'departments' | 'admissions' | 'campuses' | 'news' | 'about' | 'login' | 'quote' | 'catalog' | 'appointment' | 'contact' | 'custom';
  secondaryBtnUrl?: string;
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
  announcementBarEnabled?: boolean;
  announcementBarText?: string;
  announcementBarLink?: string;
  aboutHeadline?: string;
  aboutText?: string;
  aboutImage?: string;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  operatingHours?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  whatsappPhone?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  admissionNotice?: string;
  admissionRequirements?: string[];
  news?: TenantPublicNews[];
  events?: TenantPublicEvent[];
  customMetaTitle?: string;
  customMetaDescription?: string;
  typography?: PublicWebsiteTypographyConfig;
}

export type PlatformPermission =
  | 'platform.domains.view'
  | 'platform.domains.create'
  | 'platform.domains.edit'
  | 'platform.domains.delete'
  | 'platform.domains.verify'
  | 'platform.domains.manage_routing'
  | 'platform.tenants.view'
  | 'platform.tenants.create'
  | 'platform.tenants.manage'
  | 'platform.users.manage'
  | 'platform.settings.manage';

export type TenantPermission =
  | 'organization.profile.view'
  | 'organization.branding.manage'
  | 'organization.website.view'
  | 'organization.website.manage'
  | 'organization.users.view'
  | 'organization.users.manage'
  | 'organization.reports.view'
  | 'organization.modules.access';

export type DomainType = 'SUBDOMAIN' | 'CUSTOM';
export type DomainVerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED';
export type DomainSslStatus = 'PENDING' | 'ACTIVE' | 'FAILED' | 'ISSUING';

export interface TenantDnsRecord {
  type: 'CNAME' | 'TXT' | 'A';
  name: string;
  value: string;
  purpose: 'ROUTING' | 'VERIFICATION';
  status: 'PENDING' | 'CONFIGURED' | 'FAILED';
}

export interface TenantDomain {
  id: string;
  tenantId: string;
  domain: string; // e.g. "www.examplehospital.co.ke" or "hospital.davetech.co.ke"
  normalizedDomain: string;
  type: DomainType;
  verificationStatus: DomainVerificationStatus;
  isPrimary: boolean;
  sslStatus: DomainSslStatus;
  verificationToken?: string;
  dnsRecords?: TenantDnsRecord[];
  failureReason?: string;
  lastCheckedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTenantInfo {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  domainType?: 'subdomain' | 'custom';
  customDomain?: string | null;
  domains?: TenantDomain[];
  primaryDomain?: string;
  type: TenantType;
  educationType?: EducationType;
  academicStructureMode?: AcademicStructureMode;
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

export interface SaaSSubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'annually' | 'quarterly';
  priceDisplay?: string;
  description: string;
  tagline?: string;
  maxUsers: number; // -1 for unlimited
  maxStorageGb?: number;
  moduleLimit?: number; // -1 for unlimited
  includedModules?: ModuleId[];
  allowCustomDomain: boolean;
  allowPublicWebsite: boolean;
  prioritySupport: boolean;
  slaUptime?: string;
  isPopular?: boolean;
  isActive: boolean;
  features: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
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
  offlineConfig?: PlatformOfflineConfig;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  domainType?: 'subdomain' | 'custom';
  customDomain?: string | null;
  domains?: TenantDomain[];
  primaryDomain?: string;
  type: TenantType;
  educationType?: EducationType;
  academicStructureMode?: AcademicStructureMode;
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
  offlineConfig?: TenantOfflineConfig;
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
  studentId?: string;
  staffId?: string;
  admissionNo?: string;
  staffNo?: string;
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

export interface SchoolGrade {
  id: string;
  tenantId: string;
  name: string; // e.g. "Grade 1", "Grade 2", ..., "Grade 9", "PP1", "PP2"
  code: string; // e.g. "G1", "G2", "G3", ..., "G9"
  levelNumber: number; // 1 to 9
  category: 'EARLY_YEARS' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY' | 'JUNIOR_SCHOOL' | 'SENIOR_SECONDARY' | 'OTHER';
  stage?: 'EARLY_YEARS' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY' | 'JUNIOR_SCHOOL' | 'SENIOR_SECONDARY' | 'OTHER';
  description?: string;
  learningAreas?: string[]; // Core CBC / Basic education subjects (e.g. Mathematics, English, Kiswahili, Integrated Science)
  headTeacherId?: string;
  headTeacherName?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  room?: string;
  capacity?: number;
  orderIndex: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface GradeStream {
  id: string;
  tenantId: string;
  gradeId: string;
  gradeName: string; // e.g. "Grade 4"
  name: string; // e.g. "A", "B", "C", "Blue", "Red", "Gold"
  fullName: string; // e.g. "Grade 4A", "Grade 4 Blue"
  code: string; // e.g. "G4-A"
  academicYear: string; // e.g. "2026"
  academicTerm?: string; // e.g. "Term 1"
  campusId?: string;
  campusName?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  roomVenue?: string;
  room?: string;
  capacity?: number;
  enrolledCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPromotionRecord {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  fromGradeId?: string;
  fromGradeName?: string;
  fromStreamId?: string;
  fromStreamName?: string;
  toGradeId?: string;
  toGradeName?: string;
  toStreamId?: string;
  toStreamName?: string;
  fromAcademicYear: string;
  toAcademicYear: string;
  promotionType: 'PROMOTED' | 'REPEATED' | 'GRADUATED' | 'TRANSFERRED' | 'DEMOTED';
  promotedAt: string;
  promotedBy: string;
  notes?: string;
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
  assessmentNumber?: string; // e.g. UPI / Nemis / Assessment Number for Basic & Primary education
  learnerAssessmentNo?: string;
  address?: string;
  // Higher Ed / TVET structure:
  programId: string;
  programName: string;
  departmentId?: string;
  departmentName?: string;
  classId?: string;
  className?: string;
  // Modern Primary / Junior School structure (School -> Grade -> Stream -> Students):
  gradeId?: string;
  gradeName?: string; // e.g. "Grade 4"
  streamId?: string;
  streamName?: string; // e.g. "Grade 4A"
  learningStage?: 'EARLY_YEARS' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY' | 'JUNIOR_SCHOOL' | 'SENIOR_SECONDARY' | 'OTHER';
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
  gradeId?: string;
  gradeName?: string;
  streamId?: string;
  streamName?: string;
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
  gradeId?: string;
  gradeName?: string;
  streamId?: string;
  streamName?: string;
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
  name?: string;
  targetType?: 'PROGRAM' | 'GRADE' | 'CLASS' | 'ALL';
  programId?: string;
  programName?: string;
  gradeId?: string;
  gradeName?: string;
  classId?: string;
  className?: string;
  academicYear?: string;
  academicTerm?: string;
  term?: string; // alias
  tuitionFee: number;
  examFee: number;
  libraryFee: number;
  activityFee: number;
  boardingFee?: number;
  transportFee?: number;
  labFee?: number;
  developmentFee?: number;
  otherFees?: number;
  items?: Array<{ feeType?: string; description?: string; name?: string; amount: number; isMandatory?: boolean; category?: string }>;
  totalFee: number;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentInvoice {
  id: string;
  tenantId: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  programId?: string;
  programName?: string;
  gradeId?: string;
  gradeName?: string;
  streamId?: string;
  streamName?: string;
  classId?: string;
  className?: string;
  academicTerm: string;
  term?: string; // alias
  academicYear: string;
  feeStructureId?: string;
  feeStructureName?: string;
  items: Array<{ description: string; name?: string; amount: number; category?: string }>;
  discountAmount?: number;
  discountReason?: string;
  subtotal?: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  issueDate: string;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  notes?: string;
  paymentInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeePayment {
  id: string;
  tenantId: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  gradeId?: string;
  gradeName?: string;
  streamId?: string;
  streamName?: string;
  programId?: string;
  programName?: string;
  classId?: string;
  className?: string;
  invoiceId?: string;
  invoiceNo?: string;
  academicYear?: string;
  academicTerm?: string;
  amount: number;
  paymentMethod: 'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'CASH';
  referenceNo: string;
  paidAt: string;
  receivedBy: string;
  bankName?: string;
  chequeNo?: string;
  notes?: string;
  balanceAfterPayment?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeStatementEntry {
  id: string;
  date: string;
  type: 'INVOICE' | 'PAYMENT' | 'WAIVER' | 'REFUND';
  referenceNo: string;
  description: string;
  term?: string;
  academicYear?: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface StudentFeeStatement {
  student: Student;
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    totalWaivers: number;
    currentBalance: number;
    lastPaymentDate?: string;
    lastPaymentAmount?: number;
    status: 'SETTLED' | 'PARTIAL' | 'ARREARS' | 'OVERPAID';
  };
  entries: FeeStatementEntry[];
  generatedAt: string;
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
// EDUCATION ENHANCED TYPES (QR Attendance, Portals, Transcripts & Certificates)
// ==========================================

export interface AttendanceSession {
  id: string;
  tenantId: string;
  sessionCode: string; // e.g. "ATT-2026-X89K"
  sessionToken: string; // short-lived cryptographically secure random token
  classId: string;
  className: string;
  unitId: string;
  unitCode: string;
  unitName: string;
  teacherId: string;
  teacherName: string;
  date: string;
  lessonTitle: string;
  venue?: string;
  expiresAt: string; // ISO date string
  durationMinutes: number; // e.g. 10, 15, 30
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  attendeeCount: number;
  createdAt: string;
}

export interface AttendanceScanRecord {
  id: string;
  tenantId: string;
  sessionId: string;
  sessionCode: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classId: string;
  unitId: string;
  teacherId: string;
  scannedAt: string;
  status: 'PRESENT' | 'LATE';
  deviceInfo?: string;
}

export interface TranscriptUnit {
  unitCode: string;
  unitName: string;
  academicYear: string;
  academicTerm: string;
  creditHours: number;
  catScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  gradePoints: number;
  remarks: string;
}

export interface AcademicTranscript {
  id: string;
  tenantId: string;
  documentNumber: string; // e.g. "TR-2026-0001"
  studentId: string;
  studentName: string;
  admissionNo: string;
  programId: string;
  programName: string;
  departmentName: string;
  campusName: string;
  enrollmentDate: string;
  completionDate?: string;
  academicStanding: 'EXCELLENT' | 'GOOD STANDING' | 'PASS' | 'PROBATION' | 'COMPLETED';
  gpa: number; // e.g. 3.75
  totalCreditHours: number;
  totalPoints: number;
  units: TranscriptUnit[];
  gradingScaleSummary: string;
  issuedBy: string;
  issuedAt: string;
  verificationCode: string;
  verificationUrl: string;
  qrCodeDataUrl?: string;
}

export interface AcademicCertificate {
  id: string;
  tenantId: string;
  certificateNumber: string; // e.g. "CERT-2026-0001"
  studentId: string;
  studentName: string;
  admissionNo: string;
  programId: string;
  programName: string;
  departmentName?: string;
  awardType: 'DEGREE' | 'DIPLOMA' | 'HIGHER_DIPLOMA' | 'CERTIFICATE' | 'SHORT_COURSE' | 'VOCATIONAL_AWARD';
  awardTitle: string; // e.g. "Diploma in Information Communication Technology (DICT)"
  classification?: string; // e.g. "Distinction", "Credit", "Pass", "First Class Honours"
  completionDate: string;
  issueDate: string;
  signatory1Title: string; // e.g. "Principal / Vice Chancellor"
  signatory1Name: string;
  signatory2Title: string; // e.g. "Academic Registrar"
  signatory2Name: string;
  verificationCode: string;
  verificationUrl: string;
  qrCodeDataUrl?: string;
  status: 'ISSUED' | 'REVOKED';
}

export interface AdmissionLetter {
  id: string;
  tenantId: string;
  letterNumber: string; // e.g. "ADM-2026-0001"
  studentId: string;
  studentName: string;
  admissionNo: string;
  nationalId?: string;
  programId: string;
  programName: string;
  departmentName: string;
  campusName: string;
  intake: string;
  academicYear: string;
  reportingDate: string;
  duration: string; // e.g. "2 Academic Years (6 Semesters)"
  termTuitionFee: number;
  statutoryFees: number;
  admissionConditions: string[];
  issuedBy: string;
  issueDate: string;
  verificationCode: string;
  verificationUrl: string;
  qrCodeDataUrl?: string;
}

export interface DocumentVerificationRecord {
  id: string;
  tenantId: string;
  verificationCode: string; // unique public code
  documentType: 'TRANSCRIPT' | 'CERTIFICATE' | 'ADMISSION_LETTER';
  documentNumber: string;
  studentNameMasked: string; // e.g. "J*** K***"
  admissionNo: string;
  programName: string;
  institutionName: string;
  issueDate: string;
  status: 'OFFICIAL_VERIFIED' | 'REVOKED' | 'EXPIRED';
  verifiedCount: number;
  lastVerifiedAt?: string;
}

export type EducationPermission =
  | 'education.students.view'
  | 'education.students.create'
  | 'education.students.edit'
  | 'education.students.delete'
  | 'education.staff.view'
  | 'education.staff.manage'
  | 'education.courses.view'
  | 'education.courses.manage'
  | 'education.departments.view'
  | 'education.departments.manage'
  | 'education.units.view'
  | 'education.units.manage'
  | 'education.classes.view'
  | 'education.classes.manage'
  | 'education.timetable.view'
  | 'education.timetable.manage'
  | 'education.attendance.view'
  | 'education.attendance.manage'
  | 'education.attendance.scan'
  | 'education.results.view'
  | 'education.results.enter'
  | 'education.results.edit'
  | 'education.results.approve'
  | 'education.admissions.view'
  | 'education.admissions.manage'
  | 'education.transcripts.generate'
  | 'education.certificates.generate'
  | 'education.admission_letters.generate'
  | 'education.fees.view'
  | 'education.fees.manage'
  | 'education.reports.view';

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
  minWholesaleQty?: number;
  quantityInStock: number;
  minStockAlert: number;
  unit: string;
  size?: string;
  color?: string;
  gender?: 'MEN' | 'WOMEN' | 'KIDS' | 'UNISEX' | string;
  clothingCondition?: 'BRAND_NEW' | 'GRADE_1' | 'GRADE_2' | 'CREME' | string;
  baleNumber?: string;
  batchNumber?: string;
  taxRate?: number;
  authorOrBrand?: string;
  isbnOrCode?: string;
  description?: string;
  imageUrl?: string;
  itemTrackingType?: 'QUANTITY_BASED' | 'UNIQUE_ITEM';
  clothingAttributes?: ClothingAttributes;
  variants?: ProductVariant[];
  warehouseId?: string;
  warehouseName?: string;
  branchId?: string;
  branchName?: string;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'INACTIVE';
}

export interface PosSaleItem {
  productId: string;
  productName: string;
  sku?: string;
  unitPrice: number;
  costPrice?: number;
  quantity: number;
  taxPercent?: number;
  taxRate?: number;
  discountAmount?: number;
  discount?: number;
  total: number;
  notes?: string;
  clothingItemCode?: string;
  size?: string;
  color?: string;
  variantId?: string;
}

export interface PosSaleOrder {
  id: string;
  tenantId: string;
  receiptNo: string;
  receiptNumber?: string;
  items: PosSaleItem[];
  subtotal: number;
  discount: number;
  discountAmount?: number;
  tax: number;
  taxAmount?: number;
  grandTotal: number;
  totalAmount?: number;
  paymentMethod: 'CASH' | 'MPESA' | 'CARD' | 'CREDIT' | 'BANK_TRANSFER' | 'SPLIT' | 'ROOM_CHARGE';
  paymentReference?: string;
  splitPayments?: PosPaymentSplit[];
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  date: string;
  createdAt?: string;
  saleType: 'RETAIL' | 'WHOLESALE' | 'POS' | 'RESTAURANT' | 'BOOKSHOP' | 'BAR' | 'HOTEL' | 'MITUMBA';
  tableOrRoomNo?: string;
  tableNumber?: string;
  tableId?: string;
  roomNumber?: string;
  guestId?: string;
  waiterId?: string;
  waiterName?: string;
  tabId?: string;
  shiftId?: string;
  branchId?: string;
  warehouseId?: string;
  amountTendered?: number;
  changeGiven?: number;
  changeDue?: number;
  discountType?: 'PERCENT' | 'FIXED';
  discountApprovedBy?: string;
  notes?: string;
  status: 'COMPLETED' | 'HOLD' | 'CANCELLED' | 'REFUNDED';
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
  movementType: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUBTRACT' | 'DAMAGE' | 'DAMAGE_WASTE' | 'EXPIRED' | 'RETURN' | 'TRANSFER';
  quantityChanged: number;
  balanceAfter: number;
  warehouseId?: string;
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
  employmentStatus: 'FULL_TIME' | 'CONTRACT' | 'PROBATION' | 'TERMINATED' | 'ON_LEAVE' | 'SUSPENDED';
  allowances: number;
  deductions: number;
  contractEndDate?: string;
  kraPin?: string;
  nssfNo?: string;
  nhifShifNo?: string;
  bankName?: string;
  bankAccountNo?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WarningLevel = 'FIRST_WARNING' | 'SECOND_WARNING' | 'FINAL_WARNING' | 'PERFORMANCE_IMPROVEMENT_PLAN';
export type InfractionCategory = 
  | 'ATTENDANCE_TARDINESS'
  | 'INSUBORDINATION'
  | 'POLICY_VIOLATION'
  | 'NEGLIGENCE_OF_DUTY'
  | 'GROSS_MISCONDUCT'
  | 'FINANCIAL_IRREGULARITY'
  | 'POOR_PERFORMANCE'
  | 'CONFIDENTIALITY_BREACH'
  | 'WORKPLACE_SAFETY'
  | 'OTHER';

export interface StaffWarningLetter {
  id: string;
  tenantId: string;
  letterNumber: string; // e.g. WRN-2026-0001
  employeeId: string;
  employeeName: string;
  employeeNo: string;
  department: string;
  jobTitle: string;
  warningLevel: WarningLevel;
  infractionCategory: InfractionCategory;
  incidentDate: string;
  incidentDescription: string;
  priorDiscussionDate?: string;
  requiredCorrectiveActions: string;
  improvementTimelineDays: number; // e.g. 30
  consequenceSummary: string;
  issuedBy: string;
  issuedByTitle: string;
  issuedAt: string;
  status: 'ISSUED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';
  employeeSignatureDate?: string;
  employeeRemarks?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TerminationType = 
  | 'SUMMARY_DISMISSAL'
  | 'TERMINATION_WITH_NOTICE'
  | 'REDUNDANCY'
  | 'END_OF_CONTRACT'
  | 'PROBATION_FAILURE'
  | 'MUTUAL_SEPARATION'
  | 'RESIGNATION_ACCEPTANCE';

export interface StaffTerminationLetter {
  id: string;
  tenantId: string;
  letterNumber: string; // e.g. TRM-2026-0001
  employeeId: string;
  employeeName: string;
  employeeNo: string;
  department: string;
  jobTitle: string;
  terminationType: TerminationType;
  effectiveDate: string;
  lastWorkingDate: string;
  groundsForTermination: string;
  noticePeriodProvidedDays: number;
  severanceOrFinalDuesDescription?: string;
  finalSettlementAmount?: number;
  clearanceRequirements: string[];
  certificateOfServiceIssued: boolean;
  issuedBy: string;
  issuedByTitle: string;
  issuedAt: string;
  status: 'ISSUED' | 'ACCEPTED' | 'SETTLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

// =========================================================================
// UNIVERSAL POS & BUSINESS MANAGEMENT DATA MODELS
// =========================================================================

export type PosBusinessType = 
  | 'GENERAL_RETAIL' 
  | 'SUPERMARKET' 
  | 'MITUMBA_CLOTHING' 
  | 'BOUTIQUE' 
  | 'BAR_LOUNGE' 
  | 'RESTAURANT_CAFE' 
  | 'HOTEL_LODGE' 
  | 'ELECTRONICS' 
  | 'HARDWARE' 
  | 'PHARMACY' 
  | 'WHOLESALE' 
  | 'BOOKSHOP'
  | 'MIXED';

export interface PosEnabledFeatures {
  retail: boolean;
  wholesale: boolean;
  mitumbaClothing: boolean;
  inventory: boolean;
  multiWarehouse: boolean;
  multiBranch: boolean;
  tables: boolean;
  restaurant: boolean;
  bar: boolean;
  kitchenKds: boolean;
  hotelRooms: boolean;
  hotelGuests: boolean;
  reservations: boolean;
  roomService: boolean;
  waiters: boolean;
  tabs: boolean;
  creditSales: boolean;
  customerAccounts: boolean;
  suppliers: boolean;
  purchases: boolean;
  stockTransfers: boolean;
  barcodeScanning: boolean;
  discounts: boolean;
  returns: boolean;
  expenses: boolean;
  shifts: boolean;
  allowOutOfStockSale: boolean;
  maxDiscountPercentCashier: number;
  maxDiscountPercentManager: number;
}

export type BusinessType = PosBusinessType;
export type CustomerCreditTransaction = PosCustomerTransaction;
export type KitchenTicket = KitchenOrderTicket;

export interface PosTenantConfig {
  id: string;
  tenantId: string;
  businessType: PosBusinessType;
  businessName: string;
  tagline?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxPin?: string;
  vatRatePercent: number; // e.g. 16%
  currency: string; // e.g. "KES"
  currencySymbol: string; // e.g. "KSh"
  receiptHeader?: string;
  receiptFooter?: string;
  termsAndConditions?: string;
  enabledFeatures: PosEnabledFeatures;
  defaultWarehouseId?: string;
  defaultBranchId?: string;
  updatedAt: string;
}

export interface ClothingAttributes {
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Free Size' | string;
  color?: string;
  gender?: 'Men' | 'Women' | 'Unisex' | 'Kids' | 'Baby';
  condition?: 'Grade A (Like New)' | 'Grade B (Good)' | 'Grade C (Economy)' | 'Brand New' | string;
  material?: string;
  itemCode?: string; // Unique piece tracking code e.g. "JKT-0045"
  baleNumber?: string;
  isSold?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size 42 - Blue"
  sku: string;
  barcode?: string;
  sellingPrice: number;
  wholesalePrice?: number;
  costPrice: number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  code: string; // e.g. "WH-MAIN"
  location: string;
  managerName?: string;
  phone?: string;
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code: string; // e.g. "BR-CBD"
  location: string;
  phone?: string;
  email?: string;
  isMainBranch: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PosCustomer {
  id: string;
  tenantId: string;
  customerNo: string; // e.g. "CUST-001"
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'VIP' | 'CORPORATE';
  creditLimit: number;
  currentBalance: number; // outstanding debt
  loyaltyPoints: number;
  totalSpent: number;
  taxPin?: string;
  notes?: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export interface PosCustomerTransaction {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  type: 'CREDIT_SALE' | 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  saleReceiptNo?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  date: string;
  recordedBy: string;
}

export interface PosSupplier {
  id: string;
  tenantId: string;
  supplierNo: string; // e.g. "SUP-001"
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  taxPin?: string;
  currentBalance: number; // money owed to supplier
  paymentTerms?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string; // e.g. "PO-2026-0001"
  supplierId: string;
  supplierName: string;
  warehouseId?: string;
  warehouseName?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'ORDERED' | 'PARTIAL_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  orderedDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface GoodsReceivedItem {
  productId: string;
  productName: string;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

export interface GoodsReceivedNote {
  id: string;
  tenantId: string;
  grnNumber: string; // e.g. "GRN-2026-0001"
  poId?: string;
  poNumber?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  items: GoodsReceivedItem[];
  totalAmount: number;
  supplierInvoiceNo?: string;
  receivedDate: string;
  receivedBy: string;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  tenantId: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  reference: string;
  date: string;
  paidBy: string;
  notes?: string;
}

export interface PosPaymentSplit {
  method: 'CASH' | 'MPESA' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'ROOM_CHARGE';
  amount: number;
  reference?: string;
}

export interface PosSaleReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  condition: 'RESTOCKABLE' | 'DAMAGED' | 'EXPIRED';
}

export interface PosSaleReturn {
  id: string;
  tenantId: string;
  returnNumber: string; // e.g. "RET-2026-0001"
  originalSaleId: string;
  originalReceiptNo: string;
  items: PosSaleReturnItem[];
  totalRefundAmount: number;
  refundMethod: 'CASH' | 'MPESA' | 'STORE_CREDIT';
  reason: string;
  customerName?: string;
  returnedByStaff: string;
  approvedByStaff?: string;
  date: string;
}

export interface CashierShift {
  id: string;
  tenantId: string;
  shiftNumber: string; // e.g. "SHF-2026-001"
  cashierId: string;
  cashierName: string;
  branchId?: string;
  branchName?: string;
  startTime: string;
  endTime?: string;
  openingCashFloat: number;
  cashSales: number;
  mpesaSales: number;
  cardSales: number;
  creditSales: number;
  roomChargeSales: number;
  totalSales: number;
  cashIn: number;
  cashOut: number;
  expensesTotal: number;
  expectedCashInDrawer: number;
  actualCashCount?: number;
  cashVariance?: number; // (actual - expected)
  status: 'OPEN' | 'CLOSED';
  closingNotes?: string;
}

export interface PosExpense {
  id: string;
  tenantId: string;
  expenseNumber: string;
  category: 'RENT' | 'TRANSPORT' | 'UTILITIES' | 'SALARIES' | 'SUPPLIES' | 'MAINTENANCE' | 'MEALS' | 'OTHER';
  description: string;
  amount: number;
  paymentMethod: 'CASH' | 'MPESA' | 'BANK_TRANSFER';
  shiftId?: string;
  branchId?: string;
  recordedBy: string;
  approvedBy?: string;
  receiptNumber?: string;
  date: string;
}

export interface BarTab {
  id: string;
  tenantId: string;
  tabNumber: string; // e.g. "TAB-014"
  tabName: string; // e.g. "Table 4 - John", "VIP Lounge - Alex"
  tableId?: string;
  tableName?: string;
  waiterId: string;
  waiterName: string;
  status: 'OPEN' | 'TRANSFERRED' | 'CLOSED';
  items: PosSaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  openedAt: string;
  closedAt?: string;
}

export interface KitchenTicketItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  station: 'KITCHEN' | 'BAR' | 'GRILL' | 'DESSERT';
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
}

export interface KitchenOrderTicket {
  id: string;
  tenantId: string;
  ticketNumber: string; // e.g. "KOT-104"
  saleOrderId?: string;
  tableId?: string;
  tableName?: string;
  roomNumber?: string;
  waiterName: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'ROOM_SERVICE' | 'BAR';
  station: 'KITCHEN' | 'BAR' | 'GRILL' | 'DESSERT';
  items: KitchenTicketItem[];
  specialInstructions?: string;
  status: 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface HotelRoomType {
  id: string;
  tenantId: string;
  name: string; // e.g. "Executive Deluxe Suite", "Standard Single"
  code: string;
  basePricePerNight: number;
  hourlyRate?: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
  description: string;
}

export interface HotelRoom {
  id: string;
  tenantId: string;
  roomNumber: string; // e.g. "101", "Villa 4"
  roomTypeId: string;
  roomTypeName: string;
  floor: string;
  pricePerNight: number;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  currentGuestId?: string;
  currentGuestName?: string;
  currentReservationId?: string;
  keyCardNumber?: string;
}

export interface HotelGuest {
  id: string;
  tenantId: string;
  guestNumber: string; // e.g. "GST-2026-001"
  fullName: string;
  nationalIdOrPassport: string;
  phone: string;
  email?: string;
  address?: string;
  nationality?: string;
  totalStays: number;
  notes?: string;
  createdAt: string;
}

export interface HotelFolioCharge {
  id: string;
  date: string;
  category: 'ROOM_STAY' | 'RESTAURANT' | 'BAR' | 'ROOM_SERVICE' | 'LAUNDRY' | 'SPA' | 'OTHER';
  description: string;
  amount: number;
  referenceNo?: string;
  servedBy?: string;
}

export interface HotelReservation {
  id: string;
  tenantId: string;
  reservationNumber: string; // e.g. "RSV-2026-0001"
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestIdPassport?: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  numAdults: number;
  numChildren: number;
  nightlyRate: number;
  totalNights: number;
  roomCharges: number;
  otherCharges: number;
  totalBill: number;
  amountPaid: number;
  balance: number;
  folioCharges: HotelFolioCharge[];
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  specialRequests?: string;
  createdAt: string;
}

export type PosPermission =
  | 'pos.dashboard.view'
  | 'pos.sales.view'
  | 'pos.sales.create'
  | 'pos.sales.edit'
  | 'pos.sales.cancel'
  | 'pos.products.view'
  | 'pos.products.create'
  | 'pos.products.edit'
  | 'pos.products.delete'
  | 'pos.inventory.view'
  | 'pos.inventory.adjust'
  | 'pos.inventory.transfer'
  | 'pos.purchases.view'
  | 'pos.purchases.create'
  | 'pos.purchases.approve'
  | 'pos.customers.view'
  | 'pos.customers.create'
  | 'pos.customers.edit'
  | 'pos.suppliers.view'
  | 'pos.suppliers.manage'
  | 'pos.credit.view'
  | 'pos.credit.manage'
  | 'pos.discounts.apply'
  | 'pos.discounts.approve'
  | 'pos.returns.create'
  | 'pos.returns.approve'
  | 'pos.cashier.open_shift'
  | 'pos.cashier.close_shift'
  | 'pos.reports.view'
  | 'pos.settings.manage'
  | 'pos.tables.manage'
  | 'pos.orders.manage'
  | 'pos.kitchen.manage'
  | 'pos.hotel.rooms.manage'
  | 'pos.hotel.reservations.manage'
  | 'pos.hotel.billing.manage';

/**
 * ============================================================================
 * BROOKS OF LIFE UK — THEOLOGICAL EXAMINATION MANAGEMENT SYSTEM (TEMS)
 * & BROOKS OF LIFE TV / CHRISTIAN MEDIA ECOSYSTEM INTERFACES
 * ============================================================================
 */

export type QualificationType = 
  | 'CERTIFICATE'
  | 'DIPLOMA'
  | 'HIGHER_DIPLOMA'
  | 'BACHELOR'
  | 'POSTGRADUATE_DIPLOMA'
  | 'MASTERS'
  | 'DOCTORATE'
  | 'MINISTERIAL_CREDENTIAL'
  | 'CONTINUING_MINISTRY_EDUCATION';

export type CandidateRegistrationStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ALUMNI'
  | 'WITHDRAWN';

export interface CandidateAcademicHistoryItem {
  institution: string;
  qualification: string;
  yearCompleted: string;
  gradeAwarded?: string;
  certificateRef?: string;
}

export interface CandidateExaminationHistoryItem {
  examSessionId: string;
  sessionCode: string;
  examDate: string;
  unitsRegistered: string[];
  totalScore?: number;
  averageGrade?: string;
  status: 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'COMPLETED';
}

export interface CandidateProfile {
  id: string;
  tenantId: string;
  candidateNumber: string; // e.g. "BOL/THEO/2026/001"
  userId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  nationalIdOrPassport: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  photoUrl?: string;
  programmeId: string;
  programmeName: string;
  qualificationType: QualificationType;
  level: string; // e.g. "Level 1", "Level 2", "Level 3", "Final Year"
  intake: string; // e.g. "September 2026", "January 2027"
  academicYear: string; // e.g. "2026/2027"
  registrationStatus: CandidateRegistrationStatus;
  registrationDate: string;
  denominationAffiliation?: string;
  homeChurch?: string;
  pastorReferenceName?: string;
  pastorReferenceContact?: string;
  academicHistory: CandidateAcademicHistoryItem[];
  examinationHistory: CandidateExaminationHistoryItem[];
  rplHistoryIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TheologicalDepartment {
  id: string;
  tenantId: string;
  code: string; // e.g. "BIBL", "THEO", "PAST", "APOL", "LEAD"
  name: string;
  headOfDepartment: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TheologicalUnitSubject {
  id: string;
  tenantId: string;
  programmeId: string;
  departmentId?: string;
  code: string; // e.g. "THEO-101", "BIBL-201"
  title: string;
  description: string;
  credits: number;
  level: string;
  semesterTerm: string;
  syllabusTopics: string[];
  maxMarks: number;
  passingMarks: number;
  hasOnlineExam: boolean;
  hasConventionalExam: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface TheologicalProgramme {
  id: string;
  tenantId: string;
  code: string; // e.g. "DIP-PAST-THEO", "B-DIV", "CERT-BIBL"
  name: string;
  awardTitle: string; // e.g. "Diploma in Pastoral Theology & Biblical Studies"
  qualificationType: QualificationType;
  departmentId: string;
  departmentName?: string;
  durationMonths: number;
  totalCreditsRequired: number;
  description: string;
  admissionRequirements: string[];
  careerAndMinistryOutcomes: string[];
  units: TheologicalUnitSubject[];
  status: 'ACTIVE' | 'INACTIVE';
  isRplEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExaminationSession {
  id: string;
  tenantId: string;
  sessionCode: string; // e.g. "EXAM-2026-AUG", "EXAM-2026-DEC"
  title: string;
  academicYear: string;
  termSemester: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationDeadline: string;
  moderationDeadline?: string;
  resultsReleaseDate?: string;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'MARKING' | 'MODERATION' | 'RESULTS_PUBLISHED' | 'CLOSED';
  allowedProgrammeIds: string[];
  examinationCentreIds: string[];
  instructions?: string;
  createdAt: string;
}

export interface ExaminationCentre {
  id: string;
  tenantId: string;
  centreCode: string; // e.g. "LON-MAIN-01", "BIR-CTR-02", "ONLINE-GLOBAL"
  name: string;
  location: string;
  address: string;
  city: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  capacity: number;
  currentAllocated: number;
  isOnlineCentre: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface RegisteredUnitSelection {
  unitId: string;
  unitCode: string;
  unitTitle: string;
  examDate: string;
  examStartTime: string;
  examEndTime: string;
  venueOrRoom?: string;
  seatNumber?: string;
}

export interface CandidateExamRegistration {
  id: string;
  tenantId: string;
  registrationNumber: string; // e.g. "REG-BOL-2026-8821"
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhotoUrl?: string;
  programmeId: string;
  programmeName: string;
  level: string;
  examinationSessionId: string;
  sessionCode: string;
  sessionTitle: string;
  examinationCentreId: string;
  centreName: string;
  registeredUnits: RegisteredUnitSelection[];
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CONFIRMED' | 'CANCELLED';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  feeAmount: number;
  feePaid: boolean;
  paymentReceiptNumber?: string;
  slipGenerated: boolean;
  slipDownloadUrl?: string;
  slipVerificationQr: string;
  createdAt: string;
  updatedAt: string;
}

export type QuestionDifficulty = 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTERY';
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';

export interface QuestionBankItem {
  id: string;
  tenantId: string;
  subjectId?: string;
  subjectCode: string;
  subjectTitle: string;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  marks: number;
  prompt: string;
  scriptureReference?: string;
  options?: string[]; // For MCQ: array of 4 options
  correctAnswer?: string; // For MCQ/TF: correct choice; For Essay: answer key guide
  rubricOrGradingNotes?: string;
  instructions?: string;
  authorName?: string;
  version: number;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ExaminationPaperQuestion extends QuestionBankItem {
  orderIndex: number;
  allocatedMarks: number;
}

export interface ExaminationPaper {
  id: string;
  tenantId: string;
  paperCode: string; // e.g. "BOL-THEO-201-2026-V1"
  title: string;
  subjectId?: string;
  subjectCode: string;
  subjectTitle: string;
  programmeId?: string;
  programmeName?: string;
  examinationSessionId: string;
  sessionTitle?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  examMode: 'ONLINE' | 'CONVENTIONAL';
  instructions: string[];
  questions: ExaminationPaperQuestion[];
  version: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnlineExamAntiCheatLog {
  id: string;
  timestamp: string;
  eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'FOCUS_LOST' | 'COPY_PASTE_ATTEMPT' | 'DEVICE_CHECK';
  details: string;
}

export interface CandidateAnswerPayload {
  questionId: string;
  questionPrompt: string;
  questionType: QuestionType;
  allocatedMarks: number;
  candidateAnswerText: string;
  autoScore?: number;
  examinerScore?: number;
  moderatorScore?: number;
  examinerComments?: string;
  moderatorComments?: string;
  isAutoGraded?: boolean;
}

export interface OnlineExamAttempt {
  id: string;
  tenantId: string;
  paperId: string;
  paperCode: string;
  paperTitle: string;
  subjectCode: string;
  subjectTitle: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  candidateEmail: string;
  examSessionId: string;
  startedAt: string;
  submittedAt?: string;
  durationMinutes: number;
  timeRemainingSeconds: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'MARKED' | 'MODERATED';
  answers: Record<string, CandidateAnswerPayload>;
  antiCheatLogs: OnlineExamAntiCheatLog[];
  tabSwitchCount: number;
  autoGradedScore: number;
  manualGradedScore?: number;
  totalScore?: number;
  maxScore: number;
  percentage?: number;
  grade?: string;
  examinerId?: string;
  moderatorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExaminerProfile {
  id: string;
  tenantId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  qualifications: string;
  theologicalSpecialization: string;
  assignedSubjectCodes: string[];
  assignedSessionIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
  totalScriptsAssigned: number;
  totalScriptsMarked: number;
  totalModerated: number;
  createdAt: string;
}

export type ScriptStatus = 
  | 'SUBMITTED' 
  | 'ASSIGNED' 
  | 'MARKING' 
  | 'MARKED' 
  | 'MODERATION' 
  | 'APPROVED';

export interface MarkingAuditTrailEntry {
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  details: string;
  oldScore?: number;
  newScore?: number;
}

export interface ExaminationScript {
  id: string;
  tenantId: string;
  paperId: string;
  paperCode: string;
  paperTitle: string;
  subjectCode: string;
  subjectTitle: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  examSessionId: string;
  sessionTitle: string;
  examMode: 'ONLINE' | 'CONVENTIONAL';
  status: ScriptStatus;
  assignedExaminerId?: string;
  assignedExaminerName?: string;
  assignedModeratorId?: string;
  assignedModeratorName?: string;
  attemptId?: string;
  questionsMarked: CandidateAnswerPayload[];
  rawTotalScore: number;
  moderatedTotalScore?: number;
  finalApprovedScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  calculatedGrade: string;
  examinerGeneralFeedback?: string;
  moderatorGeneralFeedback?: string;
  scoreAdjustmentReason?: string;
  auditTrail: MarkingAuditTrailEntry[];
  submittedAt: string;
  markedAt?: string;
  moderatedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type RplStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'EVIDENCE_REQUESTED'
  | 'ASSESSMENT_IN_PROGRESS'
  | 'MODERATION'
  | 'APPROVED'
  | 'REJECTED';

export interface RplPriorQualification {
  id: string;
  institutionName: string;
  qualificationTitle: string;
  yearAwarded: string;
  documentProofUrl?: string;
  verified: boolean;
}

export interface RplMinistryExperience {
  id: string;
  churchOrOrganization: string;
  ministryRole: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
  responsibilities: string;
  referenceContact?: string;
}

export interface RplPortfolioDocument {
  id: string;
  documentTitle: string;
  category: 'CERTIFICATE' | 'MINISTRY_PORTFOLIO' | 'TESTIMONIAL' | 'PUBLICATION' | 'CURRICULUM_VITAE' | 'OTHER';
  fileUrl: string;
  uploadDate: string;
  notes?: string;
}

export interface RplAwardedCredit {
  unitCode: string;
  unitTitle: string;
  credits: number;
  justification: string;
}

export interface RplApplication {
  id: string;
  tenantId: string;
  applicationNumber: string; // e.g. "RPL-BOL-2026-0041"
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  targetProgrammeId: string;
  targetProgrammeName: string;
  targetUnitCodes: string[];
  personalStatement: string;
  priorQualifications: RplPriorQualification[];
  ministryExperience: RplMinistryExperience[];
  portfolioDocuments: RplPortfolioDocument[];
  status: RplStatus;
  assignedAssessorId?: string;
  assignedAssessorName?: string;
  evidenceRequestNotes?: string;
  assessorNotes?: string;
  moderatorNotes?: string;
  awardedCredits: RplAwardedCredit[];
  totalCreditsAwarded: number;
  decisionOutcome?: 'FULL_EXEMPTION' | 'PARTIAL_CREDIT' | 'DIRECT_ENTRY' | 'REJECTED';
  rejectionReason?: string;
  feePaid: boolean;
  paymentRef?: string;
  submittedAt: string;
  assessedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitResultItem {
  unitCode: string;
  unitTitle: string;
  credits: number;
  rawScore: number;
  moderatedScore: number;
  finalScore: number;
  grade: string;
  gradePoints: number;
  remarks: 'DISTINCTION' | 'CREDIT' | 'PASS' | 'SUBSIDIARY_PASS' | 'FAIL';
  assessmentType: 'EXAMINATION' | 'RPL_CREDIT_TRANSFER' | 'COURSEWORK_EXAM';
}

export interface ExaminationResultRecord {
  id: string;
  tenantId: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  candidateEmail: string;
  programmeId: string;
  programmeName: string;
  examSessionId: string;
  sessionTitle: string;
  academicYear: string;
  unitResults: UnitResultItem[];
  totalCreditsEarned: number;
  gpa: number;
  averageScore: number;
  overallAwardStatus: 'PASS_WITH_DISTINCTION' | 'PASS_WITH_MERIT' | 'PASS' | 'RE_SIT_REQUIRED' | 'PROCEED' | 'FAIL';
  status: 'DRAFT' | 'MODERATED' | 'APPROVED' | 'PUBLISHED';
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficialTranscriptRecord {
  id: string;
  tenantId: string;
  transcriptNumber: string; // e.g. "TR-BOL-2026-0923"
  verificationCode: string; // e.g. "BOL-TR-78219"
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  nationalIdOrPassport: string;
  dateOfBirth: string;
  programmeName: string;
  awardTitle: string;
  admissionDate: string;
  completionDate?: string;
  issueDate: string;
  academicStanding: string;
  cumulativeCredits: number;
  cumulativeGpa: number;
  overallClassification: string;
  unitsCompleted: {
    academicYear: string;
    semester: string;
    unitCode: string;
    unitTitle: string;
    credits: number;
    score: number;
    grade: string;
    gradePoints: number;
    remarks: string;
  }[];
  registrarName: string;
  academicDeanName: string;
  qrCodeData: string;
  verificationUrl: string;
  status: 'VALID' | 'REVOKED';
  createdAt: string;
}

export interface OfficialCertificateRecord {
  id: string;
  tenantId: string;
  certificateNumber: string; // e.g. "BOL-CERT-2026-0042"
  verificationCode: string; // e.g. "BOL-VRF-88421"
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  qualificationTitle: string;
  programmeName: string;
  honorsClassification?: string;
  conferralDate: string;
  issueDate: string;
  signatories: {
    name: string;
    title: string;
    signatureImage?: string;
  }[];
  qrCodeData: string;
  verificationUrl: string;
  status: 'VALID' | 'REVOKED' | 'SUSPENDED';
  revocationReason?: string;
  createdAt: string;
}

export interface CertificateVerificationLookupResult {
  verified: boolean;
  status: 'VALID' | 'REVOKED' | 'SUSPENDED' | 'NOT_FOUND';
  documentType: 'CERTIFICATE' | 'TRANSCRIPT' | 'EXAM_SLIP';
  documentNumber?: string;
  verificationCode?: string;
  candidateName?: string;
  candidateNumberMasked?: string; // e.g. "BOL/THEO/2026/***"
  qualificationTitle?: string;
  programmeName?: string;
  issueDate?: string;
  conferralDate?: string;
  honorsClassification?: string;
  institutionName: string;
  verificationTimestamp: string;
  officialSealUrl?: string;
  remarks?: string;
}

export type MediaItemType = 
  | 'LIVE_STREAM'
  | 'VIDEO'
  | 'AUDIO'
  | 'SERMON'
  | 'PODCAST'
  | 'MUSIC'
  | 'DOCUMENTARY'
  | 'INTERVIEW'
  | 'BIBLE_TEACHING';

export interface TVScheduleItem {
  id: string;
  programmeTitle: string;
  category: string;
  speakerOrHost: string;
  startTime: string; // e.g. "08:00 AM"
  endTime: string; // e.g. "09:30 AM"
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Daily';
  isLiveBroadcast: boolean;
  description: string;
  streamUrl?: string;
}

export interface MediaContentItem {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  type: MediaItemType;
  category: 'Sermons' | 'Bible Teaching' | 'Interviews' | 'Christian Programmes' | 'Documentaries' | 'Podcasts' | 'Christian Music' | 'Christian Radio' | 'Live TV';
  speakerOrArtist: string;
  duration: string; // e.g. "45 mins", "1 hr 12 mins"
  mediaUrl: string; // Video streaming or mp4 link
  audioUrl?: string; // Direct mp3 audio link
  thumbnailUrl: string;
  description: string;
  scriptureReferences: string[];
  isFeatured: boolean;
  isLiveNow?: boolean;
  viewsCount: number;
  likesCount: number;
  publishedAt: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
}

export interface MinistryEventRecord {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  category: 'CONFERENCE' | 'SEMINAR' | 'EXAM_BRIEFING' | 'WORSHIP_NIGHT' | 'GRADUATION' | 'PRAYER_VIGIL' | 'WEBINAR';
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  speaker: string;
  description: string;
  bannerUrl: string;
  registrationRequired: boolean;
  registeredAttendeesCount: number;
  capacity?: number;
  status: 'UPCOMING' | 'ONGOING' | 'PAST';
  createdAt: string;
}

export interface TheologicalArticleRecord {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  category: 'BIBLE_STUDY' | 'THEOLOGY' | 'APOLOGETICS' | 'MINISTRY_LEADERSHIP' | 'DEVOTIONAL' | 'NEWS_ANNOUNCEMENT';
  author: string;
  authorRole: string;
  publishedDate: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  scriptureAnchor?: string;
  tags: string[];
  readTimeMinutes: number;
  viewsCount: number;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
}

export interface TemsFeeScheduleItem {
  id: string;
  tenantId: string;
  feeName: string;
  category: 'CANDIDATE_REGISTRATION' | 'EXAM_REGISTRATION_PER_UNIT' | 'RPL_APPLICATION' | 'TRANSCRIPT_ISSUANCE' | 'CERTIFICATE_ISSUANCE' | 'RE_MARKING_FEE';
  amount: number;
  currency: string;
  currencySymbol: string;
  description: string;
  isMandatory: boolean;
  createdAt: string;
}

export interface TheologicalUnit {
  id: string;
  code: string;
  title: string;
  credits: number;
  level: string;
  semester: string;
  description?: string;
}

export interface ExamPaperQuestion {
  id: string;
  paperId: string;
  questionNumber: number;
  prompt: string;
  questionType: 'MCQ' | 'SHORT_ANSWER' | 'ESSAY' | 'EXEGESIS' | 'THEOLOGICAL_SYNTHESIS';
  marks: number;
  allocatedMarks?: number;
  options?: string[];
  correctOption?: string;
  rubricCriteria?: string;
}

export interface ExamRegistration {
  id: string;
  tenantId: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  sessionId: string;
  sessionTitle: string;
  paperId: string;
  paperCode: string;
  subjectCode: string;
  subjectTitle: string;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  centreId: string;
  centreName: string;
  seatNumber?: string;
  examSlipNumber: string;
  attendanceStatus: 'REGISTERED' | 'PRESENT' | 'ABSENT' | 'COMPLETED';
  status: 'CONFIRMED' | 'PENDING_APPROVAL' | 'CANCELLED';
  createdAt: string;
}

export type ExamResultRecord = ExaminationResultRecord;
export type OfficialTranscript = OfficialTranscriptRecord;
export type OfficialCertificate = OfficialCertificateRecord;

export interface RplApplicationRecord extends Partial<RplApplication> {
  id: string;
  tenantId: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  targetProgrammeId: string;
  targetProgrammeName: string;
  yearsMinistryExperience?: number;
  ministryRole?: string;
  portfolioSummary?: string;
  assessmentStatus?: string;
  grantedCreditUnits?: number;
  assessorRemarks?: string;
  submittedEvidenceDocs?: {
    title: string;
    documentType: string;
    fileUrl: string;
  }[];
  createdAt?: string;
}

export interface ExamScriptRecord {
  id: string;
  tenantId: string;
  scriptNumber: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  paperId: string;
  paperCode: string;
  subjectCode: string;
  subjectTitle: string;
  totalMaxMarks: number;
  examinerMark?: number;
  moderatorMark?: number;
  firstExaminerId?: string;
  firstExaminerName?: string;
  moderatorId?: string;
  moderatorName?: string;
  examinerFeedback?: string;
  moderatorNotes?: string;
  submissionTimestamp?: string;
  status: 'SUBMITTED' | 'ASSIGNED_TO_EXAMINER' | 'MARKED' | 'SUBMITTED_FOR_MODERATION' | 'APPROVED' | 'RE_MARK_REQUESTED';
  responses: {
    questionId: string;
    questionNumber: number;
    questionPrompt: string;
    questionType: string;
    allocatedMarks: number;
    candidateAnswerText: string;
    marksAwarded?: number;
    examinerFeedback?: string;
  }[];
  createdAt: string;
}

export interface TemsPaymentRecord {
  id: string;
  tenantId: string;
  receiptNumber: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  feeCategoryId: string;
  feeCategoryName: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  paymentMethod: 'CARD' | 'BANK_TRANSFER' | 'M-PESA' | 'STRIPE_ONLINE' | 'CASH_RECEIPT';
  transactionReference: string;
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  paidAt: string;
  notes?: string;
  createdAt: string;
}

// ==========================================
// Centralized Physical Printer & Receipt System
// ==========================================

export type PrinterInterfaceType = 'WEB_USB' | 'WEB_SERIAL' | 'NETWORK_LAN' | 'LOCAL_BRIDGE' | 'SYSTEM_DEFAULT';
export type PrinterPaperWidth = '58mm' | '80mm' | 'A4';
export type PrinterStationTarget = 
  | 'ALL' 
  | 'CASHIER' 
  | 'KITCHEN' 
  | 'BAR' 
  | 'RECEPTION' 
  | 'FINANCE' 
  | 'DISPENSARY' 
  | 'BOOKSHOP' 
  | 'MAIN_GATE';

export interface PrinterDevice {
  id: string;
  tenantId: string;
  name: string;
  branchId?: string;
  branchName?: string;
  workstationName?: string;
  stationTarget: PrinterStationTarget;
  interfaceType: PrinterInterfaceType;
  paperWidth: PrinterPaperWidth;
  isDefault: boolean;
  autoPrint: boolean;
  kickCashDrawer: boolean;
  cutPaper: boolean;
  copies: number;
  
  // Connectivity parameters
  ipAddress?: string;
  port?: number;
  bridgeUrl?: string;
  usbVendorId?: number;
  usbProductId?: number;
  serialBaudRate?: number;
  
  // Header / Footer Customization
  customHeader?: string;
  customFooter?: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'ERROR' | 'UNKNOWN';
  lastTestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReceiptModuleSource = 
  | 'POS_RETAIL' 
  | 'EDUCATION_FEES' 
  | 'HEALTHCARE_BILLING' 
  | 'HOSPITALITY_RESTAURANT' 
  | 'HOSPITALITY_BAR' 
  | 'HOSPITALITY_HOTEL' 
  | 'THEOLOGY_TEMS' 
  | 'BOOKSHOP' 
  | 'GENERAL_ERP';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  code?: string;
  taxRate?: number;
  taxAmount?: number;
  notes?: string;
}

export interface UniversalReceipt {
  id: string;
  tenantId: string;
  receiptNumber: string;
  sourceModule: ReceiptModuleSource;
  sourceReferenceId: string;
  
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerTaxId?: string;
  studentAdmissionNo?: string;
  patientId?: string;
  patientMrn?: string;
  candidateNumber?: string;
  roomOrTableNumber?: string;
  
  currency: string;
  currencySymbol: string;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  taxRatePercentage?: number;
  taxRegistrationNumber?: string;
  grandTotal: number;
  
  paymentMethod: 'CASH' | 'M-PESA' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'ROOM_CHARGE' | 'CHEQUE' | 'OTHER';
  paymentReference?: string;
  amountTendered?: number;
  changeGiven?: number;
  balanceRemaining?: number;
  
  cashierId?: string;
  cashierName: string;
  stationName?: string;
  branchName?: string;
  
  businessName: string;
  tradingName?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  customHeader?: string;
  customFooter?: string;
  
  qrVerificationUrl?: string;
  verificationCode?: string;
  isReprint: boolean;
  reprintCount: number;
  lastReprintedAt?: string;
  
  status: 'ISSUED' | 'VOIDED' | 'REFUNDED';
  issuedAt: string;
  createdAt: string;
}

export type PrintJobStatus = 'PENDING' | 'PRINTING' | 'COMPLETED' | 'OFFLINE_QUEUED' | 'FAILED_RETRYING' | 'CANCELLED';

export interface PrintJobRecord {
  id: string;
  tenantId: string;
  receiptId: string;
  receiptNumber: string;
  printerId: string;
  printerName: string;
  stationTarget: PrinterStationTarget;
  interfaceType: PrinterInterfaceType;
  paperWidth: PrinterPaperWidth;
  copies: number;
  
  status: PrintJobStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  isAutoTriggered: boolean;
  isReprint: boolean;
  
  rawEscPosHex?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PrinterAuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'PRINT_SUCCESS' | 'PRINT_RETRY' | 'REPRINT_ISSUED' | 'PRINT_FAILED' | 'PRINTER_CREATED' | 'PRINTER_UPDATED' | 'PRINTER_DELETED' | 'PRINTER_TESTED' | 'QUEUE_CLEARED';
  printerName?: string;
  receiptNumber?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type AdmissionsApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'DOCUMENTS_REQUIRED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'ACCEPTED'
  | 'CONDITIONALLY_ACCEPTED'
  | 'WAITLISTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ADMITTED'
  | 'REGISTERED';

export type AdmissionsDocumentType =
  | 'ID_PASSPORT'
  | 'ACADEMIC_CERTIFICATE'
  | 'TRANSCRIPT'
  | 'RECOMMENDATION_LETTER'
  | 'CHURCH_MINISTRY_DOC'
  | 'PASSPORT_PHOTO'
  | 'OTHER';

export type AdmissionsDocumentStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export type AdmissionsStudyMode =
  | 'FULL_TIME_CAMPUS'
  | 'PART_TIME_EVENING'
  | 'DISTANCE_ONLINE'
  | 'HYBRID_INTENSIVE';

export interface AdmissionsDocument {
  id: string;
  name: string;
  type: AdmissionsDocumentType;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  status: AdmissionsDocumentStatus;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AdmissionsPreviousEducation {
  id: string;
  institutionName: string;
  qualificationAwarded: string;
  majorSubject?: string;
  yearCompleted: number | string;
  gradeOrScore?: string;
  country?: string;
}

export interface AdmissionsInterview {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  mode: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE';
  locationOrLink?: string;
  interviewerId?: string;
  interviewerName: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  score?: number;
  notes?: string;
  recommendation?: 'STRONGLY_RECOMMEND' | 'RECOMMEND' | 'RECOMMEND_WITH_CONDITIONS' | 'NOT_RECOMMENDED';
  conductedAt?: string;
}

export interface AdmissionsReviewNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  note: string;
  createdAt: string;
  decision?: AdmissionsApplicationStatus;
}

export interface AdmissionsAuditEntry {
  id: string;
  action:
    | 'CREATED'
    | 'SUBMITTED'
    | 'DOC_UPLOADED'
    | 'DOC_VERIFIED'
    | 'DOC_REJECTED'
    | 'STATUS_CHANGED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEW_COMPLETED'
    | 'DECISION_MADE'
    | 'ADMITTED'
    | 'REGISTERED'
    | 'CANDIDATE_ENROLLED'
    | 'LETTER_GENERATED';
  description: string;
  performedBy: string;
  performedById?: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface StudentAdmissionApplication {
  id: string;
  tenantId: string;
  applicationNumber: string; // e.g. "BOL-APP-2026-0001"

  // Personal Info
  firstName: string;
  middleName?: string;
  lastName: string;
  photoUrl?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationalIdOrPassport: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;

  // Church / Ministry Info
  homeChurch: string;
  denomination: string;
  ministryRole?: string;
  pastorName?: string;
  pastorPhone?: string;
  pastorEmail?: string;

  // Academic Programme & Centre Selection
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  intake: string;
  centreId: string;
  centreName: string;
  studyMode: AdmissionsStudyMode;
  academicYear: string;

  // Previous Education & Documents
  previousEducation: AdmissionsPreviousEducation[];
  documents: AdmissionsDocument[];

  // Interviews & Reviews
  interviews: AdmissionsInterview[];
  reviewNotes: AdmissionsReviewNote[];
  auditTrail: AdmissionsAuditEntry[];

  // Status & Decision
  status: AdmissionsApplicationStatus;
  decisionNotes?: string;
  decisionDate?: string;
  decidedBy?: string;

  // Admission & Registration Linkages
  admissionNumber?: string;
  studentNumber?: string;
  studentId?: string;
  candidateId?: string;
  candidateNumber?: string;
  admittedAt?: string;
  admittedBy?: string;
  registeredAt?: string;
  registeredBy?: string;
  candidateEnrolledAt?: string;

  // Admission Letter Metadata
  admissionLetterGenerated?: boolean;
  admissionLetterNumber?: string;
  admissionLetterDate?: string;
  admissionLetterVerificationCode?: string;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CONTROLLED OFFLINE MODE TYPES & LEASE
// ==========================================

export type OfflineGracePeriodHours = 0 | 24 | 48 | 72 | 168; // 0=Disabled, 168=7 Days

export interface PlatformOfflineConfig {
  enabled: boolean;
  defaultGracePeriodHours: OfflineGracePeriodHours; // Default 72 hours
  maxGracePeriodHours: OfflineGracePeriodHours; // Maximum allowed 168 hours (7 days)
  allowedOfflineModules: ModuleId[];
  offlineDeviceLimit: number;
  requireOnlineVerificationFrequencyHours: number;
  enableOfflinePos: boolean;
  enableOfflineEducation: boolean;
  enableOfflineInventory: boolean;
  offlineTransactionLimit: number;
  updatedAt?: string;
}

export interface AuthorizedOfflineDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  registeredAt: string;
  lastSeenAt: string;
  lastSyncAt: string;
  lastIp?: string;
  userAgent?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface TenantOfflineConfig {
  enabled: boolean;
  gracePeriodHours: OfflineGracePeriodHours; // Tenant specific (cannot exceed platform max)
  allowedOfflineModules: ModuleId[];
  enableOfflinePos: boolean;
  enableOfflineEducation: boolean;
  enableOfflineInventory: boolean;
  offlineTransactionLimit: number;
  lastSyncAt?: string;
  authorizedDevices?: AuthorizedOfflineDevice[];
}

export interface OfflineLicenseLease {
  leaseId: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userEmail: string;
  deviceId: string;
  issuedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  gracePeriodHours: number;
  allowedOfflineModules: ModuleId[];
  permissions: string[];
  subscriptionStatus: 'ACTIVE' | 'PAYMENT_DUE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
  signature: string; // Server-generated HMAC signature
  version: string;
}

export type OfflineSyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'REJECTED';

export interface OfflineQueueItem {
  operationId: string; // Unique idempotency key (UUID)
  tenantId: string;
  userId: string;
  deviceId: string;
  module: ModuleId;
  action: 'pos.create_sale' | 'education.record_attendance' | 'education.register_student' | 'inventory.adjust_stock' | string;
  payload: any;
  createdAt: string;
  clientTimestamp: number;
  syncStatus: OfflineSyncStatus;
  retryCount: number;
  errorMessage?: string;
  serverSyncedAt?: string;
}

export interface OfflineSyncBatchPayload {
  deviceId: string;
  tenantId: string;
  leaseSignature: string;
  operations: OfflineQueueItem[];
}

export interface OfflineSyncBatchResult {
  success: boolean;
  processedCount: number;
  acceptedOperations: string[]; // operationIds
  rejectedOperations: Array<{ operationId: string; reason: string }>;
  errors: string[];
  serverTimestamp: number;
  freshLease?: OfflineLicenseLease;
}








