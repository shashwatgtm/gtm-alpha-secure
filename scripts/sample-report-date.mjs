// Run 19 (owner decision D76): the date printed on the sample report (/sample-report/). It is a literal, set to the IST date of
// the commit that last changed the sample's content (the example answers, the report code or this version), and never read from
// the clock or from git at build time, so the tracked sample-report/index.html and the live page always agree and stop moving.
// When a commit changes what the sample report says, set this to the IST date of that commit in the same commit.
export const SAMPLE_REPORT_DATE = "2 October 2026";
