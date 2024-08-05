let gameState;
let currentPlayer;
let mode = 'singleplayer';
let difficulty = 'easy';
let boardSize = 3;
let theme = 'classic';
let soundEnabled = true;
const cells = [];
const winningConditions = [];

const board = document.getElementById('board');
const turnInfo = document.getElementById('turn-info');
const resetBtn = document.getElementById('reset-btn');
const modeSelect = document.getElementById('mode');
const difficultyLevel = document.getElementById('difficulty-level');
const boardSizeSelect = document.getElementById('board-size');
const themeSelect = document.getElementById('theme');
const soundCheckbox = document.getElementById('sound');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeToggle.addEventListener('click', toggleTheme);

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.textContent = '🌜';
    } else {
        themeIcon.textContent = '🌞';
    }
}

function initializeGame() {
    gameState = Array(boardSize * boardSize).fill('');
    currentPlayer = 'X';
    updateTurnInfo();
    createBoard();
    resetBtn.addEventListener('click', initializeGame);
    modeSelect.addEventListener('change', handleModeChange);
    difficultyLevel.addEventListener('change', handleDifficultyChange);
    boardSizeSelect.addEventListener('change', handleBoardSizeChange);
    themeSelect.addEventListener('change', handleThemeChange);
    soundCheckbox.addEventListener('change', handleSoundChange);
}

function createBoard() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
        cells[i] = cell;
    }
    calculateWinningConditions();
}

function calculateWinningConditions() {
    winningConditions.length = 0;

    // Rows
    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            row.push(i * boardSize + j);
        }
        winningConditions.push(row);
    }

    // Columns
    for (let i = 0; i < boardSize; i++) {
        const col = [];
        for (let j = 0; j < boardSize; j++) {
            col.push(j * boardSize + i);
        }
        winningConditions.push(col);
    }

    // Diagonal (top-left to bottom-right)
    const diag1 = [];
    for (let i = 0; i < boardSize; i++) {
        diag1.push(i * boardSize + i);
    }
    winningConditions.push(diag1);

    // Diagonal (top-right to bottom-left)
    const diag2 = [];
    for (let i = 0; i < boardSize; i++) {
        diag2.push(i * boardSize + (boardSize - 1 - i));
    }
    winningConditions.push(diag2);
}

function handleCellClick(index) {
    if (gameState[index] !== '' || checkWinner()) return;

    gameState[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    cells[index].classList.add(currentPlayer.toLowerCase()); // Add class 'x' or 'o'

    if (soundEnabled) playSound();

    const winner = checkWinner();
    if (winner) {
        highlightWinningCells(winner);
        turnInfo.textContent = `${currentPlayer} Wins!`;
    } else if (!gameState.includes('')) {
        turnInfo.textContent = 'It\'s a Tie!';
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnInfo();
        if (mode === 'singleplayer' && currentPlayer === 'O') {
            aiMove();
        }
    }
}


function aiMove() {
    let index;
    if (difficulty === 'easy') {
        index = getRandomMove();
    } else if (difficulty === 'medium') {
        index = Math.random() < 0.5 ? getRandomMove() : getBestMove();
    } else {
        index = getBestMove();
    }
    handleCellClick(index);
}

function getRandomMove() {
    const availableMoves = gameState.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

function minimax(state, depth, isMaximizing) {
    let scores = { 'O': 1, 'X': -1, 'tie': 0 };
    let result = checkWinner();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === '') {
                state[i] = 'O';
                let score = minimax(state, depth + 1, false);
                state[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === '') {
                state[i] = 'X';
                let score = minimax(state, depth + 1, true);
                state[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    for (const condition of winningConditions) {
        const [a, b, c, d, e] = condition;
        if (gameState[a] && condition.every(index => gameState[index] === gameState[a])) {
            return condition;
        }
    }
    return null;
}

function highlightWinningCells(winningCells) {
    winningCells.forEach(index => {
        cells[index].classList.add('winner');
    });
}

function updateTurnInfo() {
    turnInfo.textContent = `${currentPlayer}'s Turn`;
}

function playSound() {
    const audio = new Audio('click-sound.mp3');
    audio.play();
}

function handleModeChange(event) {
    mode = event.target.value;
    initializeGame();
}

function handleDifficultyChange(event) {
    difficulty = event.target.value;
    initializeGame();
}

function handleBoardSizeChange(event) {
    boardSize = parseInt(event.target.value);
    initializeGame();
}

function handleThemeChange(event) {
    theme = event.target.value;
    initializeGame();
}

function handleSoundChange(event) {
    soundEnabled = event.target.checked;
}

initializeGame();
