// netlify/lib/gtm-plan.js
// Run 20 quality round 1b (D92): the plan text of the three GTM Alpha tools. The EPIC scores come from epic-advanced.js and are
// not decided here. This file only words what follows from them: the first steps and the roadmap for the lead motion, written
// from the sector (netlify/lib/verticals.js, the shared sector file), the business model, and the user's own inputs (channels,
// ACV, deal cycle, TAM, NRR). Rule B82: words only. No statistic, benchmark, market size or named company. A count such as
// "top 50" is an example and is labelled the way these tools always label it. The extra sector detail below (partner types,
// places buyers meet, what they read) is vocabulary and buyer roles, kept here so the shared verticals.js stays a byte copy of
// the Revenue Enablement file.

import { INVESTMENT_PROFILE } from "./verticals.js";

export const EXAMPLE = " (Example figure: replace with your own)";

// Run 21b (rule B82): what sits next to the seller in the buyer's stack, where buyers meet, what they read and what they ask for before
// buying, in two layers. SECTOR_BASE holds only wording that is true for every company of the vertical; it is used for a company whose
// sub-type is not named and for a sub-type without a block of its own. KIND_PLAN holds the wording written for one kind of company and is
// used only when the sub-type the shared reader returned (vertical.subtype) is one of its `kinds`. Everything else about a sub-type
// (roles, committee, measures, objections, proof shape, vocabulary) comes from the shared sector file, and the rest from the user's inputs.
export const SECTOR_BASE = {
  "logistics-tech": {
    entry: "a pilot at one site, lane or region, with the measures agreed before it starts",
    partners: ["TMS, WMS and ERP vendors whose customers already run the systems you connect to", "3PLs and freight forwarders that serve several shippers", "systems integrators that roll out supply chain systems", "industry associations and analysts that cover supply chain operations"],
    accounts: "the volume your buyer moves, the systems already in place, exposure to peak periods and a visible trigger such as a new operations leader, a network change or a service failure",
    reviews: "IT integration, finance and an operations pilot sign-off",
    venues: ["supply chain and logistics associations", "roundtables for operations heads", "industry events where shippers and logistics providers meet"],
    assets: ["an integration guide for the order, transport and warehouse systems", "a pilot plan with the measures agreed before it starts", "a reference from a similar operation"],
    typical: ["E"],
    fit: {
      E: "this sector is usually bought by operations heads after a pilot at one site, lane or region, so account-based selling with integration partners is a common way in",
      P: "a self-serve start rarely fits a system tied to transport, warehouse and order data, so it works only as a small-operation entry route",
      I: "operations heads search for cost, delay and exception problems, so content built on those reaches them before a vendor list exists",
      C: "operations peers share lessons and vouch for vendors, which suits a long, pilot-led sale",
    },
  },
  fintech: {
    entry: "a pilot on one flow, team or entity, with the success criteria agreed in writing first",
    partners: ["technology vendors and systems integrators whose customers already run the systems you connect to", "banks and regulated institutions your buyers already work with", "audit, risk and advisory firms that review controls", "industry bodies and analysts that cover financial technology"],
    accounts: "the volume or value of money your buyer handles, the systems already in place, regulatory exposure and a visible trigger such as a new finance or product leader, an audit finding or a launch",
    reviews: "security, compliance and risk",
    venues: ["peer groups for finance and risk leaders", "industry association and regulator events", "financial technology conferences"],
    assets: ["a security and data handling pack", "an integration guide for the systems the buyer runs", "a reference from a pilot on one flow, team or entity"],
    typical: ["E"],
    fit: {
      E: "this sector is usually bought with a security, compliance and risk review inside the cycle, so account-based selling with technology and advisory partners is a common way in",
      P: "financial buyers expect a controlled rollout, so self-serve fits only small companies or a single team before a risk review",
      I: "buyers search for the problems their finance or product teams own, so content built on those problems reaches them early",
      C: "finance and risk leaders trust their peers, so references and peer groups carry weight at the review stage",
    },
  },
  "vertical-saas": {
    entry: "a pilot in one region or team, with the measures agreed before it starts",
    partners: ["system and ERP vendors your buyers already run", "industry associations, data providers and analysts in your buyers' trade", "device, connectivity and implementation partners that roll out software to the people who use it", "consultancies that run change programmes in your buyers' trade"],
    accounts: "the size of the buying business, the teams and sites that would use the product, the systems already in place and a visible trigger such as a reorganisation, a new region or a new leader",
    reviews: "IT integration, finance and a pilot sign-off",
    venues: ["association events for your buyers' trade", "trade conferences and sector forums", "peer groups of the business heads who buy"],
    assets: ["an integration guide for the systems the buyer already runs", "a pilot plan with the measures agreed before it starts", "a reference from a comparable business in the same trade"],
    typical: ["E", "I"],
    fit: {
      E: "software built for one trade is usually bought by the business function it serves after a pilot, so account-based selling with trade partners fits",
      P: "users adopt a trade-specific tool only when their manager backs it, so self-serve is an entry route for smaller buyers at most",
      I: "buyers search for the daily problems of their trade, so content on those reaches them before any vendor list exists",
      C: "buyers ask peers in the same trade what worked, so references are strong here",
    },
  },
  "ai-native": {
    entry: "a proof of concept on the buyer's own data, with a person checking the results",
    plg: { user: "a data or product lead trying it on their own data", signer: "the owner of the workflow it would serve" },
    partners: ["cloud and model platform providers your buyers already use", "data and integration vendors that hold the data your product needs", "systems integrators that build the workflow around an AI product", "industry bodies that publish guidance on AI use"],
    accounts: "the workflow you automate, the volume of cases or decisions, the data available and a leader who owns that workflow",
    reviews: "data privacy, security and legal review",
    reads: ["accuracy write-ups on a buyer's own data", "guardrail and human oversight designs", "data handling and privacy notes", "cost per case comparisons"],
    venues: ["AI and data leader communities", "workflow owner forums in your buyers' industry", "responsible AI and risk working groups"],
    assets: ["an accuracy test plan on the buyer's own data", "a data handling and privacy note", "a human oversight and guardrail design"],
    firstValue: "the buyer sees the AI handle a sample of their own cases",
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
    plg: { user: "a delivery or operations lead looking at a sample assessment" },
    partners: ["technology platform vendors whose partner programmes include services firms", "sourcing and advisory firms that run vendor shortlists", "cloud and software providers that fund or co-sell services work", "analyst firms that rate service providers"],
    accounts: "contract renewal dates, the incumbent provider, a stated cost or transformation programme and the size of the work in scope",
    reviews: "procurement, vendor management, finance and security",
    reads: ["transition plans and governance models", "service level reporting examples", "cost and quality trade-off papers", "client references in the same industry"],
    venues: ["roundtables for the executives who buy the service", "sourcing and vendor management forums", "technology partner summits"],
    assets: ["a staged transition plan with exit criteria", "a governance model and a sample service level report", "references from clients of a similar size"],
    firstValue: "a client sees a short assessment or proof of concept on one of their own processes or applications",
    expansionSignal: "the client asks for a second workstream or a wider scope",
    typical: ["E", "C"],
    fit: {
      E: "services are bought through RFPs and relationships, so account-based selling with technology and advisory partners is the usual way in",
      P: "a service has no product to try alone, so the product-led idea shows up as a short assessment the client can use without a full contract",
      I: "buyers and sourcing leads search on cost, quality and transformation topics, so content and analyst coverage help you get onto shortlists",
      C: "clients trust references from similar clients, so client forums and reference programmes carry weight",
    },
  },
  telecom: {
    entry: "a pilot at small scope, with quality and uptime measured against the current supplier's record",
    plg: { user: "a technical lead looking at a survey or a sandbox" },
    partners: ["device and network technology vendors you build on", "systems integrators and managed service providers that serve enterprise customers", "cloud and data centre providers whose customers need your service", "channel partners and resellers that already hold enterprise accounts"],
    accounts: "the number of sites, users or flows that depend on the service, contract end dates, the incumbent supplier and a visible trigger such as repeated service problems or a platform change",
    reviews: "security review, procurement price comparison and a technical pilot",
    venues: ["IT infrastructure and network leader forums", "enterprise technology and telecom events", "operator and channel partner events"],
    assets: ["a pilot plan with the quality and uptime measures agreed first", "an integration and security note", "a rate card with a cost comparison view"],
    typical: ["E"],
    fit: {
      E: "enterprise telecom services are usually bought through price comparisons and pilots, so account-based selling with channel partners is a common way in",
      P: "a network or messaging service often cannot be tried alone at full scale, so the product-led idea shows up as a sandbox, a survey or a pilot at small scope",
      I: "technology leads search for reliability and cost problems, so content built on those reaches them before a tender",
      C: "technology leads ask peers which supplier held up, so references and peer groups carry weight",
    },
  },
  cybersecurity: {
    entry: "a time-boxed proof of value on the buyer's own environment, with success criteria agreed in writing",
    plg: { user: "a security engineer running a scan on a small scope", signer: "the CISO" },
    partners: ["managed security service providers (MSSPs) that run or extend security operations for their clients", "security, ticketing and cloud platform vendors you integrate with", "cloud marketplaces your buyers buy through", "audit and risk advisory firms that recommend tools after a finding"],
    accounts: "recent audit findings or incidents, the cloud and security tools in use, regulatory pressure and the size of the security team",
    reviews: "security architecture, risk and compliance, and a proof of value",
    venues: ["CISO peer groups", "security operations and security engineering communities", "regulatory and audit working groups"],
    assets: ["a time-boxed proof of value plan with success criteria in writing", "an integration list for the security and ticketing tools the buyer runs", "an evidence pack for audit and risk reviewers"],
    firstValue: "a security engineer sees real findings in their own environment",
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
    entry: "a team trial on a real project, with the integration set up in the first week",
    plg: { user: "a developer trying it on their own project", signer: "the VP Engineering or CTO" },
    partners: ["cloud platform marketplaces your developers already use", "tooling and editor ecosystems you integrate with", "open-source projects and maintainers near your product", "consultancies and agencies that build on your platform"],
    accounts: "engineering team size, tools in the pipeline, number of developers already active in your product and an engineering leader who owns the tooling budget",
    reviews: "security review of code and data access, and procurement",
    reads: ["documentation, SDK references and tutorials", "migration guides from the tool a team uses today", "benchmark write-ups on the team's own pipeline", "integration recipes for the tools a team already uses"],
    venues: ["developer communities and meetups", "open-source projects and forums", "platform engineering and developer experience communities"],
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
    plg: { user: "the person who feels the problem day to day and tries the product", signer: "the budget owner of the function" },
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

// Wording written for one kind of company (a sub-type of the shared sector file). Used only when vertical.subtype is one of `kinds`.
export const KIND_PLAN = {
  "logistics-tech": {
    kinds: ["last-mile", "transport-management"],
    entry: "a pilot at one hub or city, with cost per delivery and first-attempt delivery measured before and after",
    plg: { user: "a planner or dispatcher trying the route plan on their own orders", signer: "the COO or Head of Supply Chain" },
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
    kinds: ["spend-expense"],
    entry: "a pilot on one entity or department, with the finance controller signing off the result",
    plg: { user: "a finance operations user trying it on one batch of their own transactions", signer: "the CFO" },
    terms: ["spend controls", "reimbursement", "treasury", "cards", "invoice matching"],
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
    kinds: ["fmcg-retail-execution"],
    entry: "a pilot in one region with a set of distributors, measured on productive calls and secondary sales",
    plg: { user: "a field rep or sales manager trying the app on their own beat", signer: "the National Sales Head" },
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
  telecom: {
    kinds: ["operators-connectivity"],
    plg: { user: "a network manager looking at a site survey", signer: "the CIO" },
    terms: ["underlay", "overlay", "private 5G", "IoT connectivity", "leased line", "SIM", "roaming", "DDoS protection", "colocation", "VPN", "WAN", "bandwidth", "managed SD-WAN"],
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
};

// Software sold to developers: the API platform wording applies only when the seller's own words name APIs as the product and the shared
// reader named no software sub-type (a developer platform or a testing tool gets its sub-type's notes instead).
export const API_PLATFORM = {
  communityTopics: "API design, documentation, governance and how APIs fit into developer workflows",
  over: {
    buyerRoles: ["VP Engineering", "Chief Technology Officer", "Platform Engineering Lead", "Head of API or Developer Experience", "Engineering Manager"],
    committee: "The VP Engineering or CTO signs; a platform or developer experience lead champions; developers use it daily and often adopt it first; security reviews code and data access; procurement handles licences or usage.",
    metrics: ["active developers per team", "time to first working result", "integrations in use", "specs and documentation kept in sync", "issues caught by governance rules before release"],
    vocabulary: ["developer experience", "APIs", "SDKs", "documentation", "integrations", "governance", "developer adoption", "API lifecycle"],
    proofShape: "Developer adoption or time to first working result on one team before and after, from the team's own usage data.",
  },
  terms: ["API design", "versioning", "OpenAPI", "API governance", "developer portal", "rate limits", "webhooks", "API keys"],
};

// A generic SaaS seller sells to some function. The seller's own text says which; this table is only used for the generic SaaS sector.
export const BUYER_FUNCTIONS = [
  { id: "finance", plg: { user: "a finance operations user or an engineer evaluating the integration", signer: "the CFO or VP Finance" }, re: /\b(billing|invoic\w*|revenue recognition|collections|reconcil\w*|accounts (?:payable|receivable)|finance|cfo|controller|payments?)\b/gi,
    name: "finance", committee: "The Chief Financial Officer or VP Finance signs; the head of billing, finance operations or revenue operations champions; finance operations use it daily; IT and security check the ERP, CRM and payment integrations; audit reviews how revenue is recognised.",
    roles: ["Chief Financial Officer", "VP Finance", "Head of Billing or Revenue Operations", "Finance Controller"],
    terms: ["billing", "subscription billing", "usage-based billing", "invoicing", "revenue recognition", "proration", "dunning", "collections", "payment gateway", "reconciliation", "month-end close", "ERP", "days sales outstanding"],
    metrics: ["days to close the books", "billing errors and credit notes", "days sales outstanding", "failed payment recovery", "time spent reconciling"] },
  { id: "revenue", plg: { user: "a sales operations user or a rep", signer: "the Chief Revenue Officer" }, re: /\b(pipeline|sales team|sales reps?|quota|revenue operations|revops|crm|forecast\w*|sales cycle|sellers)\b/gi,
    name: "revenue", committee: "The Chief Revenue Officer signs; the head of sales operations or revenue operations champions; sales managers and reps use it daily; IT and security check the CRM integration; finance checks the cost per seat or per user.",
    roles: ["Chief Revenue Officer", "Head of Sales Operations", "Head of Revenue Operations", "Sales Manager"],
    terms: ["pipeline", "forecast", "quota", "win rate", "CRM", "sales cycle", "ramp time"],
    metrics: ["pipeline coverage", "win rate", "sales cycle length", "forecast accuracy", "rep ramp time"] },
  { id: "customer", plg: { user: "a support or success operations user", signer: "the Head of Customer Success" }, re: /\b(customer success|support|churn|renewals?|onboarding|tickets?|customer experience|nps)\b/gi,
    name: "customer", committee: "The Chief Customer Officer or Head of Customer Success signs; a support or success operations lead champions; success managers and agents use it daily; IT and security check data access.",
    roles: ["Chief Customer Officer", "Head of Customer Success", "Head of Support", "Support Operations Lead"],
    terms: ["churn", "renewal", "health score", "onboarding", "first response time", "tickets", "net revenue retention"],
    metrics: ["net revenue retention", "logo churn", "time to first value", "first response time", "renewal rate"] },
  { id: "marketing", plg: { user: "a marketer or marketing operations user", signer: "the VP Marketing" }, re: /\b(marketing|campaigns?|leads?|demand gen\w*|content|seo|brand)\b/gi,
    name: "marketing", committee: "The Chief Marketing Officer or VP Marketing signs; the head of demand generation or marketing operations champions; marketers use it daily; sales operations and IT check the CRM and data flows.",
    roles: ["Chief Marketing Officer", "VP Marketing", "Head of Demand Generation", "Marketing Operations Lead"],
    terms: ["pipeline sourced", "cost per qualified lead", "campaign", "attribution", "lead scoring", "marketing automation"],
    metrics: ["pipeline sourced by marketing", "cost per qualified lead", "lead to meeting conversion", "campaign cycle time"] },
  { id: "people", plg: { user: "an HR operations user", signer: "the Head of HR" }, re: /\b(hiring|recruit\w*|employees?|payroll|hr|people team|talent|onboarding new hires)\b/gi,
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
  terms: ["securities", "fiduciary duty", "benchmark", "drawdown", "factor exposure", "explainability", "back-test", "capacity", "custody", "consultant rating", "rebalancing", "risk model"],
  partners: ["investment consultants and platforms that shortlist managers", "custodians and fund administrators", "data and research providers your buyers already use", "placement agents and distribution partners"],
  accounts: "mandate type, assets under oversight, the consultant that advises them and a review of managers that is coming up",
  reviews: "risk, compliance, operational due diligence and the investment committee",
  reads: ["process and risk control papers, including how securities are selected and sized", "explainability notes for the investment committee", "behaviour in different market conditions", "due diligence questionnaire answers"],
  venues: ["asset owner and consultant conferences", "institutional investor roundtables", "investment committee education sessions"],
  assets: ["a due diligence questionnaire pack", "a documented investment process and risk controls", "a reporting sample and custody details"],
  plg: { user: "a member of the buyer's research team", signer: "the chief investment officer or investment committee" },
  firstValue: "the buyer's research team sees the strategy's positions and drivers on their own mandate",
  expansionSignal: "a first allocation is topped up or a second mandate is discussed",
  fit: {
    E: "asset owners and banks select managers through consultants and long due diligence, so account-based selling with consultants and platforms is the usual way in",
    P: "a manager cannot be tried alone, so the product-led idea shows up as read-only research access or a model portfolio shown against the buyer's mandate",
    I: "allocators and consultants look for process and risk papers, so research content reaches them while manager lists are built",
    C: "allocators ask peers and consultants about managers, so references and investor roundtables carry weight",
  },
};
// The buying committee, measures, objections, proof shape, sales motion, roles and vocabulary of a seller that manages money come from the
// shared sector file (INVESTMENT_PROFILE); only the plan details above (partners, venues, reads, assets) live here.
Object.assign(INVESTMENT_BLOCK, {
  committee: INVESTMENT_PROFILE.committee, metrics: INVESTMENT_PROFILE.metrics, objections: INVESTMENT_PROFILE.objections,
  proofShape: INVESTMENT_PROFILE.proofShape, salesMotion: INVESTMENT_PROFILE.salesMotion, roles: INVESTMENT_PROFILE.buyerRoles, vocabulary: INVESTMENT_PROFILE.vocabulary,
});

// The plan details for this company: the block written for its kind when the shared reader returned one of that block's sub-types,
// otherwise the vertical's base block (wording true for every company of the vertical).
export function planDetails(vertical) {
  if (!vertical) return null;
  const kind = KIND_PLAN[vertical.id];
  if (kind && vertical.subtype && kind.kinds.includes(vertical.subtype)) return kind;
  return SECTOR_BASE[vertical.id] || null;
}
// The API platform notes: only for a software seller whose own words name APIs as what it sells, when the reader named no sub-type.
const API_WORDS = /\bAPI (?:platform|design|development|lifecycle|management|governance|tool\w*|testing|documentation)\b|\b(?:designing|documenting|testing|building) APIs\b/i;
export function apiPlatform(vertical, ...texts) {
  return vertical && vertical.id === "software" && !vertical.subtype && API_WORDS.test(texts.filter((t) => typeof t === "string").join(" \n ")) ? API_PLATFORM : null;
}

// ---------- small helpers ----------
// Lower-case the first letter of a phrase, but not an acronym such as "SLA" or "TMS".
const lowerFirst = (t) => (t && !/^[A-Z]{2,}/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
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
  // Run 21b: a sub-type named by the reader brings its own roles, committee and measures; the buyer function read from the words is for generic SaaS only.
  const fn = vertical && vertical.id === "saas" && !vertical.subtype ? buyerFunction(a.product_description, a.company_description, a.gtm_challenge, a.challenge, a.industry) : null;
  const inv = model === "investment";
  const details = planDetails(vertical);
  const sp = inv ? INVESTMENT_BLOCK : details;
  const api = !inv ? apiPlatform(vertical, a.product_description, a.company_description, a.gtm_challenge, a.challenge, a.industry) : null;
  const over = api ? api.over : {};
  const roles = inv ? INVESTMENT_BLOCK.roles : fn ? fn.roles : over.buyerRoles || (vertical ? vertical.buyerRoles : ["the person who signs", "the champion who feels the problem", "the daily user"]);
  const metrics = inv ? INVESTMENT_BLOCK.metrics : fn ? fn.metrics : over.metrics || (vertical ? vertical.metrics : ["the number your buyer already reports on", "the cost of the problem today"]);
  const objections = inv ? INVESTMENT_BLOCK.objections : over.objections || (vertical ? vertical.objections : []);
  const proofShape = inv ? INVESTMENT_BLOCK.proofShape : over.proofShape || (vertical ? vertical.proofShape : "a before and after of one measure your buyer already tracks, at one customer, signed off by that customer");
  const vocab = inv ? INVESTMENT_BLOCK.vocabulary : over.vocabulary || (vertical ? vertical.vocabulary : []);
  const mp = MODEL_PLAN[model] || MODEL_PLAN.unknown;
  // A sector's own first offer (a hub pilot, a proof of value) replaces the generic one for a business that can be tried alone.
  const sectorEntry = sp && sp.entry && !inv && (model === "saas" || model === "hardware_software" || !model) ? sp.entry : null;
  const entry = sectorEntry || mp.entry;
  const assisted = sectorEntry || mp.assisted;
  const plgGiven = fn ? fn.plg : sp && sp.plg ? sp.plg : {};
  const plg = {
    user: plgGiven.user || "the person who feels the problem day to day and tries the product",
    signer: plgGiven.signer || (vertical ? "the " + roles[0] : "the budget owner of the function"),
  };
  const acv = typeof a.acv_usd === "number" && isFinite(a.acv_usd) ? a.acv_usd : null;
  const cycle = typeof a.deal_cycle_days === "number" && isFinite(a.deal_cycle_days) ? a.deal_cycle_days : null;
  const tam = typeof a.tam_accounts === "number" && isFinite(a.tam_accounts) ? a.tam_accounts : null;
  const nrr = typeof a.nrr_percent === "number" && isFinite(a.nrr_percent) ? a.nrr_percent : null;
  const channels = clean(a.current_channels);
  return {
    vertical, model, sp, fn, api, over, communityTopics: api ? api.communityTopics : null, terms: (details && details.terms) || (api ? api.terms : []), typical: details ? details.typical : null, roles, metrics, objections, proofShape, vocab, mp, entry, assisted, plgUser: plg.user, plgSigner: plg.signer, acv, cycle, tam, nrr, channels,
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
// Run 21b: without a block written for this company's kind, the reading list is built from the measures of its own sector or sub-type.
const derived = (c, k) => (k === "reads" && c.vertical && c.metrics.length
  ? ["a write-up of one customer's before and after on " + joinList(c.metrics.slice(0, 2)), "how-to guides for the daily problem", "comparisons with the way buyers solve it today"] : null);
const sp = (c, k) => (c.sp && c.sp[k]) || derived(c, k) || neutral[k];

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
const acvNote = (c) => c.acv === null ? "One person should be able to research each account properly."
  : c.acv > 50000 ? "At " + num(c.acv) + " US dollars a year per account, each account is worth its own researched plan."
  : "At " + num(c.acv) + " US dollars a year per account, keep the research per account short enough to repeat across the whole list.";
function planE(c) {
  const list = c.tam ? "Rank your " + num(c.tam) + " addressable accounts by " + sp(c, "accounts") + ", and take the top 50" + EXAMPLE + ". " + acvNote(c)
    : "Build the account list: rank accounts by " + sp(c, "accounts") + ", and take the top 50" + EXAMPLE + ". " + acvNote(c);
  const d30 = [
    list,
    reviewStep(c),
    "List the partners you already have and who else sits in your buyers' stack and could introduce or connect with you: " + joinLong(sp(c, "partners")) + ". Pick the two or three that touch the most accounts on your list, existing partners first, and ask each what a joint account plan would need.",
  ];
  const d60 = [
    "Run a first ABM wave on the top 20 accounts" + EXAMPLE + ". Open with the numbers this buyer already watches (" + metricsText(c, 3) + ") and offer " + c.entry + ".",
    "Put each partner you will work with on one page, renewing the agreements you already have and adding new ones where the list shows a gap: what each brings (introductions, integration or resale), how an introduced account is tracked from first meeting to closed won, and who answers the buyer's technical questions.",
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
function iNeedsPartners(c) { return (c.acv !== null && c.acv > 50000) || (c.cycle !== null && c.cycle > 90); }
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
    "Start a short outbound sequence to the list. Each message opens with a problem in the buyer's words and ends with one ask: " + c.entry + ".",
    c.longCycle ? "Agree with sales which signals mean a call is worth booking (a reply, a second reader at the same account, a request for the reference). With " + c.cycleText + ", expect several people to engage before anyone asks for a meeting." : "Agree with sales which signals mean a call is worth booking (a reply, a second reader at the same account, a request for the reference) and how fast each is followed up.",
  ];
  const d90 = [
    "Keep the channels that book meetings with the right roles and stop the rest. With " + c.cycleText + ", judge them on meetings and qualified pipeline, not on closed deals yet.",
    "Track every opportunity from first touch to closed won, so you can see which channel starts the deals that close and how long each takes" + (c.acv ? " at your ACV of " + num(c.acv) + " US dollars a year." : "."),
    "Add the assets this buyer asks for before buying: " + joinLong(sp(c, "assets")) + ".",
  ];
  if (iNeedsPartners(c)) {
    d30.unshift("Start with the partners and references that already reach these buyers: " + joinLong(sp(c, "partners")) + ". Ask each for introductions to accounts on your list before any cold outreach.");
    d60.unshift("Turn the first introductions into meetings and ask every satisfied client or partner for one more introduction, so referrals bring the first conversations and the content and outbound below support them.");
  }
  return { d30, d60, d90 };
}

// P: Product-Led Growth, in its self-serve form (a product people can try alone) and its assisted form (everything else)
function planPSelf(c, prefix = "") {
  const p = (t) => prefix + t;
  return {
    d30: [
      p("Define the first moment of value: " + sp(c, "firstValue") + ". Measure how many new users reach it and how long it takes."),
      p("Remove the steps between sign-up and that moment, and record where people stop."),
      p("Decide who the product-led user is (" + c.plgUser + ") and who still has to say yes (" + c.plgSigner + "). The sales conversation starts when the second person appears in an account."),
    ],
    d60: [
      p("Launch the improved first-use path and offer " + c.entry + " to accounts that ask for more."),
      p("Build the hand-off from usage to a sales conversation: flag accounts where " + sp(c, "expansionSignal") + ", and have a person reach out within a day."),
      p("Test the plan and price page for the buyer who signs (" + c.plgSigner + "), not only for the user who tried the product."),
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
      p("Choose the one low-risk way a buyer can see value without a full project: " + c.assisted + ". Write the scope on one page, with what the buyer gets to keep."),
      p("Agree the measure that shows value in that step (" + metricsText(c, 2) + ") and who on the buyer's side signs it off."),
      p("Decide who starts it (" + c.plgUser + ") and who still has to say yes (" + c.plgSigner + "), and give the starter a short pack they can forward."),
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
// How the product-led motion fits a large or slow sale: "assist" keeps the product-led steps and adds a sales-assist layer (a software
// subscription in a sector where a self-serve start is usual); "pilot" replaces them with the pilot-led version (a sector or a model
// where a product is not tried alone); null when the numbers do not contradict the motion.
function plgMode(c, letter) {
  if (letter !== "P" || c.mp.selfServe === false) return null;
  const big = (c.acv !== null && c.acv > 50000) || (c.cycle !== null && c.cycle > 90);
  if (!big) return null;
  const usual = c.model !== "hardware_software" && (!c.vertical || (c.typical && c.typical.includes("P")));
  return usual ? "assist" : "pilot";
}
export function fitWarning(c, letter) {
  const acvTxt = c.acv !== null ? "an ACV of " + num(c.acv) + " US dollars a year" : null;
  const cycTxt = c.cycle !== null ? "a " + num(c.cycle) + "-day cycle" : null;
  const both = joinList([acvTxt, cycTxt]);
  const reviews = sp(c, "reviews");
  if (c.model === "investment" && (letter === "C" || letter === "P")) {
    return (both ? "With " + both + ", " : "") + "an institutional buyer chooses a manager through consultants and due diligence, and a " + (letter === "C" ? "peer community" : "product-led start") + " cannot produce the verified track record they ask for. The steps below are the nearest fitting version: consultant and platform research, investor roundtables, and trial allocations or model portfolios, with compliance reviewing every performance claim and client reference before use. Ecosystem and ABM usually leads here; run gtm_consultation to score it on your numbers.";
  }
  const mode = plgMode(c, letter);
  if (mode === "assist") {
    return "With " + both + ", product-led alone rarely closes a sale this size: the buyer's reviews (" + reviews + ") still come before a contract. The steps below keep the product-led start (the first moment of value, a trial or sandbox, usage signals) and add a sales-assist layer: accounts that reach the activation signal are handed to sales. Ecosystem and ABM may lead at this size; run gtm_consultation to score it on your numbers.";
  }
  if (mode === "pilot") {
    return "With " + both + ", a sale like yours rarely starts with a self-serve sign-up: buyers go through a pilot and reviews (" + reviews + "). The steps below are the nearest fitting version of the product-led motion: a pilot-led first step that a user can start without a long contract. Ecosystem and ABM usually leads at this size; run gtm_consultation to score it on your numbers.";
  }
  if (letter === "I" && iNeedsPartners(c)) {
    return "With " + both + ", inbound and outbound alone rarely start a sale this size: buyers shortlist through partners, advisers and references before they answer a cold message. The steps below begin with partner and referral-led steps, then build content and outbound on top of them. Ecosystem and ABM usually leads at this size; run gtm_consultation to score it on your numbers.";
  }
  if (letter === "E" && ((c.acv !== null && c.acv < 5000) || (c.cycle !== null && c.cycle < 14))) {
    return "With " + both + ", account-based selling usually costs more per deal than it returns: a small, fast sale is normally won with product-led or inbound motions. The steps below still follow the motion you asked for; run gtm_consultation to score it on your numbers.";
  }
  return null;
}
function planPInvestment(c) {
  return {
    d30: [
      "Choose the low-risk first look a buyer can take without a full allocation: " + c.assisted + ". Write the scope on one page, with what the buyer gets to keep.",
      "Prepare the due diligence pack before the first look: " + joinLong(INVESTMENT_BLOCK.assets) + ".",
      "Agree with compliance what may be shown. Every performance claim, back-tested result and client reference needs compliance review before use, and back-tested results are always labelled as back-tested.",
    ],
    d60: [
      "Offer the first look to the consultants and platforms that shortlist managers for your buyers, and to the accounts you already talk to. Run the first two and record what the research teams and committees asked for that you did not expect.",
      "Build the hand-off from the first look to a due diligence stage and a trial allocation: the findings, a proposal that follows from them and a date for the investment committee.",
      "Write the questions asked into your due diligence answers and your list of objections to answer.",
    ],
    d90: [
      "Measure how many first looks moved to due diligence and to a trial allocation, and how long that took" + (c.cycle ? " against " + c.cycleText : "") + ".",
      "Write the first result up in the shape this buyer trusts: " + lowerFirst(stripEnd(c.proofShape)) + ". Have compliance review any performance claim, back-tested result or client reference before it is used.",
      "Keep the version of the first look that moves managers onto shortlists and drop the rest.",
    ],
  };
}
function salesAssist(c) {
  return [
    "Add a sales-assist layer for the larger accounts: when an account reaches the first moment of value or " + sp(c, "expansionSignal") + ", hand it to sales with its usage history, so the first call is about the reviews (" + sp(c, "reviews") + ") and not about what the product does.",
    "Agree with sales which usage signal triggers the hand-off, how fast they reach out, and which accounts stay self-serve; review the hand-offs every month against " + c.cycleText + ".",
  ];
}
function planP(c) {
  const mode = plgMode(c, "P");
  if (mode === "pilot") return planPAssisted(c);
  if (c.mp.selfServe === true) {
    const p = planPSelf(c);
    if (mode === "assist") { const sa = salesAssist(c); p.d60 = [...p.d60, sa[0]]; p.d90 = [...p.d90, sa[1]]; }
    return p;
  }
  if (c.model === "investment") return planPInvestment(c);
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
function planCInvestment(c) {
  return {
    d30: [
      "Map the consultants and platforms that shortlist managers for your buyers, and the investor roundtables and conferences where asset owners and consultants meet: " + joinLong(INVESTMENT_BLOCK.venues) + ". Pick two to attend or host.",
      "Prepare the due diligence pack before any meeting: " + joinLong(INVESTMENT_BLOCK.assets) + ".",
      "Agree with compliance what may be said in public and to buyers. Every performance claim, back-tested result and client reference needs compliance review before use, and back-tested results are always labelled as back-tested.",
    ],
    d60: [
      "Meet the research teams of two consultants or platforms and walk them through the process and risk controls, so they can describe you accurately to their clients.",
      "Host or speak at one investor roundtable on a question buyers ask (" + joinLong(INVESTMENT_BLOCK.reads.slice(0, 2)) + "), without presenting performance numbers that compliance has not cleared.",
      "Offer the accounts that asked for more after the roundtable " + c.entry + ".",
    ],
    d90: [
      "Collect the questions the investment committees and consultants asked. They become your due diligence answers and your list of objections to answer.",
      "Ask a client for a reference only with their written consent and after compliance has reviewed the wording; do not offer a reference as proof of performance.",
      "Measure how many consultant meetings led to a due diligence stage and how far each got" + (c.cycle ? " against " + c.cycleText : "") + ", so next quarter's effort follows the route that moves managers onto shortlists.",
    ],
  };
}
function planC(c) {
  if (c.model === "investment") return planCInvestment(c);
  const big = c.tam !== null && c.tam > 10000;
  const topic = c.communityTopics || metricsText(c, 2);
  const d30 = [
    "Choose where your buyers already talk: " + joinLong(sp(c, "venues")) + ". Join two and listen before you launch your own.",
    big
      ? "Recruit a first group of active customers as community champions (start with a few dozen, Example figure: replace with your own), and ask each what they would want help with from other practitioners (" + c.plgUser + "). With " + num(c.tam) + " addressable accounts the community has to run at scale: an open, public forum with moderators and an ambassador programme, not hand-picked peer sessions."
      : "Invite five to ten customers who got a result" + EXAMPLE + " to be founding members, and ask each what they would want to discuss with peers in their role (" + c.champion + ").",
    "Agree what the community is for: peer answers on " + topic + ", not product announcements.",
  ];
  const d60 = [
    big
      ? "Open the forum to everyone and run recurring open sessions and office hours led by champions, not by you. Each champion shows " + (c.communityTopics ? "how they handle " + c.communityTopics : "how they measure " + c.metrics[0]) + " and what they changed."
      : "Run the first two sessions led by customers, not by you. Each member shows " + (c.communityTopics ? "how they handle " + c.communityTopics : "how they measure " + c.metrics[0]) + " and what they changed.",
    big ? "Answer new posts within a day, tag the questions that repeat, and turn the top ones into documentation and content. They are also your list of objections to answer." : "Record the questions members ask. They become your content and your list of objections to answer.",
    c.channels ? "Connect the community to what you already do (" + c.channels + "): invite the people you meet there to a session, and note which ones come back." : "Ask members who got a result to act as a reference for the prospects you are talking to now.",
  ];
  const d90 = [
    "Turn the sessions into proof in the shape this buyer trusts: " + lowerFirst(stripEnd(c.proofShape)) + ".",
    c.nrr ? "Your NRR is " + c.nrr + " percent. Track whether members renew and expand more than customers who do not join, and use the answer to decide how much to invest next quarter." : "Track whether members renew and expand more than customers who do not join, and use the answer to decide how much to invest next quarter.",
    big ? "Count how many community members come from accounts that are not yet customers, and how many of those reach a sales conversation afterwards." : "Open a session to selected prospects, hosted by a customer, and count how many of them reach a sales conversation afterwards.",
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
  return { days_30: fix(p.d30), days_60: fix(p.d60), first_quarter: fix(p.d90), context: c, warning: fitWarning(c, letter) };
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
  const over = c.over;
  const fnBlock = c.fn ? {
    who_decides: c.fn.committee,
    what_it_measures: [...c.fn.metrics, ...v.metrics.filter((m) => /retention|churn/.test(m))],
    read_as: "Your own words point at " + c.fn.name + " buyers (" + joinList(c.roles.slice(0, 3)) + "), so the buying committee and measures are those of a " + c.fn.name + " function, not the generic SaaS ones.",
  } : {};
  return Object.assign({
    sector: v.name,
    who_decides: over.committee || v.committee,
    what_it_measures: over.metrics || v.metrics,
    usual_objections: (over.objections || v.objections).map((o) => o.objection),
    proof_that_lands: over.proofShape || v.proofShape,
    sales_motion: v.salesMotion,
    buyer_words: c.fn ? c.fn.terms : [...new Set([...(over.vocabulary || v.vocabulary), ...c.terms])],
  }, fnBlock);
}

/** One paragraph that says how the lead motion sits with the way this sector (or this kind of business) usually buys. */
export function sectorFit({ vertical, model, letter, motionName, scores, selfServeGiven }) {
  const inv = model === "investment";
  const spx = inv ? INVESTMENT_BLOCK : planDetails(vertical);
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

