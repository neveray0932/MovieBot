'use strict';
const
    bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    request = require('request');
var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port', port);
app.use(bodyParser.json());
app.listen(app.get('port'), function() {
    console.log('[app.listen] Node app is running on port', app.get('port'));
});
module.exports = app;
const MOVIE_API_KEY = config.get('MovieDB_API_Key');
app.post('/webhook', function(req, res) {
    let data = req.body;
    console.log(req);
    let queryMovieActor = data.queryResult.parameters.MovieActor;
    let queryMovieName = data.queryResult.parameters.MovieName;
    let queryclass = data.queryResult.intent.displayName;
    let propertiesObject = {
        query: queryMovieActor,
        api_key: MOVIE_API_KEY,
        language: 'zh-TW'
    };
    let propertiesObject1 = {
        query: queryMovieName,
        api_key: MOVIE_API_KEY,
        language: 'zh-TW'
    };
    console.log(queryclass);
    console.log(queryMovieName);
    console.log(queryMovieActor);

    if (queryclass == "Get Movie Intro") {
        request({
            uri: "https://api.themoviedb.org/3/search/movie?",
            json: true,
            qs: propertiesObject1
        }, function(error, response, body) {


            if (!error && response.statusCode == 200) {

                if (body.results.length != 0) {
                    let thisFulfillmentMessages = [];
                    let movieTitleObject = {};

                    if (body.results[0].title == queryMovieName) {

                        movieTitleObject.text = { text: ["系統最相關的電影是" + body.results[0].title] };
                    } else {
                        movieTitleObject.text = { text: [body.results[0].title] };
                    }
                    thisFulfillmentMessages.push(movieTitleObject);
                    if (body.results[0].overview) {
                        let movieOverViewObject = {};
                        movieOverViewObject.text = { text: [body.results[0].overview] };
                        thisFulfillmentMessages.push(movieOverViewObject);
                    }
                    if (body.results[0].poster_path) {
                        let movieImageObject = {};
                        movieImageObject.image = { imageUri: "https://image.tmdb.org/t/p/w185/" + body.results[0].poster_path };
                        thisFulfillmentMessages.push(movieImageObject);
                    }
                    res.json({ fulfillmentMessages: thisFulfillmentMessages });
                } else {
                    res.json({ fulfillmentText: "很抱歉，系統裡沒有這部電影" });
                }
            } else {
                console.log("[the MovieDB] failed");
            }
        });


    }

    if (queryclass == "Get MovieActor") {
        request({
            uri: "https://api.themoviedb.org/3/search/person?",
            json: true,
            qs: propertiesObject
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('ok');

                if (body.results.length != 0) {
                    let thisFulfillmentMessages = [];
                    let movieTitleObject = {};
                    if (body.results[0].name == queryMovieActor) {
                        movieTitleObject.text = { text: [body.results[0].name] };
                    } else {
                        movieTitleObject.text = { text: [" " + body.results[0].name] };
                    }
                    thisFulfillmentMessages.push(movieTitleObject);
                    for (var i = 0; i < body.results[0].known_for.length; i++) {
                        if (body.results[0].known_for[i].title) {

                            let movieOverViewObject = {};
                            movieOverViewObject.text = { text: [body.results[0].known_for[i].title] };
                            thisFulfillmentMessages.push(movieOverViewObject);
                        }
                        if (body.results[0].known_for[i].poster_path) {

                            let movieImageObject = {};
                            movieImageObject.image = { imageUri: "https://image.tmdb.org/t/p/w185/" + body.results[0].known_for[i].poster_path };
                            thisFulfillmentMessages.push(movieImageObject);
                        }
                        if (body.results[0].known_for[i].overview) {
                            //console.log(body.results[1].overview)
                            let movieOverViewObject = {};
                            movieOverViewObject.text = { text: [body.results[0].known_for[i].overview] };
                            thisFulfillmentMessages.push(movieOverViewObject);
                        }
                    }

                    if (body.results[0].profile_path) {
                        let movieImageObject = {};
                        movieImageObject.image = { imageUri: "https://image.tmdb.org/t/p/w185/" + body.results[0].profile_path };
                        thisFulfillmentMessages.push(movieImageObject);
                    }
                    res.json({ fulfillmentMessages: thisFulfillmentMessages });
                } else {
                    res.json({ fulfillmentText: " " });
                }
            } else {
                console.log("[the MovieDB] failed");
            }
        });
    }



});