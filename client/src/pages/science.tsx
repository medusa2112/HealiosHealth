export default function Science() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold text-darkText mb-8">
            Science
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the scientific research and evidence behind our premium nutrition supplements.
          </p>
        </div>
        
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-heading text-xl font-semibold text-darkText mb-4">
              Clinical Studies
            </h3>
            <p className="text-gray-600">
              Peer-reviewed research supporting our formulations and ingredient effectiveness.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-heading text-xl font-semibold text-darkText mb-4">
              Third-Party Testing
            </h3>
            <p className="text-gray-600">
              Independent laboratory verification of purity, potency, and safety standards.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-heading text-xl font-semibold text-darkText mb-4">
              Research Team
            </h3>
            <p className="text-gray-600">
              Meet our team of nutritional scientists and researchers driving innovation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}