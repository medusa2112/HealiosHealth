import Stripe from "stripe";

// Stripe is optional for development
if (!process.env.STRIPE_SECRET_KEY) {
  
}

export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil", // Use latest compatible version
  typescript: true,
}) : null;