// netlify/functions/create-payment.js
// PayPal payment integration for GTM Alpha Launch Offer
// All services with PayPal fees passed to customer

import paypal from '@paypal/checkout-server-sdk';

// PayPal environment setup
const Environment = process.env.NODE_ENV === 'production' 
  ? paypal.core.LiveEnvironment 
  : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

// Beta offer configuration - FREE initial consultation only until Nov 01, 2025
// Beta period ended - now using launch pricing
const BETA_END_DATE = new Date('2025-11-01T00:00:00Z'); // Beta ended Nov 1, 2025

function isBetaPeriod() {
  return new Date() <= BETA_END_DATE;
}

function getDaysRemaining() {
  const now = new Date();
  const msRemaining = BETA_END_DATE - now;
  return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
}

// Calculate price with PayPal fees (2.9% + $0.30) passed to customer
function calculatePriceWithFees(basePrice) {
  // Add 2.5% markup to cover PayPal fees plus small buffer
  const withMarkup = basePrice * 1.025;
  return Math.ceil(withMarkup); // Round up to nearest dollar
}

// Calculate discounted prices
function calculateDiscounts(basePrice) {
  return {
    monthly: calculatePriceWithFees(basePrice),
    quarterly: calculatePriceWithFees(basePrice * 3 * 0.92), // 8% discount for quarterly
    annual: calculatePriceWithFees(basePrice * 12 * 0.88)    // 12% discount for annual
  };
}

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const { consultation_data, tier = 'premium', payment_frequency = 'one-time' } = await req.json();
    
    // Check if we're in beta period
    const betaActive = isBetaPeriod();
    const daysRemaining = getDaysRemaining();
    
    // Base pricing structure
    const basePricing = {
      premium: {
        base: 1,
        name: 'GTM Alpha Premium Analysis',
        type: 'one-time'
      },
      strategic: {
        base: 300,
        name: 'GTM Alpha Strategic Partner Session', 
        type: 'one-time'
      },
      fractional: {
        base: 4500,
        name: 'GTM Alpha Fractional Partner',
        type: 'recurring'
      },
      enterprise: {
        base: 1500,
        name: 'GTM Alpha Enterprise Plan',
        type: 'recurring'
      }
    };

    const selectedService = basePricing[tier] || basePricing.premium;
    
    // BETA LOGIC: Only initial consultation (premium) is free during beta
    if (betaActive && tier === 'premium') {
      console.log(`FREE BETA INITIAL CONSULTATION for ${consultation_data.company_name} - ${daysRemaining} days remaining!`);
      
      try {
        // Import the analyze function
        const { default: analyzeFunction } = await import('./analyze.js');
        const consultationResult = await analyzeFunction(req, context);

        return new Response(JSON.stringify({
          success: true,
          beta_offer: true,
          amount: '0.00',
          tier: tier,
          beta_end_date: BETA_END_DATE.toISOString(),
          days_remaining: daysRemaining,
          message: `FREE BETA - Initial Consultation Only! ${daysRemaining} days remaining`,
          note: 'Other services (Strategic, Fractional, Enterprise) are paid from day 1',
          consultation: await consultationResult.json()
        }), {
          status: 200,
          headers
        });
      } catch (analyzeError) {
        console.error('Error calling analyze function:', analyzeError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Consultation generation failed',
          message: analyzeError.message
        }), {
          status: 500,
          headers
        });
      }
    }

    // PAID SERVICES LOGIC
    let finalAmount, finalName, discountInfo = null;
    
    if (selectedService.type === 'one-time') {
      // One-time services (Premium, Strategic)
      finalAmount = calculatePriceWithFees(selectedService.base);
      finalName = selectedService.name;
    } else {
      // Recurring services (Fractional, Enterprise) with payment options
      const prices = calculateDiscounts(selectedService.base);
      
      switch (payment_frequency) {
        case 'quarterly':
          finalAmount = prices.quarterly;
          finalName = `${selectedService.name} - Quarterly (8% Discount)`;
          discountInfo = {
            original_monthly: prices.monthly,
            quarterly_total: prices.quarterly,
            savings: (prices.monthly * 3) - prices.quarterly,
            discount_percent: 8
          };
          break;
        case 'annual':
          finalAmount = prices.annual;
          finalName = `${selectedService.name} - Annual (12% Discount)`;
          discountInfo = {
            original_monthly: prices.monthly,
            annual_total: prices.annual,
            savings: (prices.monthly * 12) - prices.annual,
            discount_percent: 12
          };
          break;
        default: // monthly
          finalAmount = prices.monthly;
          finalName = `${selectedService.name} - Monthly`;
          break;
      }
    }

    // Create PayPal payment
    console.log(`Creating PayPal payment for ${consultation_data.company_name}: $${finalAmount} (${finalName})`);
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: finalAmount.toFixed(2)
        },
        description: `${finalName} for ${consultation_data.company_name}`,
        custom_id: JSON.stringify({
          client_name: consultation_data.client_name,
          company_name: consultation_data.company_name,
          consultation_data: consultation_data,
          tier: tier,
          payment_frequency: payment_frequency,
          beta_period: betaActive,
          base_price: selectedService.base,
          final_amount: finalAmount
        })
      }],
      application_context: {
        return_url: `${process.env.URL}/payment-success`,
        cancel_url: `${process.env.URL}/payment-cancel`,
        brand_name: 'GTM Alpha Consulting',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW'
      }
    });

    const order = await paypalClient.execute(request);
    const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;

    return new Response(JSON.stringify({
      success: true,
      order_id: order.result.id,
      approval_url: approvalUrl,
      amount: finalAmount.toFixed(2),
      service_name: finalName,
      tier: tier,
      payment_frequency: payment_frequency,
      discount_info: discountInfo,
      beta_active: betaActive,
      fee_structure: {
        base_price: selectedService.base,
        paypal_fee_included: true,
        final_amount: finalAmount
      }
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('PayPal payment creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Payment processing failed',
      message: error.message
    }), {
      status: 500,
      headers
    });
  }
};

export const config = {
  path: "/api/create-payment"
};