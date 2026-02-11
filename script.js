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

// Game Mode: 'position', 'opposite', 'alphabetmath', 'puremath'
let gameMode = 'position';

// Math Mode Settings
let mathSettings = {
    operation: 'mixed', // 'addition', 'subtraction', 'multiplication', 'division', 'mixed'
    digits: 1 // 1, 2, 3
};

// User Data State
let userData = {
    username: 'Player',
    totalGames: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalTime: 0,
    highScore: 0
};

function saveUserData() {
    localStorage.setItem('letterTrainerData', JSON.stringify(userData));
}

function loadUserData() {
    const saved = localStorage.getItem('letterTrainerData');
    if (saved) {
        userData = { ...userData, ...JSON.parse(saved) };
        highestScore = Math.max(highestScore, userData.highScore);
    } else {
        const oldSaved = localStorage.getItem('letterTrainerHighScore');
        if (oldSaved) {
            highestScore = parseInt(oldSaved);
            userData.highScore = highestScore;
        }
    }
}

function saveMathSettings() {
    localStorage.setItem('letterTrainerMathSettings', JSON.stringify(mathSettings));
}

function loadMathSettings() {
    const saved = localStorage.getItem('letterTrainerMathSettings');
    if (saved) {
        mathSettings = { ...mathSettings, ...JSON.parse(saved) };
    }
}

loadUserData();
loadMathSettings();

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
const musicBtn = document.getElementById('musicBtn');
const homeBtn = document.getElementById('homeBtn');
const modeBadge = document.getElementById('modeBadge');

const bgMusic = document.getElementById('bgMusic');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const levelUpSound = document.getElementById('levelUpSound');

let isMusicPlaying = false;

if (highestScoreDisplay) highestScoreDisplay.textContent = highestScore;

const musicPref = localStorage.getItem('letterTrainerMusic');
if (musicPref === 'true') {
    isMusicPlaying = true;
    musicBtn.classList.remove('muted');
} else {
    musicBtn.classList.add('muted');
}

function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
        musicBtn.classList.add('muted');
        musicBtn.textContent = '🔇';
        localStorage.setItem('letterTrainerMusic', 'false');
    } else {
        bgMusic.play().catch(e => console.log('Audio play failed:', e));
        isMusicPlaying = true;
        musicBtn.classList.remove('muted');
        musicBtn.textContent = '🔊';
        localStorage.setItem('letterTrainerMusic', 'true');
    }
}

function playSound(type) {
    if (!isMusicPlaying) return;
    let sound;
    switch (type) {
        case 'correct': sound = correctSound; break;
        case 'wrong': sound = wrongSound; break;
        case 'levelup': sound = levelUpSound; break;
    }
    if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.3;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

function goHome() {
    if (gameStarted && !isGameOver) {
        if (!confirm('Return to main menu? Progress will be lost.')) return;
    }
    stopTimer();
    isGameOver = true;
    isPaused = false;
    gameStarted = false;
    gameContainer.classList.add('hidden');
    showStartScreen();
}

function showProfile() {
    const accuracy = (userData.totalCorrect + userData.totalIncorrect) > 0
        ? ((userData.totalCorrect / (userData.totalCorrect + userData.totalIncorrect)) * 100).toFixed(1)
        : 0;
    const avgSpeed = userData.totalCorrect > 0
        ? (userData.totalTime / userData.totalCorrect / 1000).toFixed(2)
        : 0;

    menuContent.innerHTML = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <input type="text" class="profile-name-input" id="usernameInput" value="${userData.username}" maxlength="12" placeholder="ENTER NAME">
            </div>
            <div class="profile-stats-grid">
                <div class="profile-stat-box">
                    <span class="p-stat-label">HIGH SCORE</span>
                    <span class="p-stat-value gold">⭐ ${userData.highScore}</span>
                </div>
                <div class="profile-stat-box">
                    <span class="p-stat-label">GAMES PLAYED</span>
                    <span class="p-stat-value">${userData.totalGames}</span>
                </div>
                <div class="profile-stat-box">
                    <span class="p-stat-label">TOTAL ACCURACY</span>
                    <span class="p-stat-value green">${accuracy}%</span>
                </div>
                <div class="profile-stat-box">
                    <span class="p-stat-label">AVG SPEED</span>
                    <span class="p-stat-value blue">⚡ ${avgSpeed}s</span>
                </div>
                <div class="profile-stat-box">
                    <span class="p-stat-label">TOTAL CORRECT</span>
                    <span class="p-stat-value green">${userData.totalCorrect}</span>
                </div>
                <div class="profile-stat-box">
                    <span class="p-stat-label">TOTAL INCORRECT</span>
                    <span class="p-stat-value" style="color: #fc8181;">${userData.totalIncorrect}</span>
                </div>
            </div>
            <button class="menu-btn" onclick="saveProfileName(); showStartScreen()">⬅ BACK</button>
        </div>
    `;
    setTimeout(() => {
        const input = document.getElementById('usernameInput');
        if (input) {
            input.addEventListener('change', saveProfileName);
            input.addEventListener('blur', saveProfileName);
        }
    }, 100);
    menuOverlay.classList.add('active');
}

function saveProfileName() {
    const input = document.getElementById('usernameInput');
    if (input) {
        userData.username = input.value.trim() || 'Player';
        saveUserData();
    }
}

function showHighScoreBeatNotification() {
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
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function getOppositeLetter(letter) {
    const index = alphabet.indexOf(letter);
    const oppositeIndex = 25 - index;
    return alphabet[oppositeIndex];
}

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
                <div class="alphabet-grid">${alphabetItems}</div>
            </div>
            <div class="learn-section">
                <h3>🎯 Memory Tricks</h3>
                <div class="trick-box">
                    <div class="trick-title">1. Opposite Letter Trick</div>
                    <div class="trick-content">
                        A↔Z, B↔Y, C↔X, D↔W, etc.<br>
                        Positions always add up to 27!
                    </div>
                </div>
                <div class="trick-box">
                    <div class="trick-title">2. Split in Half</div>
                    <div class="trick-content">
                        First half: A-M (1-13)<br>
                        Second half: N-Z (14-26)
                    </div>
                </div>
                <div class="trick-box">
                    <div class="trick-title">3. Quarter Points</div>
                    <div class="trick-content">
                        A=1, G=7, M=13, S=19, Z=26<br>
                        Use these as anchors!
                    </div>
                </div>
                <div class="trick-box">
                    <div class="trick-title">4. Common Patterns</div>
                    <div class="trick-content">
                        EJOTY: 5, 10, 15, 20, 25 (multiples of 5)
                    </div>
                </div>
                <div class="trick-box">
                    <div class="trick-title">5. Alphabet Math Tricks</div>
                    <div class="trick-content">
                        Work with letter positions:<br>
                        A(1) + C(3) = D(4)<br>
                        E(5) - B(2) = C(3)<br>
                        B(2) × C(3) = F(6)<br>
                        F(6) ÷ B(2) = C(3)
                    </div>
                </div>
                <div class="trick-box">
                    <div class="trick-title">6. Mental Math Practice</div>
                    <div class="trick-content">
                        Pure number calculations:<br>
                        Quick addition, subtraction<br>
                        Multiplication tables<br>
                        Division practice
                    </div>
                </div>
            </div>
            <div class="menu-buttons" style="margin-top: 20px;">
                <button class="menu-btn" onclick="showStartScreen()">⬅ BACK</button>
                <button class="menu-btn secondary" onclick="showModeSelection()">🎮 PLAY NOW</button>
            </div>
        </div>
    `;
}

function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
}

function showMathSettings() {
    menuContent.innerHTML = `
        <div class="math-settings">
            <div class="menu-title">MATH SETTINGS</div>
            
            <div class="settings-section">
                <div class="settings-label">OPERATION TYPE</div>
                <div class="settings-grid">
                    <button class="settings-btn ${mathSettings.operation === 'addition' ? 'active' : ''}" onclick="setMathOperation('addition')">
                        ➕ ADD
                    </button>
                    <button class="settings-btn ${mathSettings.operation === 'subtraction' ? 'active' : ''}" onclick="setMathOperation('subtraction')">
                        ➖ SUB
                    </button>
                    <button class="settings-btn ${mathSettings.operation === 'multiplication' ? 'active' : ''}" onclick="setMathOperation('multiplication')">
                        ✖️ MUL
                    </button>
                    <button class="settings-btn ${mathSettings.operation === 'division' ? 'active' : ''}" onclick="setMathOperation('division')">
                        ➗ DIV
                    </button>
                    <button class="settings-btn ${mathSettings.operation === 'mixed' ? 'active' : ''}" onclick="setMathOperation('mixed')" style="grid-column: span 2;">
                        🔀 MIXED
                    </button>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-label">NUMBER OF DIGITS</div>
                <div class="settings-grid">
                    <button class="settings-btn ${mathSettings.digits === 1 ? 'active' : ''}" onclick="setMathDigits(1)">
                        1 DIGIT
                    </button>
                    <button class="settings-btn ${mathSettings.digits === 2 ? 'active' : ''}" onclick="setMathDigits(2)">
                        2 DIGITS
                    </button>
                    <button class="settings-btn ${mathSettings.digits === 3 ? 'active' : ''}" onclick="setMathDigits(3)">
                        3 DIGITS
                    </button>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 20px;">
                <button class="menu-btn" onclick="showModeSelection()">⬅ BACK</button>
                <button class="menu-btn secondary" onclick="selectGameMode('puremath')">▶️ START</button>
            </div>
        </div>
    `;
}

function setMathOperation(operation) {
    mathSettings.operation = operation;
    saveMathSettings();
    showMathSettings();
}

function setMathDigits(digits) {
    mathSettings.digits = digits;
    saveMathSettings();
    showMathSettings();
}

function showModeSelection() {
    menuContent.innerHTML = `
        <div class="mode-selection">
            <div class="menu-title">SELECT MODE</div>
            <div class="mode-grid">
                <div class="game-mode-card" onclick="selectGameMode('position')">
                    <div class="game-mode-title">📍 POSITION MODE</div>
                    <div class="game-mode-desc">
                        Given a letter, identify its position (1-26).
                        Classic training mode!
                    </div>
                </div>
                <div class="game-mode-card" onclick="selectGameMode('opposite')">
                    <div class="game-mode-title">🔄 OPPOSITE MODE</div>
                    <div class="game-mode-desc">
                        Given a letter, find its opposite (A↔Z, B↔Y).
                        Master the reverse alphabet!
                    </div>
                </div>
                <div class="game-mode-card" onclick="selectGameMode('alphabetmath')">
                    <div class="game-mode-title">🔤 ALPHABET MATH</div>
                    <div class="game-mode-desc">
                        Letter operations: A(1) + C(3) = ?<br>
                        Combine letters with math!
                    </div>
                </div>
                <div class="game-mode-card" onclick="showMathSettings()">
                    <div class="game-mode-title">🔢 MATH MODE</div>
                    <div class="game-mode-desc">
                        Pure mental math with custom settings.<br>
                        Choose operations & difficulty!
                    </div>
                </div>
            </div>
            <div class="menu-buttons" style="margin-top: 20px;">
                <button class="menu-btn" onclick="showStartScreen()">⬅ BACK</button>
            </div>
        </div>
    `;
}

function selectGameMode(mode) {
    gameMode = mode;
    startGame();
}

function showStartScreen() {
    menuContent.innerHTML = `
        <div class="start-screen">
            <div class="start-title">LETTER TRAINER</div>
            <div class="start-subtitle">PIXEL EDITION v3.0</div>
            <div class="mode-buttons">
                <button class="mode-btn" onclick="showLearnPage()">📚 LEARN TRICKS</button>
                <button class="mode-btn" onclick="showProfile()">👤 PROFILE</button>
                <button class="mode-btn secondary" onclick="showModeSelection()">🎮 PLAY GAME</button>
            </div>
        </div>
    `;
    menuOverlay.classList.add('active');
}

function updateModeBadge() {
    const modeNames = {
        'position': 'POSITION',
        'opposite': 'OPPOSITE',
        'alphabetmath': 'ALPHABET MATH',
        'puremath': 'MATH'
    };
    modeBadge.textContent = modeNames[gameMode] || 'POSITION';
}

function startGame() {
    gameStarted = true;
    gameContainer.classList.remove('hidden');
    menuOverlay.classList.remove('active');
    updateModeBadge();
    if (musicPref === 'true' && !isMusicPlaying) toggleMusic();
    if (isGameOver) {
        restartGame();
    } else {
        generateNewQuestion();
    }
}

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
    if (questionsInLevel >= 5) {
        level++;
        questionsInLevel = 0;
        levelDisplay.textContent = level;
        baseTimeLimit = Math.max(3, 10 - (level - 1) * 0.5);
        positionDisplay.textContent = `🎉 LEVEL ${level} UNLOCKED! 🎉`;
        positionDisplay.style.color = '#ffd700';
        playSound('levelup');
        setTimeout(() => {
            if (!isGameOver && !isPaused) {
                updatePositionDisplayText();
                positionDisplay.style.color = '#63b3ed';
            }
        }, 2000);
    }
}

function loseLife() {
    lives--;
    updateHearts();
    if (lives <= 0) gameOver();
}

function gameOver() {
    isGameOver = true;
    stopTimer();
    const accuracy = totalAnswers > 0 ? ((correctCount / totalAnswers) * 100).toFixed(1) : 0;
    userData.totalGames++;
    let isNewHighScore = false;
    if (correctCount > userData.highScore) {
        userData.highScore = correctCount;
        highestScore = correctCount;
        isNewHighScore = true;
    }
    saveUserData();

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
                <button class="menu-btn secondary" onclick="restartGame()">PLAY AGAIN</button>
                <button class="menu-btn" onclick="showModeSelection()">CHANGE MODE</button>
                <button class="menu-btn restart" onclick="goHome()">MAIN MENU</button>
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
            </div>
            <div class="menu-buttons">
                <button class="menu-btn secondary" onclick="togglePause()">RESUME</button>
                <button class="menu-btn restart" onclick="restartGame()">RESTART</button>
            </div>
        `;
        menuOverlay.classList.add('active');
    } else {
        menuOverlay.classList.remove('active');
        if (!answered) startTimer();
    }
}

function restartGame() {
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
    hasShownHighScoreNotification = false;
    levelDisplay.textContent = level;
    correctCountEl.textContent = correctCount;
    incorrectCountEl.textContent = incorrectCount;
    avgTimeEl.textContent = '--';
    updateHearts();
    menuOverlay.classList.remove('active');
    generateNewQuestion();
}

function startTimer() {
    timeLeft = Math.ceil(baseTimeLimit);
    startTime = Date.now();
    timerDisplay.textContent = timeLeft;
    timerDisplay.classList.remove('warning');
    if (timerInterval) clearInterval(timerInterval);
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
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.correct === 'true') btn.classList.add('correct');
    });
    answerDisplay.textContent = getTimeoutMessage();
    answerDisplay.style.color = '#f6ad55';
    playSound('wrong');
    loseLife();
    incorrectCount++;
    incorrectCountEl.textContent = incorrectCount;
    userData.totalIncorrect++;
    saveUserData();
    setTimeout(() => {
        if (!isGameOver) generateNewQuestion();
    }, 1500);
}

function updateAverageTime() {
    if (totalAnswers > 0) {
        const avgSeconds = (totalTime / totalAnswers / 1000).toFixed(1);
        avgTimeEl.textContent = avgSeconds + 's';
    }
}

function updatePositionDisplayText() {
    if (gameMode === 'position') {
        positionDisplay.textContent = 'What position is this letter?';
    } else if (gameMode === 'opposite') {
        positionDisplay.textContent = 'What is the opposite letter?';
    } else if (gameMode === 'alphabetmath') {
        positionDisplay.textContent = 'Solve the alphabet equation:';
    } else if (gameMode === 'puremath') {
        positionDisplay.textContent = 'Solve the math problem:';
    }
}

function generateOptions(correctAnswer, optionType = 'position') {
    let allOptions = [];
    if (optionType === 'position') {
        allOptions = Array.from({ length: 26 }, (_, i) => i + 1);
    } else if (optionType === 'letter') {
        allOptions = alphabet.split('');
    }
    const incorrectOptions = allOptions.filter(opt => opt !== correctAnswer);
    const shuffled = incorrectOptions.sort(() => Math.random() - 0.5);
    const options = [correctAnswer, ...shuffled.slice(0, 3)];
    return options.sort(() => Math.random() - 0.5);
}

function getTimeoutMessage() {
    if (gameMode === 'position') {
        return `⏱ TIME UP! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
    } else if (gameMode === 'opposite') {
        const opposite = getOppositeLetter(currentLetter);
        return `⏱ TIME UP! ${currentLetter} ↔ ${opposite}`;
    } else {
        return `⏱ TIME UP! Check the answer above`;
    }
}

function generateNewQuestion() {
    if (isGameOver) return;
    answered = false;
    answerDisplay.textContent = '';
    updatePositionDisplayText();
    positionDisplay.style.color = '#63b3ed';

    if (gameMode === 'position') {
        generatePositionQuestion();
    } else if (gameMode === 'opposite') {
        generateOppositeQuestion();
    } else if (gameMode === 'alphabetmath') {
        generateAlphabetMathQuestion();
    } else if (gameMode === 'puremath') {
        generatePureMathQuestion();
    }

    if (!isPaused) startTimer();

    const rect = letterDisplay.getBoundingClientRect();
    const containerRect = particlesContainer.getBoundingClientRect();
    createParticles(
        rect.left + rect.width / 2 - containerRect.left,
        rect.top + rect.height / 2 - containerRect.top
    );
}

function generatePositionQuestion() {
    currentPosition = Math.floor(Math.random() * 26) + 1;
    currentLetter = alphabet[currentPosition - 1];
    letterDisplay.textContent = currentLetter;
    letterDisplay.style.animation = 'none';
    setTimeout(() => {
        letterDisplay.style.animation = 'letterPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 10);

    const options = generateOptions(currentPosition, 'position');
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    options.forEach((position, index) => {
        const btn = optionButtons[index];
        btn.textContent = getOrdinal(position);
        btn.dataset.position = position;
        btn.dataset.correct = (position === currentPosition) ? 'true' : 'false';
        btn.className = 'option-btn';
        btn.disabled = false;
    });
}

function generateOppositeQuestion() {
    currentPosition = Math.floor(Math.random() * 26) + 1;
    currentLetter = alphabet[currentPosition - 1];
    const oppositeLetter = getOppositeLetter(currentLetter);

    letterDisplay.textContent = currentLetter;
    letterDisplay.style.animation = 'none';
    setTimeout(() => {
        letterDisplay.style.animation = 'letterPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 10);

    const options = generateOptions(oppositeLetter, 'letter');
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    options.forEach((letter, index) => {
        const btn = optionButtons[index];
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.dataset.correct = (letter === oppositeLetter) ? 'true' : 'false';
        btn.className = 'option-btn';
        btn.disabled = false;
    });
}

function generateAlphabetMathQuestion() {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let pos1, pos2, result;
    
    if (operation === '+') {
        pos1 = Math.floor(Math.random() * 13) + 1;
        pos2 = Math.floor(Math.random() * Math.min(13, 26 - pos1)) + 1;
        result = pos1 + pos2;
    } else if (operation === '-') {
        pos1 = Math.floor(Math.random() * 20) + 7;
        pos2 = Math.floor(Math.random() * (pos1 - 1)) + 1;
        result = pos1 - pos2;
    } else if (operation === '×') {
        pos1 = Math.floor(Math.random() * 5) + 2;
        pos2 = Math.floor(Math.random() * Math.min(5, Math.floor(26 / pos1))) + 1;
        result = pos1 * pos2;
        if (result > 26) {
            pos2 = Math.floor(26 / pos1);
            result = pos1 * pos2;
        }
    } else { // ÷
        const divisors = [2, 3, 4, 5, 6];
        pos2 = divisors[Math.floor(Math.random() * divisors.length)];
        const maxMultiple = Math.floor(26 / pos2);
        const multiple = Math.floor(Math.random() * (maxMultiple - 1)) + 1;
        pos1 = pos2 * multiple;
        result = pos1 / pos2;
    }

    const letter1 = alphabet[pos1 - 1];
    const letter2 = alphabet[pos2 - 1];
    const resultLetter = alphabet[result - 1];

    letterDisplay.textContent = `${letter1}(${pos1}) ${operation} ${letter2}(${pos2})`;
    letterDisplay.style.fontSize = '28px';
    letterDisplay.style.animation = 'none';
    setTimeout(() => {
        letterDisplay.style.animation = 'letterPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 10);

    currentLetter = resultLetter;
    currentPosition = result;

    const options = generateOptions(resultLetter, 'letter');
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    options.forEach((letter, index) => {
        const btn = optionButtons[index];
        const letterPos = alphabet.indexOf(letter) + 1;
        btn.textContent = `${letter}(${letterPos})`;
        btn.dataset.letter = letter;
        btn.dataset.correct = (letter === resultLetter) ? 'true' : 'false';
        btn.className = 'option-btn';
        btn.disabled = false;
    });
}

function generatePureMathQuestion() {
    const operations = ['+', '-', '×', '÷'];
    let operation;
    
    // Select operation based on settings
    if (mathSettings.operation === 'mixed') {
        operation = operations[Math.floor(Math.random() * operations.length)];
    } else if (mathSettings.operation === 'addition') {
        operation = '+';
    } else if (mathSettings.operation === 'subtraction') {
        operation = '-';
    } else if (mathSettings.operation === 'multiplication') {
        operation = '×';
    } else if (mathSettings.operation === 'division') {
        operation = '÷';
    }
    
    let num1, num2, result;
    const digits = mathSettings.digits;
    
    // Calculate ranges based on digit count
    let minNum, maxNum;
    if (digits === 1) {
        minNum = 1;
        maxNum = 9;
    } else if (digits === 2) {
        minNum = 10;
        maxNum = 99;
    } else if (digits === 3) {
        minNum = 100;
        maxNum = 999;
    }
    
    if (operation === '+') {
        num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        result = num1 + num2;
    } else if (operation === '-') {
        num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        num2 = Math.floor(Math.random() * (num1 - minNum)) + minNum;
        result = num1 - num2;
    } else if (operation === '×') {
        if (digits === 1) {
            num1 = Math.floor(Math.random() * 9) + 1;
            num2 = Math.floor(Math.random() * 9) + 1;
        } else if (digits === 2) {
            num1 = Math.floor(Math.random() * 20) + 10;
            num2 = Math.floor(Math.random() * 9) + 1;
        } else {
            num1 = Math.floor(Math.random() * 50) + 10;
            num2 = Math.floor(Math.random() * 20) + 1;
        }
        result = num1 * num2;
    } else { // ÷
        if (digits === 1) {
            const divisors = [2, 3, 4, 5, 6, 7, 8, 9];
            num2 = divisors[Math.floor(Math.random() * divisors.length)];
            const multiple = Math.floor(Math.random() * 9) + 1;
            num1 = num2 * multiple;
        } else if (digits === 2) {
            const divisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            num2 = divisors[Math.floor(Math.random() * divisors.length)];
            const multiple = Math.floor(Math.random() * 20) + 5;
            num1 = num2 * multiple;
        } else {
            const divisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25];
            num2 = divisors[Math.floor(Math.random() * divisors.length)];
            const multiple = Math.floor(Math.random() * 50) + 10;
            num1 = num2 * multiple;
        }
        result = num1 / num2;
    }

    letterDisplay.textContent = `${num1} ${operation} ${num2}`;
    letterDisplay.style.fontSize = digits === 3 ? '32px' : '40px';
    letterDisplay.style.animation = 'none';
    setTimeout(() => {
        letterDisplay.style.animation = 'letterPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 10);

    currentPosition = result;
    currentLetter = result.toString();

    // Generate options for pure math
    const options = [];
    options.push(result);
    
    const range = digits === 1 ? 10 : digits === 2 ? 50 : 100;
    
    while (options.length < 4) {
        let wrongAnswer;
        if (operation === '÷') {
            wrongAnswer = Math.max(1, result + Math.floor(Math.random() * 20) - 10);
        } else {
            wrongAnswer = Math.max(1, result + Math.floor(Math.random() * range) - (range / 2));
        }
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    options.forEach((number, index) => {
        const btn = optionButtons[index];
        btn.textContent = number;
        btn.dataset.number = number;
        btn.dataset.correct = (number === result) ? 'true' : 'false';
        btn.className = 'option-btn';
        btn.disabled = false;
    });
}

function handleOptionClick(e) {
    if (answered || isPaused || isGameOver) return;
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === 'true';
    answered = true;
    stopTimer();

    const timeTaken = Date.now() - startTime;
    totalTime += timeTaken;
    totalAnswers++;
    userData.totalTime += timeTaken;
    saveUserData();

    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        answerDisplay.textContent = getCorrectMessage();
        answerDisplay.style.color = '#68d391';
        userData.totalCorrect++;
        saveUserData();
        playSound('correct');
        correctCount++;
        correctCountEl.textContent = correctCount;

        if (correctCount > highestScore && highestScore > 0 && !hasShownHighScoreNotification) {
            showHighScoreBeatNotification();
            hasShownHighScoreNotification = true;
        }

        const rect = selectedBtn.getBoundingClientRect();
        const containerRect = particlesContainer.getBoundingClientRect();
        createParticles(
            rect.left + rect.width / 2 - containerRect.left,
            rect.top + rect.height / 2 - containerRect.top
        );

        updateAverageTime();
        updateLevel();

        setTimeout(() => {
            if (!isGameOver) {
                if (gameMode === 'alphabetmath') {
                    letterDisplay.style.fontSize = '28px';
                } else if (gameMode === 'puremath') {
                    letterDisplay.style.fontSize = mathSettings.digits === 3 ? '32px' : '40px';
                } else {
                    letterDisplay.style.fontSize = '72px';
                }
                generateNewQuestion();
            }
        }, 800);
    } else {
        selectedBtn.classList.add('incorrect');
        allButtons.forEach(btn => {
            if (btn.dataset.correct === 'true') btn.classList.add('correct');
        });
        answerDisplay.textContent = getIncorrectMessage();
        answerDisplay.style.color = '#fc8181';
        playSound('wrong');
        loseLife();
        incorrectCount++;
        incorrectCountEl.textContent = incorrectCount;
        updateAverageTime();

        setTimeout(() => {
            if (!isGameOver) {
                if (gameMode === 'alphabetmath') {
                    letterDisplay.style.fontSize = '28px';
                } else if (gameMode === 'puremath') {
                    letterDisplay.style.fontSize = mathSettings.digits === 3 ? '32px' : '40px';
                } else {
                    letterDisplay.style.fontSize = '72px';
                }
                generateNewQuestion();
            }
        }, 1500);
    }
}

function getCorrectMessage() {
    if (gameMode === 'position') {
        return `✓ CORRECT! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
    } else if (gameMode === 'opposite') {
        const opposite = getOppositeLetter(currentLetter);
        return `✓ CORRECT! ${currentLetter} ↔ ${opposite}`;
    } else if (gameMode === 'alphabetmath') {
        return `✓ CORRECT! Answer is ${currentLetter}(${currentPosition})`;
    } else if (gameMode === 'puremath') {
        return `✓ CORRECT! Answer is ${currentPosition}`;
    }
}

function getIncorrectMessage() {
    if (gameMode === 'position') {
        return `✗ WRONG! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
    } else if (gameMode === 'opposite') {
        const opposite = getOppositeLetter(currentLetter);
        return `✗ WRONG! ${currentLetter} ↔ ${opposite}`;
    } else if (gameMode === 'alphabetmath') {
        return `✗ WRONG! Answer is ${currentLetter}(${currentPosition})`;
    } else if (gameMode === 'puremath') {
        return `✗ WRONG! Answer is ${currentPosition}`;
    }
}

optionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) handleOptionClick(e);
});

pauseBtn.addEventListener('click', togglePause);
musicBtn.addEventListener('click', toggleMusic);
homeBtn.addEventListener('click', goHome);

nextBtn.addEventListener('click', () => {
    if (answered && !isGameOver) {
        stopTimer();
        generateNewQuestion();
    }
});

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
        if (buttons[index]) buttons[index].click();
    }
});

window.togglePause = togglePause;
window.restartGame = restartGame;
window.showLearnPage = showLearnPage;
window.showStartScreen = showStartScreen;
window.startGame = startGame;
window.showProfile = showProfile;
window.saveProfileName = saveProfileName;
window.showModeSelection = showModeSelection;
window.selectGameMode = selectGameMode;
window.goHome = goHome;
window.showMathSettings = showMathSettings;
window.setMathOperation = setMathOperation;
window.setMathDigits = setMathDigits;