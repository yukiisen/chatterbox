const chat = io.connect('/chat');


chat.on('auth', () => {
    chat.emit('auth', token);
});

chat.on('error', () => location.reload());

chat.on('remove.msg', id => {
    for (let i = 0; i < Messagesl.children.length; i++) {
        const element = Messagesl.children[i];
        if (element.getAttribute('message') == id) {
            element.remove();
            break;
        };
    };
});

chat.on('update', (data) => {
    //console.log(data);

    const targetChat = Array.from(document.querySelector('.chatlist .messages').children)
    .find(chat => chat.getAttribute('chat') === `${data.type}-${data.id}`);

    const DOM = new DOMParser();

    let html = DOM.parseFromString(targetChat.innerHTML, 'text/html');

    const sel = targetChat.classList.contains('on');

    targetChat.remove();
    const chat = html.body;
    //console.log(chat);
    const a = document.createElement('a');
    a.href = `/${data.type}s/${data.id}/`;
    a.classList.add('chat');
    a.setAttribute('chat', `${data.type}-${data.id}`);
    chat.querySelector('.txt').textContent = data.mesage_type === 'text'? data.message_data: 'Sent an image';
    chat.querySelector('.data').lastChild.remove();
    if (data.mine) {
        chat.querySelector('.data').innerHTML += '<img src="/svg/check-svgrepo-com.svg" class="svg">';
    } else {
        chat.querySelector('.data').innerHTML += `<span class="case">${data.unseen || ''}</span>`;
    };
    
    chat.querySelector('.data').firstChild.textContent = data.sent_date;


    Array.from(chat.children).forEach(e => {
        a.appendChild(e);
    });
    if (sel) a.classList.add('on');
    document.querySelector('.chatlist .messages').prepend(a);
});