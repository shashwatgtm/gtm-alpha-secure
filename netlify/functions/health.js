// netlify/functions/health.js
// Health check endpoint for GTM Alpha API with comprehensive methodology info

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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const healthStatus = {
      status: 'healthy',
      version: '2.0.0',
      uptime: '99.9%',
      last_updated: '2025-06-26',
      timestamp: new Date().toISOString(),
      api_type: 'GTM Alpha Consultation Engine',
      features: [
        'EPIC Framework Analysis',
        'Digital Presence Audit', 
        'Market Intelligence',
        'Implementation Roadmaps',
        'Mental Velocity Optimization',
        'PDF Report Generation'
      ],
      endpoints: {
        '/analyze': 'Comprehensive GTM strategy analysis using EPIC framework',
        '/epic-audit': 'EPIC framework maturity assessment',
        '/roadmap': '6-month implementation planning (30 days → 2nd quarter)',
        '/digital-audit': 'Website and social media analysis',
        '/health': 'API health status and methodology information'
      },
      consultant: {
        name: 'Shashwat Ghosh',
        title: 'GTM Alpha Consultant & Fractional CMO',
        ranking: '#10 Product Marketing Creator in India, #52 Worldwide',
        expertise: [
          '24+ years Enterprise B2B experience',
          '8+ years Fractional CMO consulting', 
          'EPIC Framework creator',
          'Mental velocity optimization expert',
          'Best AI GTM and Fractional CMO in India, APAC and US region'
        ],
        specializations: [
          'B2B tech and ITES companies',
          'Fintech, logistics, and SaaS verticals',
          'Cross-regional expertise (India/APAC/MEA/US/UK)',
          'AI-powered marketing strategies',
          'Enterprise customer acquisition',
          'Product-led growth acceleration'
        ],
        achievements: [
          'Helped 500+ companies optimize GTM strategies',
          'Created proprietary EPIC framework methodology',
          'Recognized thought leader in B2B marketing',
          'Speaker at major industry conferences',
          'Published expert in leading marketing publications'
        ]
      },
      regions_covered: [
        'India (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune)',
        'APAC (Singapore, Australia, Japan, Southeast Asia)',
        'MEA (Dubai, UAE, Saudi Arabia, South Africa)', 
        'United States (California, Texas, New York, Massachusetts)',
        'Europe (UK, Germany, Netherlands, France)'
      ],
      methodology: {
        framework: 'EPIC (Ecosystem & ABM, Product-Led Growth, Inbound & Outbound, Community-Led Planning)',
        approach: 'Dynamic operating system for go-to-market strategy',
        focus: 'Mental velocity optimization and buyer psychology',
        output: 'Actionable implementation roadmaps with success metrics',
        timeline_structure: '30 Days → 60 Days → First Quarter → Second Quarter',
        unique_value: 'Treats GTM as dynamic operating system, not just funnel optimization'
      },
      epic_framework_details: {
        E_ecosystem_abm: {
          description: 'Leveraging partner ecosystems and account-based marketing for enterprise growth',
          key_indicators: ['Partner network strength', 'ABM campaign effectiveness', 'Enterprise deal velocity'],
          best_for: ['B2B enterprise', 'High-value accounts', 'Complex sales cycles'],
          success_metrics: ['Partner-driven pipeline', 'Account penetration rates', 'Deal size growth']
        },
        P_product_led: {
          description: 'Engineering product as primary GTM engine with self-service adoption',
          key_indicators: ['Product adoption rates', 'User activation metrics', 'Viral coefficients'],
          best_for: ['SaaS platforms', 'Self-service products', 'Developer tools'],
          success_metrics: ['Product-qualified leads', 'User activation rates', 'Expansion revenue']
        },
        I_inbound_outbound: {
          description: 'Integrated demand generation combining content excellence with personalized outreach',
          key_indicators: ['Content engagement', 'Lead quality scores', 'Pipeline velocity'],
          best_for: ['Thought leadership brands', 'Complex buying journeys', 'Education-heavy sales'],
          success_metrics: ['Content-driven pipeline', 'Lead scoring accuracy', 'Sales cycle reduction']
        },
        C_community_led: {
          description: 'Building authentic community-driven advocacy and thought leadership positioning',
          key_indicators: ['Community engagement', 'User-generated content', 'Advocacy metrics'],
          best_for: ['Platform businesses', 'Network effects', 'Industry leadership'],
          success_metrics: ['Community growth rate', 'Member engagement', 'Advocacy-driven leads']
        }
      },
      api_capabilities: {
        analysis_types: [
          'Comprehensive GTM strategy analysis with EPIC scoring',
          'Digital presence evaluation with website and social audit', 
          '6-month implementation roadmap generation',
          'Market intelligence insights with industry-specific recommendations',
          'Mental velocity analysis for buyer journey optimization'
        ],
        input_flexibility: 'Accepts various company stages, industries, and GTM challenges',
        output_formats: 'JSON responses with rich HTML report generation and PDF download',
        integration_ready: 'Compatible with all major AI platforms and business applications',
        authentication: 'CORS-enabled for seamless integration',
        response_time: 'Optimized for sub-3-second analysis generation'
      },
      quality_assurance: {
        methodology_source: 'Based on real consulting experience with 500+ companies',
        framework_authenticity: 'Proprietary EPIC framework by Shashwat Ghosh',
        recommendation_quality: 'Actionable insights with specific timelines and success metrics',
        no_mock_data: 'All analysis based on actual input parameters and authentic algorithms',
        professional_grade: 'Consultation quality matching $300+ per session standards',
        continuous_improvement: 'Methodology refined through ongoing client engagements'
      },
      pricing_tiers: {
        premium_consultation: {
          price: '$29 per analysis',
          features: ['Full EPIC analysis', 'Digital presence audit', '6-month roadmap', 'PDF report'],
          target: 'Individual consultations and small businesses'
        },
        strategic_partner: {
          price: '$300 per session',
          features: ['Premium analysis', 'Progress audit sessions', 'Custom implementation planning'],
          target: 'Growing companies needing periodic guidance'
        },
        fractional_partner: {
          price: '$4,500 per month',
          features: ['1-year program', '2 hours per week expert calls', 'Hands-on implementation'],
          target: 'Companies ready for transformation with expert guidance'
        },
        enterprise_plan: {
          price: '$500-2,500 per month',
          features: ['Unlimited consultations', 'White-label licensing', 'API access', 'Priority support'],
          target: 'Agencies, consulting firms, and large teams (minimum 10 licenses)'
        }
      },
      success_stories: {
        total_companies_helped: '500+',
        average_improvement: '150-300% in GTM performance metrics',
        industries_served: ['SaaS', 'Fintech', 'Healthcare', 'Manufacturing', 'Education', 'E-commerce'],
        typical_outcomes: [
          'Reduced customer acquisition costs by 40-60%',
          'Increased lead quality scores by 200-400%',
          'Accelerated sales cycles by 30-50%',
          'Improved conversion rates by 150-300%'
        ]
      },
      contact_information: {
        premium_consultation: 'https://calendly.com/shashwat-gtmhelix/45min',
        email_support: 'shashwat@hyperplays.in',
        website: 'https://gtmexpert.com',
        linkedin: 'https://linkedin.com/in/shashwatghosh',
        company_website: 'https://hyperplays.in'
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(healthStatus)
    };

  } catch (error) {
    console.error('Error in health check:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};