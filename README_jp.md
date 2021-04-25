# このアプリケーションについて
このSPAアプリケーションはいくつの機能が搭載されているミュージックプレイヤーでございます。例えば
* プーレイ
    -
    - 再生/一時停止、シャッフル、リピート、キューイング<br/>
      <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example_2.gif"/>
    <br/><br/><br/>
* ファイルのタグ解釈
  -
  - ミュージックファイルに組み込んでいる( `タイトル`, `作曲家`, `アルバム名前`, `発売年度`, `アルバムイメージ` )情報を読み取れます
  <br/><br/><br/>
* ユーチューブ検索からクローリング
  -
  - タグに入力されている情報をキーワードとしてユーチューブ検索を行い、その結果をページの上にレンダリングします<br/>
    <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example.gif"/><br/><br/><br/><br/>

### **[DEMO](http://34.217.72.58/)**

このウェブアプリはファイルにタグが多く入力されてあればあるほど多い機能が使えます。<br/>
> `タイトル` and `作曲家`: ユーチューブ検索を行う為必要です。<br/><br/>
> さらに、`アルバム名前`と`アルバムイメージ`の情報が書いてあるとこのページの全機能が使えます<br/><br/>

#### 詳しいフロントエンド開発過程(commit messages)は[AudioApp](https://github.com/Sessho-maru/AudioApp)リポジトリで参考出来ます

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
サーバーが効いている上で、/clientディレクトリーで以下を入力
```
  @ .../React_Audio-master/client
  npm start
```
