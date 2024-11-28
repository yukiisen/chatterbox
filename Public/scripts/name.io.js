const socket = io.connect({secure: true});

const token = window.token.getAttribute('token');

window.token.remove();

socket.on('authenticated', result => {
    if (!result) {
        location.reload();
    };
});

socket.on('back', () => {
    socket.emit('authenticate', token);
});

socket.on('error', () => {
    window.location.reload();
});

const funNe = data => {
    const parent = document.getElementById('placer');
    const element = document.createElement('div');
    const a = document.createElement('a');
    const img = document.createElement('img');
    const div = document.createElement('div');
    const p = document.createElement('p');
    const btn = document.createElement('img');

    element.classList.add('notification');
    div.classList.add('pfpcontainer');

    btn.src = '/svg/close.svg';
    btn.classList.add('svg');
    btn.onclick = () => {
        //console.log(btn.parentElement);
        btn.parentElement.style.animationName = 'notify';
        btn.parentElement.style.animationDirection = 'reverse';
        setTimeout(() => {
            btn.parentElement.remove();
        }, 490);
    };
    img.classList.add('pfp');
    p.classList.add('large');
    a.href = data.link;
    img.src = `/uploads/${data.picture}`;
    p.textContent = data.text;
    div.appendChild(img)
    a.appendChild(div);
    a.appendChild(p);
    element.appendChild(a);
    element.appendChild(btn);

    if (parent.children.length === 3) {
        Array.from(parent.children)[0].remove();
    };

    parent.appendChild(element);
    element.style.animationName = 'notify';
    element.style.animationDirection = 'normal';
    setTimeout(() => {
        element.style.animationName = '';
    }, 500);
}

socket.on('notification', funNe);

function containsArabic(text) {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
};

function containsJapanese(text) {
    const japaneseRegex = /[\u3040-\u30FF\u31F0-\u31FF\uFF00-\uFFEF\u4E00-\u9FAF\u3400-\u4DBF]/;
    return japaneseRegex.test(text);
};