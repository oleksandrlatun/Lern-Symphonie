document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // 1. INITIALIZE UI ELEMENTS & STATE
    // ===================================================================
    const wordDisplay = document.getElementById('flashCardWord');
    const flashCardFront = document.getElementById('flashCardFront');
    const progressBar = document.getElementById('progressBar');
    
    const derBtn = document.getElementById('derBtn');
    const dieBtn = document.getElementById('dieBtn');
    const dasBtn = document.getElementById('dasBtn');
    const articleButtons = [derBtn, dieBtn, dasBtn];
    
    const correctCountDisplay = document.getElementById('correctCount');
    const incorrectCountDisplay = document.getElementById('incorrectCount');
    const wrongWordsContainer = document.getElementById('wrongWordsListContainer');
    const trainIncorrectBtn = document.getElementById('trainIncorrectBtn');
    const backBtn = document.getElementById('back-button');

    let allNouns = [];
    let gameNouns = [];
    let wrongWords = [];
    let currentIndex = 0;
    let correct = 0;
    let incorrect = 0;

    // ===================================================================
    // 2. CORE GAME LOGIC
    // ===================================================================

    function initializeGame() {
        const savedSet = JSON.parse(localStorage.getItem('selectedSet'));
        if (!savedSet || !savedSet.nouns || Object.keys(savedSet.nouns).length === 0) {
            wordDisplay.textContent = "Set not found or has no nouns.";
            articleButtons.forEach(btn => btn.disabled = true);
            return;
        }
        allNouns = Object.entries(savedSet.nouns);
        startGame(allNouns);
    }

    function startGame(words) {
        gameNouns = [...words];
        shuffleArray(gameNouns);
        
        currentIndex = 0;
        correct = 0;
        incorrect = 0;
        wrongWords = [];
        
        updateStats();
        displayWrongWords();
        displayNextWord();
    }

    function displayNextWord() {
        flashCardFront.classList.remove('correct', 'incorrect');
        
        if (currentIndex >= gameNouns.length) {
            endGame();
            return;
        }
        
        articleButtons.forEach(btn => btn.disabled = false);
        const [word] = gameNouns[currentIndex];
        wordDisplay.textContent = word;
        updateProgressBar();
    }

    function checkAnswer(chosenArticle) {
        articleButtons.forEach(btn => btn.disabled = true);
        
        const [word, info] = gameNouns[currentIndex];
        const correctAnswer = info.article;
        
        if (chosenArticle === correctAnswer) {
            correct++;
            flashCardFront.classList.add('correct');
        } else {
            incorrect++;
            flashCardFront.classList.add('incorrect');
            if (!wrongWords.some(([w]) => w === word)) {
                wrongWords.push([word, info]);
            }
            displayWrongWords();
        }
        
        currentIndex++;
        updateStats();
        
        setTimeout(displayNextWord, 500); // Wait 0.5s to show result
    }

    function endGame() {
        wordDisplay.textContent = "Practice finished!";
        articleButtons.forEach(btn => btn.disabled = true);
        progressBar.value = 100;
    }

    // ===================================================================
    // 3. UI & EVENT HANDLERS
    // ===================================================================

    function updateStats() {
        correctCountDisplay.textContent = correct;
        incorrectCountDisplay.textContent = incorrect;
    }

    function updateProgressBar() {
        const progress = (currentIndex / gameNouns.length) * 100;
        progressBar.value = progress;
    }

    function displayWrongWords() {
        wrongWordsContainer.parentElement.querySelector('p').style.display = wrongWords.length > 0 ? 'none' : 'block';
        wrongWordsContainer.innerHTML = '';
        wrongWords.forEach(([word, info]) => {
            const div = document.createElement('div');
            div.innerHTML = `<b>${info.article}</b> ${word}`;
            wrongWordsContainer.appendChild(div);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Setup back button
    backBtn.textContent = '← Back to Sets';
    backBtn.onclick = () => window.history.back();
    
    // Listeners for article buttons
    derBtn.addEventListener('click', () => checkAnswer('der'));
    dieBtn.addEventListener('click', () => checkAnswer('die'));
    dasBtn.addEventListener('click', () => checkAnswer('das'));
    
    trainIncorrectBtn.addEventListener('click', () => {
        if (wrongWords.length > 0) {
            startGame(wrongWords); // Restart game with only wrong words
        } else {
            alert("You don't have any mistakes to practice yet!");
        }
    });

    // ===================================================================
    // 4. START THE APPLICATION
    // ===================================================================
    initializeGame();
});