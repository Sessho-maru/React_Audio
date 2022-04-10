import React from 'react';

function YTList(props)
{
    return (
        <div className="col xl12 l12 m12 s12">
            <div id="ytCard" className="card-panel grey hoverable lighten-5 z-depth-1">
                <div className="row valign-wrapper">
                    <div className="col xl6 l6 m6 s6">
                        <img src={ props.ytMeta.thumbnailUrl } className="responsive-img" width="237" height="132"/>
                    </div>
                    <div className="col xl6 l6 m6 m6">
                        <h5 onClick={ () => { window.open(`https://www.youtube.com/watch?v=${props.ytMeta.videoId}`,'_blank'); } }>{ props.ytMeta.title }</h5>
                        <h6>{ `${props.ytMeta.viewCount} | ${props.ytMeta.duration}` }</h6>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YTList;