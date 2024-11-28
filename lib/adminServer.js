const { hashSync, compareSync } = require('bcryptjs');
const net = require('net');
const { log, error } = require('./tools');

if (!process.env.NETPASS) {
    error(new Error('You must choose a NETPASS!'));
};

const password = hashSync(process.env.NETPASS, 14);

const admins = new Set();

const netServer = net.createServer((client) => {
    log(`A new connection from: ${client.address().address}:${client.address().port}`, 'yellow')
    client.on('data', (data) => {
        data = data.toString('utf-8');
        const [type, syntax] = data.split(': ');
        if (type === 'auth') {
            const matching = compareSync(syntax, password);
            if (matching) {
                client.write('accepted');
                log('An admin logged in!', 'green');
                admins.add(client);
            } else {
                client.write('denied');
                log('Unauthorized access to the admin server!', 'red');
            };
        } else if (admins.has(client) && type === 'cmd') {
            const response = JSON.stringify(generateResponse(syntax));
            client.write(response);
        } else {
            log('Unauthorized access to the admin server!', 'red');
            client.end();
        };
    });
    client.on('end', () => {
        if (admins.has(client)) {
            log('The admin Has disconnected!', 'blue');
            admins.delete(client);
        } else {
            log('Some sort of pig has disconnected!', 'blue');
        }
    });
    client.on('error', (err) => {
        //error(err);
    });
});

exports.listen = function (port, host) {
    netServer.listen(port, host, 1, () => {
        log('Net Server Listening at tcp://' + host + ':' + (port) + '/');
    });
};

const commands = {};

class CMD {
    constructor(help, handler) {
        this.handler = handler;
        this.help = help;
    }
}

function generateResponse(syntax) {
    const all = syntax.split(' ');

    const cmd = all.shift();
    const argv = all;

    if (cmd === 'help') {
        return {
            type: 'string',
            message: commands[argv[0]].help
        };
    };
    if (!commands[cmd]) {
        const res = {
            type: 'error',
            message: 'Syntax Error, Try "help ' + cmd + '" for more informations'
        }
        return res;
    };
    
    return commands[cmd].handler(...argv);
};

function createCMD(name, help, handler) {
    if (commands[name]) {
        throw new Error('Command Already Exists!');
    }
    commands[name] = new CMD(help, handler);
};

exports.createCMD = createCMD;
exports.CMD = CMD;
exports.close = netServer.close;