import { Users, DollarSign, TrendingUp, Gift, CheckCircle, Star, Handshake } from "lucide-react";

const benefits = [
  {
    icon: <DollarSign className="h-8 w-8" />,
    title: "Competitive Commission",
    description: "Earn up to 15% commission on every sale you generate through your unique referral link."
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Performance Bonuses",
    description: "Unlock higher commission rates and exclusive bonuses as you reach monthly sales milestones."
  },
  {
    icon: <Gift className="h-8 w-8" />,
    title: "Exclusive Products",
    description: "Get early access to new products and exclusive affiliate-only promotional materials."
  },
  {
    icon: <Star className="h-8 w-8" />,
    title: "Marketing Support",
    description: "Access professional marketing materials, product photos, and content to help you succeed."
  }
];

const commissionTiers = [
  {
    tier: "Starter",
    sales: "R0 - R5,000",
    commission: "10%",
    features: ["Monthly payouts", "Basic marketing materials", "Email support"]
  },
  {
    tier: "Growth",
    sales: "R5,001 - R15,000", 
    commission: "12%",
    features: ["Monthly payouts", "Advanced marketing kit", "Priority support", "Quarterly bonus"]
  },
  {
    tier: "Elite",
    sales: "R15,001+",
    commission: "15%",
    features: ["Weekly payouts", "Custom marketing assets", "Dedicated account manager", "Monthly bonuses", "Early product access"]
  }
];

const steps = [
  {
    number: "1",
    title: "Apply",
    description: "Submit your application with information about your audience and marketing experience."
  },
  {
    number: "2", 
    title: "Get Approved",
    description: "We'll review your application and get back to you within 48 hours."
  },
  {
    number: "3",
    title: "Start Promoting",
    description: "Access your unique referral links and marketing materials to start earning."
  },
  {
    number: "4",
    title: "Earn Commissions",
    description: "Track your performance and receive payments monthly via bank transfer or PayPal."
  }
];

export function Affiliate() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Join the Healios Affiliate Program
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Partner with us to promote premium wellness supplements and earn competitive commissions. 
            Perfect for health influencers, wellness bloggers, and nutrition enthusiasts.
          </p>
          <a
            href="#apply"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Apply Now
          </a>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Join Our Program?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide everything you need to successfully promote our premium supplements and maximize your earnings.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-black dark:text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Commission Structure</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our tiered commission structure rewards your success with increasing rates and exclusive benefits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {commissionTiers.map((tier, index) => (
              <div key={index} className={`bg-white dark:bg-gray-800 p-8 border-2 ${index === 1 ? 'border-black dark:border-white' : 'border-gray-200 dark:border-gray-700'} ${index === 1 ? 'scale-105' : ''}`}>
                {index === 1 && (
                  <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-semibold text-center mb-6">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tier.tier}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{tier.sales} monthly sales</p>
                  <div className="text-4xl font-bold text-black dark:text-white">{tier.commission}</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">commission rate</p>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Getting started is simple. Follow these steps to begin earning commissions.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Program Requirements</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We're looking for partners who align with our wellness mission and quality standards.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  What We Look For
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Active social media presence or blog in health/wellness niche</li>
                  <li>• Genuine interest in nutrition and supplements</li>
                  <li>• Professional content creation and engagement</li>
                  <li>• Alignment with our brand values and mission</li>
                  <li>• Ability to create authentic, helpful content</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Handshake className="h-6 w-6 text-black dark:text-white mr-2" />
                  Program Guidelines
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Honest, transparent promotion of products</li>
                  <li>• Compliance with FTC disclosure guidelines</li>
                  <li>• No paid search advertising on brand terms</li>
                  <li>• Respectful representation of the Healios brand</li>
                  <li>• Regular communication and performance updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div id="apply" className="py-20 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Ready to Get Started?</h2>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-black dark:text-white mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Apply for Our Program</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              We're currently accepting applications from qualified wellness influencers, health bloggers, 
              and nutrition enthusiasts. Tell us about your audience and how you'd like to promote Healios products.
            </p>
            
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <a
                href="mailto:marketing@thehealios.com?subject=Affiliate Program Application&body=Hi Healios Team,%0D%0A%0D%0AI'm interested in joining your affiliate program. Here's some information about me:%0D%0A%0D%0AName:%0D%0AWebsite/Social Media:%0D%0AAudience Size:%0D%0ANiche/Focus Area:%0D%0AExperience with Affiliate Marketing:%0D%0A%0D%0AWhy I'd like to partner with Healios:%0D%0A%0D%0AThank you for considering my application!%0D%0A%0D%0ABest regards"
                className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Apply via Email
              </a>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Have questions about our affiliate program?</p>
            <p>Contact us at <a href="mailto:marketing@thehealios.com" className="underline hover:text-gray-700 dark:hover:text-gray-300">marketing@thehealios.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}