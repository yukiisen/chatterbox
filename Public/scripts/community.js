window.attachment.addEventListener('change', () => {
    if (window.attachment.files.length > 0) {
        document.querySelector('button[onclick="window.attachment.click()"] img').src = '/svg/attachment-copy-svgrepo-com .svg';
    } else {
        document.querySelector('button[onclick="window.attachment.click()"] img').src = '/svg/attachment-svgrepo-com.svg';
    };
});

document.querySelector('.createpost').addEventListener('submit', (e) => {
    e.preventDefault();
});

document.getElementById('post').addEventListener('click', () => {
    document.querySelector('.createpost').removeEventListener('submit', (e) => {
        e.preventDefault();
    });
    document.querySelector('.createpost').submit();
});