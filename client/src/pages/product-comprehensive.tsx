import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Plus, Minus, Check, ArrowRight, CheckCircle, Bell } from "lucide-react";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { PreOrderPopup } from "@/components/pre-order-popup";
import { SubscriptionSection } from "@/components/SubscriptionSection";

// Import images
import healiosLogoImg from '@assets/healios-health26.png';
import supplementLabImg from '@assets/generated_images/Clean_supplement_laboratory_scene_a59ff8f9.png';
import wellnessLifestyleImg from '@assets/healios-health121.jpg';
import immuneHealthImg from '@assets/healios-health122.png';
import stressReliefImg from '@assets/healios-health123.png';
import digestiveHealthImg from '@assets/healios-health124.png';
import beautyWellnessImg from '@assets/healios-health125.png';
import sleepWellnessImg from '@assets/healios-health126.png';
import energyVitalityImg from '@assets/healios-health127.png';
import prenatalWellnessImg from '@assets/healios-health128.png';
import cognitiveHealthImg from '@assets/healios-health129.jpg';
import appleVinegarEditorialImg from '@assets/generated_images/Apple_cider_vinegar_editorial_lifestyle_8105f334.png';
import marineCollagenImg from '@assets/Collagen Complex__1754395222287.png';
import ksm66EditorialImg from '@assets/generated_images/KSM-66_Ashwagandha_premium_editorial_d5e83dc6.png';
import biotinHairImg from '@assets/generated_images/Editorial_flowing_hair_beauty_c3473199.png';

// KSM-66 Ashwagandha Editorial SVG - Professional Product Photography Style
const ashwagandhaEditorialSVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" style="background: linear-gradient(135deg, #fdfcff 0%, #f8f4ff 30%, #f5f1ff 100%);">
  <defs>
    <linearGradient id="studioFloor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95"/>
      <stop offset="50%" style="stop-color:#f8fafc;stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:0.6"/>
    </linearGradient>
    <linearGradient id="bottleGradient" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.98"/>
      <stop offset="30%" style="stop-color:#fafbfc;stop-opacity:0.95"/>
      <stop offset="70%" style="stop-color:#f4f6f8;stop-opacity:0.92"/>
      <stop offset="100%" style="stop-color:#e8edf3;stop-opacity:0.88"/>
    </linearGradient>
    <filter id="studioLighting" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="softGlow"/>
      <feOffset dx="2" dy="6" result="shadowOffset"/>
      <feMerge><feMergeNode in="shadowOffset"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <!-- Studio backdrop -->
  <ellipse cx="400" cy="580" rx="350" ry="60" fill="url(#studioFloor)" opacity="0.4"/>
  
  <!-- Ambient studio lighting -->
  <g opacity="0.06">
    <circle cx="120" cy="100" r="3" fill="#8b5cf6"/>
    <circle cx="680" cy="150" r="2" fill="#6366f1"/>
    <circle cx="200" cy="250" r="1.5" fill="#a855f7"/>
    <circle cx="700" cy="320" r="2.5" fill="#8b5cf6"/>
    <circle cx="150" cy="450" r="2" fill="#6366f1"/>
  </g>
  
  <!-- Hero product bottle - editorial style -->
  <g transform="translate(420, 80)">
    <!-- Product shadow -->
    <ellipse cx="60" cy="420" rx="55" ry="15" fill="#8b5cf6" opacity="0.12"/>
    
    <!-- Premium supplement bottle -->
    <g filter="url(#studioLighting)">
      <!-- Main bottle body -->
      <rect x="20" y="100" width="80" height="260" rx="12" fill="url(#bottleGradient)" stroke="#e2e8f0" stroke-width="2"/>
      
      <!-- Bottle neck -->
      <rect x="35" y="60" width="50" height="60" rx="6" fill="url(#bottleGradient)" stroke="#e2e8f0" stroke-width="1.5"/>
      
      <!-- Premium cap -->
      <rect x="32" y="40" width="56" height="30" rx="10" fill="#1f2937"/>
      <rect x="35" y="45" width="50" height="12" rx="6" fill="#4b5563"/>
      <rect x="38" y="48" width="44" height="6" rx="3" fill="#6b7280"/>
    </g>
    
    <!-- Premium product label -->
    <rect x="28" y="150" width="64" height="160" rx="6" fill="#ffffff" stroke="#e5e7eb" stroke-width="1" opacity="0.98"/>
    
    <!-- KSM-66 Branding -->
    <text x="60" y="175" font-family="system-ui, sans-serif" font-size="12" font-weight="800" text-anchor="middle" fill="#4c1d95" letter-spacing="0.5px">KSM-66®</text>
    <text x="60" y="190" font-family="system-ui, sans-serif" font-size="9" font-weight="400" text-anchor="middle" fill="#6b7280">ASHWAGANDHA</text>
    <text x="60" y="202" font-family="system-ui, sans-serif" font-size="6" font-weight="300" text-anchor="middle" fill="#8b5cf6" letter-spacing="0.8px">ROOT EXTRACT</text>
    
    <!-- Strength highlight -->
    <rect x="38" y="215" width="44" height="18" rx="9" fill="#8b5cf6" opacity="0.1"/>
    <text x="60" y="227" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle" fill="#374151">600mg</text>
    
    <!-- Count and supply info -->
    <text x="60" y="250" font-family="system-ui, sans-serif" font-size="8" font-weight="600" text-anchor="middle" fill="#8b5cf6">60 CAPSULES</text>
    <text x="60" y="262" font-family="system-ui, sans-serif" font-size="6" text-anchor="middle" fill="#6b7280">2 Month Supply</text>
    
    <!-- Quality certifications -->
    <text x="60" y="280" font-family="system-ui, sans-serif" font-size="6" font-weight="500" text-anchor="middle" fill="#10b981">✓ CLINICAL GRADE</text>
    <text x="60" y="292" font-family="system-ui, sans-serif" font-size="6" font-weight="500" text-anchor="middle" fill="#10b981">✓ 3RD PARTY TESTED</text>
  </g>
  
  <!-- Ashwagandha botanical arrangement -->
  <g transform="translate(180, 300)" opacity="0.7">
    <!-- Central root system -->
    <g stroke="#8b5cf6" stroke-width="2.5" fill="none" opacity="0.8">
      <path d="M0 0 Q-15 20 -20 45 Q-25 65 -15 85"/>
      <path d="M0 0 Q15 25 20 50 Q25 75 15 95"/>
      <path d="M0 0 Q-5 30 -8 55 Q-12 80 -2 100"/>
      <path d="M0 0 Q8 28 12 58 Q18 85 8 105"/>
    </g>
    
    <!-- Root connection points -->
    <g fill="#6366f1" opacity="0.9">
      <circle cx="0" cy="0" r="3"/>
      <circle cx="-12" cy="30" r="2"/>
      <circle cx="10" cy="35" r="2"/>
      <circle cx="-6" cy="55" r="1.5"/>
      <circle cx="15" cy="65" r="1.5"/>
      <circle cx="-18" cy="75" r="2"/>
      <circle cx="20" cy="85" r="2"/>
    </g>
    
    <!-- Fresh ashwagandha leaves -->
    <g fill="#10b981" opacity="0.6">
      <ellipse cx="-20" cy="-12" rx="15" ry="5" transform="rotate(-25)"/>
      <ellipse cx="18" cy="-18" rx="12" ry="4" transform="rotate(20)"/>
      <ellipse cx="0" cy="-22" rx="14" ry="4.5" transform="rotate(-5)"/>
      <ellipse cx="-8" cy="-15" rx="10" ry="3.5" transform="rotate(-12)"/>
      <ellipse cx="12" cy="-10" rx="11" ry="3" transform="rotate(15)"/>
    </g>
  </g>
  
  <!-- Molecular structure illustration -->
  <g transform="translate(600, 380)" opacity="0.4">
    <!-- Withanolide molecular structure -->
    <g stroke="#8b5cf6" stroke-width="1.8" fill="none">
      <path d="M0 0 L18 10 L36 6 L54 18 L72 12"/>
      <path d="M18 10 L30 30 L48 35 L66 30"/>
      <path d="M36 6 L42 -12 L60 -8 L72 12"/>
      <path d="M54 18 L64 38 L78 42"/>
    </g>
    
    <!-- Molecular nodes -->
    <g fill="#6366f1" opacity="0.8">
      <circle cx="0" cy="0" r="2.5"/>
      <circle cx="18" cy="10" r="2.5"/>
      <circle cx="36" cy="6" r="2.5"/>
      <circle cx="54" cy="18" r="2.5"/>
      <circle cx="72" cy="12" r="2.5"/>
      <circle cx="30" cy="30" r="2"/>
      <circle cx="48" cy="35" r="2"/>
      <circle cx="42" cy="-12" r="2"/>
      <circle cx="60" cy="-8" r="2"/>
    </g>
  </g>
  
  <!-- Clinical research badge -->
  <g transform="translate(120, 120)">
    <circle cx="0" cy="0" r="35" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <text x="0" y="-8" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#6366f1" font-weight="700">50+</text>
    <text x="0" y="4" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" fill="#6366f1" font-weight="600">CLINICAL</text>
    <text x="0" y="16" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" fill="#6366f1" font-weight="600">STUDIES</text>
  </g>
  
  <!-- Stress relief visualization -->
  <g transform="translate(100, 480)" opacity="0.3">
    <!-- Calming wave patterns -->
    <path d="M0 0 Q50 -20 100 0 Q150 20 200 0 Q250 -15 300 0" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
    <path d="M0 10 Q50 -10 100 10 Q150 30 200 10 Q250 -5 300 10" stroke="#a855f7" stroke-width="2" fill="none"/>
    <path d="M0 20 Q50 0 100 20 Q150 40 200 20 Q250 5 300 20" stroke="#6366f1" stroke-width="1.5" fill="none"/>
    
    <!-- Stress reduction indicators -->
    <g opacity="0.7">
      <path d="M80 -12 L70 -17 L70 -14 L60 -14 L60 -10 L70 -10 L70 -7 Z" fill="#8b5cf6"/>
      <path d="M180 12 L170 7 L170 10 L160 10 L160 14 L170 14 L170 17 Z" fill="#6366f1"/>
      <path d="M280 -8 L270 -13 L270 -10 L260 -10 L260 -6 L270 -6 L270 -3 Z" fill="#a855f7"/>
    </g>
  </g>
</svg>
`)}`;

// Marine Collagen Editorial SVG as URL encoded data
// Fixed: Use existing image for marine collagen
const marineCollagenEditorialSVG = appleVinegarEditorialImg;


// Helper function to determine the correct unit for products
const getProductUnit = (product: Product): string => {
  const name = product.name.toLowerCase();
  if (name.includes('gummies')) return 'gummies';
  if (name.includes('powder')) return 'servings';
  if (name.includes('capsules')) return 'capsules';
  if (name.includes('tablets')) return 'tablets';
  // Default for supplements
  return 'capsules';
};

// Helper function to create custom SVG illustrations for each product
const createProductSVG = (productId: string): string => {
  // Return actual editorial images for specific products
  if (productId === 'apple-cider-vinegar') {
    return appleVinegarEditorialImg;
  }
  if (productId === 'collagen-powder' || productId === 'halo-glow') {
    return marineCollagenEditorialSVG;
  }
  if (productId === 'ksm-66-ashwagandha' || productId === 'ashwagandha') {
    return ksm66EditorialImg;
  }
  if (productId === 'biotin-5000' || productId === 'biotin') {
    return biotinHairImg;
  }
  
  const svgs = {
    'halo-glow': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="haloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fdf2f8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f3e8ff;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#haloGrad)"/>
        <circle cx="200" cy="150" r="80" fill="none" stroke="#ec4899" stroke-width="3" opacity="0.4"/>
        <circle cx="200" cy="150" r="60" fill="none" stroke="#f472b6" stroke-width="2" opacity="0.5"/>
        <circle cx="200" cy="150" r="40" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.6"/>
        <circle cx="200" cy="150" r="20" fill="#f9a8d4" opacity="0.3"/>
        <text x="200" y="155" font-family="system-ui" font-size="20" font-weight="300" text-anchor="middle" fill="#4a5568">HALO GLOW</text>
        <text x="200" y="175" font-family="system-ui" font-size="12" text-anchor="middle" fill="#6b7280">Radiant Skin Structure</text>
      </svg>
    `)}`,
    'collagen-complex': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beautyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fdf2f8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f3e8ff;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#beautyGrad)"/>
        <circle cx="80" cy="80" r="25" fill="#ec4899" opacity="0.1"/>
        <circle cx="320" cy="220" r="30" fill="#a855f7" opacity="0.1"/>
        <path d="M150 150 Q200 120 250 150 Q280 180 250 210 Q200 240 150 210 Q120 180 150 150" fill="#f9a8d4" opacity="0.3"/>
        <text x="200" y="160" font-family="system-ui" font-size="24" font-weight="300" text-anchor="middle" fill="#4a5568">GLOW</text>
        <text x="200" y="185" font-family="system-ui" font-size="14" text-anchor="middle" fill="#6b7280">From Within</text>
        <g transform="translate(60,220)">
          <rect width="4" height="20" fill="#ec4899" opacity="0.6"/>
          <rect x="8" width="4" height="25" fill="#f472b6" opacity="0.6"/>
          <rect x="16" width="4" height="15" fill="#fbbf24" opacity="0.6"/>
          <rect x="24" width="4" height="30" fill="#34d399" opacity="0.6"/>
        </g>
      </svg>
    `)}`,
    
    'vitamin-d3': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="immuneGrad" cx="50%" cy="30%" r="50%">
            <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#dbeafe;stop-opacity:1" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="url(#immuneGrad)"/>
        <circle cx="200" cy="80" r="40" fill="#fbbf24" opacity="0.8"/>
        <g transform="translate(200,80)">
          <path d="M-50,0 L-35,-7 L-35,7 Z" fill="#fbbf24"/>
          <path d="M50,0 L35,-7 L35,7 Z" fill="#fbbf24"/>
          <path d="M0,-50 L-7,-35 L7,-35 Z" fill="#fbbf24"/>
          <path d="M0,50 L-7,35 L7,35 Z" fill="#fbbf24"/>
          <path d="M-35,-35 L-42,-28 L-28,-28 Z" fill="#fbbf24"/>
          <path d="M35,35 L42,28 L28,28 Z" fill="#fbbf24"/>
          <path d="M35,-35 L28,-42 L28,-28 Z" fill="#fbbf24"/>
          <path d="M-35,35 L-28,42 L-28,28 Z" fill="#fbbf24"/>
        </g>
        <circle cx="120" cy="180" r="15" fill="#3b82f6" opacity="0.4"/>
        <circle cx="280" cy="200" r="20" fill="#10b981" opacity="0.4"/>
        <text x="200" y="220" font-family="system-ui" font-size="18" font-weight="500" text-anchor="middle" fill="#374151">IMMUNE STRENGTH</text>
      </svg>
    `)}`,
    
    'ashwagandha': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="calmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ecfdf5;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#calmGrad)"/>
        <path d="M100 200 Q150 180 200 200 Q250 220 300 200" stroke="#059669" stroke-width="3" fill="none" opacity="0.7"/>
        <path d="M80 180 Q130 160 180 180 Q230 200 280 180" stroke="#10b981" stroke-width="2" fill="none" opacity="0.5"/>
        <circle cx="200" cy="120" r="60" fill="none" stroke="#065f46" stroke-width="1" opacity="0.3"/>
        <circle cx="200" cy="120" r="40" fill="none" stroke="#047857" stroke-width="1" opacity="0.4"/>
        <circle cx="200" cy="120" r="20" fill="none" stroke="#059669" stroke-width="1" opacity="0.5"/>
        <circle cx="200" cy="120" r="5" fill="#10b981"/>
        <text x="200" y="250" font-family="system-ui" font-size="16" font-weight="400" text-anchor="middle" fill="#374151">STRESS RESILIENCE</text>
      </svg>
    `)}`,
    
    'apple-cider-vinegar': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="digestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fef7ed;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f0fdf4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#digestGrad)"/>
        <ellipse cx="200" cy="150" rx="80" ry="40" fill="#fed7aa" opacity="0.6"/>
        <path d="M160 150 Q180 130 200 150 Q220 170 240 150" stroke="#ea580c" stroke-width="2" fill="none"/>
        <circle cx="150" cy="120" r="8" fill="#fb923c" opacity="0.7"/>
        <circle cx="250" cy="180" r="6" fill="#f97316" opacity="0.7"/>
        <circle cx="180" cy="200" r="4" fill="#fdba74" opacity="0.8"/>
        <text x="200" y="220" font-family="system-ui" font-size="16" font-weight="400" text-anchor="middle" fill="#374151">DIGESTIVE BALANCE</text>
      </svg>
    `)}`,
    
    'magnesium': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sleepGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#312e81;stop-opacity:0.3" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="#f8fafc"/>
        <circle cx="200" cy="150" r="120" fill="url(#sleepGrad)"/>
        <circle cx="150" cy="100" r="3" fill="#fbbf24"/>
        <circle cx="280" cy="130" r="2" fill="#f59e0b"/>
        <circle cx="180" cy="80" r="1.5" fill="#fcd34d"/>
        <circle cx="320" cy="180" r="2.5" fill="#facc15"/>
        <path d="M100 200 Q200 180 300 200" stroke="#6366f1" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M120 220 Q200 200 280 220" stroke="#8b5cf6" stroke-width="1.5" fill="none" opacity="0.4"/>
        <text x="200" y="260" font-family="system-ui" font-size="16" font-weight="400" text-anchor="middle" fill="#374151">RESTFUL SLEEP</text>
      </svg>
    `)}`,
    
    'iron-vitamin-c': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fef2f2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fff7ed;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#energyGrad)"/>
        <path d="M50 150 L100 100 L150 120 L200 80 L250 100 L300 60 L350 80" stroke="#dc2626" stroke-width="3" fill="none"/>
        <circle cx="100" cy="100" r="4" fill="#ef4444"/>
        <circle cx="200" cy="80" r="4" fill="#f97316"/>
        <circle cx="300" cy="60" r="4" fill="#fbbf24"/>
        <polygon points="180,200 200,160 220,200" fill="#dc2626" opacity="0.7"/>
        <polygon points="160,220 180,180 200,220" fill="#ef4444" opacity="0.6"/>
        <polygon points="200,220 220,180 240,220" fill="#f97316" opacity="0.5"/>
        <text x="200" y="260" font-family="system-ui" font-size="16" font-weight="500" text-anchor="middle" fill="#374151">ENERGY & VITALITY</text>
      </svg>
    `)}`,
    
    'folic-acid-400': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="prenatalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fdf2f8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f0f9ff;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#prenatalGrad)"/>
        <circle cx="200" cy="120" r="50" fill="none" stroke="#ec4899" stroke-width="2" opacity="0.6"/>
        <circle cx="200" cy="120" r="30" fill="none" stroke="#f472b6" stroke-width="1.5" opacity="0.7"/>
        <heart cx="200" cy="120" fill="#f9a8d4"/>
        <path d="M180 120 Q190 110 200 120 Q210 110 220 120 Q210 135 200 145 Q190 135 180 120" fill="#f472b6"/>
        <circle cx="120" cy="80" r="8" fill="#fbbf24" opacity="0.4"/>
        <circle cx="280" cy="160" r="10" fill="#34d399" opacity="0.4"/>
        <circle cx="150" cy="200" r="6" fill="#60a5fa" opacity="0.4"/>
        <text x="200" y="250" font-family="system-ui" font-size="16" font-weight="400" text-anchor="middle" fill="#374151">PRENATAL SUPPORT</text>
      </svg>
    `)}`,
    
    'mind-memory-mushroom': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#brainGrad)"/>
        <path d="M120 140 Q160 120 200 140 Q240 120 280 140 Q260 180 200 160 Q140 180 120 140" fill="#6366f1" opacity="0.3"/>
        <circle cx="160" cy="130" r="3" fill="#8b5cf6"/>
        <circle cx="200" cy="140" r="4" fill="#6366f1"/>
        <circle cx="240" cy="130" r="3" fill="#a855f7"/>
        <path d="M150 160 L170 150 L190 160 L210 150 L230 160" stroke="#6366f1" stroke-width="2" fill="none"/>
        <path d="M160 180 L180 170 L200 180 L220 170 L240 180" stroke="#8b5cf6" stroke-width="1.5" fill="none" opacity="0.7"/>
        <text x="200" y="240" font-family="system-ui" font-size="16" font-weight="400" text-anchor="middle" fill="#374151">COGNITIVE CLARITY</text>
      </svg>
    `)}`,
    
    'childrens-multivitamin': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kidsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#dcfce7;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#kidsGrad)"/>
        <circle cx="150" cy="100" r="20" fill="#fbbf24" opacity="0.7"/>
        <circle cx="250" cy="120" r="15" fill="#f59e0b" opacity="0.7"/>
        <rect x="180" y="140" width="40" height="40" rx="8" fill="#10b981" opacity="0.6"/>
        <polygon points="200,200 220,180 240,200 220,220" fill="#3b82f6" opacity="0.6"/>
        <circle cx="120" cy="180" r="12" fill="#ef4444" opacity="0.6"/>
        <circle cx="280" cy="160" r="18" fill="#8b5cf6" opacity="0.6"/>
        <text x="200" y="260" font-family="system-ui" font-size="16" font-weight="500" text-anchor="middle" fill="#374151">GROWING STRONG</text>
      </svg>
    `)}`,
    
    'default': `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#defaultGrad)"/>
        <circle cx="200" cy="150" r="60" fill="none" stroke="#64748b" stroke-width="2" opacity="0.4"/>
        <circle cx="200" cy="150" r="40" fill="none" stroke="#64748b" stroke-width="1.5" opacity="0.5"/>
        <circle cx="200" cy="150" r="20" fill="none" stroke="#64748b" stroke-width="1" opacity="0.6"/>
        <circle cx="200" cy="150" r="5" fill="#64748b"/>
        <text x="200" y="240" font-family="system-ui" font-size="16" font-weight="400" text-anchor="middle" fill="#374151">WELLNESS SUPPORT</text>
      </svg>
    `)}`
  };
  
  return svgs[productId as keyof typeof svgs] || svgs.default;
};

export default function ProductComprehensive() {
  const [, params] = useRoute("/products/:id");
  const { addToCart, removeFromCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [subscriptionMode, setSubscriptionMode] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationFormData, setNotificationFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    agreeToContact: false
  });
  const [bundleAdded, setBundleAdded] = useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleAddToCart = () => {
    if (product) {
      // Add the main product to cart
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      
      // If bundle is selected, add the bundle product too
      if (bundleAdded && allProducts) {
        const productContent = getProductContent(product.id);
        const bundleProduct = allProducts.find(p => p.name === productContent.bundleWith);
        if (bundleProduct) {
          for (let i = 0; i < quantity; i++) {
            addToCart(bundleProduct);
          }
        }
      }
      
      const bundleInfo = bundleAdded ? ' with bundle' : '';
      toast({
        title: "Added to cart!",
        description: `${quantity}x ${product.name}${bundleInfo} has been added to your cart.`,
      });
    }
  };

  const handleToggleBundleProduct = () => {
    if (!product || !allProducts) return;
    
    const productContent = getProductContent(product.id);
    const bundleProduct = allProducts.find(p => p.name === productContent.bundleWith);
    
    if (bundleProduct && bundleProduct.inStock) {
      if (bundleAdded) {
        setBundleAdded(false);
        toast({
          title: "Bundle removed",
          description: `${bundleProduct.name} has been removed from your bundle selection.`,
        });
      } else {
        setBundleAdded(true);
        toast({
          title: "Bundle added!",
          description: `${bundleProduct.name} has been added to your bundle selection.`,
        });
      }
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationFormData.email || !notificationFormData.agreeToContact) {
      toast({
        title: "Missing Information",
        description: "Please fill in your email address and agree to our contact terms.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/restock-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notificationFormData,
          productId: product?.id,
          productName: product?.name,
          requestedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast({
          title: "Notification Set!",
          description: `We'll email you when ${product?.name} is back in stock.`
        });
        setShowNotificationModal(false);
        setNotificationFormData({
          email: '',
          firstName: '',
          lastName: '',
          agreeToContact: false
        });
      } else {
        throw new Error('Failed to set notification');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getBundleDiscountPrice = () => {
    if (!product || !bundleAdded) return null;
    
    const productContent = getProductContent(product.id);
    const bundlePrice = parseFloat(productContent.bundlePrice.replace('R', ''));
    const originalPrice = parseFloat(productContent.bundleOriginalPrice.replace('R', ''));
    const discount = originalPrice - bundlePrice;
    
    // The bundle price is for both products combined, so we need to calculate the discounted price per main product
    const mainProductPrice = parseFloat(subscriptionPrice);
    const bundleProductPrice = bundlePrice - mainProductPrice;
    
    return {
      bundlePrice: bundlePrice,
      originalPrice: originalPrice,
      discount: discount,
      mainProductPrice: mainProductPrice,
      bundleProductPrice: bundleProductPrice
    };
  };

  const getBundleProduct = () => {
    if (!product || !allProducts) return null;
    
    const productContent = getProductContent(product.id);
    return allProducts.find(p => p.name === productContent.bundleWith);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Product images - always use the admin-controlled image URL
  const productImages = [
    product.imageUrl
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const subscriptionPrice = subscriptionMode ? (parseFloat(product.price) * 0.8).toFixed(2) : product.price;

  // Product-specific content
  const getProductContent = (productId: string) => {
    switch (productId) {
      case 'apple-cider-vinegar':
        return {
          bundleWith: 'Probiotic + Vitamins Gummies',
          bundlePrice: 'R905.43',
          bundleOriginalPrice: 'R1289.76',
          sectionTitle: 'THE METABOLIC ADVANTAGE',
          sectionHeading: 'Advanced apple cider vinegar\nformulation for digestive wellness\nwithout the acidic burn.',
          stat1Number: '500mg',
          stat1Text: 'Concentrated\nACV Powder',
          stat2Number: '3.0',
          stat2Text: 'pH Level\nAcid-Free',
          stat3Number: '95%',
          stat3Text: 'Stomach\nComfort Rate',
          stat4Number: '100%',
          stat4Text: 'Enamel\nSafe Formula',
          testimonial: '"These gummies give me all the benefits of ACV without the harsh taste or stomach burn. Perfect for my daily wellness routine."',
          testimonialAuthor: 'EMMA THOMPSON',
          testimonialTitle: 'Fitness & Wellness Enthusiast',
          benefitTitle: 'Daily metabolic & gut support',
          benefitDescription: '500mg concentrated Apple Cider Vinegar powder supports digestion and energy metabolism in a stomach-friendly, enamel-safe format.',
          ingredientSource: 'Apple Cider Vinegar powder (concentrated)',
          ingredientForm: 'Strawberry-flavored chewable gummies',
          ingredientOrigin: 'Traditional vinegar benefits without acetic acid harshness',
          sleepBenefit: false,
          primaryBenefit: 'Supports digestion, energy metabolism, and appetite management'
        };
      case 'vitamin-d3':
        return {
          bundleWith: 'Magnesium (Citrate/Glycinate) Gummies (Berry Flavour)',
          bundlePrice: 'R1552.85',
          bundleOriginalPrice: 'R1743.97',
          sectionTitle: 'THE SUNSHINE VITAMIN',
          sectionHeading: 'High-potency 4000 IU vitamin D3\nfor maximum immunity, bone strength\nand muscle function support.',
          stat1Number: '4000 IU',
          stat1Text: 'High-Potency\nDaily Dose',
          stat2Number: '42%',
          stat2Text: 'UK Adults\nDeficient',
          stat3Number: '365',
          stat3Text: 'Days Annual\nSupport',
          stat4Number: 'D3',
          stat4Text: 'Superior\nAbsorption',
          testimonial: '"4000 IU is the optimal therapeutic dose for maintaining healthy vitamin D levels year-round. This high-potency formula is our bestselling vitamin D supplement for good reason."',
          testimonialAuthor: 'DR. SARAH WINTERS',
          testimonialTitle: 'Endocrinologist',
          benefitTitle: 'High-potency immune and bone support',
          benefitDescription: '4000 IU of vitamin D3 provides therapeutic-level support for immune system function, calcium absorption, muscle function, and maintains healthy bones and teeth.',
          ingredientSource: 'Cholecalciferol (Vitamin D3) 100 μg',
          ingredientForm: 'Lemon-flavored chewable gummies',
          ingredientOrigin: 'Bioidentical to sunlight-produced vitamin D',
          sleepBenefit: false,
          primaryBenefit: 'Supports immune function, bone health, and muscle function'
        };
      case 'ashwagandha':
        return {
          bundleWith: 'Magnesium Complex Capsules — 375mg Magnesium + B6 (120 Vegan Capsules)',
          bundlePrice: 'R858.00',
          bundleOriginalPrice: 'R878.00',
          sectionTitle: 'THE CLINICALLY PROVEN ADAPTOGEN',
          sectionHeading: 'Premium KSM-66® ashwagandha extract\nwith 14 years of clinical research\nfor stress relief and cognitive support.',
          stat1Number: '500mg',
          stat1Text: 'KSM-66® Extract\nDaily Dose',
          stat2Number: '50+',
          stat2Text: 'Clinical Studies\nCompleted',
          stat3Number: '14',
          stat3Text: 'Years Research\n& Development',
          stat4Number: '27%',
          stat4Text: 'Cortisol Reduction\nClinically Proven',
          testimonial: '"KSM-66® is the gold standard of ashwagandha extracts. The extensive clinical research demonstrates significant stress reduction and cognitive enhancement benefits. This 500mg dose provides therapeutic-level support."',
          testimonialAuthor: 'DR. SARAH MARTINEZ',
          testimonialTitle: 'Clinical Psychologist & Stress Management Specialist',
          benefitTitle: 'Clinically proven stress relief & cognitive enhancement',
          benefitDescription: '500mg KSM-66® Ashwagandha extract is clinically proven to reduce cortisol levels by up to 27%, supporting stress management, cognitive function, and overall mental wellness.',
          ingredientSource: 'KSM-66® Ashwagandha root extract (Withania somnifera)',
          ingredientForm: 'Vegetarian capsules',
          ingredientOrigin: 'Full-spectrum root extract with 14 years of clinical validation',
          sleepBenefit: true,
          primaryBenefit: 'Clinically proven to reduce stress, support cognitive function, and enhance overall well-being'
        };
      case 'probiotics':
        return {
          bundleWith: 'Apple Cider Vinegar Gummies (Strawberry Flavour)',
          bundlePrice: 'R1385.62',
          bundleOriginalPrice: 'R1576.74',
          sectionTitle: 'THE GUT-IMMUNITY CONNECTION',
          sectionHeading: 'Advanced 10 billion CFU\nprobiotic complex with delayed-release\ntechnology for optimal gut health.',
          stat1Number: '10B',
          stat1Text: 'Live Cultures\nPer Capsule',
          stat2Number: '70%',
          stat2Text: 'Immune System\nin Gut',
          stat3Number: '5',
          stat3Text: 'Targeted\nStrains',
          stat4Number: '100%',
          stat4Text: 'Survivability\nGuaranteed',
          testimonial: '"This 10 billion CFU probiotic complex has completely transformed my digestive health. The delayed-release capsules ensure maximum potency and effectiveness."',
          testimonialAuthor: 'RACHEL THOMPSON',
          testimonialTitle: 'Registered Nutritionist',
          benefitTitle: 'Advanced gut health support',
          benefitDescription: '10 Billion CFU multi-strain probiotic complex in advanced capsule format with delayed-release technology supports digestive health, immune function, and gut microbiome balance.',
          ingredientSource: 'Multi-strain probiotic blend (10 billion CFU)',
          ingredientForm: 'Advanced delayed-release capsules',
          ingredientOrigin: 'Laboratory cultured probiotic strains with survivability guarantee',
          sleepBenefit: false,
          primaryBenefit: 'Supports digestive health, immune function, and gut microbiome balance'
        };
      case 'magnesium':
        return {
          bundleWith: 'Ashwagandha 300mg Gummies (Strawberry Flavour)',
          bundlePrice: 'R1003.38',
          bundleOriginalPrice: 'R1385.62',
          sectionTitle: 'THE RELAXATION MINERAL',
          sectionHeading: 'Premium magnesium citrate\nfor muscle recovery, sleep quality\nand natural stress relief.',
          stat1Number: '90mg',
          stat1Text: 'Bioavailable\nMagnesium',
          stat2Number: '60%',
          stat2Text: 'Adults\nDeficient',
          stat3Number: '300+',
          stat3Text: 'Enzymatic\nReactions',
          stat4Number: '24hr',
          stat4Text: 'Recovery\nSupport',
          testimonial: '"Magnesium citrate in gummy form has transformed my recovery routine. I sleep better and my muscles feel less tense after training."',
          testimonialAuthor: 'DR. JAMES THORNTON',
          testimonialTitle: 'Sports Medicine Specialist',
          benefitTitle: 'Muscles, mind & energy support',
          benefitDescription: '90mg bioavailable magnesium citrate reduces fatigue, supports muscle function, and maintains electrolyte balance in a gentle chewable dose.',
          ingredientSource: 'Magnesium citrate (90mg per gummy)',
          ingredientForm: 'Berry-flavored chewable gummies',
          ingredientOrigin: 'Organic citrate form for superior absorption',
          sleepBenefit: true,
          primaryBenefit: 'Reduces tiredness, supports muscle function and electrolyte balance'
        };
      case 'childrens-multivitamin':
        return {
          bundleWith: 'Vitamin D3 4000 IU Gummies (Lemon Flavour)',
          bundlePrice: 'R764.48',
          bundleOriginalPrice: 'R1098.94',
          sectionTitle: 'THE GROWING YEARS FORMULA',
          sectionHeading: 'Complete multivitamin blend\nspecially formulated for children\naged 3-12 years.',
          stat1Number: '13',
          stat1Text: 'Essential\nNutrients',
          stat2Number: '85%',
          stat2Text: 'Children Need\nSupplementation',
          stat3Number: '3-12',
          stat3Text: 'Years Age\nRange',
          stat4Number: '100%',
          stat4Text: 'Natural Fruit\nFlavors',
          testimonial: '"These gummies are a game-changer for busy parents. My children actually look forward to taking their vitamins now!"',
          testimonialAuthor: 'DR. SARAH JOHNSON',
          testimonialTitle: 'Pediatric Nutritionist',
          benefitTitle: 'Complete daily nutrition for growing bodies',
          benefitDescription: '13 essential vitamins and minerals support immune function, growth, energy metabolism, and cognitive development in children aged 3-12.',
          ingredientSource: 'Premium vitamin and mineral blend',
          ingredientForm: 'Berry-flavored chewable gummies',
          ingredientOrigin: 'EFSA-approved bioavailable sources',
          sleepBenefit: false,
          primaryBenefit: 'Supports healthy growth, immunity, and cognitive development'
        };
      case 'probiotic-vitamins':
        return {
          bundleWith: 'Apple Cider Vinegar Gummies (Strawberry Flavour)',
          bundlePrice: 'R860.04',
          bundleOriginalPrice: 'R1170.61',
          sectionTitle: 'THE ENERGY-GUT NEXUS',
          sectionHeading: 'Revolutionary dual-action formula\ncombining probiotics with B-vitamins\nfor complete wellness support.',
          stat1Number: '3',
          stat1Text: 'Probiotic\nStrains',
          stat2Number: '70%',
          stat2Text: 'Immune Cells\nin Gut',
          stat3Number: 'B+C',
          stat3Text: 'Essential\nVitamins',
          stat4Number: '2in1',
          stat4Text: 'Formula\nAdvantage',
          testimonial: '"This all-in-one formula has transformed my daily wellness routine. I love getting digestive support and vitamins in one delicious gummy."',
          testimonialAuthor: 'DR. MICHELLE TORRES',
          testimonialTitle: 'Integrative Medicine Specialist',
          benefitTitle: 'Gut, immune, and energy support',
          benefitDescription: 'Multi-functional formula combining 3-strain probiotic blend with essential B & C vitamins for comprehensive daily wellness support.',
          ingredientSource: '3-strain probiotic blend + B & C vitamins',
          ingredientForm: 'Pineapple-flavored gummies',
          ingredientOrigin: 'Shelf-stable probiotic cultures with EFSA-approved vitamins',
          sleepBenefit: false,
          primaryBenefit: 'Supports digestive wellness, immune function, and energy metabolism'
        };
      case 'collagen-complex':
        return {
          bundleWith: 'Biotin 10,000 µg Strawberry Gummies',
          bundlePrice: 'R931.71',
          bundleOriginalPrice: 'R1242.28',
          sectionTitle: 'THE BEAUTY FOUNDATION',
          sectionHeading: 'Hydrolysed collagen peptides\nwith vitamin C and beauty minerals\nfor radiant skin and strong nails.',
          stat1Number: '500mg',
          stat1Text: 'Collagen\nPeptides',
          stat2Number: '25',
          stat2Text: 'Years Peak\nProduction',
          stat3Number: '30%',
          stat3Text: 'Body Protein\nCollagen',
          stat4Number: '12',
          stat4Text: 'Weeks Visible\nResults',
          testimonial: '"Consistent collagen supplementation with vitamin C supports the body\'s natural ability to build and maintain healthy skin structure."',
          testimonialAuthor: 'DR. ELENA RODRIGUEZ',
          testimonialTitle: 'Dermatology Nutritionist',
          benefitTitle: 'Beauty from within support',
          benefitDescription: '500mg hydrolysed collagen peptides with vitamin C for collagen formation, plus biotin and selenium for healthy hair, skin, and nails.',
          ingredientSource: 'Hydrolysed bovine collagen + beauty vitamins',
          ingredientForm: 'Orange-flavored chewable gummies',
          ingredientOrigin: 'Premium collagen peptides with EFSA-approved cofactors',
          sleepBenefit: false,
          primaryBenefit: 'Supports healthy skin, hair, nails, and connective tissues'
        };
      case 'biotin-5000':
        return {
          bundleWith: 'Collagen + C + Zinc + Selenium Gummies (Orange Flavour)',
          bundlePrice: 'R1003.38',
          bundleOriginalPrice: 'R1290.06',
          sectionTitle: 'THE KERATIN CATALYST',
          sectionHeading: 'Therapeutic-strength biotin\nfor enhanced hair growth,\nstronger nails, and healthy skin.',
          stat1Number: '5000µg',
          stat1Text: 'High-Potency\nBiotin',
          stat2Number: '10000%',
          stat2Text: 'Daily Value\nNRV',
          stat3Number: '8-12',
          stat3Text: 'Weeks Visible\nResults',
          stat4Number: 'B7',
          stat4Text: 'Essential\nVitamin',
          testimonial: '"High-strength biotin supports keratin production for healthy hair and nails. Consistency is key for visible results within 8-12 weeks."',
          testimonialAuthor: 'DR. SOPHIA CHEN',
          testimonialTitle: 'Trichologist & Hair Health Specialist',
          benefitTitle: 'High-potency beauty support',
          benefitDescription: '5000µg pure biotin (vitamin B7) supports healthy hair strength, skin resilience, and nail integrity with just one daily gummy.',
          ingredientSource: 'Pure biotin (vitamin B7) 5000µg',
          ingredientForm: 'Strawberry-flavored chewable gummies',
          ingredientOrigin: 'High-purity biotin with therapeutic potency',
          sleepBenefit: false,
          primaryBenefit: 'Supports hair strength, skin health, and nail integrity'
        };
      case 'iron-vitamin-c':
        return {
          bundleWith: 'Vitamin D3 4000 IU Gummies (Lemon Flavour)',
          bundlePrice: 'R764.48',
          bundleOriginalPrice: 'R1051.16',
          sectionTitle: 'THE ENERGY PARTNERSHIP',
          sectionHeading: 'Gentle iron with vitamin C\nfor enhanced absorption and\nsustained energy support.',
          stat1Number: '7mg',
          stat1Text: 'Bioavailable\nIron',
          stat2Number: '40mg',
          stat2Text: 'Vitamin C\nBoost',
          stat3Number: '50%',
          stat3Text: 'Better\nAbsorption',
          stat4Number: '25%',
          stat4Text: 'Women\nDeficient',
          testimonial: '"Iron deficiency is incredibly common, especially in women. This gentle formula with vitamin C enhances absorption while minimizing digestive discomfort."',
          testimonialAuthor: 'DR. REBECCA MARTINEZ',
          testimonialTitle: 'Hematology & Women\'s Health Specialist',
          benefitTitle: 'Energy & focus support',
          benefitDescription: '7mg bioavailable iron with 40mg vitamin C supports healthy red blood cell formation, reduces fatigue, and enhances iron absorption.',
          ingredientSource: 'Iron (ferric pyrophosphate) + Vitamin C',
          ingredientForm: 'Cherry-flavored chewable gummies',
          ingredientOrigin: 'Gentle iron form with absorption enhancer',
          sleepBenefit: false,
          primaryBenefit: 'Supports energy levels, focus, and healthy red blood cell formation'
        };
      case 'folic-acid-400':
        return {
          bundleWith: 'Vitamin D3 4000 IU Gummies (Lemon Flavour)',
          bundlePrice: 'R692.81',
          bundleOriginalPrice: 'R955.60',
          sectionTitle: 'THE MATERNAL SHIELD',
          sectionHeading: 'NHS-recommended folic acid\nfor pre-conception and pregnancy\nsupport at optimal dosage.',
          stat1Number: '400µg',
          stat1Text: 'Clinical\nDose',
          stat2Number: '28',
          stat2Text: 'Days Neural\nTube Development',
          stat3Number: '4+',
          stat3Text: 'Weeks Before\nConception',
          stat4Number: 'NHS',
          stat4Text: 'Official\nRecommendation',
          testimonial: '"Folic acid supplementation is crucial for all women of reproductive age. Starting 4+ weeks before conception provides optimal maternal folate status for healthy development."',
          testimonialAuthor: 'DR. SARAH WILLIAMS',
          testimonialTitle: 'Consultant Obstetrician & Maternal-Fetal Medicine',
          benefitTitle: 'Pre-pregnancy & prenatal support',
          benefitDescription: '400µg folic acid supports maternal tissue growth during pregnancy and contributes to normal blood formation and psychological function.',
          ingredientSource: 'Folic acid (vitamin B9) 400µg',
          ingredientForm: 'Berry-flavored chewable gummies',
          ingredientOrigin: 'NHS-recommended clinical dose',
          sleepBenefit: false,
          primaryBenefit: 'Supports maternal folate status and tissue growth during pregnancy'
        };
      case 'mind-memory-mushroom':
        return {
          bundleWith: 'Vitamin D3 4000 IU Gummies (Lemon Flavour)',
          bundlePrice: 'R629.99',
          bundleOriginalPrice: 'R849.97',
          sectionTitle: 'THE COGNITIVE ADVANTAGE',
          sectionHeading: 'Powerful Lion\'s Mane mushroom extract\nfor brain health, focus, and memory\nsupport in delicious berry gummies.',
          stat1Number: '2000mg',
          stat1Text: 'Fruiting Body\nEquivalent',
          stat2Number: '10:1',
          stat2Text: 'High-Strength\nExtract',
          stat3Number: '60',
          stat3Text: 'Days\nSupply',
          stat4Number: '1 in 3',
          stat4Text: 'UK Adults Struggle\nwith Memory',
          testimonial: '"Lion\'s Mane is one of the most researched nootropic mushrooms for cognitive function. This high-strength extract provides clinically relevant doses for neurogenesis support."',
          testimonialAuthor: 'DR. MICHAEL CHEN',
          testimonialTitle: 'Neurologist & Functional Medicine Specialist',
          benefitTitle: 'Brain health, focus & memory support',
          benefitDescription: '200mg 10:1 Lion\'s Mane extract (equivalent to 2000mg dried mushroom) supports neurogenesis, memory, focus, and cognitive performance through bioactive hericenones and erinacines.',
          ingredientSource: 'Lion\'s Mane (Hericium erinaceus) fruit body extract',
          ingredientForm: 'Berry-flavored vegan gummies',
          ingredientOrigin: 'Premium fruiting body extract with standardized compounds',
          sleepBenefit: false,
          primaryBenefit: 'Supports memory, focus, mental clarity, and cognitive performance'
        };
      case 'collagen-powder':
        return {
          bundleWith: 'Biotin 10,000 µg Strawberry Gummies',
          bundlePrice: 'R759.99',
          bundleOriginalPrice: 'R959.97',
          sectionTitle: 'THE BEAUTY FOUNDATION',
          sectionHeading: 'Pure marine collagen powder\nfor skin elasticity, hair strength\nand nail vitality from within.',
          stat1Number: '10g',
          stat1Text: 'Pure Collagen\nPer Serving',
          stat2Number: 'Type I & III',
          stat2Text: 'Marine Collagen\nPeptides',
          stat3Number: '90%',
          stat3Text: 'Absorption\nRate',
          stat4Number: '100%',
          stat4Text: 'Unflavoured\n& Dissolves',
          testimonial: '"Marine collagen provides the highest bioavailability of Type I and III collagen peptides. This unflavoured powder dissolves completely in any beverage for convenient daily beauty support."',
          testimonialAuthor: 'DR. AMANDA FOSTER',
          testimonialTitle: 'Dermatologist & Anti-Aging Specialist',
          benefitTitle: 'Pure marine collagen for beauty support',
          benefitDescription: '10g pure hydrolysed marine collagen peptides support skin elasticity, hair strength, nail vitality and joint health. Unflavoured powder dissolves easily in hot or cold drinks.',
          ingredientSource: 'Hydrolysed marine collagen peptides (Type I & III)',
          ingredientForm: 'Unflavoured powder',
          ingredientOrigin: 'Sustainably sourced marine collagen with high bioavailability',
          sleepBenefit: false,
          primaryBenefit: 'Supports skin elasticity, hair strength, nail vitality and joint health'
        };
      default:
        return {
          bundleWith: 'Premium Wellness Bundle',
          bundlePrice: '£65.00',
          bundleOriginalPrice: '£73.00',
          statisticNumber: '85%',
          statisticText: 'of people report improved wellness with consistent supplementation',
          testimonial: '"This supplement has become an essential part of my daily wellness routine."',
          testimonialAuthor: 'WELLNESS EXPERT',
          testimonialTitle: 'Health Professional',
          benefitTitle: 'Daily wellness support',
          benefitDescription: 'Carefully formulated to support your daily wellness routine.',
          ingredientSource: 'Premium quality ingredients',
          ingredientForm: 'Optimized delivery format',
          ingredientOrigin: 'Ethically sourced',
          sleepBenefit: false,
          primaryBenefit: 'Supports overall wellness and vitality'
        };
    }
  };

  const productContent = getProductContent(product.id);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${product.name} | Healios`}
        description={product.description}
      />
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 mb-16">
          {/* Image Carousel */}
          <div className="mb-8 lg:mb-0">
            <div className="relative bg-gray-100 aspect-square mb-4">
              {/* Main Image */}
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows - only show if multiple images */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-black text-white">
                  BEST BUY
                </Badge>
              </div>
            </div>

            {/* Thumbnail Images - only show if multiple images */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 border-2 ${
                      index === currentImageIndex ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quality Commitments */}
            <div className="grid grid-cols-2 gap-4 text-xs mt-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">THIRD-PARTY TESTED</p>
                  <p className="text-gray-600">Every batch tested for purity, potency, and heavy metals by independent labs</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">SCIENCE-BACKED FORMULAS</p>
                  <p className="text-gray-600">Dosages based on clinical research and EFSA-approved health claims</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">NO ARTIFICIAL NASTIES</p>
                  <p className="text-gray-600">Free from artificial colors, flavors, preservatives, and unnecessary fillers</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">SUSTAINABLE SOURCING</p>
                  <p className="text-gray-600">Responsibly sourced ingredients with ethical supply chain practices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Title and Basic Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
              
              {/* Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${
                      i < Math.floor(parseFloat(product.rating || "0"))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.rating} ({product.reviewCount} Reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-light text-gray-900 dark:text-white">
                  R{product.price}
                </span>
              </div>

              {/* Supply Information Badges - Only for supplements */}
              {product.type === 'supplement' && product.bottleCount && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="bg-black text-white px-2 py-1 text-xs font-medium">
                    {product.bottleCount} {getProductUnit(product)}
                  </div>
                  <div className="bg-gray-800 text-white px-2 py-1 text-xs font-medium">
                    {product.dailyDosage} per day
                  </div>
                  <div className="bg-white border border-black text-black px-2 py-1 text-xs font-medium">
                    {product.supplyDays}-day supply
                  </div>
                  <button 
                    onClick={() => setShowNotificationModal(true)}
                    className="bg-gray-100 hover:bg-gray-200 p-2 transition-colors border border-gray-300"
                    title="Set reorder reminder"
                  >
                    <Bell className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              )}

              {/* Restock Notification Modal */}
              {showNotificationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                  <div className="bg-white dark:bg-gray-800 p-6 max-w-md w-full">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                      {product.inStock ? 'Reorder Reminder' : 'Back in Stock Notification'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      {product.inStock 
                        ? (product.type === 'supplement' && product.supplyDays ? `Get notified 10 days before your ${product.supplyDays}-day supply runs out.` : 'Get notified when it\'s time to reorder.')
                        : `We'll email you as soon as ${product.name} is back in stock.`
                      }
                    </p>
                    
                    <form onSubmit={handleNotificationSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="First name"
                          value={notificationFormData.firstName}
                          onChange={(e) => setNotificationFormData({...notificationFormData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Last name"
                          value={notificationFormData.lastName}
                          onChange={(e) => setNotificationFormData({...notificationFormData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <input
                        type="email"
                        placeholder="Email address*"
                        value={notificationFormData.email}
                        onChange={(e) => setNotificationFormData({...notificationFormData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                      
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationFormData.agreeToContact}
                            onChange={(e) => setNotificationFormData({...notificationFormData, agreeToContact: e.target.checked})}
                            className="mt-1 w-4 h-4 text-black focus:ring-black border-gray-300"
                            required
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            I agree to receive product availability notifications and marketing communications from Healios. 
                            You can unsubscribe at any time. View our{" "}
                            <a href="/privacy-policy" className="underline hover:no-underline" target="_blank">Privacy Policy</a>.
                          </span>
                        </label>
                      </div>
                    
                      <div className="flex gap-3 pt-2">
                        <button 
                          type="submit"
                          className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors flex-1"
                        >
                          {product.inStock ? 'Set Reminder' : 'Notify Me'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowNotificationModal(false)}
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
            {/* Better Together Section - Only show for non-Children products and if recommended product is in stock */}
            {!product.categories.includes("Children") && (() => {
              const bundleProduct = allProducts?.find(p => p.name === productContent.bundleWith);
              const showBundleSection = bundleProduct && bundleProduct.inStock;
              
              if (!showBundleSection) return null;
              
              return (
                <div className="border border-gray-200 p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-medium">
                      +
                    </div>
                    <h3 className="font-medium text-sm">Better Together</h3>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-4">Expert Nutritionists Recommend This Combination</p>
                  
                  <div className="space-y-3">
                    {/* Current Product */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50">
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{product.name}</p>
                        <p className="text-xs text-gray-600">R{product.price}</p>
                      </div>
                      <div className="text-xs text-gray-500">{bundleAdded ? '✓ Added to cart' : ''}</div>
                    </div>

                    {/* Recommended Product */}
                    <div className="flex items-center gap-3 p-3 border border-gray-200">
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center cursor-pointer" onClick={() => setShowBundleModal(true)}>
                        {bundleAdded ? <Check className="w-4 h-4 text-green-600" /> : <Plus className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 cursor-pointer" onClick={() => setShowBundleModal(true)}>
                        <p className="text-xs font-medium">{productContent.bundleWith}</p>
                        <p className="text-xs text-gray-600">Recommended for enhanced benefits</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-black text-white px-3 py-1 text-xs hover:bg-gray-800"
                        onClick={handleToggleBundleProduct}
                      >
                        {bundleAdded ? 'Remove' : 'Add'}
                      </Button>
                    </div>

                    {/* Bundle Benefits */}
                    <div className="bg-green-50 border border-green-200 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-xs font-medium text-green-800">Bundle Benefits</p>
                      </div>
                      <p className="text-xs text-green-700">
                        {product.id === 'apple-cider-vinegar' && 'ACV supports metabolism while probiotics enhance gut health for comprehensive digestive wellness.'}
                        {product.id === 'vitamin-d3' && 'Vitamin D aids calcium absorption while magnesium supports muscle function and bone health.'}
                        {product.id === 'ashwagandha' && 'Ashwagandha calms the mind while magnesium relaxes muscles for complete stress relief.'}
                        {product.id === 'magnesium' && 'Magnesium supports muscle function while ashwagandha helps manage stress for better recovery.'}
                        {product.id === 'collagen-complex' && 'Collagen supports skin structure while biotin enhances hair and nail strength.'}
                        {product.id === 'biotin-5000' && 'High-dose biotin for hair while collagen supports skin elasticity and nail strength.'}
                        {product.id === 'iron-vitamin-c' && 'Iron supports energy while vitamin D maintains immune function for vitality.'}
                        {product.id === 'folic-acid-400' && 'Folic acid supports neural development while vitamin D aids calcium absorption during pregnancy.'}
                        {product.id === 'probiotic-vitamins' && 'Probiotics for gut health combined with ACV for metabolism creates complete digestive support.'}
                        {(!['apple-cider-vinegar', 'vitamin-d3', 'ashwagandha', 'magnesium', 'collagen-complex', 'biotin-5000', 'iron-vitamin-c', 'folic-acid-400', 'probiotic-vitamins'].includes(product.id)) && 'These products work synergistically to support your wellness goals.'}
                      </p>
                    </div>

                    {/* Bundle Pricing */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="text-xs">
                        <p className="font-medium">Bundle Price: {productContent.bundlePrice}</p>
                        <p className="text-gray-600 line-through">{productContent.bundleOriginalPrice}</p>
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        Save R{(parseFloat(productContent.bundleOriginalPrice.replace('R', '')) - parseFloat(productContent.bundlePrice.replace('R', ''))).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Special Discount Section - Only for Children products */}
            {product.categories.includes("Children") && (
              <div className="border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 mb-6">
                <div className="text-center">
                  <h3 className="font-medium text-sm mb-2">Stock Up & Save</h3>
                  <p className="text-xs text-gray-600 mb-4">Buy 2 or more and save 20%</p>
                  
                  <div className="bg-white p-3 mb-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-left">
                        <p className="text-xs text-gray-600">2 Bottles</p>
                        <p className="text-sm font-medium text-gray-900">
                          Regular: R{(parseFloat(product.price) * 2).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-600">20% Off</p>
                        <p className="text-sm font-medium text-green-600">
                          You Pay: R{(parseFloat(product.price) * 2 * 0.8).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-green-600 text-center">
                      Save R{(parseFloat(product.price) * 2 * 0.2).toFixed(2)}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            {product.inStock ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800"
                >
                  {bundleAdded && getBundleDiscountPrice() ? (
                    <>
                      ADD TO BASKET - R{(getBundleDiscountPrice()!.bundlePrice * quantity).toFixed(2)} 
                      <span className="text-xs ml-2 opacity-75">(Save R{(getBundleDiscountPrice()!.discount * quantity).toFixed(2)})</span>
                    </>
                  ) : (
                    `ADD TO BASKET - R${(parseFloat(subscriptionPrice) * quantity).toFixed(2)}`
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {product.id === 'childrens-multivitamin' ? (
                  <div className="bg-red-50 border border-red-200 p-4 text-center">
                    <p className="text-red-800 font-medium text-sm">Preorder Cap Reached</p>
                    <p className="text-red-600 text-xs mt-1">We've reached maximum pre-orders for this product</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-red-50 border border-red-200 p-4 text-center">
                      <p className="text-red-800 font-medium text-sm">Currently Sold Out</p>
                      <p className="text-red-600 text-xs mt-1">We're working hard to restock this popular product</p>
                    </div>
                    
                    <Button 
                      onClick={() => setShowPreOrderModal(true)}
                      className="w-full bg-red-600 text-white py-3 text-sm font-medium hover:bg-black hover:text-white"
                    >
                      PRE-ORDER NOW
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Subscription Section - Show for products that support subscriptions */}
            {product.inStock && (() => {
              // Check if this product has subscription-enabled variants
              const subscriptionVariant = allProducts?.find(p => p.id === product.id)?.variants?.find(v => v.isSubscriptionAvailable);
              
              if (!subscriptionVariant) return null;
              
              return (
                <div className="mb-6">
                  <SubscriptionSection 
                    variant={subscriptionVariant} 
                    productName={product.name} 
                  />
                </div>
              );
            })()}

            {/* Expandable Sections */}
            <div className="space-y-2">
              {['DESCRIPTION', 'NUTRITIONAL INFORMATION', 'INGREDIENTS', 'HOW TO TAKE', 'PACKAGE INFORMATION', 'FAQS', 'SHIPPING AND RETURNS'].map((section) => (
                <div key={section} className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                    className="w-full py-4 text-left flex items-center justify-between text-sm font-medium"
                  >
                    {section}
                    <Plus className={`w-4 h-4 transition-transform ${expandedSection === section ? 'rotate-45' : ''}`} />
                  </button>
                  {expandedSection === section && (
                    <div className="pb-4 text-sm text-gray-600">
                      {section === 'DESCRIPTION' && (
                        <p>{product.description}</p>
                      )}
                      {section === 'NUTRITIONAL INFORMATION' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (Daily Values for Children):</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                <div className="font-medium">Vitamin A: 400μg (50% NRV)</div>
                                <div className="font-medium">Vitamin D2: 5μg (100% NRV)</div>
                                <div className="font-medium">Vitamin E: 6mg (50% NRV)</div>
                                <div className="font-medium">Vitamin C: 40mg (50% NRV)</div>
                                <div className="font-medium">Niacin (B3): 8mg (50% NRV)</div>
                                <div className="font-medium">Pantothenic Acid: 3mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B6: 0.7mg (50% NRV)</div>
                                <div className="font-medium">Folic Acid: 100μg (50% NRV)</div>
                                <div className="font-medium">Vitamin B12: 1.25μg (50% NRV)</div>
                                <div className="font-medium">Biotin: 25μg (50% NRV)</div>
                                <div className="font-medium">Zinc: 5mg (50% NRV)</div>
                                <div className="font-medium">Iodine: 75μg (50% NRV)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value</p>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Vitamin D3 (cholecalciferol): 100 μg (4000 IU) - 2000% NRV</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value. 4000 IU is a high-potency therapeutic dose for optimal vitamin D levels.</p>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (Vitamins Only - EFSA Approved):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Vitamin B3 (Niacin): 8mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B5 (Pantothenic Acid): 3mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B6: 0.7mg (50% NRV)</div>
                                <div className="font-medium">Vitamin C: 40mg (50% NRV)</div>
                                <div className="font-medium">Probiotic Blend: 3-strain proprietary blend</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value. EFSA health claims apply to vitamin content only. Probiotic efficacy may vary between individuals.</p>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (Take 2 daily for full dose):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Collagen (hydrolysed bovine): 500mg per gummy</div>
                                <div className="font-medium">Vitamin C: 40mg (50% NRV)</div>
                                <div className="font-medium">Vitamin A: 400μg (50% NRV)</div>
                                <div className="font-medium">Vitamin E: 6mg (50% NRV)</div>
                                <div className="font-medium">Biotin: 25μg (50% NRV)</div>
                                <div className="font-medium">Vitamin B6: 0.7mg (50% NRV)</div>
                                <div className="font-medium">Vitamin B12: 1.25μg (50% NRV)</div>
                                <div className="font-medium">Selenium: 27.5μg (50% NRV)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value. EFSA health claims apply to vitamin content only. Collagen benefits require consistent 60+ day use.</p>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (One daily dose):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Biotin (Vitamin B7): 5000μg (10,000% NRV)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value. High doses of biotin may interfere with blood test results. Inform your doctor before lab testing.</p>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Magnesium (citrate): 90mg (24% NRV)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value. Adults can take 1-2 gummies daily. Do not exceed 3 gummies per day.</p>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Iron (ferric pyrophosphate): 7mg (50% NRV)</div>
                                <div className="font-medium">Vitamin C (ascorbic acid): 40mg (50% NRV)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value. Adults and teens 12+: 1-2 gummies daily. Keep out of reach of children.</p>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy (NHS-recommended dose):</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Folic Acid (Vitamin B9): 400µg (200% NRV)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*NRV = Nutrient Reference Value. This is the gold-standard dose recommended by NHS and global maternity guidelines.</p>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Ashwagandha Root Extract: 300mg</div>
                                <div className="text-sm text-gray-600">(Withania somnifera, standardized to 5% withanolides)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">Traditional adaptogenic herb. No EFSA health claims authorized for ashwagandha - general wellbeing support only.</p>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-3">Per Gummy:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Apple Cider Vinegar (powder): 500mg</div>
                                <div className="text-sm text-gray-600">(Concentrated equivalent without harsh acetic acid)</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">No EFSA health claims authorized for ACV. Traditional wellness use only. Enamel-safe format vs liquid vinegar.</p>
                            </div>
                          ) : product.id === 'mind-memory-mushroom' ? (
                            <div>
                              <p className="font-medium mb-3">Per 2 gummies:</p>
                              <div className="text-sm space-y-1">
                                <div className="font-medium">Lion's Mane (Hericium erinaceus) fruit body extract (10:1): 200mg</div>
                                <div className="font-medium">Equivalent to dried mushroom: 2000mg</div>
                                <div className="font-medium">Energy: 14 Kcal (62.32 KJ)</div>
                                <div className="font-medium">Sugars: 3.64g</div>
                                <div className="font-medium">Carbohydrates: 3.92g</div>
                                <div className="font-medium">Fat: 0.012g (saturated: 0.012g)</div>
                                <div className="font-medium">Fibre: 0.12g</div>
                                <div className="font-medium">Salt: 0.02g</div>
                                <div className="font-medium">Protein: 0g</div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">*200mg of 10:1 extract provides the equivalent of 2000mg dried Lion's Mane mushroom. Clinically relevant dosage for cognitive support.</p>
                            </div>
                          ) : product.id === 'collagen-powder' ? (
                            <div>
                              <p className="font-medium mb-3">Nutritional Information (Per 2.5g serving):</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-2 font-medium">Nutrient</th>
                                      <th className="text-right py-2 font-medium">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="space-y-1">
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2">Hydrolysed collagen peptides</td>
                                      <td className="text-right py-2 font-medium">2500mg</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2">Energy</td>
                                      <td className="text-right py-2 font-medium">36 kJ / 9 kcal</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2">Protein</td>
                                      <td className="text-right py-2 font-medium">2.25g</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2">Fat</td>
                                      <td className="text-right py-2 font-medium">0g</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2">Carbohydrates</td>
                                      <td className="text-right py-2 font-medium">0g</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2">Salt</td>
                                      <td className="text-right py-2 font-medium">0g</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className="mt-4">
                                <p className="font-medium mb-2">Ingredients:</p>
                                <p className="text-sm text-gray-600">Hydrolysed collagen peptides (from bovine origin).</p>
                                <p className="text-xs text-gray-500 mt-1">Allergens: None declared. Manufactured in a facility with validated allergen controls.</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p>Per serving nutritional information:</p>
                              <ul className="mt-2 space-y-1">
                                <li>• Active ingredients clearly listed</li>
                                <li>• Third-party tested for purity</li>
                                <li>• No artificial fillers or preservatives</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {section === 'INGREDIENTS' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-2">Berry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Vitamin A (retinyl acetate)</li>
                                <li>• Vitamin D2 (ergocalciferol)</li>
                                <li>• Vitamin E (d-alpha tocopherol)</li>
                                <li>• Vitamin C (ascorbic acid)</li>
                                <li>• B-Complex vitamins (B3, B5, B6, B12, Biotin, Folic Acid)</li>
                                <li>• Zinc (zinc citrate)</li>
                                <li>• Iodine (potassium iodide)</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Gelatin-free, lactose-free, gluten-free formulation suitable for vegetarians.</p>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-2">Lemon-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Cholecalciferol (Vitamin D3) - most bioavailable form</li>
                                <li>• Natural lemon flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Suitable for vegetarians. Cholecalciferol is identical to the form produced by skin exposure to sunlight.</p>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-2">Pineapple-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Bifidobacterium infantis (probiotic strain)</li>
                                <li>• Lactobacillus casei (probiotic strain)</li>
                                <li>• Lactobacillus rhamnosus (probiotic strain)</li>
                                <li>• Vitamin B3 (Niacin)</li>
                                <li>• Vitamin B5 (Pantothenic Acid)</li>
                                <li>• Vitamin B6</li>
                                <li>• Vitamin C (Ascorbic Acid)</li>
                                <li>• Natural pineapple flavoring</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Gelatin-free, vegetarian formulation. Probiotic cultures are shelf-stable in low-water gummy matrix.</p>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-2">Orange-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Hydrolysed bovine collagen peptides (500mg per gummy)</li>
                                <li>• Vitamin C (ascorbic acid) - for collagen formation</li>
                                <li>• Vitamin A (retinyl acetate) - for skin maintenance</li>
                                <li>• Vitamin E (d-alpha tocopherol) - antioxidant protection</li>
                                <li>• Biotin - for hair and skin health</li>
                                <li>• Selenium - cellular antioxidant defence</li>
                                <li>• B-vitamins (B6, B12) - energy metabolism</li>
                                <li>• Natural orange flavoring</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Contains bovine-derived collagen. Not suitable for vegans but suitable for vegetarians. Non-gelatin formulation.</p>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-2">Strawberry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Pure biotin (vitamin B7) - 5000μg therapeutic dose</li>
                                <li>• Natural strawberry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Gelatin-free, suitable for vegetarians and vegans. Free from gluten, dairy, and major allergens.</p>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-2">Berry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Magnesium citrate (90mg per gummy) - highly bioavailable organic form</li>
                                <li>• Natural berry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and low-sugar formulation</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Vegetarian formulation with superior citrate absorption. Gentle on the digestive system.</p>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-2">Cherry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Iron (ferric pyrophosphate) - gentle, low-irritation form vs ferrous sulfate</li>
                                <li>• Vitamin C (ascorbic acid) - enhances iron absorption by up to 50%</li>
                                <li>• Natural cherry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Vegetarian formulation with reduced metallic aftertaste. Gentle on stomach compared to traditional iron tablets.</p>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-2">Berry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Folic acid (vitamin B9) - 400µg clinical dose</li>
                                <li>• Natural berry flavoring</li>
                                <li>• Pectin (vegetarian gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                                <li>• Child-safe formulation</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Vegetarian formulation specifically designed for prenatal safety. High compliance gummy format vs traditional tablets.</p>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-2">Strawberry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Ashwagandha root extract (Withania somnifera) - 300mg standardized to 5% withanolides</li>
                                <li>• Natural strawberry flavoring</li>
                                <li>• Pectin (vegan gelling agent)</li>
                                <li>• Natural colors and sweeteners</li>
                                <li>• Gluten-free, gelatin-free formulation</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Vegan formulation suitable for daily use. Traditional Ayurvedic herb with 3,000+ years of traditional wellness use.</p>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-2">Strawberry-flavored gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Apple Cider Vinegar powder (concentrated) - 500mg</li>
                                <li>• Natural strawberry flavoring</li>
                                <li>• Pectin (vegan gelling agent)</li>
                                <li>• Natural fruit colors</li>
                                <li>• Natural sweeteners (no artificial sugars)</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Vegan, enamel-safe formulation. Delivers traditional ACV benefits without stomach burn or tooth erosion.</p>
                            </div>
                          ) : product.id === 'mind-memory-mushroom' ? (
                            <div>
                              <p className="font-medium mb-2">Berry-flavored vegan gummy base with:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• Glucose Syrup</li>
                                <li>• Sugar</li>
                                <li>• Water</li>
                                <li>• Lion's Mane (Hericium erinaceus) Fruit Body Extract (10:1)</li>
                                <li>• Pectin (Gelling Agent)</li>
                                <li>• Citric Acid</li>
                                <li>• Trisodium Citrate</li>
                                <li>• Anthocyanins (Natural Colour)</li>
                                <li>• Coconut Oil</li>
                                <li>• Natural Berry Flavour</li>
                                <li>• Carnauba Wax</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Allergens: None declared. Manufactured under strict allergen control protocols. 100% vegan formulation.</p>
                            </div>
                          ) : (
                            <p>Ingredients Hydrolysed Bovine Collagen Peptides (100%) • No additives, flavourings, preservatives or fillers • Non-GMO | Clean label | Neutral in taste and odour  Allergens: None declared. Manufactured in a facility with strict allergen control procedures</p>
                          )}
                        </div>
                      )}
                      {section === 'HOW TO TAKE' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 3-8:</strong> 1 gummy per day</li>
                                <li>• <strong>Ages 9+:</strong> 2 gummies per day</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Take with or without food. Do not exceed recommended dosage. Keep out of reach of children under 3 years.</p>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-2">Daily dosing for adults and teens 12+:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy per day</strong></li>
                                <li>• Can be taken with or without food</li>
                                <li>• Ideal for daily use year-round</li>
                                <li>• Do not exceed recommended dose unless advised by healthcare provider</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 12 unless supervised by a healthcare provider. Consult your GP if taking other vitamin D supplements.</p>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 4-8:</strong> 1 gummy per day</li>
                                <li>• <strong>Ages 9+ and adults:</strong> 2 gummies per day</li>
                                <li>• Best taken in the morning with or without food</li>
                                <li>• Store in cool, dry place to preserve probiotic viability</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 4 years. Consult healthcare provider if taking antibiotics or have compromised immune system.</p>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-2">Adult dosing (18+ years):</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 2 gummies daily</strong> for full 1000mg collagen dose</li>
                                <li>• Can be taken at any time with or without food</li>
                                <li>• Allow minimum 60 days consistent use for visible results</li>
                                <li>• Store below 25°C in dry conditions</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable for pregnant or breastfeeding unless advised by healthcare provider. Contains bovine collagen.</p>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-2">Adult dosing (18+ years):</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy daily</strong> - no more needed</li>
                                <li>• Can be taken with or without food</li>
                                <li>• Recommended minimum 8 weeks for noticeable benefits</li>
                                <li>• Store in cool, dry place below 25°C</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable for children or during pregnancy/lactation without professional advice. Inform healthcare provider before blood tests.</p>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 9-18:</strong> 1 gummy per day</li>
                                <li>• <strong>Adults:</strong> 1-2 gummies per day (do not exceed 3)</li>
                                <li>• Take with water, ideally away from calcium-heavy meals</li>
                                <li>• Evening use may support sleep quality</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Suitable for ages 9+. Start with 1 gummy to assess tolerance. May have laxative effect in high doses.</p>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-2">Age-specific dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Ages 12-18:</strong> 1 gummy per day</li>
                                <li>• <strong>Adults:</strong> 1-2 gummies daily depending on iron status</li>
                                <li>• Take with or without food, but avoid calcium-rich meals within 1 hour</li>
                                <li>• Take consistently for 6-12 weeks for maximum benefit</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 12. Keep out of reach of children. Do not exceed recommended dose unless advised by healthcare professional.</p>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-2">Pre-pregnancy & prenatal dosing:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy daily</strong> - standard NHS-recommended dose</li>
                                <li>• Start at least 4+ weeks before trying to conceive</li>
                                <li>• Continue daily throughout first trimester (12 weeks)</li>
                                <li>• Can be taken with or without food</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Women aged 18-40 planning pregnancy. If pregnant, consult doctor before taking new supplements. Do not exceed 1000µg daily unless advised.</p>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-2">Adult dosing (18+ years only):</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1 gummy daily</strong> - consistent timing recommended</li>
                                <li>• Best taken in morning or early evening with food</li>
                                <li>• Effects may take 2-4 weeks to manifest</li>
                                <li>• Safe for long-term daily use up to 3 months, then cycle if needed</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable during pregnancy/breastfeeding. Consult doctor if taking thyroid, blood pressure, or psychoactive medications.</p>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-2">Pre-meal dosing for optimal support:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Take 1-2 gummies daily</strong> preferably 15-30 minutes before meals</li>
                                <li>• Do not exceed 3 gummies per day</li>
                                <li>• Best taken with water to aid digestion</li>
                                <li>• Can be taken on empty stomach (unlike liquid ACV)</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Not suitable for children under 12. May cause mild digestive upset if taken in excess. Start with 1 gummy to assess tolerance.</p>
                            </div>
                          ) : product.id === 'mind-memory-mushroom' ? (
                            <div>
                              <p className="font-medium mb-2">Adult dosing (18+ years):</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Chew two (2) gummies daily</strong> - optimal therapeutic dose</li>
                                <li>• Do not exceed the stated dose</li>
                                <li>• Gummies should be chewed, not swallowed whole</li>
                                <li>• Can be taken with or without food</li>
                                <li>• Consistent daily use recommended for best results</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable for children. Some benefits may be noticed within weeks, but optimal cognitive support typically develops over 4-6 weeks of consistent use.</p>
                            </div>
                          ) : product.id === 'collagen-powder' ? (
                            <div>
                              <p className="font-medium mb-2">Daily dosing for adults:</p>
                              <ul className="space-y-1 text-sm">
                                <li>• <strong>Mix one 2.5g scoop with water, juice, coffee or your smoothie</strong></li>
                                <li>• <strong>Take once daily, with or without food</strong></li>
                                <li>• Dissolves completely with no taste or texture</li>
                                <li>• Store in a cool, dry place</li>
                              </ul>
                              <p className="mt-2 text-sm text-gray-600">Adults only. Not suitable for vegetarians or vegans. Consult healthcare provider if pregnant, breastfeeding, or taking medication.</p>
                            </div>
                          ) : (
                            <p>Add one scoop (2.5g) to a glass of water, coffee, smoothie, or yoghurt. Consume once daily. Do not exceed the stated dose. Best results occur with daily use for 8–12 weeks.</p>
                          )}
                        </div>
                      )}
                      {section === 'PACKAGE INFORMATION' && (
                        <div>
                          <p className="font-medium mb-3">Package Design & Regional Variations:</p>
                          <div className="space-y-3 text-sm text-gray-600">
                            <p>
                              <strong>Product packaging may vary</strong> from the images shown due to:
                            </p>
                            <ul className="space-y-2 ml-4">
                              <li>• <strong>Regional distribution requirements</strong> - Package design may differ between countries to meet local regulatory standards and language requirements</li>
                              <li>• <strong>Design updates and improvements</strong> - We continuously enhance our packaging design, sustainability materials, and product presentation</li>
                              <li>• <strong>Supply chain optimization</strong> - Manufacturing locations may vary to ensure product freshness and reduce environmental impact</li>
                              <li>• <strong>Batch variations</strong> - Minor differences in color, texture, or appearance may occur between production batches while maintaining identical formulation</li>
                            </ul>
                            <div className="bg-gray-50 p-3 border border-gray-200 mt-4">
                              <p className="text-sm">
                                <strong>Quality Guarantee:</strong> Regardless of packaging appearance, all products maintain the same high-quality formulation, potency, and safety standards. Product contents, nutritional values, and active ingredients remain consistent across all package variations.
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                              If you receive a product with packaging that differs from our website images, rest assured the contents and quality remain identical. Contact our support team if you have any concerns about your product.
                            </p>
                          </div>
                        </div>
                      )}
                      {section === 'FAQS' && (
                        <div>
                          {product.id === 'childrens-multivitamin' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about children's vitamins:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Are these safe for picky eaters?</strong> Yes, these gummies are designed specifically for children who struggle with tablets or have selective eating habits.</li>
                                <li>• <strong>Can my child take these with other supplements?</strong> Generally yes, but consult your pediatrician to avoid exceeding daily vitamin limits.</li>
                                <li>• <strong>What age can start taking these?</strong> Suitable for children aged 3 and above. Different dosing for 3-8 vs 9+ age groups.</li>
                                <li>• <strong>Are there any allergens?</strong> These are gelatin-free, lactose-free, gluten-free and suitable for vegetarians.</li>
                              </ul>
                            </div>
                          ) : product.id === 'vitamin-d3' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Vitamin D3:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why 4000 IU high-potency formula?</strong> 4000 IU is the optimal therapeutic dose for achieving and maintaining healthy vitamin D blood levels year-round, especially in regions with limited sunlight.</li>
                                <li>• <strong>When is the best time to take vitamin D?</strong> Any time of day, with or without food. Consistency is more important than timing.</li>
                                <li>• <strong>Is this suitable for winter months?</strong> Yes, especially important during UK winter months (October-March) when sunlight exposure is limited.</li>
                                <li>• <strong>Can I take this if I already take a multivitamin?</strong> Check your multivitamin label to avoid exceeding 4000 IU total daily intake. Consult your healthcare provider if unsure.</li>
                              </ul>
                            </div>
                          ) : product.id === 'probiotic-vitamins' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Probiotic + Vitamins:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>How do probiotics survive in gummy form?</strong> Our probiotic strains are protected in a low-water, shelf-stable gummy matrix designed to maintain viability at room temperature.</li>
                                <li>• <strong>Can I take this with antibiotics?</strong> Yes, but space doses 2-3 hours apart from antibiotic medication. Continue taking for several weeks after antibiotic course.</li>
                                <li>• <strong>Will I notice digestive benefits immediately?</strong> Individual responses vary. Some people notice changes within days, while others may take 2-4 weeks of consistent use.</li>
                                <li>• <strong>Is this suitable for travel?</strong> Yes, the shelf-stable format makes it ideal for travel when your normal routine and diet may be disrupted.</li>
                              </ul>
                            </div>
                          ) : product.id === 'collagen-complex' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Collagen Complex:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>How long before I see results?</strong> Collagen benefits are cumulative and require consistent use. Allow minimum 60 days for visible changes to skin, hair, and nails.</li>
                                <li>• <strong>Is this suitable for vegans?</strong> No, the collagen is bovine-derived. However, the formulation is non-gelatin and suitable for vegetarians.</li>
                                <li>• <strong>Why is vitamin C included?</strong> Vitamin C is essential for natural collagen formation in the body and enhances the effectiveness of supplemental collagen.</li>
                                <li>• <strong>Can I take this with other beauty supplements?</strong> Yes, but check total vitamin intake to avoid exceeding recommended daily amounts, especially for vitamins A and E.</li>
                              </ul>
                            </div>
                          ) : product.id === 'biotin-5000' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Biotin 5000µg:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why such a high dose of biotin?</strong> 5000µg is a therapeutic dose commonly used in beauty supplements for optimal hair and nail support, especially for those with brittle nails or hair concerns.</li>
                                <li>• <strong>Will this interfere with blood tests?</strong> Yes, high-dose biotin can affect lab results including thyroid function and heart markers. Inform your doctor before any blood tests.</li>
                                <li>• <strong>How long before I see improvements?</strong> Hair and nail changes take time. Most people notice benefits after 8-12 weeks of consistent daily use.</li>
                                <li>• <strong>Can I take this with other B vitamins?</strong> Yes, biotin is water-soluble so excess is naturally excreted. However, check total B-vitamin intake to avoid unnecessary excess.</li>
                              </ul>
                            </div>
                          ) : product.id === 'magnesium' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Magnesium Gummies:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why magnesium citrate over other forms?</strong> Citrate has superior absorption compared to magnesium oxide and is gentler on the digestive system while providing excellent bioavailability.</li>
                                <li>• <strong>Can I take this if I have digestive sensitivities?</strong> Yes, the 90mg dose is gentle and well-tolerated. Start with 1 gummy to assess your individual response.</li>
                                <li>• <strong>When is the best time to take magnesium?</strong> Any time works, but many prefer evening as magnesium may support relaxation and sleep quality.</li>
                                <li>• <strong>Can I take this with calcium supplements?</strong> Space them apart by 2+ hours as calcium can interfere with magnesium absorption when taken simultaneously.</li>
                              </ul>
                            </div>
                          ) : product.id === 'iron-vitamin-c' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Iron + Vitamin C:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Why is vitamin C included with iron?</strong> Vitamin C significantly enhances iron absorption and helps convert iron into a more bioavailable form, improving uptake by up to 50%.</li>
                                <li>• <strong>Is this suitable for vegetarians and vegans?</strong> Yes, this is ideal for plant-based diets as it provides easily absorbed iron that may be lacking from non-heme plant sources.</li>
                                <li>• <strong>Will this cause stomach upset like iron tablets?</strong> The ferric pyrophosphate form is much gentler than ferrous sulfate, and the gummy format reduces metallic aftertaste and stomach irritation.</li>
                                <li>• <strong>Can I take this if I'm not anemic?</strong> Yes, this is designed for daily maintenance to prevent iron deficiency, especially beneficial for menstruating women and active individuals.</li>
                              </ul>
                            </div>
                          ) : product.id === 'folic-acid-400' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Folic Acid 400µg:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>When should I start taking folic acid?</strong> Ideally 4+ weeks before trying to conceive, as neural tube development occurs within the first 28 days, often before pregnancy is known.</li>
                                <li>• <strong>Can I take this if I'm not planning pregnancy?</strong> Yes, folic acid supports normal blood formation and psychological function in all women of reproductive age.</li>
                                <li>• <strong>Is 400µg the right dose for everyone?</strong> This is the NHS-recommended standard dose. Women with MTHFR gene variants or previous neural tube defects may need higher doses under medical supervision.</li>
                                <li>• <strong>Can I continue this throughout pregnancy?</strong> Yes for the first trimester, but consult your healthcare provider about comprehensive prenatal vitamins after 12 weeks.</li>
                              </ul>
                            </div>
                          ) : product.id === 'ashwagandha' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Ashwagandha Gummies:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>How long before I notice effects?</strong> Most people notice benefits after 2-4 weeks of consistent daily use, especially for stress resilience and sleep quality.</li>
                                <li>• <strong>Can I take this with other supplements?</strong> Generally yes, but avoid taking with sedatives or blood pressure medications without medical supervision.</li>
                                <li>• <strong>Is ashwagandha safe for long-term use?</strong> Studies show safe use up to 3 months continuously. Many people cycle on/off or take breaks every few months.</li>
                                <li>• <strong>Will this make me drowsy?</strong> No, ashwagandha is non-sedative. It supports natural calm and balance without causing drowsiness during the day.</li>
                              </ul>
                            </div>
                          ) : product.id === 'apple-cider-vinegar' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Apple Cider Vinegar Gummies:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>Are these as effective as liquid ACV?</strong> These gummies provide 500mg concentrated ACV powder equivalent to traditional liquid, but in a stomach-friendly format without enamel erosion.</li>
                                <li>• <strong>When is the best time to take them?</strong> 15-30 minutes before meals for optimal digestive support and appetite management.</li>
                                <li>• <strong>Can I take these on an empty stomach?</strong> Yes, unlike harsh liquid ACV, these gummies are gentle enough for empty stomach use.</li>
                              </ul>
                            </div>
                          ) : product.id === 'mind-memory-mushroom' ? (
                            <div>
                              <p className="font-medium mb-2">Common questions about Lion's Mane Gummies:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• <strong>What is Lion's Mane good for?</strong> Lion's Mane is clinically studied for its potential to support neurogenesis, memory, focus, and cognitive performance.</li>
                                <li>• <strong>Is this made from the fruiting body or mycelium?</strong> Only fruiting body extract is used — the part richest in bioactive compounds like hericenones and erinacines.</li>
                                <li>• <strong>Can I take this with coffee or other supplements?</strong> Yes, Lion's Mane is often paired with caffeine or adaptogens, but always check with your healthcare provider if unsure.</li>
                                <li>• <strong>Is it safe long-term?</strong> Current research suggests Lion's Mane is well-tolerated for ongoing use at recommended doses.</li>
                                <li>• <strong>Will it make me feel more focused right away?</strong> Some people notice short-term effects, but the strongest benefits are typically seen after consistent daily use over 4–6 weeks.</li>
                                <li>• <strong>Are these gummies vegan and sugar-free?</strong> They're 100% vegan. While not sugar-free, each serving contains 3.64g of sugar — similar to a small piece of fruit.</li>
                              </ul>
                            </div>
                          ) : product.id === 'collagen-powder' ? (
                            <div>
                              <div className="space-y-4">
                                <div>
                                  <p className="font-medium mb-2">What's the benefit of collagen peptides over regular collagen?</p>
                                  <p className="text-sm text-gray-600">Collagen peptides are short-chain amino acids that are easier to absorb and clinically shown to stimulate fibroblasts — the cells responsible for producing new skin collagen.</p>
                                </div>
                                
                                <div>
                                  <p className="font-medium mb-2">How long before I see results?</p>
                                  <p className="text-sm text-gray-600">Clinical studies show visible skin elasticity improvement and wrinkle reduction in as little as 4–8 weeks with daily use.</p>
                                </div>
                                
                                <div>
                                  <p className="font-medium mb-2">Is this suitable for vegetarians or vegans?</p>
                                  <p className="text-sm text-gray-600">No — this product contains bovine-derived collagen peptides and is not suitable for vegetarians or vegans.</p>
                                </div>
                                
                                <div>
                                  <p className="font-medium mb-2">Does this help with cellulite?</p>
                                  <p className="text-sm text-gray-600">Yes. In studies, consistent use of 2.5g daily was associated with improved skin smoothness and reduced waviness related to cellulite.</p>
                                </div>
                                
                                <div>
                                  <p className="font-medium mb-2">Will this support nail and hair health too?</p>
                                  <p className="text-sm text-gray-600">Yes — participants in clinical trials experienced 42% fewer broken nails and improved hair follicle density after daily use.</p>
                                </div>
                                
                                <div>
                                  <p className="font-medium mb-2">Can men use HALO Glow Collagen?</p>
                                  <p className="text-sm text-gray-600">Absolutely — collagen is a structural protein essential to skin and connective tissue in all genders.</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">Common questions about this product:</p>
                              <ul className="mt-2 space-y-2">
                                <li>• Can I take this with other supplements? Generally yes, but consult your healthcare provider.</li>
                                <li>• When will I see results? Individual results vary, typically 2-4 weeks of consistent use.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {section === 'SHIPPING AND RETURNS' && (
                        <div>
                          <p className="font-medium mb-2">Shipping and Returns:</p>
                          <ul className="mt-2 space-y-1 text-sm">
                            <li>• <strong>South Africa Delivery:</strong> 2–3 working days</li>
                            <li>• <strong>UK Delivery:</strong> 5–7 working days</li>
                            <li>• <strong>EU Delivery:</strong> 7–10 working days</li>
                            <li>• <strong>USA/Canada:</strong> 10–14 working days</li>
                            <li>• <strong>Australia:</strong> 12–16 working days</li>
                            <li>• <strong>Returns:</strong> 30-day money-back guarantee if unopened</li>
                            <li>• <strong>Fulfilled from:</strong> South African warehouse, under GMP manufacturing standards</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Support Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
            NEED SUPPORT?
          </p>
          <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4">
            Get in touch with our team<br />
            for personalized guidance
          </h2>
          <Button className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800">
            <Link href="/contact" className="flex items-center">
              Contact our team <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
      {/* Product-Specific Facts Section - Like Home Page */}
      <section className="bg-white">
        <div className="lg:grid lg:grid-cols-2 lg:items-stretch min-h-[600px]">
          {/* Content */}
          <div className="py-24 px-6 lg:px-16 flex items-center">
            <div>
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                  {productContent.sectionTitle}
                </p>
                <h2 className="text-2xl lg:text-3xl font-light text-gray-900 leading-tight mb-6">
                  {productContent.sectionHeading}
                </h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 mb-3">{productContent.stat1Number}</div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide leading-relaxed">
                    {productContent.stat1Text}
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 mb-3">{productContent.stat2Number}</div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide leading-relaxed">
                    {productContent.stat2Text}
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 mb-3">{productContent.stat3Number}</div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide leading-relaxed">
                    {productContent.stat3Text}
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-light text-gray-900 mb-3">{productContent.stat4Number}</div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide leading-relaxed">
                    {productContent.stat4Text}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <button className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto">
                    Shop Healios supplements →
                  </button>
                </Link>
                <Link href="/science">
                  <button className="border border-black text-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white transition-colors w-full sm:w-auto">
                    Learn about our science →
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative overflow-hidden">
            <img
              src={createProductSVG(params?.id || '')}
              alt={`${product?.name} wellness lifestyle imagery`}
              className="w-full h-full min-h-[400px] lg:min-h-full object-cover"
            />
          </div>
        </div>
      </section>
      {/* Sleep Benefits Section - Only show for products with sleep benefits */}
      {productContent.sleepBenefit && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
              HONESTY OVER HYPE
            </p>
            <h2 className="text-2xl lg:text-3xl font-light text-gray-900 mb-8">
              Scientifically supported sleep
            </h2>
            <p className="text-gray-600 mb-12">
              Clinical studies show that Magnesium supplementation can improve sleep quality and duration when taken consistently as part of a healthy routine.
            </p>
            
            <div className="grid grid-cols-2 gap-12 mb-8">
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">42</div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  MINUTES EXTRA SLEEP
                </p>
              </div>
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">32%</div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  INCREASE IN SLEEP QUALITY
                </p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mb-8">
              *Results based on clinical research with magnesium supplementation. Individual results may vary.
            </p>
            
            <img
              src={createProductSVG('magnesium')}
              alt="Sleep and wellness lifestyle"
              className="w-full h-64 object-cover"
            />
          </div>
        </section>
      )}
      {/* Fixed Bottom Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 lg:hidden">
        <div className="space-y-3">
          {/* Product Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-600 ml-1">({product.reviewCount})</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Subscribe & Save 20%</p>
              <p className="text-sm text-gray-600">R{subscriptionPrice}</p>
            </div>
          </div>
          
          {/* Quantity and Add to Cart Row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Button 
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-3 text-sm font-medium"
            >
              Add to Basket
            </Button>
          </div>
        </div>
      </div>
      {/* Pre-order Modal */}
      <PreOrderPopup
        product={product}
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
      />
      {/* Bundle Product Modal */}
      {showBundleModal && getBundleProduct() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Bundle Product Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBundleModal(false)}
                  className="p-2"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </Button>
              </div>
              
              {(() => {
                const bundleProduct = getBundleProduct()!;
                return (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      <img 
                        src={bundleProduct.imageUrl} 
                        alt={bundleProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">{bundleProduct.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{bundleProduct.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-semibold">R{bundleProduct.price}</div>
                        <div className="text-sm text-gray-500">
                          {bundleProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium">Key Benefits:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Premium quality formulation</li>
                          <li>• Third-party tested for purity</li>
                          <li>• Complements your current selection</li>
                        </ul>
                      </div>
                      
                      <Button
                        onClick={() => {
                          handleToggleBundleProduct();
                          setShowBundleModal(false);
                        }}
                        className="w-full"
                        disabled={bundleAdded}
                      >
                        {bundleAdded ? 'Already Added to Cart' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Pre-Order Popup */}
      <PreOrderPopup
        product={product}
        isOpen={showPreOrderModal}
        onClose={() => setShowPreOrderModal(false)}
      />
    </div>
  );
}