let posts = {};

function postsIni(){
    posts.settings = document.querySelectorAll('.posts .accin img[class="svg"]');
    posts.reactions = document.querySelectorAll('.posts .interact img[src="/svg/heart-alt-svgrepo-com.svg"], .interact img[src="/svg/heart-col-alt-svgrepo-com.svg"]');
    posts.saves = document.querySelectorAll('.posts .interact img[src="/svg/bookmark-svgrepo-com.svg"], .interact img[src="/svg/bookmark-col-svgrepo-com.svg"]');
    posts.comments = document.querySelectorAll('.posts .interact img[src="/svg/comment-circle-list-svgrepo-com.svg"]');
    posts.data = document.querySelectorAll('.posts .post .data');

    posts.settings.forEach((element, i) => {
        element.addEventListener('click', () => {
            document.querySelectorAll('.wincon .settings li').forEach(e => {
                e.setAttribute('target', element.parentElement.parentElement.getAttribute('post'));
            });
            socket.emit('requestName');
            socket.once('responseName', (name) => {
                let creator = element.parentElement.querySelector('.mid').textContent;
                if (creator !== name) {
                    document.getElementById('deletepost').classList.add('hidden');
                    document.getElementById('editpost').classList.add('hidden');
                } else {
                    document.getElementById('deletepost').classList.remove('hidden');
                    document.getElementById('editpost').classList.remove('hidden');
                }
                showWin('settings');
            });
            
            if (posts.saves[i].getAttribute('src') != '/svg/bookmark-svgrepo-com.svg') {
                window.savepost.textContent = 'Unsave';
            } else {
                window.savepost.textContent = 'Save';
            }
        }); 
    });

    posts.data.forEach((element) => {
        if (containsArabic(element.querySelector('pre, span.input').textContent)) {
            element.classList.add('tright')
        }
    })

    if (window.innerWidth > 767) {
        posts.comments.forEach((element, i) => {
            element.addEventListener('click', () => {
                window.closer.onclick = () => {
                    let conData = document.querySelectorAll('.wincon .post .data')[0];
                    let currentVideo = posts.data[i].querySelectorAll('video')[0];
                    if (currentVideo) {
                        conData.querySelectorAll('video')[0].pause();
                    }
                    setTimeout((conData, currentVideo) => {
                        if (currentVideo) {
                            currentVideo.currentTime = conData.querySelectorAll('video')[0].currentTime;
                        };
                        tempClose();
                    }, 100, conData, currentVideo);
                    
                };
                let postId =  posts.settings[i].parentElement.parentElement.getAttribute('post');
                socket.emit('getComments', +postId);
                showWin('fullpost');

                initializePost(i);

                let conData = document.querySelectorAll('.wincon .post .data')[0]
                conData.innerHTML = posts.data[i].innerHTML;

                let currentVideo = posts.data[i].querySelectorAll('video')[0];

                if (currentVideo) {
                    currentVideo.pause();
                    conData.querySelectorAll('video')[0].currentTime = currentVideo.currentTime;
                    conData.querySelectorAll('video')[0].play();
                };

                if (posts.data[i].parentElement.classList.contains('text')) {
                    document.querySelectorAll('.wincon .post')[0].classList.add('text');
                }else{
                    document.querySelectorAll('.wincon .post')[0].classList.remove('text');
                };
                if (posts.data[i].parentElement.classList.contains('img')) {
                    document.querySelectorAll('.wincon .post')[0].classList.add('img');
                    
                }else{
                    document.querySelectorAll('.wincon .post')[0].classList.remove('img');
                };
                if (posts.data[i].classList.contains('tright')) {
                    document.querySelectorAll('.wincon .post .data')[0].classList.add('tright');
                }else{
                    document.querySelectorAll('.wincon .post .data')[0].classList.remove('tright');
                };
                document.querySelectorAll('.fullpost .post')[0].setAttribute('target', postId);
                document.querySelectorAll('.fullpost .post .accin div')[0].innerHTML = posts.settings[i].previousElementSibling.innerHTML;
                setTimeout(()=> {
                    setImage('.fullpost .post .data img, .fullpost .post .data video', 0, true);
                }, 200);
                setTimeout(()=> {
                    setImage('.fullpost .post .data img, .fullpost .post .data video', 0, true);
                }, 3000);
            });
        });
    } else {
        posts.comments.forEach((e, i) => {
            e.addEventListener('click', (event) => {
                let postId = posts.data[i].parentElement.getAttribute('post');
                location.assign(`/posts?id=${postId}`);
            });
        });
    };

    for (let i = 0; i < posts.data.length; i++) {
        setImage('.posts .img .data img, .posts .img .data video', i);
    };


    posts.reactions.forEach((element, index) => {
        element.addEventListener('click', () => {
            let post = element.parentElement.parentElement.parentElement.parentElement.getAttribute('post');
            socket.emit('postLike', +post);
        });
        document.querySelectorAll('.posts .post')[index].addEventListener('dblclick', () => {
            element.click();
        });
    });


    posts.saves.forEach((element) => {
        element.addEventListener('click', () => {
            let post = element.parentElement.parentElement.parentElement.getAttribute('post');
            socket.emit('postSave', +post);
            if (element.getAttribute('src') == '/svg/bookmark-svgrepo-com.svg') {
                element.src = '/svg/bookmark-col-svgrepo-com.svg';
            } else{
                element.src = '/svg/bookmark-svgrepo-com.svg';
            };
        });
    });
}

socket.on('likes', (post, likes) => {
    //alert(likes);
    //alert(post);
    try {
        let element = document.querySelector(`.posts > div[post="${post}"] img[src="/svg/heart-alt-svgrepo-com.svg"], .posts > div[post="${post}"] img[src="/svg/heart-col-alt-svgrepo-com.svg"]`);
        //console.log(parseNumber(likes));
        //console.log(element);
        element.nextElementSibling.textContent = parseNumber(likes);
        if (element.getAttribute('src') == '/svg/heart-alt-svgrepo-com.svg') {
            element.src = '/svg/heart-col-alt-svgrepo-com.svg';
            //likes.textContent = parseNumber(parseNumber(likes.textContent) + 1);
        } else{
            element.src = '/svg/heart-alt-svgrepo-com.svg';
            //likes.textContent = parseNumber(parseNumber(likes.textContent) - 1);
        };
    } catch (error) {
        console.error(error);
    };
});

window.onload = () => {
    postsIni();
    for (let i = 0; i < posts.data.length; i++) {
        setImage('.posts .img .data img, .posts .img .data video', i);
    };
    /*setTimeout(() => {
        for (let i = 0; i < posts.data.length; i++) {
            setImage('.posts .img .data img, .posts .img .data video', i);
        };
    }, 5000);*/
};

function initializePost(i) {
    if (posts.saves[i].getAttribute('src') != '/svg/bookmark-svgrepo-com.svg') {
        document.querySelectorAll('.wincon .post .interact img')[2].setAttribute('src', '/svg/bookmark-col-svgrepo-com.svg')
    } else {
        document.querySelectorAll('.wincon .post .interact img')[2].setAttribute('src', '/svg/bookmark-svgrepo-com.svg')
    };
    if (posts.reactions[i].getAttribute('src') != '/svg/heart-alt-svgrepo-com.svg') {
        document.querySelectorAll('.wincon .post .interact img')[0].setAttribute('src', '/svg/heart-col-alt-svgrepo-com.svg')
    } else {
        document.querySelectorAll('.wincon .post .interact img')[0].setAttribute('src', '/svg/heart-alt-svgrepo-com.svg')
    };
    document.querySelectorAll('.wincon .post .interact img')[0].nextElementSibling.textContent = posts.reactions[i].nextElementSibling.textContent;
    document.querySelectorAll('.wincon .post .interact img')[1].nextElementSibling.textContent = posts.comments[i].nextElementSibling.textContent;
};


document.querySelector('.fullpost .comments form').onsubmit = (e) => {
    e.preventDefault();
    let comment = e.srcElement[0].value;
    e.srcElement[0].value = '';
    let post = document.querySelector('.fullpost .post').getAttribute('target');
    socket.emit('setComment', comment, +post);
};

function setImage(selector, i, special) {
    const e = document.querySelectorAll(selector)[i];
    if (!e) {
        return new Error();
    };

    try {
        const type = e.tagName;

        e.style.width = '100px';
        e.style.height = 'fit-content';

        const width = e.getClientRects()[0].width;
        const height = e.getClientRects()[0].height;
        if (window.innerWidth > 767) {
            if (width > height) {
                e.style.height = 'fit-content';
                if (special) {
                    e.style.width = (type == 'IMG')? ('100%'): (window.innerWidth * 60 / 100) + 'px';
                } else {
                    e.style.width = (type == 'IMG')? ('100%'): (e.parentElement.getClientRects()[0].width) + 'px';
                }
            } else if (width < height) {
                e.style.height = (type == 'IMG')? ('100%'): (window.innerHeight * 60 / 100) + 'px';
                e.style.width = 'fit-content';
            } else {
                e.style.width = (window.innerHeight * 60 / 100) + 'px';
                e.style.height = (window.innerHeight * 60 / 100) + 'px';
            };
        } else {
            e.style.width = '100%';
            e.style.height = 'fit-content';
        }
        
    } catch (error) {};
};

window.savepost.addEventListener('click', () => {
    const post = window.savepost.getAttribute('target');
    posts.settings.forEach((e,i) => {
        if (e.parentElement.parentElement.getAttribute('post') == post) {
            posts.saves[i].click();
            hideWindows();
        };
    });
});

socket.on('gotComments', comments => {
    //console.log(comments);
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
                console.log(name);
                console.log(e.username)
                if (name === e.username) {
                    menu[3].classList.remove('hidden');
                    menu[3].onclick = () => {
                        let post = document.querySelector('.fullpost .post').getAttribute('target');
                        socket.emit('deleteComment', e.id, +post);
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

    location.hash = '';
    location.hash = 'comment';
    if (document.querySelector('.fullpost .post').getAttribute('target') !== null) {
        let post = document.querySelector('.fullpost .post').getAttribute('target');
        socket.emit('updateCommentsCount', +post);
    };
});

socket.on('updatedcoms', (count, post) => {
    try {
        document.querySelectorAll('.fullpost .post .interact .left .tool .val')[1].textContent = parseNumber(count);
        document.querySelectorAll(`.posts .post[post="${post}"] .interact .left .tool .val`)[1].textContent = parseNumber(count);
    } catch (error) {
        location.reload();
        //console.error(error);
    };
});

window.reportpost.addEventListener('click', () => {
    const post = window.reportpost.getAttribute('target');
    const date = new Date();
    const report = {
        token: token,
        post: post,
        date: `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDay()} ${date.getUTCHours()}:${date.getUTCMinutes()}`
    };
    fetch('/report', {
        method: 'POST',
        body: JSON.stringify(report),
        headers: {
            'content-type': 'application/json'
        }
    });
    hideWindows();
});

/*window.blockuser.addEventListener('click', () => {
    const post = window.blockuser.getAttribute('target');
    //socket here...
    hideWindows();
});*/

window.deletepost.addEventListener('click', () => {
    const post = window.deletepost.getAttribute('target');
    posts.settings.forEach((e,i) => {
        if (e.parentElement.parentElement.getAttribute('post') == post) {
            hideWindows();
            setTimeout(() => {
                createConfirm('Do you Really Wanna Delete This post?', () => {
                    e.parentElement.parentElement.remove();
                    socket.emit('deletePost', +post);
                });
            }, 100);
            
        };
    });
});

window.editpost.addEventListener('click', () => {
    let post = window.editpost.getAttribute('target');
    posts.data.forEach((e) => {
        if (e.parentElement.getAttribute('post') == post) {
            e.children[0].setAttribute('contenteditable', 'true');
            setTimeout(() => {
                document.onclick = (event) => {
                    if (event.target !== e.children[0]) {
                        e.children[0].setAttribute('contenteditable', 'false');
                        removeEvent();
                        createConfirm('Save changes?', () => {
                            socket.emit('postEdit', e.children[0].textContent, +post);
                        });
                    };
                };
            }, 500);
            hideWindows();
        };
    });
});

function removeEvent() {
    document.onclick = () => {};
};

window.bigheart.addEventListener('click', () => {
    const post = window.bigheart.parentElement.parentElement.parentElement.parentElement.getAttribute('target');
    posts.settings.forEach((e,i) => {
        if (e.parentElement.parentElement.getAttribute('post') == post) {
            const element = posts.reactions[i];
            element.click();
            socket.once('likes', likes => {
                initializePost(i);
            });
        };
    });
});

window.bigsave.addEventListener('click', () => {
    const post = window.bigsave.parentElement.parentElement.parentElement.getAttribute('target');
    posts.settings.forEach((e,i) => {
        if (e.parentElement.parentElement.getAttribute('post') == post) {
            const element = posts.saves[i];
            element.click();
            initializePost(i);
        };
    });
});

window.bigsetting.addEventListener('click', () => {
    const post = window.bigsetting.parentElement.parentElement.getAttribute('target');
    posts.settings.forEach((e,i) => {
        if (e.parentElement.parentElement.getAttribute('post') == post) {
            const element = posts.settings[i];
            window.closer.click();
            element.click();
        };
    });
});

window.bigcomment.addEventListener('click', () => {
    const commentsBox = document.getElementsByName('comment')[0];
    commentsBox.focus();
});

// this is just a template
/*for (let index = 0; index < 30; index++) {
    document.querySelectorAll('.coms')[0].innerHTML += `<li>
    <img src="/pics/tmp3.jpg" class="pfp">
    <span>
        <span class="large">yelan</span>
        <span class="text mid">هي المهم عفرون وخلاص</span>
    </span>
    </li>`;
}*/


function tempClose() {
    hideWindows();
    document.querySelectorAll('.wincon .post .data')[0].innerHTML = '';
    window.closer.onclick = () => {
        hideWindows();
    };
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