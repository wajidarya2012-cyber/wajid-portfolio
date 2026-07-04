import { PrismaClient } from "@prisma/client";
import bcrypt           from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────────────────────
  const hashedPw = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "Admin@2025!", 12);
  const admin    = await prisma.user.upsert({
    where:  { email: process.env.ADMIN_EMAIL ?? "admin@wajid-arya.com" },
    update: {},
    create: {
      email:    process.env.ADMIN_EMAIL    ?? "admin@wajid-arya.com",
      password: hashedPw,
      name:     "Wajid Ali Arya",
      role:     "ADMIN",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── Profile ───────────────────────────────────────────────────────────
  await prisma.profile.upsert({
    where:  { id: "profile-singleton" },
    update: {},
    create: {
      id:           "profile-singleton",
      fullName_en:  "Wajid Ali Arya",
      fullName_ps:  "واجد علی آریا",
      fullName_fa:  "واجد علی آریا",
      title_en:     "IT & Network Manager · Software Developer · Technology Consultant",
      title_ps:     "IT او شبکو مدیر · سافټویر ډویلپر · د ټیکنالوژۍ مشاور",
      title_fa:     "مدیر IT و شبکه · توسعه‌دهنده نرم‌افزار · مشاور فناوری",
      bio_en:       "Transforming Ideas into Digital Solutions through Software Development, IT Management, and Innovation. Based in Jalalabad, Afghanistan — building technology that makes a difference.",
      bio_ps:       "د سافټویر پراختیا، IT مدیریت او نوښت له لارې نظریات ډیجیټل حلونو ته بدلوم. جلال اباد، افغانستان کې د ټیکنالوژۍ له لارې توپیر رامنځ ته کوم.",
      bio_fa:       "تبدیل ایده‌ها به راه‌حل‌های دیجیتال از طریق توسعه نرم‌افزار، مدیریت IT و نوآوری. مستقر در جلال‌آباد، افغانستان.",
      aboutText_en: "I am a Computer Science graduate with a Bachelor's degree in IT & Networks, bringing years of hands-on experience in IT operations, database management, system administration, and software development across multiple organizations in Afghanistan. My passion lies in designing and developing software solutions that solve real-world problems — from healthcare and transportation to inventory management and business automation.",
      aboutText_ps: "زه د IT او شبکو په برخه کې د کمپیوتر ساینس فارغ یم او د افغانستان ډیری موسسو کې د IT عملیاتو، ډیټابیس مدیریت، سیستم اداری او سافټویر پراختیا کې مو پراخه تجربه لرم.",
      aboutText_fa: "من فارغ‌التحصیل کارشناسی علوم کامپیوتر در رشته IT و شبکه هستم و سال‌ها تجربه عملی در عملیات IT، مدیریت پایگاه داده و توسعه نرم‌افزار دارم.",
      email:        "wajid.arya@example.com",
      phone:        "+93 XXX XXX XXXX",
      location:     "Jalalabad, Nangarhar, Afghanistan",
    },
  });
  console.log("✅ Profile created");

  // ── Project Categories ────────────────────────────────────────────────
  const catHealthcare = await prisma.projectCategory.upsert({
    where:  { slug: "healthcare" },
    update: {},
    create: { name_en: "Healthcare", name_ps: "روغتیا", name_fa: "بهداشت", slug: "healthcare", color: "#4f46e5", icon: "🏥", sortOrder: 1 },
  });
  const catGov = await prisma.projectCategory.upsert({
    where:  { slug: "government" },
    update: {},
    create: { name_en: "Government", name_ps: "دولتي", name_fa: "دولتی", slug: "government", color: "#f59e0b", icon: "🏛", sortOrder: 2 },
  });
  const catTransport = await prisma.projectCategory.upsert({
    where:  { slug: "transportation" },
    update: {},
    create: { name_en: "Transportation", name_ps: "ترانسپورت", name_fa: "حمل‌ونقل", slug: "transportation", color: "#10b981", icon: "🚌", sortOrder: 3 },
  });
  const catSecurity = await prisma.projectCategory.upsert({
    where:  { slug: "security" },
    update: {},
    create: { name_en: "Security", name_ps: "امنیت", name_fa: "امنیت", slug: "security", color: "#ef4444", icon: "🛡️", sortOrder: 4 },
  });
  console.log("✅ Project categories created");

  // ── Projects ──────────────────────────────────────────────────────────
  const dentalProject = await prisma.project.upsert({
    where:  { slug: "dental-clinic-management-system" },
    update: {},
    create: {
      slug:           "dental-clinic-management-system",
      title_en:       "Dental Clinic Management System",
      title_ps:       "د دندان کلینیک مدیریت سیستم",
      title_fa:       "سیستم مدیریت کلینیک دندان",
      description_en: "A comprehensive end-to-end software system designed for dental clinics to manage all aspects of their operations including patient records, appointment scheduling, billing, inventory, and staff management.",
      description_ps: "د دندان کلینیکونو لپاره یو بشپړ سافټویر سیستم چې د ناروغانو ریکارډ، ملاقاتونه، حساب‌کتاب، ذخیره او کارمند مدیریت پکې شامل دي.",
      description_fa: "یک سیستم نرم‌افزاری جامع برای کلینیک‌های دندانپزشکی که شامل مدیریت پرونده‌های بیمار، نوبت‌دهی، صورتحساب، موجودی و مدیریت کارکنان می‌شود.",
      challenge_en:   "Creating an offline-first system that could function reliably in environments with intermittent internet connectivity, while maintaining data integrity and real-time reporting capabilities.",
      challenge_ps:   "داسې سیستم جوړول چې د ضعیف انټرنیټ پرته هم کار وکړي او د ډیټا بشپړتیا وساتي.",
      challenge_fa:   "ساخت سیستمی که بدون اینترنت پایدار کار کند و یکپارچگی داده‌ها را حفظ کند.",
      technologies:   ["Java", "MS SQL Server", "Crystal Reports", "Windows Forms"],
      categoryId:     catHealthcare.id,
      status:         "ACTIVE",
      featured:       true,
      sortOrder:      1,
    },
  });

  await prisma.projectFeature.createMany({
    skipDuplicates: true,
    data: [
      { projectId: dentalProject.id, text_en: "Patient registration & medical history management", text_ps: "د ناروغانو راجستریشن او طبي تاریخچه مدیریت", text_fa: "ثبت‌نام بیمار و مدیریت تاریخچه پزشکی", sortOrder: 1 },
      { projectId: dentalProject.id, text_en: "Appointment scheduling with calendar view", text_ps: "د ملاقاتونو مهال‌ویش د تقویم لید سره", text_fa: "زمان‌بندی نوبت با نمای تقویم", sortOrder: 2 },
      { projectId: dentalProject.id, text_en: "Billing & invoice generation with tax calculations", text_ps: "بیل او رسید جوړونه د مالیاتو حساب سره", text_fa: "صدور فاکتور و محاسبه مالیات", sortOrder: 3 },
      { projectId: dentalProject.id, text_en: "Medication and supply inventory tracking", text_ps: "د درمل او توکو ذخیره پیګیري", text_fa: "ردیابی موجودی داروها و لوازم", sortOrder: 4 },
      { projectId: dentalProject.id, text_en: "Staff management & shift scheduling", text_ps: "د کارمندانو مدیریت او شیفت‌بندي", text_fa: "مدیریت کارکنان و برنامه‌ریزی شیفت", sortOrder: 5 },
    ],
  });

  await prisma.project.upsert({
    where:  { slug: "digital-traffic-permit-system" },
    update: {},
    create: {
      slug:           "digital-traffic-permit-system",
      title_en:       "Digital Traffic Permit System",
      title_ps:       "د ډیجیټل ترافیکي جواز سیستم",
      title_fa:       "سیستم مجوز ترافیک دیجیتال",
      description_en: "Automated vehicle registration and permit issuance system with real-time fee tracking, financial reporting, and MIS dashboard for traffic authorities.",
      description_ps: "د موترو د راجستریشن او جواز صدور اتوماتیک سیستم د ریل‌ټایم فیس پیګیري، مالي رپوټ، او MIS ډشبورډ سره.",
      description_fa: "سیستم خودکار ثبت وسایل نقلیه و صدور مجوز با ردیابی آنلاین هزینه‌ها و داشبورد MIS برای مقامات ترافیک.",
      challenge_en:   "Replacing a fully manual paper-based permit system with a reliable digital solution that traffic officers with limited computer literacy could easily operate.",
      challenge_ps:   "د یو بشپړ لاسي سیستم د بدلولو هڅه چې د ترافیک ماموران یې اسانه وکارولی شي.",
      challenge_fa:   "جایگزینی سیستم کاغذی با راه‌حلی که برای افسران ترافیک با سواد کامپیوتری محدود قابل استفاده باشد.",
      technologies:   ["C++", "Oracle Database", "Windows API", "Reporting Engine"],
      categoryId:     catGov.id,
      status:         "ACTIVE",
      featured:       true,
      sortOrder:      2,
    },
  });

  await prisma.project.upsert({
    where:  { slug: "intelligent-transportation-system" },
    update: {},
    create: {
      slug:           "intelligent-transportation-system",
      title_en:       "Intelligent Transportation System",
      title_ps:       "هوښیار ترانسپورټ سیستم",
      title_fa:       "سیستم حمل‌ونقل هوشمند",
      description_en: "Data-driven transportation monitoring and analysis platform with business process automation for government transport authorities.",
      description_ps: "د ترانسپورت مانیټورنګ او تحلیل پلیټفارم د اتوماتیک سوداګریزو پروسو سره.",
      description_fa: "پلتفرم مبتنی بر داده برای نظارت و تحلیل حمل‌ونقل با اتوماسیون فرایندهای کسب‌وکار.",
      technologies:   ["Python", "MS SQL Server", "Data Analytics", "Process Automation"],
      categoryId:     catTransport.id,
      status:         "ACTIVE",
      featured:       false,
      sortOrder:      3,
    },
  });

  await prisma.project.upsert({
    where:  { slug: "super-weapon-inventory-system" },
    update: {},
    create: {
      slug:           "super-weapon-inventory-system",
      title_en:       "Super Weapon Inventory System",
      title_ps:       "د وسلو لوی ذخیره سیستم",
      title_fa:       "سیستم موجودی تسلیحات",
      description_en: "Secure inventory tracking and assignment management system for government security departments with role-based access controls and immutable audit logs.",
      description_ps: "د امنیتي ادارو لپاره یو خوندي ذخیره پیګیري او توزیع مدیریت سیستم.",
      description_fa: "سیستم ردیابی موجودی و مدیریت تخصیص برای ادارات امنیتی با کنترل دسترسی مبتنی بر نقش.",
      technologies:   ["C++", "Oracle Database", "Security Controls", "Audit Logging"],
      categoryId:     catSecurity.id,
      status:         "ACTIVE",
      featured:       false,
      sortOrder:      4,
    },
  });
  console.log("✅ Projects and features created");

  // ── Skill Categories + Skills ─────────────────────────────────────────
  const skillCats = [
    { name_en: "Programming",     name_ps: "پروګرامنګ",       name_fa: "برنامه‌نویسی",    icon: "💻", sortOrder: 1,
      skills: [
        { name_en: "Python",  name_ps: "پایتون",  name_fa: "پایتون",  percentage: 80 },
        { name_en: "Java",    name_ps: "جاوا",    name_fa: "جاوا",    percentage: 75 },
        { name_en: "C++",     name_ps: "C++",     name_fa: "C++",     percentage: 80 },
        { name_en: "Node.js", name_ps: "Node.js", name_fa: "Node.js", percentage: 65 },
      ],
    },
    { name_en: "Database",       name_ps: "ډیټابیس",          name_fa: "پایگاه داده",     icon: "🗄", sortOrder: 2,
      skills: [
        { name_en: "Oracle DB",          name_ps: "اوراکل",         name_fa: "اوراکل",          percentage: 85 },
        { name_en: "MS SQL Server",      name_ps: "MS SQL Server",  name_fa: "MS SQL Server",   percentage: 90 },
        { name_en: "Database Design",    name_ps: "ډیټابیس ډیزاین", name_fa: "طراحی پایگاه داده", percentage: 88 },
        { name_en: "DB Administration",  name_ps: "ډیټابیس اډمن",  name_fa: "مدیریت پایگاه داده", percentage: 85 },
      ],
    },
    { name_en: "IT & Networking", name_ps: "IT او شبکې",      name_fa: "IT و شبکه",       icon: "🌐", sortOrder: 3,
      skills: [
        { name_en: "Network Management",    name_ps: "د شبکې مدیریت",     name_fa: "مدیریت شبکه",     percentage: 88 },
        { name_en: "System Administration", name_ps: "سیستم اداری",       name_fa: "مدیریت سیستم",    percentage: 85 },
        { name_en: "IT Support",            name_ps: "IT ملاتړ",           name_fa: "پشتیبانی IT",     percentage: 92 },
        { name_en: "Troubleshooting",       name_ps: "د ستونزو حل کول",    name_fa: "عیب‌یابی",        percentage: 90 },
      ],
    },
    { name_en: "Other Skills",    name_ps: "نور مهارتونه",     name_fa: "مهارت‌های دیگر", icon: "⚙", sortOrder: 4,
      skills: [
        { name_en: "Microsoft Office",       name_ps: "مایکروسافت آفیس",   name_fa: "مایکروسافت آفیس",   percentage: 95 },
        { name_en: "Project Management",     name_ps: "پروژه مدیریت",       name_fa: "مدیریت پروژه",      percentage: 78 },
        { name_en: "Technical Documentation",name_ps: "تخنیکي مستندات",    name_fa: "مستندات فنی",       percentage: 82 },
        { name_en: "Tech Consulting",        name_ps: "ټیکنالوژي مشاوري",  name_fa: "مشاوره فناوری",     percentage: 80 },
      ],
    },
  ];

  for (const cat of skillCats) {
    const { skills, ...catData } = cat;
    const created = await prisma.skillCategory.upsert({
      where:  { id: `skill-cat-${cat.sortOrder}` },
      update: {},
      create: { id: `skill-cat-${cat.sortOrder}`, ...catData },
    });
    for (let i = 0; i < skills.length; i++) {
      await prisma.skill.upsert({
        where:  { id: `skill-${cat.sortOrder}-${i}` },
        update: {},
        create: { id: `skill-${cat.sortOrder}-${i}`, ...skills[i], categoryId: created.id, sortOrder: i + 1 },
      });
    }
  }
  console.log("✅ Skills created");

  // ── Experience ────────────────────────────────────────────────────────
  await prisma.experience.upsert({
    where:  { id: "exp-1" },
    update: {},
    create: {
      id:              "exp-1",
      role_en:         "IT & Network Manager",
      role_ps:         "IT او شبکو مدیر",
      role_fa:         "مدیر IT و شبکه",
      organization_en: "Government Organization, Nangarhar",
      organization_ps: "دولتي اداره، ننګرهار",
      organization_fa: "سازمان دولتی، ننگرهار",
      description_en:  "Led IT infrastructure management including network design, server administration, and security protocols. Supervised technical teams, managed hardware procurement, and ensured 99%+ system uptime.",
      description_ps:  "د IT زیربنا مدیریت، د شبکې ډیزاین، سرور اداری او امنیتي پروتوکولونو مشري مو کوله.",
      description_fa:  "مدیریت زیرساخت IT شامل طراحی شبکه، مدیریت سرور و پروتکل‌های امنیتی.",
      technologies:    ["Network Infrastructure", "Windows Server", "Cisco", "IT Security", "Team Leadership"],
      startDate:       new Date("2020-01-01"),
      isCurrent:       true,
      sortOrder:       1,
    },
  });

  await prisma.experience.upsert({
    where:  { id: "exp-2" },
    update: {},
    create: {
      id:              "exp-2",
      role_en:         "Software Developer & Database Administrator",
      role_ps:         "سافټویر ډویلپر او ډیټابیس اډمنسټریټر",
      role_fa:         "توسعه‌دهنده نرم‌افزار و مدیر پایگاه داده",
      organization_en: "Healthcare & Public Sector Projects",
      organization_ps: "روغتیا او دولتي سکتور پروژي",
      organization_fa: "پروژه‌های بهداشت و بخش عمومی",
      description_en:  "Designed and developed the Dental Clinic Management System and the Digital Traffic Permit System. Engineered full database schemas, backend APIs, and reporting dashboards.",
      description_ps:  "د دندان کلینیک مدیریت سیستم او د ډیجیټل ترافیکي جواز سیستم ډیزاین او پراختیا مو وکړه.",
      description_fa:  "طراحی و توسعه سیستم مدیریت کلینیک دندانپزشکی و سیستم مجوز ترافیک دیجیتال.",
      technologies:    ["Java", "C++", "MS SQL Server", "Oracle", "Crystal Reports"],
      startDate:       new Date("2017-06-01"),
      endDate:         new Date("2020-01-01"),
      isCurrent:       false,
      sortOrder:       2,
    },
  });

  await prisma.experience.upsert({
    where:  { id: "exp-3" },
    update: {},
    create: {
      id:              "exp-3",
      role_en:         "Technology Consultant & System Analyst",
      role_ps:         "د ټیکنالوژۍ مشاور او سیستم تحلیلګر",
      role_fa:         "مشاور فناوری و تحلیلگر سیستم",
      organization_en: "Multiple NGOs & Private Sector",
      organization_ps: "ډیری NGO ګانې او خصوصي سکتور",
      organization_fa: "سازمان‌های غیردولتی و بخش خصوصی",
      description_en:  "Provided technology consulting to NGOs and private companies. Developed the Intelligent Transportation System and Super Weapon Inventory System for government clients.",
      description_ps:  "د NGO ګانو او شرکتونو ته د ټیکنالوژۍ مشاوره مو وکړه او د دولتي مراجعینو لپاره سیستمونه مو جوړ کړل.",
      description_fa:  "ارائه مشاوره فناوری به سازمان‌های غیردولتی و شرکت‌های خصوصی.",
      technologies:    ["IT Consulting", "Systems Analysis", "Business Automation", "Project Management"],
      startDate:       new Date("2015-01-01"),
      endDate:         new Date("2017-06-01"),
      isCurrent:       false,
      sortOrder:       3,
    },
  });
  console.log("✅ Experience created");

  // ── Education ─────────────────────────────────────────────────────────
  await prisma.education.upsert({
    where:  { id: "edu-1" },
    update: {},
    create: {
      id:             "edu-1",
      degree_en:      "Bachelor of Computer Science",
      degree_ps:      "د کمپیوتر ساینس لیسانس",
      degree_fa:      "کارشناسی علوم کامپیوتر",
      institution_en: "Nangarhar University",
      institution_ps: "د ننګرهار پوهنتون",
      institution_fa: "دانشگاه ننگرهار",
      fieldOfStudy_en: "IT & Networks",
      fieldOfStudy_ps: "IT او شبکې",
      fieldOfStudy_fa: "IT و شبکه",
      description_en: "Specialized in IT Infrastructure, Networking Protocols, Database Systems, and Software Engineering. Graduated with strong academic performance.",
      description_ps: "د IT زیربنا، د شبکو پروتوکولونو، ډیټابیس سیستمونو، او سافټویر انجینیرۍ کې تخصص.",
      description_fa: "تخصص در زیرساخت IT، پروتکل‌های شبکه، سیستم‌های پایگاه داده و مهندسی نرم‌افزار.",
      location:       "Jalalabad, Nangarhar, Afghanistan",
      startYear:      2011,
      endYear:        2015,
      icon:           "🎓",
      sortOrder:      1,
    },
  });
  console.log("✅ Education created");

  // ── Certifications ────────────────────────────────────────────────────
  const certs = [
    { id: "cert-1", name_en: "Electronic Traffic System Training",  name_ps: "د برقي ترافیک سیستم روزنه",       name_fa: "آموزش سیستم ترافیک الکترونیکی",   issuer_en: "Ministry of Interior",   issuer_ps: "د کورنیو چارو وزارت",     issuer_fa: "وزارت کشور",        icon: "🚦", year: 2019, sortOrder: 1 },
    { id: "cert-2", name_en: "Forestry & Wildlife Protection",       name_ps: "د ځنګلونو او ژوندیو موجوداتو ساتنه", name_fa: "حفاظت از جنگل‌ها و حیات وحش",    issuer_en: "Ministry of Agriculture", issuer_ps: "د کرنې وزارت",          issuer_fa: "وزارت کشاورزی",     icon: "🌲", year: 2018, sortOrder: 2 },
    { id: "cert-3", name_en: "Professional First Aid Certification", name_ps: "مسلکي لومړنۍ مرستې سند",           name_fa: "گواهی‌نامه کمک‌های اولیه حرفه‌ای", issuer_en: "Certified Healthcare Authority", issuer_ps: "روغتیایي ادارې",    issuer_fa: "مرجع بهداشتی",      icon: "🏥", year: 2020, sortOrder: 3 },
    { id: "cert-4", name_en: "OSHA Certification",                   name_ps: "OSHA سند",                          name_fa: "گواهی‌نامه OSHA",                  issuer_en: "Occupational Safety & Health", issuer_ps: "د کار خوندیتوب ادارې", issuer_fa: "ایمنی و بهداشت حرفه‌ای", icon: "⚠️", year: 2021, sortOrder: 4 },
  ];

  for (const cert of certs) {
    await prisma.certification.upsert({
      where:  { id: cert.id },
      update: {},
      create: { ...cert, description_en: undefined, description_ps: undefined, description_fa: undefined },
    });
  }
  console.log("✅ Certifications created");

  // ── Site Settings ─────────────────────────────────────────────────────
  const settings = [
    { key: "seo_default_title",       value: "Wajid Ali Arya | IT Manager & Software Developer",   label: "Default SEO Title",       group: "seo" },
    { key: "seo_default_description", value: "Technology Consultant based in Jalalabad, Afghanistan", label: "Default SEO Description",  group: "seo" },
    { key: "maintenance_mode",        value: "false",                                                label: "Maintenance Mode",         group: "general" },
    { key: "cv_download_tracking",    value: "true",                                                 label: "Track CV Downloads",       group: "analytics" },
  ];

  for (const s of settings) {
    await prisma.siteSettings.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("✅ Site settings created");

  console.log("\n🎉 Seed complete! Login with:", process.env.ADMIN_EMAIL ?? "admin@wajid-arya.com");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
