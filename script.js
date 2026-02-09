const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let currentLetter = null;
let currentPosition = null;
let answered = false;
let correctCount = 0;
let incorrectCount = 0;
let lives = 5;
let level = 1;
let questionsInLevel = 0;
let timeLeft = 10;
let baseTimeLimit = 10;
let timerInterval = null;
let startTime = null;
let totalTime = 0;
let totalAnswers = 0;
let isPaused = false;
let isGameOver = false;
let gameStarted = false;
let highestScore = 0;
let hasShownHighScoreNotification = false;

// Load highest score from localStorage
function loadHighestScore() {
    const saved = localStorage.getItem('letterTrainerHighScore');
    highestScore = saved ? parseInt(saved) : 0;
}

// Save highest score to localStorage
function saveHighestScore(score) {
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('letterTrainerHighScore', highestScore);
        // Update display if element exists
        const display = document.getElementById('highestScoreDisplay');
        if (display) display.textContent = highestScore;
        return true; // New high score!
    }
    return false;
}

loadHighestScore();

const nextBtn = document.getElementById('nextBtn');
const letterDisplay = document.getElementById('letterDisplay');
const positionDisplay = document.getElementById('positionDisplay');
const answerDisplay = document.getElementById('answerDisplay');
const correctCountEl = document.getElementById('correctCount');
const incorrectCountEl = document.getElementById('incorrectCount');
const avgTimeEl = document.getElementById('avgTime');
const timerDisplay = document.getElementById('timerDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const heartsContainer = document.getElementById('heartsContainer');
const pauseBtn = document.getElementById('pauseBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuContent = document.getElementById('menuContent');
const gameContainer = document.getElementById('gameContainer');
const particlesContainer = document.getElementById('particles');
const optionsContainer = document.getElementById('optionsContainer');
const highestScoreDisplay = document.getElementById('highestScoreDisplay');

// Initialize highest score display
if (highestScoreDisplay) highestScoreDisplay.textContent = highestScore;

// Function to show high score beat notification
function showHighScoreBeatNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'high-score-notification';
    notification.innerHTML = `
        <div class="high-score-notification-content">
            <div class="high-score-notification-icon">🏆</div>
            <div class="high-score-notification-text">NEW HIGH SCORE!</div>
            <div class="high-score-notification-subtext">You beat your record!</div>
        </div>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Function to get opposite letter (A↔Z, B↔Y, etc.)
function getOppositeLetter(letter) {
    const index = alphabet.indexOf(letter);
    const oppositeIndex = 25 - index;
    return alphabet[oppositeIndex];
}

// Function to show learn page
function showLearnPage() {
    const alphabetItems = alphabet.split('').map((letter, index) => {
        const position = index + 1;
        const opposite = getOppositeLetter(letter);
        return `
                    <div class="alphabet-item">
                        <span class="alphabet-letter">${letter}</span>
                        <div class="alphabet-position">${position}${getOrdinalSuffix(position)}</div>
                        <div class="alphabet-opposite">↔ ${opposite}</div>
                    </div>
                `;
    }).join('');

    menuContent.innerHTML = `
                <div class="learn-page">
                    <h3 style="font-size: 20px; color: #ffd700; text-align: center; margin-bottom: 20px;">LEARN LETTER POSITIONS</h3>
                    
                    <div class="learn-section">
                        <h3>📋 Complete Alphabet</h3>
                        <div class="alphabet-grid">
                            ${alphabetItems}
                        </div>
                    </div>
                    
                    <div class="learn-section">
                        <h3>🎯 Memory Tricks</h3>
                        
                        <div class="trick-box">
                            <div class="trick-title">1. Opposite Letter Trick</div>
                            <div class="trick-content">
                                A↔Z, B↔Y, C↔X, D↔W, etc.<br>
                                If you know A is 1st, then Z is 26th.<br>
                                If B is 2nd, then Y is 25th.<br>
                                The positions always add up to 27!
                            </div>
                        </div>
                        
                        <div class="trick-box">
                            <div class="trick-title">2. Split in Half</div>
                            <div class="trick-content">
                                First half: A-M (1-13)<br>
                                Second half: N-Z (14-26)<br>
                                M is 13th (middle), N is 14th
                            </div>
                        </div>
                        
                        <div class="trick-box">
                            <div class="trick-title">3. Quarter Points</div>
                            <div class="trick-content">
                                A=1, G=7 (≈1/4), M=13 (1/2), S=19 (≈3/4), Z=26<br>
                                Use these as anchor points!
                            </div>
                        </div>
                        
                        <div class="trick-box">
                            <div class="trick-title">4. Common Patterns</div>
                            <div class="trick-content">
                                EJOTY: 5, 10, 15, 20, 25 (multiples of 5)<br>
                                Remember these and count from them!
                            </div>
                        </div>
                    </div>
                    
                    <div class="menu-buttons" style="margin-top: 20px;">
                        <button class="menu-btn" onclick="showStartScreen()">⬅ BACK</button>
                        <button class="menu-btn secondary" onclick="startGame()">🎮 PLAY NOW</button>
                    </div>
                </div>
            `;
}

function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
}

// Function to show start screen
function showStartScreen() {
    menuContent.innerHTML = `
                <div class="start-screen">
                    <div class="start-title">LETTER TRAINER</div>
                    <div class="start-subtitle">PIXEL EDITION v2.0</div>
                    <div class="mode-buttons">
                        <button class="mode-btn" onclick="showLearnPage()">📚 LEARN TRICKS</button>
                        <button class="mode-btn secondary" onclick="startGame()">🎮 PLAY GAME</button>
                    </div>
                </div>
            `;
    menuOverlay.classList.add('active');
}

// Function to start the game
function startGame() {
    gameStarted = true;
    gameContainer.classList.remove('hidden');
    menuOverlay.classList.remove('active');

    if (isGameOver) {
        restartGame();
    } else {
        generateNewQuestion();
    }
}

// Create background stars
function createStars() {
    const gameScreen = document.querySelector('.game-screen');
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        gameScreen.appendChild(star);
    }
}

createStars();

function createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.animationDelay = (i * 0.05) + 's';

        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50 + Math.random() * 30;
        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

        particlesContainer.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function updateHearts() {
    const hearts = heartsContainer.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index >= lives) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });
}

function updateLevel() {
    questionsInLevel++;

    // Every 5 questions, level up
    if (questionsInLevel >= 5) {
        level++;
        questionsInLevel = 0;
        levelDisplay.textContent = level;

        // Reduce time based on level (minimum 3 seconds)
        baseTimeLimit = Math.max(3, 10 - (level - 1) * 0.5);

        // Show level up message
        positionDisplay.textContent = `🎉 LEVEL ${level} UNLOCKED! 🎉`;
        positionDisplay.style.color = '#ffd700';

        setTimeout(() => {
            if (!isGameOver && !isPaused) {
                positionDisplay.textContent = 'What position is this letter?';
                positionDisplay.style.color = '#63b3ed';
            }
        }, 2000);
    }
}

function loseLife() {
    lives--;
    updateHearts();

    if (lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    isGameOver = true;
    stopTimer();

    const accuracy = totalAnswers > 0 ? ((correctCount / totalAnswers) * 100).toFixed(1) : 0;
    const isNewHighScore = saveHighestScore(correctCount);

    menuContent.innerHTML = `
                <div class="game-over-screen">
                    <div class="game-over-title">GAME OVER</div>
                    ${isNewHighScore ? '<div class="high-score-banner">🏆 NEW HIGH SCORE! 🏆</div>' : ''}
                    <div class="menu-stats">
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">LEVEL REACHED</span>
                            <span class="menu-stat-value">${level}</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">CORRECT ANSWERS</span>
                            <span class="menu-stat-value">${correctCount}</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">HIGHEST SCORE</span>
                            <span class="menu-stat-value" style="color: #ffd700;">⭐ ${highestScore}</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">ACCURACY</span>
                            <span class="menu-stat-value">${accuracy}%</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">AVG TIME</span>
                            <span class="menu-stat-value">${avgTimeEl.textContent}</span>
                        </div>
                    </div>
                    <div class="menu-buttons">
                        <button class="menu-btn restart" onclick="restartGame()">PLAY AGAIN</button>
                    </div>
                </div>
            `;

    menuOverlay.classList.add('active');
}

function togglePause() {
    if (isGameOver) return;

    isPaused = !isPaused;

    if (isPaused) {
        stopTimer();
        const accuracy = totalAnswers > 0 ? ((correctCount / totalAnswers) * 100).toFixed(1) : 0;

        menuContent.innerHTML = `
                    <div class="menu-title">PAUSED</div>
                    <div class="menu-stats">
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">LEVEL</span>
                            <span class="menu-stat-value">${level}</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">LIVES</span>
                            <span class="menu-stat-value">${lives} ❤️</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">CORRECT</span>
                            <span class="menu-stat-value">${correctCount}</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">INCORRECT</span>
                            <span class="menu-stat-value">${incorrectCount}</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">ACCURACY</span>
                            <span class="menu-stat-value">${accuracy}%</span>
                        </div>
                        <div class="menu-stat-row">
                            <span class="menu-stat-label">AVG TIME</span>
                            <span class="menu-stat-value">${avgTimeEl.textContent}</span>
                        </div>
                    </div>
                    <div class="menu-buttons">
                        <button class="menu-btn" onclick="togglePause()">RESUME</button>
                        <button class="menu-btn restart" onclick="restartGame()">RESTART</button>
                    </div>
                `;

        menuOverlay.classList.add('active');
    } else {
        menuOverlay.classList.remove('active');
        if (!answered) {
            startTimer();
        }
    }
}

function restartGame() {
    // Reset all game state
    lives = 5;
    level = 1;
    questionsInLevel = 0;
    correctCount = 0;
    incorrectCount = 0;
    totalTime = 0;
    totalAnswers = 0;
    baseTimeLimit = 10;
    isGameOver = false;
    isPaused = false;
    hasShownHighScoreNotification = false;  // Reset notification flag

    // Update displays
    levelDisplay.textContent = level;
    correctCountEl.textContent = correctCount;
    incorrectCountEl.textContent = incorrectCount;
    avgTimeEl.textContent = '--';
    updateHearts();

    // Close menu and start new game
    menuOverlay.classList.remove('active');
    generateNewQuestion();
}

function startTimer() {
    timeLeft = Math.ceil(baseTimeLimit);
    startTime = Date.now();
    timerDisplay.textContent = timeLeft;
    timerDisplay.classList.remove('warning');

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 3) {
            timerDisplay.classList.add('warning');
        } else {
            timerDisplay.classList.remove('warning');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleTimeout() {
    if (answered || isPaused || isGameOver) return;

    answered = true;

    // Disable all buttons
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.position) === currentPosition) {
            btn.classList.add('correct');
        }
    });

    answerDisplay.textContent = `⏱ TIME UP! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
    answerDisplay.style.color = '#f6ad55';

    loseLife();
    incorrectCount++;
    incorrectCountEl.textContent = incorrectCount;

    // Auto advance after 1.5 seconds
    setTimeout(() => {
        if (!isGameOver) {
            generateNewQuestion();
        }
    }, 1500);
}

function updateAverageTime() {
    if (totalAnswers > 0) {
        const avgSeconds = (totalTime / totalAnswers / 1000).toFixed(1);
        avgTimeEl.textContent = avgSeconds + 's';
    }
}

function generateOptions(correctPos) {
    const allPositions = Array.from({ length: 26 }, (_, i) => i + 1);
    const incorrectPositions = allPositions.filter(pos => pos !== correctPos);
    const shuffled = incorrectPositions.sort(() => Math.random() - 0.5);
    const options = [correctPos, ...shuffled.slice(0, 3)];
    return options.sort(() => Math.random() - 0.5);
}

function generateNewQuestion() {
    if (isGameOver) return;

    // Reset state
    answered = false;
    answerDisplay.textContent = '';

    // Generate random position
    currentPosition = Math.floor(Math.random() * 26) + 1;
    currentLetter = alphabet[currentPosition - 1];

    // Update letter display with animation
    letterDisplay.textContent = currentLetter;
    letterDisplay.style.animation = 'none';
    setTimeout(() => {
        letterDisplay.style.animation = 'letterPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 10);

    positionDisplay.textContent = 'What position is this letter?';
    positionDisplay.style.color = '#63b3ed';

    // Generate and display options
    const options = generateOptions(currentPosition);
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');

    options.forEach((position, index) => {
        const btn = optionButtons[index];
        btn.textContent = getOrdinal(position);
        btn.dataset.position = position;
        btn.className = 'option-btn';
        btn.disabled = false;
    });

    // Start timer
    if (!isPaused) {
        startTimer();
    }

    // Create particles
    const rect = letterDisplay.getBoundingClientRect();
    const containerRect = particlesContainer.getBoundingClientRect();
    createParticles(
        rect.left + rect.width / 2 - containerRect.left,
        rect.top + rect.height / 2 - containerRect.top
    );
}

function handleOptionClick(e) {
    if (answered || isPaused || isGameOver) return;

    const selectedBtn = e.target;
    const selectedPosition = parseInt(selectedBtn.dataset.position);

    answered = true;
    stopTimer();

    // Calculate time taken
    const timeTaken = Date.now() - startTime;
    totalTime += timeTaken;
    totalAnswers++;

    // Disable all buttons
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedPosition === currentPosition) {
        // Correct answer
        selectedBtn.classList.add('correct');
        answerDisplay.textContent = `✓ CORRECT! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
        answerDisplay.style.color = '#68d391';
        correctCount++;
        correctCountEl.textContent = correctCount;

        // Check if player just beat their previous high score (only show once)
        if (correctCount > highestScore && highestScore > 0 && !hasShownHighScoreNotification) {
            showHighScoreBeatNotification();
            hasShownHighScoreNotification = true;
        }

        // Particles effect
        const rect = selectedBtn.getBoundingClientRect();
        const containerRect = particlesContainer.getBoundingClientRect();
        createParticles(
            rect.left + rect.width / 2 - containerRect.left,
            rect.top + rect.height / 2 - containerRect.top
        );

        // Update average time
        updateAverageTime();

        // Update level
        updateLevel();

        // Auto advance to next question after 0.8 seconds
        setTimeout(() => {
            if (!isGameOver) {
                generateNewQuestion();
            }
        }, 800);
    } else {
        // Incorrect answer
        selectedBtn.classList.add('incorrect');

        // Highlight correct answer
        allButtons.forEach(btn => {
            if (parseInt(btn.dataset.position) === currentPosition) {
                btn.classList.add('correct');
            }
        });

        answerDisplay.textContent = `✗ WRONG! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
        answerDisplay.style.color = '#fc8181';

        loseLife();
        incorrectCount++;
        incorrectCountEl.textContent = incorrectCount;

        // Update average time
        updateAverageTime();

        // Auto advance after 1.5 seconds for wrong answers
        setTimeout(() => {
            if (!isGameOver) {
                generateNewQuestion();
            }
        }, 1500);
    }
}

// Event listeners
optionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
        handleOptionClick(e);
    }
});

pauseBtn.addEventListener('click', togglePause);

nextBtn.addEventListener('click', () => {
    if (answered && !isGameOver) {
        stopTimer();
        generateNewQuestion();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        togglePause();
    } else if ((e.key === 'Enter' || e.key === ' ') && !isPaused) {
        e.preventDefault();
        if (answered && !isGameOver) {
            stopTimer();
            generateNewQuestion();
        }
    } else if (['1', '2', '3', '4'].includes(e.key) && !answered && !isPaused && !isGameOver) {
        const index = parseInt(e.key) - 1;
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        if (buttons[index]) {
            buttons[index].click();
        }
    }
});

// Make functions global for onclick handlers
window.togglePause = togglePause;
window.restartGame = restartGame;
window.showLearnPage = showLearnPage;
window.showStartScreen = showStartScreen;
window.startGame = startGame;

// Don't auto-start the game anymore
// generateNewQuestion();