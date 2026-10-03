// netlify/lib/gtm-plan.js
// Run 20 quality round 1b (D92): the plan text of the three GTM Alpha tools. The EPIC scores come from epic-advanced.js and are
// not decided here. This file only words what follows from them: the first steps and the roadmap for the lead motion, written
// from the sector (netlify/lib/verticals.js, the shared sector file), the business model, and the user's own inputs (channels,
// ACV, deal cycle, TAM, NRR). Rule B82: words only. No statistic, benchmark, market size or named company. A count such as
// "top 50" is an example and is labelled the way these tools always label it. The extra sector detail below (partner types,
// places buyers meet, what they read) is vocabulary and buyer roles, kept here so the shared verticals.js stays a byte copy of
// the Revenue Enablement file.

export const EXAMPLE = " (Example figure: replace with your own)";

// What sits next to the seller in the buyer's stack, where buyers meet, what they read and what they ask for before buying.
export const SECTOR_PLAN = {
  "logistics-tech": {
    terms: ["carrier allocation", "hub and spoke", "line haul", "courier", "returns", "cash on delivery", "failed delivery", "rate card", "freight audit", "control tower", "order tracking", "ecommerce shipping", "warehouse", "cut-off times"],
    partners: ["TMS, WMS and ERP vendors whose customers already run the systems you connect to", "3PLs and freight forwarders that run fleets for several shippers", "telematics, GPS and mapping providers", "systems integrators that roll out supply chain systems"],
    accounts: "fleet size, daily delivery volume, exposure to peak season and whether a TMS is already in place",
    reviews: "IT integration, finance and a hub pilot sign-off",
    reads: ["cost per delivery breakdowns", "first-attempt and failed-delivery analysis", "peak-season planning checklists", "TMS and last-mile integration guides"],
    venues: ["supply chain and logistics associations", "peak-season planning roundtables for operations heads", "last-mile and fleet operator forums"],
    assets: ["an integration guide for the TMS, WMS and order systems", "a hub pilot plan with the measures agreed before it starts", "a reference from a similar fleet"],
    firstValue: "a planner sees a better route plan on their own orders",
    expansionSignal: "a second hub or a second planner starts using the plan",
    typical: ["E"],
    fit: {
      E: "this sector is bought by operations heads after a pilot at one hub, so account-based selling with integration partners is the usual way in",
      P: "a self-serve start rarely fits a fleet-wide system tied to TMS and WMS data, so it works only as a small-fleet entry route",
      I: "search and content on cost per delivery reach the operations head before a vendor list exists",
      C: "operations peers share peak-season lessons and vouch for vendors, which suits a long, pilot-led sale",
    },
  },
  fintech: {
    terms: ["payment gateway", "settlement", "payouts", "chargebacks", "KYC", "fraud", "spend controls", "reimbursement", "treasury", "payment success rate", "lending", "credit decisioning", "cards", "invoice matching"],
    partners: ["ERP and accounting system vendors and their implementation partners", "banks and card networks that issue or settle for your buyers", "audit and advisory firms that review finance controls", "payroll, travel and procurement systems that feed the same ledger"],
    accounts: "number of employees who claim or spend, ERP in use, entities and countries, and a visible trigger such as an audit finding, a new finance leader or finance teams still working in spreadsheets",
    reviews: "security, compliance and internal audit",
    reads: ["month-end close and reconciliation guides", "policy and approval control checklists", "ERP posting and integration notes", "audit-readiness write-ups"],
    venues: ["peer groups for finance teams and controllers", "accounting and audit association events", "ERP user groups"],
    assets: ["a security and data residency pack", "an ERP posting and integration guide", "a controller-signed reference from a pilot on one entity"],
    firstValue: "a finance user posts the first batch to the ledger without re-keying it",
    expansionSignal: "a second entity or department asks to be added",
    typical: ["E"],
    fit: {
      E: "this sector is CFO-led with security and compliance review inside the cycle, so account-based selling with ERP and advisory partners is the usual way in",
      P: "finance buyers expect a controlled rollout, so self-serve fits only small companies or a single team before a finance review",
      I: "controllers search for close, reconciliation and control topics, so content built on those problems reaches them early",
      C: "finance leaders trust peer controllers, so references and peer groups carry weight at the review stage",
    },
  },
  "vertical-saas": {
    terms: ["van sales", "route to market", "retail execution", "sales force automation", "trade promotion", "merchandising", "planogram", "order fill rate", "distributor claims", "field force", "outlet audit", "scheme"],
    partners: ["distributor management and ERP vendors used by the brands' distributors", "retail audit and trade data providers", "mobile device and connectivity providers used by field teams", "consultancies that run route-to-market programmes"],
    accounts: "number of field reps, distributors and outlets covered, the DMS and ERP in use, and a planned sales reorganisation or a new region launch",
    reviews: "IT integration with the DMS and ERP, and a regional pilot sign-off",
    reads: ["secondary sales visibility guides", "beat planning and outlet coverage checklists", "scheme communication and claim settlement notes", "DMS integration guides"],
    venues: ["FMCG and consumer goods sales leader forums", "distributor and trade association events", "route-to-market and retail execution conferences"],
    assets: ["a DMS and ERP integration guide", "a regional pilot plan with productive calls and secondary sales as the measures", "a reference from a comparable brand"],
    firstValue: "a rep captures the first order in the outlet on the app",
    expansionSignal: "a second region or a distributor asks to join",
    typical: ["E", "I"],
    fit: {
      E: "this sector is bought by the sales function after a pilot in one region, so account-based selling with route-to-market partners fits",
      P: "reps and distributors adopt an app only when the sales head mandates it, so self-serve is an entry route for smaller brands at most",
      I: "sales heads search for secondary sales and outlet coverage problems, so content on those reaches them before any vendor list exists",
      C: "sales heads ask peers at other brands what worked in the field, so references are strong here",
    },
  },
  "ai-native": {
    terms: ["agents", "copilot", "LLM", "fine-tuning", "evaluation", "prompt", "retrieval", "forecasting", "model risk", "explainability", "voice", "latency", "confidence scores", "grounding"],
    partners: ["cloud and model platform providers your buyers already use", "data and integration vendors that hold the data your product needs", "systems integrators that build the workflow around an AI product", "industry bodies that publish guidance on AI use"],
    accounts: "the workflow you automate, the volume of cases or decisions, the data available and a leader who owns that workflow",
    reviews: "data privacy, security and legal review",
    reads: ["evaluation write-ups on a buyer's own history", "guardrail and human review designs", "data handling and privacy notes", "cost per resolved case comparisons"],
    venues: ["AI and data leader communities", "workflow owner forums in your buyers' industry", "responsible AI and risk working groups"],
    assets: ["an evaluation plan on the buyer's own data", "a data handling and privacy note", "a human-review and guardrail design"],
    firstValue: "the buyer sees the AI handle their own cases on an evaluation set",
    expansionSignal: "a second workflow or team asks for the same agent",
    typical: ["E", "I"],
    fit: {
      E: "AI products are usually sold to a workflow owner after a proof of concept on their own data, so account-based selling with integration partners fits",
      P: "a hands-on trial helps when buyers can test on their own data, but production use still needs security and legal review",
      I: "buyers look for evidence on accuracy and cost per case, so content built on evaluations reaches them while they compare options",
      C: "buyers trust peers who run the same kind of AI in production, so practitioner communities carry weight",
    },
  },
  ites: {
    terms: ["modernization", "migration", "digital transformation", "contact centre", "RPA", "automation", "cloud", "platform engineering", "offshore", "nearshore", "service desk", "run and change", "digital engineering", "centre of excellence"],
    partners: ["technology platform vendors whose partner programmes include services firms", "sourcing and advisory firms that run vendor shortlists", "cloud providers that fund or co-sell modernization work", "analyst firms that rate service providers"],
    accounts: "contract renewal dates, the incumbent provider, a stated cost or modernization programme, applications waiting for migration and the size of the IT estate",
    reviews: "procurement, vendor management, finance and security",
    reads: ["transition plans and governance models", "SLA reporting examples", "cost-versus-modernization trade-off papers", "client references in the same industry"],
    venues: ["CIO and IT leader roundtables", "sourcing and vendor management forums", "technology partner summits"],
    assets: ["a staged transition plan with exit criteria", "a governance model and a sample SLA report", "references from clients of a similar size"],
    firstValue: "a client sees a short assessment or proof of concept on one of their own applications",
    expansionSignal: "the client asks for a second workstream or a wider scope",
    typical: ["E", "C"],
    fit: {
      E: "services are bought through RFPs and relationships, so account-based selling with technology and advisory partners is the usual way in",
      P: "a service has no product to try alone, so the product-led idea shows up as a short assessment the client can use without a full contract",
      I: "CIOs and sourcing leads search on modernization and cost topics, so content and analyst coverage help you get onto shortlists",
      C: "clients trust references from similar clients, so client forums and reference programmes carry weight",
    },
  },
  telecom: {
    terms: ["underlay", "overlay", "private 5G", "IoT connectivity", "leased line", "SIM", "roaming", "CPaaS", "DDoS protection", "colocation", "VPN", "WAN", "bandwidth", "managed SD-WAN"],
    partners: ["device, firewall and SD-WAN technology vendors you build on", "systems integrators and managed service providers that run enterprise networks", "data centre and cloud providers whose customers need connectivity", "channel partners and resellers that already hold enterprise accounts"],
    accounts: "number of branch sites, sites with repeated outages, contract end dates and the incumbent operator",
    reviews: "security review of the overlay, procurement rate-card comparison and a site survey",
    reads: ["cost per site comparisons", "outage and repair time analysis", "wave plans for multi-site migrations", "SD-WAN and security overlay design notes"],
    venues: ["IT infrastructure and network leader forums", "enterprise networking and telecom events", "retail, banking and manufacturing operations groups with many branches"],
    assets: ["a site survey template and a wave plan by region", "an uptime and repair time report format for pilot sites", "a rate card with a cost per site view"],
    firstValue: "a pilot site runs on the new link and the IT team sees its uptime and repair time",
    expansionSignal: "the next region or wave of sites is added to the contract",
    typical: ["E"],
    fit: {
      E: "enterprise connectivity is bought through rate-card comparisons and pilot sites, so account-based selling with channel partners is the usual way in",
      P: "a network service cannot be tried alone, so the product-led idea shows up as a site survey or a pilot at one or two sites",
      I: "network leads search for outage cost and multi-site migration topics, so content built on those reaches them before a tender",
      C: "network leads ask peers at other multi-site companies which operator held up, so references and peer groups carry weight",
    },
  },
  cybersecurity: {
    terms: ["threat intelligence", "attack path", "dark web", "phishing", "takedown", "brand impersonation", "leaked credentials", "vulnerability", "SIEM", "XDR", "EDR", "zero trust", "third-party risk", "digital risk protection"],
    partners: ["managed security service providers (MSSPs) that run security for mid-size buyers", "SIEM, ticketing and cloud platform vendors you integrate with", "cloud marketplaces your buyers buy through", "audit and risk advisory firms that recommend tools after a finding"],
    accounts: "recent audit findings or incidents, the cloud and security tools in use, regulatory pressure and the size of the security team",
    reviews: "security architecture, risk and compliance, and a proof of value",
    reads: ["exposure and attack path write-ups", "alert fatigue and prioritisation papers", "SIEM and ticketing integration notes", "audit evidence guides"],
    venues: ["CISO peer groups", "security operations and cloud security communities", "regulatory and audit working groups"],
    assets: ["a time-boxed proof of value plan with success criteria in writing", "an integration list for the SIEM and ticketing tools", "an evidence pack for audit and risk reviewers"],
    firstValue: "a security engineer sees real exposures found in their own environment",
    expansionSignal: "another team, cloud account or business unit asks to be covered",
    typical: ["E"],
    fit: {
      E: "security is CISO-led with a proof of value, often after an audit finding or incident, so account-based selling with MSSPs and marketplaces is the usual way in",
      P: "security teams will run a free scan or trial on a small scope, but a production deal still needs the CISO, risk and compliance",
      I: "security leaders search on threats, exposure and audit topics, so research content builds trust before a proof of value",
      C: "CISOs trust peer CISOs more than vendors, so peer groups and references carry weight",
    },
  },
  software: {
    terms: ["CI/CD", "SDK", "collections", "mock servers", "monitoring", "regression testing", "cross-browser testing", "test automation", "observability", "open source", "developer portal", "OpenAPI", "workspaces", "API governance"],
    partners: ["cloud platform marketplaces your developers already use", "CI/CD, source control and IDE ecosystems you integrate with", "open-source projects and maintainers near your product", "consultancies and agencies that build on your platform"],
    accounts: "engineering team size, tools in the pipeline, number of developers already active in your product and an engineering leader who owns the tooling budget",
    reviews: "security review of code and data access, and procurement",
    reads: ["documentation, SDK references and tutorials", "migration guides from the tool a team uses today", "benchmark write-ups on the team's own pipeline", "integration recipes for CI and source control"],
    venues: ["developer communities and meetups", "open-source projects and forums", "platform engineering and QA communities"],
    assets: ["a security documentation pack that says what the product reads and stores", "a migration guide for existing scripts and tests", "a team pricing and usage explanation"],
    firstValue: "a developer gets a working result in their own project, such as a first test run or a first API call",
    expansionSignal: "several developers in one company are active and a team lead asks for shared workspaces",
    typical: ["P", "I", "C"],
    fit: {
      E: "once developers are active inside a company, an enterprise deal led by engineering leadership needs account-based selling and platform partners",
      P: "developers usually try a tool on their own first, so a product-led start suits this sector when the product can be used without a call",
      I: "developers search for answers and tutorials, so documentation and content bring them in",
      C: "developers trust other developers, so communities and open-source presence carry weight",
    },
  },
  saas: {
    terms: ["subscription", "pricing plans", "usage-based billing", "invoicing", "dunning", "churn", "entitlements", "revenue recognition", "CPQ", "integration", "lead scoring", "CRM", "pipeline", "marketing automation"],
    partners: ["platform and marketplace vendors your buyers already use", "implementation and consulting partners that set up tools like yours", "complementary tools your buyers connect yours to", "associations and analysts in your buyers' function"],
    accounts: "the function that owns the problem, tools in use today, team size and a visible trigger such as a new leader or a change of system",
    reviews: "finance, IT and security",
    reads: ["how-to guides for the function's daily problem", "comparisons with building it in-house", "migration and integration guides", "customer before and after write-ups"],
    venues: ["peer communities for the function you sell to", "association events for that function", "customer advisory groups"],
    assets: ["a migration plan and time-to-first-value outline", "an integration list", "a customer before and after write-up"],
    firstValue: "a new user completes the task the product exists for, on their own data",
    expansionSignal: "a second team or function in the account starts using it",
    typical: ["P", "I"],
    fit: {
      E: "larger deals in this sector go through finance, IT and security, so account-based selling suits the bigger accounts",
      P: "buyers often expect to try the product before talking to sales, so a product-led start suits smaller accounts",
      I: "buyers search for the function's daily problem, so content and outbound to the function bring them in",
      C: "customers vouch for tools in peer groups, which helps renewals and expansion",
    },
  },
};

// A generic SaaS seller sells to some function. The seller's own text says which; this table is only used for the generic SaaS sector.
export const BUYER_FUNCTIONS = [
  { id: "finance", re: /\b(billing|invoic\w*|revenue recognition|collections|reconcil\w*|accounts (?:payable|receivable)|finance|cfo|controller|payments?)\b/gi,
    name: "finance", committee: "The Chief Financial Officer or VP Finance signs; the head of billing, finance operations or revenue operations champions; finance operations use it daily; IT and security check the ERP, CRM and payment integrations; audit reviews how revenue is recognised.",
    roles: ["Chief Financial Officer", "VP Finance", "Head of Billing or Revenue Operations", "Finance Controller"],
    terms: ["billing", "invoicing", "revenue recognition", "collections", "reconciliation", "month-end close", "dunning", "ERP", "days sales outstanding"],
    metrics: ["days to close the books", "billing errors and credit notes", "days sales outstanding", "failed payment recovery", "time spent reconciling"] },
  { id: "revenue", re: /\b(pipeline|sales team|sales reps?|quota|revenue operations|revops|crm|forecast\w*|sales cycle|sellers)\b/gi,
    name: "revenue", committee: "The Chief Revenue Officer signs; the head of sales operations or revenue operations champions; sales managers and reps use it daily; IT and security check the CRM integration; finance checks the cost per seat or per user.",
    roles: ["Chief Revenue Officer", "Head of Sales Operations", "Head of Revenue Operations", "Sales Manager"],
    terms: ["pipeline", "forecast", "quota", "win rate", "CRM", "sales cycle", "ramp time"],
    metrics: ["pipeline coverage", "win rate", "sales cycle length", "forecast accuracy", "rep ramp time"] },
  { id: "customer", re: /\b(customer success|support|churn|renewals?|onboarding|tickets?|customer experience|nps)\b/gi,
    name: "customer", committee: "The Chief Customer Officer or Head of Customer Success signs; a support or success operations lead champions; success managers and agents use it daily; IT and security check data access.",
    roles: ["Chief Customer Officer", "Head of Customer Success", "Head of Support", "Support Operations Lead"],
    terms: ["churn", "renewal", "health score", "onboarding", "first response time", "tickets", "net revenue retention"],
    metrics: ["net revenue retention", "logo churn", "time to first value", "first response time", "renewal rate"] },
  { id: "marketing", re: /\b(marketing|campaigns?|leads?|demand gen\w*|content|seo|brand)\b/gi,
    name: "marketing", committee: "The Chief Marketing Officer or VP Marketing signs; the head of demand generation or marketing operations champions; marketers use it daily; sales operations and IT check the CRM and data flows.",
    roles: ["Chief Marketing Officer", "VP Marketing", "Head of Demand Generation", "Marketing Operations Lead"],
    terms: ["pipeline sourced", "cost per qualified lead", "campaign", "attribution", "lead scoring", "marketing automation"],
    metrics: ["pipeline sourced by marketing", "cost per qualified lead", "lead to meeting conversion", "campaign cycle time"] },
  { id: "people", re: /\b(hiring|recruit\w*|employees?|payroll|hr|people team|talent|onboarding new hires)\b/gi,
    name: "people", committee: "The Chief People Officer or Head of HR signs; the head of HR operations or talent champions; HR and managers use it daily; IT and security check employee data access; finance checks cost per employee.",
    roles: ["Chief People Officer", "Head of HR Operations", "Head of Talent", "HR Business Partner"],
    terms: ["time to hire", "offer acceptance", "onboarding", "payroll", "HR administration", "employee records"],
    metrics: ["time to hire", "offer acceptance", "time spent on HR administration", "employee onboarding time"] },
];

// How a business model is entered and tried. "entry" is what a buyer can do before a full contract; "assisted" is the version of a
// self-serve start for a model that cannot be tried alone. No figures.
export const MODEL_PLAN = {
  saas: { selfServe: true, entry: "a time-boxed pilot on the buyer's own data with success criteria agreed first", assisted: "a guided pilot on one team's real data" },
  hardware_software: { selfServe: true, entry: "a pilot with a small set of devices at one site", assisted: "a pilot with a small set of devices at one site" },
  services: { selfServe: false, entry: "a fixed-scope assessment of one process or application (for example a migration readiness review) with a written findings report", assisted: "a short assessment of one process or application, such as a migration readiness review, whose findings report the client keeps" },
  connectivity: { selfServe: false, entry: "a site survey and a pilot at one or two sites", assisted: "a site survey and a pilot at one or two sites, with uptime and repair time reported" },
  investment: { selfServe: false, entry: "a model portfolio or a trial allocation reviewed against the buyer's own mandate, with any back-tested result labelled as back-tested", assisted: "read-only research access or a model portfolio shown against the buyer's own mandate" },
  transactions: { selfServe: true, entry: "a sandbox and a pilot on a share of the buyer's real volume", assisted: "a sandbox and a pilot on a share of the buyer's real volume" },
  marketplace: { selfServe: true, entry: "a first batch of listings or orders handled with your team's help", assisted: "a first batch of listings or orders handled with your team's help" },
  unknown: { selfServe: null, entry: "a time-boxed pilot with success criteria agreed in writing", assisted: "a time-boxed pilot with success criteria agreed in writing" },
};

// The buying committee, measures, objections and proof for a business that manages investments. Used instead of the sector's block
// whatever sector word the seller used (an AI native firm that sells investment strategies is bought like a manager, not like an AI help desk).
export const INVESTMENT_BLOCK = {
  committee: "The chief investment officer or the investment committee signs and carries the fiduciary duty; the head of manager research or portfolio construction champions; risk, compliance and operational due diligence review the manager; investment consultants often shape the shortlist; the operations team checks reporting and custody.",
  metrics: ["tracking error against the benchmark", "risk-adjusted return over a full market cycle", "drawdown in stressed periods", "turnover and capacity", "fee against value added", "reporting timeliness"],
  objections: [
    { objection: "The track record is too short", response: "Show the research process, how the strategy behaves in different market conditions and the risk controls; label any back-tested result as back-tested, never as live performance." },
    { objection: "We cannot explain a black box to our committee", response: "Offer an explanation of what drives each position and an independent review of the model for the committee." },
    { objection: "Capacity and fees", response: "State capacity limits and the fee basis plainly, and compare the fee with the value added over the benchmark the buyer uses." },
    { objection: "Operational due diligence", response: "Prepare the due diligence questionnaire answers, custody and reporting details before they are asked for." },
  ],
  proofShape: "A live or independently verified track record over a full market cycle, with the investment process and risk controls documented for due diligence.",
  salesMotion: "Consultant and relationship led; a long due diligence cycle with research, risk and operational reviews before a first allocation, often a small one that grows.",
  roles: ["Chief Investment Officer", "Head of Manager Research", "Head of Risk", "Head of Operational Due Diligence"],
  vocabulary: ["due diligence", "track record", "investment committee", "mandate", "tracking error", "allocation"],
  terms: ["securities", "fiduciary duty", "benchmark", "drawdown", "factor exposure", "explainability", "back-test", "capacity", "custody", "consultant rating", "rebalancing", "risk model"],
  partners: ["investment consultants and platforms that shortlist managers", "custodians and fund administrators", "data and research providers your buyers already use", "placement agents and distribution partners"],
  accounts: "mandate type, assets under oversight, the consultant that advises them and a review of managers that is coming up",
  reviews: "risk, compliance, operational due diligence and the investment committee",
  reads: ["process and risk control papers, including how securities are selected and sized", "explainability notes for the investment committee", "behaviour in different market conditions", "due diligence questionnaire answers"],
  venues: ["asset owner and consultant conferences", "institutional investor roundtables", "investment committee education sessions"],
  assets: ["a due diligence questionnaire pack", "a documented investment process and risk controls", "a reporting sample and custody details"],
  firstValue: "the buyer's research team sees the strategy's positions and drivers on their own mandate",
  expansionSignal: "a first allocation is topped up or a second mandate is discussed",
  fit: {
    E: "asset owners and banks select managers through consultants and long due diligence, so account-based selling with consultants and platforms is the usual way in",
    P: "a manager cannot be tried alone, so the product-led idea shows up as read-only research access or a model portfolio shown against the buyer's mandate",
    I: "allocators and consultants look for process and risk papers, so research content reaches them while manager lists are built",
    C: "allocators ask peers and consultants about managers, so references and investor roundtables carry weight",
  },
};

// ---------- small helpers ----------
const lowerFirst = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t);
const stripEnd = (t) => String(t || "").replace(/[.\s]+$/, "");
const num = (n) => Number(n).toLocaleString("en-US");
export function joinList(items) {
  const a = (items || []).filter(Boolean);
  if (a.length <= 1) return a.join("");
  if (a.length === 2) return a[0] + " and " + a[1];
  return a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
}
// Items that hold their own "and" or commas are joined with semicolons, so the list can still be read.
export function joinLong(items) {
  const a = (items || []).filter(Boolean);
  if (a.length <= 1) return a.join("");
  if (a.length === 2) return a[0] + "; and " + a[1];
  return a.slice(0, -1).join("; ") + "; and " + a[a.length - 1];
}
const clean = (t) => (typeof t === "string" ? t.trim() : "");

// The function a generic SaaS seller sells to, read from the seller's own words: the one with the most hits, at least two.
export function buyerFunction(...texts) {
  const text = texts.filter((t) => typeof t === "string").join(" \n ");
  let best = null;
  for (const f of BUYER_FUNCTIONS) {
    const hits = (text.match(f.re) || []).length;
    if (hits >= 2 && (!best || hits > best.hits)) best = { f, hits };
  }
  return best ? best.f : null;
}

// Everything the plan needs, in one place: the sector record, the business model, the motion and the user's numbers.
export function planContext({ vertical, model, args }) {
  const a = args || {};
  const fn = vertical && vertical.id === "saas" ? buyerFunction(a.company_description, a.gtm_challenge, a.challenge, a.industry) : null;
  const inv = model === "investment";
  const sp = inv ? INVESTMENT_BLOCK : vertical ? SECTOR_PLAN[vertical.id] : null;
  const roles = inv ? INVESTMENT_BLOCK.roles : fn ? fn.roles : vertical ? vertical.buyerRoles : ["the person who signs", "the champion who feels the problem", "the daily user"];
  const metrics = inv ? INVESTMENT_BLOCK.metrics : fn ? fn.metrics : vertical ? vertical.metrics : ["the number your buyer already reports on", "the cost of the problem today"];
  const objections = inv ? INVESTMENT_BLOCK.objections : vertical ? vertical.objections : [];
  const proofShape = inv ? INVESTMENT_BLOCK.proofShape : vertical ? vertical.proofShape : "a before and after of one measure your buyer already tracks, at one customer, signed off by that customer";
  const vocab = inv ? INVESTMENT_BLOCK.vocabulary : vertical ? vertical.vocabulary : [];
  const mp = MODEL_PLAN[model] || MODEL_PLAN.unknown;
  const acv = typeof a.acv_usd === "number" && isFinite(a.acv_usd) ? a.acv_usd : null;
  const cycle = typeof a.deal_cycle_days === "number" && isFinite(a.deal_cycle_days) ? a.deal_cycle_days : null;
  const tam = typeof a.tam_accounts === "number" && isFinite(a.tam_accounts) ? a.tam_accounts : null;
  const nrr = typeof a.nrr_percent === "number" && isFinite(a.nrr_percent) ? a.nrr_percent : null;
  const channels = clean(a.current_channels);
  return {
    vertical, model, sp, fn, roles, metrics, objections, proofShape, vocab, mp, acv, cycle, tam, nrr, channels,
    signer: roles[0], champion: roles[1] || roles[0], user: roles[roles.length - 1],
    cycleText: cycle ? "your " + num(cycle) + "-day cycle" : "your sales cycle",
    longCycle: cycle !== null && cycle > 90,
    shortCycle: cycle !== null && cycle < 14,
    sectorName: vertical ? vertical.name : null,
    company: clean(a.company_name),
  };
}

const metricsText = (c, n) => joinList(c.metrics.slice(0, n));
const neutral = {
  partners: ["the vendors and advisers already in your buyers' stack", "implementation partners that set up tools like yours", "associations and analysts in your buyers' function"],
  accounts: "fit with your best customers, a visible trigger (a new leader, a launch, a change of system or a regulation) and how many people you can reach",
  reviews: "security, finance and procurement",
  reads: ["how-to guides for the daily problem", "customer before and after write-ups", "comparisons with the way buyers solve it today"],
  venues: ["the communities and events your best customers already attend", "association events for your buyer's function"],
  assets: ["a security and integration note", "a pilot plan with the measures agreed first", "a customer reference"],
  firstValue: "a new user completes the task the product exists for, on their own data",
  expansionSignal: "a second team in the account starts using it",
};
const sp = (c, k) => (c.sp && c.sp[k]) || neutral[k];

// What the user already does, quoted in their own words (the text was made inert before it got here).
const deciders = (c) => (c.vertical || c.model === "investment" ? joinList(c.roles.slice(0, 2)) : "the person who signs and the champion who feels the problem");
const channelStep = (c) => c.channels
  ? "Start from what you do today. You said: \"" + c.channels + "\". For each channel, count the meetings it produced with the roles that decide (" + deciders(c) + "), and keep the one or two that reach them."
  : null;

function objectionStep(c) {
  const o = c.objections.slice(0, 2);
  if (!o.length) return "Write down the two objections your buyers raise first, with the answer to each backed by one customer fact, and rehearse them with your sales lead.";
  return "Prepare the two objections this buyer raises first and rehearse the answers with your sales lead. " + o.map((x) => "\"" + x.objection + "\": " + stripEnd(x.response) + ".").join(" ");
}

function reviewStep(c) {
  const r = sp(c, "reviews");
  return c.longCycle
    ? "For every account name the people on the buying side: " + joinList(c.roles.slice(0, 4)) + ". Write down who signs, who champions and who can block. With " + c.cycleText + ", add the review steps (" + r + ") to the same sheet and book their dates before the first meeting, so no review surprises you late."
    : "For every account name the people on the buying side: " + joinList(c.roles.slice(0, 4)) + ". Write down who signs, who champions and who can block, and which reviews come before a decision (" + r + ").";
}

// ---------- the plans: three steps in each of three phases, for each motion ----------
// E: Ecosystem and ABM
function planE(c) {
  const list = c.tam ? "Rank your " + num(c.tam) + " addressable accounts by " + sp(c, "accounts") + ", and take the top 50" + EXAMPLE + ". One person should be able to research each account properly."
    : "Build the account list: rank accounts by " + sp(c, "accounts") + ", and take the top 50" + EXAMPLE + ". One person should be able to research each account properly.";
  const d30 = [
    list,
    reviewStep(c),
    "List who already sits in your buyers' stack and could introduce or connect with you: " + joinLong(sp(c, "partners")) + ". Pick the two that touch the most accounts on your list and ask each what a joint account plan would need.",
  ];
  const d60 = [
    "Run a first ABM wave on the top 20 accounts" + EXAMPLE + ". Open with the numbers this buyer already watches (" + metricsText(c, 3) + ") and offer " + c.mp.entry + ".",
    "Sign the first two partners with a one-page agreement: what each brings (introductions, integration or resale), how an introduced account is tracked from first meeting to closed won, and who answers the buyer's technical questions.",
    objectionStep(c),
  ];
  const d90 = [
    "Turn the first wave into a proof point in the shape this buyer trusts. Write up the first result as " + lowerFirst(stripEnd(c.proofShape)) + ".",
    "Extend the wave to the next accounts on the list and give partners a short enablement pack: who to introduce, what to say, what not to promise, and the proof point above. Keep ready: " + joinLong(sp(c, "assets")) + ".",
    "Measure pipeline from ABM and from partners separately, and the days from first meeting to closed won against " + c.cycleText + ", so next quarter's budget follows the part that moves accounts.",
  ];
  return { d30: c.channels ? [channelStep(c), ...d30] : d30, d60, d90 };
}

// I: Inbound and Outbound
function planI(c) {
  const words = c.vocab.length ? joinList(c.vocab.slice(0, 5)) : "";
  const d30 = [
    words ? "Write down the words your buyers use for the problem (" + words + ") next to the words you use. Keep the buyer's version for search terms, subject lines and headlines."
      : "Interview five customers and write down, in their exact words, how they describe the problem before they buy" + EXAMPLE + ". Keep their version for search terms, subject lines and headlines, and drop yours where the two differ.",
    c.channels ? channelStep(c) : "List what you do today to reach buyers, count the meetings each channel produced with the roles that decide (" + deciders(c) + "), and keep the one or two that reach them.",
    "Build the outbound list by role (" + joinList(c.roles.slice(0, 3)) + ")" + (c.tam ? " at the accounts within your " + num(c.tam) + " addressable accounts that show a trigger" : " at accounts that show a trigger") + ". Write one message per role, never one message for all.",
  ];
  const d60 = [
    "Publish the proof in the forms these buyers read: " + joinLong(sp(c, "reads")) + ". Build each piece on the numbers the buyer already watches (" + metricsText(c, 2) + ").",
    "Start a short outbound sequence to the list. Each message opens with a problem in the buyer's words and ends with one ask: " + c.mp.entry + ".",
    c.longCycle ? "Agree with sales which signals mean a call is worth booking (a reply, a second reader at the same account, a request for the reference). With " + c.cycleText + ", expect several people to engage before anyone asks for a meeting." : "Agree with sales which signals mean a call is worth booking (a reply, a second reader at the same account, a request for the reference) and how fast each is followed up.",
  ];
  const d90 = [
    "Keep the channels that book meetings with the right roles and stop the rest. With " + c.cycleText + ", judge them on meetings and qualified pipeline, not on closed deals yet.",
    "Track every opportunity from first touch to closed won, so you can see which channel starts the deals that close and how long each takes" + (c.acv ? " at your ACV of " + num(c.acv) + " US dollars a year." : "."),
    "Add the assets this buyer asks for before buying: " + joinLong(sp(c, "assets")) + ".",
  ];
  return { d30, d60, d90 };
}

// P: Product-Led Growth, in its self-serve form (a product people can try alone) and its assisted form (everything else)
function planPSelf(c, prefix = "") {
  const p = (t) => prefix + t;
  return {
    d30: [
      p("Define the first moment of value: " + sp(c, "firstValue") + ". Measure how many new users reach it and how long it takes."),
      p("Remove the steps between sign-up and that moment, and record where people stop."),
      p("Decide who the product-led user is (" + c.user + ") and who still has to say yes (" + c.signer + "). The sales conversation starts when the second person appears in an account."),
    ],
    d60: [
      p("Launch the improved first-use path and offer " + c.mp.entry + " to accounts that ask for more."),
      p("Build the hand-off from usage to a sales conversation: flag accounts where " + sp(c, "expansionSignal") + ", and have a person reach out within a day."),
      p("Test the plan and price page for the buyer who signs" + (c.vertical || c.model === "investment" ? " (" + c.signer + ")" : "") + ", not only for the user who tried the product."),
    ],
    d90: [
      p("Measure the share of new accounts that started in the product, the share that reached the first moment of value and the share that moved to a sales conversation." + (c.nrr ? " Compare with your NRR of " + c.nrr + " percent to see whether product-led accounts expand as much as sales-led ones." : "")),
      p("Add invitations inside accounts, so one user can bring in a teammate, and watch whether the second user reaches the first moment of value."),
      p("Write the first customer story from a product-led account in the shape this buyer trusts: " + lowerFirst(stripEnd(c.proofShape)) + "."),
    ],
  };
}
function planPAssisted(c, prefix = "") {
  const p = (t) => prefix + t;
  return {
    d30: [
      p("Choose the one low-risk way a buyer can see value without a full project: " + c.mp.assisted + ". Write the scope on one page, with what the buyer gets to keep."),
      p("Agree the measure that shows value in that step (" + metricsText(c, 2) + ") and who on the buyer's side signs it off."),
      p("Decide who starts it (" + c.champion + ") and who still has to say yes (" + c.signer + "), and give the starter a short pack they can forward."),
    ],
    d60: [
      p("Offer the step to the accounts you already talk to and run the first two, recording what the buyer asked for that you did not expect."),
      p("Build the hand-off from the step to a full contract: the findings or results, a proposal that follows from them and a date for the decision."),
      p("Write down what the step costs you to deliver, so you can tell which accounts to offer it to and which to qualify first."),
    ],
    d90: [
      p("Measure how many step-one accounts moved to a full contract, how long that took" + (c.cycle ? " against " + c.cycleText : "") + " and what the ones that stopped had in common."),
      p("Write the first result up in the shape this buyer trusts: " + lowerFirst(stripEnd(c.proofShape)) + "."),
      p("Keep the version of the step that converts and drop the rest."),
    ],
  };
}
function planP(c) {
  if (c.mp.selfServe === true) return planPSelf(c);
  if (c.mp.selfServe === false) return planPAssisted(c);
  // The business model is not known: give both versions, each marked with the condition under which it applies.
  const s = planPSelf(c, "If buyers can start without a sales call: ");
  const a = planPAssisted(c, "If they cannot (a service, a network, an enterprise platform with a pilot): ");
  return {
    d30: [s.d30[0], s.d30[1], a.d30[0]],
    d60: [s.d60[0], s.d60[1], a.d60[0]],
    d90: [s.d90[0], a.d90[0], a.d90[1]],
  };
}

// C: Community-Led
function planC(c) {
  const d30 = [
    "Choose where your buyers already talk: " + joinLong(sp(c, "venues")) + ". Join two and listen before you launch your own.",
    "Invite five to ten customers who got a result" + EXAMPLE + " to be founding members, and ask each what they would want to discuss with peers in their role (" + c.champion + ").",
    "Agree what the community is for: peer answers on " + metricsText(c, 2) + ", not product announcements.",
  ];
  const d60 = [
    "Run the first two sessions led by customers, not by you. Each member shows how they measure " + c.metrics[0] + " and what they changed.",
    "Record the questions members ask. They become your content and your list of objections to answer.",
    c.channels ? "Connect the community to what you already do (" + c.channels + "): invite the people you meet there to a session, and note which ones come back." : "Ask members who got a result to act as a reference for the prospects you are talking to now.",
  ];
  const d90 = [
    "Turn the sessions into proof in the shape this buyer trusts: " + lowerFirst(stripEnd(c.proofShape)) + ".",
    c.nrr ? "Your NRR is " + c.nrr + " percent. Track whether members renew and expand more than customers who do not join, and use the answer to decide how much to invest next quarter." : "Track whether members renew and expand more than customers who do not join, and use the answer to decide how much to invest next quarter.",
    "Open a session to selected prospects, hosted by a customer, and count how many of them reach a sales conversation in the next 30 days.",
  ];
  return { d30, d60, d90 };
}

const PLANNERS = { E: planE, P: planP, I: planI, C: planC };

/** The three phases of a plan for one motion: days_30, days_60 and first_quarter, each a list of sentences. */
export function buildPlan({ letter, vertical, model, args }) {
  const c = planContext({ vertical, model, args });
  const planner = PLANNERS[letter] || planP;
  const p = planner(c);
  const fix = (list) => list.filter(Boolean).map((t) => t.replace(/\s+/g, " ").replace(/\.\./g, "."));
  return { days_30: fix(p.d30), days_60: fix(p.d60), first_quarter: fix(p.d90), context: c };
}

/** The block of notes for a business that manages investments, or the sector's own block, with the buyer function for generic SaaS. */
export function sectorBlock(vertical, model, args) {
  if (!vertical && model !== "investment") return null;
  const c = planContext({ vertical, model, args });
  if (model === "investment") {
    const extra = vertical && vertical.id === "ai-native" ? [{ objection: "AI gets answers wrong", response: "Show how the model is validated, how a person reviews its output before any allocation, and which results are back-tested and which are live." }] : [];
    return {
      sector: vertical ? vertical.name : "investment management",
      who_decides: INVESTMENT_BLOCK.committee,
      what_it_measures: INVESTMENT_BLOCK.metrics,
      usual_objections: [...INVESTMENT_BLOCK.objections, ...extra].map((o) => o.objection),
      proof_that_lands: INVESTMENT_BLOCK.proofShape,
      sales_motion: INVESTMENT_BLOCK.salesMotion,
      buyer_words: [...new Set([...INVESTMENT_BLOCK.vocabulary, ...INVESTMENT_BLOCK.terms])],
      read_as: "A business that manages investments is bought like an investment manager: through the investment committee, consultants and due diligence. This block is used instead of the " + (vertical ? vertical.name : "sector") + " block.",
    };
  }
  const v = vertical;
  const fnBlock = c.fn ? {
    who_decides: c.fn.committee,
    what_it_measures: [...c.fn.metrics, ...v.metrics.filter((m) => /retention|churn/.test(m))],
    read_as: "Your own words point at " + c.fn.name + " buyers (" + joinList(c.roles.slice(0, 3)) + "), so the buying committee and measures are those of a " + c.fn.name + " function, not the generic SaaS ones.",
  } : {};
  return Object.assign({
    sector: v.name,
    who_decides: v.committee,
    what_it_measures: v.metrics,
    usual_objections: v.objections.map((o) => o.objection),
    proof_that_lands: v.proofShape,
    sales_motion: v.salesMotion,
    buyer_words: [...new Set([...(c.fn ? c.fn.terms : v.vocabulary), ...((SECTOR_PLAN[v.id] || {}).terms || [])])],
  }, fnBlock);
}

/** One paragraph that says how the lead motion sits with the way this sector (or this kind of business) usually buys. */
export function sectorFit({ vertical, model, letter, motionName, scores, selfServeGiven }) {
  const inv = model === "investment";
  const spx = inv ? INVESTMENT_BLOCK : vertical ? SECTOR_PLAN[vertical.id] : null;
  if (!spx) return null;
  const typical = inv ? ["E"] : spx.typical;
  const name = inv ? "investment management" : vertical.name;
  const own = spx.fit[letter];
  const tie = scores && ["E", "P", "I", "C"].every((k) => scores[k] === scores[letter]);
  const selfCapable = (MODEL_PLAN[model] || MODEL_PLAN.unknown).selfServe !== false;
  let text;
  if (tie) {
    text = "No input separated the four motions, so the scores tie and " + motionName + " leads only by the tie-break. Use the " + name + " pattern to choose: " + spx.fit[typical[0]] + ".";
  } else if (typical.includes(letter)) {
    text = "The lead motion, " + motionName + ", matches how " + name + " is usually bought: " + own + ".";
  } else {
    text = "The lead motion, " + motionName + ", differs from the usual " + name + " pattern (" + lowerFirst(spx.fit[typical[0]]) + "). Your numbers decided it, so test the gap: " + own + ".";
  }
  // Where the sector's usual route is product-led but the score is low because self_serve was not given, say so.
  if (!tie && letter !== "P" && typical.includes("P") && selfCapable && !selfServeGiven && scores) {
    text += " In this sector the product-led route is common; its score is " + scores.P + " and no lift was applied because self_serve was not given (see the self-serve check).";
  }
  // A large-account lead in a sector that also sells to small accounts self-serve.
  if (!tie && letter === "E" && selfCapable && spx.fit.P && !typical.includes("P") && vertical && ["saas", "software", "ai-native", "vertical-saas"].includes(vertical.id)) {
    text += " The product-led route still fits smaller accounts: " + spx.fit.P + ".";
  }
  return text.replace(/\.\./g, ".");
}

