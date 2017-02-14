var YQL = require('yql');

module.exports = {
    getWeather: function (text) {
        return new Promise((resolve, reject) => {
            var region=", IT"
            console.log(text.split(","));
            if (text.split(",").length>1){
                region=", "+text.split(",")[1];
                console.log(text.split(","))
            }
            var query = new YQL('select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' + text+region + '") and u= "c"');

            //console.log(query);

            query.exec(function (err, data) {
                //console.log(data.query.results.channel)
                var location = data.query.results.channel.location;
                var condition = data.query.results.channel.item.condition;
                var gradi = condition.temp > 1 ? "gradi" : "grado";
                var out = 'La temperatura a ' + location.city + ', ' + location.region + ' è di ' +
                 condition.temp + ' ' + gradi + textMapping[condition.text];

                //console.log(out);
                setTimeout(() => resolve(out), 1000);
                //resolve(out);
            });

        })
    }
}


const textMapping = {
  "Partly Cloud"            :" ed è previsto Parz. Nuvoloso",
  "Showers"                 :" ed è prevista Pioggia",
  "Partly Cloudy"           :" ed è previsto Nuvoloso",
  "AM Showers"              :" ed è prevista Pioggia al Mattino",
  "PM Showers"              :" ed è prevista Pioggia alla sera",
  "PM Thunderstorms"        :" e sono previsti Temporali alla sera",
  "Scattered Thunderstorms" :" e sono previsti Temporali sparsi",
  "Light Rain with Thunder" :" ed è prevista leggera pioggia con temporali",
  "Thunderstorms"           :" e sono previsti Temporali",
  "Heavy Rain"              :" ed è prevista Pioggia persistente",
  "Mostly Sunny"            :" ed è previsto Parz. Soleggiato",
  "Light Rain"              :" ed è previsto Piovischio",
  "Fog"                     :" ed è prevista Nebbia",
  "Fair"                    :" ed è previsto Sereno",
  "Sunny"                   :" ed è previsto Soleggiato",
  "AM Rain"                 :" ed è prevista Pioggia al mattino",
  "PM Rain"                 :" ed è prevista Pioggia alla sera",
  "Mostly Cloudy"           :" ed è previsto Prev. Nuvoloso",
  "Isolated Thunderstorms"  :" e sono previsti Temporali isolati",
  "Thundershowers"          :" e sono previsti Temporali",
  "Heavy Thunderstorms"     :" e sono previsti Forti Temporali",
  "Clear"                   :" ed è previsto Bel tempo",
  "Rain"                    :" ed è prevista Pioggia",
  "Cloudy"                  :" ed è previsto Nuvoloso",
  "Windy"                   :" ed è previsto Ventoso"  
}