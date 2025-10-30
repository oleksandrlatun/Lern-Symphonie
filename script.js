document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // 1. INITIALIZE UI ELEMENTS & STATE
    // ===================================================================
    const flashCard = document.getElementById('flashCard');
    const flashCardWordLine = document.getElementById('flashCardWord');
    const correctCount = document.getElementById('correctCount');
    const incorrectCount = document.getElementById('incorrectCount');
    const goodBtn = document.getElementById('goodBtn');
    const badBtn = document.getElementById('badBtn');
    const wrongWordsList = document.getElementById('wrongWordsListContainer');
    const progressBar = document.getElementById('progressBar');
    const backBtn = document.getElementById('back-button');

    // --- NEW & UPDATED UI Elements ---
    const repeatIncorrectBtn = document.getElementById('repeatIncorrectBtn');
    const checkSentenceBtn = document.getElementById('checkSentenceBtn');
    const sentenceInput = document.getElementById('sentenceInput');
    const aiResponseBox = document.getElementById('aiResponseBox');

    let words = [];
    let currentIdx = 0;
    let correct = 0;
    let incorrect = 0;
    let showTranslation = false;
    let wrongWords = [];

    // ===================================================================
    // 2. CORE GAME LOGIC
    // ===================================================================

    function initializeGame() {
        const savedSet = JSON.parse(localStorage.getItem('selectedSet'));
        if (!savedSet) {
            flashCardWordLine.innerHTML = "No set found. Please go back and select one.";
            return;
        }
        startFlashCardTraining(savedSet);
    }

    function startFlashCardTraining(set) {
        const parts = ['nouns', 'adjectives', 'verbs', 'phrases', 'adverbs', 'expressions'];
        let vocabularyFromSet = {};

        parts.forEach(part => {
            if (set[part]) {
                Object.assign(vocabularyFromSet, set[part]);
            }
        });

        if (Object.keys(vocabularyFromSet).length === 0) {
            flashCardWordLine.innerHTML = "This set has no words!";
            return;
        }

        // Use the full set for training
        words = Object.entries(vocabularyFromSet);
        resetAndStartTraining();
    }
    
    // NEW: Function to start training with only wrong words
    function startTrainingWithWrongWords() {
        if (wrongWords.length === 0) {
            alert("You have no mistakes to practice. Well done!");
            return;
        }
        // Use the wrong words list for training
        words = [...wrongWords];
        // Clear the list for the new session
        wrongWords = []; 
        displayWrongWords();
        resetAndStartTraining();
    }

    // NEW: Helper function to reset state and start any training session
    function resetAndStartTraining() {
        shuffleArray(words);
        currentIdx = 0;
        correct = 0;
        incorrect = 0;
        showTranslation = false;
        sentenceInput.value = '';
        aiResponseBox.innerHTML = '';
        
        goodBtn.disabled = false;
        badBtn.disabled = false;

        updateStats();
        displayCurrentCard();
    }

    function displayCurrentCard() {
        if (currentIdx >= words.length || words.length === 0) {
            endGame();
            return;
        }
        const [word, data] = words[currentIdx];
        let textToShow = `${data.article ? data.article + " " : ""}${word}`;
        if (showTranslation) {
            textToShow = `${data.english}`;
        }
        flashCardWordLine.innerHTML = textToShow;
        // Clear previous sentence and AI response for the new card
        sentenceInput.value = '';
        aiResponseBox.innerHTML = '';
    }
    
    function nextCard() {
        if (currentIdx >= words.length - 1) {
            currentIdx++;
            updateStats();
            endGame();
            return;
        }
        showTranslation = false;
        currentIdx++;
        displayCurrentCard();
        updateStats();
    }
    
    function endGame() {
        flashCardWordLine.innerHTML = "Congrats! You've finished the set.";
        goodBtn.disabled = true;
        badBtn.disabled = true;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // ===================================================================
    // 3. AI SENTENCE CHECKER
    // ===================================================================
    async function checkSentenceWithAI() {
        const userSentence = sentenceInput.value.trim();
        if (!userSentence) {
            alert("Please write a sentence first.");
            return;
        }
        if (currentIdx >= words.length) return;

        const [word, data] = words[currentIdx];
        const germanWord = `${data.article ? data.article + " " : ""}${word}`;
        const englishTranslation = data.english;

        aiResponseBox.textContent = 'Checking with AI teacher...';
        aiResponseBox.classList.add('loading');

        const finalPrompt = `You are a friendly and helpful German teacher. A student is practicing the German word "${germanWord}" (which means "${englishTranslation}").
        
        The student wrote this sentence: "${userSentence}"

        Please check their sentence and provide feedback following these rules:
        1. Start by saying if the sentence is correct or has mistakes.
        2. If it's incorrect, provide the corrected version.
        3. Briefly and simply explain the main mistake (e.g., "we use a different case here," or "the word order is a bit different").
        4. Keep your response short, clear, and encouraging.
        5. Respond in English.`;

        try {
            const response = await fetch('http://127.0.0.1:3000/api/getAnswer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: finalPrompt }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            aiResponseBox.textContent = result.answer || 'Sorry, I could not get a response.';
        } catch (error) {
            aiResponseBox.textContent = 'Error: ' + error.message;
        } finally {
            aiResponseBox.classList.remove('loading');
        }
    }

    // ===================================================================
    // 4. UI & EVENT HANDLERS
    // ===================================================================

    function updateStats() {
        correctCount.innerText = correct;
        incorrectCount.innerText = incorrect;
        updateProgressBar();
    }

    function updateProgressBar() {
        if (words.length === 0) {
            progressBar.value = 0;
            return;
        }
        progressBar.value = (currentIdx / words.length) * 100;
    }

    function displayWrongWords() {
        wrongWordsList.parentElement.querySelector('p').style.display = wrongWords.length > 0 ? 'none' : 'block';
        const html = wrongWords.map(([word, data]) => {
            return `<div><b>${data.article ? data.article + " " : ""}${word}</b> - ${data.english}</div>`;
        }).join('');
        wrongWordsList.innerHTML = html;
    }
    
    // Setup back button
    backBtn.onclick = () => window.location.href = 'index.html';
    
    // Card flip event
    flashCard.addEventListener('click', () => {
        showTranslation = !showTranslation;
        displayCurrentCard();
    });

    // "Good" button event
    goodBtn.addEventListener('click', () => {
        correct++;
        nextCard();
    });

    // "Bad" button event
    badBtn.addEventListener('click', () => {
        incorrect++;
        const [word, data] = words[currentIdx];
        if (!wrongWords.some(([w]) => w === word)) {
            wrongWords.push([word, data]);
        }
        displayWrongWords();
        nextCard();
    });

    // UPDATED: Event listener for the new "Repeat" button
    repeatIncorrectBtn.addEventListener('click', startTrainingWithWrongWords);

    // NEW: Event listener for the AI check button
    checkSentenceBtn.addEventListener('click', checkSentenceWithAI);
    
    // ===================================================================
    // 5. START THE APPLICATION
    // ===================================================================
    initializeGame();
});