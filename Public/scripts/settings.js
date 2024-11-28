const actions = document.querySelectorAll('.settings ul li');

actions[0].addEventListener('click', () => {
    createConfirm('Do you really Want To Delete All of Your Posts?', () => {
        //socket...
        hideWindows();
    });
});

actions[1].addEventListener('click', () => {
    createConfirm('Do you really want to delete your Account?', () => {
        location.assign('/accounts/delete');
    });
});

actions[2].addEventListener('click', () => {
    location.href = 'mailto:chatter.box.app20@gmail.com';
});