import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

const client = new OpenAI({
  apiKey: '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',
  baseURL: 'https://api.perplexity.ai',
});

app.post('/api/getAnswer', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const response = await client.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: question }
      ],
      max_tokens: 2048,
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve answer' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
