# About
This page is a music player built on web environment and supports some functions. For example
* Playback
    -
    - Play/pause, shuffle, repeat, queueing<br/>
      <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example_2.gif"/>
    <br/><br/><br/>
* Parse tags
  -
  - Parse tags( `title`, `artist`, `album`, `release year`, `album cover` ) written in audio file
  <br/><br/><br/>
* Crawling Youtube
  -
  - Hits Youtube search using audio's tag as keyword, crawls result and render it<br/>
    <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example.gif"/><br/><br/><br/><br/>

<a href="http://54.185.201.229/" target="_blank">DEMO</a><br/>

This player is best when your audio have been well tagged with information<br/>
And to use Youtube crwaling function, `title` and `artist` tag are required<br/>
> `title` and `artist`: Required to get Youtube search result<br/><br/>
> Plus `album name`, `album cover`: Best<br/><br/>

I prepared some music samples for test in /samples folder<br/>
Enjoy with your favorite tunes!

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
  @ .../React_Audio-master/client
  npm start
```
