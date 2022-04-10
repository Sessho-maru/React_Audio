import axios from 'axios';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, useRouteMatch } from 'react-router-dom';
import { w3cwebsocket as WebSocket } from "websocket";
import AudioCard from './AudioCard';
import AudioInfo from './Audioinfo';

const ROOT_DIR = {local: 'http://localhost:3000/', server: '???'};
const jsmediatags = require('jsmediatags');
const str = "This is test From origin/master";

class Main extends Component
{
	setCardLabel = {
        toPlay: {
            text: (cardIdx) => { document.getElementById(`${cardIdx}`).innerHTML = "stop"; },
            color: (cardIdx) => { document.getElementById(`${cardIdx}_div`).classList.add("indigo"); }
        },
        toStop: {
            text: (cardIdx) => { document.getElementById(`${cardIdx}`).innerHTML = "play"; },
            color: (cardIdx) => { document.getElementById(`${cardIdx}_div`).classList.remove("indigo"); }
        },
        toQueueOn: {
            text: (cardIdx, text = 'enqueue') => { document.getElementById(`${cardIdx}`).innerHTML = text; },
            color: (cardIdx) => { document.getElementById(`${cardIdx}_div`).classList.add("grey"); document.getElementById(`${cardIdx}_div`).classList.add("darken-3"); }
        },
        toQueueOff: {
            text: (cardIdx) => { document.getElementById(`${cardIdx}`).innerHTML = 'play'; },
            color: (cardIdx) => { document.getElementById(`${cardIdx}_div`).classList.remove("grey"); document.getElementById(`${cardIdx}_div`).classList.remove("darken-3"); }
        }
    }

	constructor(props)
	{
		super(props);
		this.arrAudioCard = [];
		this.idxAudioCard = 0;
		this.idxDurationPair = new Map();

		this.timeoutID = "";
		this.audio = new Audio();
		this.pausedAt = 0;
		this.CUE = {
			CUR: "",
			NEXT: ""
		};

		this.arrFiles = [];
		this.metadatas = [];

		this.queueSheet = [];
		this.isQueuingMode = false;
		this.isShuffleMode = false;
		this.isRepeatMode = false;

		this.buffer = [];
		this.socket = new WebSocket("ws://localhost:5000/");
		this.reader = new FileReader();
		this.idSampleBeloaded = 0;

		this.state = {
			isDone: false,
			isPlaying: false,
			gridColSize: 3,
			isSampleBeeningLoad: false,
		};
	}

	isQueueSheetEmpty = () => {
		return this.queueSheet.length === 0;
	}

	isNextOutOfIdx = () => {
		return this.CUE.NEXT > this.arrAudioCard.length - 1;
	}

	isHome = () =>{
		return window.location.href === ROOT_DIR.local;
	}

	setLabelStateIdxOf = (state, index, label = 'enqueue') => {
		if (this.isHome())
		{
			switch(state)
			{
				case 'play':
					this.setCardLabel.toPlay.text(index);
					this.setCardLabel.toPlay.color(index);
					break;
				case 'stop':
					this.setCardLabel.toStop.text(index);
					this.setCardLabel.toStop.color(index);
					break;
				case 'queue-on':
					this.setCardLabel.toQueueOn.text(index, label);
					this.setCardLabel.toQueueOn.color(index);
					break;
				case 'queue-off':
					this.setCardLabel.toQueueOff.text(index);
					this.setCardLabel.toQueueOff.color(index);
					break;
				default:
			}
		}
	}

	queueNextAudio = (pausedAt = 0) => {
		clearTimeout(this.timeoutID);

		switch (true) {
			case this.isShuffleMode:
				this.CUE.NEXT = Math.floor(Math.random() * 1000) % this.arrAudioCard.length;
				break;
			case this.isRepeatMode:
				this.CUE.NEXT = this.CUE.CUR;
				break;
			default :
				this.CUE.NEXT = (this.CUE.CUR) + 1;
				break;
		}

		this.timeoutID = setTimeout( () => {
			if (this.isQueueSheetEmpty() && this.isNextOutOfIdx()) 
			{
				this.stop();
				return;
			}

			if (!this.isQueueSheetEmpty())
			{
				this.CUE.NEXT = this.queueSheet.shift();
			}

			if (this.isQueuingMode && this.isHome())
			{
				this.toggleQueuingMode();
				this.handlePlay();
				this.toggleQueuingMode();
				return;
			}

			this.handlePlay();
		}, (this.idxDurationPair.get(this.CUE.CUR) - pausedAt) * 1000 );
	}

	toggleQueuingMode = () => {
		if (this.isQueuingMode)
		{
			this.updateQueueState('turnoff');
		}
		else
		{
			this.updateQueueState('turnon');
		}
	}

	updateQueueState = (flag) => {
		switch(flag)
		{
			case 'turnon':
				for(let index = 0; index < this.arrAudioCard.length; index++)
				{
					if (index === this.CUE.CUR)
					{
						continue;
					}

					if (this.queueSheet.includes(index) === true)
					{
						this.setLabelStateIdxOf('queue-on', index, this.queueSheet.indexOf(index) + 1);
					}
					else
					{
						this.setLabelStateIdxOf('queue-on', index);
					}
				}
				this.isQueuingMode = true;
				break;
			case 'turnoff':
				for(let index = 0; index < this.arrAudioCard.length; index++)
				{
					if (index === this.CUE.CUR)
					{
						continue;
					}
					this.setLabelStateIdxOf('queue-off', index);
				}
				this.isQueuingMode = false;
				break;
		}
	}

	playThenSetDurationLabel = () => {
		this.CUE.CUR = this.CUE.NEXT;
		this.audio.src = URL.createObjectURL(this.arrFiles[this.CUE.CUR]);
		this.audio.play();
		this.setLabelStateIdxOf('play', this.CUE.CUR);
	}

	handlePlay = (isUserInput = false) => {
		if (isUserInput && (this.CUE.NEXT === this.CUE.CUR))
		{
			this.stop();
			return;
		}

		if (this.isQueuingMode)
		{
			let pos = this.queueSheet.indexOf(this.CUE.NEXT);
			if (pos !== -1)
			{
				this.queueSheet.splice(pos, 1);
				console.log('CUE SHEET:', this.queueSheet);
				this.updateQueueState('turnon');
				return;
			}
	
			this.queueSheet.push(this.CUE.NEXT);
			console.log('CUE SHEET:', this.queueSheet);
			this.setLabelStateIdxOf('queue-on', this.CUE.NEXT, this.queueSheet.length);
			return;
		}

		console.log("PLAY");
		if (this.CUE.CUR === "")
		{
			if (this.arrFiles[this.CUE.NEXT] === "SOURCING_BY_STREAM")
			{
				console.log('Streaming via socket will be started');
				this.socket.send(this.idSampleBeloaded);
				return;
			}

			this.playThenSetDurationLabel();

			this.pausedAt = 0;
			this.setState({
				isPlaying: true
			});
			return;
		}

		this.setLabelStateIdxOf('stop', this.CUE.CUR);

		this.audio.pause();
		this.playThenSetDurationLabel();

		this.pausedAt = 0;
		this.setState({
			isPlaying: true
		});
	}

	pause = () => {
		if (this.state.isPlaying === true)
		{
			console.log("PAUSE");
			clearTimeout(this.timeoutID);
			this.pausedAt = this.audio.currentTime;
			this.audio.pause();

			this.setState({
				isPlaying: false
			});
		}
		else
		{
			if (this.audio !== null)
			{
				console.log("PLAY");
				this.audio.play();
				this.queueNextAudio(this.pausedAt);

				this.setState({
					isPlaying: true
				});
			}
		}
	}

	stop = () => {
		console.log("STOP");
		clearTimeout(this.timeoutID);

		this.setLabelStateIdxOf('stop', this.CUE.CUR);
		this.audio.pause();
		
		this.CUE.CUR = "";
		this.CUE.NEXT = "";
		this.pausedAt = 0;

		this.setState({
			isPlaying: false
		});
	}

	initAudioCard = (tag, audio) => {
		let metadata = {
			pathname: `/${this.idxAudioCard}`,
			tag: {
				title: tag.tags.title,
				artist: tag.tags.artist,
				album: tag.tags.album,
				genre: tag.tags.genre,
				year: tag.tags.year,
				track: tag.tags.track,
				albumArtUrl: "",
			},
			index: this.idxAudioCard
		};

		this.metadatas[this.idxAudioCard] = metadata;
		this.arrFiles[this.idxAudioCard] = audio;

		if (tag.tags.picture === undefined) 
		{
			metadata.tag.albumArtUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1200px-No_image_available.svg.png";
		}
		else
		{
			const { data, type } = tag.tags.picture;
			const byteArray = new Uint8Array(data);
			const blob = new Blob([byteArray], { type });
			metadata.tag.albumArtUrl = URL.createObjectURL(blob);
		}

		this.arrAudioCard[this.idxAudioCard] =  <div key={this.idxAudioCard} className="container">
													<AudioCard CUE={ this.CUE } _play={ this.handlePlay } audioMetadata={ metadata } gridColSize={ this.state.gridColSize }/>
												</div>
	}

	fetchTagThenInitCard = (filelist) => {
		let checker = (tag, fileName) => { // TODO: delete alert() calls
			if (tag === undefined) { alert(`No any given Tag data!\n:${fileName}`); return; }
			if (tag.tags.title === undefined) { alert(`No given {Title}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artist} is required`); tag.tags.title = "untitled"; }
			if (tag.tags.artist === undefined) { alert(`No given {Artistname}!\n:${fileName}\nto fetch Youtube search result, {Title} and {Artistname} is required`); tag.tags.artist = ""; }
			if (tag.tags.picture === undefined) { alert(`No given Albumart data!\n:${fileName}`); }
		}

		let counter = [...filelist].length;
		[...filelist].forEach((each) => {
			jsmediatags.read(each, {
				onSuccess: (tag) => {
					checker(tag, each.name);

					this.initAudioCard(tag, each);
					this.idxAudioCard++;
					counter--;

					if (counter === 0)
					{
						this.setState({
							isDone: true
						});
					}
				},
				onError: (error) => {
					console.log("jsmediaTags.read() has been run, but failed", error);
					counter--;
				}    
			});
		});
	}

	handleFilelistThenAssignArrAudio = (fileList, clear) => {
		if (clear === true)
		{
			if (this.arrAudioCard.length !== 0)
			{
				this.arrAudioCard = [];
				this.idxAudioCard = 0;
				this.idxDurationPair = new Map();

				this.arrFiles = [];
				this.metadatas = [];
				this.queueSheet = [];

				if (this.audio !== null)
				{
					if (this.state.isPlaying === true)
					{
						this.audio.pause();
						this.setState({
							isPlaying: false,
						});
					}
					this.audio = null;
					this.pausedAt = 0;
				}
				this.CUE.CUR = "";
				this.CUE.NEXT = "";
			}
		}
		if (fileList.length === 0)
		{
			console.log('NO FILE SELECTED');
			return;
		}   
		this.fetchTagThenInitCard(fileList);
	}

	openFileDialog = (clear) => {
		switch(clear)
		{
			case true: 
				this.NewAudio.click();
				break;
			case false:
				this.AppendAudio.click();
				break;
			default:
				break;
		}
	}

	sampleGetTagMeta = () => {
		axios.get(`/api/samples/tag?id=${this.idSampleBeloaded}`)
			.then((res) => {
				this.initAudioCard(res.data.body, "SOURCING_BY_STREAM");
				this.setState({
					isSampleBeeningLoad: true
				});
			});
	}

	// load sample 버튼 클릭할때 마다 tag 만 response

	setGridColumnSizeTo(colSize)
	{
		for(let i = 0; i < this.idxAudioCard; i++)
		{
			this.arrAudioCard[i] =  <div key={i} className="container">
										<AudioCard CUE={ this.CUE } _play={ this.handlePlay } audioMetadata={ this.metadatas[i] } gridColSize={ colSize }/>
									</div>
		}
		[...document.getElementsByClassName('setColSize')].forEach( (each) => {
			each.setAttribute('style', ' background: rgba(95,117,241,0.4)');
		});
		document.getElementById(`colSize${colSize}`).setAttribute('style', 'background: rgba(242,180,0);');
		this.setState({ gridColSize: colSize });
	}

	componentDidMount()
	{
		var elems = document.querySelectorAll('.fixed-action-btn');
		var instances = window.M.FloatingActionButton.init(elems, {
			direction: 'top'
		});

		this.NewAudio = document.getElementById('new');
		this.AppendAudio = document.getElementById('append');
		this.Queue = document.getElementById('queue_icon');
		this.Shuffle = document.getElementById('shuffle_icon');
		this.Repeat = document.getElementById('repeat_icon')
		this.ProgressRange = document.getElementById('range');

		this.audio.onloadedmetadata = () => {
			this.idxDurationPair.set(this.CUE.CUR, this.audio.duration);
			console.log("NOW PLAYING:", this.metadatas[this.CUE.CUR].tag, "DURATION:", this.audio.duration);
			this.queueNextAudio();
		}
		this.audio.ontimeupdate = () => {
			const currentTs = Math.floor(this.audio.currentTime * 1000);
			const totalTs = Math.floor(this.audio.duration * 1000);

			let calculated = currentTs/totalTs;
			calculated = calculated * 10000;
			calculated = Math.floor(calculated);
			calculated = calculated / 10;

			this.ProgressRange.value = calculated;
		}

		this.socket.onopen = () => {
			console.log('WebSocket Client Connected');
		}
		this.socket.onmessage = (message) => {
			this.reader.readAsArrayBuffer(message.data);
		}

		this.reader.onload = (event) => {
			this.buffer = new Uint8Array(event.target.result);
			this.arrFiles[this.CUE.NEXT] = new Blob([this.buffer], { type: 'audio/mpeg' });
			this.playThenSetDurationLabel();
		}
	}

	componentDidUpdate()
	{
		console.log("IS PLAYING: " + this.state.isPlaying);
		console.log("CUE SHEET: ", this.queueSheet);
		console.log("ARR AUDIO: ", this.arrAudioCard);
		console.log("============================");

		if (this.isShuffleMode || this.isRepeatMode)
		{
			this.Queue.classList.add('queue_disabled'); 
		}
		else 
		{
			this.Queue.classList.remove('queue_disabled');
		}
	}

	componentWillUnmount()
	{
		clearTimeout(this.timeoutID);
	}

	render()
	{
		console.log("render() has ran");
		
		return (
			<div className="row">
				<div id="nav" className="col xl2 l2 m2 s2">
					<div id="samplesButton">
						<a className="waves-effect waves-light btn-large" onClick={ () => {this.sampleGetTagMeta()} }><i className="material-icons right">cloud</i>Load Sample</a>
					</div>
					<div id="gridColSize">
						<div id="colSize2" className="setColSize" onClick={ () => { this.setGridColumnSizeTo(2) } }>6</div>
						<div id="colSize3" className="setColSize" onClick={ () => { this.setGridColumnSizeTo(3) } }>4</div>
						<div id="colSize4" className="setColSize" onClick={ () => { this.setGridColumnSizeTo(4) } }>3</div>
						<div id="colSize6" className="setColSize" onClick={ () => { this.setGridColumnSizeTo(6) } }>2</div>
					</div>
					<div className="fixed-action-btn">
						<a className="btn-floating btn-small indigo lighten-2"><i className="large material-icons">add</i></a>
						<ul>
							<li>
								<a onClick={ () => {this.openFileDialog(false)} } className="btn-floating blue"><div className="fileSelector">ADD</div></a>
							</li>
							<li>
								<a onClick={ () => {this.openFileDialog(true)} } className="btn-floating green"><div className="fileSelector">NEW</div></a>
							</li>
						</ul>
					</div>
				</div>

				<div id="now_playing" className="col xl10 l10 m10 s10">
					<a id="play_button" className="btn-floating btn-large waves-effect waves-light red">
						<i className="large material-icons" onClick={ () => { this.pause() }}>{ this.state.isPlaying === true ? "pause" : "play_arrow" }</i>
					</a>
					<div className="panel">
						<div className="title_and_album">
							<label className="album">{this.CUE.CUR === "" ? "- - -" : this.metadatas[this.CUE.CUR].tag.album}</label>
							<label className="artist_title">{this.CUE.CUR === "" ? "- - -" : `${this.metadatas[this.CUE.CUR].tag.artist} - ${this.metadatas[this.CUE.CUR].tag.title}`}</label>
						</div>
						
						<div className="controller">
							<div className="controls">

								<div className="queue waves-effect waves-light">
									<i id="queue_icon" className="medium material-icons" onClick={ (event) => { 
											this.isQueuingMode === false ? event.target.classList.add('clicked') : event.target.classList.remove('clicked');
											if (this.isShuffleMode === true) { this.Shuffle.classList.remove('clicked'); this.isShuffleMode = false; }
											if (this.isRepeatMode === true) { this.Repeat.classList.remove('clicked'); this.isRepeatMode = false; }
											this.toggleQueuingMode();
										}}>{"plus_one"}</i>
								</div>
								<div className="shuffle waves-effect waves-light">
									<i id="shuffle_icon" className="medium material-icons" onClick={ (event) => {
											this.isShuffleMode === false ? event.target.classList.add('clicked') : event.target.classList.remove('clicked');
											this.isShuffleMode = !(this.isShuffleMode);
											if (this.audio !== null) { this.queueNextAudio(this.audio.currentTime); }
											if (this.isRepeatMode === true) { this.Repeat.classList.remove('clicked'); this.isRepeatMode = false; }
											if (this.isQueuingMode === true) { this.Queue.classList.remove('clicked'); this.toggleQueuingMode(); }
											this.setState({isNeedToReRender: true});
										}}>{"shuffle"}</i>
								</div>
								<div className="repeat waves-effect waves-light">
									<i id="repeat_icon" className="medium material-icons" onClick={ (event) => { 
											this.isRepeatMode === false ? event.target.classList.add('clicked') : event.target.classList.remove('clicked')
											this.isRepeatMode = !(this.isRepeatMode);
											if (this.audio !== null) { this.queueNextAudio(this.audio.currentTime); }
											if (this.isShuffleMode === true) { this.Shuffle.classList.remove('clicked'); this.isShuffleMode = false; }
											if (this.isQueuingMode === true) { this.Queue.classList.remove('clicked'); this.toggleQueuingMode(); }
											this.setState({isNeedToReRender: true});
										}}>{"repeat_one"}</i>
								</div>
								<div className="next waves-effect waves-green">
									<i className="medium material-icons" onClick={ () => { if (this.CUE.CUR !== "") { this.queueNextAudio(this.idxDurationPair.get(this.CUE.CUR)); } }}>{"skip_next"}</i>
								</div>

							</div>
						</div>
					</div>
				</div>

				<div id="content" className="col xl10 l10 m10 s10">
					<Router>
						<Route exact path="/" render={ () => { return (this.arrAudioCard); }}/>
						<Route exact path="/:audioIndex" component={AudioInfo} />
					</Router>
				</div>

				<input type="file" accept="audio/*" id="new" onChange={ (event) => {this.handleFilelistThenAssignArrAudio(event.target.files, true)} } multiple hidden preload="metadata"/>
				<input type="file" accept="audio/*" id="append" onChange={ (event) => {this.handleFilelistThenAssignArrAudio(event.target.files, false)} } multiple hidden preload="metadata"/>

				<div className="progressBar">
					<input id="range" type="range" step="0.1" defaultValue="0.0" begin="00:00" end="00:00" min="0" max="1000"/>
				</div>
			</div>
		);
	}
}

export default Main;

/*
	TODO:
		display no tag warning
		loading screen
		this.audio !== null -> this.audio.src !== undefined ?

		implementing streaming
		implementing progressBar

		streaming from Youtube #https://github.com/microlinkhq/youtube-dl-exec
		writing tag #https://github.com/Zazama/node-id3
		lyrics #https://github.com/zyrouge/node-genius-lyrics
		gapless #https://stackoverflow.com/questions/7330023/gapless-looping-audio-html5

		read
		https://codeburst.io/how-to-not-react-common-anti-patterns-and-gotchas-in-react-40141fe0dcd
*/
