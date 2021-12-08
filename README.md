# このアプリについて
このSPAアプリケーションはいくつの機能が使えるミュージックプレイヤーです。例えば
* プーレイ
    -
    - プレイ/ポーズ、シャッフル、リピート、キューイング<br/>
      <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example_2.gif"/>
    <br/><br/><br/>
* タグ解釈
  -
  - オーディオクファイルに組み込んでいる( `title`, `artist`, `album`, `release year`, `album cover` )情報を読み取れます
  <br/><br/><br/>
* YouTube 検索からクローリング
  -
  - タグ情報をキーワードとして YouTube 検索を行い、その結果をページに表示ます<br/>
    <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example.gif"/><br/><br/><br/>



### [DEMO](http://13.52.99.145/)
アプリテストの為、オーディオファイルをいくつか用意しました。</br>
[No Copyright Audio (google drive)](https://drive.google.com/file/d/189yn4UCuL9iFMbJ9hrBz5q2_kzAsTRsh/view?usp=sharing)

</br>

# プログラムの概略的なフロー
### 重要なメンバー変数：</br>
```JSX
this.arrAudioCard: react.element[]　// reactComponent <AudioCard> を要素としてする配列
this.idxAudioCard: Number // this.arrAudioCard の index
this.CUE: Object // 再生をコントロールする為、オーディオの index を指定
                    // CUR: Number 今、プレイ中のオーディオ index
                    // NEXT: Number 次プレイするオーディオ index
this.idxDurationPair: Map(index: number, duration: number) // 格音楽の index と再生の長さ(duration)を持つ Map
```

### 0 ) ユーザーからのオーディオファイル _input_ 処理
#### * ユーザーからオーディオファイル _**input**_ を貰います。
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

[openFileDialog( _**clear: bool**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L401-L413)　から</br>
格 `<input type="file" accept="audio/*">`　ノード
```JSX
<input type="file" accept="audio/*" id="new" onChange={ (event) => {this.handleFileListThenAssignArrAudio(event.target.files, true)} } multiple hidden preload="metadata"/>
<input type="file" accept="audio/*" id="append" onChange={ (event) => {this.handleFileListThenAssignArrAudio(event.target.files, false)} } multiple hidden preload="metadata"/>
```
の _onClick_ イベントを発生させます。</br>
ユーザーがオディールファイルを選択したら `<input>` ノードの _onChange_ イベントが発生され</br>
handleFileListThenAssignArrAudio( _**flieLilst: FileList, clear: bool**_ ) が実行されます。</br></br>

#### * _input_ をチェックして分岐する
[handleFileListThenAssignArrAudio( _**flieLilst: FileList, clear: bool**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L364-L399)　から</br>
ユーザーによって _**input**_ された `fileList` をチェックして分岐します。
#### case 1 : パラメタ `clear` が _true_ にセットされた場合
初期化する為、 まず `this.arrAudioCard` が空いているかチェックして `this.arrAudioCard` 含んで[メンバー変数たちを初期化します](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L369-L375)。</br>
その時、 もしオーディオが再生中だったら、　オーディオを停止して `this.audio` を[初期化すます](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L377-L388)
#### case 2 : `fileList` が空いている場合
新しく `this.arrAudioCard` に割り当てるオーディオファイルがない為、 [すぐ _return_ します](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L393-L397)。
#### その後
[fetchTagThenInitCard( _**fileList: FileList**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L330-L362)　を呼び出します。

</br>

### 1 ) オーディオタグを読み取って `<AudioCard>` を初期化してページをに表示
fetchTagThenInitCard( _**fileList: FileList**_ )　ではパラメタ `flieList` を _forEach_ で格要素を巡回して格ファイルからタグを取ります。</br>
格 _loop_ では外部ライブラリ `this.jsmediatags` の _async function_ [read( _**each: File**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L340) を呼び出してオーディオファイルからタグ情報を取ります。</br>
read( _**each: File**_ ) が成功したら _callback_ `onSuccess()`　が実行されます。
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
`onSuccess()` で読み取ったタグ(`tag`)とオーディオファイル(`each`)をパラメタにする　[initAudioCard( _**tag: Object, audio: File**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L295-L328) を呼び出します。</br>
後、 `this.arrAudioCard` の _index_ である　`this.idxAudioCard` は 1つづ足す、</br>
`onSuccess()` は非同期的に実行される為、 最後の _loop_ で `setState()` を実行する為の変数 [`counter`](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L338)　は　1つづ引きます。

</br>

#### * reactComponent `<AudioCard>` の配列を初期化する
initAudioCard( _**tag: Object, audio: File**_ ) では `<AudioCard>` _component_ に渡る _props_ を定義し</br>
`<AudioCard>` を `this.arrAudioCard` に割り当てます。
```JSX
this.arrAudioCard[this.idxAudioCard] =  <div key={this.idxAudioCard} className="container">
                                          <AudioCard CUE={ this.CUE } _play={ this.handlePlay } audioMetadata={ metadata } gridColSize={ this.state.gridColSize }/>
                                        </div>
```
以下は `<AudioCard>` に渡される _props_ の一部です。
#### CUE={ this.CUE }
現在の `this.CUE` オブジェクトを渡します。</br>
`this.CUE` は _Object_ の為、参照で渡されます。

#### _play={ this.handlePlay }
`<Main>` から定義された `this.handlePlay` を渡します。</br>
Javascript では関数も基本的に参照渡しの為 _function pointer_ の形で渡されます。

#### audioMetadata={ metadata }
`metadata` オブジェクトを渡します。
```JSX
let metadata = {
  pathname: `/${this.idxAudioCard}`,  // コンポーネント <AudioInfo> に繋がる <Link> path の pathname
  tag: {                              // オーディオファイルのタグ情報
    title: tag.tags.title,
    artist: tag.tags.artist,
    album: tag.tags.album,
    genre: tag.tags.genre,
    year: tag.tags.year,
    track: tag.tags.track,
  },                                  
  albumArtUrl: "",                    // イメージファイルから作った Blob オブジェクト Url
  index: this.idxAudioCard            // index
};
```
`<AudioCard>` では **react-router** の `<Link>` を使ってページの url を _**/:audioIndex**_ に移動させています。</br>
```JSX
<Link to={ props.audioMetadata }>
    <div className="card-image">
        <img src={ props.audioMetadata.albumArtUrl } />
    </div>
    <div className="card-content">
        <p>{ props.audioMetadata.tag.title }</p>
    </div>
</Link>
```
_path_ _**/:audioIndex**_ は `<Router>` によって YouTube クローリング結果を並べる他のコンポーネント `<AudioInfo>` と[繋がります](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L575-L578)。
```JSX
<Router>
  <Route exact path="/" render={ () => { return (this.arrAudioCard); }}/>
  <Route exact path="/:audioIndex" component={AudioInfo} />
</Router>
```
なので、 `<AudioCard>` コンポーネントをクリックしたら `<Link>` によって url が _**/:audioIndex**_ に移動されると同時に</br>
`<Router>` によって `<Main>` コンポーネントではなくて `<AudioInfo>` がページにレンダリングされます。

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
