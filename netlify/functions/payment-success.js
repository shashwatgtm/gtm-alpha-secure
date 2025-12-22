// netlify/functions/payment-success.js
// Handle successful PayPal payments and trigger consultation generation

import paypal from '@paypal/checkout-server-sdk';

// Check for PayPal credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// PayPal environment setup - only if credentials exist
let paypalClient = null;
if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
  const Environment = process.env.NODE_ENV === 'production'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

  paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
  );
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
    // Check for PayPal credentials first
    if (!paypalClient) {
      console.error('PayPal credentials missing');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured',
        message: 'PayPal credentials are missing. Please contact support.'
      }), {
        status: 500,
        headers
      });
    }

    const { order_id } = await req.json();
    
    // Capture the payment
    const request = new paypal.orders.OrdersCaptureRequest(order_id);
    const capture = await paypalClient.execute(request);
    
    if (capture.result.status === 'COMPLETED') {
      const customData = JSON.parse(capture.result.purchase_units[0].custom_id);
      const consultationData = customData.consultation_data;
      const tier = customData.tier;
      const paymentFrequency = customData.payment_frequency;
      const basePrice = customData.base_price;
      
      const amountPaid = parseFloat(capture.result.purchase_units[0].payments.captures[0].amount.value);
      const paypalFee = amountPaid * 0.029 + 0.30;
      const yourNetRevenue = basePrice; // Your actual revenue after our markup
      
      console.log(`Payment completed for ${customData.company_name}`);
      console.log(`Amount paid: $${amountPaid}`);
      console.log(`Tier: ${tier} (${paymentFrequency})`);
      console.log(`Your net revenue: $${yourNetRevenue}`);
      
      // Generate consultation for all paid services
      let consultationResult;
      try {
        const { default: analyzeFunction } = await import('./analyze.js');
        
        // Create a new request object with the consultation data
        const analyzeReq = {
          method: 'POST',
          json: async () => consultationData
        };
        
        consultationResult = await analyzeFunction(analyzeReq, context);
      } catch (analyzeError) {
        console.error('Error generating consultation:', analyzeError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Consultation generation failed',
          payment_status: 'completed',
          transaction_id: capture.result.id,
          message: 'Payment successful but consultation generation failed. Contact support.'
        }), {
          status: 500,
          headers
        });
      }

      // Determine MCP/API access based on tier
      let mcpApiAccess = {};
      switch (tier) {
        case 'premium':
          mcpApiAccess = {
            included: false,
            message: 'No MCP/API access with Premium tier'
          };
          break;
        case 'strategic':
          mcpApiAccess = {
            included: true,
            free_calls_monthly: 5,
            overage_rate: 2,
            message: '5 free MCP calls/month, then $2/call'
          };
          break;
        case 'fractional':
          mcpApiAccess = {
            included: true,
            free_calls_monthly: 20,
            overage_rate: 2,
            message: '20 free MCP calls/month, then $2/call'
          };
          break;
        case 'enterprise':
          mcpApiAccess = {
            included: true,
            free_calls_monthly: 100,
            overage_rate: 1,
            message: '100 free MCP calls/month, then $1/call (50% discount)'
          };
          break;
      }

      // Calculate savings information for recurring services
      let savingsInfo = null;
      if (['fractional', 'enterprise'].includes(tier) && paymentFrequency !== 'monthly') {
        const monthlyRate = tier === 'fractional' ? 4613 : (tier === 'enterprise' ? 1538 : 0);
        if (paymentFrequency === 'quarterly') {
          savingsInfo = {
            payment_type: 'Quarterly',
            discount_percentage: 8,
            monthly_equivalent: Math.round(amountPaid / 3),
            total_savings: (monthlyRate * 3) - amountPaid,
            message: `You saved $${((monthlyRate * 3) - amountPaid).toFixed(2)} with quarterly payment!`
          };
        } else if (paymentFrequency === 'annual') {
          savingsInfo = {
            payment_type: 'Annual',
            discount_percentage: 12,
            monthly_equivalent: Math.round(amountPaid / 12),
            total_savings: (monthlyRate * 12) - amountPaid,
            message: `You saved $${((monthlyRate * 12) - amountPaid).toFixed(2)} with annual payment!`
          };
        }
      }

      return new Response(JSON.stringify({
        success: true,
        payment_status: 'completed',
        transaction_id: capture.result.id,
        
        // Payment details
        payment_details: {
          amount_paid: amountPaid,
          tier: tier,
          payment_frequency: paymentFrequency,
          service_name: capture.result.purchase_units[0].description
        },
        
        // Revenue breakdown (for your records)
        revenue_breakdown: {
          gross_received: amountPaid,
          paypal_fee: paypalFee.toFixed(2),
          your_net_revenue: yourNetRevenue,
          markup_covered_fees: true
        },
        
        // Savings information
        savings_info: savingsInfo,
        
        // MCP/API access details
        mcp_api_access: mcpApiAccess,
        
        // Next steps for different tiers
        next_steps: {
          premium: tier === 'premium' ? 'Your consultation is ready! Consider upgrading to Strategic for ongoing support.' : null,
          strategic: tier === 'strategic' ? 'Schedule your strategic sessions and start using your 5 free MCP calls.' : null,
          fractional: tier === 'fractional' ? 'Welcome to the 1-year program! Your first 2-hour session will be scheduled soon.' : null,
          enterprise: tier === 'enterprise' ? 'Team access activated! Distribute licenses and start using 100 free MCP calls.' : null
        },
        
        // The consultation results
        consultation: await consultationResult.json(),
        
        // Contact information
        support: {
          email: 'shashwat@hyperplays.in',
          message: 'Contact us for any questions about your consultation or service access.'
        }
      }), {
        status: 200,
        headers
      });
      
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment not completed',
        status: capture.result.status,
        message: 'Payment was not successfully processed. Please try again.'
      }), {
        status: 400,
        headers
      });
    }

  } catch (error) {
    console.error('PayPal payment verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Payment verification failed',
      message: error.message,
      support: 'Please contact support with your order details.'
    }), {
      status: 500,
      headers
    });
  }
};