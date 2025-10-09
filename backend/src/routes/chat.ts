import { Router } from 'express';
import { getChatAgent } from '../agents/chatAgent';

const router = Router();

// POST /chat - Send a message and get AI response
router.post('/chat', async (req, res) => {
  console.log('Chat request received');

  try {
    const { message } = req.body;

    // 1. Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`User: ${message}`);

    // 2. Execute the chat agent
    const agent = getChatAgent();
    const result = await agent.generateText(message);

    console.log(`Assistant: ${result.text?.substring(0, 100)}...`);

    // 3. Return response
    res.json({
      success: true,
      response: result.text || result
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

export default router;