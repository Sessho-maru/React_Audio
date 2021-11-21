import React from 'react';
import YTList from './YTList';

function YTInfo(props)
{
    return (
        <YTList ytMeta={props.ytMeta}/>
    );
}

export default YTInfo;