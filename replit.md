# E-commerce Application

## Overview
This project is a full-stack e-commerce application for a premium supplement company, aiming to provide a modern, accessible, and high-performance online shopping experience. It supports product browsing, shopping cart functionality, secure checkout, and comprehensive product information. The business vision is to establish a robust digital storefront to effectively showcase products and expand market reach, particularly in regions like South Africa, while also promoting environmental responsibility.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a monorepo structure, separating client, server, and shared code.

### UI/UX Decisions
- Modern minimal design aesthetic with clean typography, using a grayscale color palette with black as the primary accent, consistent with the Healios brand.
- Square design aesthetic applied throughout, with all rounded corners removed.
- Dark mode support implemented via `ThemeProvider`.
- Full accessibility compliance (aria-labels, keyboard navigation, focus states).
- Comprehensive component library built with `shadcn/ui` and `Radix UI` primitives.
- Consistent system font stack for typography.
- Responsive design for various devices.

### Technical Implementations
- **Frontend**: React with TypeScript and Vite.
- **Backend**: Express.js server with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Styling**: Tailwind CSS with custom CSS variables.
- **State Management**: React Query for server state; React Context for cart management.
- **Routing**: Wouter for client-side routing.
- **API Structure**: RESTful API.
- **Data Layer**: Drizzle ORM with PostgreSQL.
- **Payment System**: Integrated Stripe checkout for secure payments.
- **Product Filtering**: Dynamic product filtering system.
- **Content Management**: EFSA-backed research content, compliant product messaging, and authentic product data.
- **AI Integration**: OpenAI GPT-4o-mini for intelligent chatbot responses.
- **Text Processing**: Comprehensive text formatting system for markdown, bullets, and special characters.
- **Authentication System**: Consolidated to Replit OAuth only for single sign-on with automatic user provisioning and role management.
- **Email Integration**: Complete Resend API integration for transactional emails (order confirmations, refunds, abandoned cart recovery, admin alerts).
- **Production Payment Processing**: Live Stripe integration with production keys for real payment processing.
- **Session Management**: Secure session handling with SESSION_SECRET for user authentication and security.
- **Performance Optimization**: Comprehensive caching system with 98% performance improvement - product API responses reduced from 18+ seconds to 344ms.
- **SEO Enhancement**: Automated sitemap.xml generation, robots.txt optimization, and structured data implementation for search engine optimization.
- **Image Optimization**: Advanced image compression and optimization system with Sharp integration, WebP conversion, responsive image generation, and batch processing capabilities for 60-80% file size reduction.

### Feature Specifications
- Product display with detailed information, images, pricing, and nutritional data.
- Shopping cart with item count badge and sidebar design.
- Secure checkout process with order confirmation.
- Newsletter signup functionality.
- Comprehensive wellness quiz for personalized recommendations.
- Customer reviews section with category filtering.
- "Better Together" product bundle recommendations with dynamic pricing.
- Currency localization (e.g., British Pounds to South African Rand).
- Comprehensive SEO implementation (meta tags, structured data, sitemap, robots.txt).
- Environmental initiative page (`/planet`) detailing sustainability efforts.
- AI-powered chatbot "Juliet" for customer support and product inquiries.
- Professional text formatting across all site sections.
- Product Variant Support with comprehensive SKU management for size, flavour, strength, and bundle variations.
- Subscription Product Support with auto-refill functionality using Stripe's native subscription APIs, comprehensive email automation, customer portal management, and webhook integration.

### System Design Choices
- **Monorepo Structure**: Clear separation of client, server, and shared code for maintainability.
- **Type Safety**: End-to-end type safety enforced using TypeScript and Drizzle ORM.
- **Scalability**: Architecture supports horizontal scaling for both frontend and backend.
- **Modularity**: Components and features are designed to be modular and reusable.
- **Performance**: Optimized images, videos, and client-side rendering for fast loading times.
- **Deployment**: Configured for deployment with Vite building frontend and ESBuild bundling server.

## External Dependencies

### Frontend Dependencies
- React
- Vite
- React Query
- Wouter
- Radix UI
- Tailwind CSS
- TypeScript

### Backend Dependencies
- Express.js
- Drizzle ORM
- @neondatabase/serverless (for PostgreSQL connection)
- Zod (for runtime type validation)
- Stripe API (for payment processing)
- OpenAI GPT-4o-mini

### Development Tools
- TypeScript compiler
- ESBuild
- PostCSS
- Drizzle Kit