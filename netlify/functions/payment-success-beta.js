// netlify/functions/payment-success-beta.js
// Handle successful PayPal payments and trigger consultation generation

const paypal = require('@paypal/checkout-server-sdk');

// Same PayPal client setup
const Environment = process.env.NODE_ENV === 'production' 
  ? paypal.core.LiveEnvironment 
  : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { order_id } = JSON.parse(event.body);
    
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
      
      console.log(`✅ Payment completed for ${customData.company_name}`);
      console.log(`💰 Amount paid: $${amountPaid}`);
      console.log(`📊 Tier: ${tier} (${paymentFrequency})`);
      console.log(`💵 Your net revenue: $${yourNetRevenue}`);
      
      // Generate consultation for all paid services
      let consultationResult;
      try {
        const analyzeFunction = require('./analyze');
        consultationResult = await analyzeFunction.handler({
          httpMethod: 'POST',
          body: JSON.stringify(consultationData)
        }, context);
      } catch (analyzeError) {
        console.error('Error generating consultation:', analyzeError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Consultation generation failed',
            payment_status: 'completed',
            transaction_id: capture.result.id,
            message: 'Payment successful but consultation generation failed. Contact support.'
          })
        };
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
          consultation: JSON.parse(consultationResult.body),
          
          // Contact information
          support: {
  email: 'shashwat@hyperplays.in',
  message: 'Contact us for any questions about your consultation or service access.'
}
        })
      };
      
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Payment not completed',
          status: capture.result.status,
          message: 'Payment was not successfully processed. Please try again.'
        })
      };
    }

  } catch (error) {
    console.error('PayPal payment verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Payment verification failed',
        message: error.message,
        support: 'Please contact support with your order details.'
      })
    };
  }
};