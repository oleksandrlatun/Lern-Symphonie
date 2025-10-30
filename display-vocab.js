// DISPLAY VOCABULARY LISTS

let vocabData;
let selectedSet = null;

// ===================================================================
// MAIN LOGIC: Fetch data, then render themes and restore state.
// ===================================================================
fetch('vocabulary.json')
  .then(resp => resp.json())
  .then(data => {
    vocabData = data;
    renderThemes();
    restoreLastSelectedSet(); // <-- NEW: Restore state after rendering
  });

// ===================================================================
// FUNCTIONS
// ===================================================================

function renderThemes() {
  const container = document.getElementById('themesContainer');
  container.innerHTML = '';
  vocabData.themes.forEach(theme => {
    const themeDiv = document.createElement('div');
    themeDiv.className = 'theme-block';
    
    const themeTitle = document.createElement('h3');
    themeTitle.textContent = theme.title;
    themeDiv.appendChild(themeTitle);
    
    theme.sets.forEach(set => {
      const card = document.createElement('div');
      card.className = 'set-card';
      card.textContent = set.name || 'Untitled set';
      card.dataset.setId = set.id; // <-- NEW: Add data-id for easy selection
      
      card.onclick = () => {
        selectSet(set, card);
        const welcomeElement = document.getElementById('welcome-block');
        if (welcomeElement) {
          welcomeElement.style.display = 'none';
        }
      };
      themeDiv.appendChild(card);
    });
    container.appendChild(themeDiv);
  });
}

function selectSet(set, cardElement) {
  selectedSet = set;
  
  // <-- NEW: Save the last selected set ID to localStorage
  localStorage.setItem('lastSelectedSetId', set.id);

  // Visual highlight for the selected card
  document.querySelectorAll('.set-card').forEach(c => c.classList.remove('selected'));
  if (cardElement) cardElement.classList.add('selected'); 

  renderSetWords(set);
  showTrainingButtons(set);
}

// ===================================================================
// NEW: STATE RESTORATION LOGIC
// Checks localStorage and re-selects the last used set.
// ===================================================================
function restoreLastSelectedSet() {
    const lastSetId = localStorage.getItem('lastSelectedSetId');
    if (!lastSetId) return; // No saved state, do nothing

    // Helper function to find the set object from the ID
    const findSetById = (id) => {
        for (const theme of vocabData.themes) {
            const foundSet = theme.sets.find(set => set.id === id);
            if (foundSet) return foundSet;
        }
        return null;
    };

    const setToRestore = findSetById(lastSetId);
    if (setToRestore) {
        // Find the corresponding card element in the DOM
        const cardElement = document.querySelector(`.set-card[data-set-id="${lastSetId}"]`);
        
        // Hide the welcome message
        const welcomeElement = document.getElementById('welcome-block');
        if (welcomeElement) {
            welcomeElement.style.display = 'none';
        }

        // Simulate the selection
        selectSet(setToRestore, cardElement);
    }
}


// Accordion logic for word lists (no changes here)
function renderSetWords(set) {
  const listDiv = document.getElementById('setWordList');
  listDiv.innerHTML = ''; 

  let isFirstPartOfSpeech = true;
  const partsOfWeek = ['nouns', 'verbs', 'adjectives', 'phrases', 'adverbs', 'expressions'];

  partsOfWeek.forEach(part => {
    if (set[part] && Object.keys(set[part]).length > 0) {
      const accordionItem = document.createElement('div');
      accordionItem.className = 'accordion-item';

      const header = document.createElement('div');
      header.className = 'part-of-speech-header';
      header.innerHTML = `<span>${part.charAt(0).toUpperCase() + part.slice(1)}</span><span class="icon">+</span>`;
      
      const content = document.createElement('div');
      content.className = 'word-list';
      const ul = document.createElement('ul');

      for (const [word, info] of Object.entries(set[part])) {
        const li = document.createElement('li');
        li.innerHTML = `<b>${info.article ? info.article + ' ' : ''}${word}</b> — ${info.english}`;
        ul.appendChild(li);
      }
      content.appendChild(ul);

      accordionItem.appendChild(header);
      accordionItem.appendChild(content);

      header.addEventListener('click', () => {
        const currentlyActive = document.querySelector('.accordion-item.active');
        if (currentlyActive && currentlyActive !== accordionItem) {
            currentlyActive.classList.remove('active');
        }
        accordionItem.classList.toggle('active');
      });

      if (isFirstPartOfSpeech) {
        accordionItem.classList.add('active');
        isFirstPartOfSpeech = false;
      }
      
      listDiv.appendChild(accordionItem);
    }
  });
}

// Button visibility logic (no changes here)
function showTrainingButtons(set) {
  document.getElementById('setWordListContainer').style.display = 'block';

  document.getElementById('flashCardGo').onclick = () => {
    if (!selectedSet) { alert("Please choose a word set first!"); return; }
    localStorage.setItem('selectedSet', JSON.stringify(selectedSet));
    window.location.href = 'flash-cards.html'; 
  };

  const derDieDasBtn = document.getElementById('derDieDasBtn');
  const hasNouns = !!set.nouns && Object.keys(set.nouns).length > 0;
  derDieDasBtn.style.display = hasNouns ? 'inline-block' : 'none';
  
  derDieDasBtn.onclick = () => {
    if (selectedSet && hasNouns) {
        localStorage.setItem('selectedSet', JSON.stringify(selectedSet));
        window.location.href = 'derdiedas.html';
    } else {
        alert("This set does not contain any nouns to practice articles with.");
    }
  };
  
  const overviewBtn = document.getElementById('overviewBtn');
  overviewBtn.style.display = 'inline-block';
  
  overviewBtn.onclick = () => {
    if (!selectedSet) { alert("Please choose a word set first!"); return; }
    localStorage.setItem('selectedSet', JSON.stringify(selectedSet));
    window.location.href = 'overview.html';
  };
}