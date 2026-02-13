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

// Game Mode: 'alphabet', 'puremath'
let gameMode = 'alphabet';

// Alphabet Mode Settings
let alphabetSettings = {
    type: 'position' // 'position', 'opposite', 'alphabetmath', 'mixed'
};

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

// Leaderboard Data
let leaderboardData = {
    alphabet: [],
    math: [],
    overall: []
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

function saveAlphabetSettings() {
    localStorage.setItem('letterTrainerAlphabetSettings', JSON.stringify(alphabetSettings));
}

function loadAlphabetSettings() {
    const saved = localStorage.getItem('letterTrainerAlphabetSettings');
    if (saved) {
        alphabetSettings = { ...alphabetSettings, ...JSON.parse(saved) };
    }
}

// Leaderboard Functions
function loadLeaderboard() {
    const saved = localStorage.getItem('examArcadeLeaderboard');
    if (saved) {
        leaderboardData = JSON.parse(saved);
    }
}

function saveLeaderboard() {
    localStorage.setItem('examArcadeLeaderboard', JSON.stringify(leaderboardData));
}

function addToLeaderboard(score, mode) {
    const entry = {
        username: userData.username,
        score: score,
        level: level,
        accuracy: totalAnswers > 0 ? ((correctCount / totalAnswers) * 100).toFixed(1) : 0,
        date: new Date().toISOString()
    };

    // Add to mode-specific leaderboard
    if (!leaderboardData[mode]) {
        leaderboardData[mode] = [];
    }
    leaderboardData[mode].push(entry);
    leaderboardData[mode].sort((a, b) => b.score - a.score);
    leaderboardData[mode] = leaderboardData[mode].slice(0, 20); // Keep top 20

    // Add to overall leaderboard
    leaderboardData.overall.push(entry);
    leaderboardData.overall.sort((a, b) => b.score - a.score);
    leaderboardData.overall = leaderboardData.overall.slice(0, 20); // Keep top 20

    saveLeaderboard();
}

function getLeaderboard(mode = 'overall') {
    loadLeaderboard();
    return leaderboardData[mode] || [];
}

function getUserRank(mode = 'overall') {
    const board = getLeaderboard(mode);
    const userEntry = board.findIndex(entry => entry.username === userData.username);
    return userEntry !== -1 ? userEntry + 1 : null;
}

loadUserData();
loadMathSettings();
loadAlphabetSettings();
loadLeaderboard();

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
const leaderboardBtn = document.getElementById('leaderboardBtn');
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

// Leaderboard UI Functions
function showLeaderboard() {
    const overallBoard = getLeaderboard('overall');
    const alphabetBoard = getLeaderboard('alphabet');
    const mathBoard = getLeaderboard('math');
    
    const userOverallRank = getUserRank('overall');

    menuContent.innerHTML = `
        <div class="leaderboard-card">
            <div class="leaderboard-header">
                <div class="leaderboard-icon">🏆</div>
                <div class="leaderboard-title">LEADERBOARD</div>
            </div>
            
            ${userOverallRank ? `
            <div class="leaderboard-user-rank">
                <div class="leaderboard-user-rank-title">YOUR RANK</div>
                <div class="leaderboard-user-rank-value">#${userOverallRank}</div>
            </div>
            ` : ''}
            
            <div class="leaderboard-tabs">
                <button class="leaderboard-tab active" onclick="showLeaderboardTab('overall')">OVERALL</button>
                <button class="leaderboard-tab" onclick="showLeaderboardTab('alphabet')">ALPHABET</button>
                <button class="leaderboard-tab" onclick="showLeaderboardTab('math')">MATH</button>
            </div>
            
            <div id="leaderboardContent">
                ${renderLeaderboardList(overallBoard)}
            </div>
            
            <button class="menu-btn" onclick="showStartScreen()">⬅ BACK</button>
        </div>
    `;
    menuOverlay.classList.add('active');
}

function renderLeaderboardList(board) {
    if (board.length === 0) {
        return `<div class="leaderboard-empty">No scores yet. Start playing to appear on the leaderboard!</div>`;
    }
    
    return `
        <div class="leaderboard-list">
            ${board.map((entry, index) => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${index < 3 ? 'top-' + (index + 1) : ''}">${index + 1}</div>
                    <div class="leaderboard-avatar">👤</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${entry.username}</div>
                        <div class="leaderboard-stats">Level ${entry.level} • ${entry.accuracy}% accuracy</div>
                    </div>
                    <div class="leaderboard-score">${entry.score}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function showLeaderboardTab(mode) {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    const board = getLeaderboard(mode);
    document.getElementById('leaderboardContent').innerHTML = renderLeaderboardList(board);
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

function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
}

function showStartScreen() {
    menuContent.innerHTML = `
        <div class="start-screen">
            <div class="start-title">ExamArcade</div>
            <div class="start-subtitle">PRACTICE TRAINER v3.0</div>
            <div class="mode-buttons">
                <button class="mode-btn secondary" onclick="showModeSelection()">🎮 PLAY GAME</button>
                <button class="mode-btn" onclick="showProfile()">👤 PROFILE</button>
                <button class="mode-btn" onclick="showLeaderboard()">🏆 LEADERBOARD</button>
                <a href="index.html" class="mode-btn" style="text-decoration: none; display: block;">🏠 BACK TO HOME</a>
            </div>
        </div>
    `;
    menuOverlay.classList.add('active');
}

// Check for URL parameters to auto-navigate
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const page = urlParams.get('page');
    
    if (mode === 'select') {
        // Show mode selection directly
        showModeSelection();
    } else if (page === 'profile') {
        // Show profile directly
        showProfile();
    } else if (page === 'leaderboard') {
        // Show leaderboard directly
        showLeaderboard();
    } else {
        // Default: show start screen
        showStartScreen();
    }
});

function updateModeBadge() {
    let badgeText = '';
    if (gameMode === 'alphabet') {
        const typeNames = {
            'position': 'POSITION',
            'opposite': 'OPPOSITE',
            'alphabetmath': 'LETTER MATH',
            'mixed': 'ALPHABET MIX'
        };
        badgeText = typeNames[alphabetSettings.type] || 'ALPHABET';
    } else if (gameMode === 'puremath') {
        badgeText = 'MATH';
    }
    modeBadge.textContent = badgeText;
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
    
    // Add to leaderboard
    addToLeaderboard(correctCount, gameMode);
    
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
                <button class="menu-btn" onclick="showLeaderboard()">🏆 LEADERBOARD</button>
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
                <button class="menu-btn" onclick="showLeaderboard()">🏆 LEADERBOARD</button>
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
    if (gameMode === 'alphabet') {
        if (alphabetSettings.type === 'position') {
            positionDisplay.textContent = 'What position is this letter?';
        } else if (alphabetSettings.type === 'opposite') {
            positionDisplay.textContent = 'What is the opposite letter?';
        } else if (alphabetSettings.type === 'alphabetmath') {
            positionDisplay.textContent = 'Solve the alphabet equation:';
        } else if (alphabetSettings.type === 'mixed') {
            positionDisplay.textContent = 'Alphabet Challenge:';
        }
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
    if (gameMode === 'alphabet') {
        const type = alphabetSettings.type === 'mixed' ? 'check' : alphabetSettings.type;
        
        if (type === 'position' || type === 'check') {
            return `⏱ TIME UP! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
        } else if (type === 'opposite') {
            const opposite = getOppositeLetter(currentLetter);
            return `⏱ TIME UP! ${currentLetter} ↔ ${opposite}`;
        } else {
            return `⏱ TIME UP! Check the answer above`;
        }
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

    if (gameMode === 'alphabet') {
        let questionType = alphabetSettings.type;
        
        if (questionType === 'mixed') {
            const types = ['position', 'opposite', 'alphabetmath'];
            questionType = types[Math.floor(Math.random() * types.length)];
        }
        
        if (questionType === 'position') {
            generatePositionQuestion();
        } else if (questionType === 'opposite') {
            generateOppositeQuestion();
        } else if (questionType === 'alphabetmath') {
            generateAlphabetMathQuestion();
        }
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
    letterDisplay.style.fontSize = '72px';
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
    letterDisplay.style.fontSize = '72px';
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
    } else {
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
    } else {
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
                generateNewQuestion();
            }
        }, 1500);
    }
}

function getCorrectMessage() {
    if (gameMode === 'alphabet') {
        const isPositionQuestion = currentPosition && currentLetter && alphabet.indexOf(currentLetter) === currentPosition - 1;
        
        if (alphabetSettings.type === 'position' || (alphabetSettings.type === 'mixed' && isPositionQuestion && !currentLetter.includes('('))) {
            return `✓ CORRECT! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
        } else if (alphabetSettings.type === 'opposite' || (alphabetSettings.type === 'mixed' && !currentLetter.includes('('))) {
            const opposite = getOppositeLetter(currentLetter);
            return `✓ CORRECT! ${currentLetter} ↔ ${opposite}`;
        } else {
            return `✓ CORRECT! Answer is ${currentLetter}(${currentPosition})`;
        }
    } else if (gameMode === 'puremath') {
        return `✓ CORRECT! Answer is ${currentPosition}`;
    }
}

function getIncorrectMessage() {
    if (gameMode === 'alphabet') {
        const isPositionQuestion = currentPosition && currentLetter && alphabet.indexOf(currentLetter) === currentPosition - 1;
        
        if (alphabetSettings.type === 'position' || (alphabetSettings.type === 'mixed' && isPositionQuestion && !currentLetter.includes('('))) {
            return `✗ WRONG! ${currentLetter} is the ${getOrdinal(currentPosition)} letter`;
        } else if (alphabetSettings.type === 'opposite' || (alphabetSettings.type === 'mixed' && !currentLetter.includes('('))) {
            const opposite = getOppositeLetter(currentLetter);
            return `✗ WRONG! ${currentLetter} ↔ ${opposite}`;
        } else {
            return `✗ WRONG! Answer is ${currentLetter}(${currentPosition})`;
        }
    } else if (gameMode === 'puremath') {
        return `✗ WRONG! Answer is ${currentPosition}`;
    }
}

function showModeSelection() {
    menuContent.innerHTML = `
        <div class="mode-selection">
            <div class="menu-title">SELECT MODE</div>
            <div class="mode-grid">
                <div class="game-mode-card" onclick="showAlphabetSettings()">
                    <div class="game-mode-title">🔤 ALPHABET MODE</div>
                    <div class="game-mode-desc">
                        Master letter positions, opposites, and letter math!<br>
                        Perfect for SSC CGL, Banking & Railway reasoning
                    </div>
                </div>
                <div class="game-mode-card" onclick="showMathSettings()">
                    <div class="game-mode-title">🔢 MATH MODE</div>
                    <div class="game-mode-desc">
                        Pure mental math with custom settings.<br>
                        Build calculation speed for all exams
                    </div>
                </div>
            </div>
            <div class="menu-buttons" style="margin-top: 20px;">
                <button class="menu-btn" onclick="showStartScreen()">⬅ BACK</button>
            </div>
        </div>
    `;
    menuOverlay.classList.add('active');
}

function showAlphabetSettings() {
    menuContent.innerHTML = `
        <div class="math-settings">
            <div class="menu-title">ALPHABET SETTINGS</div>
            
            <div class="settings-section">
                <div class="settings-label">CHALLENGE TYPE</div>
                <div class="settings-grid">
                    <button class="settings-btn ${alphabetSettings.type === 'position' ? 'active' : ''}" onclick="setAlphabetType('position')">
                        📍 POSITION
                    </button>
                    <button class="settings-btn ${alphabetSettings.type === 'opposite' ? 'active' : ''}" onclick="setAlphabetType('opposite')">
                        🔄 OPPOSITE
                    </button>
                    <button class="settings-btn ${alphabetSettings.type === 'alphabetmath' ? 'active' : ''}" onclick="setAlphabetType('alphabetmath')" style="grid-column: span 2;">
                        🔤 LETTER MATH
                    </button>
                    <button class="settings-btn ${alphabetSettings.type === 'mixed' ? 'active' : ''}" onclick="setAlphabetType('mixed')" style="grid-column: span 2;">
                        🔀 MIXED
                    </button>
                </div>
            </div>

            <div class="settings-info">
                <div class="info-box">
                    <div class="info-title">📍 Position</div>
                    <div class="info-text">Identify letter positions (A=1, B=2...Z=26)</div>
                </div>
                <div class="info-box">
                    <div class="info-title">🔄 Opposite</div>
                    <div class="info-text">Find opposite letters (A↔Z, B↔Y)</div>
                </div>
                <div class="info-box">
                    <div class="info-title">🔤 Letter Math</div>
                    <div class="info-text">Solve equations: A(1) + C(3) = ?</div>
                </div>
                <div class="info-box">
                    <div class="info-title">🔀 Mixed</div>
                    <div class="info-text">Random mix of all challenges</div>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 20px;">
                <button class="menu-btn" onclick="showModeSelection()">⬅ BACK</button>
                <button class="menu-btn secondary" onclick="selectGameMode('alphabet')">▶️ START</button>
            </div>
        </div>
    `;
}

function setAlphabetType(type) {
    alphabetSettings.type = type;
    saveAlphabetSettings();
    showAlphabetSettings();
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

function selectGameMode(mode) {
    gameMode = mode;
    startGame();
}

optionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) handleOptionClick(e);
});

pauseBtn.addEventListener('click', togglePause);
musicBtn.addEventListener('click', toggleMusic);
homeBtn.addEventListener('click', goHome);
if (leaderboardBtn) leaderboardBtn.addEventListener('click', showLeaderboard);

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

// Expose functions to global scope
window.togglePause = togglePause;
window.restartGame = restartGame;
window.startGame = startGame;
window.showProfile = showProfile;
window.saveProfileName = saveProfileName;
window.showModeSelection = showModeSelection;
window.selectGameMode = selectGameMode;
window.goHome = goHome;
window.showMathSettings = showMathSettings;
window.setMathOperation = setMathOperation;
window.setMathDigits = setMathDigits;
window.showAlphabetSettings = showAlphabetSettings;
window.setAlphabetType = setAlphabetType;
window.showStartScreen = showStartScreen;
window.showLeaderboard = showLeaderboard;
window.showLeaderboardTab = showLeaderboardTab;