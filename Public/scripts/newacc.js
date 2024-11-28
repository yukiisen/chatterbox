const socket = io.connect('/out');

document.getElementById('user').oninput = () => {
    const input = document.getElementById('user').value;
    socket.emit('compare', input);
    socket.on('compared', (e) => {
        if (!e || input.match(/[^0-9a-z._]/gi) !== null) {
            document.getElementsByTagName('pre')[0].style.display = 'block';
            document.getElementsByTagName('label')[2].style.marginTop = 0;
        } else {
            document.getElementsByTagName('pre')[0].style.display = 'none';
            document.getElementsByTagName('label')[2].style.marginTop = '20px';
        };
    });
};


document.getElementById('pass').oninput = () => {
    const input = document.getElementById('pass').value;
    socket.emit('comparePass', input);
    socket.on('comparedPass', e => {
        //console.log(e);
        if (!e) {
            document.getElementsByTagName('pre')[1].style.display = 'block';
            document.getElementsByTagName('pre')[1].textContent = 'password too weak';
            document.getElementsByTagName('label')[3].style.marginTop = 0;
        } else if (input.length < 6) {
            document.getElementsByTagName('pre')[1].style.display = 'block';
            document.getElementsByTagName('pre')[1].textContent = 'password must contaain at least 8 characters';
            document.getElementsByTagName('label')[3].style.marginTop = 0;
        } else {
            document.getElementsByTagName('pre')[1].style.display = 'none';
            document.getElementsByTagName('label')[3].style.marginTop = '20px';
        };
    });
};

document.getElementById('pass2').oninput = () => {
    const input = document.getElementById('pass').value;
    const input2 = document.getElementById('pass2').value;
    if (input != input2) {
        document.getElementsByTagName('pre')[2].style.display = 'block';
        document.getElementsByTagName('label')[4].style.marginTop = 0;
    }else{
        document.getElementsByTagName('pre')[2].style.display = 'none';
        document.getElementsByTagName('label')[4].style.marginTop = '20px';
    };
};

document.getElementsByClassName('form')[0].onsubmit = (e) => {
    e.preventDefault();
    const usr = document.getElementById('user').value
        , psw = document.getElementById('pass').value
        , psw2 = document.getElementById('pass2').value;

    if (usr != '' && psw != '' && psw2 != '') {
        var ca = true;
        for (let i = 0; i < document.getElementsByTagName('pre').length; i++) {
            const element = document.getElementsByTagName('pre')[i];
            if (element.style.display == 'block') {
                ca = false;
            };
        };
        if (ca == false) {
            return;
        }
        transform('recOut','recIn');
        showWin('recap');
    }
}