// Questions and answers on the FAQ page open one at a time.
// Moved out of the page on 25 September 2026 so the Content-Security-Policy can forbid inline scripts.
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const wasOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        // Open clicked if it was closed
        if (!wasOpen) item.classList.add('open');
    });
});
