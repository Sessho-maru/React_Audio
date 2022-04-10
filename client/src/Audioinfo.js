import React, { Component } from 'react';
import TagInfo from './TagInfo';
import YTInfo from './YTInfo';

const axios = require('axios');
let propsWhenNoProps = null;

class AudioInfo extends Component
{
    constructor(props)
    {
        super(props);
        this.YTMetas = [];
        this.preloader = "";
        this.timeoutId = "";
        this.tag = (props.location.tag === undefined) 
                    ? propsWhenNoProps
                    : props.location.tag;
        
        this.isFetchable = (this.tag.title !== 'untitled') && (this.tag.artist !== "") 
                            ? true 
                            : false;

        this.state = { 
            isLoaded: false 
        };
    }

    componentWillUnmount()
    {
        if (this.props.history.action === "POP")
        {
            propsWhenNoProps = this.tag;
            console.log(propsWhenNoProps);
        }
    }

    componentDidMount()
    {
        if (this.isFetchable === false)
        {
            return;
        }

        console.log(`search for: ${this.tag.artist} - ${this.tag.title}`);
        const dist = `https://www.youtube.com/results?search_query=${this.tag.artist} - ${this.tag.title}`;

        axios.get(`/api/url?search=${dist}`)
            .then( (res) => {
                console.log(res.data.msg);
                this.getYTObj();
            })
            .catch( (err) => {
                console.log(err);
            });

        console.log(propsWhenNoProps);
    }

    getYTObj()
    {
        this.timeoutId = setTimeout( () =>{
            axios.get('/api/get')
                .then( (res) => {
                    clearTimeout(this.timeoutId);

                    console.log(res.data);
                    let received = res.data.result;

                    this.YTMetas = received.map( (each, i) => {
                        let ytMeta = {
                            videoId: each.videoId,
                            thumbnailUrl: each.thumbnailUrl,
                            title: each.title,
                            viewCount: each.viewCount,
                            duration: each.duration
                        };

                        return (
                            <YTInfo key={i} ytMeta={ytMeta} />
                        );
                    });
                    this.setState({ isLoaded: true });
                })
                .catch( (err) => {
                    clearTimeout(this.timeoutId);

                    console.log(err.response.data);
                    this.getYTObj();
                });
        }, 1000);
    }

    render()
    {
        if (this.isFetchable === true)
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
        else
        {
            this.preloader = <div id="preloader">
                                <h2>To fecth Youtube Search page, Title and Artistname is required</h2>
                            </div>
        }

        return (
            <div className="row">
                <div className="container">
                    <div className="col xl7 l5 m3 s1">
                        <TagInfo albumArt={ this.tag.albumArtUrl }/>
                    </div>
                    <div className="col xl5 l7 m9 s11">
                        <div id="YTcontent">
                            { this.state.isLoaded === false ? this.preloader : this.YTMetas }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default AudioInfo;