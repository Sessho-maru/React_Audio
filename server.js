const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
app.use(cors());

const port = 5000;
let ytInfos = [];
let ytSearch = "";

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
    console.log(`serchTerm: ${req.query.search}`);
    ytInfos = [];

    hitYoutube(ytSearch = req.query.search);
    res.status(200).send({msg: 'processing...'});
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

app.listen(port, () => {
    console.log(`----------------CORS-enabled web server listening on port ${port}----------------`)
});