import { scoreEpic } from './epic-advanced.js';

// netlify/lib/analyze.js (internal module, not a public function)
// GTM Alpha Premium Audit report: EPIC framework scores, recommendations and a 6-month roadmap.

// Owner decision 2 (25 Sep 2026): the "digital presence analysis" never visited the website; it scored only whether a
// URL was typed. It stays in the code but is switched off, and the report does not mention it, until it really checks websites.
export const DIGITAL_PRESENCE_AUDIT_ENABLED = false;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const GTM_ALPHA_ENGINE = {
  // EPIC scoring: the documented advanced rubric (epic-advanced.js), 1 to 10 per motion.
  analyzeEPICFramework(inputData) {
    return scoreEpic(inputData);
  },

  // Enhanced strategic analysis with digital presence integration
  generateStrategicAnalysis(inputData, epic, digitalAnalysis = null) {
    const { company_name, business_stage, industry, gtm_challenge } = inputData;
    const epicScores = epic.scores;

    // Primary and secondary focus come from the EPIC result (highest scores; ties go E, P, C, I).
    const focusMap = {
      'E': 'Ecosystem & ABM-led Sales Motion',
      'P': 'Product-Led Growth Acceleration',
      'I': 'Inbound & Outbound Demand Generation',
      'C': 'Community-Led Growth Strategy'
    };
    const primaryFocus = focusMap[epic.primary.letter];
    const secondaryFocus = focusMap[epic.secondary.letter];

    // Generate consultation insights based on actual GTM Alpha methodology
    const insights = this.generateConsultationInsights(inputData, primaryFocus);
    // The recommendation rules were written for a 0 to 100 scale (gates at 70); a 1 to 10 score times 10 keeps their meaning.
    const hundredScale = { E: epicScores.E * 10, P: epicScores.P * 10, I: epicScores.I * 10, C: epicScores.C * 10 };
    const recommendations = this.generateActionableRecommendations(inputData, hundredScale, digitalAnalysis);
    const roadmap = this.generateGTMRoadmap(inputData, primaryFocus, secondaryFocus);
    const digitalInsights = digitalAnalysis ? this.generateDigitalInsights(digitalAnalysis) : null;

    return {
      primaryFocus,
      secondaryFocus,
      insights,
      recommendations,
      roadmap,
      digitalInsights,
      mentalVelocityAnalysis: this.generateMentalVelocityAnalysis(inputData)
    };
  },

  // Enhanced digital presence analysis for integration
  async analyzeDigitalPresence(inputData) {
    if (!inputData.website_url && !inputData.linkedin_url) {
      return null;
    }

    try {
      const analysis = {
        digital_maturity_score: this.calculateBasicDigitalScore(inputData),
        epic_alignment: this.calculateDigitalEPICAlignment(inputData),
        recommendations: this.generateBasicDigitalRecommendations(inputData)
      };

      return analysis;
    } catch (error) {
      console.warn('Digital analysis failed:', error);
      return null;
    }
  },

  calculateBasicDigitalScore(inputData) {
    let score = 40; // Base score
    
    if (inputData.website_url) score += 30;
    if (inputData.linkedin_url) score += 20;
    if (inputData.twitter_url) score += 10;
    
    return Math.min(100, score);
  },

  calculateDigitalEPICAlignment(inputData) {
    return {
      ecosystem: inputData.website_url ? 60 : 30,
      product_led: inputData.website_url ? 70 : 40,
      inbound: (inputData.website_url ? 50 : 20) + (inputData.linkedin_url ? 20 : 0),
      community: (inputData.linkedin_url ? 40 : 20) + (inputData.twitter_url ? 20 : 0)
    };
  },

  generateBasicDigitalRecommendations(inputData) {
    const recommendations = [];
    
    if (!inputData.website_url) {
      recommendations.push({
        action: 'Develop professional website with clear value proposition',
        priority: 'high',
        epic_component: 'Inbound'
      });
    }
    
    if (!inputData.linkedin_url) {
      recommendations.push({
        action: 'Establish LinkedIn company presence with regular thought leadership content',
        priority: 'medium', 
        epic_component: 'Community'
      });
    }
    
    return recommendations;
  },

  generateDigitalInsights(digitalAnalysis) {
    if (!digitalAnalysis) return null;

    const insights = {
      digital_maturity_level: digitalAnalysis.digital_maturity_score > 70 ? 'Advanced' : 
                             digitalAnalysis.digital_maturity_score > 50 ? 'Developing' : 'Basic',
      key_digital_strengths: [],
      critical_digital_gaps: [],
      epic_digital_alignment: digitalAnalysis.epic_alignment
    };

    // Basic assessment based on digital maturity score
    if (digitalAnalysis.digital_maturity_score > 70) {
      insights.key_digital_strengths.push('Strong digital foundation');
    } else if (digitalAnalysis.digital_maturity_score < 50) {
      insights.critical_digital_gaps.push('Digital presence needs development');
    }

    return insights;
  },

  generateConsultationInsights(inputData, primaryFocus) {
    const { company_name, gtm_challenge, business_stage } = inputData;
    
    // Real consultation insight based on GTM Alpha methodology
    const baseInsight = `Based on my experience with ${business_stage} companies, your specific challenge represents a critical GTM optimization opportunity. Most founders think GTM is just a marketing or sales problem, but it's actually a comprehensive operating system.`;

    const focusSpecificInsights = {
      'Product-Led Growth Acceleration': `Your challenge requires treating GTM as a dynamic operating system where Product-Led Growth becomes your primary lever. Focus on engineering product as GTM engine, PLG + sales synergy, and user experience optimization for conversion.`,
      'Ecosystem & ABM-led Sales Motion': `Focus on leveraging unique data advantages, partner ecosystems, and relationship intelligence for enterprise sales acceleration. Build strategic partnerships and account-based approaches that create sustainable competitive moats.`,
      'Inbound & Outbound Demand Generation': `Implement an integrated approach combining content marketing excellence with hyper-personalized outreach. Focus on eliminating decision dead zones in your buyer journey rather than optimizing vanity metrics.`,
      'Community-Led Growth Strategy': `Build community-driven advocacy and authentic relationship building as your primary growth engine. Focus on creating genuine value exchange and thought leadership positioning.`
    };

    return baseInsight + '\n\n' + focusSpecificInsights[primaryFocus];
  },

  generateActionableRecommendations(inputData, epicScores, digitalAnalysis = null) {
    const { industry, business_stage, gtm_challenge } = inputData;
    
    const recommendations = [];
    
    // Primary recommendations based on highest EPIC scores
    if (epicScores.E >= 70) {
      recommendations.push('Implement Account-Based Marketing (ABM) for high-value enterprise prospects');
      recommendations.push('Build strategic partnership ecosystem to leverage unique data advantages');
      recommendations.push('Develop relationship intelligence system for sales acceleration');
    }
    
    if (epicScores.P >= 70) {
      recommendations.push('Engineer product as primary GTM engine with built-in viral loops');
      recommendations.push('Optimize user onboarding and activation for self-service conversion');
      recommendations.push('Implement usage-based pricing model aligned with product value');
    }
    
    if (epicScores.I >= 70) {
      recommendations.push('Launch integrated content marketing targeting specific buyer personas');
      recommendations.push('Implement hyper-personalized outbound sequences based on buyer signals');
      recommendations.push('Optimize conversion funnel with mental velocity principles');
    }
    
    if (epicScores.C >= 70) {
      recommendations.push('Build industry community through thought leadership and expert positioning');
      recommendations.push('Create customer advocacy program with authentic testimonials');
      recommendations.push('Develop content strategy around community-driven insights');
    }

    // Digital-enhanced recommendations
    if (digitalAnalysis && digitalAnalysis.recommendations) {
      const topDigitalRecs = digitalAnalysis.recommendations
        .filter(rec => rec.priority === 'high')
        .slice(0, 2)
        .map(rec => `${rec.action} (${rec.epic_component} focus)`);
      recommendations.push(...topDigitalRecs);
    }

    // Industry-specific recommendations
    if (industry === 'SaaS') {
      recommendations.push('Focus on product-led growth with freemium-to-paid conversion optimization');
    } else if (industry === 'Healthcare') {
      recommendations.push('Emphasize compliance-first messaging and regulatory partnership ecosystem');
    } else if (industry === 'Finance') {
      recommendations.push('Build trust through thought leadership and regulatory compliance expertise');
    }

    return recommendations.slice(0, 8); // Return top 8 recommendations
  },

  // Generate 6-month roadmap with quarterly structure
  generateGTMRoadmap(inputData, primaryFocus, secondaryFocus) {
    const roadmap = {
      days_30: [],
      days_60: [],
      first_quarter: [],
      second_quarter: []
    };

    // Primary focus implementation with realistic GTM timelines
    if (primaryFocus.includes('Product-Led')) {
      roadmap.days_30 = [
        'Audit current user onboarding flow and identify friction points',
        'Implement product usage analytics and user tracking',
        'Create self-service trial experience design'
      ];
      roadmap.days_60 = [
        'Launch optimized onboarding flow with progressive disclosure',
        'Implement usage-based engagement triggers and expansion prompts',
        'A/B test pricing page and conversion funnel optimization'
      ];
      roadmap.first_quarter = [
        'Scale successful PLG motions with automated user journey optimization',
        'Launch referral program and viral growth mechanisms',
        'Measure and optimize product-qualified lead (PQL) conversion'
      ];
      roadmap.second_quarter = [
        'Implement advanced product-led sales (PLS) hybrid model',
        'Launch enterprise PLG features with white-glove onboarding',
        'Optimize product-market fit based on comprehensive usage analytics'
      ];
    } else if (primaryFocus.includes('Ecosystem')) {
      roadmap.days_30 = [
        'Map current partner ecosystem and identify strategic gaps',
        'Develop ideal customer profile (ICP) for ABM targeting',
        'Research and prioritize top 50 enterprise prospects'
      ];
      roadmap.days_60 = [
        'Launch pilot ABM campaigns for top 20 enterprise accounts',
        'Establish strategic partnerships with complementary solution providers',
        'Implement relationship intelligence tools and account mapping'
      ];
      roadmap.first_quarter = [
        'Scale ABM approach with personalized account journeys',
        'Expand partner ecosystem with joint go-to-market initiatives',
        'Launch partner enablement program with co-marketing materials'
      ];
      roadmap.second_quarter = [
        'Develop enterprise channel partner program with certification',
        'Launch strategic alliance partnerships with technology integrations',
        'Measure partnership-driven pipeline and optimize ROI'
      ];
    } else if (primaryFocus.includes('Inbound')) {
      roadmap.days_30 = [
        'Complete buyer persona research and journey mapping',
        'Audit content strategy and identify high-intent keywords',
        'Create editorial calendar aligned with sales cycles'
      ];
      roadmap.days_60 = [
        'Launch thought leadership content series targeting decision makers',
        'Implement lead scoring and marketing automation workflows',
        'Begin hyper-personalized outbound campaigns based on content engagement'
      ];
      roadmap.first_quarter = [
        'Scale content distribution across multiple channels and platforms',
        'Optimize conversion paths with A/B tested landing pages',
        'Implement attribution modeling for content-driven pipeline'
      ];
      roadmap.second_quarter = [
        'Launch account-based content strategy for enterprise prospects',
        'Implement advanced marketing automation with predictive scoring',
        'Develop thought leadership speaking and industry recognition strategy'
      ];
    } else {
      roadmap.days_30 = [
        'Define community vision and core value proposition',
        'Research community platforms and engagement strategies',
        'Create founding member outreach and onboarding process'
      ];
      roadmap.days_60 = [
        'Launch community with high-value content and expert positioning',
        'Implement community engagement and moderation workflows',
        'Begin thought leadership content creation from community insights'
      ];
      roadmap.first_quarter = [
        'Scale community growth with member-driven content and advocacy',
        'Launch community-driven product feedback and development cycles',
        'Measure community engagement impact on sales and retention metrics'
      ];
      roadmap.second_quarter = [
        'Develop community-led customer success and expansion programs',
        'Launch industry events and community-driven thought leadership',
        'Implement community influence on product roadmap and strategy'
      ];
    }

    return roadmap;
  },

  generateMentalVelocityAnalysis(inputData) {
    return `Based on B2B buyer psychology, optimizing for mental velocity - the speed of buyer hypothesis-to-resolution progression - is more critical than traditional funnel metrics. Focus on eliminating decision dead zones in your buyer journey.`;
  },

  // Generate complete HTML report with PDF download functionality
  generateHTMLReport(inputData, analysis, epic) {
    const epicScores = epic.scores;
    const epicLines = [...epic.warnings.map((w) => 'Warning: ' + w), ...epic.notes, ...(epic.preliminary_note ? [epic.preliminary_note] : [])];
    const epicNotesSection = `
        <div class="section">
            <h2>How your EPIC scores were set</h2>
            <p>Scale: 1 to 10 per motion. Starting point: ${esc(epic.stage_used)}.</p>
            <ul>
                ${epic.adjustments_applied.slice(1).map((a) => `<li>${esc(a.rule)}</li>`).join('') || '<li>No adjustment applied beyond the stage starting point.</li>'}
            </ul>
            ${epicLines.length ? `<ul>${epicLines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
        </div>`;
    const timestamp = new Date().toISOString();
    const consultationId = `GTM-${Date.now()}`;
    
    const digitalSection = analysis.digitalInsights ? `
    <div class="section">
        <h2>Digital Presence Analysis</h2>
        <p><strong>Digital Maturity Level:</strong> ${analysis.digitalInsights.digital_maturity_level}</p>
        ${analysis.digitalInsights.key_digital_strengths.length > 0 ? `
        <h3>Digital Strengths:</h3>
        <ul>
            ${analysis.digitalInsights.key_digital_strengths.map(strength => `<li>${strength}</li>`).join('')}
        </ul>
        ` : ''}
        ${analysis.digitalInsights.critical_digital_gaps.length > 0 ? `
        <h3>Digital Gaps to Address:</h3>
        <ul>
            ${analysis.digitalInsights.critical_digital_gaps.map(gap => `<li>${gap}</li>`).join('')}
        </ul>
        ` : ''}
    </div>` : '';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GTM Alpha Consultation Report - ${esc(inputData.client_name || inputData.company_name)}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <link href="/assets/fonts.css" rel="stylesheet">
    <style>
        body { font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; color: #1A0E10; max-width: 800px; margin: 0 auto; padding: 20px; background: #FAF8F6; }
        .report-container { background: #FAF8F6; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(26, 14, 16, 0.1); position: relative; }
        .pdf-download { position: absolute; top: 20px; right: 20px; background: #C1121F; color: #FAF8F6; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .pdf-download:hover { background: #641220; }
        .header { text-align: left; background: #FAF8F6; color: #1A0E10; border-bottom: 1.5px solid #EAD9D5; padding: 40px; border-radius: 12px; margin-bottom: 40px; }
        .epic-scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .epic-item { text-align: center; padding: 20px; background: #FAF8F6; border-radius: 8px; border-left: 4px solid #C1121F; transition: transform 0.2s; }
        .epic-item:hover { transform: translateY(-2px); }
        .epic-letter { font-size: 36px; font-weight: bold; color: #641220; }
        .epic-score { font-size: 24px; font-weight: bold; color: #C1121F; }
        .section { margin: 30px 0; padding: 20px; border-radius: 8px; background: #FAF8F6; border: 1px solid #EAD9D5; }
        .primary-focus { background: linear-gradient(135deg, #C1121F 0%, #641220 100%); color: #FAF8F6; padding: 20px; border-radius: 8px; }
        .recommendations li { margin: 10px 0; }
        .roadmap { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .roadmap-item { padding: 20px; background: #FAF8F6; border-radius: 8px; }
        .consultation-id { color: rgba(26, 14, 16, 0.72); font-size: 14px; }
        @media (max-width: 768px) { 
            .epic-scores { grid-template-columns: repeat(2, 1fr); }
            .roadmap { grid-template-columns: 1fr; }
            .pdf-download { position: static; margin-bottom: 20px; display: block; width: 100%; }
        }
        @media print {
            .pdf-download { display: none; }
            body { background: #FAF8F6; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container" id="report-content">
        <button class="pdf-download" id="pdf-download" type="button">Download PDF</button>
        
        <div class="header">
            <h1>GTM Alpha Consultation Report</h1>
            <h2>${esc(inputData.client_name || inputData.company_name)}</h2>
            ${inputData.client_designation ? `<h3>${esc(inputData.client_designation)}</h3>` : ''}
            <h3>${esc(inputData.company_name)}</h3>
            <p class="consultation-id">Consultation ID: ${consultationId}</p>
            <p class="consultation-id">Generated: ${new Date(timestamp).toISOString().slice(0, 16).replace('T', ' ')} UTC</p>
        </div>

        <div class="section primary-focus">
            <h2>Strategic Focus Areas</h2>
            <p><strong>Primary Focus:</strong> ${analysis.primaryFocus}</p>
            <p><strong>Secondary Focus:</strong> ${analysis.secondaryFocus}</p>
        </div>

        <div class="section">
            <h2>EPIC Framework Scores</h2>
            <div class="epic-scores">
                <div class="epic-item">
                    <div class="epic-letter">E</div>
                    <div class="epic-score">${epicScores.E} / 10</div>
                    <div>Ecosystem & ABM</div>
                </div>
                <div class="epic-item">
                    <div class="epic-letter">P</div>
                    <div class="epic-score">${epicScores.P} / 10</div>
                    <div>Product-Led Growth</div>
                </div>
                <div class="epic-item">
                    <div class="epic-letter">I</div>
                    <div class="epic-score">${epicScores.I} / 10</div>
                    <div>Inbound & Outbound</div>
                </div>
                <div class="epic-item">
                    <div class="epic-letter">C</div>
                    <div class="epic-score">${epicScores.C} / 10</div>
                    <div>Community-Led</div>
                </div>
            </div>
        </div>

        ${epicNotesSection}

        <div class="section">
            <h2>GTM Alpha Insights</h2>
            <p>${analysis.insights}</p>
        </div>

        ${digitalSection}

        <div class="section">
            <h2>Strategic Recommendations</h2>
            <ul>
                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>GTM Implementation Roadmap</h2>
            <div class="roadmap">
                <div class="roadmap-item">
                    <h3>Days 1-30: Foundation</h3>
                    <ul>
                        ${analysis.roadmap.days_30.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="roadmap-item">
                    <h3>Days 31-60: Implementation</h3>
                    <ul>
                        ${analysis.roadmap.days_60.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="roadmap-item">
                    <h3>First Quarter (90 days): Scale</h3>
                    <ul>
                        ${analysis.roadmap.first_quarter.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="roadmap-item">
                    <h3>Second Quarter (180 days): Optimize</h3>
                    <ul>
                        ${analysis.roadmap.second_quarter.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Mental Velocity Analysis</h2>
            <p>${analysis.mentalVelocityAnalysis}</p>
        </div>

        <div class="section">
            <h2>Next Steps</h2>
            <p>For personalized implementation support and detailed strategy development:</p>
            <ul>
                <li><a href="mailto:shashwat@gtmhelix.com">Email Direct Support</a></li>
                <li><a href="https://gtmexpert.com">Visit GTMExpert.com</a></li>
            </ul>
        </div>

        <p class="consultation-id">Suggested timings, lengths and counts: adjust them to your own.</p>

        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #FAF8F6; border-radius: 8px;">
            <p><strong>Generated by GTM Alpha Consultant</strong></p>
            <p>Powered by Shashwat Ghosh's EPIC Framework</p>
            <p><em>Co-Founder and Fractional CMO, Helix GTM Consulting</em></p>
        </div>
    </div>

    <script>
        function downloadPDF() {
            const element = document.getElementById('report-content');
            const opt = {
                margin: 0.5,
                filename: ${JSON.stringify('GTM_Alpha_Consultation_Report_' + String(inputData.company_name || 'Company').replace(/[^A-Za-z0-9 _-]/g, '') + '_' + consultationId + '.pdf').replace(/</g, '\\u003c')},
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        }
        // Bound here, not with onclick, so the page's Content-Security-Policy can allow this one script by its hash.
        document.getElementById('pdf-download').addEventListener('click', downloadPDF);
    </script>
</body>
</html>`;
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
    
    // Validate required fields - support both formats (company+market OR client_name+company_name)
    const companyName = inputData.company_name || inputData.company;
    const industry = inputData.industry || inputData.market;
    const businessStage = inputData.business_stage || inputData.stage || 'growth';
    const gtmChallenge = inputData.gtm_challenge || inputData.current_challenges || '';
    
    if (!companyName || !industry) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: company name and industry/market are required'
      }), {
        status: 400,
        headers
      });
    }

    // Enhanced input data for compatibility with Railway backend format
    const enhancedInputData = {
      client_name: inputData.client_name || companyName,
      client_designation: inputData.client_designation || '',
      company_name: companyName,
      company_description: inputData.company_description || `${industry} company`,
      gtm_challenge: gtmChallenge,
      business_stage: businessStage,
      industry: industry,
      current_team_size: inputData.current_team_size || inputData.team_size || '',
      budget_range: inputData.budget_range || '',
      specific_focus: inputData.specific_focus || inputData.target_audience || '',
      website_url: inputData.website_url || inputData.company_website,
      linkedin_url: inputData.linkedin_url,
      twitter_url: inputData.twitter_url,
      // Optional EPIC inputs from the consultation form (bands) or API callers (numbers)
      acv: inputData.acv_usd || inputData.acv_band || '',
      deal_cycle: inputData.deal_cycle_days || inputData.deal_cycle_band || '',
      nrr: inputData.nrr_percent || inputData.nrr_band || '',
      tam: inputData.tam_accounts || inputData.tam_band || '',
      self_serve: inputData.self_serve,
      deal_source: inputData.deal_source || '',
      geography: inputData.geography || inputData.region || '',
      current_channels: inputData.current_channels || ''
    };

    // Generate EPIC scores using real algorithm from Railway backend
    const epic = GTM_ALPHA_ENGINE.analyzeEPICFramework(enhancedInputData);
    const epicScores = epic.scores;

    // Enhanced digital presence analysis if URLs provided
    let digitalAnalysis = null;
    if (DIGITAL_PRESENCE_AUDIT_ENABLED && (enhancedInputData.website_url || enhancedInputData.linkedin_url || enhancedInputData.twitter_url)) {
      digitalAnalysis = await GTM_ALPHA_ENGINE.analyzeDigitalPresence(enhancedInputData);
    }

    // Generate strategic analysis with digital integration
    const analysis = GTM_ALPHA_ENGINE.generateStrategicAnalysis(enhancedInputData, epic, digitalAnalysis);

    // Generate complete HTML report for comprehensive GTM report
    const htmlReport = GTM_ALPHA_ENGINE.generateHTMLReport(enhancedInputData, analysis, epic);

    const consultationId = `GTM-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Response format matching Railway backend for compatibility
    return new Response(JSON.stringify({
      success: true,
      runId: consultationId,
      status: 'SUCCEEDED',
      data: {
        consultation_id: consultationId,
        report_url: `data:text/html;base64,${Buffer.from(htmlReport).toString('base64')}`,
        primary_focus: analysis.primaryFocus,
        epic_scores: epicScores,
        epic_detail: epic,
        consultation_output: analysis.insights,
        timestamp: timestamp,
        digital_insights: digitalAnalysis ? analysis.digitalInsights : null
      },
      analysis: {
        epic_framework: {
          ecosystem: `Ecosystem & ABM Score: ${epicScores.E}/10 - ${analysis.primaryFocus.includes('Ecosystem') ? 'Primary Focus' : 'Secondary opportunity'}`,
          product_led: `Product-Led Score: ${epicScores.P}/10 - ${analysis.primaryFocus.includes('Product') ? 'Primary Focus' : 'Growth optimization needed'}`,
          inbound: `Inbound & Outbound Score: ${epicScores.I}/10 - ${analysis.primaryFocus.includes('Inbound') ? 'Primary Focus' : 'Demand generation strategy required'}`,
          community: `Community-Led Score: ${epicScores.C}/10 - ${analysis.primaryFocus.includes('Community') ? 'Primary Focus' : 'Community-driven growth opportunity'}`
        },
        recommendations: analysis.recommendations,
        market_insights: {
          primary_focus: analysis.primaryFocus,
          secondary_focus: analysis.secondaryFocus,
          epic_scores: epicScores,
          digital_maturity: digitalAnalysis ? digitalAnalysis.digital_maturity_score : null
        },
        implementation_roadmap: analysis.roadmap,
        mental_velocity_analysis: analysis.mentalVelocityAnalysis,
        digital_presence_analysis: digitalAnalysis,
        consultation_id: consultationId,
        timestamp: timestamp,
        html_report: htmlReport
      },
      consoleUrl: `#consultation-${consultationId}`,
      datasetUrl: `#report-${consultationId}`,
      generated_by: 'GTM Alpha Engine - Shashwat Ghosh EPIC Framework'
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error in GTM analysis:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: 'The report could not be generated. Please check your input and try again.',
      runId: `ERROR-${Date.now()}`
    }), {
      status: 500,
      headers
    });
  }
};

