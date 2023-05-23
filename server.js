const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
// const jsmediaTag = require('jsmediatags');
const expressWs = require('express-ws')(app);
const fs = require('fs');

app.use(cors());

const port = 5000;
let ytInfos = [];
let ytSearch = "";

let byteArray = [];
let idxNetAudioByteFrom = 0;
const halfMB = 500 * 1000;

const tunes = [
	{ id: 0, src: __dirname + '/samples/Angel Love.mp3' },
];

function hitYoutube(ytSearch)
{
    axios.get(encodeURI(ytSearch))
        .then( (res) => {

            let rawString = "";
            let $ = cheerio.load(res.data);

            $('script').each( (i, element) => {
                let text = $(element).contents().first().text();
                if (text.search("var ytInitialData = ") !== -1)
                {
                    console.log(i);
                    rawString = text;
                }
            });

            let splited = rawString.split("var ytInitialData = ");
            let youTubeJson = splited[1].slice(0, -1);
            
            youtubeJson = JSON.parse(youTubeJson)['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents'];
            youtubeJson = youtubeJson.filter( (each) => each['videoRenderer'] !== undefined );

            youtubeJson.map( (each, i) => {

                let obj = {
                    videoId: "",
                    thumbnailUrl: "",
                    title: "",
                    viewCount: "",
                    duration: ""
                };

                obj.videoId = each['videoRenderer'].videoId;
                obj.thumbnailUrl = each['videoRenderer']['thumbnail']['thumbnails'][0].url;
                obj.title = each['videoRenderer']['title']['runs'][0].text;

                if (each['videoRenderer']['badges'] !== undefined)
                {
                    if (each['videoRenderer']['badges'][0]['metadataBadgeRenderer'].style === "BADGE_STYLE_TYPE_LIVE_NOW")
                    {
                        obj.duration = "LIVE NOW";
                        obj.viewCount = `${each['videoRenderer']['viewCountText']['runs'][0].text}${each['videoRenderer']['viewCountText']['runs'][1].text}`;
                    }
                    else
                    {
                        obj.duration = each['videoRenderer']['lengthText']['simpleText'];
                        obj.viewCount = each['videoRenderer']['viewCountText']['simpleText'];
                    }
                }
                else
                {
                    if (each['videoRenderer']['lengthText'] !== undefined)
                    {
                        obj.duration = each['videoRenderer']['lengthText']['simpleText'];
                        obj.viewCount = each['videoRenderer']['viewCountText']['simpleText'];
                    }
                    else
                    {
                        obj.duration = "LIVE NOW";
                        obj.viewCount = `${each['videoRenderer']['viewCountText']['runs'][0].text}${each['videoRenderer']['viewCountText']['runs'][1].text}`;
                    }
                }
                ytInfos.push(obj);
            });
        })
        .catch( (err) => {
            console.log(err);
        });
}

app.get('/api/url', (req, res) => {
    console.log(`serch for: ${req.query.search}`);
    ytInfos = [];

    hitYoutube(req.query.search);
    res.status(200).send({msg: 'fetching...'});
});

app.get('/api/get', (req, res) => {
    console.log(ytInfos);

    if (ytInfos.length > 0)
    {
        res.status(200).send({msg: 'finished', result: ytInfos});
    }
    else
    {
        hitYoutube(ytSearch);
        res.status(412).send({msg: 'request failed. try again...', result: null});
    }
});

// app.get('/api/samples/tag', (req, res) => {
//     const source = tunes[req.query.id].src;
//     fs.readFile(source, (err, data) => {
//         if(err) throw err;

// 		byteArray.push(data);
// 		jsmediaTag.read(data, {
// 			onSuccess: (tag) => {
//                 idxNetAudioByteFrom = tag.size;
// 				res.status(200).send({msg: "Tag metadata fetched.", body: tag});
// 			},
// 			onError: (error) => {
// 				console.log(error);
// 			}    
// 		});
//     });
// });

app.ws('/', (ws) => {
	ws.on('message', (id) => {
        let buffer = byteArray[id].slice(idxNetAudioByteFrom, idxNetAudioByteFrom + halfMB);
        ws.send(Uint8Array.from(buffer));
		// let i = 0;
		// while(true)
		// {
		// 	if (!(i < halfMB))
		// 	{
		// 		break;
		// 	}
		// 	ws.send(byteArray[id][i]);	
		// 	i++;
		// }
	});
});

// app.get('/api/samples/get', (req, res) => {
//     res.status(200).send({msg: 'fetching...', body: byteArray[req.query.id]});
// });


// app.get('/api/samples/stream', (req, res) => {
//     const origin = byteArray[req.query.id];
//     if (bucketSize === 0)
//     {
//         bucketSize = 131479;
//     }

//     if (bucketSize * (parseInt(req.query.idx) + 1) <= origin.length)
//     {
//         let partial = origin.slice(bucketSize * parseInt(req.query.idx), bucketSize * (parseInt(req.query.idx) + 1));
//         res.status(200).send({msg: 'Streaming...', body: partial});
//     }
//     else
//     {
//         bucketSize = 0;
//         let partial = origin.slice(bucketSize * parseInt(req.query.idx), origin.length);
//         res.status(200).send({msg: 'Stream Finished', body: partial});
//     }
// });

app.listen(port, () => {
    console.log(`----------------CORS-enabled web server listening on port ${port}----------------`);
});