-- AIAE 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS aiae_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aiae_db;

-- 用户表
CREATE TABLE users (
    id VARCHAR(32) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '交大邮箱',
    password_hash VARCHAR(255) COMMENT '密码（jAccount登录可为空）',
    name VARCHAR(50) COMMENT '真实姓名',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    grade ENUM('本科大一','本科大二','本科大三','本科大四','硕士','博士') COMMENT '年级',
    major VARCHAR(100) COMMENT '专业',
    wechat_id VARCHAR(50) COMMENT '微信号',
    wechat_masked VARCHAR(50) COMMENT '脱敏微信（如：wx***123）',
    bio TEXT COMMENT '个人简介',
    project_name VARCHAR(100) COMMENT '创业项目名',
    status_tag VARCHAR(50) COMMENT '状态标签',
    is_profile_complete BOOLEAN DEFAULT FALSE COMMENT '资料是否完善',
    last_login_at TIMESTAMP COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_grade (grade),
    INDEX idx_major (major)
) ENGINE=InnoDB COMMENT='用户表';

-- 用户标签表（多对多）
CREATE TABLE user_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    tag_type ENUM('tech','design','interest','skill') NOT NULL COMMENT '标签类型',
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_tag (user_id, tag_type, tag_name)
) ENGINE=InnoDB COMMENT='用户标签表';

-- 帖子表（招聘广场）
CREATE TABLE posts (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL COMMENT '发布者ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    type ENUM('recruit','seek','share','help') DEFAULT 'share' COMMENT '帖子类型',
    tags JSON COMMENT '标签数组',
    view_count INT DEFAULT 0 COMMENT '浏览量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    status ENUM('pending','approved','rejected') DEFAULT 'pending' COMMENT '审核状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='帖子表';

-- 评论表
CREATE TABLE comments (
    id VARCHAR(32) PRIMARY KEY,
    post_id VARCHAR(32) NOT NULL,
    user_id VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    parent_id VARCHAR(32) COMMENT '父评论ID（二级评论）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='评论表';

-- 活动表
CREATE TABLE events (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('lecture','competition','meetup','other') NOT NULL COMMENT '活动类型',
    location VARCHAR(200) NOT NULL COMMENT '地点',
    start_time TIMESTAMP NOT NULL COMMENT '开始时间',
    end_time TIMESTAMP COMMENT '结束时间',
    organizer VARCHAR(100) COMMENT '组织者',
    max_participants INT COMMENT '最大参与人数',
    current_participants INT DEFAULT 0 COMMENT '当前报名人数',
    status ENUM('upcoming','ongoing','ended') DEFAULT 'upcoming',
    cover_image VARCHAR(255) COMMENT '封面图',
    created_by VARCHAR(32) COMMENT '创建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_start_time (start_time),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='活动表';

-- 活动报名记录
CREATE TABLE event_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(32) NOT NULL,
    user_id VARCHAR(32) NOT NULL,
    status ENUM('registered','checked_in','cancelled') DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_event_user (event_id, user_id)
) ENGINE=InnoDB COMMENT='活动报名记录';

-- Link关系表（双向确认）
CREATE TABLE links (
    id VARCHAR(32) PRIMARY KEY,
    requester_id VARCHAR(32) NOT NULL COMMENT '发起者ID',
    recipient_id VARCHAR(32) NOT NULL COMMENT '接收者ID',
    status ENUM('pending','accepted','rejected') DEFAULT 'pending' COMMENT '状态',
    message TEXT COMMENT '申请留言',
    responded_at TIMESTAMP COMMENT '响应时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_link (requester_id, recipient_id),
    INDEX idx_recipient (recipient_id, status)
) ENGINE=InnoDB COMMENT='Link关系表';

-- 用户互动记录（用于推荐算法）
CREATE TABLE user_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    target_user_id VARCHAR(32) NOT NULL COMMENT '互动目标用户',
    type ENUM('view','like','link_request','message') NOT NULL COMMENT '互动类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id, created_at)
) ENGINE=InnoDB COMMENT='用户互动记录';

-- 每日推荐记录
CREATE TABLE daily_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    recommended_user_id VARCHAR(32) NOT NULL,
    reason VARCHAR(100) COMMENT '推荐理由',
    is_viewed BOOLEAN DEFAULT FALSE,
    is_linked BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL COMMENT '推荐日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_daily_rec (user_id, recommended_user_id, date)
) ENGINE=InnoDB COMMENT='每日推荐记录';

-- 管理员表
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super','moderator') DEFAULT 'moderator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='管理员表';

-- 插入默认管理员（密码：admin123，生产环境需修改）
INSERT INTO admins (username, password_hash, role) VALUES 
('admin', '$2a$10$YourHashedPasswordHere', 'super');
