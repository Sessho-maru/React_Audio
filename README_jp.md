# このアプリケーションについて
このSPAアプリケーションはいくつの機能が搭載されているミュージックプレイヤーでございます。例えば
* プーレイ
    -
    - 再生/一時停止、シャッフル再生、反復再生、キューイング<br/>
      <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example_2.gif"/>
    <br/><br/><br/>
* ファイルのタグ解釈
  -
  - ミュージックファイルの中に組み込んでいる( `タイトル`, `作曲家`, `アルバム名前`, `発売年度`, `アルバムイメージ` )情報を読み取れます
  <br/><br/><br/>
* クローリングユーチューブ検索
  -
  - タグに入力されている情報をキーワードとしてユーチューブ検索を行い、その結果をページの上にレンダリングします<br/>
    <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example.gif"/><br/><br/><br/><br/>

<a href="http://54.185.201.229/" target="_blank">DEMO</a><br/>

このウェブアプリはファイルの中でタグが多く入力されてあればあるほど多い機能が使えます。<br/>
> `タイトル` and `作曲家`: ユーチューブ検索結果をクローリングする時要ります。<br/><br/>
> さらに、アルバム名前とアルバムイメージの情報が書いあるとこのページの全機能が使えます<br/><br/>

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
