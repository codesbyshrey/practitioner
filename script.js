// ============================================
// GAME STATE VARIABLES
// ============================================
let cards = [];              // Array of all card objects
let flippedCards = [];       // Array of currently flipped cards (max 2)
let matchedPairs = 0;        // Count of matched pairs found
let moves = 0;               // Number of moves (pairs flipped)
let timer = 0;               // Elapsed time in seconds
let timerInterval = null;    // Interval ID for timer
let gameStarted = false;      // Whether game has started (first card flipped)
let gameOver = false;        // Whether game is complete
let isProcessing = false;    // Flag to prevent clicks during match checking
let currentDifficulty = 'medium'; // Current difficulty level
let timeLimit = null;        // Time limit in seconds (null = no limit)

// Card icons/emojis - Animal emojis
const allCardIcons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'];
let cardIcons = [];          // Will be set based on difficulty

// ============================================
// DIFFICULTY SYSTEM
// ============================================

/**
 * Difficulty configurations
 */
const difficultyConfig = {
    easy: {
        gridSize: 4,
        iconCount: 8,
        timeLimit: null, // No time limit for easy
        name: 'Easy'
    },
    medium: {
        gridSize: 4,
        iconCount: 8,
        timeLimit: null, // No time limit for medium
        name: 'Medium'
    },
    hard: {
        gridSize: 6,
        iconCount: 18,
        timeLimit: null, // No time limit for hard
        name: 'Hard'
    }
};

/**
 * Gets the current difficulty configuration
 * @returns {Object} Difficulty configuration object
 */
function getDifficultyConfig() {
    return difficultyConfig[currentDifficulty];
}

/**
 * Updates the game board grid based on difficulty
 */
function updateGridLayout() {
    const config = getDifficultyConfig();
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.style.gridTemplateColumns = `repeat(${config.gridSize}, 1fr)`;
}

/**
 * Sets up card icons based on current difficulty
 */
function setupCardIcons() {
    const config = getDifficultyConfig();
    cardIcons = allCardIcons.slice(0, config.iconCount);
}

// ============================================
// 1. FUNCTION TO RANDOMLY ASSIGN CARD PAIRS
// ============================================

/**
 * Shuffles an array using Fisher-Yates algorithm
 * This ensures truly random distribution of card pairs
 * @param {Array} array - The array to shuffle
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Initializes the game by creating and randomly assigning card pairs to the grid
 * This function:
 * - Resets all game state variables
 * - Creates pairs of cards (duplicates the icon array)
 * - Shuffles the cards randomly
 * - Creates and displays card elements on the board
 */
function initGame() {
    // Setup difficulty-based configuration
    setupCardIcons();
    updateGridLayout();
    
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    gameStarted = false;
    gameOver = false;
    isProcessing = false;
    
    const config = getDifficultyConfig();
    timeLimit = config.timeLimit;
    
    // Clear timer if it's running
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Update UI to initial state
    updateTimer();
    updateMoves();
    updateScore();
    document.getElementById('gameOverModal').classList.remove('show');
    
    // Create card pairs: duplicate the icon array to get pairs
    const cardPairs = [...cardIcons, ...cardIcons];
    
    // Shuffle cards randomly using Fisher-Yates algorithm
    shuffleArray(cardPairs);
    
    // Create card elements and add to board
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    cardPairs.forEach((icon, index) => {
        const card = createCard(icon, index);
        gameBoard.appendChild(card);
        cards.push({
            element: card,
            icon: icon,
            index: index,
            isFlipped: false,
            isMatched: false
        });
    });
}

/**
 * Creates a card DOM element with front and back faces
 * @param {string} icon - The emoji/icon to display on the card
 * @param {number} index - The index of the card in the array
 * @returns {HTMLElement} The created card element
 */
function createCard(icon, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.textContent = icon;
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    card.appendChild(cardFront);
    card.appendChild(cardBack);
    
    card.addEventListener('click', () => handleCardClick(index));
    
    return card;
}

// ============================================
// 2. LOGIC TO HANDLE CARD FLIPPING AND MATCHING
// ============================================

/**
 * Handles card click events
 * - Prevents clicking if game is over, card is already flipped/matched, or 2 cards are already flipped
 * - Starts timer on first card flip
 * - Flips the card and checks for matches when 2 cards are flipped
 * @param {number} index - The index of the clicked card
 */
function handleCardClick(index) {
    // Don't allow clicks if game is over
    if (gameOver) return;
    
    // Don't allow clicks while processing a match (prevents race condition)
    if (isProcessing) return;
    
    const card = cards[index];
    
    // Don't allow clicking if card is already flipped or matched
    if (card.isFlipped || card.isMatched) return;
    
    // Don't allow clicking if two cards are already flipped (waiting for match check)
    if (flippedCards.length >= 2) return;
    
    // Start timer on first card flip (feature #4)
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Flip the card
    flipCard(card);
    
    // Add to flipped cards array
    flippedCards.push(card);
    
    // When two cards are flipped, check for match
    if (flippedCards.length === 2) {
        // Set processing flag to prevent additional clicks
        isProcessing = true;
        
        // Increment move counter (feature #5)
        moves++;
        updateMoves();
        updateScore();
        
        // Wait 1 second to show both cards before checking match
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

/**
 * Flips a card to show its front face
 * @param {Object} card - The card object to flip
 */
function flipCard(card) {
    card.isFlipped = true;
    card.element.classList.add('flipped');
    playSound('flip');
}

/**
 * Unflips a card to show its back face
 * @param {Object} card - The card object to unflip
 */
function unflipCard(card) {
    card.isFlipped = false;
    card.element.classList.remove('flipped');
}

/**
 * Checks if the two currently flipped cards match
 * - If they match: mark as matched, increment matchedPairs, check win condition
 * - If they don't match: flip both cards back
 * - Always clears the flippedCards array after checking
 * - Resets the isProcessing flag to allow new clicks
 */
function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.icon === card2.icon) {
        // Match found!
        card1.isMatched = true;
        card2.isMatched = true;
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        matchedPairs++;
        
        // Play match sound
        playSound('match');
        
        // Check win condition (feature #3)
        checkWinCondition();
    } else {
        // No match - flip cards back to hide them
        unflipCard(card1);
        unflipCard(card2);
    }
    
    // Clear flipped cards array for next turn
    flippedCards = [];
    
    // Reset processing flag to allow new card clicks
    isProcessing = false;
}

// ============================================
// 3. WIN CONDITION CHECK
// ============================================

/**
 * Checks if all pairs have been matched (win condition)
 * If all pairs are matched, ends the game
 */
function checkWinCondition() {
    // Win condition: all pairs matched (matchedPairs equals total number of unique icons)
    if (matchedPairs === cardIcons.length) {
        endGame();
    }
}

// ============================================
// 4. TIMER FUNCTIONALITY
// ============================================

/**
 * Starts the game timer
 * Timer increments every second and updates the display
 * Called automatically on the first card flip
 */
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
        updateScore();
        
        // Check time limit if set
        if (timeLimit !== null && timer >= timeLimit) {
            // Time's up - end game
            endGame(true);
        }
    }, 1000);
}

/**
 * Updates the timer display in MM:SS format
 */
function updateTimer() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeString;
}

// ============================================
// 5. MOVE COUNTER
// ============================================

/**
 * Updates the move counter display
 * Moves increment after each pair of cards is flipped (feature #5)
 */
function updateMoves() {
    document.getElementById('moves').textContent = moves;
}

// ============================================
// SCORING SYSTEM
// ============================================

/**
 * Calculates and updates the score display
 * Score formula: (matches * 1000) - (time * 10) - (moves * 5)
 * Higher score is better
 */
function updateScore() {
    if (moves === 0 || timer === 0) {
        document.getElementById('score').textContent = '0';
        return;
    }
    
    // Score calculation: Higher is better
    // Base score: 1000 points per match
    // Penalties: -10 points per second, -5 points per move
    // Formula: (matches * 1000) - (time * 10) - (moves * 5)
    const baseScore = matchedPairs * 1000;
    const timePenalty = timer * 10;
    const movePenalty = moves * 5;
    const score = Math.max(0, baseScore - timePenalty - movePenalty);
    
    document.getElementById('score').textContent = score.toLocaleString();
}

/**
 * Calculates the final score for display in game over modal
 * @returns {number} The final score
 */
function calculateFinalScore() {
    if (moves === 0 || timer === 0) return 0;
    
    const baseScore = matchedPairs * 1000;
    const timePenalty = timer * 10;
    const movePenalty = moves * 5;
    return Math.max(0, baseScore - timePenalty - movePenalty);
}

// ============================================
// GAME OVER & RESET
// ============================================

/**
 * Ends the game and displays the game over modal
 * Stops the timer and shows final statistics
 * @param {boolean} timeUp - Whether the game ended due to time limit
 */
function endGame(timeUp = false) {
    gameOver = true;
    
    // Stop the timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Calculate final score
    const finalScore = calculateFinalScore();
    
    // Play completion sound
    playSound('complete');
    
    // Save to leaderboard if score is valid
    if (finalScore > 0 && !timeUp) {
        saveToLeaderboard(finalScore);
    }
    
    // Format time for display
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update modal with final stats
    document.getElementById('finalTime').textContent = timeString;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalScore').textContent = finalScore.toLocaleString();
    document.getElementById('gameOverModal').classList.add('show');
    
    // Update leaderboard display
    updateLeaderboard();
}

/**
 * Resets the game to initial state
 * Called when "New Game" or "Play Again" is clicked
 */
function resetGame() {
    initGame();
}

// ============================================
// SOUND EFFECTS
// ============================================

// Audio context for sound effects (created on first use)
let audioContext = null;

/**
 * Gets or creates the audio context
 * @returns {AudioContext} The audio context
 */
function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            return null;
        }
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

/**
 * Creates a sound using Web Audio API
 * @param {string} type - Type of sound: 'flip', 'match', or 'complete'
 */
function playSound(type) {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
        switch(type) {
            case 'flip':
                // Short, low-pitched click sound
                const flipOsc = ctx.createOscillator();
                const flipGain = ctx.createGain();
                flipOsc.connect(flipGain);
                flipGain.connect(ctx.destination);
                flipOsc.frequency.value = 300;
                flipOsc.type = 'sine';
                flipGain.gain.setValueAtTime(0.1, ctx.currentTime);
                flipGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                flipOsc.start(ctx.currentTime);
                flipOsc.stop(ctx.currentTime + 0.1);
                break;
                
            case 'match':
                // Pleasant success sound
                const matchOsc = ctx.createOscillator();
                const matchGain = ctx.createGain();
                matchOsc.connect(matchGain);
                matchGain.connect(ctx.destination);
                matchOsc.frequency.setValueAtTime(400, ctx.currentTime);
                matchOsc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
                matchOsc.type = 'sine';
                matchGain.gain.setValueAtTime(0.2, ctx.currentTime);
                matchGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                matchOsc.start(ctx.currentTime);
                matchOsc.stop(ctx.currentTime + 0.3);
                break;
                
            case 'complete':
                // Victory fanfare
                const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
                frequencies.forEach((freq, index) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.5);
                    osc.start(ctx.currentTime + index * 0.1);
                    osc.stop(ctx.currentTime + index * 0.1 + 0.5);
                });
                break;
        }
    } catch (error) {
        // Silently fail if audio is not available
        console.log('Audio not available');
    }
}

// ============================================
// LEADERBOARD SYSTEM
// ============================================

/**
 * Gets leaderboard from localStorage
 * @returns {Array} Array of leaderboard entries
 */
function getLeaderboard() {
    const leaderboard = localStorage.getItem('memoryGameLeaderboard');
    return leaderboard ? JSON.parse(leaderboard) : [];
}

/**
 * Saves leaderboard to localStorage
 * @param {Array} leaderboard - Array of leaderboard entries
 */
function saveLeaderboard(leaderboard) {
    localStorage.setItem('memoryGameLeaderboard', JSON.stringify(leaderboard));
}

/**
 * Saves a score to the leaderboard (top 5 only)
 * @param {number} score - The score to save
 */
function saveToLeaderboard(score) {
    const leaderboard = getLeaderboard();
    const config = getDifficultyConfig();
    
    // Add new entry
    leaderboard.push({
        score: score,
        difficulty: currentDifficulty,
        difficultyName: config.name,
        moves: moves,
        time: timer,
        date: new Date().toISOString()
    });
    
    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 5
    const top5 = leaderboard.slice(0, 5);
    
    // Save to localStorage
    saveLeaderboard(top5);
}

/**
 * Updates the leaderboard display
 */
function updateLeaderboard() {
    const leaderboard = getLeaderboard();
    const leaderboardElement = document.getElementById('leaderboard');
    
    if (leaderboard.length === 0) {
        leaderboardElement.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
        return;
    }
    
    leaderboardElement.innerHTML = leaderboard.map((entry, index) => {
        const minutes = Math.floor(entry.time / 60);
        const seconds = entry.time % 60;
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        return `
            <div class="leaderboard-entry" data-rank="${index + 1}">
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-score">${entry.score.toLocaleString()}</span>
                <div class="leaderboard-details">
                    <div>${entry.difficultyName} • ${entry.moves} moves</div>
                    <div style="font-size: 0.75em;">${timeString}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// EVENT LISTENERS
// ============================================

// Reset button
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Play again button
document.getElementById('playAgainBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').classList.remove('show');
    resetGame();
});

// Difficulty selector
document.getElementById('difficulty').addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    resetGame();
    updateLeaderboard();
});

// Initialize game on page load
initGame();
updateLeaderboard();

