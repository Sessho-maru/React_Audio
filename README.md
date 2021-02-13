# About
This page is a music player built on web environment and supports some functions. For example
- Play/pause, shuffle, repeat, queueing playback functions
- Hits Youtube search using audio's tag as keyword, crawls result and render it<br/>
<img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example.gif"/><br/>
- Parse tags( `title`, `artist`, `album`, `release year`, `album cover` ) written in audio file

This player is best when your audio well tagged with information<br/>
And to use Youtube crwaling function, `title` and `artist` tag are required<br/>
> `title` and `artist`: Required to get Youtube search result<br/><br/>
> Plus `album name`, `album cover`: Best<br/>

<br/>

# How to Install on local machine
Install dependencies
```
  @ .../React_Audio-master
  npm run install_app
```

then, Turn on express server
```
  @ .../React_Audio-master
  node server
  or
  node server.js
```
<br/>

```
----------------CORS-enabled web server listening on port 5000----------------
```
once server listening, Browse /client folder and command
```
  @ .../React_Audio-master
  cd client
  
  @ .../React_Audio-master/client
  npm start
```
