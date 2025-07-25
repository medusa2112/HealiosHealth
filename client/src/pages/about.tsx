import { Leaf, Users, Award, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold text-dark-text sm:text-5xl">
              About Wild Nutrition
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              We're passionate about creating premium supplements that support your health journey. 
              Our mission is to make optimal nutrition accessible through science-backed, natural formulations.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2018, Wild Nutrition began with a simple belief: everyone deserves access to premium, 
                  scientifically-formulated supplements that actually work. Our founders, both nutrition scientists, 
                  were frustrated by the lack of transparency and quality in the supplement industry.
                </p>
                <p>
                  We set out to change that by creating supplements with complete ingredient transparency, 
                  rigorous third-party testing, and formulations based on the latest nutritional research. 
                  Every product we create goes through months of development and testing to ensure it meets 
                  our exacting standards.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers worldwide who trust us to support their 
                  health and wellness goals with our premium supplements.
                </p>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500" 
                alt="Our laboratory" 
                className="w-full rounded-xl shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full brand-yellow flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-dark-text" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-dark-text mb-2">
                Natural First
              </h3>
              <p className="text-gray-600">
                We prioritize natural, organic ingredients sourced from sustainable suppliers worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full brand-yellow flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-dark-text" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-dark-text mb-2">
                Quality Excellence
              </h3>
              <p className="text-gray-600">
                Every product undergoes rigorous testing and quality control to ensure purity and potency.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full brand-yellow flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-dark-text" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-dark-text mb-2">
                Customer Focus
              </h3>
              <p className="text-gray-600">
                Your health goals drive our innovation. We listen to our community and evolve accordingly.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full brand-yellow flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-dark-text" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-dark-text mb-2">
                Sustainability
              </h3>
              <p className="text-gray-600">
                We're committed to environmental responsibility in our sourcing and packaging practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl">
              Our Team
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Meet the passionate experts behind Wild Nutrition.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
                alt="Dr. Sarah Mitchell" 
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" 
              />
              <h3 className="font-heading text-lg font-semibold text-dark-text">
                Dr. Sarah Mitchell
              </h3>
              <p className="text-gray-600 mb-2">Co-Founder & Chief Scientific Officer</p>
              <p className="text-sm text-gray-500">
                PhD in Nutritional Biochemistry, 15+ years in supplement research and development.
              </p>
            </div>

            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
                alt="Michael Chen" 
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" 
              />
              <h3 className="font-heading text-lg font-semibold text-dark-text">
                Michael Chen
              </h3>
              <p className="text-gray-600 mb-2">Co-Founder & CEO</p>
              <p className="text-sm text-gray-500">
                Former biotech executive with a passion for making premium nutrition accessible to all.
              </p>
            </div>

            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
                alt="Dr. Emma Rodriguez" 
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" 
              />
              <h3 className="font-heading text-lg font-semibold text-dark-text">
                Dr. Emma Rodriguez
              </h3>
              <p className="text-gray-600 mb-2">Head of Quality Assurance</p>
              <p className="text-sm text-gray-500">
                Ensures every product meets our stringent quality standards through comprehensive testing protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-dark-text sm:text-4xl">
              Certifications & Quality
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our commitment to quality is backed by industry-leading certifications.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="font-heading font-semibold text-dark-text mb-2">FDA Registered</h4>
                <p className="text-sm text-gray-600">Manufactured in FDA-registered facilities</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="font-heading font-semibold text-dark-text mb-2">GMP Certified</h4>
                <p className="text-sm text-gray-600">Good Manufacturing Practice compliance</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="font-heading font-semibold text-dark-text mb-2">Third-Party Tested</h4>
                <p className="text-sm text-gray-600">Independent laboratory verification</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="font-heading font-semibold text-dark-text mb-2">NSF Approved</h4>
                <p className="text-sm text-gray-600">National Sanitation Foundation certified</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
