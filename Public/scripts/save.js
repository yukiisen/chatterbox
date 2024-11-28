document.querySelectorAll('.posts .post').forEach((e) => {
    e.addEventListener('click', () => {
        location.assign(`/community/post?id=${e.getAttribute('post')}`);
    });
});