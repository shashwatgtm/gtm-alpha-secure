// netlify/functions/roadmap.js
// Real GTM Implementation Roadmap using authentic planning methodology
// Updated timeline: 30 Days → 60 Days → First Quarter → Second Quarter

const ROADMAP_ENGINE = {
  // Generate comprehensive 6-month roadmap with quarterly structure
  generateImplementationRoadmap(inputData) {
    const { company, priorities, timeline, budget_range, team_size, industry } = inputData;
    
    // Analyze priorities and map to EPIC framework
    const epicPriorities = this.mapPrioritiesToEPIC(priorities);
    const resourceConstraints = this.analyzeResourceConstraints(budget_range, team_size);
    
    // Generate timeline-specific roadmap with quarterly structure
    const roadmap = this.createTimelinedRoadmap(epicPriorities, resourceConstraints, timeline, industry);
    const successMetrics = this.defineSuccessMetrics(priorities, timeline);
    const resourceRequirements = this.calculateResourceRequirements(roadmap, budget_range, team_size);
    const risks = this.identifyRisksAndMitigations(roadmap, resourceConstraints);

    return {
      roadmap,
      success_metrics: successMetrics,
      resource_requirements: resourceRequirements,
      risks_and_mitigations: risks
    };
  },

  mapPrioritiesToEPIC(priorities) {
    const priorityMapping = {
      'lead generation': { epic: ['I', 'P'], weight: 'high' },
      'customer acquisition': { epic: ['E', 'I'], weight: 'high' },
      'brand awareness': { epic: ['I', 'C'], weight: 'medium' },
      'customer retention': { epic: ['P', 'C'], weight: 'high' },
      'market expansion': { epic: ['E', 'I'], weight: 'medium' },
      'product adoption': { epic: ['P'], weight: 'high' },
      'sales enablement': { epic: ['E', 'I'], weight: 'medium' },
      'partnership development': { epic: ['E'], weight: 'medium' },
      'content marketing': { epic: ['I'], weight: 'medium' },
      'community building': { epic: ['C'], weight: 'low' },
      'conversion optimization': { epic: ['P', 'I'], weight: 'high' },
      'competitive differentiation': { epic: ['E', 'P'], weight: 'medium' }
    };

    const epicScores = { E: 0, P: 0, I: 0, C: 0 };
    
    priorities.forEach(priority => {
      const mapping = priorityMapping[priority.toLowerCase()];
      if (mapping) {
        const weight = mapping.weight === 'high' ? 3 : mapping.weight === 'medium' ? 2 : 1;
        mapping.epic.forEach(letter => {
          epicScores[letter] += weight;
        });
      }
    });

    // Determine primary and secondary focus
    const sorted = Object.entries(epicScores).sort((a, b) => b[1] - a[1]);
    return {
      primary: sorted[0][0],
      secondary: sorted[1][0],
      scores: epicScores
    };
  },

  analyzeResourceConstraints(budget_range, team_size) {
    const budgetTiers = {
      '<25k': 'minimal',
      '25k-50k': 'lean',
      '50k-100k': 'moderate',
      '100k-250k': 'substantial',
      '250k-500k': 'strong',
      '500k+': 'enterprise'
    };

    const teamTiers = {
      '1-2': 'startup',
      '3-5': 'small',
      '5-10': 'medium',
      '10-20': 'large',
      '20+': 'enterprise'
    };

    return {
      budget: budgetTiers[budget_range] || 'moderate',
      team: teamTiers[team_size] || 'medium',
      capacity: this.calculateCapacity(budgetTiers[budget_range], teamTiers[team_size])
    };
  },

  calculateCapacity(budgetTier, teamTier) {
    const budgetScore = { minimal: 1, lean: 2, moderate: 3, substantial: 4, strong: 5, enterprise: 6 };
    const teamScore = { startup: 1, small: 2, medium: 3, large: 4, enterprise: 5 };
    
    const totalScore = (budgetScore[budgetTier] || 3) + (teamScore[teamTier] || 3);
    
    if (totalScore <= 3) return 'constrained';
    if (totalScore <= 6) return 'moderate';
    if (totalScore <= 9) return 'strong';
    return 'high';
  },

  createTimelinedRoadmap(epicPriorities, resourceConstraints, timeline, industry) {
    const { primary, secondary } = epicPriorities;
    const { capacity } = resourceConstraints;
    
    // Get base roadmap template with quarterly structure
    const baseRoadmap = this.getEPICRoadmapTemplate(primary, secondary, industry);
    
    // Adjust for resource constraints
    const adjustedRoadmap = this.adjustForCapacity(baseRoadmap, capacity);
    
    // Fit to timeline
    return this.fitToTimeline(adjustedRoadmap, timeline);
  },

  getEPICRoadmapTemplate(primary, secondary, industry) {
    const templates = {
      E: { // Ecosystem & ABM
        days_30: [
          'Map current partner ecosystem and identify strategic gaps',
          'Develop ideal customer profile (ICP) for target accounts',
          'Research and prioritize top 50 enterprise prospects',
          'Create account mapping and stakeholder analysis'
        ],
        days_60: [
          'Launch pilot ABM campaigns for top 20 accounts',
          'Establish strategic partnerships with key solution providers',
          'Implement account intelligence and relationship mapping tools',
          'Create personalized outbound sequences for target accounts'
        ],
        first_quarter: [
          'Scale ABM approach with account-based journeys',
          'Expand partner ecosystem with joint go-to-market initiatives',
          'Launch partner enablement program with co-marketing materials',
          'Implement advanced account-based experience (ABX) across teams'
        ],
        second_quarter: [
          'Develop enterprise channel partner program with certification',
          'Launch strategic alliance partnerships with technology integrations',
          'Measure partnership-driven pipeline and optimize ROI',
          'Establish customer advisory board and reference program'
        ]
      },
      P: { // Product-Led Growth
        days_30: [
          'Audit user onboarding flow and identify friction points',
          'Implement product usage analytics and user tracking',
          'Create self-service trial experience design',
          'Establish product-qualified lead (PQL) scoring system'
        ],
        days_60: [
          'Launch optimized onboarding with progressive feature disclosure',
          'Implement automated engagement triggers and nudges',
          'A/B testing framework for conversion optimization',
          'Create in-product upgrade prompts and expansion paths'
        ],
        first_quarter: [
          'Scale PLG motions with automated user journey optimization',
          'Launch referral program and viral growth mechanisms',
          'Implement usage-based pricing and expansion revenue tracking',
          'Optimize product-market fit based on usage data'
        ],
        second_quarter: [
          'Launch advanced product-led sales (PLS) hybrid model',
          'Implement predictive analytics for user behavior and churn',
          'Develop enterprise PLG features with white-glove onboarding',
          'Create product-led customer success and expansion programs'
        ]
      },
      I: { // Inbound & Outbound
        days_30: [
          'Complete buyer persona research and journey mapping',
          'Audit content strategy and identify high-intent keywords',
          'Create editorial calendar aligned with sales cycles',
          'Set up marketing automation and lead scoring framework'
        ],
        days_60: [
          'Launch thought leadership content series targeting decision makers',
          'Implement SEO optimization for target keywords',
          'Begin hyper-personalized outbound campaigns',
          'Launch demand generation campaigns across multiple channels'
        ],
        first_quarter: [
          'Scale content distribution and amplification strategies',
          'Optimize conversion paths with landing page testing',
          'Implement attribution modeling for content-driven pipeline',
          'Launch account-based content strategy for enterprise'
        ],
        second_quarter: [
          'Develop industry thought leadership and speaking opportunities',
          'Launch advanced marketing automation with predictive scoring',
          'Implement omnichannel demand generation orchestration',
          'Create content-driven customer advocacy and expansion programs'
        ]
      },
      C: { // Community-Led
        days_30: [
          'Define community vision and value proposition',
          'Research community platforms and engagement strategies',
          'Create founding member outreach plan',
          'Develop community guidelines and moderation framework'
        ],
        days_60: [
          'Launch community with initial content and expert positioning',
          'Implement community engagement workflows',
          'Begin thought leadership content creation from community insights',
          'Establish community-driven feedback loops'
        ],
        first_quarter: [
          'Scale community growth with member-driven advocacy',
          'Launch community-influenced product development',
          'Measure community impact on customer acquisition and retention',
          'Create community-driven customer success programs'
        ],
        second_quarter: [
          'Develop community-led customer advisory and expansion programs',
          'Launch industry events and community-driven thought leadership',
          'Implement community influence on product roadmap and strategy',
          'Create community-powered partner and ecosystem development'
        ]
      }
    };

    // Get primary template and blend with secondary
    const primaryTemplate = templates[primary];
    const secondaryTemplate = templates[secondary];
    
    return {
      days_30: [...primaryTemplate.days_30, secondaryTemplate.days_30[0]],
      days_60: [...primaryTemplate.days_60, secondaryTemplate.days_60[0]],
      first_quarter: [...primaryTemplate.first_quarter, secondaryTemplate.first_quarter[0]],
      second_quarter: [...primaryTemplate.second_quarter, secondaryTemplate.second_quarter[0]]
    };
  },

  adjustForCapacity(roadmap, capacity) {
    const capacityMultipliers = {
      constrained: 0.6,
      moderate: 0.8,
      strong: 1.0,
      high: 1.2
    };

    const multiplier = capacityMultipliers[capacity] || 1.0;
    
    return {
      days_30: roadmap.days_30.map(task => ({
        task,
        owner: this.suggestOwner(task, capacity),
        deadline: this.calculateDeadline(task, 30, multiplier),
        success_metric: this.suggestSuccessMetric(task)
      })),
      days_60: roadmap.days_60.map(task => ({
        task,
        owner: this.suggestOwner(task, capacity),
        deadline: this.calculateDeadline(task, 60, multiplier),
        success_metric: this.suggestSuccessMetric(task)
      })),
      first_quarter: roadmap.first_quarter.map(task => ({
        task,
        owner: this.suggestOwner(task, capacity),
        deadline: this.calculateDeadline(task, 90, multiplier),
        success_metric: this.suggestSuccessMetric(task)
      })),
      second_quarter: roadmap.second_quarter.map(task => ({
        task,
        owner: this.suggestOwner(task, capacity),
        deadline: this.calculateDeadline(task, 180, multiplier),
        success_metric: this.suggestSuccessMetric(task)
      }))
    };
  },

  suggestOwner(task, capacity) {
    const taskOwnership = {
      'mapping': 'Marketing Manager',
      'research': 'Marketing Analyst',
      'content': 'Content Manager',
      'campaign': 'Growth Manager',
      'partnership': 'Business Development',
      'product': 'Product Manager',
      'automation': 'Marketing Ops',
      'community': 'Community Manager',
      'analytics': 'Data Analyst'
    };

    const taskLower = task.toLowerCase();
    for (const [keyword, owner] of Object.entries(taskOwnership)) {
      if (taskLower.includes(keyword)) {
        return capacity === 'constrained' ? 'Marketing Lead' : owner;
      }
    }
    
    return 'Marketing Team';
  },

  calculateDeadline(task, maxDays, multiplier) {
    const baseDeadline = Math.round(maxDays * 0.8); // Default to 80% of period
    const adjustedDeadline = Math.round(baseDeadline * multiplier);
    return `Day ${Math.min(maxDays, Math.max(7, adjustedDeadline))}`;
  },

  suggestSuccessMetric(task) {
    const metricMap = {
      'mapping': 'Strategic gaps identified and documented',
      'research': 'Target list created with contact details',
      'content': 'Content pieces published and promoted',
      'campaign': 'Campaign launched with initial results',
      'partnership': 'Partner agreements signed',
      'product': 'Feature released and adoption tracked',
      'automation': 'Workflows active with performance metrics',
      'community': 'Community launched with active members',
      'analytics': 'Tracking implemented with baseline metrics'
    };

    const taskLower = task.toLowerCase();
    for (const [keyword, metric] of Object.entries(metricMap)) {
      if (taskLower.includes(keyword)) return metric;
    }
    
    return 'Task completed with measurable outcome';
  },

  fitToTimeline(roadmap, timeline) {
    if (timeline === '30 days') {
      return {
        days_30: roadmap.days_30,
        focus: 'Foundation and Quick Wins'
      };
    } else if (timeline === '60 days') {
      return {
        days_30: roadmap.days_30,
        days_60: roadmap.days_60,
        focus: 'Implementation and Execution'
      };
    } else if (timeline === 'first quarter' || timeline === '90 days') {
      return {
        days_30: roadmap.days_30,
        days_60: roadmap.days_60,
        first_quarter: roadmap.first_quarter,
        focus: 'Scale and Systematic Growth'
      };
    } else {
      return {
        ...roadmap,
        focus: 'Complete Strategic Implementation'
      };
    }
  },

  defineSuccessMetrics(priorities, timeline) {
    const baselineMetrics = {
      lead_generation: {
        baseline: 100,
        target: timeline === '30 days' ? 150 : timeline === '60 days' ? 200 : timeline === 'first quarter' ? 300 : 500,
        metric: 'Monthly qualified leads'
      },
      customer_acquisition: {
        baseline: 10,
        target: timeline === '30 days' ? 15 : timeline === '60 days' ? 20 : timeline === 'first quarter' ? 30 : 50,
        metric: 'New customers per month'
      },
      conversion_rate: {
        baseline: 2.1,
        target: timeline === '30 days' ? 2.5 : timeline === '60 days' ? 3.0 : timeline === 'first quarter' ? 4.0 : 6.0,
        metric: 'Lead to customer conversion %'
      },
      brand_awareness: {
        baseline: 1000,
        target: timeline === '30 days' ? 1500 : timeline === '60 days' ? 2500 : timeline === 'first quarter' ? 5000 : 10000,
        metric: 'Brand mention volume'
      }
    };

    const relevantMetrics = {};
    priorities.forEach(priority => {
      const key = priority.toLowerCase().replace(' ', '_');
      if (baselineMetrics[key]) {
        relevantMetrics[key] = baselineMetrics[key];
      }
    });

    return Object.keys(relevantMetrics).length > 0 ? relevantMetrics : {
      overall_growth: {
        baseline: 100,
        target: timeline === '30 days' ? 120 : timeline === '60 days' ? 150 : timeline === 'first quarter' ? 200 : 300,
        metric: 'Overall GTM performance index'
      }
    };
  },

  calculateResourceRequirements(roadmap, budget_range, team_size) {
    return {
      budget_allocation: {
        content_creation: '25%',
        paid_advertising: '30%',
        tools_and_technology: '20%',
        events_and_partnerships: '15%',
        other: '10%'
      },
      team_requirements: this.suggestTeamRequirements(team_size),
      technology_stack: this.suggestTechnologyStack(budget_range)
    };
  },

  suggestTeamRequirements(team_size) {
    const teamSuggestions = {
      '1-2': ['Marketing generalist (1.0 FTE)', 'Design contractor (0.2 FTE)'],
      '3-5': ['Marketing manager (1.0 FTE)', 'Content creator (0.5 FTE)', 'Design support (0.3 FTE)'],
      '5-10': ['Marketing manager (1.0 FTE)', 'Content marketer (0.8 FTE)', 'Growth specialist (0.5 FTE)', 'Designer (0.5 FTE)'],
      '10-20': ['Marketing director (1.0 FTE)', 'Content manager (1.0 FTE)', 'Growth manager (0.8 FTE)', 'Marketing ops (0.5 FTE)', 'Designer (0.5 FTE)'],
      '20+': ['Marketing director (1.0 FTE)', 'Content team (2.0 FTE)', 'Growth team (1.5 FTE)', 'Marketing ops (1.0 FTE)', 'Design team (1.0 FTE)']
    };

    return teamSuggestions[team_size] || teamSuggestions['5-10'];
  },

  suggestTechnologyStack(budget_range) {
    const stackSuggestions = {
      '<25k': ['HubSpot CRM (free)', 'Mailchimp', 'Google Analytics', 'Canva'],
      '25k-50k': ['HubSpot Starter', 'ConvertKit', 'Google Analytics 4', 'Figma', 'Calendly'],
      '50k-100k': ['HubSpot Professional', 'Outreach', 'Google Analytics 4', 'Adobe Creative', 'Zoom', 'Slack'],
      '100k-250k': ['HubSpot Enterprise', 'Salesforce', 'Outreach', 'Google Analytics 4', 'Adobe Creative Suite', 'Zoom', 'Slack', 'Asana'],
      '250k-500k': ['Salesforce', 'Marketo', 'Outreach', 'Google Analytics 4', 'Adobe Creative Suite', 'ZoomInfo', 'Slack', 'Monday.com'],
      '500k+': ['Salesforce Enterprise', 'Marketo', 'Outreach', 'Google Analytics 4', 'Adobe Creative Suite', 'ZoomInfo', 'Slack', 'Asana', 'Tableau']
    };

    return stackSuggestions[budget_range] || stackSuggestions['50k-100k'];
  },

  identifyRisksAndMitigations(roadmap, resourceConstraints) {
    const commonRisks = [
      {
        risk: 'Content production delays affecting timeline',
        impact: 'medium',
        mitigation: 'Build content buffer and establish backup contractor relationships'
      },
      {
        risk: 'Limited team bandwidth for simultaneous initiatives',
        impact: 'high',
        mitigation: 'Prioritize high-impact activities and phase implementation'
      },
      {
        risk: 'Technology integration challenges',
        impact: 'medium',
        mitigation: 'Allocate buffer time for setup and testing phases'
      },
      {
        risk: 'Market response lower than expected',
        impact: 'high',
        mitigation: 'Implement weekly performance reviews and pivot strategies'
      },
      {
        risk: 'Extended timeline execution challenges',
        impact: 'medium',
        mitigation: 'Quarterly milestone reviews and strategy adjustments'
      }
    ];

    // Add capacity-specific risks
    if (resourceConstraints.capacity === 'constrained') {
      commonRisks.push({
        risk: 'Resource constraints limiting execution quality',
        impact: 'high',
        mitigation: 'Focus on highest-impact activities and consider external support'
      });
    }

    return commonRisks;
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
    if (!inputData.company || !inputData.priorities) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: company and priorities are required'
      }), {
        status: 400,
        headers
      });
    }

    // Generate implementation roadmap
    const roadmapResults = ROADMAP_ENGINE.generateImplementationRoadmap(inputData);

    return new Response(JSON.stringify({
      status: 'success',
      roadmap: roadmapResults.roadmap,
      success_metrics: roadmapResults.success_metrics,
      resource_requirements: roadmapResults.resource_requirements,
      risks_and_mitigations: roadmapResults.risks_and_mitigations,
      consultation_id: `ROADMAP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeline: inputData.timeline || '6 months',
      methodology: 'GTM Alpha Implementation Planning',
      generated_by: 'GTM Alpha Engine - Shashwat Ghosh',
      next_steps: [
        'Review and approve the implementation roadmap',
        'Assign ownership for each initiative to team members',
        'Set up tracking and measurement systems',
        'Begin execution with weekly progress reviews',
        'Schedule quarterly checkpoints for progress assessment and strategy adjustments'
      ]
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error in roadmap generation:', error);
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
  path: "/api/roadmap"
};