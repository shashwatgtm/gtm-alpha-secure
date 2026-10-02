// Run 9 U2: "Fill in an example" on the free EPIC audit form (/consultation) fills the form with a made-up company; the
// visitor then presses the submit button. Run 10 R10-A1-5 d: /consultation?example=1 does the same and no longer submits
// the form by itself: it fills the answers and shows the made-up example note. The address loses ?example=1, so the
// browser's Back button returns to the form as the visitor left it. Run 10 R10-16: the note hides as soon as the visitor
// changes any answer. The example matches the one used across the site (run 19, D84: Branchwire, a made-up Series B telecom
// company with a 150 day sales cycle and $240,000 deals, from independent-audit/run19/cloud/examples-new.json), with values
// taken from the form's own options. scripts/build-sample-report.mjs reads EXAMPLE from this file to
// build the sample report, so the sample and the form use the same answers.
(function () {
    var form = document.getElementById('gtmForm');
    var button = document.getElementById('fill-example');
    var note = document.getElementById('example-note');
    if (!form) return;

    var EXAMPLE = {
        client_name: 'Priya Nair',
        client_designation: 'Head of Marketing',
        company_name: 'Branchwire (example company)',
        industry: 'Technology',
        company_description: 'Telecom: managed SD-WAN and business internet for companies with many branches, sold on one contract with uptime credits. Series B, with a 150 day sales cycle and deals of about $240,000 a year.',
        gtm_challenge: 'Deals close only after a costly outage at the buyer, and procurement compares us line by line with the national operators. We need to know which go-to-market motion to lead with this year.',
        business_stage: 'Growth',           // the form's Series B option
        team_size: '20',                    // 11 to 20 people
        monthly_budget: '25000',            // $10,000 to $25,000
        primary_focus: 'Winning banks and retail chains with 50 or more branches',
        acv_band: 'over_50k',               // $240,000 deals
        deal_cycle_band: 'over_90_days'     // 150 day sales cycle
    };
    var NOTE = 'This is a made-up example. Press Get my free EPIC audit report to see the report, or change the answers to your own.';
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
