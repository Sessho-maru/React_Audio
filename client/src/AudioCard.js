import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function AudioCard(props)
{
    let small = '';
    if (props.gridColSize === 2) { small = 'small'; }

    return (
        <div className={ `col xl${ props.gridColSize }` }>
            <div className={ `card hoverable ${small}` }>
                <Link to={ props.audioMetadata }>
                    <div className="card-image">
                        <img src={ props.audioMetadata.albumArtUrl } />
                    </div>
                    <div className="card-content">
                        <p>{ props.audioMetadata.tag.title }</p>
                    </div>
                </Link>
                <div id={ `${props.audioMetadata.index}_div` } className={"card-action " + (parseInt(props.CUE.CUR) === props.audioMetadata.index ? 'indigo' : '')}>
                    <a id={ props.audioMetadata.index } href="#" onClick={ (event) => { event.preventDefault(); props.CUE.NEXT = parseInt(event.target.id); props._play(true); } }>{parseInt(props.CUE.CUR) === props.audioMetadata.index ? 'stop' : 'play'}</a>
                </div>
            </div>
        </div>
    );
}

export default AudioCard;