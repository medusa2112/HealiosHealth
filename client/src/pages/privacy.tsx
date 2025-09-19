import { Shield, Eye, Lock, Database, Mail, UserCheck } from "lucide-react";

export function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Overview */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Overview</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              At Healios, we respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, share, and protect your information when 
              you use our website, products, and services.
            </p>
            <p>
              We are the data controller for the personal information we collect about you. 
              Our contact details are provided at the end of this policy.
            </p>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Database className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Information We Collect</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h3>Personal Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password when you create an account</li>
              <li><strong>Order Information:</strong> Billing and shipping addresses, payment information</li>
              <li><strong>Communication:</strong> Messages you send us, survey responses, quiz answers</li>
              <li><strong>Health Information:</strong> Voluntary health and wellness goals you share via our quiz</li>
            </ul>

            <h3>Information Automatically Collected</h3>
            <ul>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns</li>
              <li><strong>Cookies:</strong> We use cookies to improve your experience (see Cookie Policy below)</li>
            </ul>

            <h3>Information from Third Parties</h3>
            <ul>
              <li><strong>Payment Processors:</strong> Transaction confirmations from PayStack</li>
              <li><strong>Analytics Services:</strong> Aggregated usage statistics</li>
              <li><strong>Social Media:</strong> If you interact with our social media accounts</li>
            </ul>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <UserCheck className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Use Your Information</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>We use your personal information to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Personalize your experience and product recommendations</li>
              <li>Send important updates about orders and account changes</li>
              <li>Improve our products and services</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud or security issues</li>
            </ul>
            
            <h3>Legal Basis for Processing</h3>
            <p>We process your data based on:</p>
            <ul>
              <li><strong>Contract:</strong> To fulfill our obligations under our terms of service</li>
              <li><strong>Consent:</strong> For marketing communications and optional features</li>
              <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </div>
        </section>

        {/* Information Sharing */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Eye className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Share Information</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Payment processors, shipping companies, analytics services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              <li><strong>Consent:</strong> With your explicit permission for specific purposes</li>
            </ul>
            <p>
              <strong>We do not sell your personal information to third parties.</strong>
            </p>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Security</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul>
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure servers and databases with access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
            <p>
              While we strive to protect your data, no method of transmission over the internet is 100% secure. 
              We cannot guarantee absolute security but we use industry-standard practices.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Privacy Rights</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data in certain circumstances</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Withdraw Consent:</strong> For processing based on consent</li>
            </ul>
            <p>
              To exercise these rights, contact us using the details provided below. 
              We may need to verify your identity before processing requests.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cookie Policy</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Keep you signed in to your account</li>
              <li>Analyze website performance and usage</li>
              <li>Provide personalized content and recommendations</li>
              <li>Enable social media features</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Note that disabling certain cookies 
              may affect website functionality.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Retention</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>We retain your personal data for as long as necessary to:</p>
            <ul>
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Support business operations</li>
            </ul>
            <p>
              Generally, we retain account information while your account is active and for a reasonable 
              period after account closure. Transaction records are kept for legal and accounting purposes.
            </p>
          </div>
        </section>

        {/* International Transfers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">International Data Transfers</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              Your data may be transferred to and processed in countries outside your jurisdiction. 
              We ensure appropriate safeguards are in place, including:
            </p>
            <ul>
              <li>Standard contractual clauses approved by regulatory authorities</li>
              <li>Adequacy decisions by relevant data protection authorities</li>
              <li>Appropriate technical and organizational measures</li>
            </ul>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Changes to This Policy</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes 
              by posting the updated policy on our website and updating the "Last Updated" date.
            </p>
            <p>
              Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gray-50 dark:bg-gray-900 p-8">
          <div className="flex items-center mb-6">
            <Mail className="h-6 w-6 text-black dark:text-white mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p>For questions about this Privacy Policy or our data practices, contact us:</p>
            <ul className="list-none">
              <li><strong>Email:</strong> marketing@thehealios.com</li>
              <li><strong>Subject:</strong> Privacy Policy Inquiry</li>
            </ul>
            
            <p><strong>Our Offices:</strong></p>
            <ul className="list-none">
              <li><strong>South Africa:</strong> 6A 2nd Street, Linden, Johannesburg</li>
              <li><strong>United Kingdom:</strong> 69 High Street, Southgate, London N14 6LD</li>
            </ul>
            
            <p>
              If you have concerns about how we handle your data, you also have the right to lodge 
              a complaint with your local data protection authority.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}