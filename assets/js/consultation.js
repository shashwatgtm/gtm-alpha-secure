// Premium Audit form. The form posts to /api/premium-audit by itself, so it works with JavaScript off and the answers
// never go into a web address. This script only shows that the report is being built and stops a double submit.
(function () {
    var form = document.getElementById('gtmForm');
    if (!form) return;
    var button = form.querySelector('.submit-btn');
    var label = button ? button.textContent : '';
    form.addEventListener('submit', function () {
        if (button) {
            button.disabled = true;
            button.textContent = 'Building your report...';
        }
    });
    // Coming back with the Back button shows the form again, ready to use.
    window.addEventListener('pageshow', function () {
        if (button) {
            button.disabled = false;
            button.textContent = label;
        }
    });
})();
