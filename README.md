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

## Feautures:
- real-time messaging
- post and comment on people's posts
- that's all

## Setup
- first clone the repository.
- do the instructions
- make sure you're not going to open the ```server.js``` file by mistake or it'll kill you.
- run the server

### setup instructions
install ```node``` and ```npm```.

install dependencies:
```bash
npm install
```

install and run a mysql server.

run the database init file (use a MySQL client tool or the default CLI):
```
\. $ProjectsDir/database.sql
```

## Running:
```bash
# windows
set DBPASS=mysql_server_password
set PORT=server_port
run DBusername host

# linux
export DBPASS=mysql_server_password
export PORT=server_port
sudo node server.js DBusername host
```

## Notes:
- I won't take responsibility if this bad code ends your career.
- the default port is ```80```
- the server runs on ```http``` only
- the default host is (obviously) ```localhost```

## Requirements:
I made this shit on windows 7 service pack 0 so It'll definitely work on a piece of cake.

Requires:
NodeJs: ```12.x.x```
MySQL server: ```5.x.x```

+30 years lifespan.
And strong heart so you don't log out of life after seeing the code.

Check My twitter on: [notarchivist](https://x.com/notarchivist)
