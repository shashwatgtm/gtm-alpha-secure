// Run 9 U2: "Fill in an example" on the free EPIC audit form (/consultation), and /consultation?example=1 fills it on load.
// It only fills the form with a made-up company; the visitor still presses the submit button. The example matches the one
// used across the site (Series A legal tech, 120 day sales cycle, $42,000 deals), with values taken from the form's own options.
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

    function fill() {
        Object.keys(EXAMPLE).forEach(function (name) {
            var field = form.elements[name];
            if (!field) return;
            field.value = EXAMPLE[name];
            field.dispatchEvent(new Event('change', { bubbles: true }));
        });
        var confirmBox = form.elements['confirm_consultation'];
        if (confirmBox) confirmBox.checked = true;
        if (note) {
            note.textContent = 'Example answers filled in for a made-up Series A legal tech company. Change any of them, then press "Get my free EPIC audit report" at the end of the form.';
        }
    }

    if (button) {
        button.addEventListener('click', function () {
            fill();
            var first = form.elements['client_name'];
            if (first) first.focus();
        });
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('example') === '1') fill();
})();
