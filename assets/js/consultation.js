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

// 13 Nov 2026 (owner decision): when the visitor gives a company website, the form asks the server whether someone from
// that company domain ran an audit in the last 90 days. Everyone sees only "Someone from your organisation ran this audit
// N days ago." The earlier GTM challenge is shown only after a work email check at that domain, and only while the check is
// switched on (the server says so in "check"). Text from the server is always set with textContent, never as markup.
(function () {
    var form = document.getElementById('gtmForm');
    var site = document.getElementById('company_website');
    var seen = document.getElementById('audit-seen');
    var box = document.getElementById('colleague-check');
    var tokenField = document.getElementById('colleague_token');
    if (!form || !site || !seen || !box || !window.fetch) return;
    var asked = '';

    function post(path, data) {
        return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(function (r) { return r.json(); });
    }
    function el(tag, text, attrs) {
        var e = document.createElement(tag);
        if (text) e.textContent = text;
        Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
        return e;
    }
    function reset() {
        seen.hidden = true;
        seen.textContent = '';
        box.hidden = true;
        box.textContent = '';
        if (tokenField) tokenField.value = '';
    }
    function ago(n) {
        return n === 0 ? 'earlier today' : n === 1 ? '1 day ago' : n + ' days ago';
    }
    function showChallenge(text, verified) {
        box.textContent = '';
        box.appendChild(el('p', 'Your colleague wrote this GTM challenge. Do you agree, or want to change it?'));
        box.appendChild(el('blockquote', text));
        var keep = el('button', 'Keep it for my audit', { type: 'button' });
        var edit = el('button', 'Change it', { type: 'button' });
        var challenge = form.elements['gtm_challenge'];
        keep.addEventListener('click', function () { if (challenge) challenge.value = text; });
        edit.addEventListener('click', function () { if (challenge) { challenge.value = text; challenge.focus(); } });
        box.appendChild(keep);
        box.appendChild(edit);
        if (tokenField) tokenField.value = verified || '';
    }
    function offerCheck(website) {
        box.textContent = '';
        var label = el('label', 'See what they wrote: confirm your work email at the same company domain (free mail addresses do not qualify).', { for: 'colleague_email' });
        var email = el('input', '', { type: 'email', id: 'colleague_email', autocomplete: 'email' });
        var send = el('button', 'Email me a code', { type: 'button' });
        var msg = el('p', '', { role: 'status' });
        box.appendChild(label);
        box.appendChild(email);
        box.appendChild(send);
        box.appendChild(msg);
        send.addEventListener('click', function () {
            msg.textContent = 'Sending...';
            post('/api/colleague-check', { step: 'send', website: website, email: email.value }).then(function (r) {
                if (!r.token) { msg.textContent = r.error || 'The check could not be started.'; return; }
                var codeLabel = el('label', 'Enter the six digit code we emailed you.', { for: 'colleague_code' });
                var code = el('input', '', { type: 'text', id: 'colleague_code', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' });
                var check = el('button', 'Check the code', { type: 'button' });
                msg.textContent = '';
                box.appendChild(codeLabel);
                box.appendChild(code);
                box.appendChild(check);
                check.addEventListener('click', function () {
                    post('/api/colleague-check', { step: 'code', token: r.token, code: code.value }).then(function (v) {
                        if (typeof v.challenge === 'string') showChallenge(v.challenge, v.verified);
                        else msg.textContent = v.error || 'That code is not right.';
                    }).catch(function () { msg.textContent = 'The check could not be completed. Please try again.'; });
                });
            }).catch(function () { msg.textContent = 'The check could not be started. Please try again.'; });
        });
        box.hidden = false;
    }
    function ask() {
        var website = site.value.trim();
        if (website === asked) return;
        asked = website;
        reset();
        if (!/^https?:\/\/\S+\.\S+/i.test(website)) return;
        post('/api/audit-seen', { website: website }).then(function (r) {
            if (asked !== website || !r || !r.seen) return;
            seen.textContent = 'Someone from your organisation ran this audit ' + ago(r.days_ago) + '. Compare notes with your colleagues before you start.';
            seen.hidden = false;
            if (r.check) offerCheck(website);
        }).catch(function () {});
    }
    site.addEventListener('change', ask);
    site.addEventListener('blur', ask);
})();
