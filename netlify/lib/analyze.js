import { scoreEpic, MOTIONS, MOTION_MEANS, ROADMAP_STEPS } from './epic-advanced.js';

// netlify/lib/analyze.js (internal module, not a public function)
// GTM Alpha Premium Audit report: EPIC framework scores, recommendations and a 6-month roadmap.

// Owner decision 2 (25 Sep 2026): the "digital presence analysis" never visited the website; it scored only whether a
// URL was typed. It stays in the code but is switched off, and the report does not mention it, until it really checks websites.
export const DIGITAL_PRESENCE_AUDIT_ENABLED = false;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Run 11 R11-A2-5: the report's PDF script is one fixed text, so the report page's Content-Security-Policy hash never
// changes per request. The file name comes from the escaped data-pdf-name attribute on the report container.
export const PDF_SCRIPT = `
        function downloadPDF() {
            const element = document.getElementById('report-content');
            const opt = {
                margin: 0.5,
                filename: element.getAttribute('data-pdf-name') || 'GTM_Alpha_EPIC_audit_report.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        }
        // Bound here, not with onclick, so the page's Content-Security-Policy can allow this one script by its hash.
        // The button sits in the action bar at the top of the page (run 10); pages without it (the sample) skip this.
        var pdfButton = document.getElementById('pdf-download');
        if (pdfButton) pdfButton.addEventListener('click', downloadPDF);
    `;

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
    // Run 12 R12-20 (D1 proposal 1): the tools/list motion names (epic-advanced.js MOTIONS), the same in the report and in Claude.
    const focusMap = MOTIONS;
    const primaryFocus = focusMap[epic.primary.letter];
    const secondaryFocus = focusMap[epic.secondary.letter];

    // Generate consultation insights based on actual GTM Alpha methodology
    const insights = this.generateConsultationInsights(inputData, primaryFocus, epic.stage_used);
    // The recommendation rules were written for a 0 to 100 scale (gates at 70); a 1 to 10 score times 10 keeps their meaning.
    const hundredScale = { E: epicScores.E * 10, P: epicScores.P * 10, I: epicScores.I * 10, C: epicScores.C * 10 };
    // Run 11 (D9 item 11): the SaaS product-led line depends on the lead motion, so the top-scoring letter is passed in
    // (epic.primary: the highest score, ties broken E, P, C, I in epic-advanced.js TIE_ORDER). No score or threshold changes.
    const recommendations = this.generateActionableRecommendations(inputData, hundredScale, digitalAnalysis, epic.primary.letter);
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

  // Run 12 R12-20 (D1 proposals 1 and 2): the two sentences about the lead motion, word for word from gtmhelix.com/epic/
  // (epic-advanced.js MOTION_MEANS), replace the first-person paragraph that was the same for every company.
  generateConsultationInsights(inputData, primaryFocus, stageUsed = '') {
    const letter = Object.keys(MOTIONS).find((k) => MOTIONS[k] === primaryFocus);
    return MOTION_MEANS[letter];
  },

  generateActionableRecommendations(inputData, epicScores, digitalAnalysis = null, primaryLetter = '') {
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
      recommendations.push('Shorten the time buyers take from first question to decision');
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
      // Run 11 (D9 item 11, owner-approved): shown only when Product-Led is the top-scoring motion.
      if (primaryLetter === 'P') recommendations.push('Focus on product-led growth with freemium-to-paid conversion optimization');
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

    // Primary focus implementation with realistic GTM timelines. Run 12: the steps live in epic-advanced.js ROADMAP_STEPS
    // (words unchanged) so the generate_roadmap tool in Claude uses the same ones; the motion is chosen as before.
    const letter = primaryFocus.includes('Product-Led') ? 'P' : primaryFocus.includes('Ecosystem') ? 'E' : primaryFocus.includes('Inbound') ? 'I' : 'C';
    for (const k of Object.keys(roadmap)) roadmap[k] = [...ROADMAP_STEPS[letter][k]];

    return roadmap;
  },

  generateMentalVelocityAnalysis(inputData) {
    return `Based on B2B buyer psychology, optimizing for mental velocity (the speed of buyer hypothesis-to-resolution progression) is more critical than traditional funnel metrics. Focus on eliminating decision dead zones in your buyer journey.`;
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
        <p><strong>Digital Maturity Level:</strong> ${esc(analysis.digitalInsights.digital_maturity_level)}</p>
        ${analysis.digitalInsights.key_digital_strengths.length > 0 ? `
        <h3>Digital Strengths:</h3>
        <ul>
            ${analysis.digitalInsights.key_digital_strengths.map(strength => `<li>${esc(strength)}</li>`).join('')}
        </ul>
        ` : ''}
        ${analysis.digitalInsights.critical_digital_gaps.length > 0 ? `
        <h3>Digital Gaps to Address:</h3>
        <ul>
            ${analysis.digitalInsights.critical_digital_gaps.map(gap => `<li>${esc(gap)}</li>`).join('')}
        </ul>
        ` : ''}
    </div>` : '';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your free EPIC audit report: ${esc(inputData.company_name || inputData.client_name)} | GTM Alpha</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <style>
        /* Run 10 R10-A1-5 e: the report in the Helix design (Archivo, Helix colours, no gradient banners). The page links
           fonts.css, brand.css, helix.css and site.css (premium-audit.js), so headings follow the shared type scale. */
        .report-container { max-width: 960px; background: #FAF8F6; color: #1A0E10; font-family: 'Archivo', Arial, sans-serif; line-height: 1.6; }
        .header { padding: 0 0 18px; margin: 0 0 8px; border-bottom: 1.5px solid rgba(26, 14, 16, 0.12); }
        .header h1 { font-weight: 800; letter-spacing: -0.02em; margin: 0 0 12px; }
        .header h2, .header h3 { font-size: 18px !important; font-weight: 600; line-height: 1.4 !important; margin: 0; }
        .header h3 { color: rgba(26, 14, 16, 0.72); }
        .section { margin: 0; padding: 24px 0; border-top: 1.5px solid rgba(26, 14, 16, 0.12); background: transparent; }
        .header + .section { border-top: 0; }
        .section h2 { font-weight: 800; letter-spacing: -0.02em; margin: 0 0 12px; }
        .section h2::before { content: ""; display: block; width: 10px; height: 10px; background: #C1121F; margin: 0 0 14px; }
        .section ul { padding-left: 22px; }
        .section li { margin: 6px 0; }
        .primary-focus { background: #EAD9D5; border-left: 4px solid #641220; padding: 18px 20px; margin: 16px 0; color: #1A0E10; }
        .epic-scores { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 16px 0 0; }
        .epic-item { padding: 14px 16px; background: #FAF8F6; border: 1.5px solid rgba(26, 14, 16, 0.12); border-top: 4px solid #641220; text-align: left; }
        .epic-letter { font-size: 28px; font-weight: 800; line-height: 1; color: #641220; }
        .epic-score { font-family: 'IBM Plex Mono', monospace; font-size: 20px; font-weight: 600; color: #1A0E10; margin: 6px 0 4px; }
        .roadmap { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .roadmap-item { padding: 16px; background: #FAF8F6; border: 1.5px solid rgba(26, 14, 16, 0.12); border-top: 3px solid #641220; }
        .roadmap-item h3 { margin: 0 0 8px; }
        .consultation-id { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: rgba(26, 14, 16, 0.72); margin: 4px 0; }
        .report-footer { margin: 8px 0 0; padding: 18px 0 0; border-top: 1.5px solid rgba(26, 14, 16, 0.12); font-size: 15px; }
        .report-footer p { margin: 2px 0; }
        @media (max-width: 768px) {
            .epic-scores { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .roadmap { grid-template-columns: 1fr; }
        }
        @media print { .hx10-actions, .hx9-gh, footer.hx-footer { display: none; } }
    </style>
</head>
<body>
    <div class="report-container" id="report-content" data-pdf-name="${esc('GTM_Alpha_EPIC_audit_report_' + String(inputData.company_name || 'Company').replace(/[^A-Za-z0-9 _-]/g, '') + '_' + consultationId + '.pdf')}">
        <div class="header">
            <h1>Your free EPIC audit report</h1>
            <h2>${esc(inputData.client_name || inputData.company_name)}</h2>
            ${inputData.client_designation ? `<h3>${esc(inputData.client_designation)}</h3>` : ''}
            <h3>${esc(inputData.company_name)}</h3>
        </div>

        <div class="section primary-focus">
            <h2>Strategic Focus Areas</h2>
            <p><strong>Primary Focus:</strong> ${esc(analysis.primaryFocus)}</p>
            <p><strong>Secondary Focus:</strong> ${esc(analysis.secondaryFocus)}</p>
        </div>

        <div class="section">
            <h2>EPIC Framework Scores</h2>
            <div class="epic-scores">
                <div class="epic-item">
                    <div class="epic-letter">E</div>
                    <div class="epic-score">${epicScores.E} / 10</div>
                    <div>Ecosystem and ABM</div>
                </div>
                <div class="epic-item">
                    <div class="epic-letter">P</div>
                    <div class="epic-score">${epicScores.P} / 10</div>
                    <div>Product-Led Growth</div>
                </div>
                <div class="epic-item">
                    <div class="epic-letter">I</div>
                    <div class="epic-score">${epicScores.I} / 10</div>
                    <div>Inbound and Outbound</div>
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
            <h2>What leading with ${esc(analysis.primaryFocus)} means</h2>
            <p>${esc(analysis.insights)}</p>
        </div>

        ${digitalSection}

        <div class="section">
            <h2>Strategic Recommendations</h2>
            <ul>
                ${analysis.recommendations.map(rec => `<li>${esc(rec)}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>GTM Implementation Roadmap</h2>
            <div class="roadmap">
                <div class="roadmap-item">
                    <h3>Days 1 to 30: Foundation</h3>
                    <ul>
                        ${analysis.roadmap.days_30.map(item => `<li>${esc(item)}</li>`).join('')}
                    </ul>
                </div>
                <div class="roadmap-item">
                    <h3>Days 31 to 60: Implementation</h3>
                    <ul>
                        ${analysis.roadmap.days_60.map(item => `<li>${esc(item)}</li>`).join('')}
                    </ul>
                </div>
                <div class="roadmap-item">
                    <h3>Days 61 to 90: Scale</h3>
                    <ul>
                        ${analysis.roadmap.first_quarter.map(item => `<li>${esc(item)}</li>`).join('')}
                    </ul>
                </div>
                <div class="roadmap-item">
                    <h3>Days 91 to 180: Optimize</h3>
                    <ul>
                        ${analysis.roadmap.second_quarter.map(item => `<li>${esc(item)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Next Steps</h2>
            <ul>
                <li><a href="https://gtmhelix.com/lets-get-started/">Work with Shashwat on this plan</a></li>
            </ul>
        </div>

        <p class="consultation-id">Suggested timings, lengths and counts: adjust them to your own.</p>

        <div class="report-footer">
            <p><strong>Generated by GTM Alpha</strong>, with Shashwat Ghosh's EPIC framework</p>
            <p class="consultation-id">Audit ID: ${consultationId}</p>
            <p class="consultation-id">Generated: ${new Date(timestamp).toISOString().slice(0, 16).replace('T', ' ')} UTC</p>
        </div>
    </div>

    <script>${PDF_SCRIPT}</script>
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

