// Smooth scroll to features section
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
}

// Pixel letter rotation for preview
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const positions = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
    'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
};

// Change preview letter periodically
function updatePreviewLetter() {
    const previewLetter = document.getElementById('previewLetter');
    if (previewLetter) {
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        previewLetter.textContent = randomLetter;

        // Update options
        const correctPos = positions[randomLetter];
        const previewBtns = document.querySelectorAll('.preview-btn');

        // Generate random wrong positions
        const wrongPositions = [];
        while (wrongPositions.length < 3) {
            const randomPos = Math.floor(Math.random() * 26) + 1;
            if (randomPos !== correctPos && !wrongPositions.includes(randomPos)) {
                wrongPositions.push(randomPos);
            }
        }

        // Mix correct and wrong positions
        const allPositions = [correctPos, ...wrongPositions].sort(() => Math.random() - 0.5);

        previewBtns.forEach((btn, index) => {
            const pos = allPositions[index];
            const suffix = pos === 1 ? 'ST' : pos === 2 ? 'ND' : pos === 3 ? 'RD' : 'TH';
            btn.textContent = `${pos}${suffix}`;

            if (pos === correctPos) {
                btn.classList.add('preview-correct');
            } else {
                btn.classList.remove('preview-correct');
            }
        });
    }
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const headerNav = document.getElementById('headerNav');
    
    if (mobileMenuBtn && headerNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            headerNav.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                headerNav.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!headerNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                headerNav.classList.remove('active');
            }
        });
    }

    // Animate feature boxes on scroll
    const featureBoxes = document.querySelectorAll('.feature-box, .learning-card, .exam-box, .faq-box');
    featureBoxes.forEach((box, index) => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(30px)';
        box.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(box);
    });

    // Animate step boxes on scroll
    const stepBoxes = document.querySelectorAll('.step-box');
    stepBoxes.forEach((box, index) => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(30px)';
        box.style.transition = `all 0.6s ease ${index * 0.15}s`;
        observer.observe(box);
    });

    // Update preview letter every 3 seconds
    updatePreviewLetter();
    setInterval(updatePreviewLetter, 3000);

    // Add parallax effect to hero preview
    const gamePreview = document.querySelector('.game-screen-preview');

    window.addEventListener('scroll', () => {
        if (gamePreview) {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.2;
            gamePreview.style.transform = `translateY(${parallax}px)`;
        }
    });
});

// Animated counters for metrics
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Trigger counters when metrics section is visible
const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const metricNumbers = entry.target.querySelectorAll('.metric-number');
            metricNumbers.forEach(number => {
                const target = parseInt(number.dataset.count);
                animateCounter(number, target);
            });
            metricsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

// Observe metrics section when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const metricsSection = document.querySelector('.metrics-arcade');
    if (metricsSection) {
        metricsObserver.observe(metricsSection);
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});