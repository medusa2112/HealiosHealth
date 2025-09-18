import fetch from 'node-fetch';
import crypto from 'crypto';
import { ENV } from '../config/env';

// PayStack API response interfaces
interface PayStackBaseResponse {
  status: boolean;
  message: string;
  data?: any;
}

interface PayStackTransactionResponse extends PayStackBaseResponse {
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PayStackVerificationResponse extends PayStackBaseResponse {
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
      risk_action: string;
    };
    plan: any;
    subaccount: any;
  };
}

interface PayStackPlanResponse extends PayStackBaseResponse {
  data: {
    name: string;
    amount: number;
    interval: string;
    integration: number;
    domain: string;
    plan_code: string;
    send_invoices: boolean;
    send_sms: boolean;
    currency: string;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface PayStackSubscriptionResponse extends PayStackBaseResponse {
  data: {
    customer: number;
    plan: number;
    integration: number;
    domain: string;
    start: number;
    status: string;
    quantity: number;
    amount: number;
    subscription_code: string;
    email_token: string;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    easy_cron_id: string | null;
    cron_expression: string;
    next_payment_date: string;
    open_invoice: string | null;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface PayStackCustomerResponse extends PayStackBaseResponse {
  data: {
    email: string;
    integration: number;
    domain: string;
    customer_code: string;
    id: number;
    identified: boolean;
    identifications: any;
    createdAt: string;
    updatedAt: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    metadata: any;
  };
}

interface PayStackRefundResponse extends PayStackBaseResponse {
  data: {
    transaction: {
      id: number;
      domain: string;
      reference: string;
      amount: number;
      paid_at: string;
      channel: string;
      currency: string;
      authorization: any;
      customer: any;
      plan: any;
    };
    integration: number;
    deducted_amount: number;
    channel: string | null;
    merchant_note: string;
    customer_note: string;
    status: string;
    refunded_by: string;
    expected_at: string;
    currency: string;
    domain: string;
    amount: number;
    fully_deducted: boolean;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface PayStackTransactionListResponse extends PayStackBaseResponse {
  data: Array<{
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    customer: any;
    authorization: any;
    plan: any;
  }>;
  meta: {
    total: number;
    skipped: number;
    perPage: number;
    page: number;
    pageCount: number;
  };
}

// PayStack API configuration
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = ENV.PAYSTACK_SECRET;

if (!PAYSTACK_SECRET_KEY && ENV.isProd) {
  console.warn('PayStack Secret Key not configured. Payment processing will not work.');
}

// PayStack API wrapper
export class PayStackAPI {
  private secretKey: string;
  
  constructor(secretKey: string = PAYSTACK_SECRET_KEY) {
    this.secretKey = secretKey;
  }
  
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Initialize transaction
  async initializeTransaction(params: {
    email: string;
    amount: number; // in cents
    currency?: string;
    reference?: string;
    callback_url?: string;
    metadata?: any;
    channels?: string[];
  }) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...params,
        amount: params.amount // PayStack expects amount in kobo/cents
      })
    });
    
    const data = await response.json() as PayStackTransactionResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize transaction');
    }
    
    return data;
  }
  
  // Verify transaction
  async verifyTransaction(reference: string) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await response.json() as PayStackVerificationResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify transaction');
    }
    
    return data;
  }
  
  // Create subscription plan
  async createPlan(params: {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'annually';
    currency?: string;
  }) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    
    const data = await response.json() as PayStackPlanResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create plan');
    }
    
    return data;
  }
  
  // Create subscription
  async createSubscription(params: {
    customer: string; // customer email or code
    plan: string; // plan code
    authorization?: string; // authorization code from previous payment
  }) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    
    const data = await response.json() as PayStackSubscriptionResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create subscription');
    }
    
    return data;
  }
  
  // Get subscription
  async getSubscription(code: string) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/${code}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await response.json() as PayStackSubscriptionResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get subscription');
    }
    
    return data;
  }
  
  // Cancel subscription
  async cancelSubscription(code: string) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        code,
        token: code
      })
    });
    
    const data = await response.json() as PayStackBaseResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel subscription');
    }
    
    return data;
  }
  
  // Create customer
  async createCustomer(params: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: any;
  }) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/customer`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    
    const data = await response.json() as PayStackCustomerResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create customer');
    }
    
    return data;
  }
  
  // Get customer
  async getCustomer(email: string) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/customer/${email}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await response.json() as PayStackCustomerResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get customer');
    }
    
    return data;
  }
  
  // Process refund
  async processRefund(params: {
    transaction: string; // transaction reference or id
    amount?: number; // amount in kobo/cents (optional for partial refund)
    currency?: string;
    customer_note?: string;
    merchant_note?: string;
  }) {
    const response = await fetch(`${PAYSTACK_BASE_URL}/refund`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    
    const data = await response.json() as PayStackRefundResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to process refund');
    }
    
    return data;
  }
  
  // Verify webhook signature
  verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto.createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    
    return hash === signature;
  }
  
  // List transactions
  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.perPage) queryParams.append('perPage', params.perPage.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.customer) queryParams.append('customer', params.customer);
      if (params.status) queryParams.append('status', params.status);
      if (params.from) queryParams.append('from', params.from.toISOString());
      if (params.to) queryParams.append('to', params.to.toISOString());
    }
    
    const url = `${PAYSTACK_BASE_URL}/transaction${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    const data = await response.json() as PayStackTransactionListResponse;
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to list transactions');
    }
    
    return data;
  }
}

// Export singleton instance
export const paystack = new PayStackAPI();