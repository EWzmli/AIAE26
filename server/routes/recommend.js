const express = require('express');
const router = express.Router();
const { getDailyRecommendations } = require('../services/recommendation');
const { query } = require('../config/database');

// 获取每日推荐
router.get('/daily', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // 实际应从JWT解码
        
        if (!userId) {
            return res.status(401).json({ message: '未登录' });
        }

        const recommendations = await getDailyRecommendations(userId, 10);
        
        res.json({
            success: true,
            data: recommendations,
            date: new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('获取推荐失败:', error);
        res.status(500).json({ message: '获取推荐失败' });
    }
});

// 记录用户行为（用于优化推荐）
router.post('/interaction', async (req, res) => {
    try {
        const { userId, targetUserId, type } = req.body;
        
        await query(
            `INSERT INTO user_interactions (user_id, target_user_id, type) VALUES (?, ?, ?)`,
            [userId, targetUserId, type]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('记录互动失败:', error);
        res.status(500).json({ message: '记录失败' });
    }
});

module.exports = router;
