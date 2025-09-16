#!/usr/bin/env tsx

/**
 * Quiz Email Test Script
 * Tests quiz completion recommendation email functionality
 */

import { EmailService } from './email';
import { QuizRecommendationService } from './quiz-service';
import type { QuizResult } from '@shared/schema';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function testQuizEmailSystem() {
  console.log('\n🧪 Testing Quiz Email System...');
  
  // Test quiz answers data
  const testAnswers = {
    1: 'Stress management',
    2: 'Low energy most of the time',
    3: ['Mood and stress levels', 'Sleep quality', 'Physical energy'],
    4: 'No supplements currently',
    5: '26-35 years old',
    6: ['None']
  };
  
  // Create mock quiz result
  const mockQuizResult: QuizResult = {
    id: 'test-quiz-' + Date.now(),
    firstName: 'Test',
    lastName: 'User',
    email: 'dn@thefourths.com', // Send to admin for testing
    answers: testAnswers,
    createdAt: new Date().toISOString()
  };
  
  try {
    console.log('📊 Generating recommendations...');
    const recommendations = QuizRecommendationService.analyzeAnswersAndRecommend(testAnswers);
    
    console.log('✅ Generated recommendations:', {
      primary: recommendations.primaryRecommendations.length,
      secondary: recommendations.secondaryRecommendations.length,
      message: recommendations.personalizedMessage.substring(0, 100) + '...'
    });
    
    // Test enhancing recommendations first
    console.log('🔄 Testing recommendation enhancement...');
    try {
      const enhancedRecommendations = await (EmailService as any).enhanceRecommendationsWithProductData(recommendations);
      console.log('✅ Recommendations enhanced successfully');
      console.log('Enhanced recommendations:', {
        primaryCount: enhancedRecommendations.primaryRecommendations.length,
        secondaryCount: enhancedRecommendations.secondaryRecommendations.length,
        cartUrl: enhancedRecommendations.cartUrl
      });
      
      // Check if products were found
      console.log('🔍 Checking product mapping...');
      enhancedRecommendations.primaryRecommendations.forEach((rec, index) => {
        console.log(`Primary ${index + 1}: ${rec.productId} -> ${rec.product ? 'Found' : 'NOT FOUND'}`);
        if (rec.product) {
          console.log(`  Product: ${rec.product.name}, Price: ${rec.product.price}`);
        }
      });
      
      // Debug: Test storage directly
      console.log('🔧 Testing storage.getProductById directly...');
      try {
        const { storage } = await import('./storage');
        const testProduct = await storage.getProductById('ashwagandha');
        console.log('Direct storage test for ashwagandha:', testProduct ? 'Found' : 'NOT FOUND');
        if (testProduct) {
          console.log(`  Product: ${testProduct.name}, Price: ${testProduct.price}`);
        }
      } catch (storageError) {
        console.error('❌ Storage test error:', storageError);
      }
      
    } catch (enhanceError) {
      console.error('❌ Error enhancing recommendations:', enhanceError);
      throw enhanceError;
    }
    
    console.log('📧 Sending quiz recommendation email...');
    try {
      const emailSuccess = await EmailService.sendQuizRecommendations(mockQuizResult, recommendations);
      
      if (emailSuccess) {
        console.log('✅ Quiz recommendation email sent successfully!');
        return true;
      } else {
        console.log('❌ Quiz recommendation email failed to send');
        return false;
      }
    } catch (emailError) {
      console.error('❌ Error in sendQuizRecommendations:', emailError);
      throw emailError;
    }
  } catch (error) {
    console.error('❌ Error testing quiz email system:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return false;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testQuizEmailSystem().catch(console.error);
}

export { testQuizEmailSystem };