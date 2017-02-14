//var Promise = require('bluebird');
var newsService = require('./news-service');

module.exports = {
    searchNews: function (content) {
        return new Promise(function (resolve,reject) {

            var news0 = newsService.getNews(content);
            //console.log("getnews");
            var news = [];
            news0.then((result) => {
                //console.log(result.value);
                news = result.value;
                //console.log(news.image.thumbnail.contentUrl);

                for (i in news) {
                    try {
                        news[i].image = news[i].image.thumbnail.contentUrl;
                    } catch (err) {
                        news[i].image = 'https://placeholdit.imgix.net/~text?txtsize=35&txt=MISSING IMAGE+' + '&w=500&h=260'
                    }
                }

                setTimeout(() => resolve(news), 1000);
                //console.log(news);

            });

        });
    },

};