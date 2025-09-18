# Healios Wellness E-Commerce Platform

## Overview
This project is a full-stack e-commerce application for Healios, a premium supplement company. Its primary purpose is to provide a modern, accessible, and high-performance online shopping experience, enabling product browsing, shopping cart functionality, secure checkout, and comprehensive product information. The business vision is to establish a robust digital storefront to expand market reach, especially in regions like South Africa, while promoting environmental responsibility.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a monorepo structure, separating client, server, and shared code.

### UI/UX Decisions
- Modern, minimal design aesthetic with clean typography, using a grayscale color palette with black as the primary accent, consistent with the Healios brand.
- Square design aesthetic applied throughout, with all rounded corners removed.
- Dark mode support implemented via `ThemeProvider`.
- Full accessibility compliance (aria-labels, keyboard navigation, focus states).
- Comprehensive component library built with `shadcn/ui` and `Radix UI` primitives.
- Consistent system font stack for typography.
- Responsive design for various devices.

### Technical Implementations
- **Frontend**: React with TypeScript and Vite.
- **Backend**: Express.js server with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Styling**: Tailwind CSS with custom CSS variables.
- **State Management**: React Query for server state; React Context for cart management.
- **Routing**: Wouter for client-side routing.
- **API Structure**: RESTful API.
- **Payment System**: Integrated PayStack checkout for secure payments.
- **Authentication System**: Unified email PIN authentication for both customers and admins using Resend API. Admin access is restricted to whitelisted emails.
- **Google Maps Integration**: Complete South African address handling with Google Places autocomplete functionality using a two-key security setup.
- **Email Integration**: Resend API integration with fully branded Healios email templates for all transactional and marketing communications.
- **Performance Optimization**: Comprehensive caching system for improved API response times.
- **SEO Enhancement**: Automated sitemap.xml generation, robots.txt optimization, and structured data implementation.
- **Image Optimization**: Advanced image compression, WebP conversion, and responsive image generation with Sharp integration.
- **Enterprise Security**: Complete security hardening with database protection, API security, payment fraud detection, real-time monitoring, and comprehensive error handling.

### Feature Specifications
- Product display with detailed information, images, pricing, and nutritional data.
- Shopping cart with item count badge and sidebar design.
- Secure checkout process with order confirmation.
- Newsletter subscription functionality with database storage, validation, and automated confirmation emails.
- Comprehensive wellness quiz for personalized recommendations.
- Customer reviews section with category filtering.
- "Better Together" product bundle recommendations with dynamic pricing.
- Currency localization (e.g., British Pounds to South African Rand).
- Environmental initiative page (`/planet`) detailing sustainability efforts.
- AI-powered chatbot "Juliet" for customer support.
- Professional text formatting across all site sections.
- Product Variant Support with comprehensive SKU management.
- Subscription Product Support with auto-refill functionality using Stripe's native subscription APIs.

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
- Stripe API (for subscription management)
- OpenAI GPT-4o-mini
- Resend API (for email services)
- Google Maps JavaScript API
- Google Address Validation API

### Development Tools
- TypeScript compiler
- ESBuild
- PostCSS
- Drizzle Kit