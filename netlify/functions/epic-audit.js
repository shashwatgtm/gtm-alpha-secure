// netlify/functions/epic-audit.js
// Real EPIC Framework Audit using authentic analysis logic

const EPIC_AUDIT_ENGINE = {
  // Comprehensive EPIC assessment based on real methodology
  assessEPICMaturity(inputData) {
    const { company, current_gtm, focus_areas, industry, company_stage, current_metrics } = inputData;
    
    const scores = {
      ecosystem_score: this.assessEcosystemMaturity(inputData),
      product_led_score: this.assessProductLedMaturity(inputData),
      inbound_score: this.assessInboundMaturity(inputData),
      community_score: this.assessCommunityMaturity(inputData)
    };

    // Calculate overall score
    const overall_score = Math.round((scores.ecosystem_score + scores.product_led_score + scores.inbound_score + scores.community_score) / 4);

    const assessment = this.generateDetailedAssessment(inputData, scores);
    const recommendations = this.generatePriorityRecommendations(inputData, scores);
    const maturityLevel = this.determineMaturityLevel(overall_score);
    const nextSteps = this.generateNextSteps(scores, maturityLevel);

    return {
      overall_score,
      maturity_level: maturityLevel,
      ...scores,
      detailed_assessment: assessment,
      priority_recommendations: recommendations,
      next_steps: nextSteps
    };
  },

  assessEcosystemMaturity(inputData) {
    const { current_gtm, industry, company_stage, current_metrics } = inputData;
    
    let score = 30; // Base score
    
    // GTM approach assessment
    if (current_gtm === 'partner-led') score += 30;
    else if (current_gtm === 'direct-sales') score += 20;
    else if (current_gtm === 'hybrid') score += 25;
    else if (current_gtm === 'enterprise-sales') score += 25;
    
    // Industry factors (some industries naturally require stronger ecosystems)
    const industryBonus = {
      'fintech': 20,
      'healthcare': 25,
      'enterprise-software': 20,
      'logistics': 15,
      'saas': 10,
      'technology': 15,
      'manufacturing': 20,
      'consulting': 15
    };
    score += industryBonus[industry?.toLowerCase()] || 5;
    
    // Company stage (more mature companies should have better ecosystems)
    const stageBonus = {
      'startup': 0,
      'growth': 10,
      'scale': 20,
      'enterprise': 25,
      'bootstrapped-pmf': 5,
      'venture-seed': 8,
      'venture-series-a': 15
    };
    score += stageBonus[company_stage?.toLowerCase()] || 5;
    
    // Metrics-based assessment
    if (current_metrics?.conversion_rate > 5) score += 10;
    if (current_metrics?.customer_acquisition_cost < 200) score += 15;
    if (current_metrics?.average_deal_size > 10000) score += 10;
    
    return Math.min(100, Math.max(0, score));
  },

  assessProductLedMaturity(inputData) {
    const { current_gtm, industry, current_metrics, company_stage } = inputData;
    
    let score = 25; // Base score
    
    // GTM approach assessment
    if (current_gtm === 'product-led') score += 40;
    else if (current_gtm === 'hybrid') score += 20;
    else if (current_gtm === 'inbound') score += 15;
    else if (current_gtm === 'freemium') score += 35;
    
    // Industry PLG readiness
    const industryPLGFit = {
      'saas': 25,
      'technology': 20,
      'edtech': 20,
      'ecommerce': 15,
      'fintech': 10,
      'healthcare': 5,
      'logistics': 10,
      'developer-tools': 30
    };
    score += industryPLGFit[industry?.toLowerCase()] || 5;
    
    // Metrics indicators of PLG maturity
    if (current_metrics?.monthly_active_users > 1000) score += 15;
    if (current_metrics?.product_adoption_rate > 60) score += 10;
    if (current_metrics?.trial_to_paid_conversion > 15) score += 15;
    if (current_metrics?.user_activation_rate > 40) score += 10;
    
    return Math.min(100, Math.max(0, score));
  },

  assessInboundMaturity(inputData) {
    const { current_gtm, industry, current_metrics, company_stage } = inputData;
    
    let score = 35; // Base score
    
    // GTM approach assessment
    if (current_gtm === 'inbound') score += 35;
    else if (current_gtm === 'hybrid') score += 25;
    else if (current_gtm === 'content-marketing') score += 30;
    else if (current_gtm === 'outbound') score += 10;
    
    // All industries can benefit from inbound, some more than others
    const industryInboundFit = {
      'saas': 20,
      'technology': 20,
      'edtech': 15,
      'healthcare': 15,
      'fintech': 15,
      'consulting': 20,
      'ecommerce': 10,
      'b2b-services': 18
    };
    score += industryInboundFit[industry?.toLowerCase()] || 10;
    
    // Metrics indicators
    if (current_metrics?.monthly_organic_traffic > 10000) score += 15;
    if (current_metrics?.content_engagement_rate > 5) score += 10;
    if (current_metrics?.lead_to_customer_conversion > 10) score += 10;
    if (current_metrics?.content_influenced_pipeline > 30) score += 10;
    
    return Math.min(100, Math.max(0, score));
  },

  assessCommunityMaturity(inputData) {
    const { current_gtm, industry, company_stage, current_metrics } = inputData;
    
    let score = 20; // Base score
    
    // Community-friendly industries
    const industryCommunityFit = {
      'technology': 25,
      'saas': 20,
      'edtech': 25,
      'consulting': 20,
      'healthcare': 15,
      'fintech': 10,
      'ecommerce': 15,
      'developer-tools': 30,
      'open-source': 35
    };
    score += industryCommunityFit[industry?.toLowerCase()] || 5;
    
    // Company stage (community building requires resources and time)
    const stageCommunityReadiness = {
      'startup': 5,
      'growth': 15,
      'scale': 25,
      'enterprise': 20,
      'bootstrapped-pmf': 10,
      'venture-series-a': 18
    };
    score += stageCommunityReadiness[company_stage?.toLowerCase()] || 10;
    
    // Community benefits from longer-term thinking
    if (current_gtm === 'community-led') score += 30;
    else if (current_gtm === 'hybrid' || current_gtm === 'inbound') score += 15;
    
    // Community metrics
    if (current_metrics?.community_engagement_rate > 20) score += 15;
    if (current_metrics?.user_generated_content > 10) score += 10;
    if (current_metrics?.brand_advocacy_score > 70) score += 15;
    
    return Math.min(100, Math.max(0, score));
  },

  determineMaturityLevel(overall_score) {
    if (overall_score >= 80) return 'Advanced';
    if (overall_score >= 60) return 'Developing';
    if (overall_score >= 40) return 'Basic';
    return 'Foundational';
  },

  generateDetailedAssessment(inputData, scores) {
    const { company, current_gtm, industry } = inputData;
    
    // Identify top 2 strengths and top 2 gaps
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const strengths = sortedScores.slice(0, 2).map(([key, score]) => {
      const area = key.replace('_score', '').replace('_', ' ');
      return {
        area: this.formatEPICArea(area),
        score: score,
        description: this.getAreaDescription(area, 'strength')
      };
    });
    
    const gaps = sortedScores.slice(-2).map(([key, score]) => {
      const area = key.replace('_score', '').replace('_', ' ');
      return {
        area: this.formatEPICArea(area),
        score: score,
        description: this.getAreaDescription(area, 'gap')
      };
    });

    // Industry-specific opportunities
    const opportunities = this.getIndustryOpportunities(industry, scores);

    return {
      strengths,
      gaps,
      opportunities,
      overall_maturity: this.generateMaturityInsight(inputData, scores)
    };
  },

  formatEPICArea(area) {
    const mapping = {
      'ecosystem': 'Ecosystem & ABM',
      'product led': 'Product-Led Growth',
      'inbound': 'Inbound & Outbound',
      'community': 'Community-Led'
    };
    return mapping[area] || area;
  },

  getAreaDescription(area, type) {
    const descriptions = {
      ecosystem: {
        strength: 'Strong partner relationships and account-based marketing capabilities',
        gap: 'Limited partner ecosystem and enterprise sales approach needs development'
      },
      'product led': {
        strength: 'Product drives growth with strong user adoption and self-service capabilities',
        gap: 'Product experience needs optimization for self-service growth'
      },
      inbound: {
        strength: 'Effective content strategy and demand generation capabilities',
        gap: 'Content marketing and inbound lead generation needs enhancement'
      },
      community: {
        strength: 'Active community engagement and brand advocacy',
        gap: 'Community building and thought leadership requires focus'
      }
    };

    return descriptions[area]?.[type] || `${type} in ${area}`;
  },

  generateMaturityInsight(inputData, scores) {
    const { company_stage, industry, current_gtm } = inputData;
    const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);
    
    let insight = `Your ${company_stage} ${industry} company shows `;
    
    if (avgScore >= 70) {
      insight += "strong GTM maturity across the EPIC framework. Focus on optimization and scaling successful motions.";
    } else if (avgScore >= 50) {
      insight += "developing GTM capabilities with clear opportunities for strategic improvement.";
    } else {
      insight += "foundational GTM approach with significant potential for systematic enhancement.";
    }

    return insight;
  },

  getIndustryOpportunities(industry, scores) {
    const industryOpportunities = {
      'saas': [
        'Product-led growth through freemium model implementation',
        'Developer community building for API adoption',
        'Integration ecosystem for platform extensibility'
      ],
      'fintech': [
        'Regulatory compliance partnership ecosystem',
        'Trust-building through thought leadership content',
        'Financial advisor and broker channel development'
      ],
      'healthcare': [
        'Healthcare provider partnership network',
        'Compliance-focused content marketing',
        'Medical professional community engagement'
      ],
      'logistics': [
        'Carrier and fulfillment partner ecosystem',
        'Operations-focused inbound content strategy',
        'Supply chain professional community'
      ],
      'technology': [
        'Developer ecosystem and API partnerships',
        'Technical content marketing and SEO',
        'Open source community contributions'
      ],
      'edtech': [
        'Educational institution partnerships',
        'Content marketing for educators',
        'Student and teacher community building'
      ]
    };

    return industryOpportunities[industry?.toLowerCase()] || [
      'Partnership ecosystem development',
      'Industry-specific content marketing',
      'Professional community engagement'
    ];
  },

  generatePriorityRecommendations(inputData, scores) {
    const recommendations = [];
    
    // Generate recommendations based on score gaps and focus areas
    const focusAreas = inputData.focus_areas || [];
    const scoreMap = {
      'ecosystem': scores.ecosystem_score,
      'product_led': scores.product_led_score,
      'inbound': scores.inbound_score,
      'community': scores.community_score
    };

    // High-impact, low-score areas get priority
    Object.entries(scoreMap).forEach(([area, score]) => {
      if (score < 50 && (focusAreas.length === 0 || focusAreas.includes(area))) {
        const recs = this.getAreaSpecificRecommendations(area, inputData);
        recommendations.push(...recs.map(rec => ({
          area: this.formatEPICArea(area.replace('_', ' ')),
          recommendation: rec.action,
          priority: score < 30 ? 'high' : 'medium',
          effort: rec.effort,
          impact: rec.impact,
          timeline: rec.timeline
        })));
      }
    });

    // If no low scores, focus on highest-scoring areas for optimization
    if (recommendations.length === 0) {
      const highestArea = Object.entries(scoreMap).sort((a, b) => b[1] - a[1])[0][0];
      const recs = this.getAreaSpecificRecommendations(highestArea, inputData);
      recommendations.push(...recs.slice(0, 3).map(rec => ({
        area: this.formatEPICArea(highestArea.replace('_', ' ')),
        recommendation: rec.action,
        priority: 'medium',
        effort: rec.effort,
        impact: rec.impact,
        timeline: rec.timeline
      })));
    }

    return recommendations.slice(0, 8); // Return top 8 recommendations
  },

  getAreaSpecificRecommendations(area, inputData) {
    const { industry, company_stage, current_gtm } = inputData;
    
    const recommendationMap = {
      ecosystem: [
        {
          action: 'Map current partner ecosystem and identify strategic partnership gaps',
          effort: 'medium',
          impact: 'high',
          timeline: '30 days'
        },
        {
          action: 'Develop Account-Based Marketing strategy for top 50 enterprise prospects',
          effort: 'high',
          impact: 'high',
          timeline: '60 days'
        },
        {
          action: 'Create partner enablement program with co-marketing materials',
          effort: 'medium',
          impact: 'medium',
          timeline: '45 days'
        },
        {
          action: 'Implement relationship intelligence tools for account mapping',
          effort: 'low',
          impact: 'medium',
          timeline: '14 days'
        }
      ],
      product_led: [
        {
          action: 'Audit user onboarding flow and eliminate friction points',
          effort: 'medium',
          impact: 'high',
          timeline: '30 days'
        },
        {
          action: 'Implement product usage analytics and engagement scoring',
          effort: 'high',
          impact: 'high',
          timeline: '45 days'
        },
        {
          action: 'Design self-service trial experience with guided product discovery',
          effort: 'high',
          impact: 'high',
          timeline: '60 days'
        },
        {
          action: 'A/B testing framework for conversion optimization',
          effort: 'medium',
          impact: 'medium',
          timeline: '30 days'
        }
      ],
      inbound: [
        {
          action: 'Develop comprehensive buyer persona research and journey mapping',
          effort: 'medium',
          impact: 'high',
          timeline: '30 days'
        },
        {
          action: 'Launch thought leadership content series targeting decision makers',
          effort: 'high',
          impact: 'high',
          timeline: '60 days'
        },
        {
          action: 'Implement marketing automation workflows and lead scoring',
          effort: 'medium',
          impact: 'medium',
          timeline: '45 days'
        },
        {
          action: 'SEO optimization for high-intent buyer keywords',
          effort: 'medium',
          impact: 'medium',
          timeline: '90 days'
        }
      ],
      community: [
        {
          action: 'Define community vision and core value proposition for members',
          effort: 'low',
          impact: 'medium',
          timeline: '14 days'
        },
        {
          action: 'Launch industry community with expert positioning and valuable content',
          effort: 'high',
          impact: 'high',
          timeline: '90 days'
        },
        {
          action: 'Create customer advocacy program with testimonials and case studies',
          effort: 'medium',
          impact: 'medium',
          timeline: '60 days'
        },
        {
          action: 'Develop thought leadership content calendar based on community insights',
          effort: 'medium',
          impact: 'medium',
          timeline: '45 days'
        }
      ]
    };

    return recommendationMap[area] || [];
  },

  generateNextSteps(scores, maturityLevel) {
    const steps = [
      'Review detailed EPIC assessment and identify top priority areas',
      'Implement recommended actions based on effort vs impact matrix'
    ];

    if (maturityLevel === 'Foundational' || maturityLevel === 'Basic') {
      steps.push('Focus on building strong foundation in highest-scoring EPIC component');
      steps.push('Consider premium consultation for detailed implementation roadmap');
    } else if (maturityLevel === 'Developing') {
      steps.push('Optimize existing strengths while addressing key capability gaps');
      steps.push('Implement quarterly progress reviews to maintain momentum');
    } else {
      steps.push('Fine-tune advanced GTM strategies for maximum efficiency');
      steps.push('Consider enterprise consultation for scaling and optimization');
    }

    steps.push('Schedule follow-up EPIC assessment in 90 days to measure progress');

    return steps;
  }
};

// Main Netlify function
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
    const inputData = JSON.parse(event.body);
    
    // Validate required fields
    if (!inputData.company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required field: company is required'
        })
      };
    }

    // Perform EPIC framework audit
    const auditResults = EPIC_AUDIT_ENGINE.assessEPICMaturity(inputData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        audit_results: auditResults,
        consultation_id: `EPIC-AUDIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        methodology: 'EPIC Framework Maturity Assessment',
        generated_by: 'GTM Alpha Engine - Shashwat Ghosh',
        summary: {
          overall_maturity: auditResults.maturity_level,
          strongest_area: auditResults.detailed_assessment.strengths[0]?.area,
          improvement_focus: auditResults.detailed_assessment.gaps[0]?.area,
          priority_actions: auditResults.priority_recommendations.slice(0, 3)
        }
      })
    };

  } catch (error) {
    console.error('Error in EPIC audit:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};