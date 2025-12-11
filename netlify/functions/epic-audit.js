// netlify/functions/epic-audit.js
// Enhanced EPIC Framework Audit with persistent scoring and 6-month roadmap

import { getStore } from '@netlify/blobs';

const EPIC_AUDIT_ENGINE = {
  // Store previous audits for progress tracking
  async storePreviousAudit(consultationId, auditData) {
    try {
      const store = getStore('epic-audits');
      await store.set(consultationId, JSON.stringify({
        ...auditData,
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error storing audit:', error);
      return false;
    }
  },

  // Retrieve previous audits for progress comparison
  async getPreviousAudits(companyId) {
    try {
      const store = getStore('epic-audits');
      const audits = [];
      
      // Get all audits for this company
      for await (const entry of store.list({ prefix: companyId })) {
        const audit = await store.get(entry.key);
        if (audit) {
          audits.push(JSON.parse(audit));
        }
      }
      
      return audits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error retrieving audits:', error);
      return [];
    }
  },

  // Calculate progress from previous audits
  calculateProgress(currentScores, previousAudits) {
    if (!previousAudits || previousAudits.length === 0) {
      return {
        is_first_audit: true,
        message: 'Initial baseline audit - no previous data for comparison'
      };
    }

    const mostRecent = previousAudits[0];
    const progress = {
      is_first_audit: false,
      days_since_last_audit: Math.floor((new Date() - new Date(mostRecent.timestamp)) / (1000 * 60 * 60 * 24)),
      score_changes: {
        ecosystem: currentScores.ecosystem_score - mostRecent.ecosystem_score,
        product_led: currentScores.product_led_score - mostRecent.product_led_score,
        inbound: currentScores.inbound_score - mostRecent.inbound_score,
        community: currentScores.community_score - mostRecent.community_score,
        overall: Math.round((currentScores.ecosystem_score + currentScores.product_led_score + 
                            currentScores.inbound_score + currentScores.community_score) / 4) -
                Math.round((mostRecent.ecosystem_score + mostRecent.product_led_score + 
                           mostRecent.inbound_score + mostRecent.community_score) / 4)
      },
      improvements: [],
      regressions: [],
      trend: 'stable'
    };

    // Identify improvements and regressions
    Object.entries(progress.score_changes).forEach(([area, change]) => {
      if (area !== 'overall') {
        if (change > 5) {
          progress.improvements.push({
            area: this.formatEPICArea(area.replace('_', ' ')),
            change: `+${change}`,
            status: 'improved'
          });
        } else if (change < -5) {
          progress.regressions.push({
            area: this.formatEPICArea(area.replace('_', ' ')),
            change: change.toString(),
            status: 'regressed'
          });
        }
      }
    });

    // Determine overall trend
    if (progress.score_changes.overall > 5) progress.trend = 'improving';
    else if (progress.score_changes.overall < -5) progress.trend = 'declining';

    // Historical trend analysis
    if (previousAudits.length >= 3) {
      progress.quarterly_trend = this.analyzeQuarterlyTrend(currentScores, previousAudits);
    }

    return progress;
  },

  analyzeQuarterlyTrend(currentScores, previousAudits) {
    // Get audits from ~90 days ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
    
    const quarterlyAudit = previousAudits.find(audit => {
      const auditDate = new Date(audit.timestamp);
      return Math.abs(auditDate - threeMonthsAgo) < 15 * 24 * 60 * 60 * 1000; // Within 15 days
    });

    if (!quarterlyAudit) {
      return null;
    }

    return {
      quarterly_change: {
        ecosystem: currentScores.ecosystem_score - quarterlyAudit.ecosystem_score,
        product_led: currentScores.product_led_score - quarterlyAudit.product_led_score,
        inbound: currentScores.inbound_score - quarterlyAudit.inbound_score,
        community: currentScores.community_score - quarterlyAudit.community_score
      },
      quarter_over_quarter_growth: Math.round(
        ((currentScores.ecosystem_score + currentScores.product_led_score + 
          currentScores.inbound_score + currentScores.community_score) / 4) -
        ((quarterlyAudit.ecosystem_score + quarterlyAudit.product_led_score + 
          quarterlyAudit.inbound_score + quarterlyAudit.community_score) / 4)
      )
    };
  },

  // Generate comprehensive 6-month roadmap
  generateSixMonthRoadmap(inputData, scores, maturityLevel) {
    const { industry, company_stage, focus_areas } = inputData;
    
    // Determine primary and secondary focus based on scores and focus areas
    const scoreMap = {
      ecosystem: scores.ecosystem_score,
      product_led: scores.product_led_score,
      inbound: scores.inbound_score,
      community: scores.community_score
    };

    // Sort by score to find strengths and gaps
    const sortedAreas = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
    const primaryFocus = sortedAreas[0][0];
    const secondaryFocus = sortedAreas[1][0];
    const improvementArea1 = sortedAreas[2][0];
    const improvementArea2 = sortedAreas[3][0];

    const roadmap = {
      days_1_30_foundation: this.generateMonthOneActivities(primaryFocus, improvementArea1, inputData),
      days_31_60_implementation: this.generateMonthTwoActivities(primaryFocus, secondaryFocus, inputData),
      q1_90_days_scale: this.generateQuarterOneActivities(primaryFocus, secondaryFocus, improvementArea1, inputData),
      q2_180_days_optimize: this.generateQuarterTwoActivities(scores, maturityLevel, inputData),
      
      // Quarterly score targets
      score_targets: {
        current: {
          ecosystem: scores.ecosystem_score,
          product_led: scores.product_led_score,
          inbound: scores.inbound_score,
          community: scores.community_score,
          overall: Math.round((scores.ecosystem_score + scores.product_led_score + 
                              scores.inbound_score + scores.community_score) / 4)
        },
        q1_target: this.calculateQuarterlyTargets(scores, 1),
        q2_target: this.calculateQuarterlyTargets(scores, 2)
      },
      
      // Key milestones
      milestones: this.generateKeyMilestones(primaryFocus, secondaryFocus, inputData),
      
      // Success metrics
      success_metrics: this.generateSuccessMetrics(primaryFocus, secondaryFocus, industry)
    };

    return roadmap;
  },

  generateMonthOneActivities(primaryFocus, improvementArea, inputData) {
    const activities = {
      ecosystem: [
        'Complete partner ecosystem audit and gap analysis',
        'Identify and prioritize top 20 strategic partnership opportunities',
        'Develop partnership value proposition and pitch deck'
      ],
      product_led: [
        'Conduct comprehensive user onboarding audit',
        'Implement product analytics and user behavior tracking',
        'Map user activation journey and identify friction points'
      ],
      inbound: [
        'Complete buyer persona research and journey mapping',
        'Audit existing content and identify high-intent keyword gaps',
        'Develop 90-day content calendar aligned with buyer journey'
      ],
      community: [
        'Define community vision, mission, and value proposition',
        'Research and select community platform and tools',
        'Recruit founding members and community champions'
      ]
    };

    const primaryActivities = activities[primaryFocus] || activities.inbound;
    const improvementActivities = activities[improvementArea] ? [activities[improvementArea][0]] : [];

    return [
      ...primaryActivities,
      ...improvementActivities
    ].slice(0, 5);
  },

  generateMonthTwoActivities(primaryFocus, secondaryFocus, inputData) {
    const activities = {
      ecosystem: [
        'Launch pilot ABM campaigns for top 10 enterprise accounts',
        'Establish first 3 strategic technology partnerships',
        'Implement partner portal and enablement materials'
      ],
      product_led: [
        'Launch optimized onboarding flow with A/B testing',
        'Implement product-qualified lead (PQL) scoring system',
        'Deploy in-app engagement and expansion prompts'
      ],
      inbound: [
        'Launch thought leadership content series',
        'Implement marketing automation and lead scoring',
        'Begin SEO optimization for priority keywords'
      ],
      community: [
        'Launch community with initial high-value content',
        'Implement engagement programs and recognition systems',
        'Host first community event or webinar'
      ]
    };

    return [
      ...activities[primaryFocus].slice(0, 2),
      ...activities[secondaryFocus].slice(0, 2)
    ].slice(0, 5);
  },

  generateQuarterOneActivities(primaryFocus, secondaryFocus, improvementArea, inputData) {
    const activities = {
      ecosystem: [
        'Scale ABM program to 50+ target accounts',
        'Launch partner co-marketing campaigns',
        'Implement channel partner certification program',
        'Measure partnership-driven pipeline contribution'
      ],
      product_led: [
        'Optimize trial-to-paid conversion funnel',
        'Launch product virality and referral features',
        'Implement usage-based expansion triggers',
        'Measure product-led revenue contribution'
      ],
      inbound: [
        'Scale content production to 4+ pieces per week',
        'Launch paid media campaigns for content amplification',
        'Optimize conversion paths and landing pages',
        'Measure content-influenced pipeline'
      ],
      community: [
        'Scale community to 500+ active members',
        'Launch user-generated content program',
        'Implement community-driven product feedback loop',
        'Measure community impact on retention'
      ]
    };

    return [
      ...activities[primaryFocus].slice(0, 2),
      ...activities[secondaryFocus].slice(0, 1),
      ...activities[improvementArea].slice(0, 1),
      'Conduct quarterly EPIC audit to measure progress'
    ];
  },

  generateQuarterTwoActivities(scores, maturityLevel, inputData) {
    const activities = [];

    if (maturityLevel === 'Advanced') {
      activities.push(
        'Fine-tune GTM engine for maximum efficiency',
        'Expand into new market segments or geographies',
        'Launch advanced automation and AI-driven optimization',
        'Develop competitive moat through unique GTM advantages'
      );
    } else if (maturityLevel === 'Developing') {
      activities.push(
        'Double down on highest-performing GTM channels',
        'Expand successful programs to new segments',
        'Implement advanced analytics and attribution',
        'Build scalable GTM operations infrastructure'
      );
    } else {
      activities.push(
        'Solidify foundation in primary EPIC component',
        'Begin expansion into secondary GTM motion',
        'Establish consistent GTM metrics and reporting',
        'Build GTM team capabilities and processes'
      );
    }

    activities.push('Conduct comprehensive 6-month EPIC review and planning session');

    return activities;
  },

  calculateQuarterlyTargets(currentScores, quarter) {
    // Conservative growth targets based on current maturity
    const avgScore = Math.round((currentScores.ecosystem_score + currentScores.product_led_score + 
                                 currentScores.inbound_score + currentScores.community_score) / 4);
    
    let growthRate;
    if (avgScore < 40) growthRate = 0.20; // 20% growth for low scores
    else if (avgScore < 60) growthRate = 0.15; // 15% growth for medium scores
    else if (avgScore < 80) growthRate = 0.10; // 10% growth for high scores
    else growthRate = 0.05; // 5% growth for advanced scores

    const multiplier = quarter === 1 ? (1 + growthRate) : (1 + growthRate * 2);

    return {
      ecosystem: Math.min(100, Math.round(currentScores.ecosystem_score * multiplier)),
      product_led: Math.min(100, Math.round(currentScores.product_led_score * multiplier)),
      inbound: Math.min(100, Math.round(currentScores.inbound_score * multiplier)),
      community: Math.min(100, Math.round(currentScores.community_score * multiplier)),
      overall: Math.min(100, Math.round(avgScore * multiplier))
    };
  },

  generateKeyMilestones(primaryFocus, secondaryFocus, inputData) {
    const milestones = {
      month_1: `Complete ${this.formatEPICArea(primaryFocus)} foundation setup`,
      month_2: `Launch initial ${this.formatEPICArea(primaryFocus)} initiatives`,
      quarter_1: `Achieve measurable impact from ${this.formatEPICArea(primaryFocus)} strategy`,
      quarter_2: `Scale successful programs and expand into ${this.formatEPICArea(secondaryFocus)}`
    };

    return milestones;
  },

  generateSuccessMetrics(primaryFocus, secondaryFocus, industry) {
    const metrics = {
      ecosystem: [
        'Partner-sourced pipeline: Target 30% of total pipeline',
        'Strategic accounts engaged: 50+ enterprise accounts',
        'Partner satisfaction score: >8/10'
      ],
      product_led: [
        'Trial-to-paid conversion: >15%',
        'Product qualified leads: 100+ monthly',
        'User activation rate: >40%'
      ],
      inbound: [
        'Organic traffic growth: 50% QoQ',
        'Content-influenced pipeline: 40% of total',
        'Lead-to-customer conversion: >10%'
      ],
      community: [
        'Community engagement rate: >25%',
        'User-generated content: 20+ pieces monthly',
        'Community-driven retention: 90%+'
      ]
    };

    return [
      ...metrics[primaryFocus].slice(0, 2),
      ...metrics[secondaryFocus].slice(0, 1)
    ];
  },

  // Existing assessment methods remain the same...
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
    const roadmap = this.generateSixMonthRoadmap(inputData, scores, maturityLevel);

    return {
      overall_score,
      maturity_level: maturityLevel,
      ...scores,
      detailed_assessment: assessment,
      priority_recommendations: recommendations,
      implementation_roadmap: roadmap
    };
  },

  // [Include all other existing methods from the original file...]
  // assessEcosystemMaturity, assessProductLedMaturity, assessInboundMaturity, 
  // assessCommunityMaturity, determineMaturityLevel, generateDetailedAssessment,
  // formatEPICArea, getAreaDescription, generateMaturityInsight,
  // getIndustryOpportunities, generatePriorityRecommendations,
  // getAreaSpecificRecommendations

  // Keep all existing assessment methods unchanged
  assessEcosystemMaturity(inputData) {
    const { current_gtm, industry, company_stage, current_metrics } = inputData;
    
    let score = 30; // Base score
    
    // GTM approach assessment
    if (current_gtm === 'partner-led') score += 30;
    else if (current_gtm === 'direct-sales') score += 20;
    else if (current_gtm === 'hybrid') score += 25;
    else if (current_gtm === 'enterprise-sales') score += 25;
    
    // Industry factors
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
    
    // Company stage
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
    
    // Metrics indicators
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
    
    // Industry inbound fit
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
    
    // Company stage
    const stageCommunityReadiness = {
      'startup': 5,
      'growth': 15,
      'scale': 25,
      'enterprise': 20,
      'bootstrapped-pmf': 10,
      'venture-series-a': 18
    };
    score += stageCommunityReadiness[company_stage?.toLowerCase()] || 10;
    
    // GTM approach
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
  }
};

// Main Netlify function (ES6 export)
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
    const inputData = await req.json();
    
    // Validate required fields
    if (!inputData.company) {
      return new Response(JSON.stringify({
        error: 'Missing required field: company is required'
      }), {
        status: 400,
        headers
      });
    }

    // Generate unique company ID for tracking
    const companyId = inputData.company_id || 
                      inputData.company.toLowerCase().replace(/\s+/g, '-');
    const consultationId = `EPIC-AUDIT-${companyId}-${Date.now()}`;

    // Perform EPIC framework audit
    const auditResults = EPIC_AUDIT_ENGINE.assessEPICMaturity(inputData);

    // Retrieve previous audits for progress tracking
    const previousAudits = await EPIC_AUDIT_ENGINE.getPreviousAudits(companyId);
    
    // Calculate progress from previous audits
    const progressAnalysis = EPIC_AUDIT_ENGINE.calculateProgress(auditResults, previousAudits);

    // Store current audit for future comparison
    await EPIC_AUDIT_ENGINE.storePreviousAudit(consultationId, {
      company_id: companyId,
      ...auditResults,
      input_data: inputData
    });

    return new Response(JSON.stringify({
      status: 'success',
      audit_results: auditResults,
      progress_analysis: progressAnalysis,
      consultation_id: consultationId,
      company_id: companyId,
      timestamp: new Date().toISOString(),
      methodology: 'EPIC Framework Maturity Assessment v2.0',
      generated_by: 'GTM Alpha Engine - Shashwat Ghosh',
      
      summary: {
        overall_maturity: auditResults.maturity_level,
        current_scores: {
          overall: auditResults.overall_score,
          ecosystem: auditResults.ecosystem_score,
          product_led: auditResults.product_led_score,
          inbound: auditResults.inbound_score,
          community: auditResults.community_score
        },
        strongest_area: auditResults.detailed_assessment.strengths[0]?.area,
        improvement_focus: auditResults.detailed_assessment.gaps[0]?.area,
        q1_target: auditResults.implementation_roadmap.score_targets.q1_target.overall,
        q2_target: auditResults.implementation_roadmap.score_targets.q2_target.overall,
        progress_trend: progressAnalysis.trend || 'initial baseline',
        priority_actions: auditResults.priority_recommendations.slice(0, 3)
      },
      
      next_actions: [
        'Review detailed EPIC assessment and 6-month roadmap',
        'Focus on Days 1-30 foundation activities',
        'Schedule monthly check-ins to track progress',
        'Plan quarterly EPIC re-assessment to measure improvement'
      ],
      
      persistence: {
        stored: true,
        tracking_enabled: true,
        next_audit_recommended: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        historical_audits_available: previousAudits.length
      }
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error in EPIC audit:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers
    });
  }
};

// Export configuration for Netlify
export const config = {
  path: "/api/epic-audit"
};