function ran(num){
	const numbers = new Set();
	while(numbers.size < num){
		var Case = false;
		while(Case === false){
			const a = (Math.random()*2).toFixed(0);
			numbers.add(+a + 1);
            Case = true;
		};
	};
	return Array.from(numbers);
};

const order = ran(3);

var Neworder = order.map((element, index) => {
    if (element == 3) {
        return '/media/m3.mp3';
    }
    return `/media/m${element}.wav`;
});

for (var i = 0; i < Neworder.length; i++) {
    const element = Neworder[i];
    document.getElementsByTagName('audio')[i].src = element;
};

function transform(mainClass, newClass) {
    const elements = document.getElementsByClassName(newClass);
    for (var i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.value = document.getElementsByClassName(mainClass)[i].value;
    };
};
const answer = order.indexOf(2) + 1;

document.getElementById('rec').onclick = () => {
    const userAns = document.getElementById('recap').value;
    if (+userAns == answer) {
        if (location.pathname == '/signup') {
            hideWindows();
            setTimeout(() => {
                createWindow('You will Be Redirected To The\nLogin Page To Use your account...', () => {
                    document.getElementById('hiddenForm').submit();
                });
            }, 100);
            
        } else {
            document.getElementById('hiddenForm').submit();
        }
        return;
    }
    hideWindows();
    setTimeout(() => {
        createWindow('Error: Cannot login', () => {
            location.reload();
        });
    }, 100);
};