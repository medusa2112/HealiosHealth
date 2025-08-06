import { Briefcase, Users, Heart, Zap, Globe, Mail } from "lucide-react";

const values = [
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Wellness First",
    description: "We're passionate about improving people's health and wellbeing through science-backed nutrition."
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Innovation",
    description: "We continuously push boundaries to create better products and experiences for our customers."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Collaboration",
    description: "We believe in the power of teamwork and diverse perspectives to drive meaningful change."
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Global Impact",
    description: "Our mission extends beyond supplements - we're committed to making a positive environmental impact."
  }
];

const benefits = [
  "Competitive salary and performance bonuses",
  "Comprehensive health and wellness benefits",
  "Flexible working arrangements and remote options",
  "Professional development and learning opportunities",
  "Company product allowance",
  "Mental health and wellbeing support",
  "Team building activities and company retreats",
  "Contribution to environmental and social causes"
];

const openPositions = [
  {
    title: "Digital Marketing Manager",
    location: "London, UK / Remote",
    type: "Full-time",
    department: "Marketing",
    description: "Lead our digital marketing strategy across social media, email, and content marketing channels."
  },
  {
    title: "Product Development Scientist",
    location: "Johannesburg, SA / Hybrid",
    type: "Full-time", 
    department: "R&D",
    description: "Research and develop new supplement formulations using evidence-based nutritional science."
  },
  {
    title: "Customer Experience Specialist",
    location: "Remote (SA/UK timezone)",
    type: "Full-time",
    department: "Customer Success",
    description: "Provide exceptional support to customers and help them achieve their wellness goals."
  },
  {
    title: "Supply Chain Coordinator",
    location: "Johannesburg, SA",
    type: "Full-time",
    department: "Operations",
    description: "Manage supplier relationships and ensure efficient product distribution across markets."
  }
];

export function Careers() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Build the Future of Wellness
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Join our mission to make premium nutrition accessible to everyone. We're building a team of passionate 
            individuals who want to make a real difference in people's health and wellbeing.
          </p>
          <a
            href="#positions"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're guided by principles that shape how we work, what we create, and the impact we make.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-black dark:text-white">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Work With Us</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We invest in our team's success and wellbeing with comprehensive benefits and growth opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-black dark:bg-white w-2 h-2 mt-3 mr-4 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div id="positions" className="py-20 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Ready to make an impact? Explore our current opportunities.
            </p>
          </div>

          <div className="grid gap-8">
            {openPositions.map((position, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {position.department}
                      </span>
                      <span>{position.location}</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:marketing@thehealios.com?subject=Application for ${position.title}`}
                    className="mt-4 md:mt-0 inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{position.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Application Process</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="bg-black dark:bg-white text-white dark:text-black w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Apply</h3>
              <p className="text-gray-600 dark:text-gray-400">Submit your application with CV and cover letter</p>
            </div>
            <div>
              <div className="bg-black dark:bg-white text-white dark:text-black w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interview</h3>
              <p className="text-gray-600 dark:text-gray-400">Virtual or in-person interview with our team</p>
            </div>
            <div>
              <div className="bg-black dark:bg-white text-white dark:text-black w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome</h3>
              <p className="text-gray-600 dark:text-gray-400">Join our team and start making an impact</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
              <Mail className="h-6 w-6 mr-2" />
              Ready to Apply?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Don't see the perfect role? We're always looking for talented individuals to join our mission.
            </p>
            <a
              href="mailto:marketing@thehealios.com?subject=Career Inquiry"
              className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}