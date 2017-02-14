const request = require('request');

const BING_API_URL = 'https://api.cognitive.microsoft.com/bing/v5.0/videos/search?q=';

const BING_SEARCH_API_KEY = process.env.BING_SEARCH_API_KEY;

/** 
 *  Gets the similar products of the image from an image stream
 * @param {stream} stream The stream to an image.
 * @return {Promise} Promise with visuallySimilarProducts array if succeeded, error otherwise
 */
module.exports = {
    getVideo: function (text) {
        return new Promise(
            (resolve, reject) => {
                 var result = null;
                //console.log("newsText: "+text)
                if (text) {
                    const requestData = {
                        method: 'GET',
                        url: BING_API_URL + text + '&count=5&offset=0&mkt=it-IT&safesearch=Moderate',
                        headers: {
                            "Ocp-Apim-Subscription-Key": BING_SEARCH_API_KEY
                        },
                        form: {
                            text: text
                        },
                        json: true
                    }
                    console.log("url: " + requestData.url)

                    request.get(requestData, function (error, response, body) {

                        if (error) {
                            return console.log('Error:', error);
                        }

                        //Check for right status code
                        if (response.statusCode !== 200) {
                            return console.log('Invalid Status Code Returned:', response.statusCode);
                        }

                        //All is good. Print the body
                        //console.log(body); 
                        result = body;
                        //console.log("ok");

                       
                    });
                } else {
                    resolve(text);
                }
                setTimeout(() => resolve(result), 1000);
            }
        )
    }
}