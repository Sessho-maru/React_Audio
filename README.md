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

# プログラムの概略的なフロー
### 重要なメンバー変数：</br>
```JSX
this.arrAudioCard: react.element[]　// reactComponent <AudioCard> を要素としてする配列
this.idxAudioCard: number // this.arrAudioCard の index
this.idxDurationPair: Map(index: number, duration: number) // 格音楽の index と再生の長さ(duration)を持つ Map
```

</br>

### 1) ユーザーからオーディオファイルを貰う
ユーザーからオーディオファイル _**input**_ を貰います。</br>
_**input**_ モードは２つがあります。</br>
#### ADD
```JSX
<a onClick={ () => {this.openFileDialog(clear = false)} } className="btn-floating blue"><div className="fileSelector">ADD</div></a>
```
パラメタ `clear` を _false_ にセットします。</br>
_**input**_ されたオーディオファイルを `this.arrAudioCard` に _**append**_ します。</br>

#### NEW
```JSX
<a onClick={ () => {this.openFileDialog(clear = true)} } className="btn-floating blue"><div className="fileSelector">NEW</div></a>
```
パラメタ `clear` を _true_ にセットします。</br>
`this.arrAudioCard` を初期化した後 _**append**_ します。</br>

</br>

[openFileDialog( _**clear: bool**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L401-L413)　から</br>
格 `<input type="file" accept="audio/*">`　ノード
```JSX
<input type="file" accept="audio/*" id="new" onChange={ (event) => {this.handleFileListThenAssignArrAudio(event.target.files, true)} } multiple hidden preload="metadata"/>
<input type="file" accept="audio/*" id="append" onChange={ (event) => {this.handleFileListThenAssignArrAudio(event.target.files, false)} } multiple hidden preload="metadata"/>
```
の _onClick_ イベントを発生させます。
    
<br/>

### 2) ユーザーからのオーディオファイルをチェックして分岐する
[handleFileListThenAssignArrAudio( _**flieLilst: FileList, clear: bool**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L364-L399)　から</br>
ユーザーによって _**input**_ された `fileList` をチェックして分岐します。
#### case 1 : パラメタ `clear` が _true_ にセットされた場合
初期化する為、 まず `this.arrAudioCard` が空いているかチェックして `this.arrAudioCard` 含んで[メンバー変数たちを初期化します](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L369-L375)。</br>
その時、 もしオーディオが再生中だったら、　オーディオを停止して `this.audio` を[初期化すます](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L377-L388)
#### case 2 : `fileList` が空いている場合
新しく `this.arrAudioCard` に割り当てるオーディオファイルがない為、 [すぐ _return_ します](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L393-L397)。
#### それとも
[fetchTagThenInitCard( _**fileList: Filelist**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L330-L362)　を呼び出します。

</br>

### 3) オーディオタグを読み取る
fetchTagThenInitCard( _**fileList: Filelist**_ )　ではパラメタ `flieList` を _forEach_ で[格要素を巡回します](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L339-L361)。</br>
格 _loop_ では外部ライブラリ `this.jsmediatags` の [read( _**each: File**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L340) を呼び出してオーディオファイルからタグを取ります。</br>
read( _**each: File**_ ) が成功したら _async callback_ `onSuccess()`　を実行されます。
```JSX
onSuccess: (tag) => {
    checker(tag, each.name);

    this.initAudioCard(tag, each);
    this.idxAudioCard++
    counter--;

    if(counter === 0)
    {
        this.setState({
            isDone: true
        });
    }
},
```
`onSuccess()` で読み取ったタグ(`tag`)とオーディオファイル(`each`)をパラメタにする　[initAudioCard( _**tag: object, audio: file**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L295-L328) を呼び出します。</br>
後、 `this.arrAudioCard` の _index_ である　`this.idxAudioCard` は 1つづ足す、</br>
`onSuccess()` が非同期的に作動する為、 最後の _loop_ で `setState()` を実行する為の変数 `counter`　は　1つづ引きます。

</br>

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
