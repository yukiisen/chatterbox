let recorder;
let audioChunks = [];
let currentVocal;

if (location.pathname !== '/inbox/' && location.pathname !== '/inbox') {
    /*if (!navigator.mediaDevices) {
        window.voiceRecorder.remove();
    } else {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                recorder = new MediaRecorder(stream);

                recorder.ondataavailable = (e) => {
                    audioChunks.push(e.data);
                };
                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
                    audioChunks = [];
                    currentVocal = audioBlob;
                    filereader.readAsArrayBuffer(audioBlob);
                };
        }).catch(err => {
            window.voiceRecorder.remove();
        });
    }

    const filereader = new FileReader();
    const audioContext = new AudioContext();
    const secReader = new FileReader();

    secReader.onloadend = () => {
        console.log(secReader.result);
        createConfirm('Do you wanna send this recording?', () => {
            alert('sent!');
        })
    };

    filereader.onloadend = () => {
        const arraybuff = filereader.result;
        audioContext.decodeAudioData(arraybuff, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        });
    };

    function record() {
        window.voiceRecorder.querySelector('img').src = '/svg/microphone-green-svgrepo-com.svg';
        recorder.start();
        window.voiceRecorder.onclick = stopAndPlay;
    };

    function stopAndPlay() {
        recorder.stop();
        window.voiceRecorder.querySelector('img').src = '/svg/arrow-up-from-bracket-svgrepo-com.svg';
        window.voiceRecorder.onclick = sendAudio;
    }

    function sendAudio() {
        secReader.readAsDataURL(currentVocal);
        currentVocal = null;
        window.voiceRecorder.querySelector('img').src = '/svg/microphone-svgrepo-com.svg';
        window.voiceRecorder.onclick = record;
    }*/

    /*window.filex.addEventListener('change', () => {
        if (window.filex.files.length > 0) {
            document.querySelector('button[onclick="window.filex.click()"] img').src = '/svg/attachment-copy-svgrepo-com .svg';
        } else {
            document.querySelector('button[onclick="window.filex.click()"] img').src = '/svg/attachment-svgrepo-com.svg';
        };
    });*/
    window.filez.addEventListener('change', () => {
        if (window.filez.files.length > 0) {
            document.querySelector('button[onclick="window.filez.click()"] img').src = '/svg/image-col-plus-svgrepo-com.svg';
        } else {
            document.querySelector('button[onclick="window.filez.click()"] img').src = '/svg/image-plus-svgrepo-com.svg';
        };
    });

    /*if (navigator.userAgent.indexOf('Android') > -1) {
        document.getElementsByName('msg')[0].addEventListener('focus', (e) => {
            try {
                e.target.nextElementSibling.style.visibility = 'hidden';
                e.target.nextElementSibling.nextElementSibling.style.display = 'none';
                e.target.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'none';
            } catch (error) {
                console.log(error);
            };
        });

        document.getElementsByName('msg')[0].addEventListener('focusout', (e) => {
            try {
                e.target.nextElementSibling.style.visibility = 'visible';
                e.target.nextElementSibling.nextElementSibling.style.display = 'flex';
                e.target.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'flex';
            } catch (error) {
                console.log(error);
            };
        });
    };*/

}

const fs = new FileReader();

const fileSelect = document.getElementById('groupPic');
const picture = document.querySelectorAll('.groups div.picture')[0];
fileSelect.addEventListener('change', (e) => {
    if (!fileSelect.files.length) {
        picture.style.backgroundImage = '';
    } else {
        fs.readAsDataURL(fileSelect.files[0]);
    };
});

fs.onloadend = () => {
    let base64data = fs.result;
    picture.style.backgroundImage = `url(${base64data})`;
};

document.querySelector('.chatlist .top img').addEventListener('click', (e) => {
    showWin('groups');

    const groups = document.querySelector('.wincon .groups');

    groups.querySelectorAll('button')[1].style.display = 'none';
    groups.querySelectorAll('button')[0].textContent = 'Create Group';

    groups.setAttribute('group', 'New');
});