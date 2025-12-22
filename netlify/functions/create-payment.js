// netlify/functions/create-payment.js
// PayPal payment integration for GTM Alpha Launch Offer
// All services with PayPal fees passed to customer

import paypal from '@paypal/checkout-server-sdk';

// Check for PayPal credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// PayPal environment setup - wrapped in try-catch for safety
let paypalClient = null;
let initError = null;

try {
  if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
    const Environment = process.env.NODE_ENV === 'production'
      ? paypal.core.LiveEnvironment
      : paypal.core.SandboxEnvironment;

    paypalClient = new paypal.core.PayPalHttpClient(
      new Environment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    );
  }
} catch (err) {
  initError = err.message;
  console.error('PayPal SDK initialization error:', err);
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
    // Check for PayPal initialization errors
    if (initError) {
      console.error('PayPal SDK init error:', initError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system initialization failed',
        message: initError
      }), {
        status: 500,
        headers
      });
    }

    // Check for PayPal credentials first
    if (!paypalClient) {
      console.error('PayPal credentials missing: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured',
        message: 'PayPal credentials are missing. Please contact support.'
      }), {
        status: 500,
        headers
      });
    }

    const { consultation_data, tier = 'premium', payment_frequency = 'one-time' } = await req.json();

    // Base pricing structure
    const basePricing = {
      premium: {
        base: 8,
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
          base_price: selectedService.base,
          final_amount: finalAmount
        })
      }],
      application_context: {
        return_url: `${process.env.URL || 'https://gtmalpha.netlify.app'}/payment-success`,
        cancel_url: `${process.env.URL || 'https://gtmalpha.netlify.app'}/payment-cancel`,
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
    console.error('Error stack:', error.stack);

    // Check for specific PayPal errors
    let errorMessage = error.message;
    let errorDetails = null;

    if (error.statusCode) {
      errorDetails = `PayPal API error (${error.statusCode})`;
    }

    if (error.message && error.message.includes('INVALID_RESOURCE_ID')) {
      errorMessage = 'Invalid PayPal configuration. Please check credentials.';
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Payment processing failed',
      message: errorMessage,
      details: errorDetails,
      debug: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    }), {
      status: 500,
      headers
    });
  }
};