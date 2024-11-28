const username = document.querySelector('.usrdata .name').textContent;

document.getElementById('sendbtn').onclick = function () {
    let msg = document.getElementsByName('msg')[0].value;
    if (msg !== '') {
        chat.emit('new.send', { type: 'text', msg: msg, user: username });
    };
    document.getElementsByName('msg')[0].value = '';
};

document.getElementsByName('msg')[0].addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        window.sendbtn.click();
    };
});

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
                    chat.emit('new.send', { type: 'img', msg: reader.result, user: username });
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