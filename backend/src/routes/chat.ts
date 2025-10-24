import { Router } from 'express';
import { getChatAgent } from '../agents/chatAgent';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /chat - Send a message and get AI response (PROTECTED)
router.post('/chat', authenticateToken, async (req: AuthRequest, res) => {
  console.log('Chat request received');

  try {
    const { message, chatId } = req.body;
    const userId = req.userId!;

    // 1. Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`User (${userId}): ${message}`);

    // 2. Find or create chat session
    let chat;
    if (chatId) {
      // Use existing chat
      chat = await prisma.chat.findUnique({
        where: { id: chatId, userId },
      });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
    } else {
      // Create new chat
      chat = await prisma.chat.create({
        data: {
          title: message.substring(0, 50) + '...',
          userId,
        },
      });
      console.log(`Created new chat: ${chat.id}`);
    }

    // 3. Save user message to database
    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: message,
      },
    });

    // 4. Execute the chat agent with userId and chatId for filtering
    const agent = getChatAgent(userId, chat.id);
    const result = await agent.generateText(message);

    console.log(`Assistant: ${result.text?.substring(0, 100)}...`);

    // 5. Save assistant response to database
    const assistantMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: result.text || String(result),
      },
    });

    // 6. Return response with chat info
    res.json({
      success: true,
      chatId: chat.id,
      response: result.text || result,
      messageId: assistantMessage.id,
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

// GET /chats - Get all chats for the user (PROTECTED)
router.get('/chats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    res.json({
      success: true,
      chats,
    });
  } catch (error: any) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to get chats' });
  }
});

// GET /chats/:chatId - Get messages for a specific chat (PROTECTED)
router.get('/chats/:chatId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const chatId = req.params.chatId;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({
      success: true,
      chat,
    });
  } catch (error: any) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
});

// GET /chats/:chatId/documents - Get documents for a specific chat (PROTECTED)
router.get('/chats/:chatId/documents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const chatId = req.params.chatId;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Get documents for this chat
    const chatDocuments = await prisma.chatDocument.findMany({
      where: { chatId },
      include: {
        document: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const documents = chatDocuments.map(cd => cd.document);

    res.json({
      success: true,
      documents,
    });
  } catch (error: any) {
    console.error('Get chat documents error:', error);
    res.status(500).json({ error: 'Failed to get chat documents' });
  }
});

// DELETE /chats/:chatId - Delete a chat (PROTECTED)
router.delete('/chats/:chatId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const chatId = req.params.chatId;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Delete chat (messages will cascade delete)
    await prisma.chat.delete({
      where: { id: chat.id },
    });

    res.json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export default router;