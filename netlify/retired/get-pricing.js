// netlify/functions/get-pricing.js
// Complete pricing endpoint - Updated December 2025

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

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
      name: 'GTM Alpha Premium Analysis (Audit)',
      description: 'Comprehensive GTM consultation with EPIC framework',
      base_price: 8,
      final_price: 8,
      type: 'one-time',
      features: [
        'EPIC Framework Analysis',
        'Digital Presence Audit',
        'Market Intelligence',
        'Implementation Roadmap',
        'PDF Report Generation'
      ],
      mcp_api_access: {
        included: true,
        note: 'MCP tool calling is FREE'
      }
    },
    strategic: {
      name: 'GTM Alpha Strategic Partner',
      description: 'Per-hour strategic consultation sessions',
      base_price: 300,
      final_price: calculatePriceWithFees(300),
      type: 'per-hour',
      volume_discounts: {
        '3_hours': { price_per_hour: calculatePriceWithFees(300 * 0.95), discount: '5%', total_3hrs: calculatePriceWithFees(300 * 3 * 0.95) },
        '5_hours': { price_per_hour: calculatePriceWithFees(300 * 0.92), discount: '8%', total_5hrs: calculatePriceWithFees(300 * 5 * 0.92) }
      },
      features: ['Premium Analysis included', 'Progress Audit Sessions', 'Custom Implementation Planning', 'Remote consulting sessions', 'Flexible scheduling'],
      mcp_api_access: { included: true, free_calls: 'unlimited', note: 'MCP tool calling is FREE' }
    },
    fractional: {
      name: 'GTM Alpha Fractional Partner',
      description: '1-year program with hands-on implementation',
      base_price: 4500,
      type: 'recurring',
      pricing_options: calculateDiscounts(4500),
      savings: {
        quarterly: { total_savings: (calculatePriceWithFees(4500) * 3) - calculateDiscounts(4500).quarterly, percentage: 8, monthly_equivalent: Math.round(calculateDiscounts(4500).quarterly / 3) },
        annual: { total_savings: (calculatePriceWithFees(4500) * 12) - calculateDiscounts(4500).annual, percentage: 12, monthly_equivalent: Math.round(calculateDiscounts(4500).annual / 12) }
      },
      features: ['Serious companies ready for transformation', 'Hands-on implementation with expert guidance', '1-year program with 2hrs/week live calls', 'True fractional CMO positioning', 'All Strategic Partner features included'],
      mcp_api_access: { included: true, free_calls: 'unlimited', note: 'MCP tool calling is FREE' }
    },
    enterprise: {
      name: 'GTM Alpha Enterprise Plan',
      description: 'Team licensing with unlimited consultations',
      base_price: 1500,
      type: 'recurring',
      license_tiers: {
        starter: { licenses: 3, monthly: calculatePriceWithFees(1500), quarterly: calculatePriceWithFees(1500 * 3 * 0.92), annual: calculatePriceWithFees(1500 * 12 * 0.88), price_per_license: Math.round(calculatePriceWithFees(1500) / 3), target: 'Small teams' },
        growth: { licenses: 5, monthly: calculatePriceWithFees(2500), quarterly: calculatePriceWithFees(2500 * 3 * 0.92), annual: calculatePriceWithFees(2500 * 12 * 0.88), price_per_license: Math.round(calculatePriceWithFees(2500) / 5), target: 'Growing teams' },
        scale: { licenses: 10, monthly: calculatePriceWithFees(3500), quarterly: calculatePriceWithFees(3500 * 3 * 0.92), annual: calculatePriceWithFees(3500 * 12 * 0.88), price_per_license: Math.round(calculatePriceWithFees(3500) / 10), target: 'Large teams' }
      },
      features: ['Agencies, consulting firms, large teams', 'White-label licensing and unlimited access', 'Minimum 3/5/10 licenses required', 'API access with priority support', 'Each license works for Strategic OR Fractional services', 'Customization and priority support'],
      mcp_api_access: { included: true, free_calls: 'unlimited', note: 'MCP tool calling is FREE' }
    }
  };

  const mcp_api_pricing = {
    mcp_tool_calling: { price_per_call: 0, description: 'FREE MCP tool calling for all users', tools_available: ['gtm_consultation', 'epic_audit', 'generate_roadmap'] },
    premium_audit: { price: 8, description: 'Full GTM Alpha Premium Analysis report' },
    setup_cost: 0,
    billing: 'Pay only for Premium Audit ($8)'
  };

  return new Response(JSON.stringify({
    launch_offer: { message: 'MCP Tool Calling is FREE! Premium Audit only $8', mcp_free: true, audit_price: 8 },
    consultation_pricing: pricing,
    mcp_api_pricing: mcp_api_pricing,
    pricing_summary: { mcp_tools: 'FREE', premium_audit: '$8 (one-time)', strategic: '$' + pricing.strategic.final_price + '/hour', fractional: '$' + pricing.fractional.pricing_options.monthly + '/month', enterprise: '$' + pricing.enterprise.license_tiers.starter.monthly + '/month (3 licenses)' },
    fee_structure: { paypal_fees_included: true, markup_percentage: 2.5, note: 'All prices include payment processing fees' },
    discounts: { strategic_volume: { '3_hours': '5% discount', '5_hours': '8% discount' }, recurring_services: { quarterly: '8% discount', annual: '12% discount' } }
  }), { status: 200, headers });
};

export const config = { path: "/api/pricing" };
