import { Scale, Shield, AlertTriangle, FileText } from "lucide-react";

export function Terms() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using our services or purchasing our products.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Agreement */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Scale className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agreement to Terms</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              By accessing and using the Healios website and services, you agree to be bound by these Terms and Conditions ("Terms"). 
              These Terms apply to all visitors, users, and others who access or use our service.
            </p>
            <p>
              If you disagree with any part of these terms, then you may not access our service.
            </p>
          </div>
        </section>

        {/* Use of Service */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Use of Our Service</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>You may use our service for lawful purposes only. You agree not to use the service:</p>
            <ul>
              <li>In any way that violates applicable laws or regulations</li>
              <li>To harm, abuse, harass, or threaten others</li>
              <li>To impersonate or attempt to impersonate Healios, employees, or other users</li>
              <li>To engage in unauthorized commercial activities</li>
              <li>To interfere with or disrupt the service or servers</li>
            </ul>
          </div>
        </section>

        {/* Products and Orders */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products and Orders</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h3>Product Information</h3>
            <p>
              We make every effort to provide accurate product descriptions, prices, and availability. 
              However, we do not warrant that product descriptions are complete, reliable, current, or error-free.
            </p>
            
            <h3>Pricing and Payment</h3>
            <p>
              All prices are listed in South African Rand (ZAR) and include applicable taxes. 
              Prices are subject to change without notice.
            </p>
            
            <h3>Order Acceptance</h3>
            <p>
              Your order constitutes an offer to purchase products. We reserve the right to accept or decline 
              your order for any reason, including product availability, errors in pricing, or other issues.
            </p>
          </div>
        </section>

        {/* Health and Safety */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Health and Safety Disclaimer</h2>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0" />
              <div className="text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-2">Important Health Information</p>
                <p>
                  Our products are dietary supplements and are not intended to diagnose, treat, cure, or prevent any disease. 
                  Always consult your healthcare provider before starting any new supplement regimen.
                </p>
              </div>
            </div>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              By purchasing our products, you acknowledge that:
            </p>
            <ul>
              <li>You have read and understood all product information and warnings</li>
              <li>You are responsible for consulting healthcare professionals as needed</li>
              <li>Healios is not liable for adverse reactions or interactions</li>
              <li>Individual results may vary</li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Intellectual Property</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              The service and its original content, features, and functionality are owned by Healios and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, 
              republish, download, store, or transmit any of our content without explicit written permission.
            </p>
          </div>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Accounts</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              When creating an account, you must provide accurate and complete information. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of unauthorized access</li>
              <li>Keeping your account information updated</li>
            </ul>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Limitation of Liability</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              In no event shall Healios, its directors, employees, or agents be liable for any indirect, incidental, 
              special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other 
              intangible losses resulting from your use of the service.
            </p>
            <p>
              Our total liability to you for all damages shall not exceed the amount paid by you to us in the 
              twelve months preceding the claim.
            </p>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Privacy</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of 
              the service, to understand our practices.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Governing Law</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              These Terms are governed by and construed in accordance with the laws of South Africa, 
              without regard to conflict of law provisions. Any disputes will be resolved in the courts of South Africa.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Changes to Terms</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes 
              by posting the new Terms on this page and updating the "Last Updated" date.
            </p>
            <p>
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gray-50 dark:bg-gray-900 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>If you have questions about these Terms, please contact us:</p>
            <ul className="list-none">
              <li><strong>Email:</strong> marketing@thehealios.com</li>
              <li><strong>South Africa:</strong> 6A 2nd Street, Linden, Johannesburg</li>
              <li><strong>United Kingdom:</strong> 69 High Street, Southgate, London N14 6LD</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}