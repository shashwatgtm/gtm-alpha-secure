// Run 10 R10-A1-5 c: the static sample report at /sample-report/ (sample-report/index.html).
// It is built by the REAL report code: the "Fill in an example" answers from assets/js/example.js are posted, in this
// process, to the same handler the form uses (netlify/lib/premium-audit.js, which calls netlify/lib/analyze.js). Every score,
// focus line, rule, recommendation and plan step on the page comes from that answer; nothing is typed in by hand.
// The page keeps the report as built and changes only its frame: the sample header and breadcrumb, the note that the
// company is made up, a top action bar, no scripts (the static pages allow only this site's own scripts, and the sample
// has no PDF button), and a fixed line in place of the consultation ID and time, so a rebuild with the same code gives the
// same file. scripts/build-site.mjs runs it on every build, so the published sample always matches the published code.
// Usage: node scripts/build-sample-report.mjs  (writes sample-report/index.html)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// The example answers, read from the script that fills the form (one source for the form and the sample).
export function exampleAnswers() {
  const js = readFileSync(join(ROOT, "assets/js/example.js"), "utf8");
  const m = js.match(/var EXAMPLE = (\{[\s\S]*?\n {4}\});/);
  if (!m) throw new Error("build-sample-report: EXAMPLE not found in assets/js/example.js");
  const obj = new Function("return " + m[1].replace(/\/\/[^\n]*/g, ""))();
  return { ...obj, confirm_consultation: "on", leave_this_empty: "" };
}

export async function buildSampleReport() {
  const audit = await import(pathToFileURL(join(ROOT, "netlify/lib/premium-audit.js")).href);
  const chrome = await import(pathToFileURL(join(ROOT, "netlify/lib/report-chrome.js")).href);
  const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
  const answers = exampleAnswers();
  const res = await audit.default(new Request("https://gtmalpha.gtmhelix.com/api/premium-audit", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(answers).toString()
  }));
  if (res.status !== 200) throw new Error("build-sample-report: the report handler answered " + res.status);
  const page = await res.text();
  const one = (s, pattern, what) => {
    const n = (s.match(pattern) || []).length;
    if (n !== 1) throw new Error(`build-sample-report: ${what} found ${n} times`);
  };
  // The report itself, exactly as the handler built it: from its container to the end of the container.
  // Run 11 R11-A2-5: the container carries the PDF file name (data-pdf-name); the sample has no PDF button, so it is dropped.
  const start = page.search(/<div class="report-container" id="report-content"(?: data-pdf-name="[^"]*")?>/);
  const end = page.indexOf("<script>", start);
  if (start < 0 || end < 0) throw new Error("build-sample-report: report container not found");
  let report = page.slice(start, end).trimEnd().replace(/^(<div class="report-container" id="report-content") data-pdf-name="[^"]*">/, "$1>");
  one(report, /<h1>Your free EPIC audit report<\/h1>/g, "the report H1");
  report = report.replace("<h1>Your free EPIC audit report</h1>", "<h1>Sample EPIC audit report</h1>");
  one(report, /<p class="consultation-id">Consultation ID: GTM-\d+<\/p>\s*<p class="consultation-id">Generated: [0-9: -]+ UTC<\/p>/g, "the consultation ID and time");
  report = report.replace(/<p class="consultation-id">Consultation ID: GTM-\d+<\/p>\s*<p class="consultation-id">Generated: [0-9: -]+ UTC<\/p>/,
    `<p class="consultation-id">Built by the GTM Alpha ${version} report code from the example answers on the free audit form.</p>`);
  // Run 11 R11-A1-8: the B2 hero. The report's own header block moves, word for word, into the hero: its H1 in crop marks
  // under a pixel tag (D6 inner H1 size from helix.css), its name, role and company lines in a window on the right. The
  // rest of the report stays in its container, unchanged, laid out on the B2 grid by site.css (.ga-sample).
  const HEAD_RE = /\s*<div class="header">\s*<h1>Sample EPIC audit report<\/h1>\s*([\s\S]*?)\s*<\/div>/;
  one(report, new RegExp(HEAD_RE.source, "g"), "the report header block");
  const headLines = report.match(HEAD_RE)[1].replace(/\n\s*/g, "\n                ");
  report = report.replace(HEAD_RE, "");
  const CM = '<span class="cm tl" aria-hidden="true"></span><span class="cm tr" aria-hidden="true"></span><span class="cm bl" aria-hidden="true"></span><span class="cm br" aria-hidden="true"></span>';
  const style = page.match(/<style>[\s\S]*?<\/style>/);
  if (!style) throw new Error("build-sample-report: report style not found");
  const company = answers.company_name.replace(/ \(example company\)$/, "");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const out = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(chrome.SAMPLE_TITLE)}</title>
    <meta name="description" content="${esc(chrome.SAMPLE_DESC)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="author" content="Shashwat Ghosh, Helix GTM Consulting">
    <link rel="canonical" href="${chrome.SAMPLE_URL}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="GTM Alpha">
    <meta property="og:title" content="${esc(chrome.SAMPLE_TITLE)}">
    <meta property="og:description" content="${esc(chrome.SAMPLE_DESC)}">
    <meta property="og:url" content="${chrome.SAMPLE_URL}">
    <meta property="og:image" content="https://gtmalpha.gtmhelix.com/assets/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">
${chrome.LD_SAMPLE}
</script>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="preload" href="/assets/fonts/Archivo-latin-1.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/assets/fonts/VT323-latin-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/assets/fonts.css?v=${chrome.V_FONTS}">
    ${style[0]}
    <link rel="stylesheet" href="/assets/helix.css?v=${chrome.V_HELIX}">
    <link rel="stylesheet" href="/assets/site.css?v=${chrome.V_SITE}">
</head>
<body class="ga-sample">
    ${chrome.SKIP}
    ${chrome.SAMPLE_HEADER}
    <main id="main">
    <section class="hx-hero ga-sample-hero">
        <div class="hx-wrap"><div class="hx-hero-inner">
            <p class="hx-eyebrow">Sample report</p>
            <div class="crop">${CM}<h1>Sample EPIC audit report</h1></div>
            <div class="ga-sample-grid">
                <div>
    <p class="hx10-note"><strong>Sample report for a made-up company (${esc(company)}).</strong> This is a made-up example: every score and line below is what GTM Alpha's report code returns for the example answers on the free audit form.</p>
    <nav class="hx10-actions" aria-label="Sample report actions"><a class="hx10-primary" href="/consultation">Get your own free audit</a><a href="https://tools.gtmhelix.com/tools/">Back to all tools</a><a href="https://gtmhelix.com/lets-get-started/">Work with Shashwat</a></nav>
                </div>
                <div class="win ga-sample-who"><div class="win-bar"><span class="t">gtm-alpha / sample report</span><span class="wb" aria-hidden="true"><i></i><i></i></span></div><div class="win-body">
                ${headLines}
                </div></div>
            </div>
        </div></div>
    </section>
    <div class="hx-wrap hx10-report">
    ${report}
    ${chrome.NEXT}
    </div>
    </main>
    ${chrome.FOOTER}
</body>
</html>
`;
  for (const bad of ["—", "–", "Consultation Report", "<script src", "<script>"]) {
    if (out.includes(bad)) throw new Error("build-sample-report: page contains " + JSON.stringify(bad));
  }
  mkdirSync(join(ROOT, "sample-report"), { recursive: true });
  writeFileSync(join(ROOT, "sample-report/index.html"), out);
  return out;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const out = await buildSampleReport();
  console.log(`build-sample-report: sample-report/index.html, ${out.length} characters`);
}
