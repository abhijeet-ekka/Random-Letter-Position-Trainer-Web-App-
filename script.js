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

loadUserData();
loadMathSettings();
loadAlphabetSettings();

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
    menuContent.innerHTML = `
        <div class="learn-page">
            <h3 style="font-size: 20px; color: #ffd700; text-align: center; margin-bottom: 20px;">📚 LEARNING CENTER</h3>
            
            <div class="learn-menu-grid">
                <div class="learn-menu-card" onclick="showAlphabetLearning()">
                    <div class="learn-menu-icon">🔤</div>
                    <div class="learn-menu-title">ALPHABET<br>MASTERY</div>
                    <div class="learn-menu-desc">Letter positions, opposites & patterns</div>
                </div>
                
                <div class="learn-menu-card" onclick="showAdditionLearning()">
                    <div class="learn-menu-icon">➕</div>
                    <div class="learn-menu-title">ADDITION<br>TECHNIQUES</div>
                    <div class="learn-menu-desc">Fast addition methods & shortcuts</div>
                </div>
                
                <div class="learn-menu-card" onclick="showSubtractionLearning()">
                    <div class="learn-menu-icon">➖</div>
                    <div class="learn-menu-title">SUBTRACTION<br>TECHNIQUES</div>
                    <div class="learn-menu-desc">Smart subtraction strategies</div>
                </div>
                
                <div class="learn-menu-card" onclick="showMultiplicationLearning()">
                    <div class="learn-menu-icon">✖️</div>
                    <div class="learn-menu-title">MULTIPLICATION<br>TRICKS</div>
                    <div class="learn-menu-desc">Multiply faster in your head</div>
                </div>
                
                <div class="learn-menu-card" onclick="showDivisionLearning()">
                    <div class="learn-menu-icon">➗</div>
                    <div class="learn-menu-title">DIVISION<br>SHORTCUTS</div>
                    <div class="learn-menu-desc">Division rules & quick methods</div>
                </div>
                
                <div class="learn-menu-card" onclick="showSpeedTipsLearning()">
                    <div class="learn-menu-icon">⚡</div>
                    <div class="learn-menu-title">SPEED<br>TIPS</div>
                    <div class="learn-menu-desc">Pro tips for lightning calculations</div>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 25px;">
                <button class="menu-btn" onclick="showStartScreen()">⬅ MAIN MENU</button>
                <button class="menu-btn secondary" onclick="showModeSelection()">🎮 PRACTICE NOW</button>
            </div>
        </div>
    `;
}

function showAlphabetLearning() {
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
            <div class="learn-header">
                <h3 style="font-size: 18px; color: #ffd700; margin-bottom: 5px;">🔤 ALPHABET MASTERY</h3>
                <p style="font-size: 9px; color: #a0aec0; margin-bottom: 20px;">Master letter positions and patterns</p>
            </div>

            <div class="technique-section">
                <div class="technique-number">1</div>
                <div class="technique-header">
                    <div class="technique-title">The Opposite Letter Formula</div>
                    <div class="technique-subtitle">Position + Opposite = Always 27</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">THE GOLDEN RULE</div>
                        <div class="rule-content">Position + Opposite = 27</div>
                    </div>
                    
                    <div class="example-grid">
                        <div class="example-box">
                            <div class="example-label">Example 1</div>
                            <div class="example-work">
                                A(1) + Z(26) = 27 ✓<br>
                                B(2) + Y(25) = 27 ✓<br>
                                M(13) + N(14) = 27 ✓
                            </div>
                        </div>
                        <div class="example-box">
                            <div class="example-label">Quick Find</div>
                            <div class="example-work">
                                Find opposite of N(14):<br>
                                27 - 14 = <span class="highlight">13</span><br>
                                Answer: <span class="highlight">M</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 TRY IT YOURSELF</div>
                        <div class="practice-content">
                            Find opposite of G(7): 27 - 7 = ? → Answer: T(20)<br>
                            Find opposite of R(18): 27 - 18 = ? → Answer: I(9)
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">2</div>
                <div class="technique-header">
                    <div class="technique-title">The Anchor Method</div>
                    <div class="technique-subtitle">Use key letters as reference points</div>
                </div>
                <div class="technique-body">
                    <div class="anchor-grid">
                        <div class="anchor-box">A<div class="anchor-num">1</div></div>
                        <div class="anchor-box">E<div class="anchor-num">5</div></div>
                        <div class="anchor-box">J<div class="anchor-num">10</div></div>
                        <div class="anchor-box">O<div class="anchor-num">15</div></div>
                        <div class="anchor-box">T<div class="anchor-num">20</div></div>
                        <div class="anchor-box">Z<div class="anchor-num">26</div></div>
                    </div>
                    
                    <div class="strategy-box">
                        <div class="strategy-label">STRATEGY</div>
                        <div class="strategy-content">
                            Find the nearest anchor, then count forward or backward
                        </div>
                    </div>
                    
                    <div class="example-grid">
                        <div class="example-box">
                            <div class="example-label">Find H</div>
                            <div class="example-work">
                                Nearest anchor: E(5)<br>
                                Count forward:<br>
                                F(6), G(7), <span class="highlight">H(8)</span>
                            </div>
                        </div>
                        <div class="example-box">
                            <div class="example-label">Find R</div>
                            <div class="example-work">
                                Nearest anchor: T(20)<br>
                                Count backward:<br>
                                S(19), <span class="highlight">R(18)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">3</div>
                <div class="technique-header">
                    <div class="technique-title">Chunk the Alphabet</div>
                    <div class="technique-subtitle">Break into 4 easy quarters</div>
                </div>
                <div class="technique-body">
                    <div class="chunk-grid">
                        <div class="chunk-box quarter1">
                            <div class="chunk-label">QUARTER 1 (1-7)</div>
                            <div class="chunk-letters">A B C D E F G</div>
                        </div>
                        <div class="chunk-box quarter2">
                            <div class="chunk-label">QUARTER 2 (8-13)</div>
                            <div class="chunk-letters">H I J K L M</div>
                        </div>
                        <div class="chunk-box quarter3">
                            <div class="chunk-label">QUARTER 3 (14-19)</div>
                            <div class="chunk-letters">N O P Q R S</div>
                        </div>
                        <div class="chunk-box quarter4">
                            <div class="chunk-label">QUARTER 4 (20-26)</div>
                            <div class="chunk-letters">T U V W X Y Z</div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">💡</div>
                        <div class="tip-content">
                            Identify which quarter the letter is in, then count within that section. 
                            Much easier than counting from A every time!
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">4</div>
                <div class="technique-header">
                    <div class="technique-title">Multiples of 5 Pattern</div>
                    <div class="technique-subtitle">Remember: E-J-O-T-Y</div>
                </div>
                <div class="technique-body">
                    <div class="mnemonic-box">
                        <div class="mnemonic-label">MEMORY TRICK</div>
                        <div class="mnemonic-text">"Every Jolly Old Tiger Yawns"</div>
                    </div>
                    
                    <div class="multiples-grid">
                        <div class="multiple-box">E<div class="multiple-num">5</div></div>
                        <div class="multiple-box">J<div class="multiple-num">10</div></div>
                        <div class="multiple-box">O<div class="multiple-num">15</div></div>
                        <div class="multiple-box">T<div class="multiple-num">20</div></div>
                        <div class="multiple-box">Y<div class="multiple-num">25</div></div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">⚡</div>
                        <div class="tip-content">
                            These letters are stepping stones! Use them to quickly estimate positions.
                            Example: P is after O(15), so it's around 16.
                        </div>
                    </div>
                </div>
            </div>

            <div class="reference-section">
                <div class="reference-header">📋 COMPLETE ALPHABET REFERENCE</div>
                <div class="alphabet-grid">${alphabetItems}</div>
            </div>

            <div class="menu-buttons" style="margin-top: 25px;">
                <button class="menu-btn" onclick="showLearnPage()">⬅ LEARNING CENTER</button>
                <button class="menu-btn secondary" onclick="selectGameMode('alphabet')">🎮 PRACTICE ALPHABET</button>
            </div>
        </div>
    `;
}

function showAdditionLearning() {
    menuContent.innerHTML = `
        <div class="learn-page">
            <div class="learn-header">
                <h3 style="font-size: 18px; color: #ffd700; margin-bottom: 5px;">➕ ADDITION TECHNIQUES</h3>
                <p style="font-size: 9px; color: #a0aec0; margin-bottom: 20px;">Master fast addition methods</p>
            </div>

            <div class="technique-section">
                <div class="technique-number">1</div>
                <div class="technique-header">
                    <div class="technique-title">Make 10s First</div>
                    <div class="technique-subtitle">Round numbers to friendly 10s and 100s</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">THE STRATEGY</div>
                        <div class="rule-content">Break numbers to create easy 10s, then add the rest</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 8 + 7</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Think: 8 needs 2 to make 10</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">Break 7 into: 2 + 5</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">8 + 2 = 10</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">10 + 5 = <span class="highlight">15</span></div>
                        </div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 67 + 48</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">67 needs 3 to reach 70</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">Break 48 into: 3 + 45</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">67 + 3 = 70</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">70 + 45 = <span class="highlight">115</span></div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 PRACTICE PROBLEMS</div>
                        <div class="practice-content">
                            9 + 6 = ? (Hint: 9+1=10, then 10+5=15)<br>
                            58 + 37 = ? (Hint: 58+2=60, then 60+35=95)<br>
                            89 + 24 = ? (Hint: 89+1=90, then 90+23=113)
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">2</div>
                <div class="technique-header">
                    <div class="technique-title">Left-to-Right Addition</div>
                    <div class="technique-subtitle">Add the biggest digits first</div>
                </div>
                <div class="technique-body">
                    <div class="comparison-grid">
                        <div class="comparison-box wrong">
                            <div class="comparison-label">❌ OLD WAY (Slow)</div>
                            <div class="comparison-content">
                                47 + 36<br>
                                Start from right: 7+6=13<br>
                                Carry the 1...<br>
                                Then 4+3+1=8...<br>
                                Answer: 83
                            </div>
                        </div>
                        <div class="comparison-box right">
                            <div class="comparison-label">✅ NEW WAY (Fast)</div>
                            <div class="comparison-content">
                                47 + 36<br>
                                40 + 30 = 70<br>
                                7 + 6 = 13<br>
                                70 + 13 = <span class="highlight">83</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 284 + 157</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Hundreds: 200 + 100 = 300</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">Tens: 80 + 50 = 130</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Ones: 4 + 7 = 11</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Total: 300 + 130 + 11 = <span class="highlight">441</span></div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">⚡</div>
                        <div class="tip-content">
                            This is faster because you get the approximate answer immediately, 
                            then just add the small details!
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">3</div>
                <div class="technique-header">
                    <div class="technique-title">Compensation Method</div>
                    <div class="technique-subtitle">Round up, then subtract the extra</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">WHEN TO USE</div>
                        <div class="rule-content">Perfect when one number is close to 10, 50, 100, etc.</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 49 + 37</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">49 is close to 50! Round up: 50</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">50 + 37 = 87 (easy!)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">We added 1 extra, so subtract: 87 - 1</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Answer: <span class="highlight">86</span></div>
                        </div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 298 + 156</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Round 298 → 300 (+2)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">300 + 156 = 456</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Subtract the extra: 456 - 2</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Answer: <span class="highlight">454</span></div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 PRACTICE PROBLEMS</div>
                        <div class="practice-content">
                            99 + 45 = ? (Round 99→100, then 100+45-1=144)<br>
                            198 + 67 = ? (Round 198→200, then 200+67-2=265)<br>
                            48 + 26 = ? (Round 48→50, then 50+26-2=74)
                        </div>
                    </div>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 25px;">
                <button class="menu-btn" onclick="showLearnPage()">⬅ LEARNING CENTER</button>
                <button class="menu-btn secondary" onclick="showMathSettings()">🎮 PRACTICE ADDITION</button>
            </div>
        </div>
    `;
}

function showSubtractionLearning() {
    menuContent.innerHTML = `
        <div class="learn-page">
            <div class="learn-header">
                <h3 style="font-size: 18px; color: #ffd700; margin-bottom: 5px;">➖ SUBTRACTION TECHNIQUES</h3>
                <p style="font-size: 9px; color: #a0aec0; margin-bottom: 20px;">Smart strategies for faster subtraction</p>
            </div>

            <div class="technique-section">
                <div class="technique-number">1</div>
                <div class="technique-header">
                    <div class="technique-title">Add-Up Method</div>
                    <div class="technique-subtitle">Count forward instead of backward</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">WHY IT WORKS</div>
                        <div class="rule-content">Counting up is easier for your brain than counting down!</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 83 - 57</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Start at 57, count to nearest 10</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">57 → 60: +3</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">60 → 80: +20</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">80 → 83: +3</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">5</div>
                            <div class="step-text">Total: 3 + 20 + 3 = <span class="highlight">26</span></div>
                        </div>
                    </div>
                    
                    <div class="visual-box">
                        <div class="visual-label">VISUAL DIAGRAM</div>
                        <div class="number-line">
                            <div class="number-point">57</div>
                            <div class="number-arrow">+3→</div>
                            <div class="number-point">60</div>
                            <div class="number-arrow">+20→</div>
                            <div class="number-point">80</div>
                            <div class="number-arrow">+3→</div>
                            <div class="number-point">83</div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 PRACTICE PROBLEMS</div>
                        <div class="practice-content">
                            92 - 67 = ? (67→70→90→92 = 3+20+2=25)<br>
                            154 - 78 = ? (78→80→150→154 = 2+70+4=76)
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">2</div>
                <div class="technique-header">
                    <div class="technique-title">Equal Addition Method</div>
                    <div class="technique-subtitle">Add the same to both numbers</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">THE PRINCIPLE</div>
                        <div class="rule-content">Adding the same to both numbers doesn't change the difference!</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 62 - 38</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">38 is hard to subtract. Make it 40!</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">Add 2 to both: (62+2) - (38+2)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">New problem: 64 - 40</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Answer: <span class="highlight">24</span> (super easy!)</div>
                        </div>
                    </div>
                    
                    <div class="example-grid">
                        <div class="example-box">
                            <div class="example-label">Example 2</div>
                            <div class="example-work">
                                73 - 29<br>
                                Add 1 to both:<br>
                                74 - 30 = <span class="highlight">44</span>
                            </div>
                        </div>
                        <div class="example-box">
                            <div class="example-label">Example 3</div>
                            <div class="example-work">
                                156 - 98<br>
                                Add 2 to both:<br>
                                158 - 100 = <span class="highlight">58</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">💡</div>
                        <div class="tip-content">
                            Always try to make the second number end in 0. This makes subtraction instant!
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">3</div>
                <div class="technique-header">
                    <div class="technique-title">Break It Down</div>
                    <div class="technique-subtitle">Subtract tens and ones separately</div>
                </div>
                <div class="technique-body">
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 95 - 27</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Break 27 into: 20 + 7</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">Subtract tens first: 95 - 20 = 75</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Subtract ones: 75 - 7 = 68</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Answer: <span class="highlight">68</span></div>
                        </div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 342 - 156</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Break 156: 100 + 50 + 6</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">342 - 100 = 242</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">242 - 50 = 192</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">192 - 6 = <span class="highlight">186</span></div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 PRACTICE PROBLEMS</div>
                        <div class="practice-content">
                            87 - 34 = ? (87-30=57, 57-4=53)<br>
                            215 - 78 = ? (215-70=145, 145-8=137)
                        </div>
                    </div>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 25px;">
                <button class="menu-btn" onclick="showLearnPage()">⬅ LEARNING CENTER</button>
                <button class="menu-btn secondary" onclick="showMathSettings()">🎮 PRACTICE SUBTRACTION</button>
            </div>
        </div>
    `;
}

function showMultiplicationLearning() {
    menuContent.innerHTML = `
        <div class="learn-page">
            <div class="learn-header">
                <h3 style="font-size: 18px; color: #ffd700; margin-bottom: 5px;">✖️ MULTIPLICATION TRICKS</h3>
                <p style="font-size: 9px; color: #a0aec0; margin-bottom: 20px;">Powerful shortcuts for faster multiplication</p>
            </div>

            <div class="technique-section">
                <div class="technique-number">1</div>
                <div class="technique-header">
                    <div class="technique-title">The 9s Finger Trick</div>
                    <div class="technique-subtitle">Visual method for 9 times table</div>
                </div>
                <div class="technique-body">
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 9 × 7</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Hold up all 10 fingers</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">Put down the 7th finger (from left)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Count left side: 6 fingers = 6 tens</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Count right side: 3 fingers = 3 ones</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">5</div>
                            <div class="step-text">Answer: <span class="highlight">63</span></div>
                        </div>
                    </div>
                    
                    <div class="visual-box">
                        <div class="visual-label">FINGER DIAGRAM</div>
                        <div class="finger-diagram">
                            👍👍👍👍👍👍 | 👎 | 👍👍👍<br>
                            <span style="color: #ffd700;">6 fingers</span> | down | <span style="color: #ffd700;">3 fingers</span><br>
                            = 60 + 3 = 63
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 TRY THESE</div>
                        <div class="practice-content">
                            9 × 4 = ? (3 left, 6 right = 36)<br>
                            9 × 8 = ? (7 left, 2 right = 72)
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">2</div>
                <div class="technique-header">
                    <div class="technique-title">The 11 Trick</div>
                    <div class="technique-subtitle">Multiply by 11 in seconds</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">THE PATTERN</div>
                        <div class="rule-content">Split digits, add middle, keep outer digits</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 24 × 11</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Split: 2 _ 4</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">Add middle: 2 + 4 = 6</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Put together: 2-6-4</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Answer: <span class="highlight">264</span></div>
                        </div>
                    </div>
                    
                    <div class="example-grid">
                        <div class="example-box">
                            <div class="example-label">Example 2</div>
                            <div class="example-work">
                                52 × 11<br>
                                5_(5+2)_2<br>
                                = <span class="highlight">572</span>
                            </div>
                        </div>
                        <div class="example-box">
                            <div class="example-label">Example 3</div>
                            <div class="example-work">
                                73 × 11<br>
                                7_(7+3)_3<br>
                                = <span class="highlight">803</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">⚠️</div>
                        <div class="tip-content">
                            If middle sum ≥ 10, carry the 1 to the left digit.<br>
                            Example: 67 × 11 → 6_(6+7)_7 → 6_13_7 → <span class="highlight">737</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">3</div>
                <div class="technique-header">
                    <div class="technique-title">The 5 Second Method</div>
                    <div class="technique-subtitle">Any number times 5</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">THE TRICK</div>
                        <div class="rule-content">× 5 = Half the number, then × 10</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 24 × 5</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Half of 24 = 12</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">12 × 10 = 120</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Answer: <span class="highlight">120</span></div>
                        </div>
                    </div>
                    
                    <div class="example-grid">
                        <div class="example-box">
                            <div class="example-label">Even Numbers</div>
                            <div class="example-work">
                                48 × 5<br>
                                Half: 24<br>
                                × 10: <span class="highlight">240</span>
                            </div>
                        </div>
                        <div class="example-box">
                            <div class="example-label">Odd Numbers</div>
                            <div class="example-work">
                                37 × 5<br>
                                Half: 18.5<br>
                                × 10: <span class="highlight">185</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 PRACTICE PROBLEMS</div>
                        <div class="practice-content">
                            16 × 5 = ? (Half: 8, × 10 = 80)<br>
                            66 × 5 = ? (Half: 33, × 10 = 330)<br>
                            43 × 5 = ? (Half: 21.5, × 10 = 215)
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">4</div>
                <div class="technique-header">
                    <div class="technique-title">Doubling Method</div>
                    <div class="technique-subtitle">Break into powers of 2</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">WHEN TO USE</div>
                        <div class="rule-content">Great for multiplying by 4, 8, 16, or any power of 2</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 16 × 7</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">Break 7 into powers of 2: 4 + 2 + 1</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">16 × 4 = 64 (double 16 twice)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">16 × 2 = 32 (double 16 once)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">16 × 1 = 16</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">5</div>
                            <div class="step-text">Add: 64 + 32 + 16 = <span class="highlight">112</span></div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">⚡</div>
                        <div class="tip-content">
                            Doubling is fast! Just keep doubling: 16 → 32 → 64 → 128...
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">5</div>
                <div class="technique-header">
                    <div class="technique-title">Square Numbers Near 50</div>
                    <div class="technique-subtitle">Advanced pattern for squares</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">THE FORMULA</div>
                        <div class="rule-content">(50+n)² = 25 | (50-n) | n²</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 52²</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">n = 2 (since 52 = 50+2)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">First part: 25</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Middle: 50-2 = 04</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Last: 2² = 04</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">5</div>
                            <div class="step-text">Combine: 25-04-04 = <span class="highlight">2704</span></div>
                        </div>
                    </div>
                    
                    <div class="example-grid">
                        <div class="example-box">
                            <div class="example-label">48²</div>
                            <div class="example-work">
                                n = -2 (50-2)<br>
                                25 | 04 | 04<br>
                                = <span class="highlight">2304</span>
                            </div>
                        </div>
                        <div class="example-box">
                            <div class="example-label">55²</div>
                            <div class="example-work">
                                n = 5 (50+5)<br>
                                25 | 25 | 25<br>
                                = <span class="highlight">3025</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 25px;">
                <button class="menu-btn" onclick="showLearnPage()">⬅ LEARNING CENTER</button>
                <button class="menu-btn secondary" onclick="showMathSettings()">🎮 PRACTICE MULTIPLICATION</button>
            </div>
        </div>
    `;
}

function showDivisionLearning() {
    menuContent.innerHTML = `
        <div class="learn-page">
            <div class="learn-header">
                <h3 style="font-size: 18px; color: #ffd700; margin-bottom: 5px;">➗ DIVISION SHORTCUTS</h3>
                <p style="font-size: 9px; color: #a0aec0; margin-bottom: 20px;">Master quick division techniques</p>
            </div>

            <div class="technique-section">
                <div class="technique-number">1</div>
                <div class="technique-header">
                    <div class="technique-title">Divisibility Rules</div>
                    <div class="technique-subtitle">Instant checks before dividing</div>
                </div>
                <div class="technique-body">
                    <div class="divisibility-grid">
                        <div class="divisibility-box">
                            <div class="div-num">÷2</div>
                            <div class="div-rule">Last digit is even</div>
                            <div class="div-example">124 ✓ (ends in 4)</div>
                        </div>
                        <div class="divisibility-box">
                            <div class="div-num">÷3</div>
                            <div class="div-rule">Sum of digits ÷ by 3</div>
                            <div class="div-example">123 ✓ (1+2+3=6)</div>
                        </div>
                        <div class="divisibility-box">
                            <div class="div-num">÷4</div>
                            <div class="div-rule">Last 2 digits ÷ by 4</div>
                            <div class="div-example">516 ✓ (16÷4=4)</div>
                        </div>
                        <div class="divisibility-box">
                            <div class="div-num">÷5</div>
                            <div class="div-rule">Ends in 0 or 5</div>
                            <div class="div-example">235 ✓, 340 ✓</div>
                        </div>
                        <div class="divisibility-box">
                            <div class="div-num">÷6</div>
                            <div class="div-rule">Even AND ÷ by 3</div>
                            <div class="div-example">234 ✓ (even, 2+3+4=9)</div>
                        </div>
                        <div class="divisibility-box">
                            <div class="div-num">÷8</div>
                            <div class="div-rule">Last 3 digits ÷ by 8</div>
                            <div class="div-example">1024 ✓ (024÷8=3)</div>
                        </div>
                        <div class="divisibility-box">
                            <div class="div-num">÷9</div>
                            <div class="div-rule">Sum of digits ÷ by 9</div>
                            <div class="div-example">729 ✓ (7+2+9=18)</div>
                        </div>
                        <div class="divisibility-box">
                            <div class="div-num">÷10</div>
                            <div class="div-rule">Ends in 0</div>
                            <div class="div-example">450 ✓, 780 ✓</div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 TEST YOUR SKILLS</div>
                        <div class="practice-content">
                            Is 246 divisible by 3? (2+4+6=12, 12÷3=4 ✓)<br>
                            Is 128 divisible by 4? (Last 2: 28÷4=7 ✓)<br>
                            Is 567 divisible by 9? (5+6+7=18, 18÷9=2 ✓)
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">2</div>
                <div class="technique-header">
                    <div class="technique-title">Halving Method</div>
                    <div class="technique-subtitle">Divide by repeated halving</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">PERFECT FOR</div>
                        <div class="rule-content">Dividing by 4, 8, 16, or any power of 2</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 84 ÷ 4</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">84 ÷ 2 = 42 (first half)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">42 ÷ 2 = 21 (second half)</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Answer: <span class="highlight">21</span></div>
                        </div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 128 ÷ 8</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">128 ÷ 2 = 64</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">64 ÷ 2 = 32</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">32 ÷ 2 = 16</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">4</div>
                            <div class="step-text">Answer: <span class="highlight">16</span></div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">💡</div>
                        <div class="tip-content">
                            Count the halvings: 4 = 2 halvings, 8 = 3 halvings, 16 = 4 halvings
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">3</div>
                <div class="technique-header">
                    <div class="technique-title">Multiply to Divide</div>
                    <div class="technique-subtitle">Convert division to easier operations</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">÷5 SHORTCUT</div>
                        <div class="rule-content">× 2, then ÷ 10</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 85 ÷ 5</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">85 × 2 = 170</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">170 ÷ 10 = 17</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Answer: <span class="highlight">17</span></div>
                        </div>
                    </div>
                    
                    <div class="rule-box">
                        <div class="rule-label">÷25 SHORTCUT</div>
                        <div class="rule-content">× 4, then ÷ 100</div>
                    </div>
                    
                    <div class="step-by-step">
                        <div class="step-header">EXAMPLE: 175 ÷ 25</div>
                        <div class="step-item">
                            <div class="step-num">1</div>
                            <div class="step-text">175 × 4 = 700</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">2</div>
                            <div class="step-text">700 ÷ 100 = 7</div>
                        </div>
                        <div class="step-item">
                            <div class="step-num">3</div>
                            <div class="step-text">Answer: <span class="highlight">7</span></div>
                        </div>
                    </div>
                    
                    <div class="shortcut-grid">
                        <div class="shortcut-box">
                            <div class="shortcut-label">÷5</div>
                            <div class="shortcut-method">×2 then ÷10</div>
                        </div>
                        <div class="shortcut-box">
                            <div class="shortcut-label">÷25</div>
                            <div class="shortcut-method">×4 then ÷100</div>
                        </div>
                        <div class="shortcut-box">
                            <div class="shortcut-label">÷50</div>
                            <div class="shortcut-method">×2 then ÷100</div>
                        </div>
                    </div>
                    
                    <div class="practice-box">
                        <div class="practice-label">🎯 PRACTICE PROBLEMS</div>
                        <div class="practice-content">
                            95 ÷ 5 = ? (95×2=190, 190÷10=19)<br>
                            300 ÷ 25 = ? (300×4=1200, 1200÷100=12)<br>
                            450 ÷ 50 = ? (450×2=900, 900÷100=9)
                        </div>
                    </div>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 25px;">
                <button class="menu-btn" onclick="showLearnPage()">⬅ LEARNING CENTER</button>
                <button class="menu-btn secondary" onclick="showMathSettings()">🎮 PRACTICE DIVISION</button>
            </div>
        </div>
    `;
}

function showSpeedTipsLearning() {
    menuContent.innerHTML = `
        <div class="learn-page">
            <div class="learn-header">
                <h3 style="font-size: 18px; color: #ffd700; margin-bottom: 5px;">⚡ SPEED CALCULATION TIPS</h3>
                <p style="font-size: 9px; color: #a0aec0; margin-bottom: 20px;">Pro strategies for lightning-fast mental math</p>
            </div>

            <div class="technique-section">
                <div class="technique-number">1</div>
                <div class="technique-header">
                    <div class="technique-title">Always Estimate First</div>
                    <div class="technique-subtitle">Build number sense and catch errors</div>
                </div>
                <div class="technique-body">
                    <div class="rule-box">
                        <div class="rule-label">WHY IT WORKS</div>
                        <div class="rule-content">Your brain can estimate faster than it can calculate precisely</div>
                    </div>
                    
                    <div class="example-grid">
                        <div class="example-box">
                            <div class="example-label">Multiplication</div>
                            <div class="example-work">
                                47 × 23<br>
                                Estimate: 50 × 20 = 1000<br>
                                Actual: ~1081<br>
                                <span class="highlight">Close enough to verify!</span>
                            </div>
                        </div>
                        <div class="example-box">
                            <div class="example-label">Addition</div>
                            <div class="example-work">
                                387 + 542<br>
                                Estimate: 400 + 500 = 900<br>
                                Actual: ~929<br>
                                <span class="highlight">Instantly know ballpark!</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">⚡</div>
                        <div class="tip-content">
                            If your answer is way off from the estimate, you made a mistake!
                            Estimation is your error-checking system.
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">2</div>
                <div class="technique-header">
                    <div class="technique-title">Work Left-to-Right</div>
                    <div class="technique-subtitle">Process the most significant digits first</div>
                </div>
                <div class="technique-body">
                    <div class="comparison-grid">
                        <div class="comparison-box wrong">
                            <div class="comparison-label">❌ SCHOOL METHOD</div>
                            <div class="comparison-content">
                                347 + 256<br>
                                Start right: 7+6=13<br>
                                Carry the 1...<br>
                                4+5+1=10...<br>
                                Wait for final answer
                            </div>
                        </div>
                        <div class="comparison-box right">
                            <div class="comparison-label">✅ MENTAL MATH</div>
                            <div class="comparison-content">
                                347 + 256<br>
                                300+200=500 (know answer is ~500+)<br>
                                40+50=90 (now ~590+)<br>
                                7+6=13 (final: 603)<br>
                                <span class="highlight">Know ballpark immediately!</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="benefits-box">
                        <div class="benefits-header">WHY LEFT-TO-RIGHT IS BETTER</div>
                        <div class="benefits-list">
                            ✓ Get approximate answer instantly<br>
                            ✓ More natural for the brain<br>
                            ✓ Better for estimation<br>
                            ✓ Easier to track progress<br>
                            ✓ Less likely to make errors
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">3</div>
                <div class="technique-header">
                    <div class="technique-title">Practice Daily in Real Life</div>
                    <div class="technique-subtitle">Turn everyday situations into training</div>
                </div>
                <div class="technique-body">
                    <div class="daily-grid">
                        <div class="daily-box">
                            <div class="daily-icon">🚗</div>
                            <div class="daily-title">License Plates</div>
                            <div class="daily-desc">
                                See: ABC 457<br>
                                Practice: 4+5+7=16, 4×5×7=140
                            </div>
                        </div>
                        <div class="daily-box">
                            <div class="daily-icon">🛒</div>
                            <div class="daily-title">Shopping</div>
                            <div class="daily-desc">
                                Running total in your head<br>
                                Calculate discounts: 20% off $45 = $9
                            </div>
                        </div>
                        <div class="daily-box">
                            <div class="daily-icon">🧾</div>
                            <div class="daily-title">Receipts</div>
                            <div class="daily-desc">
                                Verify totals mentally<br>
                                Calculate tax: 8% of $50 = $4
                            </div>
                        </div>
                        <div class="daily-box">
                            <div class="daily-icon">🕐</div>
                            <div class="daily-title">Time</div>
                            <div class="daily-desc">
                                24hr → 12hr conversions<br>
                                Calculate durations: 2:15 PM - 9:30 AM
                            </div>
                        </div>
                        <div class="daily-box">
                            <div class="daily-icon">💵</div>
                            <div class="daily-title">Tips</div>
                            <div class="daily-desc">
                                15% tip: Move decimal left, add half<br>
                                $42 → $4.20 + $2.10 = $6.30
                            </div>
                        </div>
                        <div class="daily-box">
                            <div class="daily-icon">📊</div>
                            <div class="daily-title">Percentages</div>
                            <div class="daily-desc">
                                What % is 7 of 28?<br>
                                7/28 = 1/4 = 25%
                            </div>
                        </div>
                    </div>
                    
                    <div class="challenge-box">
                        <div class="challenge-header">🏆 10-MINUTE DAILY CHALLENGE</div>
                        <div class="challenge-content">
                            <strong>Monday:</strong> Practice addition with receipts<br>
                            <strong>Tuesday:</strong> Subtraction with time calculations<br>
                            <strong>Wednesday:</strong> Multiplication with license plates<br>
                            <strong>Thursday:</strong> Division with percentages<br>
                            <strong>Friday:</strong> Mixed practice with shopping<br>
                            <strong>Weekend:</strong> Play this game for 15 minutes!<br><br>
                            <span class="highlight">Just 10 minutes daily = Massive improvement!</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">4</div>
                <div class="technique-header">
                    <div class="technique-title">Use Patterns and Shortcuts</div>
                    <div class="technique-subtitle">Recognize common number patterns</div>
                </div>
                <div class="technique-body">
                    <div class="pattern-grid">
                        <div class="pattern-box">
                            <div class="pattern-label">Squaring 5s</div>
                            <div class="pattern-rule">X5² = X(X+1) | 25</div>
                            <div class="pattern-example">
                                25² = 2×3 | 25 = <span class="highlight">625</span><br>
                                45² = 4×5 | 25 = <span class="highlight">2025</span>
                            </div>
                        </div>
                        <div class="pattern-box">
                            <div class="pattern-label">Percentages</div>
                            <div class="pattern-rule">Reverse for easier calc</div>
                            <div class="pattern-example">
                                4% of 75 = 75% of 4<br>
                                = 0.75 × 4 = <span class="highlight">3</span>
                            </div>
                        </div>
                        <div class="pattern-box">
                            <div class="pattern-label">Difference of Squares</div>
                            <div class="pattern-rule">a² - b² = (a+b)(a-b)</div>
                            <div class="pattern-example">
                                16² - 14² = (30)(2)<br>
                                = <span class="highlight">60</span>
                            </div>
                        </div>
                        <div class="pattern-box">
                            <div class="pattern-label">Complementary %</div>
                            <div class="pattern-rule">Use what's left</div>
                            <div class="pattern-example">
                                35% of 80<br>
                                = 100% - 65% = 80 - 52<br>
                                = <span class="highlight">28</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="technique-section">
                <div class="technique-number">5</div>
                <div class="technique-header">
                    <div class="technique-title">Build Your Math Vocabulary</div>
                    <div class="technique-subtitle">Know these number facts cold</div>
                </div>
                <div class="technique-body">
                    <div class="vocab-grid">
                        <div class="vocab-box">
                            <div class="vocab-title">Squares (1-20)</div>
                            <div class="vocab-content">
                                1²=1, 2²=4, 3²=9, 4²=16<br>
                                5²=25, 6²=36, 7²=49, 8²=64<br>
                                9²=81, 10²=100, 11²=121<br>
                                12²=144, 15²=225, 20²=400
                            </div>
                        </div>
                        <div class="vocab-box">
                            <div class="vocab-title">Powers of 2</div>
                            <div class="vocab-content">
                                2¹=2, 2²=4, 2³=8, 2⁴=16<br>
                                2⁵=32, 2⁶=64, 2⁷=128<br>
                                2⁸=256, 2⁹=512, 2¹⁰=1024
                            </div>
                        </div>
                        <div class="vocab-box">
                            <div class="vocab-title">Common Fractions</div>
                            <div class="vocab-content">
                                1/2=50%, 1/3≈33%, 1/4=25%<br>
                                1/5=20%, 1/8=12.5%<br>
                                3/4=75%, 2/3≈67%
                            </div>
                        </div>
                        <div class="vocab-box">
                            <div class="vocab-title">Useful Facts</div>
                            <div class="vocab-content">
                                12×12=144, 25×4=100<br>
                                15×15=225, 9×11=99<br>
                                7×7=49, 8×125=1000
                            </div>
                        </div>
                    </div>
                    
                    <div class="tip-box">
                        <div class="tip-icon">🎯</div>
                        <div class="tip-content">
                            Memorize these cold. They're the building blocks for everything else!
                            Spend 5 minutes daily reviewing until automatic.
                        </div>
                    </div>
                </div>
            </div>

            <div class="menu-buttons" style="margin-top: 25px;">
                <button class="menu-btn" onclick="showLearnPage()">⬅ LEARNING CENTER</button>
                <button class="menu-btn secondary" onclick="showModeSelection()">🎮 START PRACTICING</button>
            </div>
        </div>
    `;
}
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
            <h3 style="font-size: 20px; color: #ffd700; text-align: center; margin-bottom: 20px;">📚 MASTER MENTAL MATH</h3>
            
            <div class="learn-section">
                <h3>🔤 ALPHABET MASTERY</h3>
                
                <div class="trick-box">
                    <div class="trick-title">1. The Opposite Letter Formula</div>
                    <div class="trick-content">
                        <strong>Rule: Position + Opposite = 27</strong><br>
                        A(1) + Z(26) = 27, B(2) + Y(25) = 27<br><br>
                        <strong>Quick Find:</strong> To find opposite of N(14):<br>
                        27 - 14 = 13 → M is opposite!<br><br>
                        <strong>Practice:</strong> G(7) opposite? 27-7=20 → T
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">2. The Anchor Method</div>
                    <div class="trick-content">
                        <strong>Memorize these anchors:</strong><br>
                        A=1, E=5, J=10, O=15, T=20, Z=26<br><br>
                        <strong>Count from nearest:</strong><br>
                        What's H? Nearest is E(5)...<br>
                        F(6), G(7), H(8) ✓<br><br>
                        What's R? Nearest is T(20)...<br>
                        S(19), R(18) ✓
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">3. Chunk the Alphabet</div>
                    <div class="trick-content">
                        <strong>First Quarter (1-7):</strong> ABCDEFG<br>
                        <strong>Second Quarter (8-13):</strong> HIJKLM<br>
                        <strong>Third Quarter (14-19):</strong> NOPQRS<br>
                        <strong>Fourth Quarter (20-26):</strong> TUVWXYZ<br><br>
                        Know the chunk, count within it!
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">4. Multiples of 5 Trick</div>
                    <div class="trick-content">
                        <strong>EJOTY = 5, 10, 15, 20, 25</strong><br>
                        Remember: "Every Jolly Old Tiger Yawns"<br><br>
                        E(5), J(10), O(15), T(20), Y(25)<br>
                        These are your stepping stones!
                    </div>
                </div>
            </div>

            <div class="learn-section">
                <h3>➕ ADDITION MASTERY</h3>
                
                <div class="trick-box">
                    <div class="trick-title">1. Make 10s First</div>
                    <div class="trick-content">
                        <strong>Break numbers to make 10:</strong><br>
                        8 + 7 = ?<br>
                        Think: 8 + (2+5) = (8+2) + 5 = 10 + 5 = 15<br><br>
                        67 + 48 = ?<br>
                        67 + 3 = 70, then 70 + 45 = 115<br><br>
                        <strong>Always round to 10s, 100s!</strong>
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">2. Left-to-Right Addition</div>
                    <div class="trick-content">
                        <strong>Add biggest digits first:</strong><br>
                        47 + 36 = ?<br>
                        40 + 30 = 70<br>
                        7 + 6 = 13<br>
                        70 + 13 = 83 ✓<br><br>
                        <strong>Faster than right-to-left!</strong>
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">3. Compensation Method</div>
                    <div class="trick-content">
                        <strong>Round up, then subtract:</strong><br>
                        49 + 37 = ?<br>
                        Think: 50 + 37 = 87<br>
                        Then: 87 - 1 = 86 ✓<br><br>
                        298 + 156 = ?<br>
                        300 + 156 = 456, then 456 - 2 = 454
                    </div>
                </div>
            </div>

            <div class="learn-section">
                <h3>➖ SUBTRACTION MASTERY</h3>
                
                <div class="trick-box">
                    <div class="trick-title">1. Add-Up Method</div>
                    <div class="trick-content">
                        <strong>Count up instead of down:</strong><br>
                        83 - 57 = ?<br>
                        57 → 60 (+3)<br>
                        60 → 80 (+20)<br>
                        80 → 83 (+3)<br>
                        Total: 3 + 20 + 3 = 26 ✓
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">2. Equal Addition</div>
                    <div class="trick-content">
                        <strong>Add same to both numbers:</strong><br>
                        62 - 38 = ?<br>
                        Add 2 to both: (62+2) - (38+2)<br>
                        = 64 - 40 = 24 ✓<br><br>
                        <strong>Make the subtractor easy!</strong>
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">3. Break It Down</div>
                    <div class="trick-content">
                        <strong>Subtract in parts:</strong><br>
                        95 - 27 = ?<br>
                        95 - 20 = 75<br>
                        75 - 7 = 68 ✓<br><br>
                        Break into 10s and 1s!
                    </div>
                </div>
            </div>

            <div class="learn-section">
                <h3>✖️ MULTIPLICATION MASTERY</h3>
                
                <div class="trick-box">
                    <div class="trick-title">1. The 9s Finger Trick</div>
                    <div class="trick-content">
                        <strong>9 × 7 = ?</strong><br>
                        Hold up 10 fingers<br>
                        Put down 7th finger<br>
                        Left side: 6 fingers (tens)<br>
                        Right side: 3 fingers (ones)<br>
                        Answer: 63 ✓
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">2. Doubling Method</div>
                    <div class="trick-content">
                        <strong>Use repeated doubling:</strong><br>
                        16 × 7 = ?<br>
                        16 × 4 = 64 (double 16 twice)<br>
                        16 × 2 = 32<br>
                        16 × 1 = 16<br>
                        64 + 32 + 16 = 112 ✓<br><br>
                        <strong>Break into powers of 2!</strong>
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">3. The 11 Trick</div>
                    <div class="trick-content">
                        <strong>Two-digit × 11:</strong><br>
                        24 × 11 = ?<br>
                        Split: 2_4<br>
                        Middle: 2+4 = 6<br>
                        Answer: 264 ✓<br><br>
                        73 × 11 = 7_(7+3)_3 = 803 ✓
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">4. Square Numbers Near 50</div>
                    <div class="trick-content">
                        <strong>Pattern for 50±n:</strong><br>
                        52² = 25_(50-2)_(2²) = 2704<br>
                        48² = 25_(50-2)_(2²) = 2304<br><br>
                        <strong>Or use (50+n)(50-n):</strong><br>
                        52 × 48 = (50+2)(50-2) = 2500-4 = 2496
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">5. The 5 Second Method</div>
                    <div class="trick-content">
                        <strong>Any number × 5:</strong><br>
                        Half it, then × 10<br>
                        24 × 5 = (24÷2) × 10 = 12 × 10 = 120<br><br>
                        <strong>Or add half to the number:</strong><br>
                        20 × 5 = 20 + 10 + 10 + 10 + 10 = 100<br>
                        Think: 20 × 5 = (20 × 10) ÷ 2 = 100
                    </div>
                </div>
            </div>

            <div class="learn-section">
                <h3>➗ DIVISION MASTERY</h3>
                
                <div class="trick-box">
                    <div class="trick-title">1. Divisibility Rules</div>
                    <div class="trick-content">
                        <strong>Quick checks:</strong><br>
                        ÷2: Last digit even<br>
                        ÷3: Sum of digits ÷ by 3<br>
                        ÷4: Last 2 digits ÷ by 4<br>
                        ÷5: Ends in 0 or 5<br>
                        ÷6: Even AND ÷ by 3<br>
                        ÷8: Last 3 digits ÷ by 8<br>
                        ÷9: Sum of digits ÷ by 9<br>
                        ÷10: Ends in 0
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">2. Halving Method</div>
                    <div class="trick-content">
                        <strong>Divide by halving:</strong><br>
                        84 ÷ 4 = ?<br>
                        84 ÷ 2 = 42<br>
                        42 ÷ 2 = 21 ✓<br><br>
                        <strong>Great for 4, 8, 16!</strong>
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">3. Multiply to Divide</div>
                    <div class="trick-content">
                        <strong>÷5 = ×2, then ÷10:</strong><br>
                        85 ÷ 5 = (85 × 2) ÷ 10 = 170 ÷ 10 = 17<br><br>
                        <strong>÷25 = ×4, then ÷100:</strong><br>
                        175 ÷ 25 = (175 × 4) ÷ 100 = 700 ÷ 100 = 7
                    </div>
                </div>
            </div>

            <div class="learn-section">
                <h3>⚡ SPEED CALCULATION TIPS</h3>
                
                <div class="trick-box">
                    <div class="trick-title">1. Estimate First</div>
                    <div class="trick-content">
                        <strong>Round to nearest 10/100:</strong><br>
                        47 × 23 ≈ 50 × 20 = 1000<br>
                        Actual will be close!<br><br>
                        Helps catch mistakes instantly.
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">2. Work Left-to-Right</div>
                    <div class="trick-content">
                        <strong>Process big numbers first:</strong><br>
                        Most significant → Least significant<br>
                        Gives you answer faster<br>
                        More natural for the brain!
                    </div>
                </div>

                <div class="trick-box">
                    <div class="trick-title">3. Practice Daily</div>
                    <div class="trick-content">
                        <strong>10 minutes = Big improvement</strong><br>
                        • License plates: Add/multiply digits<br>
                        • Receipts: Calculate totals mentally<br>
                        • Clock: 24-hour → 12-hour conversions<br>
                        • Prices: Calculate discounts (20% off)<br><br>
                        <strong>Use this game daily!</strong>
                    </div>
                </div>
            </div>

            <div class="learn-section">
                <h3>📋 Quick Reference Chart</h3>
                <div class="alphabet-grid">${alphabetItems}</div>
            </div>

            <div class="menu-buttons" style="margin-top: 20px;">
                <button class="menu-btn" onclick="showStartScreen()">⬅ BACK</button>
                <button class="menu-btn secondary" onclick="showModeSelection()">🎮 PRACTICE NOW</button>
            </div>
        </div>
    `;


function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
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

function showModeSelection() {
    menuContent.innerHTML = `
        <div class="mode-selection">
            <div class="menu-title">SELECT MODE</div>
            <div class="mode-grid">
                <div class="game-mode-card" onclick="showAlphabetSettings()">
                    <div class="game-mode-title">🔤 ALPHABET MODE</div>
                    <div class="game-mode-desc">
                        Master letter positions, opposites, and letter math!<br>
                        Includes: Position, Opposite, Letter Math & Mixed
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
        
        // If mixed mode, randomly select a type
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
                if (gameMode === 'alphabet' && alphabetSettings.type === 'alphabetmath') {
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
                if (gameMode === 'alphabet' && alphabetSettings.type === 'alphabetmath') {
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
    if (gameMode === 'alphabet') {
        // Determine actual question type (important for mixed mode)
        const isPositionQuestion = currentPosition && currentLetter && alphabet.indexOf(currentLetter) === currentPosition - 1;
        const isOppositeQuestion = currentLetter && getOppositeLetter(currentLetter);
        
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
        // Determine actual question type (important for mixed mode)
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
window.showAlphabetSettings = showAlphabetSettings;
window.setAlphabetType = setAlphabetType;
window.showAlphabetLearning = showAlphabetLearning;
window.showAdditionLearning = showAdditionLearning;
window.showSubtractionLearning = showSubtractionLearning;
window.showMultiplicationLearning = showMultiplicationLearning;
window.showDivisionLearning = showDivisionLearning;
window.showSpeedTipsLearning = showSpeedTipsLearning;