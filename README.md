# Wajid Ali Arya | IT Manager & Software Developer

A modern, multilingual, dynamic personal portfolio website built to showcase professional experience, technical skills, software projects, education, certifications, and professional journey.

The website is designed as a full-stack portfolio platform rather than a simple static website. Content can be managed dynamically through a secure administration panel, while the public website provides a responsive and optimized experience across desktop, tablet, and mobile devices.

---

## ✨ Features

### 🌐 Multilingual Website

* English
* Pashto
* Dari

* RTL support for Pashto and Dari
* Locale-aware navigation and content
* Multilingual profile, projects, experience, education, certifications, blog, and contact content
* Optional Google Translate integration for additional languages

### 👨‍💼 Professional Portfolio

* Hero section with dynamic background slides
* About Me
* Skills and Technologies
* Work Experience
* Education and Qualifications
* Certifications and Trainings
* Professional Journey
* Software Projects
* Project galleries and screenshots
* Blog
* Contact section
* Responsive navigation and footer
* Dynamic profile information

### 🛠️ Admin Dashboard

A dedicated administration panel allows website content to be managed without modifying source code.

Administrators can manage:

* Profile information
* Hero section
* About section
* Skills and skill categories
* Work experience
* Education
* Certifications
* Projects
* Project categories
* Project galleries
* Blog articles
* Navigation menu
* Website settings
* SEO settings
* Social/share information
* Analytics configuration

### 📁 Project Management

* Create, edit, and delete projects
* Project categories
* Featured projects
* Homepage visibility
* Project ordering
* Project screenshots
* Project galleries
* Technologies used
* Client information
* Project location
* Project dates
* Project detail pages
* SEO metadata
* View tracking
* Related projects

### 🖼️ Media Management

Cloudinary-powered media management for:

* Profile images
* Hero backgrounds
* Project images
* Gallery images
* Education logos
* Experience/company logos
* Other website media

### 📝 Blog

* Multilingual blog content
* Draft, published, and archived states
* Featured posts
* Tags
* Search and filtering
* Pagination
* Related posts
* Reading-time calculation
* Social sharing
* SEO metadata
* Blog view tracking

### 📊 Analytics

The application includes an internal analytics foundation for tracking important public interactions, including:

* Page views
* Project views
* Blog views
* Gallery views
* Other configurable events

Google Analytics can also be configured through the administration panel.

### 🔍 SEO

* Dynamic page metadata
* Per-project SEO metadata
* Per-blog-post SEO metadata
* Open Graph image configuration
* Google Site Verification support
* Semantic page structure
* Localized metadata support

### 🎨 Modern UI

* Responsive design
* Dark and light themes
* RTL-aware layouts
* Premium navigation
* Responsive hero section
* Animated/interactable UI elements
* Image galleries and lightboxes
* Accessible interactive components
* Consistent reusable UI components

---

## 🧱 Technology Stack

| Technology         | Purpose                               |
| ------------------ | ------------------------------------- |
| Next.js 14         | Full-stack React framework            |
| TypeScript         | Type-safe application development     |
| Tailwind CSS       | Styling and responsive UI             |
| PostgreSQL         | Relational database                   |
| Neon               | PostgreSQL hosting                    |
| Prisma ORM         | Database access and schema management |
| NextAuth / Auth.js | Authentication                        |
| Cloudinary         | Image and media management            |
| next-intl          | Internationalization                  |
| Zod                | Validation                            |
| shadcn/ui          | Reusable interface components         |
| Vercel             | Deployment platform                   |

---

## 🏗️ Architecture

The application follows a modern full-stack architecture:

```text
┌──────────────────────────────────────────┐
│              Public Website              │
│                                          │
│  EN / PS / FA + RTL + Responsive UI      │
└───────────────────┬──────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│              Next.js App Router          │
│                                          │
│  Pages • Components • API Routes • SEO   │
└───────────────────┬──────────────────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
┌─────────────────┐   ┌────────────────────┐
│ Admin Dashboard │   │ Public API / Data  │
│                 │   │                    │
│ CMS • RBAC      │   │ Content • Analytics│
└────────┬────────┘   └─────────┬──────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
          ┌─────────────────────┐
          │     Prisma ORM      │
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          │ PostgreSQL / Neon   │
          └─────────────────────┘


              Cloudinary
          ─── Media Storage ───
```

---

## 🔐 Authentication & Security

The administration system uses authenticated access with role-based permissions.

Security considerations include:

* Protected admin routes
* Authenticated administrative operations
* Role-based permissions
* Server-side validation
* Zod request validation
* Prisma ORM for database access
* Environment-based secrets
* Protected media operations
* Controlled administrative API endpoints

All content-modifying operations are served exclusively from the authenticated `/api/v1/admin/*` routes, which verify an authenticated `ADMIN` session before any write. Routes under `/api/v1/*` are public and read-only.

---

## 🌍 Internationalization

The website supports three primary languages:

```text
English  → LTR
Pashto   → RTL
Dari     → RTL
```

The application is designed so that content can be stored and displayed independently for each supported language.

This includes:

* Navigation
* Section titles
* Profile information
* Projects
* Experience
* Education
* Certifications
* Blog content
* Contact interface
* Footer content

---

## 📂 Project Structure

A simplified structure:

```text
portfolio/
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── locales/
│       ├── en.json
│       ├── ps.json
│       └── fa.json
│
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   ├── admin/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── public/
│   │   └── shared/
│   │
│   └── lib/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js 18+
* npm
* PostgreSQL-compatible database
* Cloudinary account for media uploads

### Clone the repository

```bash
git clone https://github.com/wajidarya2012-cyber/wajid-portfolio
cd portfolio
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the template and fill in your own values. See [Environment Variables](#-environment-variables) below for what each one does.

```bash
cp .env.example .env
```

Never commit real credentials or secrets to the repository. `.env` is git-ignored.

### Generate Prisma Client

```bash
npx prisma generate
```

### Synchronize the database

```bash
npx prisma db push
```

### Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

All variables below are read from `.env` locally, and must be configured in the hosting provider's dashboard for production. A complete template with placeholder values is provided in [`.env.example`](.env.example).

### Database (required)

`prisma/schema.prisma` declares both a pooled `url` and an unpooled `directUrl`, so **both** variables must be set.

| Variable       | Required | Purpose |
| -------------- | -------- | ------- |
| `DATABASE_URL` | Yes | Pooled connection (Neon PgBouncer — the `-pooler` host). Used by the application at runtime. |
| `DIRECT_URL`   | Yes | Direct/unpooled connection (same host **without** `-pooler`). Used by Prisma for schema operations such as `prisma db push`. |

> **Deployment note.** `npm run build` runs `prisma generate && next build`. `prisma generate` fails with error **P1012** — *"You must provide a nonempty direct URL"* — if `DIRECT_URL` is missing or empty. Because that is the first command in the build, a missing `DIRECT_URL` fails the deployment before Next.js compiles anything. Set both database variables in **every** environment (on Vercel: Production, Preview and Development).

### Authentication (required)

| Variable          | Required | Purpose |
| ----------------- | -------- | ------- |
| `NEXTAUTH_SECRET` | Yes | Signing secret for JWT sessions. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL`    | Yes | Canonical base URL of the deployment (for example `https://your-domain.com`). |

### Media storage (required for uploads)

| Variable                | Required | Purpose |
| ----------------------- | -------- | ------- |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name. Server-side only. |
| `CLOUDINARY_API_KEY`    | Yes | Cloudinary API key. Server-side only. |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret. Server-side only — never expose to the client. |

### Application

| Variable               | Required | Purpose |
| ---------------------- | -------- | ------- |
| `NEXT_PUBLIC_APP_URL`  | Yes | Public site URL. Used for canonical/Open Graph metadata and share links. Falls back to `http://localhost:3000` when unset, so it must be set in production. |
| `NEXT_PUBLIC_APP_NAME` | No | Display name used in the UI. |

### Initial admin seed (local setup only)

| Variable         | Required | Purpose |
| ---------------- | -------- | ------- |
| `ADMIN_EMAIL`    | No | Email for the admin account created by `npm run db:seed`. |
| `ADMIN_PASSWORD` | No | Password for the seeded admin account. Change it before any real use. |

---

## 🚀 Deployment

The application is designed to work well with modern cloud deployment platforms such as Vercel.

A typical production setup consists of:

```text
GitHub
   │
   ▼
Vercel
   │
   ├── Next.js Application
   │
   ├── Neon PostgreSQL
   │
   └── Cloudinary
```

Before deploying, configure all required production environment variables — see [Environment Variables](#-environment-variables). In particular, confirm that both `DATABASE_URL` and `DIRECT_URL` are present, or the build will fail during `prisma generate`.

---

## 🖥️ Admin Content Management

One of the main goals of this project is to make the portfolio reusable and maintainable.

Instead of hardcoding professional information directly into the website, most content can be managed through the administration panel.

This makes it possible to update:

> Profile → Skills → Experience → Education → Projects → Gallery → Blog → Website Settings

without rebuilding the public interface for every content change.

---

## 📱 Responsive Experience

The website is designed for:

* Desktop
* Laptop
* Tablet
* Mobile devices

Special attention is given to:

* Responsive navigation
* Hero image behavior
* RTL layouts
* Responsive project galleries
* Mobile forms
* Touch-friendly controls
* Adaptive typography and spacing

---

## 🎯 Project Goals

This project was built with several goals in mind:

* Present a professional personal brand
* Showcase technical and professional experience
* Provide a multilingual experience
* Support RTL languages properly
* Make portfolio content fully manageable through an admin panel
* Maintain a scalable architecture
* Provide a strong foundation for future features
* Follow modern full-stack development practices

---

## 📈 Future Improvements

Potential future enhancements include:

* Advanced analytics dashboard
* More detailed visitor insights
* Improved content scheduling
* Additional localization options
* Performance optimization
* Advanced search
* More portfolio presentation layouts
* Enhanced accessibility
* Automated backups and monitoring

---

## 👤 About

**Wajid Ali Arya**
IT Manager & Software Developer

Focused on IT management, software development, databases, networking, systems administration, and building practical technology solutions.

---

## 📄 License

This project is a personal portfolio website.

The source code is provided primarily for demonstration and educational purposes. Portfolio content, personal information, images, branding, and other proprietary assets remain the property of their respective owner.

---

## ⭐ Acknowledgements

Built with modern open-source technologies and tools from the JavaScript/TypeScript ecosystem.

If you find the project useful or interesting, feel free to explore the repository and learn from the implementation.
