# Wild Nutrition E-commerce Application

## Overview

This is a full-stack e-commerce application for Wild Nutrition, a premium supplement company. The application is built with a React frontend using TypeScript and Vite, an Express.js backend, and uses Drizzle ORM with PostgreSQL for data persistence. The application features a modern design system built with shadcn/ui components and Tailwind CSS, including dark mode support and full accessibility compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

✓ Updated homepage to match current Wild Nutrition design aesthetic
✓ Implemented dark/light mode toggle with ThemeProvider
✓ Added accessibility features (aria-labels, keyboard navigation, focus states)
✓ Modernized hero section with rating display, category pills, and press mentions
✓ Updated product cards to match Wild Nutrition's style with pricing, badges, and reviews
✓ Revised "Why It Works" section to focus on Food-Grown® messaging
✓ Enhanced footer with dark mode support and improved accessibility
✓ Updated to modern minimal design aesthetic with cleaner typography
✓ Implemented minimal product cards with better spacing and visual hierarchy
✓ Simplified color palette focusing on grayscale with accent colors
✓ Updated header navigation to minimal design principles
✓ Recreated Wild Nutrition hero section with full-screen background image
✓ Updated bestsellers section to match Wild Nutrition product grid design
✓ Added category pills, product badges, and authentic product layout
✓ Added pregnancy & new mother section with image grid and CTA
✓ Updated navbar to solid black background with white text/icons
✓ Replaced logo with Healios branding (logo-only, no text)
✓ Replaced hero background image with compressed video (MP4/WebM formats)
✓ Optimized video for instant loading and auto-play
✓ Added "The Food-Grown® Difference" section with statistics and scientific messaging
✓ Added expert consultation section with nutritionist image and booking CTAs
✓ Added customer reviews section with testimonials and 300K+ customer social proof
✓ Added newsletter signup section with "Join our Wild community" form
✓ Added comprehensive footer with navigation links and company information
✓ Updated color palette to Healios brand colors with black as primary
✓ Added gradient utilities and brand color system from Healios design
✓ Implemented full dropdown navigation system styled like Wild Nutrition
✓ Created comprehensive shop and learn dropdown menus with Healios-relevant pages
✓ Added hover animations and smooth transitions to navigation dropdowns
✓ Centered Healios logo with left/right navigation layout like Wild Nutrition
✓ Expanded Learn dropdown with 6 comprehensive sections: About Healios, The Science, For Practitioners, Women's Health Hubs, Healios Journal, and Healios Sessions Podcast
✓ Added featured content cards with images in dropdown footers matching Wild Nutrition style
✓ Organized navigation into professional 6-column grid layout for Learn section
✓ Implemented scroll-based header shrinking with smooth transitions
✓ Header reduces padding, logo size, text size, and icon sizes when user scrolls down
✓ Added scroll event listener with 50px threshold for optimal user experience
✓ Removed all rounded corners from buttons, form elements, images, and UI components
✓ Implemented consistent square design aesthetic throughout the application
✓ Updated product cards, images, form inputs, checkboxes, and indicator elements
✓ Applied square styling to navigation dropdown cards and all interactive elements

## Advanced SEO Implementation (January 2025)

✓ Comprehensive meta tags with Open Graph and Twitter Cards
✓ Structured data (Schema.org) for Organization, FAQPage, Products, and Breadcrumbs
✓ SEO-optimized content sections targeting supplement keywords
✓ XML sitemap with product and category pages
✓ Robots.txt configured for optimal crawling
✓ Dynamic SEOHead component for per-page optimization
✓ FAQ section with AEO (Answer Engine Optimization)
✓ Breadcrumb navigation with structured data
✓ PWA manifest for mobile optimization
✓ Performance optimizations with preconnect and DNS prefetch

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state, React Context for cart management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Library**: Built on shadcn/ui with Radix UI primitives for accessibility
- **State Management**: 
  - React Query for API data fetching and caching
  - Custom React Context for shopping cart state
- **Routing**: File-based routing using Wouter
- **Styling**: Tailwind CSS with custom CSS variables for consistent theming

### Backend Architecture
- **API Structure**: RESTful API with Express.js
- **Data Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **In-Memory Storage**: Fallback storage implementation for development/testing
- **Middleware**: Request logging, JSON parsing, and error handling

### Database Schema
The application uses two main entities:
- **Products**: Core product information including pricing, descriptions, categories, and inventory
- **Newsletter Subscriptions**: Email subscriptions for marketing

### UI Components
- Comprehensive component library based on shadcn/ui
- Accessible components using Radix UI primitives
- Consistent design system with custom theming
- Mobile-responsive design patterns

## Data Flow

1. **Product Display**: Frontend fetches product data via React Query from REST endpoints
2. **Shopping Cart**: Local state management with persistent cart functionality
3. **Newsletter**: Form submissions processed through API endpoints
4. **Database Operations**: All data persistence handled through Drizzle ORM with type safety

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM)
- Vite for build tooling and development server
- React Query for server state management
- Wouter for routing
- Radix UI for accessible component primitives
- Tailwind CSS for styling
- TypeScript for type safety

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database operations
- @neondatabase/serverless for PostgreSQL connection
- Zod for runtime type validation
- Various utility libraries for development

### Development Tools
- TypeScript compiler for type checking
- ESBuild for server-side bundling
- PostCSS for CSS processing
- Drizzle Kit for database migrations

## Deployment Strategy

The application is configured for deployment with:

- **Build Process**: Vite builds the frontend to `dist/public`, ESBuild bundles the server to `dist/`
- **Environment Variables**: Database connection via `DATABASE_URL`
- **Database Migrations**: Managed through Drizzle Kit with schema in `shared/schema.ts`
- **Static Assets**: Served through Express in production
- **Development**: Hot reload via Vite dev server with Express API proxy

The architecture supports both development and production environments, with the server conditionally setting up Vite middleware in development mode for hot reloading while serving static files in production.