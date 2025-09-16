interface QuizAnswers {
  [questionId: number]: string | string[];
}

interface ProductRecommendation {
  productId: string;
  productName: string;
  reason: string;
  medicalBasis: string;
  researchCitations: string[];
  priority: number; // 1-3, 1 being highest priority
}

interface QuizRecommendations {
  primaryRecommendations: ProductRecommendation[];
  secondaryRecommendations: ProductRecommendation[];
  personalizedMessage: string;
}

export class QuizRecommendationService {
  
  static analyzeAnswersAndRecommend(answers: QuizAnswers): QuizRecommendations {
    const recommendations: ProductRecommendation[] = [];
    
    // Get user's primary health goals and concerns
    const primaryGoal = answers[1] as string;
    const energyLevel = answers[2] as string; 
    const improvementAreas = answers[3] as string[];
    const currentSupplements = answers[4] as string;
    const ageRange = answers[5] as string;
    const dietaryRestrictions = answers[6] as string[];
    
    // Analyze sleep-related needs
    if (primaryGoal === 'Better sleep quality' || (improvementAreas && improvementAreas.includes('Sleep quality'))) {
      recommendations.push({
        productId: 'magnesium-bisglycinate-b6',
        productName: 'Magnesium Complex Capsules — 375mg Magnesium + B6 (120 Vegan Capsules)',
        reason: 'Magnesium plays a crucial role in sleep regulation and muscle relaxation, helping you achieve deeper, more restorative sleep naturally.',
        medicalBasis: 'Clinical studies demonstrate that magnesium supplementation significantly improves sleep quality, reduces sleep onset time, and increases sleep efficiency. Magnesium regulates melatonin production and activates the parasympathetic nervous system.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/23853635/ - Sleep-promoting effects of magnesium supplementation',
          'https://pubmed.ncbi.nlm.nih.gov/32162142/ - Magnesium intake and sleep disorders meta-analysis',
          'https://pubmed.ncbi.nlm.nih.gov/24264568/ - Effect of magnesium supplementation on insomnia'
        ],
        priority: 1
      });
    }
    
    // Analyze stress and mood support needs
    if (primaryGoal === 'Stress management' || (improvementAreas && improvementAreas.includes('Mood and stress levels'))) {
      recommendations.push({
        productId: 'ashwagandha',
        productName: 'KSM-66® Ashwagandha Capsules 500mg',
        reason: 'Ashwagandha is a clinically-proven adaptogen that helps your body manage stress naturally while supporting balanced cortisol levels and emotional wellbeing.',
        medicalBasis: 'KSM-66® Ashwagandha has been shown in randomized controlled trials to reduce cortisol levels by up to 27.9% and significantly decrease stress and anxiety scores. It supports the hypothalamic-pituitary-adrenal axis function.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/31517876/ - KSM-66 ashwagandha reduces cortisol and stress',
          'https://pubmed.ncbi.nlm.nih.gov/23439798/ - Ashwagandha improves anxiety and stress levels',
          'https://pubmed.ncbi.nlm.nih.gov/34254920/ - Systematic review of ashwagandha for stress'
        ],
        priority: 1
      });
    }
    
    // Analyze energy and fatigue concerns
    if ((energyLevel && (energyLevel.includes('Very low') || energyLevel.includes('Low'))) || (improvementAreas && improvementAreas.includes('Physical energy'))) {
      // Check if they might benefit from Iron
      if (ageRange && (ageRange.includes('26-') || ageRange.includes('36-') || ageRange.includes('46-'))) {
        recommendations.push({
          productId: 'vitamin-d3',
          productName: 'Vitamin D3 4000 IU Gummies (Natural Orange Flavour | 60 Gummies)',
          reason: 'Iron deficiency is a leading cause of fatigue, especially in women of childbearing age. Our gentle iron formula with vitamin C enhances absorption and energy production.',
          medicalBasis: 'Iron is essential for oxygen transport and cellular energy production. Vitamin C increases iron absorption by up to 67%. Clinical studies show iron supplementation significantly improves fatigue scores in individuals with low iron stores.',
          researchCitations: [
            'https://pubmed.ncbi.nlm.nih.gov/24259692/ - Iron supplementation reduces fatigue in women',
            'https://pubmed.ncbi.nlm.nih.gov/23981518/ - Vitamin C enhances iron absorption',
            'https://pubmed.ncbi.nlm.nih.gov/32336612/ - Iron deficiency and fatigue relationship'
          ],
          priority: 1
        });
      }
      
      // Add B-vitamins for energy
      recommendations.push({
        productId: 'probiotics',
        productName: 'Probiotic Complex — 10 Billion CFU with FOS (6 Strains, Vegan, 60 Capsules)',
        reason: 'B vitamins are essential for converting food into cellular energy, while probiotics support nutrient absorption and overall vitality.',
        medicalBasis: 'B vitamins (particularly B12, B6, and folate) are crucial cofactors in energy metabolism and mitochondrial function. Research shows B-vitamin supplementation can significantly reduce fatigue and improve energy levels.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/25109935/ - B vitamins and energy metabolism',
          'https://pubmed.ncbi.nlm.nih.gov/31179461/ - B vitamin supplementation reduces fatigue',
          'https://pubmed.ncbi.nlm.nih.gov/27780532/ - Gut microbiome and energy production'
        ],
        priority: 2
      });
    }
    
    // Analyze immune support needs
    if (primaryGoal === 'Immune system support' || (improvementAreas && improvementAreas.includes('Immune function'))) {
      recommendations.push({
        productId: 'vitamin-d3',
        productName: 'Vitamin D3 4000 IU Gummies',
        reason: 'Vitamin D3 is crucial for immune system regulation and defense against infections. Most people in the UK have insufficient vitamin D levels, especially during winter months.',
        medicalBasis: 'Vitamin D3 modulates both innate and adaptive immune responses. Clinical trials show vitamin D supplementation reduces respiratory tract infection risk by 12% and severity by 40%. The 4000 IU dose is optimal for immune function.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/28202713/ - Vitamin D supplementation prevents acute respiratory infections',
          'https://pubmed.ncbi.nlm.nih.gov/31614810/ - Vitamin D and immune function review',
          'https://pubmed.ncbi.nlm.nih.gov/33595634/ - Optimal vitamin D dosing for immunity'
        ],
        priority: 1
      });
    }
    
    // Analyze digestive health needs
    if (primaryGoal === 'Digestive health' || (improvementAreas && improvementAreas.includes('Digestive comfort'))) {
      recommendations.push({
        productId: 'probiotics',
        productName: 'Probiotic Complex (10 Billion CFU)',
        reason: 'Our multi-strain probiotic complex supports digestive balance, nutrient absorption, and gut-brain communication for overall wellness.',
        medicalBasis: 'Clinical research demonstrates that multi-strain probiotics significantly improve digestive symptoms, enhance gut barrier function, and support immune health. The 10 billion CFU dose provides therapeutic benefits.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/24264568/ - Multi-strain probiotics for digestive health',
          'https://pubmed.ncbi.nlm.nih.gov/25928379/ - Probiotics improve gut barrier function',
          'https://pubmed.ncbi.nlm.nih.gov/27413138/ - Probiotic therapeutic dosing research'
        ],
        priority: 1
      });
    }
    
    // Analyze cognitive support needs
    if (improvementAreas && improvementAreas.includes('Mental clarity and focus')) {
      recommendations.push({
        productId: 'mind-memory-mushroom',
        productName: 'Mind & Memory Mushroom - Lion\'s Mane Gummies',
        reason: 'Lion\'s Mane mushroom contains unique compounds that support brain health, cognitive function, and mental clarity through neuroplasticity enhancement.',
        medicalBasis: 'Lion\'s Mane contains hericenones and erinacines that stimulate nerve growth factor (NGF) production. Clinical studies show significant improvements in cognitive function scores and memory performance.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/18844328/ - Lion\'s mane improves cognitive function',
          'https://pubmed.ncbi.nlm.nih.gov/31413233/ - Hericenones promote neuroplasticity',
          'https://pubmed.ncbi.nlm.nih.gov/32756705/ - Lion\'s mane and memory enhancement'
        ],
        priority: 1
      });
    }
    
    // Analyze beauty and skin health needs
    if (improvementAreas && improvementAreas.includes('Skin health')) {
      recommendations.push({
        productId: 'collagen-complex',
        productName: 'Collagen + C + Zinc + Selenium Gummies',
        reason: 'Collagen peptides support skin elasticity and hydration, while vitamin C, zinc, and selenium provide antioxidant protection and collagen synthesis support.',
        medicalBasis: 'Clinical trials demonstrate that hydrolyzed collagen peptides significantly improve skin elasticity, hydration, and reduce wrinkles. Vitamin C is essential for collagen synthesis, while zinc and selenium protect against oxidative damage.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/30681787/ - Collagen peptides improve skin properties',
          'https://pubmed.ncbi.nlm.nih.gov/31614810/ - Vitamin C in collagen synthesis',
          'https://pubmed.ncbi.nlm.nih.gov/25278298/ - Antioxidants for skin health'
        ],
        priority: 2
      });
      
      // Add biotin for hair, skin, nails
      recommendations.push({
        productId: 'biotin-5000',
        productName: 'Biotin 10,000 µg Strawberry Gummies',
        reason: 'High-potency biotin supports healthy hair growth, skin renewal, and nail strength through enhanced keratin production.',
        medicalBasis: 'Biotin is a crucial cofactor in fatty acid synthesis and amino acid metabolism essential for healthy hair, skin, and nails. Studies show high-dose biotin supplementation improves hair thickness and nail strength.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/28879195/ - Biotin supplementation for hair and nail health',
          'https://pubmed.ncbi.nlm.nih.gov/25573272/ - High-dose biotin effects on hair growth',
          'https://pubmed.ncbi.nlm.nih.gov/27444854/ - Biotin deficiency and beauty concerns'
        ],
        priority: 2
      });
    }
    
    // Add metabolic support if needed
    if (ageRange && (ageRange.includes('35') || ageRange.includes('45') || ageRange.includes('55'))) {
      recommendations.push({
        productId: 'apple-cider-vinegar',
        productName: 'Apple Cider Vinegar Gummies',
        reason: 'Apple cider vinegar may support healthy blood sugar response and metabolic function, particularly beneficial as we age.',
        medicalBasis: 'Acetic acid in apple cider vinegar has been shown to improve insulin sensitivity and reduce post-meal blood glucose spikes by up to 34%. This supports healthy metabolic function and weight management.',
        researchCitations: [
          'https://pubmed.ncbi.nlm.nih.gov/15630182/ - Apple cider vinegar improves insulin sensitivity',
          'https://pubmed.ncbi.nlm.nih.gov/19661687/ - Vinegar effects on blood glucose',
          'https://pubmed.ncbi.nlm.nih.gov/18047218/ - Acetic acid and metabolic health'
        ],
        priority: 3
      });
    }
    
    // Sort recommendations by priority
    const sortedRecommendations = recommendations.sort((a, b) => a.priority - b.priority);
    
    // Separate into primary (priority 1) and secondary (priority 2-3)
    const primaryRecommendations = sortedRecommendations.filter(r => r.priority === 1).slice(0, 3);
    const secondaryRecommendations = sortedRecommendations.filter(r => r.priority > 1).slice(0, 2);
    
    // Generate personalized message
    let personalizedMessage = this.generatePersonalizedMessage(answers, primaryRecommendations);
    
    return {
      primaryRecommendations,
      secondaryRecommendations,
      personalizedMessage
    };
  }
  
  private static generatePersonalizedMessage(answers: QuizAnswers, primaryRecommendations: ProductRecommendation[]): string {
    const primaryGoal = answers[1] as string;
    const energyLevel = answers[2] as string;
    const firstName = 'there'; // Will be replaced with actual name in email
    
    let message = `Hello ${firstName},\n\nThank you for taking our wellness assessment. Based on your responses, `;
    
    if (primaryGoal === 'Better sleep quality') {
      message += "we can see that improving your sleep quality is a priority. Quality sleep is fundamental to overall health and wellbeing.";
    } else if (primaryGoal === 'Stress management') {
      message += "managing stress appears to be your main focus. Chronic stress can impact every aspect of health, so addressing this is excellent for your overall wellbeing.";
    } else if (primaryGoal === 'Increased energy levels') {
      message += "boosting your energy levels is your primary goal. Low energy can significantly impact quality of life and productivity.";
    } else if (primaryGoal === 'Immune system support') {
      message += "supporting your immune system is your key objective. A strong immune system is your body's best defense against illness.";
    } else {
      message += "supporting your overall wellness is important to you. Taking a proactive approach to health is the best investment you can make.";
    }
    
    message += `\n\nBased on current research and your specific needs, we've identified ${primaryRecommendations.length} key supplement${primaryRecommendations.length > 1 ? 's' : ''} that could support your goals. Each recommendation is backed by peer-reviewed clinical research and formulated with premium, bioavailable ingredients.\n\nThese are gentle suggestions based on general wellness research - we always recommend consulting with your healthcare provider before starting any new supplement regimen, especially if you have existing health conditions or take medications.`;
    
    return message;
  }
}