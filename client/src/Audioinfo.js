import React, { Component } from 'react';
import TagInfo from './TagInfo';
import YTInfo from './YTInfo';

const axios = require('axios');
let receivedParam = {};

class AudioInfo extends Component
{
    constructor()
    {
        super();
        this.YTInfos = [];
        this.preloader = "";
        this.timeoutId = "";

        this.state = { 
            isntFetchable: false, 
            isLoaded: false 
        };
    }

    UNSAFE_componentWillMount()
    {
        if (this.props.location.audioInfo !== undefined)
        {
            receivedParam = this.props.location;
        }
        // console.log(receivedParam);
    }

    componentDidMount()
    {
        if (receivedParam.audioInfo.title === 'untitled' || receivedParam.audioInfo.artist === "")
        {
            this.preloader = <div id="preloader">
                                <h2>To fecth Youtube Search page, Title and Artistname is required</h2>
                             </div>
            this.setState({ isntFetchable: true });
            return;
        }

        console.log(`search term: ${receivedParam.audioInfo.artist} - ${receivedParam.audioInfo.title}`);
        const dist = `https://www.youtube.com/results?search_query=${receivedParam.audioInfo.artist} - ${receivedParam.audioInfo.title}`;

        axios.get(`/api/url?search=${dist}`)
            .then( (res) => {
                console.log(res.data.msg);

                this.timeoutId = setTimeout( () =>{
                    axios.get('/api/get')
                        .then( (res) => {
                            clearTimeout(this.timeoutId);

                            console.log(res.data.result);
                            let received = res.data.result;

                            this.YTInfos = received.map( (each, i) => {
                                let youtubeInfo = {
                                    videoId: each.videoId,
                                    thumbnailUrl: each.thumbnailUrl,
                                    title: each.title,
                                    viewCount: each.viewCount,
                                    duration: each.duration
                                };

                                return (
                                    <YTInfo key={i} YTInfoObj={youtubeInfo} />
                                );
                            });
                            this.setState({ isLoaded: true });
                        })
                        .catch( (err) => {
                            console.log(err);
                        });
                }, 2000);
            })
            .catch( (err) => {
                console.log(err);
            });
    }

    render()
    {
        if (this.state.isntFetchable === false)
        {
            this.preloader = <div id="preloader">
                                <div className="preloader-wrapper big active">
                                    <div className="spinner-layer spinner-red-only">
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
                             </div>
        }        

        return (
            <div className="row">
                <div className="container">
                    <div className="col xl7 l5 m3 s1">
                        <TagInfo albumArt={ receivedParam.albumArtUrl }/>
                    </div>
                    <div className="col xl5 l7 m9 s11">
                        <div id="YTcontent">
                            { this.state.isLoaded === false ? this.preloader : this.YTInfos }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default AudioInfo;