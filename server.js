console.time('Launch Time');

const http = require('http'),
    socketIO = require('socket.io'),
    mysql = require('mysql'),
    sqlite = require('sqlite3').verbose(),
    express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcryptjs'),
    compression = require('compression'),
    jade = require('jade'),
    ejs = require('ejs'),
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
    SQLParser = require('./lib/sqlParser.js'),
    tools = require('./lib/tools'),
    moment = require('moment'),
    static = require('express/node_modules/serve-static'),
    URL = require('url'),
    helmet = require('helmet'),
    cors = require('cors'),
    badWords = require('bad-words'),
    joi = require('joi'),
    qs = require('querystring'),
    { promisify } = require('util');
const watchFolder = promisify(fs.readdir);

// const adminServer = require('./lib/adminServer');
// const { createCMD } = adminServer;

//const sharp = require('sharp');
const pack = require('./package.json');

let filter = new badWords();

const log = tools.log;
const query = SQLParser.query;

let passwords = {};

fs.readFile('./passwords.txt', { encoding: 'utf8' }, (err, data) => {
    data.split('\n').forEach((e) => {
        let element = e.split('');
        element.pop();
        passwords[element.join('')] = true;
    });
});

fs.readFile('./Badwords.txt', { encoding: 'utf-8' }, (err, data) => {
    data.split('\n').forEach((e) => {
        filter.addWords(e);
    });
    log('Badwords Filter Ready...');
});

let bannedIps = [];

let Online = [];

let enDanger = [];

class OnlineUser {
    constructor (name, id) {
        this.username = name;
        this.id = id;
        this.token = crypto.randomBytes(16).toString('hex');
        this.timeout = null;
        this.socket = null;
        this.chatRoom = null;
    };
    left () {
        this.timeout = setTimeout(() => {
            let index = Online.findIndex(user => user.username == this.username);
            Online.splice(index, 1);
            //console.log(Online);
        }, (1000 * 60 * 2.5));
    }
    back () {
        clearTimeout(this.timeout);
    }
}

const port = process.env.PORT || 80,
    hostname = process.argv[3] || '127.0.0.1';

tools.setLog('./log/developement.log', './log/errors.log');

SQLParser.initialize('./queries.sql', () => {
    log('Query Parser Ready...');
});

const io = new socketIO.Server();
log('IO Server Initialized');

const db = mysql.createConnection({
    host: process.env.DBHOST || '127.0.0.1',
    user: process.argv[2],
    password: process.env.DBPASS,
    database: 'chatterbox'
});

db.query("SELECT 'ahmad';", (err) => {
    if (err) throw err;
    log('MYSQL DataBase Connected...');
});

const app = express();

const AdminDB = new sqlite.Database('./Admin.db', (err) => {
    if (err) {
        throw err;
    } else {
        log('SQLite DataBase Connected...');
    };
});

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        if (file.fieldname == 'cover') {
            let fileName = req.user.username + path.extname(file.originalname);
            let filePath = './Public/uploads/cover/' + fileName;
            const exists = fs.existsSync(filePath);
            if (exists) {
                fs.unlinkSync(filePath);
            };
            cb(null, fileName);
        } else {
            let fileName = req.user.username + path.extname(file.originalname);
            let filePath = './Public/uploads/' + fileName;
            const exists = fs.existsSync(filePath);
            if (exists) {
                fs.unlinkSync(filePath);
            };
            cb(null, fileName);
        };
    },
    destination: (req, file, cb) => {
        if (file.fieldname == 'cover') {
            cb(null, './Public/uploads/cover/');
        } else if (file.fieldname == 'pfp'){
            cb(null, './Public/uploads/');
        } else {
            cb(new Error("can't do that man!"));
        };
    },
});

const postsStorage = multer.diskStorage({
    filename: function (req, file, cb) {
        let field = file.fieldname;
        if (field === 'attachment') {
            let name;
            do {
                name = crypto.randomBytes(32).toString('hex');
            } while (
                fs.existsSync(`./postUploads/Image/${name}.png`)
                ||
                fs.existsSync(`./postUploads/Image/${name}.jpg`)
                ||
                fs.existsSync(`./postUploads/Image/${name}.jpeg`)
                ||
                fs.existsSync(`./postUploads/Image/${name}.webp`)
                ||
                fs.existsSync(`./postUploads/Image/${name}.gif`)
                ||
                fs.existsSync(`./postUploads/Video/${name}.mp4`)
                ||
                fs.existsSync(`./postUploads/Video/${name}.avi`)
                ||
                fs.existsSync(`./postUploads/Image/${name}.svg`)
            );
            cb(null, name + path.extname(file.originalname));
        } else {
            cb(new Error('We don\'t do that here!'), null);
        }
    },
    destination: function (req, file, cb) {
        let field = file.fieldname;
        const AllowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/avi'];
        if (field === 'attachment') {
            if (AllowedTypes.includes(file.mimetype)) {
                let folder = file.mimetype.indexOf('image/') === -1? 'Video': 'Image';
                cb(null, `./postUploads/${folder}/`);
            } else {
                cb(new Error('Unallowed file format!'), null);
            }
        } else {
            cb(new Error("I said we don't do that here!"), null);
        }
    }
});
const postUploader = multer({ storage: postsStorage, limits: { files: 1, fileSize: (1024 * 1024 * 300) } });
const uploadProfile = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 10 } });
// previous codes are all initializations...

function notify(name, data, link, picture) {
    db.query(query('checkNotified'), [name, data, link, picture], (err, rows) => {
        if (err) {
            tools.error(err);
            return;
        } else if (!rows[0]) {
            db.query(query('notify'), [name, data, link, picture], (err) => {
                if (err) {
                    tools.error(err);
                };
            });
        };
    });
    let socket = Online.find(user => user.username === name);
    
    if (socket) {
        socket = socket.socket;
        //console.log(socket);
        db.query(query('getProfilePic'), [picture], (err, rows) => {
            if (err) throw err;
            io.to(socket).emit('notification', {link: link, picture: rows[0].pfp, text: data});
        });
    };
};


//admin server:
//adminServer.listen(port + 1, hostname);

/* createCMD('Drop', 'Drops the whole server after closing all connections.', () => {
    io.sockets.emit('error');
    io.close();
    server.close();
   setTimeout(() => {
        adminServer.close();
        process.exit(1);
    }, 2000);
    return { type: 'string', message: 'Server closing...'};
});

createCMD('show', 'Reads a specific variable from memory!', (name) => {
    switch (name) {
        case 'online':
            return Online.map(user => { user.id, user.username, user.socket, user.chatServer });
            break;
        case 'banlist':
            return bannedIps;
            break;
        case 'warned':
            return enDanger;
            break;
        default:
            break;
    
});*/


// app structure...
const sessionKey = crypto.randomBytes(32).toString('hex');

app.set('views', './Templates');
app.set('view engine', 'jade');

app.use((req, res, next) => {
    let user = enDanger.find(user => req.ip == user.ip);
    if (user) {
        if (user.attempts > 10) {
            bannedIps.push(user.ip);
            enDanger.splice(enDanger.findIndex(user => user.ip == req.ip), 1);
            log(req.ip + ' User passed the maximum number of attempts, he\'ll be autobanned!', 'red');
            setTimeout(() => {
                bannedIps.splice(bannedIps.indexOf(req.ip), 1);
            }, (1000 * 60 * 60));
        };
    };

    let blocked = bannedIps.find(e => req.ip == e);
    if (!blocked) {
        next();
    } else {
        tools.error('Abandoned Access from ' + req.ip);
        res.end('you were banned automatically from the website, LOSER!');
    };
});

app.use(compression({
    level: 9,
    threshold: 1024 * 50
}));
app.use(session({
    saveUninitialized: false,
    resave: true,
    name: 'meriem_is_our_wife_all_of_us',
    secret: sessionKey,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(bodyParser.urlencoded({ extended: true, limit: "8kb" }));
app.use(bodyParser.json({ limit: "6kb" }));

passport.use('local', new LocalStrategy(async (username, password, done) => {
    db.query(query('authenticate'), [username], (err, rows) => {
        if (err) { return done(err) };
        if (!rows[0]) {
            return done(null, false);
        } else if (rows[0].username === username) {
            bcrypt.compare(password, rows[0].password)
            .then(result => {
                if (result) {
                    return done(null, rows[0]);
                } else {
                    return done(null , false);
                };
            });
        } else {
            return done(null, false);
        };
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    db.query(query('authenticate2'), [id], (err, rows) => {
        done(err, rows[0]);
    });
});

function checkLogin(req, res, next) {
    //console.log(req.isAuthenticated());
    if (req.isAuthenticated()) {
        let isOn = Online.find(user => user.username === req.user.username);
        if (!isOn) {
            Online.push(new OnlineUser(req.user.username, req.user.id));
            //console.log(Online);
        };
        next();
    } else {
        res.redirect('/login');
    };
};

app.use((req, res, next) => {
    res.setError = function (code, message="Internal Server Error") {
        this.status(code).render('error.jade', {appinfo: pack, err: new Error(`${code}: ${message}`)});
    };
    next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    tools.console.log(req.ip, req.method, req.url, req.protocol, req.httpVersion, req.statusCode? req.statusCode: '', req.headers['user-agent']);
    next();
});

app.use(static('./Public/'));
app.use(static('./node_modules/socket.io/client-dist'));

app.get('/files/:id/:type/', (req, res) => {
    let parts = ['video', 'image', 'groups'];
    if (parts.includes(req.params.type.toLowerCase())) {
        watchFolder(`./postUploads/${req.params.type}/`)
            .then((files) => {
                const file = files.find(file => file.indexOf(req.params.id + '.') === 0);
                if (file) {
                    res.sendFile(path.join(__dirname, `/postUploads/${req.params.type}/${file}`));
                } else {
                    res.setError(404, 'Page not found!')
                }
            }).catch(err => {
                if (err) {
                    throw err;
                };
            });
    } else {
        res.setError(404, 'Page Not found!');
    }
});

app.get('/private/:filename/', checkLogin, (req, res) => {
    //console.log(req.params.filename);
    db.query(query('getAMessage'), [req.params.filename], (err, data) => {
        if (err) {
            tools.error(err);
            return res.setError(500);
        }
        //console.log(data);
        if (!data[0]) {
            return res.setError(404, 'Page not found!');
        }
        const targetQuery = data[0].chat_id? 'checkIn': 'checkMember';
        const id = data[0].chat_id || data[0].group_id;
        //console.log({targetQuery, id});
        db.query(query(targetQuery), [id ,req.user.username, req.user.username], (err, permission) => {
            if (err) {
                tools.error(err);
                return req.setError(500);
            }
            //console.log(permission);
            if (permission[0]) {
                res.sendFile(path.join(__dirname, `/privateUploads/${req.params.filename}`));
            } else {
                return res.setError(404, 'Page not found!');
            };
        });
    });
});

app.use((req, res, next) => {
    res.once('finish', () => {
        let color = res.statusCode >= 400? 'red': 'blue';
        if (res.statusCode >= 404) {
            let user = enDanger.findIndex(user => user.ip == req.ip);
            if (user > -1) {
                ++enDanger[user].attempts;
            } else {
                enDanger.push({ip: req.ip, attempts: 1});
            };
        };
        console.log(`${logs[color][0]}${req.ip}${req.user? ' (' + req.user.username + ')': ''} [${moment().format('dddd MMMM Do YYYY - hh:mm a')}] ${req.method} ${req.url} ${req.protocol 
            + "@" + req.httpVersion} ${res.statusCode}: ${res.statusMessage}${logs[color][1]}`);
    });
    next();
});

app.get('/login', (req, res) => {
    const context = {appinfo: pack};
    res.render('login.jade', context);
});

app.use('/logout', checkLogin, (req, res) => {
    let username = req.user.username;
    req.logout(() => {
        res.redirect('/login');
        log(`${req.ip} (${username}) Has logged out`, 'yellow');
    });
});

app.post('/login', (req, res, next) => {
    if (req.body.username && req.body.password) {
        next();
    } else {
        log('Untrusted access from: ' + req.ip);
        return res.setError(400, 'Wrong Input!');
    };
}, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login/error',
    failureFlash: true
}));

app.use('/login/error', (req, res) => {
    log(`Prevented Access From ${req.ip}`, 'red');
    res.setError(401, 'Wrong Login Informations!');
});

const reportShema = joi.object({
    token: joi.string().min(32).max(32).required(),
    post: joi.number().required().min(20000),
    date: joi.date().required()
});

app.post('/report', (req, res) => {
    const { error } = reportShema.validate(req.body);
    if (error) {
        tools.error(error);
    } else {
        const username = Online.find(user => user.token === req.body.token).username;
        /*AdminDB.all('INSERT INTO reports(username, postid, reportDate) VALUES(?, ?, ?);', [username, req.body.post, req.body.date], (err) => {
            if (err) {
                tools.error(err);
            }
        });*/
        log(`Recieved a report from ${username}`, 'yellow');
        res.sendStatus(200);
    };
});
/*
app.get('/download', (req, res) => {
    res.download('./Eric Matthes - Python Crash Course-No Starch Press (2023).pdf');
    //res.download('./chatterbox-v1-release.apk');
});
app.get('/download2', (req, res) => {
    res.download('./Node_js_in_Action.pdf');
    //res.download('./chatterbox-v1-release.apk');
});*/

app.get('/download', (req, res) => {
    res.download('./Chatterbox.apk');
});


app.post('/community', checkLogin, postUploader.single('attachment'), (req, res) => {
    if (!req.body.post) {
        res.setError(403, 'Hey!');
    } else {
        var type = 'txt';
        if (!req.file) {
            type = 'txt';
        } else if (req.file && req.file.mimetype.indexOf('image/') === 0) {
            type = 'img';
        } else if (req.file && req.file.mimetype.indexOf('video/') === 0) {
            type = 'vid';
        };
        let filename = null;
        if (req.file) {
            filename = req.file.filename.split('');
            filename = filename.slice(0, filename.indexOf('.'));
            filename = filename.join('');
        }
        db.query(query('createPost'), [req.user.id, type, req.body.post, filename], (err, result) => {
            if (err) {
                tools.error(err);
                res.setError(500);
            } else {
                db.query(query('getLastPost'), [req.user.id], (err, post) => {
                    if (err) {
                        tools.error(err);
                    } else {
                        const fake = {};
                        fake.setError = function (code) {
                            res.setError(code);
                        };
                        fake.render = function (file, context) {
                            context.posts.unshift({
                                id: post[0].post_id,
                                username: req.user.username,
                                userPic: req.user.profile,
                                post_text: req.body.post,
                                reacted: false,
                                saved: false,
                                likes: 0,
                                comments: 0,
                                type: type,
                                post_media: filename
                            });

                            res.render(file, context);
                        };
                        generateCommunityPage(req, fake);
                    }
                })
            }
        })
    }
});

app.get('/community', checkLogin, generateCommunityPage)

function generateCommunityPage (req, res) {
    let list = [];
    for (let i = 0; i < 8; i++) {
        list.push(req.user.id);
    };
    db.query(query('suggestPosts'), list, (err, rows) => {
        if (err) {
            tools.error(err);
            res.setError(500);
        } else {
            var ids = [-1];
            var posts = [];
            for (let i = 0; i < rows.length; i++) {
                const element = rows[i];
                ids.push(element.id);
                if (!element.likes && !element.comments) {
                    posts.push(element);
                } else if (element.likes && element.comments) {
                    posts.push(element);
                    i += 2;
                } else {
                    posts.push(element);
                    i += 1;
                }
            }
            //console.log(posts);
            //console.log(rows);
            db.query(query('getReacted'), [req.user.id, ids], (err, reacts) => {
                if (err) {
                    tools.error(err);
                    res.setError(500);
                } else {
                    db.query(query('getSaved'), [req.user.id, ids], (err, saves) => {
                        if (err) {
                            tools.error(err);
                            res.setError(500);
                        } else { 
                            posts.forEach((post) => {
                                if (post.likes) {
                                    post.comments /= 2;
                                }

                                const saved = saves.findIndex(save => save.id === post.id);
                                const reacted = reacts.findIndex(react => react.id === post.id);

                                post.reacted = reacted === -1? false: true;
                                post.saved = saved === -1? false: true;
                            });
                            const context = {
                                appinfo: pack,
                                posts: posts,
                                mypic: req.user.profile,
                                token: getToken(req.user.username),
                                url: URL.parse(req.url).pathname
                            }
                            res.render('community.jade', context);
                        }
                    })
                }
            })
        }
    })
};

app.get('/search', checkLogin, (req, res) => {
    const search = qs.parse(URL.parse(req.url).query).search;

    if (!search) {
        res.setError(404, 'Page Not Found!');
    } else {
        db.query(query('searchUsers'), [search, search, search, search], (err, users) => {
            if (err) {
                tools.error(err);
                res.setError(500);
            } else {
                db.query(query('searchPosts'), [search, search, search, search], (err, rows) => {
                    if (err) {
                        tools.error(err);
                        res.setError(500);
                    } else {
                        var ids = [];
                        var posts= [];
                        for (let i = 0; i < rows.length; i++) {
                            //console.log(i);
                            const element = rows[i];
                            ids.push(element.id);
                            if (!element.likes && !element.comments) {
                                posts.push(element);
                            } else if (element.likes && element.comments) {
                                posts.push(element);
                                i += 2;
                            } else {
                                posts.push(element);
                                console.log('added 3');
                                i += 1;
                            }
                        }
                        ids.push(-1);
                        db.query(query('getReacted'), [req.user.id, ids], (err, reacts) => {
                            if (err) {
                                tools.error(err);
                                res.setError(500);
                            } else {
                                db.query(query('getSaved'), [req.user.id, ids], (err, saves) => {
                                    if (err) {
                                        tools.error(err);
                                        res.setError(500);
                                    } else {
                                        posts.forEach((post) => {
                                            if (post.likes) {
                                                post.comments /= 2;
                                            }

                                            const saved = saves.findIndex(save => save.id === post.id);
                                            const reacted = reacts.findIndex(react => react.id === post.id);

                                            post.reacted = reacted === -1? false: true;
                                            post.saved = saved === -1? false: true;
                                        });
                                        const names = [-1];
                                        users.forEach(function (user) {
                                            names.push(user.id);
                                        });
                                        db.query(query('isFollowed'), [req.user.username, names], (err, followings) => {
                                            if (err) {
                                                tools.error(err);
                                                res.setError(500);
                                            } else {
                                                //console.log(users);
                                                //console.log(followings);
                                                users.forEach(function (user) {
                                                    const followed = followings.findIndex(follow => follow.id === user.id);
                                                    user.followed = followed === -1? false: true;
                                                });
                                                const context = {
                                                    appinfo: pack,
                                                    mypic: req.user.profile,
                                                    url: URL.parse(req.url).pathname,
                                                    token: getToken(req.user.username),
                                                    posts: posts,
                                                    users: users,
                                                    search: search,
                                                    myname: req.user.username
                                                };
                                                res.render('searchP.jade', context);
                                            };
                                        });
                                    };
                                });
                            };
                        });
                    };
                });
            };
        });
    };
});

app.get('/posts', checkLogin, (req, res) => {
    const id = qs.parse(URL.parse(req.url).query).id;
    if (!id) {
        res.setError(404, 'Page Not Found!');
    } else {
        db.query(query('getPostData'), [id, id], (err, data) => {
            if (err) {
                tools.error(err);
                res.setError(500);
            };
            if (!data[0]) {
                res.setError(404, 'Page Not Found!');
            } else {
                let saved;
                let reacted;
                const post = data[0];
                if (post.likes > 0) {
                    post.comments /= 2;
                };
                db.query(query('getReacted'), [req.user.id, [id]], (err, data) => {
                    if (err) {
                        tools.error(err);
                        res.setError(500);
                    }
                    reacted = data[0]? true: false;

                    db.query(query('getSaved'), [req.user.id, [id]], (err, data) => {
                        if (err) {
                            tools.error(err);
                            res.setError(500);
                        }
                        saved = data[0]? true: false;

                        let context = {
                            appinfo: pack,
                            post: post,
                            mypic: req.user.profile,
                            url: URL.parse(req.url).pathname,
                            reacted: reacted,
                            saved: saved,
                            token: getToken(req.user.username)
                        };

                        res.render('post.jade', context);
                    });
                });
            };
        });
    };
});

app.get('/notifications', checkLogin, function (req, res) {
    db.query(query('getNotifications'), [req.user.id], (err, notifications) => {
        if (err){
            tools.error(err);
            res.setError(500);
        } else {
            let context = {appinfo: pack, list: notifications, user: req.user, url: URL.parse(req.url).pathname, token: getToken(req.user.username)};
            db.query(query('setSeen'), [req.user.id], (err) => {
                if (err) {
                    tools.error(err);
                };
            });
            res.render('notifications.jade', context);
        };
    });
});

app.get('/signup', (req, res) => {
    const context = {appinfo: pack};
    res.render('create.jade', context);
});

app.post('/signup', function (req, res) {
    let usr = req.body.user;
    if (usr.match(/[^0-9a-z._]/gi) !== null || !usr.match(/[a-z]/gi)) {
        res.setError(406, 'Invalid Username!');
        return;
    };
    if (req.body.pass.length < 6 || passwords[req.body.pass]) {
        res.setError(406, 'Invalid Password!');
        return;
    };
    db.query(query('getUser'), [req.body.user], (err, rows) => {
        if (err) {
            res.setError(500);
            tools.error(err);
            return;
        };
        if (rows[0]) {
            res.setError(406, 'Invalid Username!');
        } else {
            bcrypt.hash(req.body.pass, 10, (err, hash) => {
                if (err) {
                    res.setError(500);
                    tools.error(err);
                } else {
                    db.query(query('addUser'), [req.body.user.toLowerCase(), hash, req.body.user, (req.body.mail? req.body.mail: null)], (err) => {
                        if (err) {
                            res.setError(500);
                            tools.error(err);
                        } else {
                            log(`A new Account was created by ${req.ip}(${req.body.user})`, 'green');
                            /*AdminDB.all(query('saveToAdmin'), [req.body.user, req.headers['user-agent'], moment().format('YYYY-MMMM-Do hh:mm a'), req.ip], (err) => {
                                if (err) {
                                    tools.error(err);
                                };
                            });*/
                            notify(req.body.user, 'Welcome To ChatterBox!', '/about', req.body.user);
                            res.redirect('/login');
                        };
                    });
                };
            });
        };
    });
});

app.get('/new/chat/:name', checkLogin, (req, res) => {
    db.query(query('existsChat'), [req.user.username, req.user.username, req.params.name, req.params.name, req.params.name], (err, result) => {
        if (err) {
            tools.error(err);
            return res.setError(500);
        }
        if (result[0]) {
            res.redirect(`/chats/${result[0].chat_id}`);
        } else {
            db.query(query('getProfilePic'), [req.params.name], (err, pic) => {
                if (err) {
                    tools.error(err);
                    return res.setError(500);
                }
                if (!pic[0]) {
                    console.log(pic);
                    console.log(req.params.name);
                    return res.setError(404, 'Page not found!');
                } else {
                    //console.log(pic);
                    const stat = Online.findIndex(user => user.username === req.params.name) !== -1;
                    const chat = {
                        username: req.params.name,
                        profile: pic[0].pfp,
                        type: 'chat'
                    };
                    const fake = {
                        render: function (name, context) {
                            context.chat = chat;
                            context.isOnline = stat;
                            context.isChat = true;
                            context.messages = [];
                            context.newChat = true;
                            //console.log(context.chat.profile);
                            res.render('home', context);
                        },
                        setError: function (code, text) {
                            res.setError(code, text);
                        }
                    };
                    chatsHandler(req, fake);
                };
            });
        };
    });
});

app.get('/inbox', checkLogin, chatsHandler);

function chatsHandler(req, res) {
    let opt = [];
    for (let i = 0; i < 10; i++) {
        opt.push(req.user.id);
    };
    
    db.query(query('getChats'), opt, (err, rows) => {
        if (err) {
            tools.error(err);
            res.setError(500);
        } else {
            const onlineFriends = [];
            const chats = [];
            for (let i = 0; i < rows.length; i++) {
                chats.push(rows[i]);
                if (rows[i].unseen != 0) {
                    i++;
                }
            }
            chats.forEach(chat => {
                if (chat.type === 'chat') {
                    const isOnline = Online.findIndex(user => user.username === chat.username);
                    if (isOnline > -1) {
                        onlineFriends.push({chat: chat.id, picture: chat.profile});
                    }
                }
                if (chat.sender === req.user.id) {
                    chat.mine = true;
                } else {
                    chat.mine = false;
                }
                delete chat.sender;
                //const date = moment(chat.sent_date).format('hh:mm');
                let date = moment(chat.sent_date).calendar();
                date = date.split(' at ');
                if (/[a-zA-Z]/gi.test(date[0])) {
                    date = date[0] === 'Today'? date[1]: date[0];
                } else {
                    date = moment(chat.sent_date).format('Do MMM');
                };
                chat.sent_date = date;
            });
            
            const context = {
                appinfo: pack,
                url: URL.parse(req.url).pathname,
                online: onlineFriends,
                chats: chats,
                token: getToken(req.user.username),
                mypic: req.user.profile
            }

            res.render('home.jade', context);
        };
    });
}

const profileShema = joi.object({
    userid: joi.string().min(1).max(30).required(),
    insta: joi.string().max(30).required().allow(''),
    email: joi.string().min(9).required().allow(''),
    username: joi.string().max(20).required().allow(''),
    bio: joi.string().max(400).required().allow('')
});

app.post('/profile', checkLogin, uploadProfile.any(), (req, res) => {
    let unsafe = false;
    if (req.files.length > 2) {
        unsafe = true;
    };
    req.files.forEach((e) => {
        if (e.mimetype.indexOf('image/') == -1 || (e.fieldname !== 'cover' && e.fieldname !== 'pfp')) {
            unsafe = true;
        };
    });
    if (unsafe) {
        req.files.forEach((e) => {
            log(req.ip + ' Warning: Unexpected Upload!', 'red');
            log('file will be deleted automatically!', 'red');
            log('User will be banned for 30 minutes', 'red');
            bannedIps.push(req.ip);
            setTimeout(() => {
                bannedIps.splice(bannedIps.indexOf(req.ip), 1);
            }, (1000 * 60 * 30));
            fs.unlinkSync(e.destination + e.filename);
            tools.console.error(JSON.stringify(e));
        });
    } else {
        //console.log(req.files);
        if (req.body.userid.indexOf('@') == 0) {
            let id = req.body.userid.split('');
            id.shift();
            req.body.userid = id.join('');
        };
        if (req.body.insta.indexOf('@') == 0) {
            let id = req.body.insta.split('');
            id.shift();
            req.body.insta = id.join('');
        };

        var { error } = profileShema.validate(req.body);
        if (error) {
            res.setError(406, error.message);
            return;
        };
        let usr = req.body.userid;
        if (usr.match(/[^0-9a-z._]/gi) !== null || !usr.match(/[a-z]/gi)) {
            res.setError(406, 'Invalid Username!');
            return;
        };
        usr = req.body.insta;
        if (usr.match(/[^0-9a-z._]/gi) !== null) {
            res.setError(406, 'Invalid Instagram Account!');
            return;
        };
        db.query(query('getUser2'), [req.body.userid, req.user.username], (err, rows) => {
            if (err) {
                tools.error(err);
                res.setError(500);
            } else if (!rows[0]) {
                db.query(query('getPics'), [req.user.id], (err, pics) => {
                    if (err) {
                        tools.error(err);
                        res.setError(500);
                    } else {
                        let profilePath = req.files.find(file => file.fieldname == 'pfp');
                        if (!profilePath) {
                            profilePath = pics[0].profile_pic;
                        } else {
                            profilePath = profilePath.filename;
                        };
                        let coverPath = req.files.find(file => file.fieldname == 'cover');
                        if (!coverPath) {
                            coverPath = pics[0].cover_pic;
                        } else {
                            coverPath = coverPath.filename;
                        };
                        //let profileCase = req.files[0]? true: false;
                        let showName = req.body.username? req.body.username: req.body.userid;
                        let bio = req.body.bio? req.body.bio: null;
                        let insta = req.body.insta? req.body.insta: null;
                        let email = req.body.email? req.body.email: null;
                        db.query(query('updateUser'), [req.body.userid.toLowerCase(), showName, bio, profilePath, coverPath, email, insta, req.user.id], (err, result) => {
                            if (err) {
                                tools.error(err);
                                res.setError(500);
                            } else {
                                /*if (profileCase) {
                                    let img = `./temp/${profilePath}`;
                                    sharp(img).metadata().then(data => {
                                        let size = Math.min(data.width, data.height);
                                        let top = (data.height - size) /2;
                                        let left = (data.width - size) /2;

                                        sharp(img).extract({width: size, height: size, top: top, left: left})
                                            .toFile(`./Public/uploads/${profilePath}`).then(data => {
                                                sharp(`./Public/uploads/${profilePath}`)
                                                    .resize(150, 150)
                                                    .toFile(`./Public/uploads/min/${profilePath}`);
                                            });
                                    });
                                };*/
                                res.redirect('/profile');
                            };
                        });
                    };
                });
            } else {
                res.setError(406, 'Inavailable Username');
            };
        });
    };
});

app.get(['/profile/:name', '/profile'], checkLogin, openProfile);

function openProfile(req, res, next) {
    var following = true;
    var username = req.user.username;
    var me = true;
    var reacts = {};
    var saves = {};
    var ids;
    var comments = {};
    if (req.params.name) {
        
        me = false;
        username = req.params.name;
    };
    if (req.params.name == req.user.username) {
        res.redirect('/profile');
        return;
    };
    db.query(query('getProfile'), [username], (err, rows) => {
        if (err) {
            res.setError(500);
            tools.error(err);
            //next();
        } else {
            db.query(query('getProfileOnly'), [username], (err, profile) => {
                if (err) {
                    res.setError(500);
                    tools.error(err);
                    //next();
                } else if (!profile[0]) {
                    res.setError(404, 'Page Not Found!');
                    //next();
                } else {
                    if (!rows[0]) {
                        rows[0] = profile[0];
                    }
                    db.query(query('getFollowings'), [rows[0].id], (error, followings) => {
                        if (error) {
                            res.setError(500);
                            tools.error(error);
                        } else {
                            db.query(query('getUserPosts'), [rows[0].id], (err, posts) => {
                                if (err) {
                                    res.setError(500);
                                    tools.error(err);
                                    //next();
                                } else if (posts.length > 1) {
                                    let last = -1;
                                    posts = posts.filter((e) => {
                                        if (e.id != last) {
                                            last = e.id;
                                            return e;
                                        };
                                    });
                                    ids = posts.map((e) => {
                                        return e.id;
                                    });
                                };
                                db.query(query('getComments'), [ids], (err, commentsList) => {
                                    if (err) {
                                        res.setError(500);
                                        tools.error(err);
                                    } else {
                                        commentsList.forEach((e) => {
                                            comments[e.post_id] = e.comment;
                                        });
                                        //console.log(rows);
                                        //console.log(followings);
                                        //console.log(posts);
                                        //console.log(comments);
                                        db.query('SELECT followin FROM follow WHERE follower=? AND followin=?;', [req.user.id, rows[0].id], (err, fol) => {
                                            if (err) {
                                                res.setError(500);
                                                tools.error(err);
                                                //next();
                                            } else {
                                                if (!fol[0]) {
                                                    following = false;
                                                };
                                                db.query(query('getReacted'), [req.user.id, ids], (err, reacted) => {
                                                    if (err) {
                                                        res.setError(500);
                                                        tools.error(err);
                                                    } else {
                                                        reacted.forEach((e) => {
                                                            reacts[e.id] = true;
                                                        });
                                                        db.query(query('getSaved'), [req.user.id, ids], (err, saved) => {
                                                            if (err) {
                                                                res.setError(500);
                                                                tools.error(err);
                                                            } else {
                                                                saved.forEach((e) => {
                                                                    saves[e.id] = true;
                                                                });
                                                                db.query(query('suggestFollowings'), [req.user.id, req.user.id, req.user.id], (err, suggests) => {
                                                                    if (err) {
                                                                        res.setError(500);
                                                                        tools.error(err);
                                                                    } else {
                                                                        
                                                                        let context = {
                                                                            appinfo: pack,
                                                                            me: me,
                                                                            mypic: req.user.profile,
                                                                            following: following,
                                                                            user: rows[0],
                                                                            posts: posts,
                                                                            followings: followings.length,
                                                                            suggestions: suggests,
                                                                            url: URL.parse(req.url).pathname,
                                                                            reacts: reacts,
                                                                            saves: saves,
                                                                            comments: comments,
                                                                            token: getToken(req.user.username)
                                                                        };
                                                                        res.render('profile.jade', context);
                                                                    };
                                                                });
                                                            };
                                                        });
                                                    };
                                                });
                                            };
                                        });
                                    };
                                });
                            });
                        };
                    });
                };
            });
        };
    });
};

app.get('/:type/:id', checkLogin, (req, res) => {
    const types = ['groups', 'chats'];
    if (!types.includes(req.params.type)) {
        res.setError(404, 'Page Not Found!');
        return;
    }
    const queryName = req.params.type === 'groups'? 'getGroupMessages': 'getMessages';
    db.query(query(queryName), [req.params.id, req.params.id, req.user.id, req.user.id], (err, data) => {
        if (err) {
            tools.error(err);
            res.setError(500);
        } else {
            if (!data[0]) {
                return res.setError(404, 'Page not found!');
            };
            data.forEach(msg => {
                if (msg.user === req.user.id) {
                    msg.mine = true;
                } else {
                    msg.mine = false;
                }
            });
            const fake = {
                render: function (name, context) {
                    const chatId = context.chats.findIndex(chat => chat.id == req.params.id && chat.type + 's' === req.params.type);
                    const chat = context.chats[chatId];

                    context.chats[chatId].select = true;

                    if (!chat) {
                        res.setError(404, 'Page Not Found!');
                        return;
                    }
                    const isOnline = Online.find(user => chat.username === user.username)? true: false;

                    context.messages = data;
                    context.isOnline = isOnline;
                    context.chat = chat;

                    context.isChat = true;


                    
                    const queryName = req.params.type == 'chats'? 'chat_id': 'group_id';
                    
                    db.query(query('setSeenMesages').replace('WHERE ?', 'WHERE `' + queryName + '`'), [chat.id, req.user.username], errorHandler);

                    res.render('home.jade', context);
                },
                setError: function (err, text) {
                    res.setError(err, text);
                }
            };
            chatsHandler(req, fake);
        }
    })
})

function getToken(name) {
    return Online.find(user => user.username == name).token || 12354;
};

app.get('/about', checkLogin, (req, res) => {
    db.query(query('userPics'), [req.user.id], (err, rows) => {
        if (err) {
            res.setError(500);
            tools.error(err);
        } else if(!rows[0]) {
            res.setError(404, 'Not Found!, Try to login again');
        } else {
            let search = jade.compileFile('./Templates/search.jade')();
            let nav = jade.compileFile('./Templates/nav.jade')({url: URL.parse(req.url).pathname, user: rows[0]});
            let head = jade.compileFile('./Templates/head.jade')({appinfo: pack});
            ejs.renderFile('./Templates/about.ejs', {head: head,nav: nav, search: search, pack: pack, token: getToken(req.user.username)}, (err, page) => {
                if (err) {
                    res.setError(500);
                };
                res.send(page);
            });
        };
    });
});

/*app.use((err, req, res) => {
    tools.error(err);
    res.setError(500);
});*/

app.use('/', (req, res) => {
    let path = URL.parse(req.url).pathname;
    if (path === '/') {
        res.redirect('/inbox');
    } else {
        res.setError(404, 'Page Not Found!');
    };
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
    log(`Main Server Listening at http://${hostname}:${port}/`);
    io.listen(server);
    log(`IO Server Listening at ws://${hostname}:${port}/`);
});

process.on('uncaughtException', (err) => {
    server.close(function (error) {
        if (error) {
            tools.error(error);
        };
        log('Server Closed due to an internal error!', 'red');
        process.exit(1);
    });
    tools.error(err);
});

const unAuthIO = io.of('/out');
const chatServer = io.of('/chat');
//const profile = io.of('/profile');

unAuthIO.on('connection', (socket) => {
    socket.on('compare', name => {
        db.query(query('getUser'), [name], (err, rows) => {
            if (err) {
                tools.error(err);
            } else if (!rows[0]){
                socket.emit('compared', true);
            } else {
                socket.emit('compared', false);
            };
        });
    });
    socket.on('comparePass', pass => {
        if (passwords[pass]) {
            socket.emit('comparedPass', false);
        } else {
            socket.emit('comparedPass', true);
        };
    });
});


io.on('connection', (socket) => {
    //handleAuthentication(socket);
    socket.emit('back');

    socket.on('authenticate', (token) => {
        //console.log(token);
        let index = Online.findIndex(user => user.token == token);
        if (index > -1) {
            Online[index].socket = socket.id;
            Online[index].back();
            //log(Online);
            socket.emit('authenticated', true);
            //log(`user ${Online[index].username} has logged`, 'green');
        } else {
            socket.emit('authenticated', false);
        };
    });


    socket.on('disconnect', () => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        //console.log(auth);
        //console.log(Online);
        //console.log(Online[0]);
        //console.log(Online[auth].left);
        if (auth == -1) {
            // nothing yet
        } else {
            Online[auth].left();
            //console.log('Leaving...');
        };
    });

    socket.on('follow', function (user) {
        let auth = Online.findIndex(user => user.socket == socket.id);
        //let auth = isAuthenticated(socket);
        if (auth === -1) {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        } else if (user) {
            if (typeof user === 'string') {
                db.query('SELECT id FROM users WHERE username=?', [user], (err, followin) => {
                    if (!followin[0]) {
                        socket.emit('error');
                        return;
                    };
                    let username = Online[auth].username;
                    followin = followin[0].id;
                    db.query('SELECT id FROM users WHERE username=?', [username], (err, follower) => {
                        follower = follower[0].id;
                        if (follower === followin) {
                            socket.emit('error');
                            return;
                        };
                        db.query('SELECT * FROM follow WHERE follower=? AND followin=?', [follower, followin], (err, rows) => {
                            if (err) {
                                throw err;
                            } else if (!rows[0]) {
                                db.query(query('follow'), [follower, followin], (err) => {
                                    if (err) throw err;
                                    notify(user, `${username} Started Following You`, `/profile/${username}/`, username);
                                });
                            } else if (rows[0]) {
                                db.query(query('unfollow'), [follower, followin], (err) => {
                                    if (err) throw err;
                                });
                            };
                            setImmediate(() => {
                                //console.log(followin);
                                db.query(query('getFollowers'), [followin], (err, rows) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        if (!rows[0]) {
                                            rows = [];
                                            rows[0] = {followers: 0};
                                        };
                                        socket.emit('followed', {followers: rows[0].followers});
                                    };
                                });
                            });
                        });
                    });
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            };
        };
    });

    socket.on('postEdit', (data, post) => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            //console.log(typeof data);
            //console.log(typeof post);
            if (typeof data == 'string' && typeof post == 'number') {
                if (tools.containsEnglish(data)) {
                    data = filter.clean(data);
                }
                db.query(query('updateUserPost'), [data, post, Online[auth].username], (err) => {
                    if (err) {
                        throw err;
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            }
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        }
    });

    socket.on('deletePost', post => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            //console.log(typeof data);
            //console.log(typeof post);
            if (typeof post == 'number') {
                db.query(query('existPost'), [post, Online[auth].username], (err, row) => {
                    if (err) {
                        throw err;
                    } else if (!row[0]) {
                        socket.emit('error');
                    } else {
                        db.query(query('delPostComs'), [[post]], errorHandler);
                        db.query(query('delPostLikes'), [[post]], errorHandler);
                        db.query(query('removeNotifications'), [`posts?id=${post}`], errorHandler);
                        setImmediate(() => {
                            db.query(query('deleteUserPost'), [post, Online[auth].username], errorHandler);
                        });
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            }
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        }
    });

    socket.on('postSave', post => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            //console.log(typeof data);
            //console.log(typeof post);
            if (typeof post == 'number') {
                let user = Online[auth].username;
                //console.log(user);
                //console.log(query('getOneSave'));
                db.query(query('getOneSave'), [user, post], (err, rows) => {
                    //console.log(rows);
                    //console.log(query('save'));
                    //console.log(query('unsave'));
                    if (err) {
                        throw err;
                    } else if (!rows[0]) {
                        db.query(query('save'), [post, user], errorHandler);
                    } else {
                        db.query(query('unsave'), [post, user], errorHandler);
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            }
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        }
    });

    socket.on('postLike', post => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            //console.log(typeof data);
            //console.log(typeof post);
            if (typeof post == 'number') {
                let user = Online[auth].username;
                //console.log(user);
                //console.log(query('getOneSave'));
                db.query(query('getOneLike'), [user, post], (err, rows) => {
                    //console.log(rows);
                    //console.log(query('save'));
                    //console.log(query('unsave'));
                    if (err) {
                        throw err;
                    } else if (!rows[0]) {
                        db.query(query('like'), [post, user, moment().format('YYYY-MM-DD h:mm:s')], (err) => {
                            if (err) {
                                throw err;
                            } else {
                                db.query(query('getMeta'), [post], (err, meta) => {
                                    if (err) {
                                        throw err;
                                    } else{
                                        //console.log(user);
                                        if (meta[0].username !== user) {
                                            notify(meta[0].username, `${user} has reacted to your post`, `/posts?id=${post}`, user);
                                        };
                                        socket.emit('likes', post, meta[0].likes);
                                    };
                                });
                            };
                        });
                    } else {
                        db.query(query('unlike'), [post, user], (err) => {
                            if (err) {
                                throw err;
                            } else {
                                db.query(query('getMeta'), [post], (err, meta) => {
                                    if (err) {
                                        throw err;
                                    } else{
                                        socket.emit('likes', post, meta[0].likes);
                                    };
                                });
                            };
                        });
                    };
                    /*setImmediate(() => {
                        db.query(query('getMeta'), [post], (err, meta) => {
                            if (err) {
                                throw err;
                            } else{
                                if (meta[0].username !== user && !rows[0]) {
                                    notify(meta[0].username, `${user} has reacted to your post`, `/posts?id=${post}`, user);
                                };
                                socket.emit('likes', post, meta[0].likes);
                            };
                        });
                    });*/
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            }
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        }
    });

    socket.on('getFollow', (info) => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            const { error } = followShema.validate(info);
            if (!error) {
                const which = info.what == 0? 'getFollowing': 'getFollower';

                db.query(query(which), [info.user], (err, rows) => {
                    errorHandler(err);
                    if (!rows[0]) {
                        socket.emit('setFollow', []);
                    } else {
                        let ids = [];
                        rows.forEach((user) => {
                            ids.push(user.id);
                        });
                        db.query(query('isFollowed'), [Online[auth].username, ids], (err, follow) => {
                            errorHandler(err);
                            let users = [];
                            //console.log(follow);
                            //console.log(rows);
                            rows.forEach((user) => {
                                const isFollowed = follow.findIndex(ID => ID.id === user.id) > -1? true: false;
                                //console.log(follow.findIndex(ID => ID.id === user.id));
                                //console.log(isFollowed);
                                users.push({
                                    username: user.username,
                                    picture: user.profile,
                                    isFollowed: isFollowed,
                                    me: user.username === Online[auth].username? true: false
                                });
                            });
                            socket.emit('setFollow', users);
                        });
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            }
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        };
    });

    socket.on('getComments', post => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            if (typeof post === 'number') {
                db.query(query('getPostComments'), [post], (err, rows) => {
                    if (err) {
                        throw err;
                    } else {
                        socket.emit('gotComments', rows);
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            };
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        };
    });

    socket.on('setComment', (comment, post) => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            if (typeof post === 'number' && typeof comment === 'string' && Buffer.byteLength(comment, 'utf8') < 300) {
                const username = Online[auth].username;
                if (tools.containsEnglish(comment)) {
                    comment = filter.clean(comment);
                };
                db.query(query('addComment'), [post, username, comment, moment().format('YYYY-MM-DD h:mm:s')], (err, result) => {
                    errorHandler(err);
                    if (result.affectedRows === 1) {
                        db.query(query('getProfilePic'), [username], (err, pic) => {
                            errorHandler(err);
                            //socket.emit('commented', {comments: comment, username: username, profile: pic[0].pfp});
                            db.query(query('getPostComments'), [post], (err, rows) => {
                                if (err) {
                                    throw err;
                                } else {
                                    socket.emit('gotComments', rows);
                                };
                            });
                        });
                        db.query(query('getMeta'), [post], (err, meta) => {
                            errorHandler(err);
                            let matching = comment.match(/@(\w+)/gi);
                            if (matching) {
                                matching.forEach((tag) => {
                                    tag = tag.replace('@', '');
                                    db.query(query('getUser'), [tag], (err, user) => {
                                        if (user[0]) {
                                            if (tag !== username) {
                                                notify(tag, `${username} Mentioned you in a comment`, `/posts?id=${post}`, username);
                                            };
                                        };
                                    });
                                });
                            };
                            if (meta[0].username !== username) {
                                notify(meta[0].username, `${username} Has commented on your post`, `/posts?id=${post}`, username);
                            };
                        });
                    } else {
                        socket.emit('error')
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            };
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        };
    });

    socket.on('requestName', () => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            socket.emit('responseName', Online[auth].username);
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        };
    });

    socket.on('deleteComment', (id, post) => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            if (typeof id === 'number' && typeof post === 'number') {
                db.query(query('delComment'), [id, Online[auth].username], (err, result) => {
                    errorHandler(err);
                    if (result.affectedRows === 1) {
                        //console.log(post);
                        db.query(query('getPostComments'), [post], (err, rows) => {
                            if (err) {
                                throw err;
                            } else {
                                socket.emit('gotComments', rows);
                                //console.log(rows);
                            };
                        });
                    } else {
                        socket.emit('error');
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            }
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        };
    });

    socket.on('updateCommentsCount', (post) => {
        let auth = Online.findIndex(user => user.socket == socket.id);
        if (auth > -1) {
            if (typeof post === 'number') {
                db.query(query('getComments'), [[post]], (err, rows) => {
                    if (err) {
                        throw err;
                    } else {
                        socket.emit('updatedcoms', rows[0]?rows[0].comment:0, post);
                    };
                });
            } else {
                socket.emit('error');
                socket.disconnect(true);
                log('Untrusted access! (' + Online[auth].username + ')', 'red');
            }
        } else {
            socket.emit('error');
            socket.disconnect(true);
            log('Unauthorized access!', 'red');
        };
    });
});

const followShema = joi.object({
    what: joi.number().max(1).min(0).required(),
    user: joi.string().max(20).required()
});

function errorHandler(err) {
    if (err) {
        throw err;
    };
};

chatServer.on('connection', function (socket) {
    socket.onAny(function (event) {
        const paths = ['auth']
        if (!paths.includes(event)) {
            const user = Online.find(user => user.chatRoom === socket.id);
            if (!user) {
                socket.disconnect(true);
            };
        };
    });

    socket.emit('auth');
    socket.on('auth', (token) => {
        const user = Online.findIndex(user => user.token === token);
        if (user === -1) {
            return socket.disconnect(true);
        }
        Online[user].chatRoom = socket.id;
        socket.emit('authenticated');
    });

    socket.on('join', function (type, id) {
        if (['chats', 'groups'].includes(type) && typeof id === 'number') {
            socket.rooms.forEach((room) => {
                if (room != socket.id) {
                    socket.leave(room);
                };
            });
            const cmd = type === 'chats'? 'checkIn': 'checkMember';
            const name = Online.find(user => user.chatRoom === socket.id).username;
            db.query(query(cmd), [name, name, name], (err, data) => {
                if (err) {
                    throw err;
                }
                if (!data) {
                    log('Untrusted Access', 'red');
                    return socket.disconnect(true);
                } else {
                    socket.join(`${type}-${id}`);
                    //console.log(socket.rooms);
                }
            })
            
        } else {
            socket.emit('error');
        }
    });
    socket.on('message.send', ({ type, msg }) => {
        if (!type || !msg) {
            socket.emit('error');
            return socket.disconnect(true);
        }
        const room = Array.from(socket.rooms).pop();
        if (socket.rooms.size < 2) {
            socket.emit('error');
            return socket.disconnect(true);
        };
        const name = Online.find(user => user.chatRoom === socket.id).username;
        const group = room.split('-').shift() === 'groups'? 'sendGMsg': 'sendMsg';
        const chat = room.split('-').pop();
        switch (type) {
            case 'text':
                //console.log([name, +chat, 'text', msg]);
                if (tools.containsEnglish(msg)) {
                    msg = filter.clean(msg);
                };
                db.query(query(group), [name, +chat, 'text', msg], (err) => {
                    errorHandler(err);
                    db.query(query('returnMsg'), [name], (err, message) => {
                        errorHandler(err);
                        socket.broadcast.to(room).emit('message', {
                            type: type,
                            data: msg, 
                            id: message[0].id, 
                            sender: `/uploads/${message[0].profile}`,
                            mine: false
                        });
                        socket.emit('message', {
                            type: type,
                            data: msg, 
                            id: message[0].id,
                            sender: `/uploads/${message[0].profile}`,
                            mine: true
                        });
                    })
                });
                break;
            case 'img':
                let [mimetype, info] = msg.split(';base64,');
                    mimetype = mimetype.split(':')[1];
                if (mimetype.indexOf('image/') !== 0) {
                    socket.emit('error');
                    socket.disconnect(true);
                };

                const data = Buffer.from(info, 'base64');

                let ext = mimetype.split('/')[1];
                    ext = ext === 'svg+xml'? 'svg': ext;
                let fileName = '';

                do {
                    fileName = crypto.randomBytes(16).toString('hex');
                } while (fs.existsSync('./privateUploads/' + fileName + '.' + ext));

                fs.writeFileSync(`./privateUploads/${fileName}.${ext}`, new Uint8Array(data));
                
                db.query(query(group), [name, +chat, 'img', `${fileName}.${ext}`], (err) => {
                    errorHandler(err);
                    db.query(query('returnMsg'), [name], (err, message) => {
                        errorHandler(err);
                        socket.broadcast.to(room).emit('message', {
                            type: type,
                            data: `/private/${fileName}.${ext}`, 
                            id: message[0].id, 
                            sender: `/uploads/${message[0].profile}`,
                            mine: false
                        });
                        socket.emit('message', {
                            type: type,
                            data: `/private/${fileName}.${ext}`,
                            id: message[0].id, 
                            sender: `/uploads/${message[0].profile}`,
                            mine: true
                        });
                    })
                });
                break;
            default:
                break;
        }
        setImmediate(() => {
            updateChats(socket.id, chat, room.split('-').shift() === 'groups'? 'group': 'chat');
        });
    });

    socket.on('seen', () => {
        if (socket.rooms.size < 2) {
            socket.emit('error');
            socket.disconnect(true);
        } else {
            const room = Array.from(socket.rooms).pop();
            const name = Online.find(user => user.chatRoom === socket.id).username;
            const group = room.split('-').shift() === 'groups'? 'group_id': 'chat_id';
            const chat = room.split('-').pop();
            db.query(query('setSeenMesages').replace('WHERE ?', 'WHERE `' + group + '`'), [chat, name], errorHandler);
            setImmediate(() => {
                updateChats(socket.id, chat, room.split('-').shift() === 'groups'? 'group': 'chat');
            });
        };
    });

    socket.on('delete.message', id => {
        if (!id) {
            socket.emit('error');
            return socket.disconnect(true);
        }
        const name = Online.find(user => user.chatRoom === socket.id).username;
        db.query(query('getMessagebyId'), [id], (err, data) => {
            if (err) {
                errorHandler(err);
                return socket.disconnect();
            }
            if (!data[0]) {
                return socket.disconnect(true);
            }
            if (data[0].type !== 'text') {
                fs.unlink('./privateUploads/' + data[0].msg, errorHandler);
            };
        })
        setImmediate(() => {
            db.query(query('deleteMesage'), [name, id], (err, res) => {
                errorHandler(err);
                if (res.affectedRows === 0) {
                    socket.emit('error');
                    socket.disconnect(true);
                } else {
                    socket.broadcast.to(Array.from(socket.rooms)[1]).emit('remove.msg', id);
                    //console.log(Array.from(socket.rooms));
                }
            });
        });
    });

    socket.on('new.send', ({ type, msg, user }) => {
        if (typeof type !== 'string' || typeof msg === 'undefined' || typeof user !== 'string') {
            socket.emit('error');
            return socket.disconnect(true);
        }
        const name = Online.find(user => user.chatRoom === socket.id).username;
        const group = 'sendMsg';
        db.query(query('existsChat'), [name, name, user, user, user], (err, chat) => {
            if (err || chat[0]) {
                tools.error(err);
                socket.emit('error');
                socket.disconnect(true);
            } else if (!chat[0]) {
                db.query(query('getUser'), [user], (err, userId) => {
                    if (err) {
                        tools.error(err);
                        socket.emit('error');
                        return socket.disconnect(true);
                    }
                    if (!userId[0]) {
                        socket.emit('error');
                        return socket.disconnect(true);
                    }
                    db.query(query('addChat'), [name, user], errorHandler);
                    setImmediate(() => {
                        db.query(query('getChat'), [name], (err, chat) => {
                            if (err) {
                                tools.error(err);
                                socket.emit('error');
                                return socket.disconnect(true);
                            }
                            if (chat[0]) {
                                chat = chat[0].id;
                                switch (type) {
                                    case 'text':
                                        //console.log([name, +chat, 'text', msg]);
                                        if (tools.containsEnglish(msg)) {
                                            msg = filter.clean(msg);
                                        };
                                        db.query(query(group), [name, +chat, 'text', msg], (err) => {
                                            errorHandler(err);
                                            socket.emit('error');
                                        });
                                        break;
                                    case 'img':
                                        let [mimetype, info] = msg.split(';base64,');
                                            mimetype = mimetype.split(':')[1];
                                        if (mimetype.indexOf('image/') !== 0) {
                                            socket.emit('error');
                                            socket.disconnect(true);
                                        };
                        
                                        const data = Buffer.from(info, 'base64');
                        
                                        let ext = mimetype.split('/')[1];
                                            ext = ext === 'svg+xml'? 'svg': ext;
                                        let fileName = '';
                        
                                        do {
                                            fileName = crypto.randomBytes(16).toString('hex');
                                        } while (fs.existsSync('./privateUploads/' + fileName + '.' + ext));
                        
                                        fs.writeFileSync(`./privateUploads/${fileName}.${ext}`, new Uint8Array(data));
                                        
                                        db.query(query(group), [name, +chat, 'img', `${fileName}.${ext}`], (err) => {
                                            errorHandler(err);
                                            socket.emit('error');
                                        });
                                        break;
                                    default:
                                        break;
                                };
                                setImmediate(() => {
                                    notify(user, 'New messages from ' + name, '/chats/' + chat, name);
                                    updateChats(socket.id, chat, 'chat');
                                });
                            };
                        });
                    });
                });
            };
        });
    });

    socket.on('disconnect', () => {
        const index = Online.findIndex(user => user.chatRoom === socket.id);
        if (index != -1) {
            Online[index].chatRoom = null;
        };
    });
});

function updateChats(errTarget, id, type) {
    const users = [];
    db.query(query(`get${type}Members`), [id], (err, data) => {
        if (err) {
            tools.error(err);
            chatServer.to(errTarget).emit('error');
            return chatServer.in(errTarget).disconnectSockets(true);
        }
        if (!data[0]) {
            chatServer.to(errTarget).emit('error');
            return chatServer.in(errTarget).disconnectSockets(true);
        } else if (type === 'group') {
            data.forEach((user) => {
                users.push(user.user_id);
            });
            sendUpdates(users, id, type);
        } else if (type === 'chat') {
            users.push(data[0].chat_user1);
            users.push(data[0].chat_user2);
            sendUpdates(users, id, type);
        }
    })
};

function sendUpdates(users, id, type) {
    const sockets = (Online.filter((user) => users.includes(user.id) && user.chatRoom)).map((user) => [user.chatRoom, user.id]);
    db.query(query('getUpdatedChat'), [id, id, id, id, type], (err, chat) => {
        if (err) {
            return tools.error(err);
        } else if (chat[0]) {

            let eDate = moment(chat[0].sent_date).calendar();
            let date = eDate.split(' at ');
            if (/[a-zA-Z]/gi.test(date[0])) {
                date = date[0] === 'Today'? moment(chat[0].sent_date).format('HH:mm'): date[0];
            } else {
                date = moment(chat[0].sent_date).format('Do MMM');
            };
            chat[0].sent_date = date;

            const sender = chat[0].sender;

            sockets.forEach(([socket, id]) => {
                const newData = chat[0];
                newData.mine = id === sender;
                //console.log([id, sender, id === sender]);
                delete newData.sender;
                chatServer.to(socket).emit('update', newData);
            });
        };
    });
};

console.timeEnd('Launch Time');
