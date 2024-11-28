const users = Array.from(document.querySelector('ul.users').children);

users.forEach(function (user) {
    try {
        user.querySelector('button').onclick = () => {
            const username = user.querySelector('span').textContent;
            socket.emit('follow', username);
            user.querySelector('button').textContent = user.querySelector('button').textContent === 'Follow'? 'Unfollow': 'Follow';
        };
    } catch (error) {}
});