const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
app.use(cors());

const fs = require('fs');

const port = 5000;
const OFFSET_INDEX_CONTAIN_YTINITIALDATA = 27;
let ytInfos = [];

app.get('/api/url', (req, res) => {
    console.log(`serchTerm: ${req.query.search}`);
    ytInfos = [];

    axios.get(encodeURI(req.query.search))
        .then( (res) => {

            /*
            fs.writeFile('yt_res.html', res.data, (err) => {
                if (err) throw err;
                console.log('Saved!');
            });
            */

            let rawString = "";
            let $ = cheerio.load(res.data);
            $('script').each( (i, element) => {
                if (i === OFFSET_INDEX_CONTAIN_YTINITIALDATA)
                {
                    rawString = $(element).contents().first().text();
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

    res.status(200).send({msg: 'processed'});
});

app.get('/api/get', (req, res) => {
    console.log(ytInfos);
    res.status(200).send({msg: 'finished', result: ytInfos});
});

app.listen(port, () => {
    console.log(`----------------CORS-enabled web server listening on port ${port}----------------`)
});