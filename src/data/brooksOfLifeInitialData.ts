import {
  Tenant, User, TheologicalDepartment, TheologicalProgramme, TheologicalUnitSubject,
  ExaminationSession, ExaminationCentre, QuestionBankItem, ExaminationPaper,
  CandidateProfile, CandidateExamRegistration, ExaminerProfile, ExaminationScript,
  RplApplication, ExaminationResultRecord, OfficialTranscriptRecord, OfficialCertificateRecord,
  MediaContentItem, TVScheduleItem, MinistryEventRecord, TheologicalArticleRecord,
  TemsFeeScheduleItem, TemsPaymentRecord
} from '../types';

export const BROOKS_OF_LIFE_TENANT_ID = 'tenant_brooks_of_life';
export const BROOKS_OF_LIFE_SLUG = 'brooks-of-life';

export const BROOKS_OF_LIFE_TENANT: Tenant = {
  id: BROOKS_OF_LIFE_TENANT_ID,
  name: 'Brooks of Life UK',
  slug: BROOKS_OF_LIFE_SLUG,
  subdomain: 'brooks-of-life',
  domainType: 'custom',
  customDomain: 'brooksoflife.org.uk',
  status: 'ACTIVE',
  planId: 'plan_enterprise',
  type: 'EDUCATION',
  educationType: 'TRAINING_INSTITUTE',
  enabledModules: ['education', 'accounting', 'hr', 'inventory', 'crm'],
  branding: {
    companyName: 'Brooks of Life UK',
    logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&h=200&q=80',
    primaryColor: '#1E3A8A', // Deep Oxford Navy
    secondaryColor: '#D97706', // Royal Amber Gold
    currency: 'GBP',
    currencySymbol: '£',
    address: 'Brooks of Life Theological Centre, 48 Gracechurch Street, London EC3V 0EH, United Kingdom',
    contactEmail: 'info@brooksoflife.org.uk',
    contactPhone: '+44 20 7946 0192',
    fiscalYearStartMonth: 1
  },
  websiteEnabled: true,
  publicWebsite: {
    enabled: true,
    heroTitle: 'Brooks of Life UK',
    heroDescription: 'Equipping the saints through accredited theological education, rigorous examination, RPL assessments, and uplifting Christian media.',
    tagline: 'Brooks of Life TV — For Your Christian Vibes',
    mission: 'To advance the Kingdom of God by offering biblically faithful theological education, professional assessment, credentialing, and vibrant Christian media across the UK and internationally.',
    vision: 'To be a premier global Christian institution renowned for biblical scholarship, ministry excellence, sound theological examination, and inspirational digital media.',
    coreValues: [
      'Biblical Authority & Fidelity',
      'Academic & Assessment Integrity',
      'Pastoral Care & Christlike Service',
      'Excellence in Christian Media & Arts',
      'Recognition of Prior Ministry Learning (RPL)'
    ],
    primaryColor: '#1E3A8A',
    secondaryColor: '#D97706',
    accentColor: '#047857',
    admissionNotice: 'Admissions & Examination Registration Open for 2026/2027 Academic Sessions',
    heroSlides: [
      {
        id: 'bol_slide_1',
        title: 'Theological Education, Examination & Certification',
        subtitle: 'Accredited certificates, diplomas, degrees, and ministerial credentials assessed by certified theological examiners.',
        badgeText: '🏛️ BROOKS OF LIFE UK — TEMS',
        tagline: 'Biblically Rooted • Rigorously Assessed • Globally Recognized',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Explore Programmes',
        primaryBtnAction: 'programs',
        secondaryBtnText: 'Examination Portal',
        secondaryBtnAction: 'login',
        alignment: 'left',
        overlayOpacity: 75
      },
      {
        id: 'bol_slide_2',
        title: 'Brooks of Life TV — For Your Christian Vibes',
        subtitle: 'Stream 24/7 uplifting Christian television, inspiring sermons, insightful documentaries, and spirit-filled podcasts.',
        badgeText: '📺 LIVE STREAMING & ON-DEMAND',
        tagline: 'Brooks of Life TV • Media for the Soul',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Watch Brooks of Life TV',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Listen Audio & Podcasts',
        secondaryBtnAction: 'admissions',
        alignment: 'center',
        overlayOpacity: 80
      },
      {
        id: 'bol_slide_3',
        title: 'Recognition of Prior Learning (RPL)',
        subtitle: 'Turn years of faithful pastoral experience, ministry service, and prior theological study into recognized academic credits.',
        badgeText: '📜 RPL PATHWAYS & CREDENTIALS',
        tagline: 'Empowering Experienced Ministers & Lay Leaders',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1920&q=80',
        primaryBtnText: 'Apply for RPL Assessment',
        primaryBtnAction: 'apply',
        secondaryBtnText: 'Verify Certificate',
        secondaryBtnAction: 'about',
        alignment: 'left',
        overlayOpacity: 70
      }
    ],
    news: [
      {
        id: 'news_bol_1',
        title: 'Registration Open for Autumn 2026 Theological Examination Session',
        category: 'Academic',
        date: '2026-08-15',
        summary: 'Candidates across the UK and international centres can now register for the August/September examination diet via the TEMS candidate portal.'
      },
      {
        id: 'news_bol_2',
        title: 'Brooks of Life TV Launches "Apostolic Perspectives" Weekly Broadcast',
        category: 'Announcement',
        date: '2026-08-10',
        summary: 'A new prime-time documentary and dialogue series exploring Church history, biblical apologetics, and contemporary faith in modern Britain.'
      }
    ],
    events: [
      {
        id: 'ev_bol_1',
        title: 'UK Pastors & Theological Leaders Convocation 2026',
        date: '2026-09-18',
        time: '09:30 AM - 05:00 PM BST',
        location: 'Brooks of Life Central Hall, London & Live Online',
        description: 'Keynote lectures on sound doctrine, contemporary pastoral leadership, and the official release of the 2027 TEMS curriculum.'
      },
      {
        id: 'ev_bol_2',
        title: 'Online Examination Candidate Briefing & Anti-Cheat Orientation',
        date: '2026-08-28',
        time: '02:00 PM - 03:30 PM BST',
        location: 'Virtual Webinar / Brooks of Life TV Portal',
        description: 'Mandatory technical guidance session for all candidates registered for the upcoming online examinations.'
      }
    ]
  },
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-08-20T00:00:00Z'
};

export const INITIAL_BROOKS_USERS: User[] = [
  {
    id: 'user_bol_admin',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    email: 'admin@brooksoflife.org.uk',
    name: 'Rev. Dr. David Brooks (Academic Dean & Director)',
    role: 'TENANT_ADMIN',
    permissions: ['*'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'user_bol_exam_officer',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    email: 'exam-officer@brooksoflife.org.uk',
    name: 'Prof. Sarah Jenkins (Chief Examination Officer)',
    role: 'EXAMINATION_OFFICER',
    permissions: ['*'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'user_bol_examiner',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    email: 'examiner@brooksoflife.org.uk',
    name: 'Dr. Matthew Adebayo (Senior Theological Examiner)',
    role: 'EXAMINER',
    permissions: ['organization.modules.access'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'user_bol_moderator',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    email: 'moderator@brooksoflife.org.uk',
    name: 'Rev. Elizabeth Campbell (External Academic Moderator)',
    role: 'MODERATOR',
    permissions: ['organization.modules.access'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'user_bol_candidate',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    email: 'candidate@brooksoflife.org.uk',
    name: 'Jonathan Edwards King (Candidate)',
    role: 'STUDENT',
    permissions: ['organization.modules.access'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  }
];

export const INITIAL_BROOKS_DEPARTMENTS: TheologicalDepartment[] = [
  {
    id: 'dept_biblical_studies',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'BIBL',
    name: 'Department of Biblical Studies & Languages',
    headOfDepartment: 'Prof. David A. Sterling, Th.D.',
    description: 'Old & New Testament exegesis, biblical Hebrew, Koine Greek, and hermeneutics.',
    status: 'ACTIVE'
  },
  {
    id: 'dept_systematic_theology',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'THEO',
    name: 'Department of Systematic & Historical Theology',
    headOfDepartment: 'Dr. Matthew Adebayo, Ph.D.',
    description: 'Classical dogmatics, Christology, Pneumatology, Church History, and Reformation thought.',
    status: 'ACTIVE'
  },
  {
    id: 'dept_pastoral_ministry',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'PAST',
    name: 'Department of Pastoral & Practical Ministry',
    headOfDepartment: 'Rev. Dr. Catherine Hughes, D.Min.',
    description: 'Homiletics, pastoral counselling, liturgical leadership, church planting, and ministerial ethics.',
    status: 'ACTIVE'
  },
  {
    id: 'dept_christian_apologetics',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'APOL',
    name: 'Department of Christian Apologetics & Media Arts',
    headOfDepartment: 'Rev. Elizabeth Campbell, M.Phil.',
    description: 'Christian worldview, philosophical apologetics, media ministry, and broadcasting.',
    status: 'ACTIVE'
  }
];

export const INITIAL_BROOKS_PROGRAMMES: TheologicalProgramme[] = [
  {
    id: 'prog_cert_biblical',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'CERT-BIBL',
    name: 'Certificate in Biblical & Ministry Foundations',
    awardTitle: 'Certificate in Biblical Studies and Practical Ministry',
    qualificationType: 'CERTIFICATE',
    departmentId: 'dept_biblical_studies',
    departmentName: 'Department of Biblical Studies & Languages',
    durationMonths: 6,
    totalCreditsRequired: 60,
    description: 'A foundational six-month programme providing solid scriptural grounding, basic hermeneutics, and core ministry competencies for aspiring leaders and active church workers.',
    admissionRequirements: [
      'Minimum age of 18 years',
      'Demonstrated commitment to Christian faith and character',
      'Secondary education certificate or equivalent ministry experience'
    ],
    careerAndMinistryOutcomes: [
      'Lay Minister',
      'Sunday School / Bible Class Teacher',
      'Christian Worker',
      'Eligible for entry into Diploma in Pastoral Theology'
    ],
    units: [],
    status: 'ACTIVE',
    isRplEligible: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'prog_dip_pastoral',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'DIP-PAST-THEO',
    name: 'Diploma in Pastoral Theology & Biblical Studies',
    awardTitle: 'Diploma in Pastoral Theology, Homiletics & Christian Leadership',
    qualificationType: 'DIPLOMA',
    departmentId: 'dept_pastoral_ministry',
    departmentName: 'Department of Pastoral & Practical Ministry',
    durationMonths: 24,
    totalCreditsRequired: 120,
    description: 'A comprehensive ministerial diploma preparing men and women for ordained pastoral ministry, church leadership, biblical exposition, and pastoral counselling.',
    admissionRequirements: [
      'Certificate in Biblical Studies or minimum 5 GCSEs / Equivalent',
      'Pastoral endorsement letter from candidate\'s home church',
      'Successful admission interview with Brooks of Life Academic Board'
    ],
    careerAndMinistryOutcomes: [
      'Assistant / Associate Pastor',
      'Church Administrator',
      'Chaplaincy Officer',
      'Missionary & Evangelist'
    ],
    units: [],
    status: 'ACTIVE',
    isRplEligible: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'prog_bachelor_theology',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'B-DIV',
    name: 'Bachelor of Divinity & Theological Studies (B.Div)',
    awardTitle: 'Bachelor of Divinity & Christian Apologetics',
    qualificationType: 'BACHELOR',
    departmentId: 'dept_systematic_theology',
    departmentName: 'Department of Systematic & Historical Theology',
    durationMonths: 36,
    totalCreditsRequired: 360,
    description: 'An in-depth rigorous academic degree encompassing advanced biblical exegesis, historical theology, systematic dogmatics, ethics, and contemporary cultural engagement.',
    admissionRequirements: [
      'A-Levels / High School Diploma with minimum C grade or equivalent',
      'Diploma in Theology with Merit, or significant recognized RPL experience',
      'Written personal statement of Christian calling'
    ],
    careerAndMinistryOutcomes: [
      'Senior Pastor / Minister of Religion',
      'Theological Educator & College Lecturer',
      'Senior Hospital / Military Chaplain',
      'Christian Author, Researcher & Broadcaster'
    ],
    units: [],
    status: 'ACTIVE',
    isRplEligible: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'prog_adv_counselling',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    code: 'ADV-MIN-LEAD',
    name: 'Advanced Diploma in Christian Counselling & Family Ministry',
    awardTitle: 'Advanced Diploma in Biblical Counselling & Pastoral Care',
    qualificationType: 'HIGHER_DIPLOMA',
    departmentId: 'dept_pastoral_ministry',
    departmentName: 'Department of Pastoral & Practical Ministry',
    durationMonths: 18,
    totalCreditsRequired: 180,
    description: 'Professional theological and clinical pastoral care training for counsellors, marriage mentors, grief facilitators, and family ministers.',
    admissionRequirements: [
      'Prior diploma or degree in ministry, psychology, or related field',
      'Minimum 2 years verified pastoral or community care involvement'
    ],
    careerAndMinistryOutcomes: [
      'Pastoral Counsellor',
      'Family & Youth Ministry Director',
      'Community Bereavement & Crisis Support Facilitator'
    ],
    units: [],
    status: 'ACTIVE',
    isRplEligible: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  }
];

export const INITIAL_BROOKS_UNITS: TheologicalUnitSubject[] = [
  {
    id: 'unit_bibl_101',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    programmeId: 'prog_cert_biblical',
    departmentId: 'dept_biblical_studies',
    code: 'BIBL-101',
    title: 'Old Testament Survey & Covenant Theology',
    description: 'A comprehensive investigation of the Pentateuch, Historical Books, Wisdom Literature, and Prophets through the lens of God’s covenantal redemptive plan.',
    credits: 15,
    level: 'Level 4 / Year 1',
    semesterTerm: 'Semester 1',
    syllabusTopics: [
      'Creation, Fall and the Protoevangelium in Genesis',
      'The Abrahamic, Mosaic, and Davidic Covenants',
      'Israel’s Monarchy, Exile, and Restoration',
      'Messianic Prophecies in Isaiah and the Minor Prophets'
    ],
    maxMarks: 100,
    passingMarks: 50,
    hasOnlineExam: true,
    hasConventionalExam: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'unit_bibl_102',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    programmeId: 'prog_cert_biblical',
    departmentId: 'dept_biblical_studies',
    code: 'BIBL-102',
    title: 'New Testament Survey & Hermeneutics',
    description: 'Introduction to the Synoptic Gospels, Johannine literature, Pauline epistles, and General Epistles with foundational sound biblical interpretation methods.',
    credits: 15,
    level: 'Level 4 / Year 1',
    semesterTerm: 'Semester 1',
    syllabusTopics: [
      'Historical and Cultural Context of 1st Century Judea',
      'The Person and Work of Christ across the 4 Gospels',
      'Pauline Theology in Romans and Galatians',
      'Apocalyptic Literature: Interpreting the Book of Revelation'
    ],
    maxMarks: 100,
    passingMarks: 50,
    hasOnlineExam: true,
    hasConventionalExam: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'unit_theo_201',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    programmeId: 'prog_dip_pastoral',
    departmentId: 'dept_systematic_theology',
    code: 'THEO-201',
    title: 'Systematic Theology: Doctrine of God & Christology',
    description: 'Rigorous exploration of the Trinity, divine attributes, the Incarnation, the hypostatic union, substitutionary atonement, and the Resurrection.',
    credits: 15,
    level: 'Level 5 / Year 2',
    semesterTerm: 'Semester 1',
    syllabusTopics: [
      'Classical Theism: Attributes and Perfections of God',
      'Trinitarian Orthodoxy: Nicaea, Constantinople, and Chalcedon',
      'The Two Natures of Jesus Christ: True God and True Man',
      'Theories of Atonement and Penal Substitution in Scripture'
    ],
    maxMarks: 100,
    passingMarks: 50,
    hasOnlineExam: true,
    hasConventionalExam: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'unit_past_202',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    programmeId: 'prog_dip_pastoral',
    departmentId: 'dept_pastoral_ministry',
    code: 'PAST-202',
    title: 'Pastoral Care, Homiletics & Expository Preaching',
    description: 'Principles and practice of preparing Christ-centred expository sermons, pastoral visitation, crisis intervention, and conducting church ordinances.',
    credits: 15,
    level: 'Level 5 / Year 2',
    semesterTerm: 'Semester 2',
    syllabusTopics: [
      'Textual Exegesis to Sermon Manuscript Development',
      'Preaching with Authority, Grace, and Cultural Clarity',
      'Pastoral Ethics, Confidentiality, and Safeguarding in the UK',
      'Ministering to the Sick, Bereaved, and Hurting'
    ],
    maxMarks: 100,
    passingMarks: 50,
    hasOnlineExam: true,
    hasConventionalExam: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'unit_apol_102',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    programmeId: 'prog_bachelor_theology',
    departmentId: 'dept_christian_apologetics',
    code: 'APOL-102',
    title: 'Christian Apologetics in Modern Secular Society',
    description: 'Defending the reasonableness and truth of the Christian gospel against naturalism, secular humanism, moral relativism, and world religions.',
    credits: 15,
    level: 'Level 6 / Year 3',
    semesterTerm: 'Semester 1',
    syllabusTopics: [
      'Classical Arguments for God’s Existence (Cosmological, Teleological, Moral)',
      'The Historical Evidence for the Resurrection of Jesus',
      'Engaging the Problem of Evil and Suffering Biblically',
      'Communicating Truth via Digital Media, TV, and Public Platforms'
    ],
    maxMarks: 100,
    passingMarks: 50,
    hasOnlineExam: true,
    hasConventionalExam: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const INITIAL_BROOKS_EXAM_SESSIONS: ExaminationSession[] = [
  {
    id: 'session_bol_2026_aug',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    sessionCode: 'EXAM-2026-AUG',
    title: 'August / September 2026 Theological Examination Diet',
    academicYear: '2025/2026',
    termSemester: 'Semester 2 / Annual Diet',
    startDate: '2026-08-25',
    endDate: '2026-09-12',
    registrationStartDate: '2026-07-01',
    registrationDeadline: '2026-08-22',
    moderationDeadline: '2026-09-20',
    resultsReleaseDate: '2026-09-28',
    status: 'REGISTRATION_OPEN',
    allowedProgrammeIds: ['prog_cert_biblical', 'prog_dip_pastoral', 'prog_bachelor_theology', 'prog_adv_counselling'],
    examinationCentreIds: ['centre_lon_main', 'centre_bir_02', 'centre_online_global'],
    instructions: 'All candidates must bring their official TEMS Examination Slip with photo and valid government photo ID. Online examinees must ensure webcam verification and fullscreen mode.',
    createdAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'session_bol_2026_dec',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    sessionCode: 'EXAM-2026-DEC',
    title: 'December 2026 Winter Convocation Examination Diet',
    academicYear: '2026/2027',
    termSemester: 'Semester 1',
    startDate: '2026-12-05',
    endDate: '2026-12-18',
    registrationStartDate: '2026-10-01',
    registrationDeadline: '2026-11-20',
    moderationDeadline: '2026-12-28',
    resultsReleaseDate: '2027-01-10',
    status: 'UPCOMING',
    allowedProgrammeIds: ['prog_cert_biblical', 'prog_dip_pastoral', 'prog_bachelor_theology'],
    examinationCentreIds: ['centre_lon_main', 'centre_bir_02', 'centre_man_03', 'centre_online_global'],
    instructions: 'Winter examination session for all registered theological candidates.',
    createdAt: '2026-06-01T00:00:00Z'
  }
];

export const INITIAL_BROOKS_EXAM_CENTRES: ExaminationCentre[] = [
  {
    id: 'centre_lon_main',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    centreCode: 'LON-MAIN-01',
    name: 'London Central Theological Assessment Centre',
    location: 'Gracechurch Street, City of London',
    address: '48 Gracechurch Street, London EC3V 0EH',
    city: 'London',
    country: 'United Kingdom',
    contactPerson: 'Mr. Arthur Pendelton',
    contactEmail: 'london.centre@brooksoflife.org.uk',
    contactPhone: '+44 20 7946 0192',
    capacity: 150,
    currentAllocated: 48,
    isOnlineCentre: false,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'centre_bir_02',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    centreCode: 'BIR-CTR-02',
    name: 'Birmingham Grace Examination Hall',
    location: 'Broad Street, Birmingham',
    address: '112 Broad Street, Birmingham B15 1AU',
    city: 'Birmingham',
    country: 'United Kingdom',
    contactPerson: 'Mrs. Hannah Bradley',
    contactEmail: 'birmingham.centre@brooksoflife.org.uk',
    contactPhone: '+44 121 496 0321',
    capacity: 80,
    currentAllocated: 24,
    isOnlineCentre: false,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'centre_man_03',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    centreCode: 'MAN-CTR-03',
    name: 'Manchester Regional Theological Assessment Centre',
    location: 'Oxford Road, Manchester',
    address: '88 Oxford Road, Manchester M1 5WH',
    city: 'Manchester',
    country: 'United Kingdom',
    contactPerson: 'Rev. Philip Morrison',
    contactEmail: 'manchester.centre@brooksoflife.org.uk',
    contactPhone: '+44 161 496 0842',
    capacity: 60,
    currentAllocated: 15,
    isOnlineCentre: false,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'centre_online_global',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    centreCode: 'ONLINE-GLOBAL',
    name: 'Brooks of Life Global Online Examination Room (Proctored)',
    location: 'Secure Cloud Platform — TEMS Online Proctor',
    address: 'https://brooksoflife.org.uk/exam-room',
    city: 'Cloud / Global',
    country: 'Worldwide',
    contactPerson: 'TEMS Technical Proctoring Desk',
    contactEmail: 'proctor@brooksoflife.org.uk',
    contactPhone: '+44 20 7946 0199',
    capacity: 2500,
    currentAllocated: 120,
    isOnlineCentre: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const INITIAL_BROOKS_QUESTION_BANK: QuestionBankItem[] = [
  {
    id: 'qb_theo_201_1',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    subjectCode: 'THEO-201',
    subjectTitle: 'Systematic Theology: Doctrine of God & Christology',
    questionType: 'MCQ',
    difficulty: 'FOUNDATIONAL',
    marks: 5,
    prompt: 'Which historical ecumenical council formulated the definitive orthodox definition of the Hypostatic Union, affirming that Jesus Christ is "truly God and truly man, in two natures without confusion, without change, without division, without separation"?',
    options: [
      'Council of Nicaea (AD 325)',
      'Council of Constantinople (AD 381)',
      'Council of Chalcedon (AD 451)',
      'Council of Trent (AD 1545)'
    ],
    correctAnswer: 'Council of Chalcedon (AD 451)',
    rubricOrGradingNotes: 'Chalcedon (451 AD) is the classic confession establishing the two natures of Christ in one hypostasis.',
    version: 1,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'qb_theo_201_2',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    subjectCode: 'THEO-201',
    subjectTitle: 'Systematic Theology: Doctrine of God & Christology',
    questionType: 'TRUE_FALSE',
    difficulty: 'INTERMEDIATE',
    marks: 5,
    prompt: 'According to classical Christian orthodox theology, the aseity of God refers to His absolute self-existence and independence from creation.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    rubricOrGradingNotes: 'Aseity (a se, from Himself) signifies that God depends on nothing outside Himself for His being or glory.',
    version: 1,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'qb_theo_201_3',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    subjectCode: 'THEO-201',
    subjectTitle: 'Systematic Theology: Doctrine of God & Christology',
    questionType: 'SHORT_ANSWER',
    difficulty: 'INTERMEDIATE',
    marks: 15,
    prompt: 'Explain the theological distinction between the communicable and incommunicable attributes of God. Provide at least two clear scriptural examples for each category.',
    correctAnswer: 'Incommunicable attributes belong solely to God (e.g. Omnipresence [Ps 139], Aseity/Eternality [Ps 90:2], Immutability [Mal 3:6]). Communicable attributes are shared in creaturely measure by human beings made in His image (e.g. Love [1 Jn 4:8], Justice/Righteousness [Micah 6:8], Wisdom [Prov 2:6]).',
    rubricOrGradingNotes: 'Award up to 7 marks for clear definitions and 8 marks for correct biblical examples and scripture references.',
    version: 1,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'qb_theo_201_4',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    subjectCode: 'THEO-201',
    subjectTitle: 'Systematic Theology: Doctrine of God & Christology',
    questionType: 'ESSAY',
    difficulty: 'ADVANCED',
    marks: 40,
    prompt: 'Evaluate the doctrine of Penal Substitutionary Atonement in comparison with the Christus Victor and Moral Influence models. Ground your analysis in Romans 3:21–26, Isaiah 53, and 2 Corinthians 5:21, demonstrating how substitutionary propitiation satisfies both the divine justice and the covenantal love of God.',
    correctAnswer: 'A high-scoring answer must: 1. Clearly define Penal Substitution (Christ bearing the penalty due to sin as a legal substitute satisfying divine wrath). 2. Define Christus Victor and Moral Influence models. 3. Detail the scriptural exegesis of hilasterion in Romans 3:25 and the suffering servant in Isaiah 53:5-6. 4. Show how the cross harmonizes God as just and the justifier.',
    rubricOrGradingNotes: '10 marks for biblical exegesis; 10 marks for model comparison; 10 marks for theological coherence regarding justice & love; 10 marks for structure and scholarly precision.',
    version: 1,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'qb_bibl_101_1',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    subjectCode: 'BIBL-101',
    subjectTitle: 'Old Testament Survey & Covenant Theology',
    questionType: 'MCQ',
    difficulty: 'FOUNDATIONAL',
    marks: 5,
    prompt: 'In Genesis 3:15, the prophecy concerning the seed of the woman bruising the serpent’s head is traditionally referred to by theologians as what?',
    options: [
      'The Protoevangelium (First Gospel proclamation)',
      'The Shema of Israel',
      'The Decalogue prologue',
      'The Nazarite Vow'
    ],
    correctAnswer: 'The Protoevangelium (First Gospel proclamation)',
    rubricOrGradingNotes: 'Genesis 3:15 is universally designated the Protoevangelium as the first promise of the coming Redeemer.',
    version: 1,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'qb_bibl_101_2',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    subjectCode: 'BIBL-101',
    subjectTitle: 'Old Testament Survey & Covenant Theology',
    questionType: 'ESSAY',
    difficulty: 'ADVANCED',
    marks: 35,
    prompt: 'Trace the progressive development of the biblical covenants from Abraham (Genesis 12/15) to David (2 Samuel 7) and Jeremiah’s promise of the New Covenant (Jeremiah 31). How do these covenants find their ultimate fulfillment in the person and work of Jesus Christ?',
    correctAnswer: 'Detailed trace of Abrahamic covenant (land, seed, universal blessing), Mosaic covenant (pedagogue, holiness code), Davidic covenant (eternal throne), Jeremiah 31 (internal law, forgiveness of sins), fulfilled in Jesus as the true Seed, obedient Son, Davidic King, and Mediator of the New Covenant.',
    rubricOrGradingNotes: 'Detailed covenant comparison with scripture citations and New Testament fulfillment.',
    version: 1,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  }
];

export const INITIAL_BROOKS_EXAM_PAPERS: ExaminationPaper[] = [
  {
    id: 'paper_theo_201_2026',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    paperCode: 'BOL-THEO-201-2026-V1',
    title: 'Systematic Theology: Doctrine of God & Christology Examination Paper',
    subjectCode: 'THEO-201',
    subjectTitle: 'Systematic Theology: Doctrine of God & Christology',
    programmeId: 'prog_dip_pastoral',
    programmeName: 'Diploma in Pastoral Theology & Biblical Studies',
    examinationSessionId: 'session_bol_2026_aug',
    sessionTitle: 'August / September 2026 Theological Examination Diet',
    durationMinutes: 90,
    totalMarks: 100,
    passingMarks: 50,
    examMode: 'ONLINE',
    instructions: [
      'This examination consists of 4 questions totaling 100 marks.',
      'Section A contains objective multiple-choice and true/false questions (10 marks).',
      'Section B contains one short answer question (15 marks).',
      'Section C contains one in-depth theological essay question (40 marks).',
      'You are provided with 90 minutes. Answers are auto-saved in real-time.',
      'Anti-cheating controls are active: leaving fullscreen or switching tabs will be logged and may invalidate your attempt.'
    ],
    questions: [
      {
        ...INITIAL_BROOKS_QUESTION_BANK[0],
        orderIndex: 1,
        allocatedMarks: 5
      },
      {
        ...INITIAL_BROOKS_QUESTION_BANK[1],
        orderIndex: 2,
        allocatedMarks: 5
      },
      {
        ...INITIAL_BROOKS_QUESTION_BANK[2],
        orderIndex: 3,
        allocatedMarks: 15
      },
      {
        ...INITIAL_BROOKS_QUESTION_BANK[3],
        orderIndex: 4,
        allocatedMarks: 40
      }
    ],
    version: '1.0',
    status: 'PUBLISHED',
    publishedAt: '2026-08-01T00:00:00Z',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'paper_bibl_101_2026',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    paperCode: 'BOL-BIBL-101-2026-V1',
    title: 'Old Testament Survey & Covenant Theology Examination Paper',
    subjectCode: 'BIBL-101',
    subjectTitle: 'Old Testament Survey & Covenant Theology',
    programmeId: 'prog_cert_biblical',
    programmeName: 'Certificate in Biblical & Ministry Foundations',
    examinationSessionId: 'session_bol_2026_aug',
    sessionTitle: 'August / September 2026 Theological Examination Diet',
    durationMinutes: 90,
    totalMarks: 100,
    passingMarks: 50,
    examMode: 'ONLINE',
    instructions: [
      'Read each question carefully before attempting your response.',
      'Ensure scriptural references are cited in Section B and C.',
      'Time allowed: 90 minutes. Live auto-save is enabled.'
    ],
    questions: [
      {
        ...INITIAL_BROOKS_QUESTION_BANK[4],
        orderIndex: 1,
        allocatedMarks: 10
      },
      {
        ...INITIAL_BROOKS_QUESTION_BANK[5],
        orderIndex: 2,
        allocatedMarks: 50
      }
    ],
    version: '1.0',
    status: 'PUBLISHED',
    publishedAt: '2026-08-01T00:00:00Z',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  }
];

export const INITIAL_BROOKS_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand_bol_001',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    candidateNumber: 'BOL/THEO/2026/001',
    userId: 'user_bol_candidate',
    firstName: 'Jonathan',
    lastName: 'King',
    middleName: 'Edwards',
    gender: 'MALE',
    dateOfBirth: '1995-04-18',
    nationalIdOrPassport: 'UK-PP-98271829',
    email: 'candidate@brooksoflife.org.uk',
    phone: '+44 7700 900142',
    address: '14 St. Jude\'s Crescent, Kensington',
    city: 'London',
    country: 'United Kingdom',
    postalCode: 'W8 6TP',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    programmeId: 'prog_dip_pastoral',
    programmeName: 'Diploma in Pastoral Theology & Biblical Studies',
    qualificationType: 'DIPLOMA',
    level: 'Level 5 / Year 2',
    intake: 'September 2025',
    academicYear: '2025/2026',
    registrationStatus: 'APPROVED',
    registrationDate: '2025-09-01',
    denominationAffiliation: 'Evangelical / Reformed Anglican',
    homeChurch: 'Grace City Church, London',
    pastorReferenceName: 'Rev. Richard Baxter',
    pastorReferenceContact: 'richard.baxter@gracecity.org.uk',
    academicHistory: [
      {
        institution: 'University of London',
        qualification: 'BA (Hons) History',
        yearCompleted: '2017',
        gradeAwarded: '2:1 Upper Second'
      },
      {
        institution: 'Brooks of Life UK',
        qualification: 'Certificate in Biblical Studies',
        yearCompleted: '2024',
        gradeAwarded: 'Distinction',
        certificateRef: 'BOL-CERT-2024-0012'
      }
    ],
    examinationHistory: [
      {
        examSessionId: 'session_bol_2026_aug',
        sessionCode: 'EXAM-2026-AUG',
        examDate: '2026-08-28',
        unitsRegistered: ['THEO-201', 'PAST-202'],
        status: 'REGISTERED'
      }
    ],
    rplHistoryIds: ['rpl_bol_0041'],
    notes: 'Candidate demonstrating exemplary academic rigor and pastoral diligence.',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'cand_bol_002',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    candidateNumber: 'BOL/THEO/2026/002',
    firstName: 'Deborah',
    lastName: 'Alistair',
    middleName: 'Grace',
    gender: 'FEMALE',
    dateOfBirth: '1992-11-03',
    nationalIdOrPassport: 'UK-PP-44910283',
    email: 'deborah.alistair@gmail.com',
    phone: '+44 7700 900581',
    address: '7 Chapel Walk, Harborne',
    city: 'Birmingham',
    country: 'United Kingdom',
    postalCode: 'B17 0HH',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    programmeId: 'prog_bachelor_theology',
    programmeName: 'Bachelor of Divinity & Theological Studies (B.Div)',
    qualificationType: 'BACHELOR',
    level: 'Level 6 / Year 3',
    intake: 'September 2024',
    academicYear: '2025/2026',
    registrationStatus: 'APPROVED',
    registrationDate: '2024-09-01',
    denominationAffiliation: 'Baptist Union of Great Britain',
    homeChurch: 'Birmingham Central Baptist Church',
    pastorReferenceName: 'Rev. Timothy Keller Jones',
    pastorReferenceContact: 'timothy.jones@centralbaptist.org.uk',
    academicHistory: [
      {
        institution: 'Spurgeon\'s College',
        qualification: 'Diploma in Theology',
        yearCompleted: '2023',
        gradeAwarded: 'Merit'
      }
    ],
    examinationHistory: [],
    rplHistoryIds: [],
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'cand_bol_003',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    candidateNumber: 'BOL/THEO/2026/003',
    firstName: 'Emmanuel',
    lastName: 'Boateng',
    middleName: 'Mensah',
    gender: 'MALE',
    dateOfBirth: '1988-07-22',
    nationalIdOrPassport: 'UK-PP-77182903',
    email: 'emmanuel.boateng@gmail.com',
    phone: '+44 7700 900892',
    address: '22 Victoria Road, Didsbury',
    city: 'Manchester',
    country: 'United Kingdom',
    postalCode: 'M20 6RA',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    programmeId: 'prog_cert_biblical',
    programmeName: 'Certificate in Biblical & Ministry Foundations',
    qualificationType: 'CERTIFICATE',
    level: 'Level 4 / Year 1',
    intake: 'January 2026',
    academicYear: '2025/2026',
    registrationStatus: 'APPROVED',
    registrationDate: '2026-01-10',
    denominationAffiliation: 'Pentecostal / Church of Pentecost UK',
    homeChurch: 'Grace Tabernacle Manchester',
    pastorReferenceName: 'Elder Samuel Ofori',
    academicHistory: [],
    examinationHistory: [],
    rplHistoryIds: [],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  }
];

export const INITIAL_BROOKS_EXAM_REGISTRATIONS: CandidateExamRegistration[] = [
  {
    id: 'reg_bol_2026_8821',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    registrationNumber: 'REG-BOL-2026-8821',
    candidateId: 'cand_bol_001',
    candidateNumber: 'BOL/THEO/2026/001',
    candidateName: 'Jonathan Edwards King',
    candidateEmail: 'candidate@brooksoflife.org.uk',
    candidatePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    programmeId: 'prog_dip_pastoral',
    programmeName: 'Diploma in Pastoral Theology & Biblical Studies',
    level: 'Level 5 / Year 2',
    examinationSessionId: 'session_bol_2026_aug',
    sessionCode: 'EXAM-2026-AUG',
    sessionTitle: 'August / September 2026 Theological Examination Diet',
    examinationCentreId: 'centre_lon_main',
    centreName: 'London Central Theological Assessment Centre',
    registeredUnits: [
      {
        unitId: 'unit_theo_201',
        unitCode: 'THEO-201',
        unitTitle: 'Systematic Theology: Doctrine of God & Christology',
        examDate: '2026-08-28',
        examStartTime: '10:00 AM',
        examEndTime: '11:30 AM',
        venueOrRoom: 'Main Examination Hall A',
        seatNumber: 'DESK-A14'
      },
      {
        unitId: 'unit_past_202',
        unitCode: 'PAST-202',
        unitTitle: 'Pastoral Care, Homiletics & Expository Preaching',
        examDate: '2026-08-30',
        examStartTime: '02:00 PM',
        examEndTime: '03:30 PM',
        venueOrRoom: 'Main Examination Hall A',
        seatNumber: 'DESK-A14'
      }
    ],
    status: 'APPROVED',
    approvedBy: 'Prof. Sarah Jenkins (Chief Examination Officer)',
    approvedAt: '2026-08-10T14:30:00Z',
    feeAmount: 120,
    feePaid: true,
    paymentReceiptNumber: 'RCP-BOL-2026-00812',
    slipGenerated: true,
    slipVerificationQr: 'https://brooksoflife.org.uk/verify-document/SLIP-BOL-2026-8821',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z'
  }
];

export const INITIAL_BROOKS_EXAMINERS: ExaminerProfile[] = [
  {
    id: 'exam_prof_adebayo',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    userId: 'user_bol_examiner',
    name: 'Dr. Matthew Adebayo, Ph.D.',
    email: 'examiner@brooksoflife.org.uk',
    phone: '+44 20 7946 0195',
    qualifications: 'Ph.D. in Systematic Theology (King\'s College London), M.Th. (Edinburgh)',
    theologicalSpecialization: 'Christology, Dogmatics, Patristic Studies',
    assignedSubjectCodes: ['THEO-201', 'THEO-303', 'BIBL-101'],
    assignedSessionIds: ['session_bol_2026_aug'],
    status: 'ACTIVE',
    totalScriptsAssigned: 12,
    totalScriptsMarked: 8,
    totalModerated: 4,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'exam_prof_campbell',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    userId: 'user_bol_moderator',
    name: 'Rev. Elizabeth Campbell, M.Phil.',
    email: 'moderator@brooksoflife.org.uk',
    phone: '+44 20 7946 0196',
    qualifications: 'M.Phil. in Theological Ethics (Oxford), B.D. (St Andrews)',
    theologicalSpecialization: 'Christian Apologetics, Pastoral Ministry, Ethics',
    assignedSubjectCodes: ['PAST-202', 'APOL-102', 'THEO-201'],
    assignedSessionIds: ['session_bol_2026_aug'],
    status: 'ACTIVE',
    totalScriptsAssigned: 8,
    totalScriptsMarked: 8,
    totalModerated: 6,
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const INITIAL_BROOKS_SCRIPTS: ExaminationScript[] = [
  {
    id: 'script_bol_001_theo',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    paperId: 'paper_theo_201_2026',
    paperCode: 'BOL-THEO-201-2026-V1',
    paperTitle: 'Systematic Theology: Doctrine of God & Christology Examination Paper',
    subjectCode: 'THEO-201',
    subjectTitle: 'Systematic Theology: Doctrine of God & Christology',
    candidateId: 'cand_bol_001',
    candidateNumber: 'BOL/THEO/2026/001',
    candidateName: 'Jonathan Edwards King',
    examSessionId: 'session_bol_2026_aug',
    sessionTitle: 'August / September 2026 Theological Examination Diet',
    examMode: 'ONLINE',
    status: 'APPROVED',
    assignedExaminerId: 'exam_prof_adebayo',
    assignedExaminerName: 'Dr. Matthew Adebayo',
    assignedModeratorId: 'exam_prof_campbell',
    assignedModeratorName: 'Rev. Elizabeth Campbell',
    attemptId: 'attempt_bol_001',
    questionsMarked: [
      {
        questionId: 'qb_theo_201_1',
        questionPrompt: 'Which historical ecumenical council formulated the definitive orthodox definition of the Hypostatic Union?',
        questionType: 'MCQ',
        allocatedMarks: 5,
        candidateAnswerText: 'Council of Chalcedon (AD 451)',
        autoScore: 5,
        examinerScore: 5,
        moderatorScore: 5,
        isAutoGraded: true
      },
      {
        questionId: 'qb_theo_201_2',
        questionPrompt: 'According to classical Christian orthodox theology, the aseity of God refers to His absolute self-existence...',
        questionType: 'TRUE_FALSE',
        allocatedMarks: 5,
        candidateAnswerText: 'True',
        autoScore: 5,
        examinerScore: 5,
        moderatorScore: 5,
        isAutoGraded: true
      },
      {
        questionId: 'qb_theo_201_3',
        questionPrompt: 'Explain the theological distinction between the communicable and incommunicable attributes of God...',
        questionType: 'SHORT_ANSWER',
        allocatedMarks: 15,
        candidateAnswerText: 'Incommunicable attributes belong exclusively to the divine essence, such as His aseity (Ps 90:2) and omnipresence (Ps 139:7-10). Communicable attributes are reflected in humanity as the Imago Dei, including holy love (1 Jn 4:8) and righteous justice (Micah 6:8).',
        examinerScore: 14,
        moderatorScore: 14,
        examinerComments: 'Clear, crisp theological differentiation with accurate biblical grounding.',
        moderatorComments: 'Concur with mark awarded.'
      },
      {
        questionId: 'qb_theo_201_4',
        questionPrompt: 'Evaluate the doctrine of Penal Substitutionary Atonement in comparison with the Christus Victor and Moral Influence models...',
        questionType: 'ESSAY',
        allocatedMarks: 40,
        candidateAnswerText: 'Penal Substitutionary Atonement stands as the central biblical hinge of the cross, where Christ bore the judicial wrath of God due to sinners (Rom 3:21-26, Isa 53:4-6). While Christus Victor captures Christ’s triumph over demonic powers (Col 2:15) and Moral Influence highlights His supreme demonstration of love (1 Jn 3:16), neither model accounts for the righteous demands of the divine law without the substitutionary propitiation accomplished at Calvary. In 2 Cor 5:21, God made Him who knew no sin to be sin for us, demonstrating that the cross simultaneously satisfies divine justice and radiates covenant love.',
        examinerScore: 36,
        moderatorScore: 37,
        examinerComments: 'Outstanding theological synthesis. Masterful grasp of Romans 3 and Isaiah 53.',
        moderatorComments: 'Score adjusted upward +1 mark for exceptional scholarly coherence.'
      }
    ],
    rawTotalScore: 60,
    moderatedTotalScore: 61,
    finalApprovedScore: 61,
    maxPossibleScore: 65,
    percentageScore: 93.8,
    calculatedGrade: 'A (Distinction)',
    examinerGeneralFeedback: 'An exemplary submission displaying sound doctrinal fidelity and mature theological vocabulary.',
    moderatorGeneralFeedback: 'Script fully moderated and approved with highest commendation.',
    auditTrail: [
      {
        action: 'SCRIPT_SUBMITTED',
        performedBy: 'Candidate Portal (Jonathan Edwards King)',
        role: 'CANDIDATE',
        timestamp: '2026-08-12T11:28:00Z',
        details: 'Candidate completed online examination within allocated time.'
      },
      {
        action: 'EXAMINER_MARKED',
        performedBy: 'Dr. Matthew Adebayo',
        role: 'EXAMINER',
        timestamp: '2026-08-14T09:15:00Z',
        details: 'Examiner marked all questions. Total raw score: 60 / 65.',
        newScore: 60
      },
      {
        action: 'MODERATOR_APPROVED',
        performedBy: 'Rev. Elizabeth Campbell',
        role: 'MODERATOR',
        timestamp: '2026-08-15T16:40:00Z',
        details: 'Moderator reviewed essay and approved final mark of 61 / 65.',
        oldScore: 60,
        newScore: 61
      }
    ],
    submittedAt: '2026-08-12T11:28:00Z',
    markedAt: '2026-08-14T09:15:00Z',
    moderatedAt: '2026-08-15T16:40:00Z',
    approvedAt: '2026-08-16T10:00:00Z',
    createdAt: '2026-08-12T11:28:00Z',
    updatedAt: '2026-08-16T10:00:00Z'
  }
];

export const INITIAL_BROOKS_RPL_APPLICATIONS: RplApplication[] = [
  {
    id: 'rpl_bol_0041',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    applicationNumber: 'RPL-BOL-2026-0041',
    candidateId: 'cand_bol_001',
    candidateNumber: 'BOL/THEO/2026/001',
    candidateName: 'Jonathan Edwards King',
    candidateEmail: 'candidate@brooksoflife.org.uk',
    candidatePhone: '+44 7700 900142',
    targetProgrammeId: 'prog_dip_pastoral',
    targetProgrammeName: 'Diploma in Pastoral Theology & Biblical Studies',
    targetUnitCodes: ['BIBL-101', 'BIBL-102'],
    personalStatement: 'Having served for over 6 years in active expository Bible teaching and youth ministry leadership, combined with my previous Certificate in Biblical Studies from Brooks of Life UK, I am applying for Recognition of Prior Learning credits for the introductory Old and New Testament survey units.',
    priorQualifications: [
      {
        id: 'rpl_qual_1',
        institutionName: 'Brooks of Life UK',
        qualificationTitle: 'Certificate in Biblical Studies and Practical Ministry',
        yearAwarded: '2024',
        documentProofUrl: 'https://brooksoflife.org.uk/docs/cert-bol-2024-0012.pdf',
        verified: true
      }
    ],
    ministryExperience: [
      {
        id: 'rpl_exp_1',
        churchOrOrganization: 'Grace City Church, London',
        ministryRole: 'Director of Youth Bible Ministry & Lay Preacher',
        startYear: '2020',
        endYear: '2026',
        isCurrent: true,
        responsibilities: 'Weekly biblical exposition of Old and New Testament passages to 60+ youth and young adults; curriculum development; pastoral discipleship.',
        referenceContact: 'Rev. Richard Baxter (Senior Pastor) — richard.baxter@gracecity.org.uk'
      }
    ],
    portfolioDocuments: [
      {
        id: 'rpl_doc_1',
        documentTitle: 'Sermon Audio & Expository Manuscripts Portfolio',
        category: 'MINISTRY_PORTFOLIO',
        fileUrl: 'https://brooksoflife.org.uk/docs/portfolio-jonathan-king.pdf',
        uploadDate: '2026-07-20',
        notes: 'Includes 12 full expository sermon transcripts from Romans and Genesis with pastoral evaluation notes.'
      }
    ],
    status: 'APPROVED',
    assignedAssessorId: 'exam_prof_adebayo',
    assignedAssessorName: 'Dr. Matthew Adebayo',
    assessorNotes: 'Extensive documentation of prior learning and proven homiletical competencies. Recommend full credit exemption for BIBL-101.',
    moderatorNotes: 'Approved by Academic Standards Board.',
    awardedCredits: [
      {
        unitCode: 'BIBL-101',
        unitTitle: 'Old Testament Survey & Covenant Theology',
        credits: 15,
        justification: 'Satisfies learning outcomes via prior Certificate in Biblical Studies and 6 years verified biblical teaching.'
      }
    ],
    totalCreditsAwarded: 15,
    decisionOutcome: 'PARTIAL_CREDIT',
    feePaid: true,
    paymentRef: 'RCP-RPL-2026-0041',
    submittedAt: '2026-07-20T11:00:00Z',
    assessedAt: '2026-07-28T15:00:00Z',
    approvedAt: '2026-08-02T10:00:00Z',
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z'
  }
];

export const INITIAL_BROOKS_RESULTS: ExaminationResultRecord[] = [
  {
    id: 'res_bol_2026_001',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    candidateId: 'cand_bol_001',
    candidateNumber: 'BOL/THEO/2026/001',
    candidateName: 'Jonathan Edwards King',
    candidateEmail: 'candidate@brooksoflife.org.uk',
    programmeId: 'prog_dip_pastoral',
    programmeName: 'Diploma in Pastoral Theology & Biblical Studies',
    examSessionId: 'session_bol_2026_aug',
    sessionTitle: 'August / September 2026 Theological Examination Diet',
    academicYear: '2025/2026',
    unitResults: [
      {
        unitCode: 'BIBL-101',
        unitTitle: 'Old Testament Survey & Covenant Theology',
        credits: 15,
        rawScore: 85,
        moderatedScore: 85,
        finalScore: 85,
        grade: 'A',
        gradePoints: 4.0,
        remarks: 'DISTINCTION',
        assessmentType: 'RPL_CREDIT_TRANSFER'
      },
      {
        unitCode: 'THEO-201',
        unitTitle: 'Systematic Theology: Doctrine of God & Christology',
        credits: 15,
        rawScore: 92,
        moderatedScore: 94,
        finalScore: 94,
        grade: 'A',
        gradePoints: 4.0,
        remarks: 'DISTINCTION',
        assessmentType: 'EXAMINATION'
      },
      {
        unitCode: 'PAST-202',
        unitTitle: 'Pastoral Care, Homiletics & Expository Preaching',
        credits: 15,
        rawScore: 88,
        moderatedScore: 90,
        finalScore: 90,
        grade: 'A',
        gradePoints: 4.0,
        remarks: 'DISTINCTION',
        assessmentType: 'EXAMINATION'
      }
    ],
    totalCreditsEarned: 45,
    gpa: 4.0,
    averageScore: 89.7,
    overallAwardStatus: 'PASS_WITH_DISTINCTION',
    status: 'PUBLISHED',
    approvedBy: 'Prof. Sarah Jenkins (Chief Examination Officer)',
    approvedAt: '2026-08-18T12:00:00Z',
    publishedAt: '2026-08-18T14:00:00Z',
    createdAt: '2026-08-18T12:00:00Z',
    updatedAt: '2026-08-18T14:00:00Z'
  }
];

export const INITIAL_BROOKS_TRANSCRIPTS: OfficialTranscriptRecord[] = [
  {
    id: 'tr_bol_2026_0923',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    transcriptNumber: 'TR-BOL-2026-0923',
    verificationCode: 'BOL-TR-78219',
    candidateId: 'cand_bol_001',
    candidateNumber: 'BOL/THEO/2026/001',
    candidateName: 'Jonathan Edwards King',
    nationalIdOrPassport: 'UK-PP-98271829',
    dateOfBirth: '1995-04-18',
    programmeName: 'Diploma in Pastoral Theology & Biblical Studies',
    awardTitle: 'Diploma in Pastoral Theology, Homiletics & Christian Leadership',
    admissionDate: '2025-09-01',
    completionDate: '2026-08-18',
    issueDate: '2026-08-19',
    academicStanding: 'Distinction / Exemplary Standing',
    cumulativeCredits: 60,
    cumulativeGpa: 4.0,
    overallClassification: 'Awarded with Highest Distinction (First Class Equivalent)',
    unitsCompleted: [
      {
        academicYear: '2025/2026',
        semester: 'Semester 1',
        unitCode: 'BIBL-101',
        unitTitle: 'Old Testament Survey & Covenant Theology',
        credits: 15,
        score: 85,
        grade: 'A',
        gradePoints: 4.0,
        remarks: 'RPL Credit Exemption Awarded'
      },
      {
        academicYear: '2025/2026',
        semester: 'Semester 1',
        unitCode: 'BIBL-102',
        unitTitle: 'New Testament Survey & Hermeneutics',
        credits: 15,
        score: 88,
        grade: 'A',
        gradePoints: 4.0,
        remarks: 'Examined & Passed with Distinction'
      },
      {
        academicYear: '2025/2026',
        semester: 'Semester 2',
        unitCode: 'THEO-201',
        unitTitle: 'Systematic Theology: Doctrine of God & Christology',
        credits: 15,
        score: 94,
        grade: 'A',
        gradePoints: 4.0,
        remarks: 'Examined & Passed with Highest Distinction'
      },
      {
        academicYear: '2025/2026',
        semester: 'Semester 2',
        unitCode: 'PAST-202',
        unitTitle: 'Pastoral Care, Homiletics & Expository Preaching',
        credits: 15,
        score: 90,
        grade: 'A',
        gradePoints: 4.0,
        remarks: 'Examined & Passed with Distinction'
      }
    ],
    registrarName: 'Mrs. Abigail Vance, Registrar',
    academicDeanName: 'Rev. Dr. David Brooks, Academic Dean',
    qrCodeData: 'https://brooksoflife.org.uk/verify-document/BOL-TR-78219',
    verificationUrl: 'https://brooksoflife.org.uk/verify-document/BOL-TR-78219',
    status: 'VALID',
    createdAt: '2026-08-19T09:00:00Z'
  }
];

export const INITIAL_BROOKS_CERTIFICATES: OfficialCertificateRecord[] = [
  {
    id: 'cert_bol_2026_0042',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    certificateNumber: 'BOL-CERT-2026-0042',
    verificationCode: 'BOL-VRF-88421',
    candidateId: 'cand_bol_001',
    candidateNumber: 'BOL/THEO/2026/001',
    candidateName: 'Jonathan Edwards King',
    qualificationTitle: 'Diploma in Pastoral Theology & Biblical Studies',
    programmeName: 'Diploma in Pastoral Theology, Homiletics & Christian Leadership',
    honorsClassification: 'Conferred with Distinction',
    conferralDate: '2026-08-19',
    issueDate: '2026-08-19',
    signatories: [
      {
        name: 'Rev. Dr. David Brooks',
        title: 'Academic Dean & Chancellor'
      },
      {
        name: 'Prof. Sarah Jenkins',
        title: 'Chief Examination Officer'
      },
      {
        name: 'Mrs. Abigail Vance',
        title: 'Registrar of Examinations'
      }
    ],
    qrCodeData: 'https://brooksoflife.org.uk/verify-document/BOL-VRF-88421',
    verificationUrl: 'https://brooksoflife.org.uk/verify-document/BOL-VRF-88421',
    status: 'VALID',
    createdAt: '2026-08-19T10:00:00Z'
  }
];

export const INITIAL_BROOKS_TV_SCHEDULE: TVScheduleItem[] = [
  {
    id: 'sched_1',
    programmeTitle: 'Morning Manna & Daily Devotional',
    category: 'Devotional',
    speakerOrHost: 'Rev. Dr. David Brooks',
    startTime: '06:00 AM',
    endTime: '07:00 AM',
    dayOfWeek: 'Daily',
    isLiveBroadcast: true,
    description: 'Start your morning in the Word with verse-by-verse scripture reflection, intercession, and uplifting worship.',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'sched_2',
    programmeTitle: 'Apostolic Perspectives & Theology Live',
    category: 'Bible Teaching',
    speakerOrHost: 'Dr. Matthew Adebayo & Guest Panel',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    dayOfWeek: 'Monday',
    isLiveBroadcast: false,
    description: 'Interactive theological debate and biblical teaching exploring major Christian doctrines and apologetics.',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'sched_3',
    programmeTitle: 'Christian Vibes Praise & Worship Live',
    category: 'Music',
    speakerOrHost: 'Brooks of Life Worship Collective',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    dayOfWeek: 'Daily',
    isLiveBroadcast: true,
    description: 'Uplifting gospel sounds, contemporary praise, hymns of faith, and soul-stirring UK Christian music.',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'sched_4',
    programmeTitle: 'The Preacher’s Study: Expository Sermons',
    category: 'Sermons',
    speakerOrHost: 'Rev. Dr. Catherine Hughes',
    startTime: '07:00 PM',
    endTime: '08:30 PM',
    dayOfWeek: 'Daily',
    isLiveBroadcast: false,
    description: 'Power-packed preaching from the pulpit of Brooks of Life London with practical life application.'
  },
  {
    id: 'sched_5',
    programmeTitle: 'Kingdom Documentaries Spotlight',
    category: 'Documentaries',
    speakerOrHost: 'Brooks of Life Media Team',
    startTime: '09:00 PM',
    endTime: '10:00 PM',
    dayOfWeek: 'Friday',
    isLiveBroadcast: false,
    description: 'In-depth historical and investigative films on Christian revivals, missionary journeys, and the persecuted church.'
  }
];

export const INITIAL_BROOKS_MEDIA: MediaContentItem[] = [
  {
    id: 'media_bol_live_1',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Brooks of Life TV — 24/7 Global Christian Live Stream',
    slug: 'brooks-tv-live-stream',
    type: 'LIVE_STREAM',
    category: 'Live TV',
    speakerOrArtist: 'Brooks of Life Media Network',
    duration: '24/7 Live Broadcast',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    description: 'Tune in live to Brooks of Life TV: "For Your Christian Vibes". Non-stop sermons, gospel music, biblical discussions, and live prayer sessions broadcast from London to the world.',
    scriptureReferences: ['Mark 16:15', 'Matthew 28:19-20'],
    isFeatured: true,
    isLiveNow: true,
    viewsCount: 14820,
    likesCount: 1240,
    publishedAt: '2026-08-01T00:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'media_bol_vid_1',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'The Sovereign Grace of God in Redemptive History',
    slug: 'sovereign-grace-of-god',
    type: 'SERMON',
    category: 'Sermons',
    speakerOrArtist: 'Rev. Dr. David Brooks',
    duration: '48 mins',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    description: 'An anointed expository sermon from Ephesians Chapter 1 unpacking the eternal election, redemption in Christ, and sealing of the Holy Spirit.',
    scriptureReferences: ['Ephesians 1:3-14', 'Romans 8:28-39'],
    isFeatured: true,
    viewsCount: 3840,
    likesCount: 390,
    publishedAt: '2026-08-10T11:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'media_bol_vid_2',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Defending the Resurrection: Historical Evidences for Faith',
    slug: 'defending-resurrection-apologetics',
    type: 'DOCUMENTARY',
    category: 'Documentaries',
    speakerOrArtist: 'Dr. Matthew Adebayo',
    duration: '56 mins',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1447069387593-a5de07642b0d?auto=format&fit=crop&w=800&q=80',
    description: 'A documentary exploring archaeological, manuscript, and eyewitness testimony validating the bodily resurrection of Jesus of Nazareth.',
    scriptureReferences: ['1 Corinthians 15:1-20', 'Acts 1:1-3'],
    isFeatured: true,
    viewsCount: 5120,
    likesCount: 520,
    publishedAt: '2026-08-05T14:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-08-05T14:00:00Z'
  },
  {
    id: 'media_bol_vid_3',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Christian Vibes Acoustic Worship Session: River of Life',
    slug: 'christian-vibes-acoustic-worship',
    type: 'MUSIC',
    category: 'Christian Music',
    speakerOrArtist: 'Brooks of Life Worship Collective',
    duration: '32 mins',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: 'Intimate acoustic worship recorded live at Brooks of Life London Chapel, featuring original worship compositions and beloved hymns.',
    scriptureReferences: ['Psalm 100', 'John 4:23-24'],
    isFeatured: false,
    viewsCount: 2900,
    likesCount: 410,
    publishedAt: '2026-07-28T16:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-07-28T16:00:00Z'
  },
  {
    id: 'media_bol_aud_1',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Theological Roundtable Podcast: Faith, Culture & Postmodern Britain',
    slug: 'theological-roundtable-podcast-ep1',
    type: 'PODCAST',
    category: 'Podcasts',
    speakerOrArtist: 'Rev. Elizabeth Campbell & Guests',
    duration: '42 mins',
    mediaUrl: '',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80',
    description: 'Episode 1 of our flagship podcast discussing how Christian ministers and lay believers can boldly articulate the gospel in contemporary British society.',
    scriptureReferences: ['Colossians 4:5-6', '1 Peter 3:15'],
    isFeatured: true,
    viewsCount: 1820,
    likesCount: 215,
    publishedAt: '2026-08-12T08:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-08-12T08:00:00Z'
  },
  {
    id: 'media_bol_aud_2',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Brooks of Life 24/7 Gospel Radio Live Stream',
    slug: 'brooks-gospel-radio-live',
    type: 'AUDIO',
    category: 'Christian Radio',
    speakerOrArtist: 'Brooks of Life Radio London',
    duration: 'Continuous 24/7 Stream',
    mediaUrl: '',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    description: 'Listen live to non-stop Christian music, Bible readings, and audio devotions around the clock.',
    scriptureReferences: ['Psalm 150:6'],
    isFeatured: true,
    viewsCount: 8430,
    likesCount: 920,
    publishedAt: '2026-08-01T00:00:00Z',
    status: 'PUBLISHED',
    createdAt: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_BROOKS_EVENTS: MinistryEventRecord[] = [
  {
    id: 'ev_bol_convocation_2026',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Annual Theological Convocation & Graduation Ceremony 2026',
    slug: 'annual-theological-convocation-2026',
    category: 'GRADUATION',
    date: '2026-09-18',
    time: '10:00 AM - 04:00 PM BST',
    location: 'Brooks of Life Central Auditorium, London & Broadcast Live on Brooks TV',
    isOnline: true,
    meetingLink: 'https://brooksoflife.org.uk/live',
    speaker: 'Rev. Dr. David Brooks & Distinguished International Guests',
    description: 'Join us as we confer theological degrees, diplomas, and ministerial certificates to the graduating class of 2026. Featuring keynote addresses and celebratory worship.',
    bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    registrationRequired: true,
    registeredAttendeesCount: 240,
    capacity: 500,
    status: 'UPCOMING',
    createdAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'ev_bol_summit_2026',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'UK Pastors & Ministry Leaders Strategic Summit',
    slug: 'uk-pastors-leaders-summit-2026',
    category: 'CONFERENCE',
    date: '2026-10-15',
    time: '09:00 AM - 05:00 PM BST',
    location: 'Gracechurch Theological Hall, London',
    isOnline: false,
    speaker: 'Dr. Matthew Adebayo & Rev. Dr. Catherine Hughes',
    description: 'A dedicated one-day intensive equipping church pastors in sound biblical preaching, church governance, safeguarding compliance, and mental health in ministry.',
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    registrationRequired: true,
    registeredAttendeesCount: 115,
    capacity: 180,
    status: 'UPCOMING',
    createdAt: '2026-07-10T00:00:00Z'
  },
  {
    id: 'ev_bol_worship_night',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Christian Vibes Night of Worship & Prophetic Intercession',
    slug: 'christian-vibes-night-of-worship',
    category: 'WORSHIP_NIGHT',
    date: '2026-08-29',
    time: '06:30 PM - 09:30 PM BST',
    location: 'Brooks of Life Chapel London & Live on Brooks of Life TV',
    isOnline: true,
    meetingLink: 'https://brooksoflife.org.uk/live',
    speaker: 'Brooks of Life Worship Band & Intercessory Team',
    description: 'An evening of uninterrupted high praise, worship, prayer for the UK and nations, and ministry of the Holy Spirit.',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    registrationRequired: false,
    registeredAttendeesCount: 380,
    status: 'UPCOMING',
    createdAt: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_BROOKS_ARTICLES: TheologicalArticleRecord[] = [
  {
    id: 'art_bol_1',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'The Solas of the Reformation: Timeless Anchors for the Modern Church',
    slug: 'solas-of-the-reformation-modern-church',
    category: 'THEOLOGY',
    author: 'Dr. Matthew Adebayo',
    authorRole: 'Head of Systematic Theology, Brooks of Life UK',
    publishedDate: '2026-08-14',
    summary: 'Why Sola Scriptura, Sola Gratia, Sola Fide, Solus Christus, and Soli Deo Gloria remain indispensable for theological orthodoxy today.',
    content: `In an era marked by theological ambiguity and cultural pressures, the five foundational cries of the 16th-century Protestant Reformation remain as vital today as they were five hundred years ago.

1. Sola Scriptura (Scripture Alone)
The formal principle of Christian faith asserts that the Bible alone is the infallible, inerrant, and sufficient rule for faith and practice. Tradition and councils have secondary value only insofar as they align with the written Word of God (2 Timothy 3:16-17).

2. Sola Gratia (Grace Alone)
Salvation is entirely unmerited from start to finish. Human beings are dead in trespasses and sins (Ephesians 2:1) and unable to initiate their own spiritual resurrection without sovereign divine grace.

3. Sola Fide (Faith Alone)
Justification is by faith alone apart from the works of the law. Christ’s perfect righteousness is imputed to the believer upon trust in His finished work (Romans 3:28).

4. Solus Christus (Christ Alone)
There is one mediator between God and men, the man Christ Jesus (1 Timothy 2:5). No human priest, saint, or institution can usurp the unique High Priesthood of our Lord Jesus Christ.

5. Soli Deo Gloria (To God Alone Be the Glory)
All of creation, redemptive history, and human salvation exist for the supreme display of God’s majestic glory (Romans 11:36).

Brooks of Life UK stands unapologetically upon these scriptural bedrock truths as we educate candidates, examine ministers, and broadcast Christ to the world.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=800&q=80',
    scriptureAnchor: 'Romans 1:16-17; 2 Timothy 3:16-17',
    tags: ['Reformation', 'Theology', 'Scripture', 'Grace', 'Justification'],
    readTimeMinutes: 6,
    viewsCount: 1420,
    status: 'PUBLISHED',
    createdAt: '2026-08-14T00:00:00Z'
  },
  {
    id: 'art_bol_2',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    title: 'Recognizing Prior Learning in Ministry: A Biblical & Academic Paradigm',
    slug: 'recognizing-prior-learning-ministry-paradigm',
    category: 'MINISTRY_LEADERSHIP',
    author: 'Prof. Sarah Jenkins',
    authorRole: 'Chief Examination Officer, TEMS',
    publishedDate: '2026-08-08',
    summary: 'How Brooks of Life UK assesses years of faithful pastoral service and prior learning through rigorous academic assessment frameworks.',
    content: `Many seasoned pastors, evangelists, and church planters have accumulated decades of rich theological knowledge, pastoral wisdom, and ministerial leadership without formal degree certificates.

Recognition of Prior Learning (RPL) is an internationally recognized assessment methodology that evaluates and validates non-formal and informal learning against accredited academic standards.

At Brooks of Life UK Theological Examination Management System (TEMS), our RPL pathway offers a transparent, rigorous process:
- Portfolio Assessment: Systematic evaluation of sermon manuscripts, discipleship materials, and leadership publications.
- Assessor Interviews: Structured theological dialogue with certified assessors.
- Direct Examination Options: Challenge examinations for specific unit exemptions.

RPL does not lower academic standards; rather, it honors the Holy Spirit’s work in the minister’s life while validating their competencies against rigorous academic criteria.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    scriptureAnchor: '2 Timothy 2:2; 1 Thessalonians 5:12-13',
    tags: ['RPL', 'Assessment', 'Theological Education', 'Ministry Credentials'],
    readTimeMinutes: 5,
    viewsCount: 980,
    status: 'PUBLISHED',
    createdAt: '2026-08-08T00:00:00Z'
  }
];

export const INITIAL_BROOKS_FEE_SCHEDULE: TemsFeeScheduleItem[] = [
  {
    id: 'fee_bol_reg',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    feeName: 'Candidate Admission & Programme Registration Fee',
    category: 'CANDIDATE_REGISTRATION',
    amount: 75,
    currency: 'GBP',
    currencySymbol: '£',
    description: 'One-off registration and academic file setup fee for new theological candidates.',
    isMandatory: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'fee_bol_exam_unit',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    feeName: 'Examination Registration Fee (Per Unit / Subject)',
    category: 'EXAM_REGISTRATION_PER_UNIT',
    amount: 60,
    currency: 'GBP',
    currencySymbol: '£',
    description: 'Examination fee per registered unit covering examination slip, proctoring, marking, and moderation.',
    isMandatory: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'fee_bol_rpl',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    feeName: 'RPL Prior Learning Assessment & Portfolio Evaluation Fee',
    category: 'RPL_APPLICATION',
    amount: 150,
    currency: 'GBP',
    currencySymbol: '£',
    description: 'Comprehensive assessor portfolio review and credit award processing fee.',
    isMandatory: false,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'fee_bol_transcript',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    feeName: 'Official Academic Transcript Issuance & Verification Seal',
    category: 'TRANSCRIPT_ISSUANCE',
    amount: 35,
    currency: 'GBP',
    currencySymbol: '£',
    description: 'Official tamper-proof transcript with security QR verification code.',
    isMandatory: false,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'fee_bol_certificate',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    feeName: 'Conferral Certificate & Hardbound Parchment',
    category: 'CERTIFICATE_ISSUANCE',
    amount: 65,
    currency: 'GBP',
    currencySymbol: '£',
    description: 'Official Brooks of Life UK Certificate with embossed institutional seal.',
    isMandatory: false,
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const INITIAL_BROOKS_PAYMENTS: TemsPaymentRecord[] = [
  {
    id: 'pay_bol_001',
    tenantId: BROOKS_OF_LIFE_TENANT_ID,
    receiptNumber: 'RCP-BOL-2026-00812',
    candidateId: 'cand_bol_001',
    candidateNumber: 'BOL/THEO/2026/001',
    candidateName: 'Jonathan Edwards King',
    feeCategoryId: 'fee_bol_exam_unit',
    feeCategoryName: 'Examination Registration Fee (2 Units: THEO-201, PAST-202)',
    amount: 120,
    currency: 'GBP',
    currencySymbol: '£',
    paymentMethod: 'CARD',
    transactionReference: 'STRIPE_CH_98129038102',
    status: 'PAID',
    paidAt: '2026-08-05T10:05:00Z',
    notes: 'Paid in full via online card processing.',
    createdAt: '2026-08-05T10:05:00Z'
  }
];
