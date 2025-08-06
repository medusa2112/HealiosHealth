import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adapted for Healios project structure (Vite + Express)
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'RESEND_API_KEY', 'OPENAI_API_KEY'];
const REQUIRED_PACKAGES = [
  'react', 'vite', 'tailwindcss', 'drizzle-orm', 'express', 
  '@stripe/stripe-js', 'stripe', 'resend', 'openai', '@tanstack/react-query'
];
const REQUIRED_DIRECTORIES = ['client/src', 'server', 'shared', 'client/src/components', 'client/src/pages'];
const SECURE_HEADERS = ['helmet', 'express-rate-limit', 'secureHeaders'];

function checkSecretsManager() {
  console.log('🔐 Checking secrets manager usage...');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const contents = fs.readFileSync(envPath, 'utf8');
    const hardcoded = REQUIRED_ENV_VARS.filter(key => contents.includes(`${key}=`));
    if (hardcoded.length > 0) {
      console.warn('⚠️  Found secrets in .env file:', hardcoded);
    } else {
      console.log('✅ Secrets manager enforced.');
    }
  } else {
    console.log('✅ No .env file found. Secrets handled via Replit secrets manager.');
  }
}

function checkRequiredPackages() {
  console.log('\n📦 Checking required dependencies...');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = REQUIRED_PACKAGES.filter(p => !deps[p]);
  if (missing.length > 0) {
    console.warn('⚠️  Missing important packages:', missing);
  } else {
    console.log('✅ All required packages are present.');
  }
}

function checkProjectStructure() {
  console.log('\n🧱 Checking project structure...');
  const missingDirs = REQUIRED_DIRECTORIES.filter(dir => !fs.existsSync(dir));
  if (missingDirs.length > 0) {
    console.warn('⚠️  Missing directories:', missingDirs);
  } else {
    console.log('✅ Core project structure is intact.');
  }
}

function checkSecurityHeaders() {
  console.log('\n🛡️ Checking security implementation...');
  const authPath = path.join(process.cwd(), 'server', 'lib', 'auth.ts');
  const sessionAuthPath = path.join(process.cwd(), 'server', 'lib', 'session-auth.ts');
  
  let securityFound = false;
  
  if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    if (content.includes('protectRoute') || content.includes('requireAuth')) {
      securityFound = true;
    }
  }
  
  if (fs.existsSync(sessionAuthPath)) {
    const content = fs.readFileSync(sessionAuthPath, 'utf8');
    if (content.includes('secureHeaders') || content.includes('rateLimit')) {
      securityFound = true;
    }
  }

  if (securityFound) {
    console.log('✅ Security middleware implementation found.');
  } else {
    console.warn('⚠️  Security middleware may be missing.');
  }
}

function checkRBACImplementation() {
  console.log('\n🧑‍⚖️ Checking for RBAC roles...');
  const authPath = path.join(process.cwd(), 'server', 'lib', 'auth.ts');
  const schemaPath = path.join(process.cwd(), 'shared', 'schema.ts');
  
  let rbacFound = false;
  
  if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    if (content.includes('admin') && content.includes('customer') && content.includes('role')) {
      rbacFound = true;
    }
  }
  
  if (fs.existsSync(schemaPath)) {
    const content = fs.readFileSync(schemaPath, 'utf8');
    if (content.includes('role') && content.includes('admin')) {
      rbacFound = true;
    }
  }

  if (rbacFound) {
    console.log('✅ RBAC implementation detected.');
  } else {
    console.warn('⚠️  No RBAC-related logic found.');
  }
}

function checkAPISecurityPatterns() {
  console.log('\n🔒 Checking API security patterns...');
  const routesPath = path.join(process.cwd(), 'server', 'routes');
  
  if (!fs.existsSync(routesPath)) {
    console.warn('⚠️  No routes directory found.');
    return;
  }

  const routeFiles = fs.readdirSync(routesPath, { recursive: true })
    .filter(file => file.endsWith('.ts'));
  
  let protectedRoutes = 0;
  let totalRoutes = 0;

  routeFiles.forEach(file => {
    const fullPath = path.join(routesPath, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes('router.')) {
      totalRoutes++;
      if (content.includes('requireAuth') || content.includes('protectRoute')) {
        protectedRoutes++;
      }
    }
  });

  if (protectedRoutes > 0) {
    console.log(`✅ API route protection found (${protectedRoutes}/${totalRoutes} files with auth)`);
  } else {
    console.warn('⚠️  No API route protection detected.');
  }
}

function checkStripeWebhookSecurity() {
  console.log('\n💳 Checking Stripe webhook security...');
  const stripePath = path.join(process.cwd(), 'server', 'routes', 'stripe.ts');
  
  if (fs.existsSync(stripePath)) {
    const content = fs.readFileSync(stripePath, 'utf8');
    if (content.includes('STRIPE_WEBHOOK_SECRET') && content.includes('constructEvent')) {
      console.log('✅ Stripe webhook signature verification implemented.');
    } else {
      console.warn('⚠️  Stripe webhook security may be incomplete.');
    }
  } else {
    console.warn('⚠️  Stripe routes not found.');
  }
}

function checkDatabaseSecurity() {
  console.log('\n🗄️ Checking database security...');
  const schemaPath = path.join(process.cwd(), 'shared', 'schema.ts');
  const dbPath = path.join(process.cwd(), 'server', 'db.ts');
  
  if (fs.existsSync(schemaPath) && fs.existsSync(dbPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    
    if (schemaContent.includes('drizzle') && dbContent.includes('DATABASE_URL')) {
      console.log('✅ Database ORM and connection security implemented.');
    } else {
      console.warn('⚠️  Database security patterns may be incomplete.');
    }
  } else {
    console.warn('⚠️  Database configuration files not found.');
  }
}

function runAudit() {
  console.log('🔍 Running Healios Vibe Compliance Audit...\n');
  console.log('🏥 Adapted for Healios E-commerce Platform');
  console.log('📋 Vite + Express + PostgreSQL + Stripe Stack\n');
  
  checkSecretsManager();
  checkRequiredPackages();
  checkProjectStructure();
  checkSecurityHeaders();
  checkRBACImplementation();
  checkAPISecurityPatterns();
  checkStripeWebhookSecurity();
  checkDatabaseSecurity();
  
  console.log('\n✅ Healios Vibe Audit complete.\n');
  console.log('🚀 Review any warnings before deployment');
}

runAudit();