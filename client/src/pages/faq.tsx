import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: Record<string, FAQItem[]> = {
  "General": [
    {
      question: "What is Healios?",
      answer: "Healios is a premium supplement brand committed to providing science-backed, high-quality nutritional gummies. We focus on delivering effective solutions for modern wellness needs, from stress management to immune support, using carefully researched ingredients and optimal dosages."
    },
    {
      question: "Are Healios supplements suitable for vegetarians and vegans?",
      answer: "Most of our products are suitable for vegetarians. However, some supplements may contain ingredients derived from animal sources. Please check individual product labels for specific dietary information. We're continuously working to expand our vegan-friendly options."
    },
    {
      question: "How do I know which supplements are right for me?",
      answer: "We recommend taking our comprehensive Supplement Quiz, which provides personalized recommendations based on your health goals, lifestyle, and dietary needs. For specific health concerns, always consult with your healthcare provider before starting any new supplement regimen."
    }
  ],
  "Products": [
    {
      question: "What makes Healios gummies different from other supplements?",
      answer: "Our gummies are formulated with clinically-studied ingredients at optimal dosages. We prioritize quality, taste, and effectiveness, using natural flavors and colors wherever possible. Each product undergoes rigorous third-party testing for purity and potency."
    },
    {
      question: "How should I store my supplements?",
      answer: "Store your supplements in a cool, dry place away from direct sunlight. Keep bottles tightly sealed to maintain freshness. Most supplements are best stored at room temperature (15-25°C). Do not store in bathrooms or other humid areas."
    },
    {
      question: "Can I take multiple Healios products together?",
      answer: "Many of our products can be taken together safely. However, we recommend checking with your healthcare provider before combining supplements, especially if you're taking medications or have underlying health conditions. Our quiz can also help identify potential interactions."
    },
    {
      question: "Are your products third-party tested?",
      answer: "Yes, all Healios products undergo comprehensive third-party testing for purity, potency, and safety. We test for heavy metals, microbiological contaminants, and verify that each product meets our strict quality standards before reaching you."
    }
  ],
  "Orders & Account": [
    {
      question: "How do I create an account?",
      answer: "You can create an account during checkout or by clicking the 'Register' button. Having an account allows you to track orders, access your order history, save addresses, and receive personalized product recommendations."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "Orders can be modified or cancelled within 1 hour of placement. After this time, orders enter our fulfillment process and cannot be changed. Contact our customer service team immediately if you need to make changes."
    },
    {
      question: "Do you offer subscription services?",
      answer: "We're working on subscription services to make it easier for you to maintain consistent supplementation. This feature will be available soon and will offer convenient auto-delivery options with exclusive discounts."
    }
  ],
  "Technical Support": [
    {
      question: "I'm having trouble with the website. What should I do?",
      answer: "Try refreshing your browser or clearing your cache and cookies. If problems persist, contact our support team at marketing@thehealios.com with details about the issue you're experiencing, including your browser type and any error messages."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take data security seriously. Our website uses SSL encryption to protect your personal and payment information. We never share your data with third parties without your consent, and we comply with applicable data protection regulations."
    }
  ]
};

function FAQSection({ title, items }: { title: string; items: FAQItem[] }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-lg font-medium text-gray-900 dark:text-white pr-4">
                {item.question}
              </span>
              {openItems.has(index) ? (
                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            {openItems.has(index) && (
              <div className="px-6 pb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about Healios products, orders, and services. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {Object.entries(faqData).map(([category, items]) => (
          <FAQSection key={category} title={category} items={items} />
        ))}

        {/* Contact Support */}
        <div className="bg-gray-50 dark:bg-gray-900 p-8 text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our customer support team is here to help you with any questions or concerns.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <a
              href="/contact"
              className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:marketing@thehealios.com"
              className="inline-block border-2 border-black dark:border-white text-black dark:text-white px-8 py-3 font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}