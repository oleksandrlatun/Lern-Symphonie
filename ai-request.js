async function askQuestion() {
  const question = document.getElementById('questionInput').value.trim();
  if (!question) {
    alert('Please enter a question');
    return;
  }

const customPrompt1 =   `You are a creative and funny German teacher.  
                        Given a list of German–English vocabulary in this format:
                        [german] - [english]

                        Example:
                        das Gericht - dish, meal
                        die silberne Hochzeit - silver wedding anniversary
                        die Sorgfalt - diligence, accuracy
                        ...
                        Words: `;
  const customPrompt2 = `TASK:
                        1. If the list has only ONE word or phrase, create just ONE short sentence (not a story) using that word naturally.
                        2. If the list has multiple words, create a short, silly, or nonsensical English story that uses ALL given English meanings at least once. Number each sentence.
                        3. Translate each sentence into German, using the exact provided German equivalents in the correct places.
                        4. Avoid filler sentences — every sentence must include at least one of the provided target words.
                        5. For each sentence, create a translation table listing every word with:
                        - position in sentence  
                        - german form  
                        - english translation
                        6. Output everything in ONE JSON object where each sentence is a unified set containing:
                        - english sentence (with word positions)
                        - german sentence (with word positions)
                        - word-level translation table for that sentence

                        JSON structure:
                        {
                        "story": {
                            "1": {
                            "english": { "1": "word", "2": "word", ... },
                            "german": { "1": "word", "2": "word", ... },
                            "translations": [
                                {"position": 1, "english": "dish", "german": "das Gericht"},
                                {"position": 2, "english": "is", "german": "ist"},
                                ...
                            ]
                            },
                            "2": { ... }
                        }
                        }

                        Rules:
                        - Use all given vocabulary exactly once in context.
                        - Keep JSON valid, compact, and machine-readable.
                        - Output **only the JSON**, no explanations or extra text.`;

  const finalPrompt = customPrompt1 + question + customPrompt2;
  document.getElementById('answerBox').textContent = 'Loading...';

  try {
    const response = await fetch('http://127.0.0.1:3000/api/getAnswer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({question: finalPrompt}),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    document.getElementById('answerBox').textContent = data.answer || 'No answer returned';
  } catch (error) {
    document.getElementById('answerBox').textContent = 'Error: ' + error.message;
  }
}

document.getElementById('askBtn').addEventListener('click', askQuestion);
document.getElementById('questionInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') askQuestion();
});
