document.addEventListener('DOMContentLoaded', () => {
    // 1. Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorGlow = document.querySelector('.cursor-glow');

    // Only apply custom cursor on fine pointer devices (desktops)
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            
            // Smoother glow following using animate API if available or fallback
            cursorGlow.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 400, fill: "forwards" });
        });

        // Hover effects for clickable elements
        const clickables = document.querySelectorAll('button, a, .glass-card');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
                cursorDot.style.boxShadow = '0 0 15px white';
                cursorGlow.style.opacity = '1';
                cursorGlow.style.width = '60px';
                cursorGlow.style.height = '60px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(255, 183, 178, 0.6) 0%, transparent 70%)';
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorDot.style.boxShadow = '0 0 10px white';
                cursorGlow.style.opacity = '0.8';
                cursorGlow.style.width = '40px';
                cursorGlow.style.height = '40px';
                cursorGlow.style.background = 'radial-gradient(circle, rgba(255, 183, 178, 0.4) 0%, transparent 70%)';
            });
        });
    } else {
        // Hide cursor elements on touch devices to ensure they don't block taps
        if(cursorDot) cursorDot.style.display = 'none';
        if(cursorGlow) cursorGlow.style.display = 'none';
    }

    // 2. Particle Background
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.6 + 0.1;
                // Add star-like twinkling
                this.twinkleSpeed = Math.random() * 0.02 + 0.005;
                this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Screen wrap
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                // Twinkle
                this.opacity += this.twinkleSpeed * this.twinkleDir;
                if (this.opacity <= 0.1) {
                    this.opacity = 0.1;
                    this.twinkleDir = 1;
                } else if (this.opacity >= 0.8) {
                    this.opacity = 0.8;
                    this.twinkleDir = -1;
                }
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Count based on screen size so it's not overwhelming on mobile
            const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 10000);
            const clampedCount = Math.min(Math.max(particleCount, 50), 200);
            
            for (let i = 0; i < clampedCount; i++) {
                particles.push(new Particle());
            }
        }
        initParticles();

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // 3. Floating Cherry Blossoms
    const blossomContainer = document.getElementById('cherry-blossoms');
    if (blossomContainer) {
        // Less petals on mobile
        const isMobile = window.innerWidth <= 768;
        const maxPetals = isMobile ? 15 : 35;

        function createPetal() {
            if (blossomContainer.childElementCount > maxPetals) return;
            
            const petal = document.createElement('div');
            petal.classList.add('petal');
            
            // Random sizes mapping
            const size = Math.random() * 12 + 6;
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;
            
            // Start horizontally anywhere
            petal.style.left = `${Math.random() * 100}vw`;
            
            const duration = Math.random() * 6 + 7; // 7-13s
            petal.style.animationDuration = `${duration}s`;
            
            blossomContainer.appendChild(petal);
            
            // Cleanup
            setTimeout(() => {
                if(petal.parentNode) petal.remove();
            }, duration * 1000);
        }
        
        setInterval(createPetal, 500);
        
        // Initial burst
        for(let i=0; i<10; i++) {
            setTimeout(createPetal, i * 200);
        }
    }

    // 4. Scroll Reveal via Intersection Observer
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observerOptions = {
        threshold: 0.25,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Initiate typing effect ONLY when section is visible
                const typingContent = entry.target.querySelector('#typing-trigger');
                if (typingContent) {
                    startTypingEffect(typingContent);
                }
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // 5. Typing Effect logic
    let typingStarted = false;
    function startTypingEffect(container) {
        if (typingStarted) return;
        typingStarted = true;
        
        const pTags = container.querySelectorAll('p');
        
        // Store texts and clear them out
        const texts = Array.from(pTags).map(p => {
            const text = p.textContent;
            p.textContent = '';
            // Ensure container height doesn't collapse
            p.style.minHeight = '1.9em'; 
            return text;
        });

        let currentParagraph = 0;
        let currentChar = 0;

        function typeChar() {
            if (currentParagraph >= pTags.length) return;

            const p = pTags[currentParagraph];
            if (currentChar === 0) {
                p.innerHTML = '<span class="typing-text"></span><span class="typing-cursor"></span>';
            }

            const textSpan = p.querySelector('.typing-text');
            const targetText = texts[currentParagraph];

            if (currentChar < targetText.length) {
                textSpan.textContent += targetText.charAt(currentChar);
                currentChar++;
                setTimeout(typeChar, 40); // 40ms per char
            } else {
                // Done line
                const cursor = p.querySelector('.typing-cursor');
                if(cursor) cursor.remove();
                currentParagraph++;
                currentChar = 0;
                setTimeout(typeChar, 600); // Wait 600ms before next line
            }
        }
        
        // Slight delay before starting
        setTimeout(typeChar, 500);
    }

    // 6. Confetti and Interactions (Buttons)
    const btnYes = document.getElementById('btn-yes');
    const btnAlready = document.getElementById('btn-already');
    const responseContainer = document.getElementById('response-container');
    const responseText = document.getElementById('response-text');
    const responseSubtext = document.getElementById('response-subtext');
    const buttonGroup = document.querySelector('.button-group');

    function triggerFireworks() {
        if (typeof confetti === 'undefined') return;
        
        const duration = 6 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    function triggerHeartConfetti() {
        if (typeof confetti === 'undefined') return;
        
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ffb7b2', '#e284ff', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ffb7b2', '#e284ff', '#ffffff']
            });

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        }());
    }

    if(btnYes) {
        btnYes.addEventListener('click', () => {
            buttonGroup.classList.add('hidden');
            responseContainer.classList.remove('hidden');
            responseText.textContent = "Best Friendship Confirmed! 🎉";
            responseSubtext.textContent = "This website will now always celebrate our friendship.";
            triggerFireworks();
        });
    }

    if(btnAlready) {
        btnAlready.addEventListener('click', () => {
            buttonGroup.classList.add('hidden');
            responseContainer.classList.remove('hidden');
            responseText.textContent = "True! We already are! 💖";
            responseSubtext.textContent = "Then this website was created to celebrate it.";
            triggerHeartConfetti();
        });
    }
});
