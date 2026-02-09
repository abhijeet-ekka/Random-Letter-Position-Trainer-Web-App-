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
    // Animate feature boxes on scroll
    const featureBoxes = document.querySelectorAll('.feature-box');
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

// Add pixel trail effect (optional)
let canCreateTrail = true;

document.addEventListener('mousemove', (e) => {
    if (!canCreateTrail) return;

    canCreateTrail = false;

    const trail = document.createElement('div');
    trail.className = 'pixel-trail';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';

    document.body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 500);

    setTimeout(() => {
        canCreateTrail = true;
    }, 50);
});

// Add pixel trail styles
if (!document.getElementById('pixel-trail-styles')) {
    const style = document.createElement('style');
    style.id = 'pixel-trail-styles';
    style.textContent = `
        .pixel-trail {
            position: absolute;
            width: 6px;
            height: 6px;
            background: #ffd700;
            pointer-events: none;
            z-index: 9999;
            animation: pixelTrailFade 0.5s ease-out forwards;
            box-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
        }
        
        @keyframes pixelTrailFade {
            to {
                opacity: 0;
                transform: scale(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// CAROUSEL FUNCTIONALITY
// ========================================
let currentSlide = 0;
const totalSlides = 4;

function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');

    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('prev');
    dots[currentSlide].classList.remove('active');

    // Calculate new slide index
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;

    // Add active class to new slide
    setTimeout(() => {
        slides.forEach(slide => slide.classList.remove('prev'));
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }, 100);
}

function jumpToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('. dot');

    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    // Set new slide
    currentSlide = index;

    // Add active class to new slide
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Auto-rotate carousel every 5 seconds
setInterval(() => {
    moveCarousel(1);
}, 5000);

// ========================================
// ANIMATED COUNTERS FOR METRICS
// ========================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
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
