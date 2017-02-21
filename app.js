// This loads the environment variables from the .env file
require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var Store = require('./store');
var spellService = require('./spell-service');
var meteoService = require('./meteo-service');
var mailService = require("./mailservice");


var nameMail = {"tommaso": "tommytosto@gmail.com"};
var mailPin = {};

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 443, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//server.get(/\/docs\/public\/?.*/, restify.serveStatic({
//  directory: './public'
//}));

server.get(/.*/, restify.serveStatic({
    directory: './static',
    default: 'index.html'
}));

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
const LuisModelUrl = process.env.LUIS_MODEL_URL;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
//console.log('cosa matchi? \'%s\'', recognizer.matches);
bot.dialog('/', function (session, args) {
    if (!session.userData.authenticated) {
        session.beginDialog('/profile');
    } else {
        console.log(session.message.address);
        session.replaceDialog('/continue');
    }
});

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Ciao! Inserisci il tuo username');
    },
    function (session,results) {
        session.userData.name = results.response;
        if(nameMail[session.userData.name]){
            session.userData.mail=nameMail[session.userData.name];
            generatePin(session);
            mailService.sendMail(session.userData.mail,mailPin[session.userData.mail]);
            console.log(mailPin[session.userData.mail]);
            builder.Prompts.text(session, "Abbiamo inviato una mail con il pin all'indirizzo fornito, inseriscilo qui di seguito: ");
        }else{
            session.send("username invalido");
            session.endDialog();
        }
        //builder.Prompts.text(session, 'Inserisci un indirizzo mail a cui possa inviare il PIN');
    },
    function (session, results) {
        if (mailPin[session.userData.mail] && results.response == mailPin[session.userData.mail]) {
            session.userData.authenticated = true;
            session.send("benvenuto %s", session.userData.name);
        } else {
            console.log(mailPin[session.userData.mail]);
            session.send("password errata, utente non autorizzato");
            session.userData = null;
        }
        session.endDialog();
    }
]);

bot.dialog('/continue',
    new builder.IntentDialog({ recognizers: [recognizer] })
        .matches('CercaNotizie', [
            function (session, args, next) {
                session.send('Benvenuto! Stiamo analizzando il tuo messaggio: \'%s\'', session.message.text);

                // try extracting entities
                var contentEntity = builder.EntityRecognizer.findEntity(args.entities, 'searchContent');
                var locationEntity = builder.EntityRecognizer.findEntity(args.entities, 'location');
                //console.log("Entity: ");
                //console.log(contentEntity);
                if (contentEntity) {
                    // content detected, continue to next step
                    //session.dialogData.searchType = 'content';
                    console.log("FOUND");
                    next({ response: contentEntity.entity });
                } else if (locationEntity) {
                    console.log("FOUND");
                    next({ response: locationEntity.entity });
                } else {
                    // no entities detected, ask user for a content
                    builder.Prompts.text(session, 'Per favore inserisci il contenuto da cercare: ');
                    console.log("NOTFOUND");
                }
            },
            function (session, results) {
                var content = results.response;

                var message = 'Cercando notizie';

                message += ' su %s...';

                session.send(message, content);

                // Async search
                Store
                    .searchNews(content)
                    .then((news) => {
                        // args
                        session.send('Ho trovato %d notizie:', news.length);

                        var message = new builder.Message()
                            .attachmentLayout(builder.AttachmentLayout.carousel)
                            .attachments(news.map(newsAsAttachment));

                        session.send(message);

                        // End
                        session.endDialog();
                    });
            }
        ])
        .matches('CercaMeteo', [
            function (session, args, next) {
                session.send('Benvenuto! Stiamo analizzando il tuo messaggio: \'%s\'', session.message.text);

                // try extracting entities
                var contentEntity = builder.EntityRecognizer.findEntity(args.entities, 'searchContent');
                var locationEntity = builder.EntityRecognizer.findEntity(args.entities, 'location');
                //console.log("Entity: ");
                //console.log(contentEntity);
                if (locationEntity) {
                    // content detected, continue to next step
                    //session.dialogData.searchType = 'content';
                    console.log("FOUND");
                    next({ response: (locationEntity.entity) });
                } else {
                    // no entities detected, ask user for a content
                    builder.Prompts.text(session, 'Per favore inserisci una località: ');
                    console.log("NOTFOUND");
                }
            },
            function (session, results) {
                var content = results.response;

                var message = 'Cercando informazioni meteo';

                message += ' su %s...';

                session.send(message, content);

                // Async search
                meteoService
                    .getWeather(content)
                    .then((text) => {
                        // args
                        session.send(text);

                        // End
                        session.endDialog();
                    });
            }

        ])
        .matches('Saluto', (session) => {
            //builder.DialogAction.send("Ciao! Benvenuto!")
            r = Math.random();
            console.log(r);

            if (r < 0.33) {
                message = "Ciao! Benvenuto!";
            } else if (r < 0.66) {
                message = "Buongiorno!";
            } else {
                message = "Buonasera!";
            }
            message = message + " " + session.userData.name;
            session.send(message);
            session.endDialog();

        })
        .matches('Help', builder.DialogAction.send('Ciao! prova a chiedermi "cerca notizie su Microsoft" o "cerca meteo per Brescia" '))
        .matches('logout', (session) => {
            session.userData = null;
            session.send("Arrivederci!");
            session.endDialog();
        })
        .onDefault((session) => {
            session.send('Mi spiace, ma non capisco \'%s\'. Scrivi \'Aiuto\' Se hai bisogno di assistenza.', session.message.text);
        })

);




// Helpers
function newsAsAttachment(news) {
    console.log("name: %s", news.name);
    return new builder.HeroCard()
        .title(news.name)
        .subtitle('%s...', news.description.substring(0, 50))
        //.images([new builder.CardImage().url(news.image.tumbnail.contentUrl)])
        .images([new builder.CardImage().url(news.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value(news.url)
        ]);
}

function videoAsAttachment(videos) {
    console.log("name: %s", videos.name);
    return new builder.HeroCard()
        .title(videos.name)
        .subtitle('%s...', videos.description.substring(0, 50))
        //.images([new builder.CardImage().url(news.image.tumbnail.contentUrl)])
        //.images([new builder.CardImage().url(videos.image)])
        .media([new builder.VideoCard().url(videos.contentUrl)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value(videos.url)
        ]);
}



function generatePin(session){
    var PIN = Math.ceil(Math.random()*1000);
    //session.userData.pin = PIN;
    mailPin[session.userData.mail]=PIN;
    console.log(mailPin);
    setTimeout(function() {
        mailPin[session.userData.mail] = null;
    }, 600000);
}