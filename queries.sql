--authenticate => QUERY:
SELECT id, username, password FROM users WHERE username=?;
--END_QUERY

--authenticate2 => QUERY:
SELECT id, username, password, profile_pic AS profile FROM users WHERE id=?;
--END_QUERY

--getUser => QUERY:
SELECT username FROM users WHERE username=?;
--END_QUERY

--getUser2 => QUERY:
SELECT username FROM users WHERE username=? AND username!=?;
--END_QUERY

--addUser => QUERY:
INSERT INTO users(username, password, shown_name, email) VALUES (?,?,?,?);
--END_QUERY

--saveToAdmin => QUERY:
INSERT INTO usersinfo(username, useragent, lastupdate, userip) VALUES (?,?,?,?);
--END_QUERY

--userPics => QUERY:
SELECT profile_pic FROM users WHERE id=?;
--END_QUERY

--getProfile => QUERY:
SELECT follow.followin AS id, username, shown_name, bio, profile_pic AS profile, cover_pic AS cover, email, instagram AS insta, COUNT(follow.follower) AS followers FROM users, follow WHERE username=? AND users.id = follow.followin GROUP BY followin;
--END_QUERY

--getFollowings => QUERY:
SELECT followin FROM follow WHERE follower=?;
--END_QUERY

--getUserPosts => QUERY:
SELECT id, post_type, post_text, post_media, likes FROM postWithReaction WHERE user_id=? ORDER BY post_date DESC, likes DESC;
--END_QUERY

--getProfileOnly => QUERY:
SELECT id, username, shown_name, bio, profile_pic AS profile, cover_pic AS cover, email, instagram AS insta, 0 AS followers FROM users WHERE username=?;
--END_QUERY

--getComments => QUERY:
SELECT post_id, COUNT(*) AS comment FROM comments WHERE post_id IN (?) GROUP BY post_id;
--END_QUERY

--getReacted => QUERY:
SELECT post_id AS id FROM interactions WHERE user_id=? AND post_id IN (?);
--END_QUERY

--getSaved => QUERY:
SELECT post_id AS id FROM saves WHERE user_id=? AND post_id IN (?);
--END_QUERY

--getPics => QUERY:
SELECT profile_pic, cover_pic FROM users WHERE id=?;
--END_QUERY


--suggestFollowings => QUERY:
SELECT DISTINCT users.id, users.username AS name, users.profile_pic AS profile, follow.followin
 FROM follow, users
 WHERE followin=users.id
 AND follower IN (SELECT followin FROM follow WHERE follower=?)
 AND followin NOT IN (SELECT followin FROM follow WHERE follower=?)
 AND followin != ? LIMIT 7;
 --END_QUERY


 --updateUser => QUERY:
UPDATE users SET username=?, shown_name=?, bio=?, profile_pic=?, cover_pic=?, email=?, instagram=?  WHERE id=?;
--END_QUERY


--getNotifications => QUERY:
SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC;
--END_QUERY

--notify => QUERY:
INSERT INTO notifications(user_id, notification_data, link, picture) VALUES(
    (SELECT id FROM users WHERE username=?),
     ?, ?, 
    (SELECT profile_pic FROM users WHERE username=?));
--END_QUERY

--setSeen => QUERY:
UPDATE notifications SET stat=1 WHERE user_id=?;
--END_QUERY

--follow => QUERY:
INSERT INTO follow(follower, followin) VALUES (?, ?);
--END_QUERY

--unfollow => QUERY:
DELETE FROM follow WHERE follower=? AND followin=?;
--END_QUERY

--getFollowers => QUERY:
SELECT followin, COUNT(*) AS followers FROM follow WHERE followin=? GROUP BY followin;
--END_QUERY

--updateUserPost => QUERY:
UPDATE posts SET post_text=? WHERE post_id=? AND user_id=(SELECT id FROM users WHERE username=?);
--END_QUERY

--deleteUserPost => QUERY:
DELETE FROM posts WHERE post_id=? AND user_id=(SELECT id FROM users WHERE username=?);
--END_QUERY

--delPostComs => QUERY:
DELETE FROM comments WHERE post_id in (?);
--END_QUERY

--delPostLikes => QUERY:
DELETE FROM interactions WHERE post_id in (?);
--END_QUERY

--save => QUERY:
INSERT INTO saves(post_id, user_id) VALUES (?, (SELECT id FROM users WHERE username=?));
--END_QUERY

--unsave => QUERY:
DELETE FROM saves WHERE post_id=? AND user_id=(SELECT id FROM users WHERE username=?);
--END_QUERY

--getOneSave => QUERY:
SELECT post_id FROM saves WHERE user_id=(SELECT id FROM users WHERE username=?) AND post_id=?;
--END_QUERY

--like => QUERY:
INSERT INTO interactions(post_id, user_id, like_date) VALUES (?, (SELECT id FROM users WHERE username=?), ?);
--END_QUERY

--unlike => QUERY:
DELETE FROM interactions WHERE post_id=? AND user_id=(SELECT id FROM users WHERE username=?);
--END_QUERY

--getOneLike => QUERY:
SELECT post_id FROM interactions WHERE user_id=(SELECT id FROM users WHERE username=?) AND post_id=?;
--END_QUERY

--getMeta => QUERY:
SELECT likes, (SELECT username FROM users WHERE id=user_id) AS username FROM postWithReaction WHERE id=? LIMIT 1;
--END_QUERY


--checkNotified => QUERY:
SELECT id FROM notifications WHERE user_id=(SELECT id FROM users WHERE username=?)
    AND notification_data=? AND link=? 
    AND picture=(SELECT profile_pic FROM users WHERE username=?) AND stat=0;
--END_QUERY


--getFollower => QUERY:
SELECT id, username, profile_pic AS profile FROM users WHERE id IN (
    SELECT follower FROM follow WHERE followin=(
        SELECT id FROM users WHERE username=?
    )
);
--END_QUERY

--getFollowing => QUERY:
SELECT id, username, profile_pic AS profile FROM users WHERE id IN (
    SELECT followin FROM follow WHERE follower=(
        SELECT id FROM users WHERE username=?
    )
);
--END_QUERY


--isFollowed => QUERY:
SELECT followin AS id FROM follow WHERE follower=(
    SELECT id FROM users WHERE username=?
) AND followin IN (?);
--END_QUERY

--getPostComments => QUERY:
SELECT comment_id AS id, username, profile_pic AS profile, comments
 FROM users, comments WHERE comments.user_id = users.id AND comments.post_id=? ORDER BY comment_id;
--END_QUERY

--addComment => QUERY:
INSERT INTO comments(post_id, user_id, comments, comment_date) VALUES(?, (SELECT id FROM users WHERE username=?), ?, ?);
--END_QUERY

--getProfilePic => QUERY:
SELECT profile_pic AS pfp FROM users WHERE username=?;
--END_QUERY

--delComment => QUERY:
DELETE FROM comments WHERE comment_id=? AND user_id=(SELECT id FROM users WHERE username=?);
--END_QUERY


--getCommentsOnC => QUERY:
SELECT comment_id AS id, username, profile_pic AS profile, comments
 FROM users, comments WHERE comments.user_id = users.id AND comments.post_id=(
     SELECT post_id FROM comments WHERE comment_id=?
 );
--END_QUERY



--getPostData => QUERY:
SELECT username, profile_pic AS userPic,
 postWithReaction.post_type AS type,
 postWithReaction.post_text, postWithReaction.post_media,
 postWithReaction.likes , comments.post_id AS id, COUNT(*) AS comments
 FROM postWithReaction, users, comments
 WHERE users.id = postWithReaction.user_id AND comments.post_id = postWithReaction.id AND postWithReaction.id = ?
 GROUP BY comments.post_id
 UNION
 SELECT username, profile_pic AS userPic,
 postWithReaction.post_type AS type,
 postWithReaction.post_text, postWithReaction.post_media,
 postWithReaction.likes , postWithReaction.id AS id, 0 AS comments
 FROM postWithReaction, users
 WHERE users.id = postWithReaction.user_id AND postWithReaction.id = ? ORDER BY likes DESC, comments DESC LIMIT 1;
--END_QUERY


--existPost => QUERY:
SELECT post_id FROM posts WHERE post_id=? AND user_id=(SELECT id FROM users where username=?);
--END_QUERY

--removeNotifications => QUERY:
DELETE FROM notifications WHERE link LIKE CONCAT('%', ?);
--END_QUERY

--searchUsers => QUERY:
SELECT id, username, profile_pic AS profile FROM users
 WHERE SOUNDEX(username) = SOUNDEX(?)
 OR SOUNDEX(shown_name) = SOUNDEX(?)
 OR username LIKE CONCAT('%', ?, '%') 
 OR shown_name LIKE CONCAT('%', ?, '%');
--END_QUERY

--searchPosts => QUERY:
SELECT username, profile_pic AS userPic,
 postWithReaction.post_type AS type,
 postWithReaction.post_text, postWithReaction.post_media,
 postWithReaction.likes , comments.post_id AS id, COUNT(*) AS comments
 FROM postWithReaction, users, comments
 WHERE users.id = postWithReaction.user_id AND comments.post_id = postWithReaction.id AND (postWithReaction.post_text LIKE CONCAT('%', ?, '%') OR SOUNDEX(postWithReaction.post_text) = SOUNDEX(?))
 GROUP BY comments.post_id
 UNION
 SELECT username, profile_pic AS userPic,
 postWithReaction.post_type AS type,
 postWithReaction.post_text, postWithReaction.post_media,
 postWithReaction.likes , postWithReaction.id AS id, 0 AS comments
 FROM postWithReaction, users
 WHERE users.id = postWithReaction.user_id AND (postWithReaction.post_text LIKE CONCAT('%', ?, '%') OR SOUNDEX(postWithReaction.post_text) = SOUNDEX(?)) ORDER BY id, username, likes DESC, comments DESC;
--END_QUERY

--suggestPosts => QUERY:
SELECT username, profile_pic AS userPic,
 postWithReaction.post_type AS type,
 postWithReaction.post_text, postWithReaction.post_media,
 postWithReaction.likes , comments.post_id AS id, COUNT(*) AS comments, postWithReaction.post_date AS date
 FROM postWithReaction, users, comments
 WHERE users.id = postWithReaction.user_id AND comments.post_id = postWithReaction.id 
 AND (
     username IN (SELECT username FROM users WHERE id IN (
         SELECT followin FROM follow WHERE follower=?
     ))
    /*OR
    (
        comments.post_id IN (
            SELECT post_id FROM posts WHERE user_id IN (
                SELECT user_id FROM posts WHERE post_id IN (
                    SELECT post_id FROM interactions WHERE user_id = ?/* AND DAYOFYEAR(like_date) = DAYOFYEAR(NOW())
                )
            )
        )
    )*/
    OR
    comments.post_id IN (
        SELECT post_id FROM comments WHERE user_id IN (
            SELECT followin FROM follow WHERE follower=?
        )/* AND DAYOFYEAR(comment_date) = DAYOFYEAR(NOW())*/
    )
 ) AND username != (SELECT username FROM users WHERE id=?)
 GROUP BY comments.post_id
 UNION
 SELECT username, profile_pic AS userPic,
 postWithReaction.post_type AS type,
 postWithReaction.post_text, postWithReaction.post_media,
 postWithReaction.likes , postWithReaction.id AS id, 0 AS comments, postWithReaction.post_date AS date
 FROM postWithReaction, users
 WHERE users.id = postWithReaction.user_id 
 AND (
    /* get the posts from my followings */
    username IN (SELECT username FROM users WHERE id IN (
         SELECT followin FROM follow WHERE follower=?
     ))
    /*OR
    /* get the posts from my old interactions (canceled)
    (
        postWithReaction.id IN (
            SELECT post_id FROM posts WHERE user_id IN (
                SELECT user_id FROM posts WHERE post_id IN (
                    SELECT post_id FROM interactions WHERE user_id = ?/* AND DAYOFYEAR(like_date) = DAYOFYEAR(NOW())
                )
            )
        )
    )*/
    OR /* select posts that my followings commented in */
    postWithReaction.id IN (
        SELECT post_id FROM comments WHERE user_id IN (
            SELECT followin FROM follow WHERE follower=?
        )
    )
 ) AND username != (SELECT username FROM users WHERE id=?)
 ORDER BY DAYOFYEAR(date) DESC, username, id, likes DESC, comments DESC LIMIT 40;
--END_QUERY

--createPost => QUERY:
INSERT INTO posts(user_id, post_type, post_text, post_media, post_date) VALUES (?, ?, ?, ?, NOW());
--END_QUERY

--getLastPost => QUERY:
SELECT post_id FROM posts WHERE user_id=? ORDER BY post_date DESC LIMIT 1;
--END_QUERY

--getChats => QUERY:
SELECT chats.chat_id AS id, "chat" AS type
, (SELECT username FROM users WHERE id=chat_user1) AS username
, (SELECT profile_pic FROM users WHERE id=chat_user1) AS profile
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, COUNT(*) AS unseen
 FROM chats, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE chats.chat_id = mesage.chat_id AND mesage.stat=0 AND chat_user1 != ? AND chat_user2 = ? GROUP BY chats.chat_id
 UNION
 SELECT chats.chat_id AS id, "chat" AS type
, (SELECT username FROM users WHERE id=chat_user2) AS username
, (SELECT profile_pic FROM users WHERE id=chat_user2) AS profile
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, COUNT(*) AS unseen
 FROM chats, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE chats.chat_id = mesage.chat_id AND mesage.stat=0 AND chat_user2 != ? AND chat_user1 = ? GROUP BY chats.chat_id
 UNION
  SELECT groups.group_id AS id, "group" AS type
, groups.group_name AS username
, groups.group_pic AS profile
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, COUNT(*) AS unseen
 FROM groups, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE groups.group_id = mesage.group_id AND mesage.stat=0 AND EXISTS (
     SELECT * FROM group_members WHERE group_members.group_id = groups.group_id AND group_members.user_id=?
     ) GROUP BY groups.group_id
UNION
SELECT chats.chat_id AS id, "chat" AS type
, (SELECT username FROM users WHERE id=chat_user1) AS username
, (SELECT profile_pic FROM users WHERE id=chat_user1) AS profile
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, 0 AS unseen
 FROM chats, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE chats.chat_id = mesage.chat_id  AND chat_user1 != ? AND chat_user2 = ? GROUP BY chats.chat_id
 UNION
 SELECT chats.chat_id AS id, "chat" AS type
, (SELECT username FROM users WHERE id=chat_user2) AS username
, (SELECT profile_pic FROM users WHERE id=chat_user2) AS profile
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, 0 AS unseen
 FROM chats, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE chats.chat_id = mesage.chat_id AND chat_user2 != ? AND chat_user1 = ? GROUP BY chats.chat_id
 UNION
  SELECT groups.group_id AS id, "group" AS type
, groups.group_name AS username
, groups.group_pic AS profile
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, 0 AS unseen
 FROM groups, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE groups.group_id = mesage.group_id AND EXISTS (
     SELECT * FROM group_members WHERE group_members.group_id = groups.group_id AND group_members.user_id=?
     ) GROUP BY groups.group_id ORDER BY sent_date DESC, unseen DESC;
--END_QUERY

--getMessages => QUERY:
SELECT * FROM 
(
    SELECT message_id AS id, sender_id AS user, users.profile_pic AS profile, mesage_type AS type, message_data AS data, sent_date
    FROM messages, users
    WHERE chat_id = ? AND users.id = sender_id AND EXISTS (SELECT chat_id FROM chats WHERE chat_id = ? AND (chat_user1 = ? OR chat_user2 = ?))
    ORDER BY sent_date DESC LIMIT 100
) AS datas ORDER BY sent_date ASC;
--END_QUERY

--getGroupMessages => QUERY:
SELECT * FROM 
(
    SELECT message_id AS id, sender_id AS user, users.profile_pic AS profile, mesage_type AS type, message_data AS data, sent_date
    FROM messages, users
    WHERE group_id = ? AND users.id = sender_id AND EXISTS (SELECT group_id FROM group_members WHERE group_id=? AND user_id = ?)
    ORDER BY sent_date DESC LIMIT 100
) AS datas ORDER BY sent_date ASC;
--END_QUERY

--getDashboard => QUERY:
SELECT user_id, post_id, COUNT(*) AS count FROM (SELECT comment_id AS id, user_id, post_id, comment_date AS date, 'comment' AS type FROM comments
    UNION
    SELECT 0 AS id, user_id, post_id, like_date AS date, 'like' AS type FROM interactions) AS tb
    GROUP BY user_id, post_id;
--END_QUERY

--checkIn => QUERY:
SELECT chat_id FROM chats WHERE chat_id = ? AND (
    chat_user1 = (SELECT id FROM users WHERE username = ?) 
    OR 
    chat_user2 = (SELECT id FROM users WHERE username = ?)
);
--END_QUERY

--checkMember => QUERY:
SELECT group_id FROM group_members WHERE group_id = ? AND user_id = (SELECT id FROM users WHERE username = ?);
--END_QUERY

--getAMessage => QUERY:
SELECT chat_id, group_id FROM messages WHERE mesage_type != 'text' AND message_data = ?;
--END_QUERY

--sendMsg => QUERY:
INSERT INTO messages(sender_id, chat_id, mesage_type, message_data, sent_date) VALUES (
    (SELECT id FROM users WHERE username = ?), ?, ?, ?, NOW());
--END_QUERY

--sendGMsg => QUERY:
INSERT INTO messages(sender_id, group_id, mesage_type, message_data, sent_date) VALUES (
    (SELECT id FROM users WHERE username = ?), ?, ?, ?, NOW());
--END_QUERY

--returnMsg => QUERY:
SELECT message_id AS id, (SELECT profile_pic FROM users WHERE users.id = sender_id) AS profile FROM messages 
WHERE sender_id = (SELECT id FROM users WHERE username = ?) ORDER BY sent_date DESC LIMIT 1;
--END_QUERY

--setSeenMesages => QUERY:
UPDATE messages SET stat = 1 WHERE ? = ? AND sender_id != (SELECT id FROM users WHERE username = ?);
--END_QUERY


--deleteMesage => QUERY:
DELETE FROM messages WHERE sender_id = (SELECT id FROM users WHERE username = ?) AND message_id = ?;
--END_QUERY

--getMessagebyId => QUERY:
SELECT message_data AS msg, mesage_type AS type FROM messages WHERE message_id = ?;
--END_QUERY


--existsChat => QUERY:
SELECT chat_id FROM chats WHERE
    (chat_user1 = (SELECT id FROM users WHERE username = ?) OR chat_user2 = (SELECT id FROM users WHERE username = ?))
    AND
    (chat_user1 = (SELECT id FROM users WHERE username = ?) OR chat_user2 = (SELECT id FROM users WHERE username = ?))
    AND
    EXISTS (SELECT id FROM users WHERE username = ?);
--END_QUERY


--addChat => QUERY:
INSERT INTO chats(chat_user1, chat_user2) VALUES ((SELECT id FROM users WHERE username = ?), (SELECT id FROM users WHERE username = ?));
--END_QUERY

--getChat => QUERY:
SELECT chat_id AS id FROM chats WHERE chat_user1 = (SELECT id FROM users WHERE username = ?) ORDER BY id DESC LIMIT 1;
--END_QUERY

--getUpdatedChat => QUERY:
SELECT * FROM (SELECT chats.chat_id AS id, "chat" AS type
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, COUNT(*) AS unseen
 FROM chats, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE chats.chat_id = mesage.chat_id AND mesage.stat = 0 AND chats.chat_id = ?
 GROUP BY chats.chat_id
 UNION
SELECT groups.group_id AS id, "group" AS type
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, COUNT(*) AS unseen
 FROM groups, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE groups.group_id = mesage.group_id AND mesage.stat = 0 AND groups.group_id = ?
 GROUP BY groups.group_id
 UNION
 SELECT chats.chat_id AS id, "chat" AS type
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, 0 AS unseen
 FROM chats, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE chats.chat_id = mesage.chat_id AND chats.chat_id = ?
 GROUP BY chats.chat_id
 UNION
SELECT groups.group_id AS id, "group" AS type
, mesage.sender_id AS sender, mesage.message_data, mesage.mesage_type, mesage.stat, mesage.sent_date, 0 AS unseen
 FROM groups, (SELECT * FROM messages ORDER BY sent_date DESC) AS mesage
 WHERE groups.group_id = mesage.group_id AND groups.group_id = ?
 GROUP BY groups.group_id) AS userChats WHERE type = ? LIMIT 1;
--END_QUERY

--getchatMembers => QUERY:
SELECT chat_user1, chat_user2 FROM chats WHERE chat_id = ?;
--END_QUERY

--getgroupMembers => QUERY:
SELECT user_id FROM group_members WHERE group_id = ?;
--END_QUERY