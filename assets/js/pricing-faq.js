// Questions and answers on the pricing page open one at a time.
// Moved out of the page on 25 September 2026 so the Content-Security-Policy can forbid inline scripts.
document.addEventListener('DOMContentLoaded', function() {
    // FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = answer.classList.contains('active');

            // Close all other FAQs
            document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('active'));
            document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));

            // Toggle current FAQ
            if (!isActive) {
                answer.classList.add('active');
                this.classList.add('active');
            }
        });
    });

});
