const { query } = require('../config/database');

/**
 * 计算两个用户的匹配度分数
 * @param {Object} userA - 当前用户
 * @param {Object} userB - 目标用户
 * @returns {number} 匹配度分数 (0-100)
 */
function calculateMatchScore(userA, userB) {
    let score = 0;
    const weights = {
        tags: 40,        // 标签匹配权重40%
        grade: 20,       // 年级相近权重20%
        major: 15,       // 专业相关权重15%
        status: 15,      // 状态互补权重15%
        activity: 10     // 活跃度权重10%
    };

    // 1. 标签匹配度计算
    const tagScore = calculateTagMatch(userA.tags, userB.tags);
    score += tagScore * weights.tags;

    // 2. 年级相近度
    const gradeScore = calculateGradeSimilarity(userA.grade, userB.grade);
    score += gradeScore * weights.grade;

    // 3. 专业相关度
    const majorScore = calculateMajorRelation(userA.major, userB.major);
    score += majorScore * weights.major;

    // 4. 状态互补度
    const statusScore = calculateStatusComplement(userA.statusTag, userB.statusTag);
    score += statusScore * weights.status;

    // 5. 活跃度分数
    score += (userB.activityScore || 50) * weights.activity / 100;

    return Math.round(score);
}

/**
 * 计算标签匹配度
 */
function calculateTagMatch(tagsA, tagsB) {
    if (!tagsA || !tagsB || tagsA.length === 0 || tagsB.length === 0) return 0.3;
    
    const setA = new Set(tagsA);
    const setB = new Set(tagsB);
    const intersection = [...setA].filter(x => setB.has(x));
    const union = new Set([...setA, ...setB]);
    
    // Jaccard相似度
    return intersection.length / union.size;
}

/**
 * 计算年级相近度
 */
function calculateGradeSimilarity(gradeA, gradeB) {
    if (!gradeA || !gradeB) return 0.5;
    if (gradeA === gradeB) return 1.0;
    
    const gradeOrder = ['本科大一', '本科大二', '本科大三', '本科大四', '硕士', '博士'];
    const indexA = gradeOrder.indexOf(gradeA);
    const indexB = gradeOrder.indexOf(gradeB);
    
    if (indexA === -1 || indexB === -1) return 0.5;
    
    const diff = Math.abs(indexA - indexB);
    return Math.max(0, 1 - diff * 0.25);
}

/**
 * 计算专业相关度（简化版，可扩展为学科分类）
 */
function calculateMajorRelation(majorA, majorB) {
    if (!majorA || !majorB) return 0.3;
    if (majorA === majorB) return 1.0;
    
    // 定义专业大类
    const majorGroups = {
        '计算机类': ['计算机科学', '软件工程', '人工智能', '网络安全', '数据科学'],
        '电子信息类': ['电子信息', '通信工程', '微电子', '自动化'],
        '商科类': ['工商管理', '金融', '会计', '市场营销', '经济学'],
        '设计类': ['工业设计', '视觉传达', '交互设计', '建筑设计']
    };
    
    // 检查是否同一大类
    for (const [group, majors] of Object.entries(majorGroups)) {
        const inGroupA = majors.some(m => majorA.includes(m));
        const inGroupB = majors.some(m => majorB.includes(m));
        if (inGroupA && inGroupB) return 0.7;
    }
    
    return 0.3;
}

/**
 * 计算状态互补度
 */
function calculateStatusComplement(statusA, statusB) {
    if (!statusA || !statusB) return 0.5;
    
    // 定义互补状态对
    const complements = [
        ['有项目找技术', '技术找项目'],
        ['找合伙人', '招团队'],
        ['投资', '融资']
    ];
    
    for (const [s1, s2] of complements) {
        if ((statusA.includes(s1) && statusB.includes(s2)) ||
            (statusA.includes(s2) && statusB.includes(s1))) {
            return 1.0;
        }
    }
    
    return statusA === statusB ? 0.5 : 0.3;
}

/**
 * 获取每日推荐用户（核心算法）
 * @param {string} userId - 当前用户ID
 * @param {number} limit - 推荐数量（默认10）
 */
async function getDailyRecommendations(userId, limit = 10) {
    try {
        // 1. 获取当前用户信息
        const user = await query(
            `SELECT u.*, GROUP_CONCAT(ut.tag_name) as tags
             FROM users u
             LEFT JOIN user_tags ut ON u.id = ut.user_id
             WHERE u.id = ?
             GROUP BY u.id`,
            [userId]
        );
        
        if (!user || user.length === 0) return [];
        
        const currentUser = {
            ...user[0],
            tags: user[0].tags ? user[0].tags.split(',') : []
        };
        
        // 2. 获取已Link用户ID（排除）
        const linkedUsers = await query(
            `SELECT recipient_id as id FROM links WHERE requester_id = ? AND status = 'accepted'
             UNION
             SELECT requester_id as id FROM links WHERE recipient_id = ? AND status = 'accepted'`,
            [userId, userId]
        );
        const excludeIds = new Set(linkedUsers.map(u => u.id));
        excludeIds.add(userId);
        
        // 3. 获取候选用户（过滤已推荐过、已Link、资料不完整的）
        const today = new Date().toISOString().split('T')[0];
        const candidates = await query(
            `SELECT u.*, GROUP_CONCAT(ut.tag_name) as tags,
                    (SELECT COUNT(*) FROM user_interactions WHERE target_user_id = u.id) as popularity
             FROM users u
             LEFT JOIN user_tags ut ON u.id = ut.user_id
             WHERE u.id NOT IN (${Array.from(excludeIds).map(() => '?').join(',')})
               AND u.id NOT IN (
                   SELECT recommended_user_id 
                   FROM daily_recommendations 
                   WHERE user_id = ? AND date = ?
               )
               AND u.is_profile_complete = TRUE
             GROUP BY u.id
             LIMIT 50`,
            [...excludeIds, userId, today]
        );
        
        // 4. 计算匹配度分数
        const scoredCandidates = candidates.map(candidate => {
            const candidateWithTags = {
                ...candidate,
                tags: candidate.tags ? candidate.tags.split(',') : []
            };
            return {
                ...candidateWithTags,
                matchScore: calculateMatchScore(currentUser, candidateWithTags),
                reason: generateReason(currentUser, candidateWithTags)
            };
        });
        
        // 5. 排序并取前N个
        scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
        const recommendations = scoredCandidates.slice(0, limit);
        
        // 6. 保存推荐记录
        for (const rec of recommendations) {
            await query(
                `INSERT INTO daily_recommendations 
                 (user_id, recommended_user_id, reason, date) 
                 VALUES (?, ?, ?, ?)`,
                [userId, rec.id, rec.reason, today]
            );
        }
        
        return recommendations.map(r => ({
            id: r.id,
            name: r.name || r.nickname,
            avatar: r.avatar,
            grade: r.grade,
            major: r.major,
            bio: r.bio,
            tags: r.tags.slice(0, 3),
            matchScore: r.matchScore,
            reason: r.reason
        }));
        
    } catch (error) {
        console.error('获取推荐失败:', error);
        return [];
    }
}

/**
 * 生成推荐理由
 */
function generateReason(userA, userB) {
    const reasons = [];
    
    // 标签匹配
    const commonTags = userA.tags.filter(tag => userB.tags.includes(tag));
    if (commonTags.length > 0) {
        reasons.push(`共同标签：${commonTags[0]}`);
    }
    
    // 状态互补
    const complements = [
        ['有项目找技术', '技术找项目'],
        ['找合伙人', '招团队']
    ];
    for (const [s1, s2] of complements) {
        if (userA.statusTag?.includes(s1) && userB.statusTag?.includes(s2)) {
            reasons.push(`${userB.statusTag}`);
            break;
        }
    }
    
    // 年级相近
    if (userA.grade === userB.grade) {
        reasons.push(`同为${userA.grade}`);
    }
    
    // 专业相关
    if (userA.major && userB.major && userA.major !== userB.major) {
        const majorGroups = {
            '计算机类': ['计算机', '软件', 'AI', '数据'],
            '设计类': ['设计', '艺术', '视觉']
        };
        for (const [group, keywords] of Object.entries(majorGroups)) {
            const aInGroup = keywords.some(k => userA.major.includes(k));
            const bInGroup = keywords.some(k => userB.major.includes(k));
            if (aInGroup && bInGroup) {
                reasons.push(`${group}背景`);
                break;
            }
        }
    }
    
    return reasons[0] || '推荐匹配';
}

module.exports = {
    calculateMatchScore,
    getDailyRecommendations,
    calculateTagMatch
};
