# Chatterbox

I'm kinda lazy to write description.

well, this is a social media platform written in javascript.
I made it when I was like 14 and still learning the basics of web.
It sucks now when I see it but I'll share it anyway.

**Please tell me if any file is missing.**

**This project uses:**
- ```socket.io``` for websocket management
- ```express``` because it's express
- ```mysql``` because I use windows 7

## Screenshots:
**I could barely take these two since I'm using a different environment now and I'm not ready to re-write this terrible code**

The login screen:
<img src="https://github.com/yukiisen/chatterbox/blob/main/loginscreen.png?raw=true" />


The profile Page:
<img src="https://raw.githubusercontent.com/yukiisen/chatterbox/refs/heads/main/profile.png" />

**remark:** These are the prototypes I made at first when I started the project.
**another remark:** i was about to cancel programing when I opened the ```server.js``` file to run the server.

## Feautures:
- real-time messaging
- post and comment on people's posts
- that's all

## Setup
- first clone the repository.
- do the instructions
- make sure you're not going to open the ```server.js``` file by mistake or it'll kill you. (you'll have to fix it anyway so... rest in peace..)
- run the server

### setup instructions
install ```node``` and ```npm```.

install dependencies:
```bash
npm install
```

install and run a `mariadb` or `mysql` server.

run the database init file (use a MySQL client tool or the default CLI):
```
\. $ProjectDir/database.sql
```

**NOTE:** Make sure to comment the last three queries in the file because they're used only for the sqlite database.

## Running:
```bash
# windows
set DBPASS=mysql_server_password
set NETPASS=anything
set PORT=server_port
run DBusername host?

# linux
export DBPASS=mysql_server_password
export NETPASS=anything
export PORT=server_port
sudo node server.js DBusername host?
```

## Notes:
- I won't take responsibility if this bad code ends your career.
- the default port is ```80```
- the server runs on ```http``` only
- the default host is (obviously) ```localhost```

## Requirements:
I made this shit on windows 7 service pack 0 so It'll definitely work on a piece of cake.

Requires:
- NodeJs: `12.x.x`
- MySQL server: `5.x.x`
- MariaDB server: `any`
- +30 years lifespan.
- a strong heart so you don't log out of life after seeing the code.

**NOTE:**
The `node-mysql` module doesn't support the newest Mysql (> 5.x.x) protocols so you must either change to `mysql2` or use mariaDB instead.

I regret writing this horrible code every single day BTW..
