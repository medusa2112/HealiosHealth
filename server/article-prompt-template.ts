export const ARTICLE_PROMPT_TEMPLATE = `
You are a medical content writer for Healios, a UK-based supplement company. Create an expert-level, medically credible health and wellness article.

CRITICAL REQUIREMENTS:
- Write in UK English with professional medical tone
- Educational content only - never provide medical advice
- Structure: H1 > H2 > H3 with numbered sections and bullet lists
- Target audience: Health-conscious UK consumers
- Avoid AI-speak, clickbait, or overhyped claims
- Cite credible sources: PubMed, NICE, NHS, Mayo Clinic, WHO
- Length: 1500-2000 words
- Include medical disclaimer

ARTICLE STRUCTURE:
1. Title (SEO-optimized, under 60 characters)
2. Meta Description (under 160 characters)
3. Introduction (engaging hook, 2-3 paragraphs)
4. Main Content (4-6 H2 sections with H3 subsections)
5. Key Takeaways (bullet points)
6. Medical Disclaimer
7. Sources (inline citations and reference list)

TOPIC: {topic}

RESEARCH DATA: {research}

TONE GUIDELINES:
- Professional but accessible
- Evidence-based statements only
- Use "research suggests" not "proven to cure"
- Include relevant statistics and study data
- Acknowledge limitations of current research

FORMAT AS HTML with proper semantic structure.
`;

export const MEDICAL_DISCLAIMER = `
<div class="medical-disclaimer" style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff;">
<h4>Medical Disclaimer</h4>
<p><strong>This article is for educational purposes only and does not constitute medical advice.</strong> Always consult with a qualified healthcare professional before making changes to your health routine, especially if you have underlying medical conditions or are taking medications. The information provided has not been evaluated by the Medicines and Healthcare products Regulatory Agency (MHRA).</p>
</div>
`;

export const predefinedTopics = [
  "Magnesium for Sleep: Clinical Evidence and Benefits",
  "Vitamin D and Mood: What Research Shows",
  "Collagen Benefits Backed by Research",
  "Gut-Skin Axis: What Science Says",
  "What Is Adaptogenic Fatigue Recovery?",
  "The Truth About Hormonal Imbalance in Men & Women",
  "Immune System Priming Through Supplementation",
  "UK Supplement Regulation Explained",
  "Iron Deficiency: Signs, Symptoms and Solutions",
  "Biotin for Hair Health: Separating Fact from Fiction",
  "Ashwagandha: Ancient Medicine Meets Modern Science",
  "Folic Acid in Pregnancy: Essential Guidelines",
  "Probiotic Benefits: Evidence-Based Health Support",
  "Apple Cider Vinegar: Health Claims vs Reality"
];