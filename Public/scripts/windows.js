const container = document.getElementsByClassName('wincon')[0];
var currentWindow;
container.showIt = function () {
    container.classList.remove('hidden');
    container.style.animationName = 'opase';
    container.style.animationDirection = 'reverse';
};

window.closer.addEventListener('click', () => {
    hideWindows();
});

const hideWindows = function () {
    if (currentWindow) {
        currentWindow.style.animationName = 'windowAnimation';
        currentWindow.style.animationDirection = 'normal';
        /*currentWindow.style.animationDuration = '0.1s';
        currentWindow.style.animationTimingFunction = 'linear';
        currentWindow.style.animationIterationCount = '1';*/
        container.style.animationName = 'opase';
        container.style.animationDuration = '0.1s';
        container.style.animationTimingFunction = 'linear';
        container.style.animationIterationCount = '1';
        container.style.animationDirection = 'normal';

        setTimeout(() => {
            const windows = document.getElementsByClassName('window');
            for (var i = 0; i < windows.length; i++) {
                const element = windows[i];
                element.classList.add('hidden');
            }
            if (currentWindow) {
                currentWindow.style.animationName = '';
            };
            container.style.animationName = '';

            container.classList.add('hidden');
            currentWindow = null;
        }, 90);
    } else {
        const windows = document.getElementsByClassName('window');
        for (var i = 0; i < windows.length; i++) {
            const element = windows[i];
            element.classList.add('hidden');
            ;
        }
        container.classList.add('hidden');
        currentWindow = null;
    };
};

const createConfirm = function (message, action) {
    const window = document.createElement('section');
    const msgLabel = document.createElement('p');
    const btn = document.createElement('button');
    const btnRefuse = document.createElement('button');
    const btns = document.createElement('span');

    const msg = document.createTextNode(message);

    window.classList.add('window', 'alert');
    msgLabel.classList.add('title');
    msgLabel.appendChild(msg);
    btn.textContent = 'Yes';
    btn.classList.add('action')
    btnRefuse.textContent = 'No';
    btn.onclick = () => {
        action();
        hideWindows();
    };

    btn.style.width = '150px';
    btnRefuse.style.width = '150px';
    btn.style.marginRight = '10px';

    btnRefuse.onclick = () => {
        window.remove();
        hideWindows();
    };

    document.getElementById('closer').onclick = () => {
        hideWindows();
        setTimeout(() => {
            window.remove();
            document.getElementById('closer').onclick = hideWindows;
        }, 100);
    };

    window.appendChild(msgLabel);
    btns.appendChild(btn);
    btns.appendChild(btnRefuse);
    window.appendChild(btns);

    hideWindows();

    currentWindow = window;
    container.showIt();
    container.appendChild(window);
    currentWindow.style.animationName = 'windowAnimation';
    currentWindow.style.animationDirection = 'reverse';
    setTimeout(() => {
        container.style.animationName = '';
        currentWindow.style.animationName = '';
    }, 100);
};

hideWindows();

const createWindow = function (message, action) {
    const window = document.createElement('section');
    const msgLabel = document.createElement('p');
    const btn = document.createElement('button');

    const msg = document.createTextNode(message);

    window.classList.add('window', 'alert');
    msgLabel.classList.add('title');
    msgLabel.appendChild(msg);
    btn.textContent = 'OK';
    btn.onclick = action;

    window.appendChild(msgLabel);
    window.appendChild(btn);

    hideWindows();
    container.showIt();

    container.appendChild(window);
    setTimeout(() => {
        container.addEventListener('click', action);
    }, 200);
};

const showWin = function (ElClass) {
    hideWindows();
    if (currentWindow) {
        setTimeout(() => {
            container.showIt();
            document.getElementsByClassName(ElClass)[0].classList.remove('hidden');
            currentWindow = document.getElementsByClassName(ElClass)[0];
            currentWindow.style.animationName = 'windowAnimation';
            currentWindow.style.animationDirection = 'reverse';
            /*currentWindow.style.animationDuration = '0.1s';
            currentWindow.style.animationTimingFunction = 'linear';
            currentWindow.style.animationIterationCount = '1';*/
            setTimeout(() => {
                currentWindow.style.animationName = '';
                container.style.animationName = '';
            }, 100);
        }, 100);
    } else {
        container.showIt();
        document.getElementsByClassName(ElClass)[0].classList.remove('hidden');
        currentWindow = document.getElementsByClassName(ElClass)[0];
        currentWindow.style.animationName = 'windowAnimation';
        currentWindow.style.animationDirection = 'reverse';
        /*currentWindow.style.animationDuration = '0.1s';
        currentWindow.style.animationTimingFunction = 'linear';
        currentWindow.style.animationIterationCount = '1';*/
        setTimeout(() => {
            if (currentWindow) {
                currentWindow.style.animationName = '';
            };
            container.style.animationName = '';
        }, 100);
    };
};

if (document.getElementById('search')) {
    var e = document.getElementsByName('search')[0];

    document.addEventListener('keydown', event => {
        if (event.altKey && event.key == 's') {
            e.focus();
        };
    });
};

function showMenu (e) {
    const menu = document.getElementsByClassName('contextMenu')[0]
    menu.classList.remove('hidden');
    if (e.clientX + 200 >= window.innerWidth) {
        menu.style.left = (e.clientX - 200) + 'px';
    } else {
        menu.style.left = e.clientX + 'px';
    }
    menu.style.top = e.clientY + 'px';

    window.addEventListener('click', () => {
        hideMenu();
    }, {once: true});
    let list = Array.from(menu.children);
    list.forEach((li) => {
        li.classList.remove('hidden');
    });

    return list;
};

function hideMenu () {
    document.getElementsByClassName('contextMenu')[0].classList.add('hidden');
}