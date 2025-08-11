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
- **Authentication System**: Comprehensive email verification and password reset system with unified verification interface, 6-digit codes, enterprise security, and WCAG 2.1 AA compliance.

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
- **2025-08-11**: PHASE 10 COMPLETE - Production Blank Page Fix
  - Fixed production deployment blank page issue caused by configuration mismatch
  - Updated production-enforcer.ts to only require SESSION_SECRET instead of separate customer/admin secrets
  - Aligned production-enforcer configuration with production.ts changes from Phase 9
  - Production deployment now works with single SESSION_SECRET for both authentication systems
  - Verified configuration consistency across all production enforcement modules
- **2025-08-11**: PHASE 9 COMPLETE - Deployment Session Secret Configuration Fixed
  - Fixed deployment error related to missing SESSION_SECRET_CUSTOMER and SESSION_SECRET_ADMIN
  - Updated production enforcer to handle missing session secrets gracefully with SESSION_SECRET fallback
  - Enhanced environment configuration to use SESSION_SECRET as fallback for both customer and admin sessions
  - Added comprehensive logging for session secret configuration status (explicit vs fallback)
  - Deployment now only requires SESSION_SECRET (minimum 32 characters) with optional separate secrets for enhanced security
  - Maintains security warning when using single secret for both customer and admin sessions
  - Ensures different secrets validation only when both are explicitly provided
- **2025-08-11**: PHASE 8 COMPLETE - Dual Authentication System Successfully Implemented
  - Separated customer and admin authentication into completely isolated stacks
  - Customer auth uses `/api/auth/customer/*` endpoints with `hh_cust_sess` cookie
  - Admin auth uses `/api/auth/admin/*` endpoints with `hh_admin_sess` cookie  
  - Verified complete isolation: customer sessions cannot access admin endpoints and vice versa
  - Implemented separate CSRF token generation for customer and admin surfaces
  - Created order claim endpoint for linking guest orders to authenticated customers
  - Frontend cutover complete with authClient.ts supporting split authentication paths
- **2025-08-10**: Bug Audit Performed - Identified and fixed 28 TypeScript type errors in server/storage.ts related to null vs undefined handling. Fixed User type missing required fields (emailVerified, verificationCodeHash, etc.) and Product type optional field handling
- **2025-08-10**: Configured production admin credentials - dn@thefourths.com is now the primary admin with password from ADM_PW secret, admin@healios.com configured as backup admin with same credentials
- **2025-08-10**: Fixed critical authentication system - replaced in-memory storage (MemStorage) with database storage (DrizzleStorage) to enable persistent user authentication and proper admin login functionality
- **2025-08-10**: Successfully tested admin login system - both dn@thefourths.com and admin@healios.com can authenticate and access protected admin routes with proper session management
- **2025-08-10**: Fixed critical bug where hero video files weren't being served - added static file serving for client/public directory to properly serve hero-video.webm and hero-video.mp4 files
- **2025-08-10**: Fixed console stringification errors by removing complex object logging that was causing circular reference issues in API request logging
- **2025-08-10**: Fixed TypeScript type errors in server routes - properly typed CartItem imports and fixed orderItems parsing with explicit type casting
- **2025-08-10**: Identified and fixed video loading issues - hero videos now properly served from public directory instead of returning 404 errors
- **2025-08-09**: Enhanced unified verification system (/verify) to handle both email verification and password reset flows with single secure interface
- **2025-08-09**: Added comprehensive password reset functionality with 6-digit verification codes, secure password inputs with validation, and auto-focus for optimal UX
- **2025-08-09**: Implemented enterprise-grade security features: CSRF protection, auto-complete prevention, memory-only credential storage, and WCAG 2.1 AA compliant design
- **2025-08-09**: Updated forgot password flow to redirect directly to unified verification screen with proper type parameter (?type=reset)
- **2025-08-09**: Fixed home page product display issue by switching from `/api/products/featured` to `/api/products` endpoint for category filtering, ensuring all 15 products are available for display
- **2025-08-09**: Updated product images with stunning editorial photography for biotin, collagen, and prenatal products using real uploaded images instead of SVG placeholders
- **2025-08-09**: Applied proper image positioning and cropping techniques to showcase product imagery effectively
- **2025-08-09**: Fixed missing badge for Magnesium Complex product by adding correct product ID mapping for `magnesium-bisglycinate-b6`
- **2025-08-09**: Made products page category filters fully dynamic - pulls categories directly from database products instead of hardcoded list, displays product counts for each category
- **2025-08-09**: Updated Mind & Memory Mushroom product page with authentic Lion's Mane mushroom photography - replaced SVG placeholder with stunning natural mushroom imagery growing on tree trunk
- **2025-08-09**: Added comprehensive Bio Cultures + Vitamin product content section with "THE GUT-HEALTH ADVANTAGE" including probiotic statistics, specialist testimonials, and professional laboratory imagery
- **2025-08-09**: Updated Marine Collagen Powder product with stunning beauty portrait photography showcasing natural skin radiance and collagen benefits
- **2025-08-09**: Created professional chemistry laboratory image for Ashwagandha product featuring scientific equipment, beakers, and authentic ashwagandha root in natural lighting
- **2025-08-09**: Updated Marine Collagen Powder product with professional beauty portrait showcasing radiant skin and collagen benefits - clean, minimalist studio photography highlighting natural beauty and skin health
- **2025-08-09**: Updated Collagen Complex product with sophisticated collagen fiber texture pattern - abstract microscopic detail showing the natural structure and quality of collagen fibers
- **2025-08-09**: Created professional lifestyle photography for Iron + Vitamin C product featuring diverse active individuals during golden hour exercise - perfectly captures the target audience of athletes, women, and older adults who benefit from gentle iron supplementation
- **2025-08-09**: Updated KSM-66 Ashwagandha product with authentic laboratory photography showing professional biochemist performing quality testing - reinforces the scientific credibility and research-backed nature of the premium ingredient
- **2025-08-09**: Completely removed Sleep Benefits section from all product pages to maintain clean design
- **2025-08-09**: Updated Magnesium product with peaceful sleep photography showing woman resting naturally - authentic lifestyle image that perfectly represents the restful sleep benefits of magnesium supplementation
- **2025-08-09**: Added comprehensive content and peaceful sleep imagery for Magnesium Complex Capsules (magnesium-bisglycinate-b6) product - includes statistics, testimonials, and product-specific information about chelated magnesium with vitamin B6
- **2025-08-09**: Updated Probiotic + Vitamins product with professional tailor fitting image horizontally flipped - showcases personalized wellness care and attention to detail that mirrors the individualized approach of probiotics and vitamins
- **2025-08-09**: Updated Probiotics product with gut health imagery showing hands forming heart over abdomen - perfectly represents digestive wellness, gut care, and the loving attention to intestinal health that probiotics provide
- **2025-08-09**: Updated Vitamin D3 product with sunny outdoor lifestyle photography showing woman reaching toward bright sun - perfectly captures vitamin D synthesis from natural sunlight exposure and the energizing benefits of optimal vitamin D levels

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