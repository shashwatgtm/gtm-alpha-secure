// netlify/functions/get-pricing.js
// Complete pricing endpoint with MCP/API usage tiers

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const BETA_END_DATE = new Date('2025-07-15T23:59:59Z');
  const betaActive = new Date() <= BETA_END_DATE;
  const daysRemaining = betaActive 
    ? Math.ceil((BETA_END_DATE - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate price with PayPal fees included
  function calculatePriceWithFees(basePrice) {
    return Math.ceil(basePrice * 1.025);
  }

  function calculateDiscounts(basePrice) {
    return {
      monthly: calculatePriceWithFees(basePrice),
      quarterly: calculatePriceWithFees(basePrice * 3 * 0.92),
      annual: calculatePriceWithFees(basePrice * 12 * 0.88)
    };
  }

  const pricing = {
    premium: {
      name: 'GTM Alpha Premium Analysis',
      description: 'Initial comprehensive GTM consultation report',
      base_price: 29,
      final_price: betaActive ? 0 : calculatePriceWithFees(29),
      type: 'one-time',
      beta_free: betaActive,
      features: [
        'EPIC Framework Analysis',
        'Digital Presence Audit', 
        'Market Intelligence',
        'Implementation Roadmap',
        'PDF Report Generation'
      ],
      mcp_api_access: {
        included: false,
        note: 'No MCP/API access included'
      }
    },

    strategic: {
      name: 'GTM Alpha Strategic Partner',
      description: 'Per-hour strategic consultation sessions',
      base_price: 300,
      final_price: calculatePriceWithFees(300),
      type: 'per-hour',
      beta_free: false,
      volume_discounts: {
        '3_hours': {
          price_per_hour: calculatePriceWithFees(300 * 0.95),
          discount: '5%',
          total_3hrs: calculatePriceWithFees(300 * 3 * 0.95)
        },
        '5_hours': {
          price_per_hour: calculatePriceWithFees(300 * 0.92),
          discount: '8%', 
          total_5hrs: calculatePriceWithFees(300 * 5 * 0.92)
        }
      },
      features: [
        'Premium Analysis included',
        'Progress Audit Sessions',
        'Custom Implementation Planning',
        'Remote consulting sessions',
        'Flexible scheduling'
      ],
      mcp_api_access: {
        included: true,
        free_calls: 5,
        overage_rate: 2,
        note: '5 free MCP calls/month, then $2/call'
      }
    },

    fractional: {
      name: 'GTM Alpha Fractional Partner',
      description: '1-year program with hands-on implementation',
      base_price: 4500,
      type: 'recurring',
      beta_free: false,
      pricing_options: calculateDiscounts(4500),
      savings: {
        quarterly: {
          total_savings: (calculatePriceWithFees(4500) * 3) - calculateDiscounts(4500).quarterly,
          percentage: 8,
          monthly_equivalent: Math.round(calculateDiscounts(4500).quarterly / 3)
        },
        annual: {
          total_savings: (calculatePriceWithFees(4500) * 12) - calculateDiscounts(4500).annual,
          percentage: 12,
          monthly_equivalent: Math.round(calculateDiscounts(4500).annual / 12)
        }
      },
      features: [
        'Serious companies ready for transformation',
        'Hands-on implementation with expert guidance',
        '1-year program with 2hrs/week live calls',
        'True fractional CMO positioning',
        'All Strategic Partner features included'
      ],
      mcp_api_access: {
        included: true,
        free_calls: 20,
        overage_rate: 2,
        note: '20 free MCP calls/month, then $2/call'
      }
    },

    enterprise: {
      name: 'GTM Alpha Enterprise Plan',
      description: 'Team licensing with unlimited consultations',
      base_price: 1500,
      type: 'recurring',
      beta_free: false,
      license_tiers: {
        starter: {
          licenses: 3,
          monthly: calculatePriceWithFees(1500),
          quarterly: calculatePriceWithFees(1500 * 3 * 0.92),
          annual: calculatePriceWithFees(1500 * 12 * 0.88),
          price_per_license: Math.round(calculatePriceWithFees(1500) / 3),
          target: 'Small teams'
        },
        growth: {
          licenses: 5,
          monthly: calculatePriceWithFees(2500),
          quarterly: calculatePriceWithFees(2500 * 3 * 0.92),
          annual: calculatePriceWithFees(2500 * 12 * 0.88),
          price_per_license: Math.round(calculatePriceWithFees(2500) / 5),
          target: 'Growing teams'
        },
        scale: {
          licenses: 10,
          monthly: calculatePriceWithFees(3500),
          quarterly: calculatePriceWithFees(3500 * 3 * 0.92),
          annual: calculatePriceWithFees(3500 * 12 * 0.88),
          price_per_license: Math.round(calculatePriceWithFees(3500) / 10),
          target: 'Large teams'
        }
      },
      features: [
        'Agencies, consulting firms, large teams',
        'White-label licensing and unlimited access',
        'Minimum 3/5/10 licenses required',
        'API access with priority support',
        'Each license works for Strategic OR Fractional services',
        'Customization and priority support'
      ],
      mcp_api_access: {
        included: true,
        free_calls: 100,
        overage_rate: 1,
        note: '100 free MCP calls/month, then $1/call (50% discount)'
      }
    }
  };

  // MCP/API specific pricing
  const mcp_api_pricing = {
    individual_actors: {
      price_per_call: 2,
      description: 'Individual GTM analysis components',
      actors_available: [
        'EPIC Framework Analyzer',
        'Digital Presence Auditor', 
        'Market Intelligence Scanner',
        'Implementation Roadmap Generator',
        'Mental Velocity Optimizer',
        'Community Growth Analyzer',
        'Inbound/Outbound Strategy Planner'
      ]
    },
    complete_report: {
      price_per_call: 15,
      description: 'Full GTM Alpha consultation report',
      equivalent_to: 'Premium Analysis via API/MCP'
    },
    setup_cost: 0,
    billing: 'Pay-per-use, charged monthly'
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      beta_status: {
        active: betaActive,
        days_remaining: daysRemaining,
        end_date: BETA_END_DATE.toISOString(),
        free_tier: betaActive ? 'premium' : null,
        message: betaActive 
          ? `🎉 FREE Premium Analysis for ${daysRemaining} more days!`
          : 'Beta period ended - Premium Analysis now $30'
      },
      
      consultation_pricing: pricing,
      
      mcp_api_pricing: mcp_api_pricing,
      
      pricing_summary: {
        premium: `$${pricing.premium.final_price} (${betaActive ? 'FREE during beta' : 'one-time'})`,
        strategic: `$${pricing.strategic.final_price}/hour (volume discounts available)`,
        fractional: `$${pricing.fractional.pricing_options.monthly}/month (save with quarterly/annual)`,
        enterprise: `$${pricing.enterprise.license_tiers.starter.monthly}/month (3 licenses) to $${pricing.enterprise.license_tiers.scale.monthly}/month (10 licenses)`
      },
      
      fee_structure: {
        paypal_fees_included: true,
        markup_percentage: 2.5,
        note: 'All prices include payment processing fees'
      },
      
      discounts: {
        strategic_volume: {
          '3_hours': '5% discount',
          '5_hours': '8% discount'
        },
        recurring_services: {
          quarterly: '8% discount on quarterly payments',
          annual: '12% discount on annual payments'
        },
        enterprise_mcp: '50% discount on MCP overage rates'
      },
      
      value_comparison: {
        individual_fractional: `$${pricing.fractional.pricing_options.monthly}/month`,
        enterprise_3_licenses: `$${pricing.enterprise.license_tiers.starter.monthly}/month = $${pricing.enterprise.license_tiers.starter.price_per_license}/license`,
        enterprise_savings: `${Math.round((pricing.fractional.pricing_options.monthly / pricing.enterprise.license_tiers.starter.price_per_license) * 100)}% cheaper per license with Enterprise`
      }
    })
  };
};