import { Tenant } from '../types';

export const DEFAULT_INITIAL_TENANT: Tenant = {
  id: 'tenant_apex_institute',
  name: 'Apex Institute of Technology',
  slug: 'apex-institute',
  subdomain: 'apex-institute',
  domainType: 'subdomain',
  type: 'EDUCATION',
  educationType: 'TVET',
  status: 'ACTIVE',
  planId: 'plan_enterprise',
  websiteEnabled: true,
  branding: {
    companyName: 'Apex Institute of Technology',
    primaryColor: '#1D53D9',
    secondaryColor: '#F49C10',
    currency: 'KES',
    currencySymbol: 'KSh',
    fiscalYearStartMonth: 1,
    contactEmail: 'admissions@apexinstitute.ac.ke',
    contactPhone: '+254 712 345 678',
    address: 'Apex Campus, Innovation Way, Technology Park, Nairobi, Kenya'
  },
  publicWebsite: {
    enabled: true,
    heroTitle: 'Excellence in Technology & Professional Studies',
    tagline: 'Accredited TVET & Higher Learning Institution',
    heroDescription: 'Empowering future leaders and innovators with industry-certified curricula, modern laboratories, hands-on experiential learning, and career mentorship.',
    aboutText: 'Apex Institute of Technology is a premier tertiary institution accredited to offer high-impact diploma and certificate qualifications across technology, business, engineering, and health sciences.',
    mission: 'To deliver market-driven competency-based training, fostering innovation, digital literacy, and ethical professional leadership.',
    vision: 'To be the benchmark center for technological education, practical research, and career transformation in East Africa.',
    primaryColor: '#1D53D9',
    secondaryColor: '#F49C10',
    admissionNotice: 'Applications for the upcoming 2026/2027 Academic Intake are now open. Apply online today for priority processing.',
    autoSlideInterval: 6,
    heroSlides: [
      {
        id: 'slide_1',
        title: 'Excellence in Competency-Based Academic Programs',
        subtitle: 'Empowering students with industry-certified skills, hands-on labs, and direct career placement pathways.',
        tagline: 'Accredited Institution • Modern Laboratories',
        badgeText: '🎓 ADMISSIONS OPEN 2026/2027',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Apply For Admission',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Explore Academic Programs',
        secondaryBtnAction: 'programs',
        alignment: 'center',
        overlayOpacity: 70
      },
      {
        id: 'slide_2',
        title: 'Cutting-Edge Laboratories & Modern Engineering Workshops',
        subtitle: 'Experience practical training using modern equipment, software simulation tools, and collaborative innovation spaces.',
        tagline: 'High-Tech Computer & Science Labs',
        badgeText: '🔬 INNOVATION & RESEARCH HUB',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'View Departments',
        primaryBtnAction: 'departments',
        secondaryBtnText: 'Virtual Campus Tour',
        secondaryBtnAction: 'campuses',
        alignment: 'left',
        overlayOpacity: 75
      },
      {
        id: 'slide_3',
        title: 'Global Career Opportunities & Industry Internships',
        subtitle: 'Our alumni excel across multinational enterprises, tech startups, healthcare institutions, and public leadership.',
        tagline: '94% Graduate Employment & Attachment Rate',
        badgeText: '🌟 94% EMPLOYMENT SUCCESS',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Apply Online Now',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Admission Requirements',
        secondaryBtnAction: 'admissions',
        alignment: 'center',
        overlayOpacity: 70
      }
    ],
    news: [
      {
        id: 'news_1',
        title: 'Annual Innovation Exhibition & Career Fair 2026',
        summary: 'Over 50 industry partner corporations and tech incubators will be recruiting top graduates directly on campus.',
        date: '2026-08-28',
        category: 'Event'
      },
      {
        id: 'news_2',
        title: 'New Cloud Computing & AI Diploma Track Launched',
        summary: 'In collaboration with international cloud vendors, Apex introduces new specialized certification tracks.',
        date: '2026-08-10',
        category: 'Academic'
      }
    ],
    events: [
      {
        id: 'ev_1',
        title: 'New Student Orientation & Welcome Ceremony',
        date: '2026-09-05',
        time: '09:00 AM - 02:00 PM',
        location: 'Main Auditorium, Main Campus',
        description: 'Comprehensive campus tour, faculty introduction, course registration guidance, and IT orientation.'
      },
      {
        id: 'ev_2',
        title: 'Industry Mentorship & Tech Summit',
        date: '2026-09-20',
        time: '10:00 AM - 04:00 PM',
        location: 'Innovation Hub Hall A',
        description: 'Keynote sessions by senior engineers and business leaders on industry trends and practical project portfolios.'
      }
    ]
  },
  enabledModules: ['education', 'accounting', 'pos', 'hr', 'inventory', 'crm', 'general_erp'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-08-15T00:00:00Z'
};

export const TENANT_SACCO: Tenant = {
  id: 'tenant_blessed_sacco',
  name: 'Blessed to Bless SACCO & Microfinance',
  slug: 'blessed-sacco',
  subdomain: 'blessed-sacco',
  domainType: 'subdomain',
  type: 'SACCO',
  status: 'ACTIVE',
  planId: 'plan_professional',
  websiteEnabled: true,
  branding: {
    companyName: 'Blessed to Bless SACCO Society Ltd',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    currency: 'KES',
    currencySymbol: 'KSh',
    fiscalYearStartMonth: 1,
    contactEmail: 'info@blessedtobliss.co.ke',
    contactPhone: '+254 720 112 233',
    address: 'Ushirika Plaza, 4th Floor, Haile Selassie Avenue, Nairobi'
  },
  publicWebsite: {
    enabled: true,
    heroTitle: 'Empowering Communities Through Financial Freedom',
    tagline: 'Registered Savings & Credit Cooperative Society',
    heroDescription: 'Join thousands of members growing wealth through high-yield monthly savings, competitive low-interest development loans, and annual dividend distributions.',
    aboutText: 'Blessed to Bless SACCO is a premier cooperative financial institution providing inclusive credit, wealth creation, and community welfare solutions.',
    mission: 'To mobilize financial resources and provide accessible, affordable credit facilities to empower member prosperity.',
    vision: 'To be the most trusted and innovative community SACCO in Eastern Africa.',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    autoSlideInterval: 6,
    heroSlides: [
      {
        id: 'sacco_slide_1',
        title: 'High-Yield Member Savings & Wealth Accumulation',
        subtitle: 'Build a secure financial future with competitive return on shares and transparent monthly savings ledgers.',
        tagline: 'Trusted Cooperative Finance • 100% Member Owned',
        badgeText: '💰 ANNUAL DIVIDENDS UP TO 14%',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Join SACCO Today',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Explore Loan Products',
        secondaryBtnAction: 'programs',
        alignment: 'center',
        overlayOpacity: 70
      }
    ]
  },
  enabledModules: ['sacco', 'accounting', 'crm', 'general_erp'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-08-15T00:00:00Z'
};

export const TENANT_CHURCH: Tenant = {
  id: 'tenant_grace_cathedral',
  name: 'Grace Community Cathedral & Ministries',
  slug: 'grace-cathedral',
  subdomain: 'grace-cathedral',
  domainType: 'subdomain',
  type: 'CHURCH',
  status: 'ACTIVE',
  planId: 'plan_professional',
  websiteEnabled: true,
  branding: {
    companyName: 'Grace Community Cathedral',
    primaryColor: '#7C3AED',
    secondaryColor: '#8B5CF6',
    currency: 'KES',
    currencySymbol: 'KSh',
    fiscalYearStartMonth: 1,
    contactEmail: 'pastor@gracecathedral.org',
    contactPhone: '+254 733 998 877',
    address: 'Cathedral Way, Valley View, Nairobi, Kenya'
  },
  publicWebsite: {
    enabled: true,
    heroTitle: 'A Place of Worship, Community & Spiritual Growth',
    tagline: 'Transforming Lives Through Gospel & Ministry Outreach',
    heroDescription: 'Experience vibrant worship, life-transforming sermons, family fellowships, youth ministries, and impactful community outreach.',
    aboutText: 'Grace Community Cathedral is a thriving faith community dedicated to spreading hope, love, and compassionate service to all.',
    mission: 'To preach the uncompromised gospel of grace, disciple believers, and serve our communities with Christ-like compassion.',
    vision: 'A radiant spiritual family impacting generations with faith and kingdom purpose.',
    primaryColor: '#7C3AED',
    secondaryColor: '#8B5CF6',
    autoSlideInterval: 6,
    heroSlides: [
      {
        id: 'church_slide_1',
        title: 'Welcome to Grace Community Cathedral',
        subtitle: 'Join our uplifting weekly worship services, cell fellowships, and community empowerment ministries.',
        tagline: 'Sundays at 08:30 AM & 10:45 AM • All Are Welcome',
        badgeText: '⛪ FELLOWSHIP & WORSHIP',
        imageUrl: 'https://images.unsplash.com/photo-1548625361-165b44d32eb7?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Join Cell Fellowship',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Church Calendar',
        secondaryBtnAction: 'programs',
        alignment: 'center',
        overlayOpacity: 70
      }
    ]
  },
  enabledModules: ['church', 'accounting', 'crm', 'general_erp'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-08-15T00:00:00Z'
};

export const TENANT_DREAMLINE_WHOLESALE: Tenant = {
  id: 'tenant_dreamline_wholesale',
  name: 'Dreamline Wholesale & Retail Enterprises',
  slug: 'dreamline-shop',
  subdomain: 'dreamline-shop',
  domainType: 'subdomain',
  type: 'WHOLESALE',
  status: 'ACTIVE',
  planId: 'plan_enterprise',
  websiteEnabled: true,
  branding: {
    companyName: 'Dreamline Wholesale & Retail Enterprises',
    primaryColor: '#0284C7',
    secondaryColor: '#F59E0B',
    currency: 'KES',
    currencySymbol: 'KSh',
    fiscalYearStartMonth: 1,
    contactEmail: 'sales@dreamlineshop.co.ke',
    contactPhone: '+254 711 889 900',
    address: 'Dreamline Commercial Complex, Godown 14, Enterprise Road, Industrial Area, Nairobi, Kenya'
  },
  publicWebsite: {
    enabled: true,
    heroTitle: 'Wholesale FMCG, Bulk Foodstuffs & General Merchant Supply',
    tagline: 'Leading B2B Distributor & Bulk Supply Chain Partner in East Africa',
    heroDescription: 'Supplying supermarkets, retail shops, hotels, hospitals, schools, and institutions with certified quality products at guaranteed factory-direct wholesale prices.',
    aboutText: 'Dreamline Wholesale Enterprises is a premier FMCG distributor and master merchant supplier. With automated warehouse dispatch, cold-chain storage, and nationwide fleet logistics, we deliver bulk commodities seamlessly.',
    mission: 'To streamline wholesale commerce by delivering reliable bulk supplies, transparent tiered pricing, and fast nationwide delivery.',
    vision: 'To be Eastern and Central Africa’s most trusted wholesale distribution and retail supply network.',
    coreValues: ['Factory-Direct Pricing', 'Rapid Dispatch Logistics', 'Integrity & Quality Assurance', 'Tailored Trade Credit Terms'],
    primaryColor: '#0284C7',
    secondaryColor: '#F59E0B',
    autoSlideInterval: 6,
    heroSlides: [
      {
        id: 'wholesale_slide_1',
        title: 'Direct Factory Wholesale Distribution & Bulk Pallet Logistics',
        subtitle: 'Serving supermarkets, retail shops, institutions, and commercial contractors with guaranteed supply continuity.',
        tagline: 'Direct Manufacturer Sourcing • Guaranteed Lowest Wholesale Rates',
        badgeText: '📦 B2B WHOLESALE & BULK ORDERS',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Request Wholesale Quote',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'View Product Catalog',
        secondaryBtnAction: 'programs',
        alignment: 'center',
        overlayOpacity: 75
      },
      {
        id: 'wholesale_slide_2',
        title: 'Tiered Volume Discounts & 30-Day Verified Trade Credit',
        subtitle: 'Unlock tiered commercial pricing on high-turnover FMCG, grains, beverages, and hardware.',
        tagline: 'Fast Credit Approvals For Registered Retailers',
        badgeText: '💼 TRADE CREDIT & VOLUME DISCOUNTS',
        imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Open Wholesale Account',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Explore Categories',
        secondaryBtnAction: 'departments',
        alignment: 'left',
        overlayOpacity: 75
      }
    ]
  },
  enabledModules: ['wholesale', 'pos', 'retail', 'inventory', 'accounting', 'crm', 'general_erp'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-08-15T00:00:00Z'
};

export const TENANT_HEALTHCARE: Tenant = {
  id: 'tenant_st_jude_hospital',
  name: 'St. Jude Healthcare & Medical Center',
  slug: 'st-jude-hospital',
  subdomain: 'st-jude-hospital',
  domainType: 'subdomain',
  type: 'HOSPITAL',
  status: 'ACTIVE',
  planId: 'plan_enterprise',
  websiteEnabled: true,
  branding: {
    companyName: 'St. Jude Healthcare & Medical Center',
    primaryColor: '#0D9488',
    secondaryColor: '#0284C7',
    currency: 'KES',
    currencySymbol: 'KSh',
    fiscalYearStartMonth: 1,
    contactEmail: 'info@stjudehospital.org',
    contactPhone: '+254 700 911 911',
    address: 'St. Jude Medical Plaza, Ngong Road, Nairobi, Kenya'
  },
  publicWebsite: {
    enabled: true,
    heroTitle: 'Compassionate Patient-Centered Healthcare Excellence',
    tagline: '24/7 Emergency, Inpatient & Specialized Clinical Care',
    heroDescription: 'State-of-the-art diagnostic imaging, round-the-clock emergency casualty, intensive care units, and accredited medical specialists.',
    aboutText: 'St. Jude Healthcare is a comprehensive level-5 medical facility providing holistic outpatient, surgical, maternal-child health, and diagnostic pathology services.',
    mission: 'To deliver accessible, world-class clinical care with compassionate human empathy.',
    vision: 'A premier regional hospital known for clinical excellence and patient safety.',
    coreValues: ['Clinical Excellence', 'Patient Dignity', '24/7 Responsiveness', 'Cutting-Edge Diagnostics'],
    primaryColor: '#0D9488',
    secondaryColor: '#0284C7',
    autoSlideInterval: 6,
    heroSlides: [
      {
        id: 'hosp_slide_1',
        title: 'Advanced Diagnostic Medicine & 24/7 Emergency Casualty',
        subtitle: 'Equipped with digital radiology, modern pathology labs, fully equipped intensive care units, and rapid trauma response.',
        tagline: 'Accredited Medical Center • 24/7 Emergency Casualty',
        badgeText: '🏥 24/7 EMERGENCY & SURGICAL CARE',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Book Medical Appointment',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Clinical Specialties',
        secondaryBtnAction: 'departments',
        alignment: 'center',
        overlayOpacity: 75
      }
    ]
  },
  enabledModules: ['hospital', 'accounting', 'hr', 'inventory', 'crm', 'general_erp'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-08-15T00:00:00Z'
};

export const INITIAL_TENANTS: Tenant[] = [
  DEFAULT_INITIAL_TENANT,
  TENANT_DREAMLINE_WHOLESALE,
  TENANT_SACCO,
  TENANT_CHURCH,
  TENANT_HEALTHCARE
];
