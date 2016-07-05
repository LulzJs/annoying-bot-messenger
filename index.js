var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            analizeMessage(event, event.message);
        }
    }
    res.sendStatus(200);
});

function analizeMessage(event, message) {
    var response = { text: "" };
    if (/hola/i.test(message.text))
        response.text += "hola";
    if (/donde.*comer/i.test(message.text))
    {
        url =
        response = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Restaurante el cabrito",
                            "subtitle": "los mejores platos de cabrito con patatas",
                            "image_url": 'http://www.vinowine.es/wp-content/uploads/2013/01/Restaurante-de-Loreto-en-Jumilla-patio.jpg' ,
                            "buttons": [{
                                "type": "web_url",
                                "url": 'http://www.restaurantedeloreto.com/',
                                "title": "ir a la web"
                                }, {
                                "type": "postback",
                                "title": "hacer una reserva",
                                "payload": "User " + event.sender.id + " wants to reserve " + 'http://www.restaurantedeloreto.com/',
                            }]
                        }]
                    }
                }
            };
    }
    if(response.text === "")
        response.text += "no te he entendido, lo siento, preguntame algo diferente";
    sendMessage(event.sender.id, response);
}

function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}
