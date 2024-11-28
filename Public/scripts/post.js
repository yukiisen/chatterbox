const currentPost = document.querySelector('.post').getAttribute('post');

window.onload = () => {
    setImage('.post .data img, .post .data video', 0);
};
/*
setTimeout(() => {
    setImage('.post .data img, .post .data video', 0);
}, 3000);*/

let doScroll = false;
window.bigsave.addEventListener('click', () => {
    socket.emit('postSave', +currentPost);
    if (window.bigsave.getAttribute('src') == '/svg/bookmark-svgrepo-com.svg') {
        window.bigsave.setAttribute('src', '/svg/bookmark-col-svgrepo-com.svg');
    } else{
        window.bigsave.src = '/svg/bookmark-svgrepo-com.svg';
    };
});

window.bigheart.addEventListener('click', () => {
    socket.emit('postLike', +currentPost);
});

let postData = document.querySelector('.post .data');
if (containsArabic(postData.textContent)) {
    postData.classList.add('tright');
};

document.querySelector('.post').addEventListener('dblclick', () => {
    window.bigheart.click();
});

window.bigsetting.addEventListener('click', () => {
    document.querySelectorAll('.wincon .settings li').forEach(e => {
        e.setAttribute('target', currentPost);
    });
    socket.emit('requestName');
    socket.once('responseName', (name) => {
        let creator = window.bigsetting.parentElement.querySelector('.mid').textContent;
        if (creator !== name) {
            document.getElementById('deletepost').classList.add('hidden');
            document.getElementById('editpost').classList.add('hidden');
        } else {
            document.getElementById('deletepost').classList.remove('hidden');
            document.getElementById('editpost').classList.remove('hidden');
        }
        showWin('settings');
    });
    if (window.bigsave.getAttribute('src') != '/svg/bookmark-svgrepo-com.svg') {
        window.savepost.textContent = 'Unsave';
    } else {
        window.savepost.textContent = 'Save';
    }
});

window.bigcomment.addEventListener('click', () => {
    if (window.innerWidth > 767) {
        const commentsBox = document.getElementsByName('comment')[0];
        commentsBox.focus();
        window.scrollY = commentsBox.getClientRects().y;
    } else {
        location.hash = '';
        location.hash = '#comment';
    }
});


function setImage(selector, i) {
    const e = document.querySelectorAll(selector)[i];
    if (!e) {
        return new Error();
    };

    try {
        const type = e.tagName;

        e.style.width = '100px';

        const width = e.getClientRects()[0].width;
        const height = e.getClientRects()[0].height;

        console.log(width, height * 2);
        console.log(width > (height * 2));

        if (width > (height * 1.7)) {
            e.style.height = 'fit-content';
            e.style.width = (type == 'IMG')? ('100%'): (e.parentElement.getClientRects()[0].width) + 'px';
        } else if (width === height) {
            e.style.width = (window.innerHeight * 50 / 100) + 'px';
            e.style.height = (window.innerHeight * 50 / 100) + 'px';
        } else {
            e.style.height = (type == 'IMG')? ('100%'): (window.innerHeight * 60 / 100) + 'px';
            e.style.width = 'fit-content';
        };
    } catch (error) {};
    return e;
};

function parseNumber(num) {
    let reg = /[a-z]/gi;
    if (num.toString().match(reg)) {
        let arrayNum = num.split('');
        let multiplyer = arrayNum.pop().toUpperCase();
        switch (multiplyer) {
            case 'K':
                return +arrayNum.join('') * 1000;
                break;
            case 'M':
                return +arrayNum.join('') * 1000 * 1000;
                break;
        };
    }else{
        if (+num >= 1000 * 1000) {
            return (+num / 1000000).toFixed(1) + 'M';
        } else if (+num >= 1000){
            return (+num / 1000).toFixed(1) + 'K';
        }else{
            return +num;
        };
    };
};

window.savepost.addEventListener('click', () => {
    window.bigsave.click();
    hideWindows();
});

window.reportpost.addEventListener('click', () => {
    const date = new Date();
    const report = {
        token: token,
        post: currentPost,
        date: `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDay()} ${date.getUTCHours()}:${date.getUTCMinutes()}`
    };
    //console.log(report);
    fetch('/report', {
        method: 'POST',
        body: JSON.stringify(report),
        headers: {
            'content-type': 'application/json'
        }
    });
    hideWindows();
});

window.deletepost.addEventListener('click', () => {
    hideWindows();
    setTimeout(() => {
        createConfirm('Do you Really Wanna Delete This post?', () => {
            socket.emit('deletePost', +currentPost);
            location.assign('/profile');
        });
    }, 100);
});

document.querySelector('.fullpost .comments form').onsubmit = (e) => {
    e.preventDefault();
    let comment = e.srcElement[0].value;
    e.srcElement[0].value = '';
    socket.emit('setComment', comment, +currentPost);
};

window.editpost.addEventListener('click', () => {
    let e = document.querySelector('.post .data');
    e.children[0].setAttribute('contenteditable', 'true');
    setTimeout(() => {
        document.onclick = (event) => {
            if (event.target !== e.children[0]) {
                e.children[0].setAttribute('contenteditable', 'false');
                removeEvent();
                socket.emit('postEdit', e.children[0].textContent, +currentPost);
            };
        };
    }, 500);
    hideWindows();
});

function removeEvent() {
    document.onclick = () => {};
};


//socket stuff..

socket.on('likes', (post, likes) => {
    try {
        let element = document.querySelector(`.post[post="${post}"] img[src="/svg/heart-alt-svgrepo-com.svg"], .post[post="${post}"] img[src="/svg/heart-col-alt-svgrepo-com.svg"]`);
        element.nextElementSibling.textContent = parseNumber(likes);
        if (element.getAttribute('src') == '/svg/heart-alt-svgrepo-com.svg') {
            element.src = '/svg/heart-col-alt-svgrepo-com.svg';
        } else{
            element.src = '/svg/heart-alt-svgrepo-com.svg';
        };
    } catch (error) {
        console.error(error);
    };
});

socket.on('updatedcoms', (count, post) => {
    try {
        document.querySelectorAll(`.post[post="${post}"] .interact .left .tool .val`)[1].textContent = parseNumber(count);
    } catch (error) {
        location.reload();
    };
});

socket.on('gotComments', comments => {
    const list = document.querySelector('.fullpost .comments .coms');
    list.innerHTML = '';
    comments.forEach((e) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const img = document.createElement('img');
        const mainSpan = document.createElement('span');
        const nameSpan = document.createElement('span');
        const dataSpan = document.createElement('span');
        const div = document.createElement('div');
        div.classList.add('pfpcontainer');

        a.href = `/profile/${e.username}/`;
        img.src = `/uploads/${e.profile}`;
        img.classList.add('pfp');
        nameSpan.classList.add('large');
        dataSpan.classList.add('text', 'mid');
        let old = e.comments;
        e.comments = e.comments.replace('<', '&lt');
        e.comments = e.comments.replace('>', '&gt');
        let arr = e.comments.match(/@(\w+)/gi);
        if (arr) {
            arr.forEach((tag) => {
                tag = tag.replace('@', '');
                e.comments = e.comments.replace(`@${tag}`, `@${tag}`.link(`/profile/${tag}`));
            });
        };

        nameSpan.append(e.username);
        dataSpan.innerHTML = e.comments;
        if (containsArabic(e.comments)) {
            dataSpan.style.setProperty('direction', 'rtl');
        }
        mainSpan.appendChild(nameSpan);
        mainSpan.appendChild(dataSpan);
        div.appendChild(img);
        a.appendChild(div);
        li.appendChild(a);
        li.appendChild(mainSpan);

        li.oncontextmenu = (event) => {
            event.preventDefault();
            const menu = showMenu(event);
            menu[0].classList.add('hidden');
            menu[2].classList.add('hidden');
            if (navigator.clipboard) {
                menu[1].onclick = () => {
                    navigator.clipboard.writeText(old);
                };
            } else {
                menu[1].classList.add('hidden');
            };
            socket.emit('requestName');
            menu[3].classList.add('hidden');
            socket.once('responseName', name => {
                if (name === e.username) {
                    menu[3].classList.remove('hidden');
                    menu[3].onclick = () => {
                        socket.emit('deleteComment', e.id, +currentPost);
                    }
                };
            });
            menu[4].onclick = () => {
                let box = document.getElementsByName('comment')[0]
                box.value += `@${e.username} `;
                box.focus();
            }
        };

        list.appendChild(li);
    });
    const scroller = document.createElement('span');
    scroller.id = 'comment';
    list.appendChild(scroller);
    if (!doScroll && window.innerWidth < 767) {
        location.hash = '';
    } else {
        location.hash = '';
        location.hash = 'comment';
    };
    doScroll = true;
    if (currentPost) {
        socket.emit('updateCommentsCount', +currentPost);
    };
});

socket.on('authenticated', (e) => {
    if (e) {
        socket.emit('getComments', +currentPost);
    };
});