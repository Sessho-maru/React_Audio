# アプリについて
Single page Web music player です。
* プーレイ
    -
    - プレイ/ポーズ、シャッフル、リピート、キューイング<br/>
      <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example_2.gif"/>
    <br/><br/><br/>
* タグ読み取り
  -
  - オーディオクファイルに組み込んでいる( `title`, `artist`, `album`, `release year`, `album cover` )情報を読み取れます
  <br/><br/><br/>
* YouTube 検索からクローリング
  -
  - タグ情報をキーワードとして YouTube 検索を行い、その結果をページに表示ます<br/>
    <br/><img src="https://raw.githubusercontent.com/Sessho-maru/React_Audio/master/example.gif"/><br/><br/><br/>




[テスト用オーディオサンプル (google drive)](https://drive.google.com/drive/folders/1JOazYufwSyAIV3mDmW8my_AgiOfxwI8n?usp=sharing)

</br>

# プログラムの概略的なフロー
### 重要メンバー変数：</br>
```JSX
this.arrAudioCard: react.element[]　// reactComponent <AudioCard> を要素としてする array
this.idxAudioCard: Number // this.arrAudioCard の index
this.CUE: Object // 再生を制御する為、オーディオの index を指定
                    // CUR: Number 今、プレイ中のオーディオ index
                    // NEXT: Number 次プレイするオーディオ index
this.idxDurationPair: Map(index: number, duration: number) // オーディオの index と再生の長さ(duration)を持つ Map
```

### 0 ) ユーザーからのオーディオファイル _input_ 処理
#### * ユーザーからオーディオファイル _**input**_ を貰います。
_**input**_ モードは２つが有ります。</br>
#### ADD
```JSX
<a onClick={ () => {this.openFileDialog(clear = false)} } className="btn-floating blue"><div className="fileSelector">ADD</div></a>
```
パラメタ `clear` を _false_ にセットします。</br>
ユーザー _**input**_ したオーディオファイルを `this.arrAudioCard` に _**append**_ します。</br>

#### NEW
```JSX
<a onClick={ () => {this.openFileDialog(clear = true)} } className="btn-floating blue"><div className="fileSelector">NEW</div></a>
```
パラメタ `clear` を _true_ にセットします。</br>
`this.arrAudioCard` を空にしたから _**append**_ します。</br>

[openFileDialog( _**clear: bool**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L402-L414)　から</br>
`<input type="file" accept="audio/*">`　ノードそれぞれの
```JSX
<input type="file" accept="audio/*" id="new" onChange={ (event) => {this.handleFileListThenAssignArrAudio(event.target.files, true)} } multiple hidden preload="metadata"/>
<input type="file" accept="audio/*" id="append" onChange={ (event) => {this.handleFileListThenAssignArrAudio(event.target.files, false)} } multiple hidden preload="metadata"/>
```
_onClick_ イベントを呼び出します。</br>
ユーザーが file dialog からオディールファイルを選択したら `<input>` ノードの _onChange_ イベントが呼び出され、</br>
handleFileListThenAssignArrAudio( _**flieLilst: FileList, clear: bool**_ ) が走ります。</br></br>

#### * _input_ をチェックして分岐する
[handleFileListThenAssignArrAudio( _**flieLilst: FileList, clear: bool**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L365-L400)　から</br>
ユーザーが _**input**_ した `fileList` と `clear` をチェックして分岐します。
#### case 1 : パラメタ `clear` が _true_ にセットされた場合
初期化する為、 まず `this.arrAudioCard` が空いているかチェックして `this.arrAudioCard` 含め[メンバー達を初期化します](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L370-L376)。</br>
その時、 オーディオがプレイ中であったら、　再生を止めて `this.audio` を[初期化すます](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L378-L389)
#### case 2 : `fileList` が空いている場合
新しく `this.arrAudioCard` に割り当てるファイルがないので、 [すぐ _return_ します](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L394-L398)。
#### その後
[fetchTagThenInitCard( _**fileList: FileList**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L332-L363)　を呼び出します。

</br>

### 1 ) タグを読み取って `<AudioCard>` を初期化してページをに表示
fetchTagThenInitCard( _**fileList: FileList**_ )　はパラメタ `flieList` を _forEach_ で要素を巡って各ファイルからタグを取ります。</br>
各 _loop_ では外部ライブラリ `this.jsmediatags` の _async function_ [read( _**each: File**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L342) を呼び出してオーディオファイルからタグ情報を取ります。</br>
read( _**each: File**_ ) が成功したら _callback_ `onSuccess()` が実行されます。
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
`onSuccess()` では読み取って来たタグ(`tag`)をパラメータで持ち、_for each_ ループ _scope_ に有った(`each`)ファイルオブジェクトを　[initAudioCard( _**tag: Object, audio: File**_ )](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L297-L330) に投げて呼び出します。</br>
その後、`this.idxAudioCard` は 1つづ足すし、</br>
`onSuccess()` が非同期に実行される為、 最終 _loop_ で `setState()` を呼び出す目的で用意した [`counter`](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L348) は 1つづ引きます。

</br>

#### * this.arrAudioCard に `<AudioCard>` を割り当てます
initAudioCard( _**tag: Object, audio: File**_ ) では `<AudioCard>` _component_ に渡す _props_ を定義し、</br>
`<AudioCard>` を `this.arrAudioCard` に割り当てます。
```JSX
this.arrAudioCard[this.idxAudioCard] =  <div key={this.idxAudioCard} className="container">
                                          <AudioCard CUE={ this.CUE } _play={ this.handlePlay } audioMetadata={ metadata } gridColSize={ this.state.gridColSize }/>
                                        </div>
```
以下は `<AudioCard>` に渡す _props_ の一部です。
#### CUE={ this.CUE }
`this.CUE` オブジェクトを渡します。</br>
`this.CUE` は _Object_ の為、参照で渡されます。

#### _play={ this.handlePlay }
`<Main>` から定義された `this.handlePlay` を渡します。</br>
JavaScript では関数も参照渡しである為、 _function pointer_ の形(アドレス)で渡します。

#### audioMetadata={ metadata }
`metadata` オブジェクトを渡します。
```JSX
let metadata = {
  pathname: `/${this.idxAudioCard}`,  // コンポーネント <AudioInfo> に繋がる <Link> path の pathname
  tag: {                              // オーディオタグ情報
    title: tag.tags.title,
    artist: tag.tags.artist,
    album: tag.tags.album,
    genre: tag.tags.genre,
    year: tag.tags.year,
    track: tag.tags.track,
  },                                  
  albumArtUrl: "",                    // `Album-art`タグから作った Blob オブジェクト Url
  index: this.idxAudioCard            // index
};
```
`<AudioCard>` は `<Link>` を用いてページの url を _**/:audioIndex**_ に移し、
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
_path_ _**/:audioIndex**_ は `<Router>` によって YouTube クローリング結果表示する `<AudioInfo>` と繋がります[繋がります](https://github.com/Sessho-maru/React_Audio/blob/master/client/src/Main.js#L590-L593)。</br>
```JSX
<Router>
  <Route exact path="/" render={ () => { return (this.arrAudioCard); }}/>
  <Route exact path="/:audioIndex" component={AudioInfo} />
</Router>
```
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
サーバーが効いた上で、/clientディレクトリーで以下を入力</br></br>
❗❗❗ nodejs バージョン v17 以上からは `error:0308010C:digital envelope routines::unsupported` エラーが起きて起動出来ません。</br>
バージョン v14 以下(v14.17.3) で正常稼働確認済
```
  @ .../React_Audio-master/client
  npm start
```
