let prevMsg = {};

chat.on('authenticated', () => {
    if (location.pathname != '/inbox') {
        let path = location.pathname.split('/');
        path.shift();
        chat.emit('join', path[0], +path[1]);
    }
});

window.addEventListener('load', () => {
    prevMsg = {
        e: document.getElementsByClassName('messagesl')[0].lastChild, 
        user: document.querySelector('.messagesl li:last-child img').getAttribute('src')
    }
});

const Messagesl = document.getElementsByClassName('messagesl')[0];

document.getElementById('sendbtn').onclick = function () {
    let msg = document.getElementsByName('msg')[0].value;
    if (msg !== '') {
        chat.emit('message.send', { type: 'text', msg: msg });
    };
    document.getElementsByName('msg')[0].value = '';
};

chat.on('message', ({ type, id, sender, data, mine }) => {
    addMessage(type, data, id, sender, mine);
    if (type === 'text') {
        scrollDown();
    }
    if (!mine) {
        chat.emit('seen');
    };
});

document.getElementsByName('msg')[0].addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        window.sendbtn.click();
    };
});

function scrollDown() {
    if (navigator.userAgent.toLowerCase().indexOf('android') === -1) {
        setTimeout(() => {
            document.getElementsByName('msg')[0].focus();
        }, 1300);
    };
    location.hash = '';
    location.hash = 'scrl';
}
/*
document.getElementsByName('msg')[0].addEventListener('input', e => {
    if (containsArabic(e.target.value)) {
        e.target.style.direction = 'rtl';
    } else {
        e.target.style.direction = 'ltr';
    }
})*/


function addMessage(type, data, id = 1000, sender, mine = true) {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const p = document.createElement('p');
    const pfp = document.createElement('img');

    li.classList.add(mine? 'right': 'left');
    li.classList.add(prevMsg.user === sender? 'new': 'pshhhhh');
    li.setAttribute('message', id);

    p.classList.add('msg');

    div.classList.add('pfpcontainer');

    pfp.classList.add('pfp');
    pfp.src = sender;

    if (prevMsg.user === sender) {
        prevMsg.e.querySelector('p').classList.add(!mine? 'no-bl': 'no-br');
        p.classList.add(!mine? 'no-tl': 'no-tr');
        div.style.visibility = 'hidden';
    }

    p.oncontextmenu = (e) => {
        e.preventDefault();
        const menu = showMenu(e);
        menu[0].classList.add('hidden');
        menu[2].classList.add('hidden');
        menu[4].classList.add('hidden');
        if (!navigator.clipboard) {
            menu[1].classList.add('hidden');
        } else {
            menu[1].onclick = () => {
                if (p.classList.contains('img')) {
                    navigator.clipboard.writeText(li.querySelector('p > *').src);
                } else navigator.clipboard.writeText(p.textContent);
            };
        };
        if (!li.classList.contains('right')) {
            menu[3].classList.add('hidden');
        } else {
            menu[3].onclick = () => {
                createConfirm('Delete this message?', () => {
                    chat.emit('delete.message', id);
                    li.remove();
                    prevMsg = {
                        e: document.getElementsByClassName('messagesl')[0].lastChild, 
                        user: document.querySelector('.messagesl li:last-child img').getAttribute('src')
                    };
                });
            };
        };
        if (!p.classList.contains('img')) {
            menu[5].classList.add('hidden');
            menu[6].classList.add('hidden');
        } else {
            menu[5].onclick = () => {
                const download = document.createElement('a');
                download.download = li.querySelector('p > *').getAttribute('src');
                download.href = li.querySelector('p > *').getAttribute('src');
                document.body.appendChild(download);
                download.click();
                download.remove();
            };
            menu[6].onclick = () => {
                const download = document.createElement('a');
                download.href = li.querySelector('p > *').src;
                download.setAttribute('target', '_blank');
                document.body.appendChild(download);
                download.click();
                download.remove();
            };
        };
    };

    switch (type) {
        case 'text':
            p.textContent = data;
            break;
        case 'img':
            p.classList.add('img');
            const img = document.createElement('img');
            img.src = data;
            img.onload = () => {
                scrollDown();
            }
            p.appendChild(img);
        default:
            break;
    }

    if (containsArabic(data)) {
        p.style.setProperty('direction', 'rtl');
    }
    div.appendChild(pfp);
    if (mine) {
        li.appendChild(p);
        li.appendChild(div);
    } else {
        li.appendChild(div);
        li.appendChild(p);
    };

    Messagesl.appendChild(li);

    prevMsg = {
        e: document.getElementsByClassName('messagesl')[0].lastChild, 
        user: document.querySelector('.messagesl li:last-child img').getAttribute('src')
    };
};

const imgInput = document.getElementById('filez');

imgInput.onchange = () => {
    if (imgInput.files.length) {
        const removals = [];
        Array.from(imgInput.files).forEach((file, index) => {
            if (file.size > 1000000 || file.type.indexOf('image/') != 0) {
                removals.push(index);
                createWindow('Unsupported file type!');
            };
        });
        createConfirm('Do you want to Send The Pictures?', () => {
            let counter = 0;
            for (let i = 0; i < imgInput.files.length; i++) {
                const file = imgInput.files[i];
                if (removals.includes(i)) {
                    ++counter;
                    //console.log(reader.result);
                    if (counter == imgInput.files.length) {
                        document.querySelector('button[onclick="window.filez.click()"] img').src = '/svg/image-plus-svgrepo-com.svg';
                        imgInput.value = '';
                    };
                    continue;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    chat.emit('message.send', { type: 'img', msg: reader.result });
                    ++counter;
                    //console.log(reader.result);
                    if (counter == imgInput.files.length) {
                        document.querySelector('button[onclick="window.filez.click()"] img').src = '/svg/image-plus-svgrepo-com.svg';
                        imgInput.value = '';
                    };
                };
                reader.readAsDataURL(file);
            };
        });
    };
};

Array.from(Messagesl.children).forEach(message => {
    const id = message.getAttribute('message');
    if (containsArabic(message.querySelector('p').textContent)) {
        message.querySelector('p').style.direction = 'rtl';
    }
    message.querySelector('p').oncontextmenu = (e) => {
        e.preventDefault();
        const menu = showMenu(e);
        menu[0].classList.add('hidden');
        menu[2].classList.add('hidden');
        menu[4].classList.add('hidden');
        if (!navigator.clipboard) {
            menu[1].classList.add('hidden');
        } else {
            menu[1].onclick = () => {
                if (message.querySelector('p').classList.contains('img')) {
                    navigator.clipboard.writeText(message.querySelector('p > *').src);
                } else navigator.clipboard.writeText(message.querySelector('p').textContent);
            };
        };
        if (!message.classList.contains('right')) {
            menu[3].classList.add('hidden');
        } else {
            menu[3].onclick = () => {
                createConfirm('Delete this message?', () => {
                    chat.emit('delete.message', id);
                    message.remove();
                    prevMsg = {
                        e: document.getElementsByClassName('messagesl')[0].lastChild, 
                        user: document.querySelector('.messagesl li:last-child img').getAttribute('src')
                    };
                });
            };
        };
        if (!message.querySelector('p').classList.contains('img')) {
            menu[5].classList.add('hidden');
            menu[6].classList.add('hidden');
        } else {
            menu[5].onclick = () => {
                const download = document.createElement('a');
                download.download = message.querySelector('p > *').getAttribute('src');
                download.href = message.querySelector('p > *').getAttribute('src');
                document.body.appendChild(download);
                download.click();
                download.remove();
            };
            menu[6].onclick = () => {
                const download = document.createElement('a');
                download.href = message.querySelector('p > *').src;
                download.setAttribute('target', '_blank');
                document.body.appendChild(download);
                download.click();
                download.remove();
            };
        };
    };
});


let li = document.createElement('li');
li.textContent = 'Download';
document.getElementsByClassName('contextMenu')[0].appendChild(li);

li = document.createElement('li');
li.textContent = 'View';
document.getElementsByClassName('contextMenu')[0].appendChild(li);