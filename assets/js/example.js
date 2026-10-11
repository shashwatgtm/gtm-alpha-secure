// Run 9 U2: "Fill in an example" on the free EPIC audit form (/consultation) fills the form with the example answers; the
// visitor then presses the submit button. Run 10 R10-A1-5 d: /consultation?example=1 does the same and no longer submits
// the form by itself: it fills the answers and shows the example note. The address loses ?example=1, so the
// browser's Back button returns to the form as the visitor left it. Run 10 R10-16: the note hides as soon as the visitor
// changes any answer. Run 25 (owner decision of 11 October 2026, P24-2): the example is CloudSEK, a real cybersecurity
// company, used only as an example to show the tool, in place of the invented example used before. The facts about it come
// from its own pages, read on 11 October 2026 (cloudsek.com home page and about-us page); every figure and band in the
// answers is hypothetical, and the name and role are placeholders, not a real person. Values are taken from the form's own
// options. scripts/build-sample-report.mjs reads EXAMPLE from this file to build the sample report, so the sample and the
// form use the same answers.
(function () {
    var form = document.getElementById('gtmForm');
    var button = document.getElementById('fill-example');
    var note = document.getElementById('example-note');
    if (!form) return;

    var EXAMPLE = {
        client_name: 'Example reader',
        client_designation: 'Marketing lead (example role)',
        company_name: 'CloudSEK (example company)',
        industry: 'Technology',
        company_description: 'Cybersecurity. From CloudSEK\'s own site, read on 11 October 2026: a predictive attack graph platform; its products include XVigil (digital risk protection), BeVigil (attack surface monitoring) and SVigil (third party risk monitoring); in May 2025 it raised $19 million across its Series A2 and B1 rounds. Hypothetical for this example only: deals above $50,000 a year and a sales cycle of more than 90 days.',
        gtm_challenge: 'Hypothetical scenario for this example only: we sell to enterprise security teams and need to know which go-to-market motion to lead with this year.',
        business_stage: 'Growth',           // the form's Series B option (its about page names a Series B1 round)
        team_size: '20',                    // hypothetical: 11 to 20 people
        monthly_budget: '25000',            // hypothetical: $10,000 to $25,000
        primary_focus: 'Hypothetical: winning enterprise security teams',
        acv_band: 'over_50k',               // hypothetical: over $50,000
        deal_cycle_band: 'over_90_days'     // hypothetical: over 90 days
    };
    var NOTE = 'These example answers use CloudSEK, a real company, only as an example to show the tool; every figure in them is hypothetical and the name and role are placeholders. Press Get my free EPIC audit report to see the report, or change the answers to your own.';
    var filling = false;
    var shown = false;

    function fill() {
        filling = true;
        Object.keys(EXAMPLE).forEach(function (name) {
            var field = form.elements[name];
            if (!field) return;
            field.value = EXAMPLE[name];
            field.dispatchEvent(new Event('change', { bubbles: true }));
        });
        var confirmBox = form.elements['confirm_consultation'];
        if (confirmBox) confirmBox.checked = true;
        filling = false;
        if (note) {
            note.textContent = NOTE;
            note.hidden = false;
            note.classList.add('hx10-note');
            shown = true;
        }
    }

    // The note is about the example answers: once the visitor changes one, it goes away.
    function edited(e) {
        if (filling || !shown || !e.isTrusted || !note) return;
        note.hidden = true;
        note.textContent = '';
        shown = false;
    }
    form.addEventListener('input', edited);
    form.addEventListener('change', edited);

    if (button) {
        button.addEventListener('click', function () {
            fill();
            var first = form.elements['client_name'];
            if (first) first.focus();
        });
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('example') === '1') {
        fill();
        if (window.history && history.replaceState) history.replaceState(null, '', window.location.pathname + window.location.hash);
        if (note && note.scrollIntoView) note.scrollIntoView({ block: 'center' });
    }
})();
