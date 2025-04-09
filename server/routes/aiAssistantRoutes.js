
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get all messages for a user
router.get('/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.userId })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// Send message to AI assistant
router.post('/', async (req, res) => {
  try {
    const { content, userId } = req.body;
    
    // Save user message
    const userMessage = new Message({
      content,
      sender: 'user',
      userId,
      timestamp: new Date()
    });
    
    const savedUserMessage = await userMessage.save();
    
    // Get conversation history
    const previousMessages = await Message.find({ userId })
      .sort({ timestamp: 1 })
      .limit(10);
    
    const messageHistory = previousMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // Add current message to history
    messageHistory.push({
      role: 'user',
      content
    });
    
    // Get AI response using Groq
    const completion = await groq.chat.completions.create({
      messages: messageHistory,
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 800,
    });
    
    const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    
    // Save AI response
    const aiMessage = new Message({
      content: aiResponse,
      sender: 'assistant',
      userId,
      timestamp: new Date()
    });
    
    const savedAiMessage = await aiMessage.save();
    
    res.json({
      userMessage: savedUserMessage,
      aiMessage: savedAiMessage
    });
  } catch (err) {
    console.error('Error processing message:', err);
    res.status(500).json({ message: 'Server error processing message' });
  }
});

module.exports = router;
