import { PermissionDefinition, RoleDefinition, ModuleId } from '../types';

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // 1. Settings, Branding & Public Website
  {
    id: 'perm_org_branding',
    code: 'organization.branding.manage',
    name: 'Manage Branding & Theme',
    description: 'Update organization name, logo, primary color, currency, and physical address.',
    category: 'Settings & Branding',
    module: 'general_erp'
  },
  {
    id: 'perm_org_website',
    code: 'organization.website.manage',
    name: 'Manage Public Website & CMS',
    description: 'Customize public landing page, hero sliders, announcement banner, news, events, and about section.',
    category: 'Settings & Branding',
    module: 'general_erp'
  },
  {
    id: 'perm_org_domains',
    code: 'organization.domains.view',
    name: 'View Custom Domains & Routing',
    description: 'Inspect connected custom domains, DNS verification records, and SSL status.',
    category: 'Settings & Branding',
    module: 'general_erp'
  },
  {
    id: 'perm_org_profile',
    code: 'organization.profile.view',
    name: 'View Organization Profile',
    description: 'View organization details, subscription tier, and system metrics.',
    category: 'Settings & Branding',
    module: 'general_erp'
  },

  // 2. Users, Staff & Access Control
  {
    id: 'perm_users_view',
    code: 'organization.users.view',
    name: 'View User Accounts',
    description: 'View all institutional user accounts, logins, emails, and assigned departments.',
    category: 'Users & Access',
    module: 'general_erp'
  },
  {
    id: 'perm_users_create',
    code: 'organization.users.create',
    name: 'Create User Accounts',
    description: 'Provision new staff, faculty, and user logins with initial credentials.',
    category: 'Users & Access',
    module: 'general_erp'
  },
  {
    id: 'perm_users_edit',
    code: 'organization.users.edit',
    name: 'Edit User Accounts & Roles',
    description: 'Update user profiles, change assigned roles, modify departments, and alter email addresses.',
    category: 'Users & Access',
    module: 'general_erp'
  },
  {
    id: 'perm_users_delete',
    code: 'organization.users.delete',
    name: 'Delete User Accounts',
    description: 'Permanently remove user accounts and invalidate all active user sessions.',
    category: 'Users & Access',
    module: 'general_erp'
  },
  {
    id: 'perm_users_reset_password',
    code: 'organization.users.reset_password',
    name: 'Direct Password Reset',
    description: 'Execute instant password resets and issue new login credentials for organization staff.',
    category: 'Users & Access',
    module: 'general_erp'
  },
  {
    id: 'perm_roles_manage',
    code: 'organization.roles.manage',
    name: 'Manage Roles & RBAC Matrix',
    description: 'Create custom roles, edit role permissions, and customize granular access policies.',
    category: 'Users & Access',
    module: 'general_erp'
  },

  // 3. Academics & Curriculums
  {
    id: 'perm_acad_programs',
    code: 'academic.programs.manage',
    name: 'Programs & Departments',
    description: 'Configure academic faculties, departments, degree/diploma programs, and certificates.',
    category: 'Academics & Classes',
    module: 'education'
  },
  {
    id: 'perm_acad_units',
    code: 'academic.units.manage',
    name: 'Courses & Unit Syllabi',
    description: 'Create course units, assign credit hours, prerequisites, and learning curriculum.',
    category: 'Academics & Classes',
    module: 'education'
  },
  {
    id: 'perm_acad_classes',
    code: 'academic.classes.manage',
    name: 'Classes, Grades & Cohorts',
    description: 'Manage grade streams, student cohorts, lecture classes, and intake batches.',
    category: 'Academics & Classes',
    module: 'education'
  },
  {
    id: 'perm_acad_timetable',
    code: 'academic.timetable.manage',
    name: 'Timetable & Room Allocations',
    description: 'Build weekly lecture timetables, allocate lecture rooms, and schedule faculty periods.',
    category: 'Academics & Classes',
    module: 'education'
  },

  // 4. Students & Admissions Registry
  {
    id: 'perm_students_view',
    code: 'students.view',
    name: 'View Student Directory',
    description: 'Search and inspect student records, enrollment status, bio info, and guardian details.',
    category: 'Students & Admissions',
    module: 'education'
  },
  {
    id: 'perm_students_admit',
    code: 'students.admit',
    name: 'Process Student Admissions',
    description: 'Review online applications, issue admission numbers, and matriculate new students.',
    category: 'Students & Admissions',
    module: 'education'
  },
  {
    id: 'perm_students_edit',
    code: 'students.edit',
    name: 'Edit Student Biodata',
    description: 'Update student profiles, personal details, contact info, and course registrations.',
    category: 'Students & Admissions',
    module: 'education'
  },
  {
    id: 'perm_students_delete',
    code: 'students.delete',
    name: 'Archive / Delete Student',
    description: 'Expel, discontinue, or delete student academic accounts from active directory.',
    category: 'Students & Admissions',
    module: 'education'
  },
  {
    id: 'perm_students_transcripts',
    code: 'students.transcripts.issue',
    name: 'Generate Official Transcripts',
    description: 'Issue authenticated semester transcripts, completion letters, and graduation certificates.',
    category: 'Students & Admissions',
    module: 'education'
  },

  // 5. Fees, Billing & Financial Operations
  {
    id: 'perm_fin_fees_view',
    code: 'finance.fees.view',
    name: 'View Fee Ledgers & Debtors',
    description: 'Inspect student fee balances, fee collections, outstanding arrears, and payment receipts.',
    category: 'Fees & Finance',
    module: 'accounting'
  },
  {
    id: 'perm_fin_invoices_create',
    code: 'finance.invoices.create',
    name: 'Generate Invoices & Fee Structures',
    description: 'Configure semester fee structures and debit student accounts with mandatory tuition/exam fees.',
    category: 'Fees & Finance',
    module: 'accounting'
  },
  {
    id: 'perm_fin_payments_record',
    code: 'finance.payments.record',
    name: 'Record & Reconcile Payments',
    description: 'Post cash, bank deposits, credit card, and automated M-Pesa fee receipts.',
    category: 'Fees & Finance',
    module: 'accounting'
  },
  {
    id: 'perm_fin_discounts_manage',
    code: 'finance.discounts.manage',
    name: 'Fee Waivers & Bursaries',
    description: 'Apply partial scholarships, bursaries, staff discounts, and fee adjustments.',
    category: 'Fees & Finance',
    module: 'accounting'
  },
  {
    id: 'perm_fin_reports_export',
    code: 'finance.reports.export',
    name: 'Financial Reports & Ledgers',
    description: 'Export comprehensive debtors reports, revenue summaries, collection audits, and trial balance.',
    category: 'Fees & Finance',
    module: 'accounting'
  },

  // 6. Examinations, RPL & Grading
  {
    id: 'perm_exams_view',
    code: 'exams.view',
    name: 'View Exam Schedules & Grading',
    description: 'Inspect examination timetables, assessment weightings, and grade conversion tables.',
    category: 'Exams & Grading',
    module: 'education'
  },
  {
    id: 'perm_exams_grade_enter',
    code: 'exams.grade.enter',
    name: 'Enter Continuous & Exam Marks',
    description: 'Input course CATs, practical scores, project evaluations, and main examination results.',
    category: 'Exams & Grading',
    module: 'education'
  },
  {
    id: 'perm_exams_results_publish',
    code: 'exams.results.publish',
    name: 'Moderate & Publish Results',
    description: 'Authorize senate result approval, release semester grades, and enable student view.',
    category: 'Exams & Grading',
    module: 'education'
  },
  {
    id: 'perm_exams_rpl_assess',
    code: 'exams.rpl.assess',
    name: 'RPL Prior Learning Assessment',
    description: 'Review portfolio evidence, grade occupational competencies, and certify TVET RPL candidates.',
    category: 'Exams & Grading',
    module: 'education'
  },

  // 7. Human Resources & Payroll
  {
    id: 'perm_hr_staff_view',
    code: 'hr.staff.view',
    name: 'View Staff Directory',
    description: 'Access employee records, job designations, qualifications, and employment contracts.',
    category: 'HR & Payroll',
    module: 'hr'
  },
  {
    id: 'perm_hr_staff_manage',
    code: 'hr.staff.manage',
    name: 'Manage Staff Profiles & Contracts',
    description: 'Add new employees, update job descriptions, salary terms, and employment statuses.',
    category: 'HR & Payroll',
    module: 'hr'
  },
  {
    id: 'perm_hr_letters_issue',
    code: 'hr.letters.issue',
    name: 'Issue Warning & Disciplinary Letters',
    description: 'Generate, issue, and archive formal employee warning letters and termination notices.',
    category: 'HR & Payroll',
    module: 'hr'
  },
  {
    id: 'perm_hr_payroll_process',
    code: 'hr.payroll.process',
    name: 'Process Monthly Payroll',
    description: 'Calculate staff salaries, PAYE tax, SHIF, NSSF statutory deductions, and generate payslips.',
    category: 'HR & Payroll',
    module: 'hr'
  },
  {
    id: 'perm_hr_leave_approve',
    code: 'hr.leave.approve',
    name: 'Approve Leave Applications',
    description: 'Review, approve, or reject employee annual leave, sick leave, and study requests.',
    category: 'HR & Payroll',
    module: 'hr'
  },

  // 8. Inventory, POS & Assets
  {
    id: 'perm_inv_view',
    code: 'inventory.view',
    name: 'View Inventory & Stock Levels',
    description: 'Monitor store inventory levels, warehouse valuation, and stock alerts.',
    category: 'Inventory & POS',
    module: 'inventory'
  },
  {
    id: 'perm_inv_manage',
    code: 'inventory.manage',
    name: 'Manage Stock & Purchase Orders',
    description: 'Receive new stock shipments, adjust store quantities, and issue purchase orders.',
    category: 'Inventory & POS',
    module: 'inventory'
  },
  {
    id: 'perm_pos_sales_create',
    code: 'pos.sales.create',
    name: 'Point of Sale (POS) Cashier',
    description: 'Conduct cash, card, and M-Pesa retail sales, bookshop transactions, and print receipts.',
    category: 'Inventory & POS',
    module: 'pos'
  },

  // 9. Security & Audit Logs
  {
    id: 'perm_audit_view',
    code: 'audit.logs.view',
    name: 'View Security Audit Trails',
    description: 'Inspect immutable, timestamped security logs of all system actions and user logins.',
    category: 'Security & Audit',
    module: 'system'
  }
];

export const ALL_PERMISSION_CODES = SYSTEM_PERMISSIONS.map(p => p.code);

export const DEFAULT_SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'role_tenant_admin',
    name: 'Tenant Administrator',
    code: 'TENANT_ADMIN',
    description: 'Complete institutional governance: manage branding, users, RBAC permissions, finances, academics, and full ERP suites.',
    isSystemRole: true,
    category: 'System',
    color: '#2563EB', // Blue
    permissions: ['*']
  },
  {
    id: 'role_finance_officer',
    name: 'Finance Officer / Bursar',
    code: 'FINANCE_OFFICER',
    description: 'Comprehensive financial control: student fee ledgers, invoicing, cash/M-Pesa payment receipts, waivers, and debt exports.',
    isSystemRole: true,
    category: 'Financial',
    color: '#059669', // Emerald
    permissions: [
      'organization.profile.view',
      'organization.users.view',
      'students.view',
      'finance.fees.view',
      'finance.invoices.create',
      'finance.payments.record',
      'finance.discounts.manage',
      'finance.reports.export',
      'inventory.view',
      'pos.sales.create',
      'audit.logs.view'
    ]
  },
  {
    id: 'role_academic_admin',
    name: 'Academic Dean / Registrar',
    code: 'ACADEMIC_ADMIN',
    description: 'Academic governance: program faculties, course unit syllabi, stream allocations, timetable schedules, and admissions.',
    isSystemRole: true,
    category: 'Academic',
    color: '#7C3AED', // Violet
    permissions: [
      'organization.profile.view',
      'organization.users.view',
      'academic.programs.manage',
      'academic.units.manage',
      'academic.classes.manage',
      'academic.timetable.manage',
      'students.view',
      'students.admit',
      'students.edit',
      'students.transcripts.issue',
      'exams.view',
      'exams.results.publish',
      'audit.logs.view'
    ]
  },
  {
    id: 'role_registrar',
    name: 'Registrar / Admissions Officer',
    code: 'REGISTRAR',
    description: 'Student lifecycle & registry: online applications, matriculation, student records, transfers, and official transcript issuance.',
    isSystemRole: true,
    category: 'Administrative',
    color: '#0284C7', // Sky
    permissions: [
      'organization.profile.view',
      'organization.users.view',
      'academic.programs.manage',
      'academic.classes.manage',
      'students.view',
      'students.admit',
      'students.edit',
      'students.transcripts.issue',
      'exams.view'
    ]
  },
  {
    id: 'role_teacher',
    name: 'Lecturer / Teacher',
    code: 'TEACHER',
    description: 'Faculty classroom portal: course syllabus view, lecture timetables, class attendance marking, and CAT/exam grading entry.',
    isSystemRole: true,
    category: 'Academic',
    color: '#D97706', // Amber
    permissions: [
      'organization.profile.view',
      'academic.units.manage',
      'academic.classes.manage',
      'academic.timetable.manage',
      'students.view',
      'exams.view',
      'exams.grade.enter'
    ]
  },
  {
    id: 'role_examination_officer',
    name: 'Examination Officer / Assessor',
    code: 'EXAMINATION_OFFICER',
    description: 'Assessment & certification: examination scheduling, mark moderations, RPL competence assessments, and transcript approvals.',
    isSystemRole: true,
    category: 'Academic',
    color: '#DC2626', // Red
    permissions: [
      'organization.profile.view',
      'academic.programs.manage',
      'academic.units.manage',
      'academic.classes.manage',
      'students.view',
      'students.transcripts.issue',
      'exams.view',
      'exams.grade.enter',
      'exams.results.publish',
      'exams.rpl.assess'
    ]
  },
  {
    id: 'role_hr_manager',
    name: 'HR & Payroll Manager',
    code: 'HR_MANAGER',
    description: 'Workforce management: staff directory, employment contracts, warning/termination letters, monthly payroll, and leave approvals.',
    isSystemRole: true,
    category: 'Administrative',
    color: '#4F46E5', // Indigo
    permissions: [
      'organization.profile.view',
      'organization.users.view',
      'hr.staff.view',
      'hr.staff.manage',
      'hr.letters.issue',
      'hr.payroll.process',
      'hr.leave.approve',
      'audit.logs.view'
    ]
  },
  {
    id: 'role_inventory_manager',
    name: 'Inventory & POS Storekeeper',
    code: 'INVENTORY_MANAGER',
    description: 'Logistics and retail operations: stock tracking, item adjustments, supplier purchase orders, and POS cashier receipts.',
    isSystemRole: true,
    category: 'Operations',
    color: '#0891B2', // Cyan
    permissions: [
      'organization.profile.view',
      'inventory.view',
      'inventory.manage',
      'pos.sales.create'
    ]
  },
  {
    id: 'role_media_admin',
    name: 'Communications / Webmaster',
    code: 'MEDIA_ADMIN',
    description: 'Public presence & branding: public landing page builder, hero slides, announcement bar, news publications, and campus events.',
    isSystemRole: true,
    category: 'Administrative',
    color: '#9333EA', // Purple
    permissions: [
      'organization.profile.view',
      'organization.branding.manage',
      'organization.website.manage',
      'organization.domains.view'
    ]
  },
  {
    id: 'role_staff',
    name: 'General Staff / Assistant',
    code: 'STAFF',
    description: 'Basic institutional staff account: personal profile, internal staff directory view, and self-service leave requests.',
    isSystemRole: true,
    category: 'Operations',
    color: '#64748B', // Slate
    permissions: [
      'organization.profile.view',
      'hr.staff.view'
    ]
  },
  {
    id: 'role_student',
    name: 'Student / Candidate Portal',
    code: 'STUDENT',
    description: 'Self-service student portal: fee statements, unit enrollment, lecture timetable, online class attendance, and exam results.',
    isSystemRole: true,
    category: 'Academic',
    color: '#3B82F6', // Blue
    permissions: [
      'organization.profile.view'
    ]
  }
];

/**
 * Check if a user's permissions grant access to a specific permission code
 */
export function hasUserPermission(userPermissions: string[] | undefined, requiredPerm: string): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('*') || userPermissions.includes('all')) return true;
  return userPermissions.includes(requiredPerm);
}

/**
 * Get effective permissions for a given role code
 */
export function getPermissionsForRole(roleCode: string, customRoles: RoleDefinition[] = []): string[] {
  if (roleCode === 'SUPER_ADMIN' || roleCode === 'TENANT_ADMIN') {
    return ['*'];
  }
  const custom = customRoles.find(r => r.code === roleCode || r.id === roleCode);
  if (custom) return custom.permissions;

  const standard = DEFAULT_SYSTEM_ROLES.find(r => r.code === roleCode);
  if (standard) return standard.permissions;

  return ['organization.profile.view'];
}
