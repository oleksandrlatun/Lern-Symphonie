document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('overviewContent');
    const savedSet = JSON.parse(localStorage.getItem('selectedSet'));

    if (!savedSet) {
        contentContainer.innerHTML = `
            <div class="overview-container">
                <h2>Error</h2>
                <p>The selected set was not found. Please return to the main page and select a set.</p>
                <a href="index.html"><button class="btn btn-primary">Back to Main Page</button></a>
            </div>`;
        return;
    }

    // Create main container for the overview
    const overviewCard = document.createElement('div');
    overviewCard.className = 'overview-container';

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'overview-header';
    const title = document.createElement('h2');
    title.textContent = savedSet.name;
    const backButton = document.createElement('button');
    backButton.className = 'btn btn-secondary back-btn';
    backButton.textContent = '← Back to Sets';
    backButton.onclick = () => window.history.back();
    header.appendChild(title);
    header.appendChild(backButton);

    // --- Entries ---
    const entriesContainer = document.createElement('div');
    entriesContainer.className = 'overview-entries-container';
  
    const partsOfWeek = ['nouns', 'verbs', 'adjectives', 'phrases', 'adverbs', 'expressions'];
    partsOfWeek.forEach(part => {
        if (savedSet[part]) {
            for (const [word, info] of Object.entries(savedSet[part])) {
                const entry = document.createElement('div');
                entry.className = 'overview-entry';

                entry.innerHTML = `
                    <div class="entry-grid">
                        <div class="german-word">${info.article ? `<b>${info.article}</b> ` : ''}${word}</div>
                        <div class="english-translation">${info.english}</div>
                        <div class="german-example">${info.example_de || '—'}</div>
                        <div class="english-example">${info.example_en || '—'}</div>
                    </div>
                    <div class="entry-audio">
                        <button class="audio-btn audio-btn-word" title="Pronounce word">🗣️</button>
                        ${info.example_de ? `<button class="audio-btn audio-btn-example" title="Pronounce example">📖</button>` : ''}
                    </div>`;

                // Add event listeners for audio buttons
                entry.querySelector('.audio-btn-word').addEventListener('click', () => playAudio(word));
                if (info.example_de) {
                    entry.querySelector('.audio-btn-example').addEventListener('click', () => playAudio(info.example_de));
                }
                
                entriesContainer.appendChild(entry);
            }
        }
    });

    overviewCard.appendChild(header);
    overviewCard.appendChild(entriesContainer);
    
    contentContainer.innerHTML = ''; 
    contentContainer.appendChild(overviewCard);
});

// --- Text-to-Speech Functionality ---
function playAudio(text) {
    // Cancel any previous speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    
    // Find and set a German voice if available
    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(v => v.lang === 'de-DE');
    if (germanVoice) {
        utterance.voice = germanVoice;
    }
    
    window.speechSynthesis.speak(utterance);
}

// Ensure voices are loaded before use
window.speechSynthesis.onvoiceschanged = () => {
    // This event may fire multiple times, but it ensures voices are ready.
};