import axios from 'axios';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import AudioCard from './AudioCard';
import AudioInfo from './Audioinfo';

const rootDir = {local: 'http://localhost:3000/', server: '???'};

class Main extends Component
{
	setLabel = (flag, dist, queueIdx = 'enqueue') => {
		if (window.location.href === rootDir.local)
		{
			switch(flag)
			{
				case 'play':
					document.getElementById(`${dist}`).innerHTML = "stop";
					document.getElementById(`${dist}_selected`).classList.add("indigo");
					break;
				case 'stop':
					document.getElementById(`${dist}`).innerHTML = "play"; 
					document.getElementById(`${dist}_selected`).classList.remove("indigo");
					break;
				case 'queue-on':
					document.getElementById(`${dist}`).innerHTML = queueIdx;
					document.getElementById(`${dist}_selected`).classList.add("grey"); document.getElementById(`${dist}_selected`).classList.add("darken-3");
					break;
				case 'queue-off':
					document.getElementById(`${dist}`).innerHTML = 'play';
					document.getElementById(`${dist}_selected`).classList.remove("grey"); document.getElementById(`${dist}_selected`).classList.remove("darken-3");
					break;
				default:

			}
		}
	}

	constructor()
	{
		super();
		this.jsmediatags = require('jsmediatags');

		this.arrAudioCard = [];
		this.arrDurations = [];
		this.idxAudioCard = 0;

		this.timeoutID = "";
		this.audio = null;
		this.pausedAt = 0;
		this.CUE = {
			CUR: "",
			NEXT: ""
		};

		this.arrFiles = [];
		this.queueSheet = [];

		this.isQueuingMode = false;
		this.isShuffleMode = false;
		this.isRepeatMode = false;

		this.state = {
			isDone: false,
			isPlaying: false,
			isSampleBeeningLoad: false,
			label: {

			}
		};
	}

	queueSheetEmpty = () => {
		return this.queueSheet.length === 0;
	}

	isNextOutOfIdx = () => {
		return this.CUE.NEXT > this.idxAudioCard;
	}

	queueNextAudio = (pausedAt = 0) => {
		clearTimeout(this.timeoutID);

		switch (true) {
			case this.isShuffleMode === true:
				this.CUE.NEXT = Math.floor(Math.random() * 1000) % this.arrAudioCard.length;
				break;
			case this.isRepeatMode === true:
				this.CUE.NEXT = this.CUE.CUR;
				break;
			case (this.isQueuingMode === true) && (this.queueSheetEmpty === false):
				this.CUE.NEXT = (this.queueSheet.shift());
				break;
			default :
				this.CUE.NEXT = (this.CUE.CUR) + 1;
				break;
		}

		this.timeoutID = setTimeout( () => {
			if (this.queueSheetEmpty === true && this.isNextOutOfIdx === true) {
				this._stopAndChangeState();
			}
			else
			{
				if (this.isQueuingMode === true)
				{
					if (window.location.href === rootDir.local)
					{
						this.toggleQueuingMode();
						this.handleEnqueue();
						this.toggleQueuingMode();
					}
				}else {
					this.handlePlay();
				}
			}
		}, (this.arrAudioCard[this.CUE.CUR].duration - pausedAt) * 1000 );
	}

	toggleQueuingMode = () => {
		if (this.isQueuingMode === true)
		{
			for (let index = 0; index < this.arrAudioCard.length; index++)
			{
				if (index === this.CUE.CUR)
				{
					continue;
				}
				this.setLabel('queue-off', index);
			}
			this.isQueuingMode = false;
		}
		else
		{
			for (let index = 0; index < this.arrAudioCard.length; index++)
			{
				if (index === this.CUE.CUR)
				{
					continue;
				}

				if (this.queueSheet.includes(index) === true)
				{
					this.setLabel('queue-on', index, this.queueSheet.indexOf(index) + 1);
				}
				else
				{
					this.setLabel('queue-on', index);
				}
			}
			this.isQueuingMode = true;
		}
	}

	handlePlay = (isUserInput = false) => {
		if (isUserInput === true && (this.CUE.NEXT === this.CUE.CUR))
		{
			this._stopAndChangeState();
			return;
		}

		if(this.isQueuingMode === true)
		{
			if (this.queueSheet.includes(this.CUE.NEXT) === true)
			{
				let pos = this.queueSheet.indexOf(this.CUE.NEXT);
				this.setLabel('queue-off', pos);
	
				this.queueSheet.splice(pos, 1);
				return;
			}
	
			this.queueSheet.push(this.CUE.NEXT);
			this.setLabel('queue-on', this.CUE.NEXT, this.queueSheet.length);
			return;
		}

		console.log("PLAY");
		if (this.CUE.CUR === "")
		{
			this.audio = new Audio(URL.createObjectURL(this.arrFiles[this.CUE.NEXT]));
			this.audio.onloadedmetadata = () => {
				console.log(this.audio.duration);
				/*
					this.idxDurationPair.set(this.CUR.CUR, this.audio.duration);
				*/
				this.queueNextAudio(this.audio.duration);
			}
			this.audio.play();

			this.CUE.CUR = this.CUE.NEXT;

			this.setLabel('play', this.CUE.CUR);

			this.pausedAt = 0;
			this.setState({
				isPlaying: true
			});
			return;
		}

		this.audio.pause();
		this.audio.src = URL.createObjectURL(this.arrFiles[this.CUE.NEXT].file);
		this.audio.play();

		this.setLabel('stop', this.CUE.CUR);
		this.setLabel('play', this.CUE.NEXT);

		this.CUE.CUR = this.CUE.NEXT;
		this.queueNextAudio();

		this.pausedAt = 0;
		this.setState({
			isPlaying: true
		});
	}

	_pauseAndChangeState = () => {
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

	_stopAndChangeState = () => {
		console.log("STOP");
		clearTimeout(this.timeoutID);

		this.setLabel('stop', this.CUE.CUR);

		this.audio.pause();
		this.audio = null;
		
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
			},
			albumArtUrl: "",
			index: this.idxAudioCard
		};

		this.arrFiles[this.idxAudioCard] = audio;

		if (tag.tags.picture === undefined) 
		{
			metadata.albumArtUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1200px-No_image_available.svg.png";
		}
		else
		{
			const { data, type } = tag.tags.picture;
			const byteArray = new Uint8Array(data);
			const blob = new Blob([byteArray], { type });
			metadata.albumArtUrl = URL.createObjectURL(blob);
		}

		this.arrAudioCard[this.idxAudioCard] =  <div key={this.idxAudioCard} className="container">
													<AudioCard CUE={ this.CUE } audioMetadata={ metadata } _play={ this.handlePlay }/>
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
			this.jsmediatags.read(each, {
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
				onError: (error) => {
					console.log("jsmediaTags.read() has been run, but failed" + error);
					counter--;
					// checker(undefined, null);
				}    
			});
		});
	}

	handleFilelistThenAssignArrAudio = (fileList, clear) => { // 수정가능
		if (clear === true)
		{
			if (this.arrAudioCard.length !== 0)
			{
				this.arrAudioCard = [];
				if (this.audio !== null)
				{
					this.audio = null;
					this.pausedAt = 0;

					// Main.alterLabel.setLabelStopped.text(this.CUE.CUR);
					// Main.alterLabel.setLabelStopped.color(this.CUE.CUR);
				}
				this.CUE.CUR = "";
				this.CUE.NEXT = "";

				if (fileList.length === 0)
				{
					console.log('NO FILE SELECTED');
					this.setState({
						isPlaying: false,
					});
					return;
				}
			}   
		}

		this.fetchTagThenInitCard(fileList);
	}

	openFileDialog = (clear) => {
		switch(clear)
		{
			case true: 
				document.getElementById('new').click();
				break;
			case false:
				document.getElementById('append').click();
				break;
			default:
				break;
		}
	}

	loadSamples()
	{
		this.setState({
			isSampleBeeningLoad: true
		});

		axios.get('/api/samples/get')
			.then( (res) => {
				console.log(res.data);

				let buffers = res.data.body;
				let samplesList = buffers.map( (each, i) => {
					return new File([new Uint8Array(each.data)], 'sample_'+i+'.mp3', { type: 'audio/mpeg' });
				});

				this.handleFilelistThenAssignArrAudio(samplesList, false);
				this.setState({
					isSampleBeeningLoad: -1
				});
			})  
			.catch( (err) => {
				console.log(err);
			});
	}

	componentDidMount()
	{
		var elems = document.querySelectorAll('.fixed-action-btn');
		var instances = window.M.FloatingActionButton.init(elems, {
			direction: 'top'
		});
	}

	componentDidUpdate()
	{
		console.log("IS PLAYING?: " + this.state.isPlaying);
		if (this.state.isPlaying === true) { console.log(`NOW PLAYING: ${this.CUE.CUR}, duration: ${this.arrAudioCard[this.CUE.CUR].duration - this.pausedAt}`); }
		console.log("CUE SHEET: ", this.queueSheet);
		console.log("ARR AUDIO: ", this.arrAudioCard);
		console.log("============================");
		if (this.isShuffleMode || this.isRepeatMode) { 
			document.getElementById('queue_icon').classList.add('queue_disabled'); 
		}else {
			document.getElementById('queue_icon').classList.remove('queue_disabled');
		}
		// this.queueSheet.map( (each) => {
		// 	console.assert(typeof(each) === 'number');
		// });
	}

	componentWillUnmount()
	{
		clearTimeout(this.timeoutID);
	}

	render()
	{
		console.log("render() has ran");
		let loadSampleButton = "";

		switch (this.state.isSampleBeeningLoad) {
			case false :
				loadSampleButton = <a className="waves-effect waves-light btn-large" onClick={ () => {this.loadSamples()} }><i className="material-icons right">cloud</i>Load Samples</a>;
				break;
			case true :
				loadSampleButton =  <div className="preloader-wrapper big active">
										<div className="spinner-layer spinner-blue-only">
										<div className="circle-clipper left">
											<div className="circle"></div>
										</div>
										<div className="gap-patch">
											<div className="circle"></div>
										</div>
										<div className="circle-clipper right">
											<div className="circle"></div>
										</div>
										</div>
									</div>
				break;
			default:
				loadSampleButton = "";
		}
		
		return (
			<div className="row">
				<div id="nav" className="col xl2 l2 m2 s2">
					<div id="samplesButton">
						{ loadSampleButton }
					</div>
					<div className="fixed-action-btn">
						<a className="btn-floating btn-small grey lighten-1"><i className="large material-icons">add</i></a>
						<ul>
							<li>
								<a onClick={ () => {this.openFileDialog(false)} } className="btn-floating blue"><i className="material-icons">queue</i></a>
							</li>
							<li>
								<a onClick={ () => {this.openFileDialog(true)} } className="btn-floating green"><i className="material-icons">playlist_add</i></a>
							</li>
							
						</ul>
					</div>
				</div>

				<div id="now_playing" className="col xl10 l10 m10 s10">
					<a id="play_button" className="btn-floating btn-large waves-effect waves-light red">
						<i className="large material-icons" onClick={ () => { this._pauseAndChangeState() }}>{ this.state.isPlaying === true ? "pause" : "play_arrow" }</i>
					</a>
					<div className="panel">
						<div className="title_and_album">
							<label className="album">{this.CUE.CUR === "" ? "- - -" : this.arrAudioCard[this.CUE.CUR].album}</label>
							<label className="artist_title">{this.CUE.CUR === "" ? "- - -" : `${this.arrAudioCard[this.CUE.CUR].artist} - ${this.arrAudioCard[this.CUE.CUR].title}`}</label>
						</div>
						
						<div className="controller">
							<div className="controls">

								<div className="queue waves-effect waves-light">
									<i id="queue_icon" className="medium material-icons" onClick={ (event) => { 
											this.isQueuingMode === false ? event.target.classList.add('clicked') : event.target.classList.remove('clicked');
											if (this.isShuffleMode === true) { document.getElementById('shuffle_icon').classList.remove('clicked'); this.isShuffleMode = false; }
											if (this.isRepeatMode === true) { document.getElementById('repeat_icon').classList.remove('clicked'); this.isRepeatMode = false; }
											this.toggleQueuingMode();
										}}>{"plus_one"}</i>
								</div>
								<div className="shuffle waves-effect waves-light">
									<i id="shuffle_icon" className="medium material-icons" onClick={ (event) => {
											this.isShuffleMode === false ? event.target.classList.add('clicked') : event.target.classList.remove('clicked');
											this.isShuffleMode = !(this.isShuffleMode);
											if (this.audio !== null) { this.queueNextAudio(this.audio.currentTime); }
											if (this.isRepeatMode === true) { document.getElementById('repeat_icon').classList.remove('clicked'); this.isRepeatMode = false; }
											if (this.isQueuingMode === true) { document.getElementById('queue_icon').classList.remove('clicked'); this.toggleQueuingMode(); }
											this.setState({isNeedToReRender: true});
										}}>{"shuffle"}</i>
								</div>
								<div className="repeat waves-effect waves-light">
									<i id="repeat_icon" className="medium material-icons" onClick={ (event) => { 
											this.isRepeatMode === false ? event.target.classList.add('clicked') : event.target.classList.remove('clicked')
											this.isRepeatMode = !(this.isRepeatMode);
											if (this.audio !== null) { this.queueNextAudio(this.audio.currentTime); }
											if (this.isShuffleMode === true) { document.getElementById('shuffle_icon').classList.remove('clicked'); this.isShuffleMode = false; }
											if (this.isQueuingMode === true) { document.getElementById('queue_icon').classList.remove('clicked'); this.toggleQueuingMode(); }
											this.setState({isNeedToReRender: true});
										}}>{"repeat_one"}</i>
								</div>
								<div className="next waves-effect waves-green">
									<i className="medium material-icons" onClick={ () => { if (this.CUE.CUR !== "") { this.queueNextAudio(this.arrAudioCard[this.CUE.CUR].duration); } }}>{"skip_next"}</i>
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
			</div>
		);
	}
}

export default Main;

/*
	TODO:
		vertical axis count by state
		label by state
		durations arr
		display error
		loading screen

		read
		https://codeburst.io/how-to-not-react-common-anti-patterns-and-gotchas-in-react-40141fe0dcd
*/