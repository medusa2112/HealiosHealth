export default function Consultation() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold text-darkText mb-8">
            Nutrition Consultation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized nutrition advice from our team of certified nutritionists and wellness experts.
          </p>
        </div>
        
        <div className="mt-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-darkText mb-6">
              What to Expect
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h3 className="font-semibold text-darkText">Personalized Assessment</h3>
                  <p className="text-gray-600">Comprehensive review of your health goals, lifestyle, and dietary needs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h3 className="font-semibold text-darkText">Custom Recommendations</h3>
                  <p className="text-gray-600">Tailored supplement and nutrition plan based on your unique requirements.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brandYellow rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h3 className="font-semibold text-darkText">Ongoing Support</h3>
                  <p className="text-gray-600">Follow-up sessions to track progress and adjust your plan as needed.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="font-heading text-2xl font-semibold text-darkText mb-6">
              Book Your Consultation
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brandYellow focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brandYellow focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brandYellow focus:border-transparent"
              />
              <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brandYellow focus:border-transparent">
                <option>Select Consultation Type</option>
                <option>General Wellness</option>
                <option>Weight Management</option>
                <option>Sports Nutrition</option>
                <option>Specific Health Goals</option>
              </select>
              <button
                type="submit"
                className="w-full bg-brandYellow text-darkText py-3 px-6 rounded-md font-semibold hover:bg-yellow-500 transition-colors"
              >
                Schedule Consultation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}