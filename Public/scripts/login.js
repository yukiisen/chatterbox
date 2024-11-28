const words = [
    'Connect with friends.'
    , 'Chat.'
    , 'Play.'
    , 'Share.'
    , 'Stream.'
    , 'And More.'
    , 'Welcome to ChatterBox.'
];

function hide(element, text, cb) {
    var newVal = element.textContent;
    var i = setInterval(() => {
        if (newVal == '') {
            cb(element, text);
            clearInterval(i);
        }else{
            newVal = newVal.split('');
            newVal.length -= 1;
            newVal = newVal.join('');
            element.textContent = newVal;
        };
    }, 50);
};

var show = function(element, value) {
    if (value === undefined) {
        return;
    };
    var val = value.split('');
    var i = 0;
    var int = setInterval(() =>{
        element.textContent += val[i];
        ++i;
        if (i == val.length) {
            clearInterval(int);
        };
    }, 50);
};

var word = -1;
var hello = document.getElementsByClassName('hello')[0];

var rep = function () {
    hide(hello, words[word], show);
    word++;
    if (word == words.length) {
        word = 0;
    }; 
    setTimeout(() => {
        rep();
    }, 2300);
};

setTimeout(() => {
    rep();
}, 500);
/*
document.getElementsByClassName('form')[0].onsubmit = (e) => {
    e.preventDefault();
    const usr = document.getElementById('user').value;
    const psw = document.getElementById('pass').value;
    if (usr !== '' && psw !== '') {
        if (usr.match(/[^._]/gi).join('').match(/[^0-9a-z]/gi) === null && usr.match(/[a-z]/gi)) {
            transform('recOut', 'recIn');
            showWin('recap');
        }else{
            document.getElementById('err').style.display = 'block';
            document.getElementsByTagName('label')[2].style.marginTop = 0;
        };
    };
};
*/
document.addEventListener('keydown', (e) => {
    e.key == 'Enter'? window.log.click(): null;
});