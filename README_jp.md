# このアプリについて
このSPAアプリケーションはいくつの機能が具現されているミュージックプレイヤーです。例えば
* プーレイ
    -
    - プレイ/ポーズ、シャッフル、リピート、キューイング<br/>
      <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example_2.gif"/>
    <br/><br/><br/>
* タグ解釈
  -
  - ミュージックファイルに組み込んでいる( `title`, `artist`, `album`, `release year`, `album cover` )情報を読み取れます
  <br/><br/><br/>
* ユーチューブ検索からクローリング
  -
  - タグ情報をキーワードとしてユーチューブ検索を行い、その結果をページにレンダリングします<br/>
    <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example.gif"/><br/><br/><br/><br/>

タグが多く入力されてあればあるほど多い機能が使えます。<br/>
> `title` and `artist`: ユーチューブ検索を行う為必要です。<br/><br/>
> さらに、`album`と`album cover`の情報が書いてあると、このページの全機能が使えます<br/><br/>

<br/>

# ローカル設置方法
nodeパッケージ設置
```
  @ .../React_Audio-master
  npm run install_app
```

expressサーバーを稼働
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
サーバーが効いた上で、/clientディレクトリーで以下を入力
```
  @ .../React_Audio-master/client
  npm start
```
