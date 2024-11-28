# Chatterbox

I'm kinda lazy to write description.

well, this is a social media platform written in javascript.
I made it when I was like 14 and still learning the basics of web.
It sucks now when I see it but I'll share it anyway.

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

run the database init file (use a tool or type in the default mysql cli):
```mysql
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
node server.js DBusername host
```

## Notes:
- I don't take responsibility if this bad code ends your career
- the default port is 80
- the server runs on http only
- the default host is (obviously) localhost
