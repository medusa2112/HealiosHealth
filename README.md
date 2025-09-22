# 🌿 Healios Health E-commerce Platform

A modern, full-stack e-commerce platform for health and wellness products, built with React, Express.js, and TypeScript.

![Healios Health](https://img.shields.io/badge/Healios-Health-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 🚀 Features

### 🛒 E-commerce Core
- **Product Catalog**: Comprehensive health and wellness product listings
- **Shopping Cart**: Advanced cart management with persistent sessions
- **Checkout Flow**: Secure payment processing with Stripe integration
- **Order Management**: Complete order tracking and management system
- **Inventory Management**: Real-time stock tracking and notifications

### 👤 User Management
- **Customer Authentication**: Secure login/registration system
- **User Profiles**: Comprehensive user profile management
- **Admin Panel**: Advanced administrative interface
- **Two-Factor Authentication**: Enhanced security for admin accounts
- **Session Management**: Secure session handling with Redis

### 💳 Payment & Subscriptions
- **Stripe Integration**: Secure payment processing
- **Paystack Support**: Alternative payment gateway
- **Subscription Management**: Recurring payment handling
- **Order Tracking**: Real-time order status updates

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first responsive interface
- **Dark/Light Mode**: Theme switching capability
- **Modern Components**: Built with Radix UI and Tailwind CSS
- **Smooth Animations**: Framer Motion animations
- **Accessibility**: WCAG compliant interface

### 🔧 Developer Features
- **TypeScript**: Full type safety across the stack
- **Hot Reload**: Development server with instant updates
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Documentation**: Comprehensive API endpoints
- **Testing Suite**: Vitest testing framework
- **Security**: CSRF protection, rate limiting, and input validation

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Tanstack Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Web application framework
- **TypeScript** - Server-side type safety
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database
- **Redis** - Session storage and caching
- **Passport.js** - Authentication middleware

### Infrastructure
- **Vite** - Build tool and development server
- **Docker** - Containerization
- **Terraform** - Infrastructure as code
- **Azure** - Cloud hosting platform
- **GitHub Actions** - CI/CD pipeline

### Third-party Services
- **Stripe** - Payment processing
- **Paystack** - Alternative payment gateway
- **Resend** - Email delivery service
- **Google Cloud Storage** - File storage
- **OpenAI** - AI assistant integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)
- **Redis** (optional, for session storage)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/medusa2112/HealiosHealth.git
cd HealiosHealth
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
DATABASE_URL=postgres://username:password@localhost:5432/healios_health
SESSION_SECRET=your-32-character-secret-key-here
SESSION_SECRET_CUSTOMER=your-32-character-customer-secret
SESSION_SECRET_ADMIN=your-32-character-admin-secret
PROD_ORIGINS=https://yourdomain.com
DEV_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
PORT=5000
ADM_PW=your-secure-admin-password
RESEND_FROM_ADDRESS=noreply@yourdomain.com
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAILS=admin@yourdomain.com
PUBLIC_BASE_URL=http://localhost:5000
PAYSTACK_SECRET=your-paystack-secret-key
```

### 4. Database Setup

Create your PostgreSQL database and run migrations:

```bash
# Create database (adjust connection details as needed)
createdb healios_health

# Push database schema
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
HealiosHealth/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── config/         # Configuration files
│   └── public/             # Static assets
├── server/                 # Backend Express application
│   ├── routes/             # API route handlers
│   ├── lib/                # Server utilities
│   ├── middleware/         # Express middleware
│   ├── auth/               # Authentication logic
│   └── jobs/               # Background jobs
├── shared/                 # Shared types and schemas
├── infra/                  # Infrastructure as code
├── migrations/             # Database migrations
├── scripts/                # Utility scripts
├── tests/                  # Test files
└── docs/                   # Documentation
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database

# Code Quality
npm run check        # TypeScript type checking
npm test             # Run test suite
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SESSION_SECRET` | Session encryption key | ✅ |
| `SESSION_SECRET_CUSTOMER` | Customer session key | ✅ |
| `SESSION_SECRET_ADMIN` | Admin session key | ✅ |
| `PORT` | Server port | ✅ |
| `ADM_PW` | Admin password | ✅ |
| `RESEND_API_KEY` | Email service API key | ✅ |
| `RESEND_FROM_ADDRESS` | Email sender address | ✅ |
| `PAYSTACK_SECRET` | Payment gateway secret | ✅ |
| `ADMIN_EMAILS` | Admin email addresses | ✅ |
| `PUBLIC_BASE_URL` | Application base URL | ✅ |
| `PROD_ORIGINS` | Production CORS origins | ⚠️ |
| `DEV_ORIGINS` | Development CORS origins | ⚠️ |
| `ADMIN_IP_ALLOWLIST` | Admin IP restrictions | ❌ |
| `ADMIN_2FA_ENABLED` | Enable 2FA for admins | ❌ |

## 🚀 Deployment

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t healios-health .
```

2. Run the container:
```bash
docker run -p 5000:5000 --env-file .env healios-health
```

### Azure Deployment

The project includes Terraform configurations for Azure deployment:

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run specific test categories:

```bash
npm run test:orders    # Order management tests
npm run test:discounts # Discount system tests
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Order Endpoints
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Cart Endpoints
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and type checking
- Update documentation for API changes

## 🔒 Security

- CSRF protection enabled
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure session management
- Two-factor authentication for admins
- IP allowlisting for admin access

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - Full-stack development
- **Design Team** - UI/UX design
- **DevOps Team** - Infrastructure and deployment

## 📞 Support

For support and questions:

- 📧 Email: support@thehealios.com
- 🐛 Issues: [GitHub Issues](https://github.com/medusa2112/HealiosHealth/issues)
- 📖 Documentation: [Project Wiki](https://github.com/medusa2112/HealiosHealth/wiki)

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] AI-powered product recommendations
- [ ] Social media integration
- [ ] Advanced reporting features

---

**Built with ❤️ by the Healios Health Team**