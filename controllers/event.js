var request = require('request');

/**
 * GET /
 */
exports.index = function(req, res) {
    res.render('home', {
        title: 'Home'
    });
};

/**
 * POST /slack/eventNames
 */
exports.getEvents = function(req, res) {
    if (req.header.token == process.env.SLACK_TOKEN) {
        var options = {};
        var eventCodes = '';
        request.get('https://thebluealliance.com/api/v2/events/2017',options,function(err,response,body){
            if(err)
            {
                //TODO: Say something about an error.
            }
            jsonResponse = JSON.parse(body);
            for (i = 0; i < jsonResponse.length; i ++)
            {
                eventCodes += jsonResponse[i].short_name + '  -  2017' + jsonResponse[i].event_code + '\n';
            }
            var slackResponse = {
                text: "Here is a list of all event codes:",
                attachments: [
                    {
                        text: eventCodes
                    }
                ]
            };
            res.send(slackResponse);
        });
    }
    else {
        //Not a request sent through Slack
        res.send('Only works through Slack.');
    }
};

/**
 * POST /slack/setup
 */
exports.setupEvent = function(req, res) {
    if (req.header.token == process.env.SLACK_TOKEN) {
        var options = {};
        let eventCode = req.header.text;
        var matches = ''
        console.log(eventCode);
        request.get('https://thebluealliance.com/api/v2/event' + eventCode + '/matches',options,function(err,response,body){
            if(err)
            {
                //TODO: Say something about an error. Probably bad event code.
                var slackResponse = {
                    text: "That event code didn't work.",
                };
                res.send(slackResponse);
            }
            jsonResponse = JSON.parse(body);
            for (i = 0; i < jsonResponse.length; i ++)
            {
                matches += jsonResponse[i].match_number + '  -  ' + jsonResponse[i].alliances.blue.teams[0] + ', '
                        + jsonResponse[i].alliances.blue.teams[1] + ', ' + jsonResponse[i].alliances.blue.teams[2] + '\n'
                        + jsonResponse[i].alliances.red.teams[0] + ', ' + jsonResponse[i].alliances.blue.teams[1] + ', '
                        + jsonResponse[i].alliances.blue.teams[2] + ', ' + '/n' + '/n';
            }
            var slackResponse = {
                text: "Here is a list of all matches:",
                attachments: [
                    {
                        text: matches
                    }
                ]
            };
            res.send(slackResponse);
        });
    }
    else {
        //Not a request sent through Slack
        res.send('Only works through Slack.');
    }
}
