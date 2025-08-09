# E-commerce Application

## Overview
This project is a full-stack e-commerce application for a premium supplement company. It aims to provide a modern, accessible, and high-performance online shopping experience. Key capabilities include product browsing, shopping cart functionality, secure checkout, and comprehensive product information. The business vision is to establish a robust digital storefront that effectively showcases the product range, emphasizing quality nutrition products, while expanding market reach in regions like South Africa. The project also focuses on environmental responsibility through sustainability initiatives.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a monorepo structure, separating client, server, and shared code.

### UI/UX Decisions
- Modern minimal design aesthetic with clean typography.
- Color palette focused on grayscale with accent colors, adopting Healios brand colors (black as primary).
- All rounded corners removed; consistent square design aesthetic applied throughout.
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
- **Product Filtering**: Dynamic product filtering system with loading effects.
- **Content Management**: EFSA-backed research content, compliant product messaging, and authentic product data.
- **AI Integration**: OpenAI GPT-4o-mini for intelligent chatbot responses and customer support.
- **Text Processing**: Comprehensive text formatting system to ensure clean display of markdown, bullets, and special characters.

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
- Professional text formatting across all site sections (chat, product descriptions, articles).
- **Phase 14 Complete**: Product Variant Support with comprehensive SKU management for size, flavour, strength, and bundle variations.
- **Phase 18 Complete**: Subscription Product Support with auto-refill functionality using Stripe's native subscription APIs, comprehensive email automation, customer portal management, and webhook integration.

### System Design Choices
- **Monorepo Structure**: Clear separation of client, server, and shared code for maintainability.
- **Type Safety**: End-to-end type safety enforced using TypeScript and Drizzle ORM.
- **Scalability**: Architecture supports horizontal scaling for both frontend and backend.
- **Modularity**: Components and features are designed to be modular and reusable.
- **Performance**: Optimized images, videos, and client-side rendering for fast loading times.
- **Deployment**: Configured for deployment with Vite building frontend and ESBuild bundling server.

## Recent Updates
- **2025-08-09**: Fixed home page product display issue by switching from `/api/products/featured` to `/api/products` endpoint for category filtering, ensuring all 15 products are available for display
- **2025-08-09**: Updated product images with stunning editorial photography for biotin, collagen, and prenatal products using real uploaded images instead of SVG placeholders
- **2025-08-09**: Applied proper image positioning and cropping techniques to showcase product imagery effectively
- **2025-08-09**: Fixed missing badge for Magnesium Complex product by adding correct product ID mapping for `magnesium-bisglycinate-b6`
- **2025-08-09**: Made products page category filters fully dynamic - pulls categories directly from database products instead of hardcoded list, displays product counts for each category
- **2025-08-09**: Updated Mind & Memory Mushroom product page with authentic Lion's Mane mushroom photography - replaced SVG placeholder with stunning natural mushroom imagery growing on tree trunk
- **2025-08-09**: Added comprehensive Bio Cultures + Vitamin product content section with "THE GUT-HEALTH ADVANTAGE" including probiotic statistics, specialist testimonials, and professional laboratory imagery

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

### Development Tools
- TypeScript compiler
- ESBuild
- PostCSS
- Drizzle Kit