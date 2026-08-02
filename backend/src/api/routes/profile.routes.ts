import { Router, Request, Response } from 'express';
import { prisma } from '../../database/client.js';
import { conversationManager } from '../../conversation/manager/conversation.manager.js';
import { sqliteMemoryRepository } from '../../memory/storage/sqlite.repository.js';
import { HTTP_STATUS } from '../../config/index.js';

const router = Router();

// GET /api/v1/profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const profile = await sqliteMemoryRepository.getUserProfile();
    const user = await prisma.user.findFirst();

    // Calculate total conversation count and message count
    const sessions = await prisma.conversationSession.findMany({
      include: { _count: { select: { messages: true } } },
    });

    const totalConversations = sessions.length;
    const totalMessages = sessions.reduce((sum, s) => sum + s._count.messages, 0);

    // Calculate Days Together
    let daysTogether = 1;
    if (user) {
      const msDiff = Date.now() - new Date(user.createdAt).getTime();
      daysTogether = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    } else if (profile) {
      const msDiff = Date.now() - new Date(profile.createdAt).getTime();
      daysTogether = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    }

    // Get active relationship state from ConversationManager map
    let relationshipLevel = 'stranger';
    let trustScore = 15;
    let relationshipHealth = 20;
    let milestonesCount = 0;
    let signalCuriosity = 5;

    // Check if there are active states in conversationManager
    // conversationManager.sessionRelationshipStates is private, but we can access it using bracket notation
    const sessionRelationshipStates = (conversationManager as any).sessionRelationshipStates;
    if (sessionRelationshipStates && sessionRelationshipStates.size > 0) {
      // Get the most recent active session's state
      const states = Array.from(sessionRelationshipStates.values()) as any[];
      if (states.length > 0) {
        const latestState = states[states.length - 1];
        relationshipLevel = latestState.level;
        trustScore = latestState.metrics.trustScore;
        relationshipHealth = latestState.metrics.relationshipHealth;
        milestonesCount = latestState.milestones?.length || 0;
        signalCuriosity = latestState.signals?.curiosity || 5;
      }
    }

    // Gather favorite topics from message logs
    const messages = await prisma.chatMessageRecord.findMany({
      select: { topic: true },
    });
    const topicCounts: Record<string, number> = {};
    messages.forEach((m) => {
      if (m.topic) {
        topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1;
      }
    });
    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
      .slice(0, 3);

    const favoriteTopics = sortedTopics.length > 0 ? sortedTopics : ['General', 'Technology'];

    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: {
        id: profile?.id || 'default-profile',
        name: profile?.name || 'Alex',
        email: user?.email || 'alex@aura.os',
        relationshipLevel,
        daysTogether,
        statistics: {
          totalConversations,
          totalMessages,
          trustScore,
          relationshipHealth,
        },
        favoriteTopics,
        achievements: [
          { name: 'First Sync', description: 'Established connection with AURA OS', achieved: true },
          { name: 'Empathic Bond', description: 'Reached trust score of 50', achieved: trustScore >= 50 },
          { name: 'Milestone Hunter', description: 'Achieve 3 milestones', achieved: milestonesCount >= 3 },
        ],
        badges: [
          { name: 'Pioneer', category: 'achievement' },
          relationshipLevel !== 'stranger' ? { name: 'Friend', category: 'relationship' } : null,
          signalCuriosity > 7 ? { name: 'Curious', category: 'emotion' } : null,
        ].filter(Boolean),
        personalization: {
          nickname: profile?.name || 'Alex',
          companionName: 'Shizuka',
          language: 'English (US)',
          theme: 'Blush Rose & Warm White',
        },
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: 'Failed to retrieve profile analytics',
      },
    });
  }
});

// POST /api/v1/profile
router.post('/profile', async (req: Request, res: Response) => {
  try {
    const { name, email, age, occupation, college, bio } = req.body;
    
    // Update or create Profile details in DB
    const profile = await sqliteMemoryRepository.updateUserProfile({
      name,
      age: age ? parseInt(age, 10) : undefined,
      occupation,
      college,
      bio,
    });

    if (email) {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email, name: name || user.name },
        });
      } else {
        await prisma.user.create({
          data: { email, name: name || 'Alex' },
        });
      }
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      data: profile,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: 'Failed to save profile changes',
      },
    });
  }
});

export default router;
