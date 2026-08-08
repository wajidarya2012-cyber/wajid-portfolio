Wajid Ali Arya | IT Manager \& Software Developer



A modern, multilingual, dynamic personal portfolio website built to showcase professional experience, technical skills, software projects, education, certifications, and professional journey.



The website is designed as a full-stack portfolio platform rather than a simple static website. Content can be managed dynamically through a secure administration panel, while the public website provides a responsive and optimized experience across desktop, tablet, and mobile devices.



&#x20;✨ Features



&#x20;🌐 Multilingual Website



\* English

\* پښتو (Pashto)

\* دری (Dari)

\* RTL support for Pashto and Dari

\* Locale-aware navigation and content

\* Multilingual profile, projects, experience, education, certifications, blog, and contact content

\* Optional Google Translate integration for additional languages



👨‍💼 Professional Portfolio



\* Hero section with dynamic background slides

\* About Me

\* Skills \& Technologies

\* Work Experience

\* Education \& Qualifications

\* Certifications \& Trainings

\* Professional Journey

\* Software Projects

\* Project galleries and screenshots

\* Blog

\* Contact section

\* Responsive navigation and footer

\* Dynamic profile information



🛠️ Admin Dashboard



A dedicated administration panel allows website content to be managed without modifying source code.



Administrators can manage:



\* Profile information

\* Hero section

\* About section

\* Skills and skill categories

\* Work experience

\* Education

\* Certifications

\* Projects

\* Project categories

\* Project galleries

\* Blog articles

\* Navigation menu

\* Website settings

\* SEO settings

\* Social/share information

\* Analytics configuration



📁 Project Management



\* Create, edit, and delete projects

\* Project categories

\* Featured projects

\* Homepage visibility

\* Project ordering

\* Project screenshots

\* Project galleries

\* Technologies used

\* Client information

\* Project location

\* Project dates

\* Project detail pages

\* SEO metadata

\* View tracking

\* Related projects



🖼️ Media Management



Cloudinary-powered media management for:



\* Profile images

\* Hero backgrounds

\* Project images

\* Gallery images

\* Education logos

\* Experience/company logos

\* Other website media



📝 Blog



\* Multilingual blog content

\* Draft, published, and archived states

\* Featured posts

\* Tags

\* Search and filtering

\* Pagination

\* Related posts

\* Reading-time calculation

\* Social sharing

\* SEO metadata

\* Blog view tracking



📊 Analytics



The application includes an internal analytics foundation for tracking important public interactions, including:



\* Page views

\* Project views

\* Blog views

\* Gallery views

\* Other configurable events



Google Analytics can also be configured through the administration panel.



🔍 SEO



\* Dynamic page metadata

\* Per-project SEO metadata

\* Per-blog-post SEO metadata

\* Open Graph image configuration

\* Google Site Verification support

\* Semantic page structure

\* Localized metadata support



🎨 Modern UI



\* Responsive design

\* Dark and light themes

\* RTL-aware layouts

\* Premium navigation

\* Responsive hero section

\* Animated/interactable UI elements

\* Image galleries and lightboxes

\* Accessible interactive components

\* Consistent reusable UI components



\---



🧱 Technology Stack



| Technology             | Purpose                               |

| ---------------------- | ------------------------------------- |

| Next.js 14             | Full-stack React framework            |

| TypeScript             | Type-safe application development     |

| Tailwind CSS           | Styling and responsive UI             |

| PostgreSQL             | Relational database                   |

| Neon                   | PostgreSQL hosting                    |

| Prisma ORM             | Database access and schema management |

| NextAuth / Auth.js     | Authentication                        |

| Cloudinary             | Image and media management            |

| next-intl              | Internationalization                  |

| Zod                    | Validation                            |

| shadcn/ui              | Reusable interface components         |

| Vercel                 | Deployment platform                   |



\---



🏗️ Architecture



The application follows a modern full-stack architecture:



```text

┌──────────────────────────────────────────┐

│              Public Website              │

│                                          │

│  EN / PS / FA + RTL + Responsive UI      │

└───────────────────┬──────────────────────┘

&#x20;                   │

&#x20;                   ▼

┌──────────────────────────────────────────┐

│              Next.js App Router          │

│                                          │

│  Pages • Components • API Routes • SEO   │

└───────────────────┬──────────────────────┘

&#x20;                   │

&#x20;         ┌─────────┴─────────┐

&#x20;         ▼                   ▼

┌─────────────────┐   ┌────────────────────┐

│ Admin Dashboard │   │ Public API / Data  │

│                 │   │                    │

│ CMS • RBAC      │   │ Content • Analytics│

└────────┬────────┘   └─────────┬──────────┘

&#x20;        │                      │

&#x20;        └──────────┬───────────┘

&#x20;                   ▼

&#x20;         ┌─────────────────────┐

&#x20;         │     Prisma ORM      │

&#x20;         └──────────┬──────────┘

&#x20;                    ▼

&#x20;         ┌─────────────────────┐

&#x20;         │ PostgreSQL / Neon   │

&#x20;         └─────────────────────┘



&#x20;             Cloudinary

&#x20;         ─── Media Storage ───

```



\---



🔐 Authentication \& Security



The administration system uses authenticated access with role-based permissions.



Security considerations include:



\* Protected admin routes

\* Authenticated administrative operations

\* Role-based permissions

\* Server-side validation

\* Zod request validation

\* Prisma ORM for database access

\* Environment-based secrets

\* Protected media operations

\* Controlled administrative API endpoints



\---



🌍 Internationalization



The website supports three primary languages:



```text

English  → LTR

Pashto   → RTL

Dari     → RTL

```



The application is designed so that content can be stored and displayed independently for each supported language.



This includes:



\* Navigation

\* Section titles

\* Profile information

\* Projects

\* Experience

\* Education

\* Certifications

\* Blog content

\* Contact interface

\* Footer content



\---



📂 Project Structure



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

│   │   ├── \[locale]/

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



\---



⚙️ Getting Started



Prerequisites



Make sure you have installed:



\* Node.js 18+

\* npm

\* PostgreSQL-compatible database

\* Cloudinary account for media uploads



Clone the repository



```bash

git clone https://github.com/wajidarya2012-cyber/wajid-portfolio

cd portfolio

```



Install dependencies



```bash

npm install

```



Configure environment variables



Create a `.env` file based on the environment variables required by the project.



Typical configuration includes:



```env

DATABASE\_URL=

DIRECT\_URL=



AUTH\_SECRET=



CLOUDINARY\_CLOUD\_NAME=

CLOUDINARY\_API\_KEY=

CLOUDINARY\_API\_SECRET=



NEXT\_PUBLIC\_CLOUDINARY\_CLOUD\_NAME=

```



Never commit real credentials or secrets to the repository.



Generate Prisma Client



```bash

npx prisma generate

```



Synchronize the database



```bash

npx prisma db push

```



Start development server



```bash

npm run dev

```



Open:



```text

http://localhost:3000

```



\---



🚀 Deployment



The application is designed to work well with modern cloud deployment platforms such as Vercel.



A typical production setup consists of:



```text

GitHub

&#x20;  │

&#x20;  ▼

Vercel

&#x20;  │

&#x20;  ├── Next.js Application

&#x20;  │

&#x20;  ├── Neon PostgreSQL

&#x20;  │

&#x20;  └── Cloudinary

```



Before deploying, configure all required production environment variables.



\---



🖥️ Admin Content Management



One of the main goals of this project is to make the portfolio reusable and maintainable.



Instead of hardcoding professional information directly into the website, most content can be managed through the administration panel.



This makes it possible to update:



> Profile → Skills → Experience → Education → Projects → Gallery → Blog → Website Settings



without rebuilding the public interface for every content change.



\---



📱 Responsive Experience



The website is designed for:



\* Desktop

\* Laptop

\* Tablet

\* Mobile devices



Special attention is given to:



\* Responsive navigation

\* Hero image behavior

\* RTL layouts

\* Responsive project galleries

\* Mobile forms

\* Touch-friendly controls

\* Adaptive typography and spacing



\---



🎯 Project Goals



This project was built with several goals in mind:



\* Present a professional personal brand

\* Showcase technical and professional experience

\* Provide a multilingual experience

\* Support RTL languages properly

\* Make portfolio content fully manageable through an admin panel

\* Maintain a scalable architecture

\* Provide a strong foundation for future features

\* Follow modern full-stack development practices



\---



📈 Future Improvements



Potential future enhancements include:



\* Advanced analytics dashboard

\* More detailed visitor insights

\* Improved content scheduling

\* Additional localization options

\* Performance optimization

\* Advanced search

\* More portfolio presentation layouts

\* Enhanced accessibility

\* Automated backups and monitoring







👤 About



Wajid Ali Arya

IT Manager \& Software Developer



Focused on IT management, software development, databases, networking, systems administration, and building practical technology solutions.



\---



&#x20;📄 License



This project is a personal portfolio website.



The source code is provided primarily for demonstration and educational purposes. Portfolio content, personal information, images, branding, and other proprietary assets remain the property of their respective owner.



\---



⭐ Acknowledgements



Built with modern open-source technologies and tools from the JavaScript/TypeScript ecosystem.



If you find the project useful or interesting, feel free to explore the repository and learn from the implementation.



