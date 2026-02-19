<p align="center">
  <img src="https://github.com/Spectrewolf8/DMI-Digital-Media-Integrity-Platform-NextJS-Frontend/raw/main/Banner.jpg" alt="DMI - Deep Media Inspection Platform" width="100%" />
</p>

<h1 align="center">DMI - Deep Media Inspection Platform</h1>

<p align="center">
  <strong>AI-Powered Deepfake and Synthetic Media Detection Platform</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Features-7-6366F1?style=for-the-badge" alt="Features" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js" alt="Next.js 14" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" /></a>
</p>

## Table of Contents

- [About](#about)
- [Related Repositories (Backend)](#related-repositories)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Topics](#topics)
- [License](#license)

## About

**DMI (Digital Media Integrity)** is a comprehensive, AI-powered web platform designed to combat the growing threat of deepfakes and AI-generated synthetic media. The platform provides users with a suite of advanced detection and analysis tools, empowering individuals, journalists, researchers, and organizations to verify the authenticity of digital media content.

Built with a modern, responsive interface, DMI delivers real-time analysis results with detailed confidence scores, visual explanations, and multi-model detection capabilities. The platform also fosters a community-driven approach to media integrity through forums, educational resources, and a public deepfake archive.

## Related Repositories

| Repository                                                                                                                   | Description                                                     |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [DMI-Digital-Media-Integrity-Platform-backend](https://github.com/Spectrewolf8/DMI-Digital-Media-Integrity-Platform-backend) | Backend API server powering the detection and analysis services |

## Features

### Deepfake Detection

Analyze images and videos using advanced deep learning models to identify manipulated or synthetically generated faces. Receive detailed confidence scores and visual overlays highlighting areas of suspected manipulation.

### AI-Generated Content Detection

Detect content produced by AI generators such as DALL-E, Midjourney, Stable Diffusion, and GPT-based models. The system leverages multiple specialized models running simultaneously for comprehensive coverage.

### GradCAM Heatmaps

Visualize model decision-making through Gradient-weighted Class Activation Mapping (GradCAM). Heatmaps highlight the specific regions of an image that influenced the AI model's classification, providing interpretable and transparent results.

### Error Level Analysis (ELA)

Detect image tampering by analyzing JPEG compression error levels. Modified regions of an image exhibit different error patterns compared to the original content, revealing traces of manipulation invisible to the naked eye.

### Metadata Analysis

Perform deep inspection of file metadata (EXIF, XMP, IPTC) to uncover hidden manipulation traces, editing tool signatures, and inconsistencies in creation timestamps or device information.

### Public Deepfake Archive (PDA)

Access a curated, searchable collection of known deepfakes and synthetic media samples. The archive serves as a reference resource for researchers, educators, and professionals working in media verification.

### Community Forum

Participate in discussions, share findings, and collaborate with other users in the community forum. Create threads, search topics, and contribute to the collective knowledge base on digital media integrity.

### Knowledge Base

Browse comprehensive educational articles, guides, and resources about deepfake technology, detection methodologies, and best practices for media verification.

### User Dashboard

Track your detection history, view past analysis results, manage your account, and access previously submitted media through a personalized dashboard with detailed analytics.

### Donations

Support the platform's continued development and help maintain free access to detection tools through secure donation functionality.

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Backend API** running at `http://localhost:8000` (see [Environment Variables](#environment-variables))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Spectrewolf8/DMI-Digital-Media-Integrity-Platform-NextJS-Frontend.git
   cd DMI-Digital-Media-Integrity-Platform-NextJS-Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   NEXT_PUBLIC_SERVER_HOST_URL="http://localhost:8000"
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run ESLint for code quality checks   |

### Environment Variables

| Variable                      | Description            | Default                 |
| ----------------------------- | ---------------------- | ----------------------- |
| `NEXT_PUBLIC_SERVER_HOST_URL` | Backend API server URL | `http://localhost:8000` |

## Project Structure

```
DMI-Digital-Media-Integrity-Platform-NextJS-Frontend/
├── components/                  # Reusable UI components
│   ├── ui/                      # shadcn/ui components (27 components)
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── Layout.tsx               # Main application layout with sidebar
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   └── Toaster.tsx              # Toast notification provider
├── contexts/                    # React context providers
│   ├── UserContext.tsx           # User authentication state
│   └── DetectionHistoryContext.tsx # Detection results history
├── lib/                         # Utility functions
│   └── utils.ts                 # Class merging utilities (cn)
├── pages/                       # Next.js pages (file-based routing)
│   ├── index.tsx                # Landing / home page
│   ├── detect.tsx               # Deepfake detection page
│   ├── aicontentdetection.tsx   # AI content detection page
│   ├── aicontentreport.tsx      # AI content analysis report
│   ├── deepfakereport.tsx       # Deepfake analysis report
│   ├── dashboard.tsx            # User dashboard
│   ├── login.tsx                # User login
│   ├── register.tsx             # User registration
│   ├── forgot-password.tsx      # Password recovery
│   ├── education.tsx            # Educational resources
│   ├── forum/                   # Community forum pages
│   ├── knowledge-base/          # Knowledge base articles
│   ├── pda/                     # Public Deepfake Archive
│   ├── donate/                  # Donation page
│   ├── reset_password/          # Password reset flow
│   └── api/                     # API routes
├── services/                    # API service layer
│   └── detectionService.ts      # Detection API integration
├── styles/                      # Global styles
│   └── globals.css              # Tailwind directives & custom CSS
├── public/                      # Static assets
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.mjs           # PostCSS configuration
└── components.json              # shadcn/ui configuration
```

## Tech Stack

### Core Framework

- **[Next.js 14](https://nextjs.org/)** - React framework with file-based routing (Pages Router)
- **[React 18](https://react.dev/)** - Component-based UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static type checking

### Styling & UI

- **[Tailwind CSS 3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible, composable UI component library
- **[Radix UI](https://www.radix-ui.com/)** - Headless, accessible UI primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animations
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark/light mode theming

### Data & State Management

- **[React Context API](https://react.dev/reference/react/useContext)** - Global state management
- **[Axios](https://axios-http.com/)** - HTTP client for API communication
- **[React Hook Form](https://react-hook-form.com/)** - Performant form handling
- **[Zod](https://zod.dev/)** - Schema validation

### Utilities

- **[js-cookie](https://github.com/js-cookie/js-cookie)** - Cookie management for authentication
- **[react-dropzone](https://react-dropzone.js.org/)** - File upload with drag-and-drop
- **[class-variance-authority](https://cva.style/)** - Component variant management
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Conditional class merging

## Topics

`deepfake-detection` `ai-detection` `media-integrity` `next-js` `react` `typescript` `tailwind-css` `machine-learning` `computer-vision` `image-analysis` `digital-forensics` `error-level-analysis` `gradcam` `media-verification` `synthetic-media` `content-authenticity`

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

<p align="center">
  Built with Next.js and AI-powered detection technology.
</p>
