// Blog Category Filtering
document.addEventListener('DOMContentLoaded', () => {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const blogCards = document.querySelectorAll('.blog-card');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const category = tab.dataset.category;

            // Filter blog cards
            blogCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// Newsletter Subscription Handler
function handleSubscribe(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Show success message
    const button = event.target.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'SUBSCRIBED!';
    button.style.background = '#48bb78';
    
    // Reset after 3 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        event.target.reset();
    }, 3000);
    
    // In a real implementation, you would send this to your backend
    console.log('Subscribed email:', email);
}

// Add fade in animation for blog cards
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for blog card animations
const blogObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const blogObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, blogObserverOptions);

// Observe blog cards
document.addEventListener('DOMContentLoaded', () => {
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        blogObserver.observe(card);
    });
});