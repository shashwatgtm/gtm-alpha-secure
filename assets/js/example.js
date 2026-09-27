// Run 9 U2: "Fill in an example" on the free EPIC audit form (/consultation) fills the form with a made-up company; the
// visitor then presses the submit button. Run 10 R10-A1-5 d: /consultation?example=1 does the same and no longer submits
// the form by itself: it fills the answers and shows the made-up example note. The address loses ?example=1, so the
// browser's Back button returns to the form as the visitor left it. Run 10 R10-16: the note hides as soon as the visitor
// changes any answer. The example matches the one used across the site (Series A legal tech, 120 day sales cycle, $42,000
// deals), with values taken from the form's own options. scripts/build-sample-report.mjs reads EXAMPLE from this file to
// build the sample report, so the sample and the form use the same answers.
(function () {
    var form = document.getElementById('gtmForm');
    var button = document.getElementById('fill-example');
    var note = document.getElementById('example-note');
    if (!form) return;

    var EXAMPLE = {
        client_name: 'Priya Nair',
        client_designation: 'Head of Marketing',
        company_name: 'Clausewise (example company)',
        industry: 'SaaS',
        company_description: 'Legal tech: contract review software for in-house legal teams at mid-sized companies. Series A, with a 120 day sales cycle and deals of about $42,000 a year.',
        gtm_challenge: 'Most deals close after long evaluations with legal and procurement teams. We need to know which go-to-market motion to lead with this year.',
        business_stage: 'Early Traction',   // the form's Series A option
        team_size: '20',                    // 11 to 20 people
        monthly_budget: '10000',            // $5,000 to $10,000
        primary_focus: 'Winning mid-sized customers',
        acv_band: '5k_to_50k',              // $42,000 deals
        deal_cycle_band: 'over_90_days'     // 120 day sales cycle
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
