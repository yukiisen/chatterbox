const net = require('net');
const { stdout } = require('process');
const tools = require('./lib/tools');

const log = tools.basicLog;

function input(...prompts) {
    const { stdin, stdout } = process;
    stdin.resume();
    return new Promise((res, rej) => {
        let results = [];
        stdout.write(prompts.shift() + ': ');
        stdin.on('data', (cmd) => {
            try {
                stdin.pause();
                cmd = cmd.toString().split('');
                cmd.pop();
                cmd.pop();
                results.push(cmd.join(''));
                if (prompts.length === 0) {
                    res(results);
                } else {
                    stdout.write(prompts.shift() + ': ');
                    stdin.resume();
                };
            } catch (error) {
                rej(error);
            };
        });
    });
};

function main(host, port, pass) {
    stdout.cursorTo(0, 0, );
    stdout.clearScreenDown();
    host = host || '127.0.0.1';
    port = port || 3000;
    log(`Connecting to ${host}:${port}...`, 'yellow');

    const client = net.createConnection({ port, host }, () => {
        log('Connected to the server!', 'green');
        client.write('auth: ' + pass);
        log('Logging in...', 'blue');
    });

    client.on('error', (err) => {
        log('Error: ' + err.message, 'red');
        process.exit(1);
    });

    client.once('data', res => {
        if (res.toString('utf-8') == 'accepted') {
            log('Logged in succesfully!','blue');
            loop();
        } else {
            log('Could not log in!', 'red');
            client.end();
            //process.exit(1);
        };
    });

    client.on('close', (e) => {
        if (e) {
            log('Closing due to an internal error!', 'red');
        }
        process.exit(1);
    });

    client.on('end', () => {
        process.exit(1);
    });

    function loop() {
        input('Enter a command').then(([cmd]) => {
            cmd = cmd.toLowerCase();
            if (cmd == 'exit' || cmd == 'leave') {
                client.end(() => {
                    process.exit(0);
                });
            } else {
                client.write('cmd: ' + cmd);
                client.once('data', (data) => {
                    console.log(data.toString('utf-8'));
                    loop();
                });
            }
        });
    };
};


input('Host (localhost)', 'Port (3000)', 'Password').then(res => main(...res));
