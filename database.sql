-- Active: 1737137809733@@127.0.0.1@3306@chatterbox
DROP DATABASE chatterbox;
CREATE DATABASE IF NOT EXISTS chatterbox;

USE chatterbox;

CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(40) NOT NULL,
    shown_name VARCHAR(30) NOT NULL DEFAULT 'a human',
    bio VARCHAR(400) NULL,
    profile_pic VARCHAR(20) NOT NULL DEFAULT 'pfp.png',
    cover_pic VARCHAR(20) NOT NULL DEFAULT 'cover.png',
    email VARCHAR(35) NULL,
    instagram VARCHAR(20) NULL,
    PRIMARY KEY(id)
) AUTO_INCREMENT=1001;

CREATE TABLE IF NOT EXISTS chats(
    chat_id INT AUTO_INCREMENT NOT NULL UNIQUE,
    chat_user1 INT NOT NULL,
    chat_user2 INT NOT NULL,
    PRIMARY KEY(chat_id),
    FOREIGN KEY(chat_user1) REFERENCES users(id),
    FOREIGN KEY(chat_user2) REFERENCES users(id)
) AUTO_INCREMENT=10001;

CREATE TABLE IF NOT EXISTS groups(
    group_id INT NOT NULL AUTO_INCREMENT UNIQUE,
    group_name VARCHAR(20) NOT NULL DEFAULT 'Group',
    group_pic VARCHAR(20) DEFAULT 'group_def.png',
    PRIMARY KEY(group_id)
) AUTO_INCREMENT=10001;

CREATE TABLE IF NOT EXISTS group_members(
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    auth BIT NOT NULL DEFAULT 0,
    FOREIGN KEY(group_id) REFERENCES groups(group_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages(
    message_id INT AUTO_INCREMENT NOT NULL UNIQUE,
    sender_id INT NOT NULL,
    chat_id INT NULL,
    group_id INT NULL,
    mesage_type CHAR(4) NOT NULL DEFAULT 'text',
    message_data VARCHAR(100) NULL,
    audio_blob BLOB NULL,
    stat BIT NOT NULL DEFAULT 0,
    sent_date DATETIME NOT NULL DEFAULT '2024-05-07 12:00',
    PRIMARY KEY(message_id),
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(chat_id) REFERENCES chats(chat_id),
    FOREIGN KEY(group_id) REFERENCES groups(group_id)
);

CREATE TABLE IF NOT EXISTS file_access(
    file_name VARCHAR(20) NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS posts(
    post_id INT AUTO_INCREMENT UNIQUE NOT NULL,
    user_id INT NOT NULL,
    post_type CHAR(3) NOT NULL DEFAULT 'txt',
    post_text VARCHAR(100) NOT NULL,
    post_media VARCHAR(20) NULL,
    post_date DATETIME NOT NULL DEFAULT '2024-05-07 12:00',
    PRIMARY KEY(post_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
) AUTO_INCREMENT=20000;

CREATE TABLE IF NOT EXISTS interactions(
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(post_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments(
    comment_id INT AUTO_INCREMENT NOT NULL,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comments VARCHAR(100) NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(post_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    PRIMARY KEY(comment_id)
) AUTO_INCREMENT=1000;

ALTER TABLE comments ADD COLUMN comment_date DATETIME NOT NULL DEFAULT '2024-06-08 07:00';
ALTER TABLE interactions ADD COLUMN like_date DATETIME NOT NULL DEFAULT '2024-06-08 07:00';


SET @date = '2024-06-08 07:00';
SELECT DAYOFYEAR(@date) , DAYOFYEAR(NOW());

ALTER TABLE comments CHANGE comments comments VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS saves(
    file_name VARCHAR(20) NULL,
    post_id INT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(post_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_data VARCHAR(30) NOT NULL,
    link VARCHAR(50) NOT NULL,
    notification_type char(10) NOT NULL,
    stat BIT NOT NULL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS follow(
    follower INT NOT NULL,
    followin INT NOT NULL,
    FOREIGN KEY(follower) REFERENCES users(id),
    FOREIGN KEY(followin) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS blockList(
    blocking INT NOT NULL,
    blocked INT NOT NULL,
    FOREIGN KEY(blocking) REFERENCES users(id),
    FOREIGN KEY(blocked) REFERENCES users(id)
);

CREATE VIEW postWithReaction
AS
SELECT interactions.post_id AS id, posts.user_id, post_type, post_text, post_media, post_date, COUNT(*) AS likes
FROM posts, interactions
WHERE posts.post_id = interactions.post_id
GROUP BY interactions.post_id
UNION
SELECT post_id AS id, user_id, post_type, post_text, post_media, post_date, 0 AS likes
FROM posts;


--SQLite Tables:
CREATE TABLE reports(  
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    userid INT NOT NULL,
    reportDate DATE NOT NULL,
    postid INT NOT NULL
);

CREATE TABLE IF NOT EXISTS usersinfo(
    username VARCHAR(30) NOT NULL,
    useragent VARCHAR(50) NOT NULL,
    userip CHAR(18) NOT NULL,
    lastupdate DATE NOT NULL,
    PRIMARY KEY(username)
);

CREATE TABLE feedback(  
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    userid INTEGER NOT NULL
);