const cpus = require('os').cpus().length,
    cluster = require('cluster'),
    util = require('util');

cluster.setupMaster({
    exec: './server.js'
});

for (let i = 0; i < cpus; i++) {
    //cluster.fork();
}

cluster.on('exit', function(worker) {
    util.inspect.styles.string = 'red';
    console.log(util.inspect(`process ${worker.process.pid} was killed!`, {colors: true}));
    cluster.fork();
});


util.inspect.styles.string = 'green';
console.log(util.inspect('yo', {colors: true}).split('\''));