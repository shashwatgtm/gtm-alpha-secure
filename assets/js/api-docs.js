// API docs: Copy buttons and the sidebar link of the section in view.
// Moved out of the page on 25 September 2026 so the Content-Security-Policy can forbid inline scripts.
function copyCode(btn) {
    const codeBlock = btn.closest('.code-block').querySelector('code');
    navigator.clipboard.writeText(codeBlock.textContent);
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
}

// Highlight active sidebar link on scroll
document.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.docs-section');
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { copyCode(btn); });
});
