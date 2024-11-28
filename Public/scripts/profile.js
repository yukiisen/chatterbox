if (location.pathname === '/profile' || location.pathname === '/profile/') {
    function updateprofile() {
        const data = document.querySelectorAll('.profile .data *');
        const connect = document.querySelectorAll('.profile .connect span');
        document.getElementsByName('userid')[0].value = data[1].textContent;
        document.getElementsByName('username')[0].value = data[0].textContent;
        document.getElementsByName('bio')[0].value = data[2].textContent;
        document.getElementsByName('email')[0].value = connect[1].textContent;
        document.getElementsByName('insta')[0].value = connect[0].textContent;
    }

    updateprofile();

    const fs = new FileReader();

    //var preF;

    var readfile = (e) => {
        window[e].addEventListener('change', () => {
            try {
                fs.onloadend = () => {
                    window[e].parentElement.style.backgroundImage = `url(${fs.result})`;
                }
                fs.readAsDataURL(this[e].files[0]);
                //preF = this[e].files[0];
            } catch (error) {
                window[e].parentElement.style.backgroundImage = ``;
            };
        });
    };
    readfile('pfpload');
    readfile('coverload');
} else {
    document.getElementById('follow').addEventListener('click', () => {
        let user = document.getElementById('username').textContent;
        user = user.replace('@', '');
        socket.emit('follow', user);
        socket.once('followed', data => {
            document.getElementById('followersCount').textContent = parseNumber(data.followers);
            let btn = document.getElementById('follow');
            if (btn.textContent == 'Follow') {
                btn.textContent = 'Unfollow';
            } else {
                btn.textContent = 'Follow';
            };
        });
    });
};

let suggestions = document.querySelectorAll('.account');
suggestions.forEach((e) => {
    e.querySelector('button').addEventListener('click', () => {
        let user = e.querySelector('a span').textContent;
        socket.emit('follow', user);
        e.querySelector('button').textContent = e.querySelector('button').textContent == 'Follow'? 'Unfollow': 'Follow';
    });
});


document.getElementById('searchlist').addEventListener('input' , (e) => {
    const search = e.target.value;
    const list = document.querySelectorAll('.followerslist ul li');
    list.forEach((e) => {
        if (e.querySelector('span').textContent.indexOf(search) === -1) {
            e.classList.add('hide');
        } else {
            e.classList.remove('hide');
        };
    });
});

document.getElementById('followingsCount').addEventListener('click', getF(0));

const pfp = document.getElementsByClassName('pfpic')[0];

pfp.addEventListener('click', () => {
    showWin('profilePic');
});
function resizePFP() {
    if (window.innerWidth > 767) {
        const size = window.innerHeight * 60 / 100;
        document.styleSheets[2].addRule('.profilePic', `width: ${size}px;height: 60%;`);
    } else if (window.innerWidth < 767) {
        const size = window.innerWidth * 85 / 100;
        document.styleSheets[2].addRule('.wincon .profilePic', `width: 85%;height:${size}px ;`);
    }
};
resizePFP();
window.addEventListener('resize', resizePFP);


document.getElementById('followersCount').addEventListener('click', getF(1));

function getF(what) {
    return (e) => {
        let user = document.querySelector('#username').textContent;
        let id = user.split('');
        id.shift();
        user = id.join('');
        socket.emit('getFollow', {what: what, user: user});
        socket.once('setFollow', (data) => {
            let list = document.querySelector('.followerslist ul');
            list.innerHTML = '';
            data.forEach((e) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                    a.href = `/profile/${e.username}/`;
                    a.classList.add('accin');
                const img = document.createElement('img');
                    img.src = `/uploads/${e.picture}`;
                    img.classList.add('pfp');
                const span = document.createElement('span');
                    span.classList.add('mid');
                    span.textContent = e.username;
                const div = document.createElement('div');
                    div.classList.add('pfpcontainer');
                const button = document.createElement('button');
                    button.textContent =  e.isFollowed? 'Unfollow': 'Follow';
                    button.onclick = (event) => {
                        socket.emit('follow', e.username);
                        button.textContent = button.textContent == 'Follow'? 'Unfollow': 'Follow';
                    };
                div.appendChild(img)
                a.appendChild(div);
                a.appendChild(span);
                li.appendChild(a);
                if (!e.me) {
                    li.appendChild(button);
                }
                list.appendChild(li);
            });
            showWin('followerslist');
        });
    }
};
