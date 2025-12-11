// netlify/functions/epic-scores.js
// Dynamic EPIC Scoring System with Persistence

import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const store = getStore("gtm-consultations");
    
    // Handle GET requests
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const consultationId = url.searchParams.get('consultation_id');
      
      if (consultationId) {
        const consultation = await store.get(consultationId, { type: 'json' });
        if (consultation) {
          return new Response(JSON.stringify(consultation), { status: 200, headers });
        }
        return new Response(JSON.stringify({ error: 'Consultation not found' }), { status: 404, headers });
      }
      
      // Default GET response for testing
      return new Response(JSON.stringify({
        message: 'EPIC Scores API is working',
        version: '2.0',
        timestamp: new Date().toISOString()
      }), { status: 200, headers });
    }
    
    // Only accept POST for analysis
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed' 
      }), { status: 405, headers });
    }

    // Parse request body
    const data = await req.json();
    
    // Calculate dynamic EPIC scores
    const epicScores = calculateDynamicEPICScores(data);
    
    // Generate consultation ID
    const consultationId = `GTM-${(data.company_name || 'UNK').substring(0,3).toUpperCase()}-${Date.now()}`;
    
    // Prepare response
    const consultationData = {
      consultation_id: consultationId,
      created_at: new Date().toISOString(),
      company_name: data.company_name || 'Unknown',
      industry: data.industry || 'General',
      business_stage: data.business_stage || 'Growth',
      team_size: data.team_size || '10',
      monthly_budget: data.monthly_budget || '5000',
      epic_scores: epicScores,
      primary_strategy: getPrimaryStrategy(epicScores),
      recommendations: getRecommendations(epicScores, data),
      quarterly_milestones: generateQuarterlyMilestones(epicScores, data)
    };
    
    // Store in Netlify Blobs (using correct method)
    const storageKey = consultationId;
    await store.set(storageKey, JSON.stringify(consultationData));
    
    // Return response
    return new Response(JSON.stringify({
      success: true,
      consultation_id: consultationId,
      epic_scores: epicScores,
      primary_strategy: consultationData.primary_strategy,
      recommendations: consultationData.recommendations,
      quarterly_milestones: consultationData.quarterly_milestones,
      message: "Analysis complete"
    }), {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      stack: error.stack
    }), {
      status: 500,
      headers
    });
  }
};

function calculateDynamicEPICScores(data) {
  // Initialize base scores
  let scores = {
    E: 30, // Ecosystem
    P: 30, // Product-Led
    I: 30, // Inbound/Outbound
    C: 30  // Community
  };

  // Industry adjustments
  const industryAdjustments = {
    'SaaS': { E: 10, P: 20, I: 5, C: 5 },
    'Finance': { E: 20, P: -10, I: 15, C: -5 },
    'Healthcare': { E: 15, P: -5, I: 10, C: 0 },
    'E-commerce': { E: 5, P: 10, I: 15, C: 10 },
    'Education': { E: 10, P: 5, I: 5, C: 15 },
    'Marketplace': { E: 20, P: 5, I: 10, C: 15 },
    'Consumer': { E: 0, P: 15, I: 20, C: 20 },
    'B2B': { E: 15, P: 5, I: 10, C: 5 },
    'Enterprise': { E: 25, P: -5, I: 15, C: 0 },
    'Technology': { E: 10, P: 15, I: 5, C: 10 },
    'Retail': { E: 5, P: 10, I: 20, C: 15 },
    'General': { E: 5, P: 5, I: 5, C: 5 }
  };

  // Apply industry adjustments
  const industry = data.industry || 'General';
  if (industryAdjustments[industry]) {
    const adj = industryAdjustments[industry];
    scores.E += adj.E;
    scores.P += adj.P;
    scores.I += adj.I;
    scores.C += adj.C;
  }

  // Stage adjustments
  const stageAdjustments = {
    'Pre-launch': { E: -10, P: 5, I: -15, C: 10 },
    'MVP': { E: -5, P: 10, I: -10, C: 15 },
    'Early Traction': { E: 0, P: 15, I: 0, C: 10 },
    'Growth': { E: 10, P: 10, I: 15, C: 5 },
    'Scale': { E: 15, P: 5, I: 20, C: 0 },
    'Mature': { E: 20, P: 0, I: 15, C: -5 },
    'Enterprise': { E: 25, P: -5, I: 15, C: -10 }
  };

  const stage = data.business_stage || 'Growth';
  if (stageAdjustments[stage]) {
    const adj = stageAdjustments[stage];
    scores.E += adj.E;
    scores.P += adj.P;
    scores.I += adj.I;
    scores.C += adj.C;
  }

  // Team size adjustments
  if (data.team_size) {
    const size = parseInt(data.team_size) || 10;
    if (size <= 5) {
      scores.P += 10;
      scores.C += 5;
      scores.E -= 5;
    } else if (size <= 20) {
      scores.P += 5;
      scores.I += 5;
    } else if (size <= 100) {
      scores.E += 5;
      scores.I += 10;
    } else if (size <= 500) {
      scores.E += 10;
      scores.I += 15;
      scores.P -= 5;
    } else {
      scores.E += 15;
      scores.I += 10;
      scores.P -= 10;
    }
  }

  // Budget adjustments
  if (data.monthly_budget) {
    const budget = parseInt(String(data.monthly_budget).replace(/[^0-9]/g, '')) || 5000;
    if (budget < 1000) {
      scores.P += 10;
      scores.C += 10;
      scores.I -= 10;
    } else if (budget < 5000) {
      scores.P += 5;
      scores.C += 5;
    } else if (budget < 20000) {
      scores.I += 10;
      scores.P += 5;
    } else if (budget < 50000) {
      scores.E += 10;
      scores.I += 15;
    } else {
      scores.E += 20;
      scores.I += 20;
      scores.P -= 5;
    }
  }

  // Normalize scores to 0-100 range
  Object.keys(scores).forEach(key => {
    scores[key] = Math.max(0, Math.min(100, scores[key]));
  });

  return scores;
}

function getPrimaryStrategy(scores) {
  const strategies = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = strategies[0][0];
  
  const names = {
    'E': 'Ecosystem-Led Growth',
    'P': 'Product-Led Growth',
    'I': 'Inbound/Outbound Sales',
    'C': 'Community-Led Growth'
  };
  
  return names[primary] || 'Balanced GTM Strategy';
}

function getRecommendations(scores, data) {
  const recommendations = [];
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  // Primary strategy recommendation
  const primary = sorted[0];
  if (primary[0] === 'E' && primary[1] > 50) {
    recommendations.push('Build strategic partnerships and technology integrations');
    recommendations.push('Create partner enablement programs and co-marketing initiatives');
  } else if (primary[0] === 'P' && primary[1] > 50) {
    recommendations.push('Implement self-service onboarding and free trial');
    recommendations.push('Focus on product virality and usage-based growth');
  } else if (primary[0] === 'I' && primary[1] > 50) {
    recommendations.push('Scale content marketing and SEO initiatives');
    recommendations.push('Build predictable outbound sales processes');
  } else if (primary[0] === 'C' && primary[1] > 50) {
    recommendations.push('Launch community platform and engagement programs');
    recommendations.push('Develop user-generated content and advocacy initiatives');
  }
  
  // Secondary strategy recommendation
  const secondary = sorted[1];
  if (secondary[1] > 40) {
    if (secondary[0] === 'E') {
      recommendations.push('Explore marketplace and integration opportunities');
    } else if (secondary[0] === 'P') {
      recommendations.push('Optimize for self-service adoption');
    } else if (secondary[0] === 'I') {
      recommendations.push('Invest in demand generation and ABM');
    } else if (secondary[0] === 'C') {
      recommendations.push('Foster peer-to-peer learning and support');
    }
  }
  
  // Add stage-specific recommendations
  if (data.business_stage === 'MVP' || data.business_stage === 'Pre-launch') {
    recommendations.push('Focus on product-market fit validation');
  } else if (data.business_stage === 'Scale' || data.business_stage === 'Enterprise') {
    recommendations.push('Build scalable go-to-market infrastructure');
  }
  
  return recommendations.join('; ');
}

function generateQuarterlyMilestones(scores, data) {
  const primary = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  
  const milestones = [
    {
      quarter: 'Q1',
      focus: 'Foundation',
      target_improvement: 5,
      key_actions: getQuarterActions(primary, 'Q1', data)
    },
    {
      quarter: 'Q2',
      focus: 'Implementation',
      target_improvement: 10,
      key_actions: getQuarterActions(primary, 'Q2', data)
    },
    {
      quarter: 'Q3',
      focus: 'Scaling',
      target_improvement: 15,
      key_actions: getQuarterActions(primary, 'Q3', data)
    },
    {
      quarter: 'Q4',
      focus: 'Optimization',
      target_improvement: 20,
      key_actions: getQuarterActions(primary, 'Q4', data)
    }
  ];
  
  return milestones;
}

function getQuarterActions(strategy, quarter, data) {
  const actions = {
    'E': {
      'Q1': 'Identify and onboard 5-10 strategic partners',
      'Q2': 'Launch co-marketing campaigns with top partners',
      'Q3': 'Build partner portal and certification program',
      'Q4': 'Achieve 30% revenue through partner channels'
    },
    'P': {
      'Q1': 'Launch self-service trial with optimized onboarding',
      'Q2': 'Implement product-led growth loops',
      'Q3': 'Achieve 50% self-service customer acquisition',
      'Q4': 'Launch freemium tier for market expansion'
    },
    'I': {
      'Q1': 'Build content library and SEO foundation',
      'Q2': 'Launch outbound SDR team and processes',
      'Q3': 'Optimize CAC and implement ABM',
      'Q4': 'Achieve predictable pipeline generation'
    },
    'C': {
      'Q1': 'Launch community platform with 100+ members',
      'Q2': 'Host first community event or meetup',
      'Q3': 'Build ambassador and advocacy programs',
      'Q4': 'Achieve 25% support deflection through community'
    }
  };
  
  return actions[strategy]?.[quarter] || 'Continue optimization and testing';
}

// Export configuration for Netlify
export const config = {
  path: "/api/epic-scores"
};