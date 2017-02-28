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
 * GET /authRedirect
 */

/**
 * POST /slack/eventNames
 */
exports.getEvents = function(req, res) {
    if (req.body.token == process.env.SLACK_TOKEN) {
        var options = {headers:{'X-TBA-App-Id':'tsuruta:slack_scouting:v1'}};
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
    if (req.body.token == process.env.SLACK_TOKEN) {
        var options = {headers:{'X-TBA-App-Id':'tsuruta:slack_scouting:v1'}};
        var eventCode = req.body.text;
        var matches = ''
        request.get('https://thebluealliance.com/api/v2/event/' + eventCode + '/matches',options,function(err,response,body){
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

                if (jsonResponse[i].comp_level == "qm")
                {
                    var match = jsonResponse[i].alliances.blue.teams[0].toUpperCase() + ', '
                            + jsonResponse[i].alliances.blue.teams[1].toUpperCase() + ', ' + jsonResponse[i].alliances.blue.teams[2].toUpperCase() + '\n'
                            + jsonResponse[i].alliances.red.teams[0].toUpperCase() + ', ' + jsonResponse[i].alliances.red.teams[1].toUpperCase() + ', '
                            + jsonResponse[i].alliances.red.teams[2].toUpperCase();
                    var slackResponse = {
                        text: "Match Number " + jsonResponse[i].match_number,
                        attachments: [
                            {
                                text: match,
                                username: 'FRC_Scouting',
                                channel: req.body.channel_id
                            }
                        ]
                    };
                    send(slackResponse, function(error, status, body) {
                        if (error) {
                            return next(error);
                        } else if (status !== 200)
                        {
                            return next(new Error('incoming webhook: ' + status));
                        }
                        else {
                            return res.status(200).end();
                        }
                    });
                }
            }
            /*
            var slackResponse = {
                text: "Here is a list of all matches:",
                attachments: [
                    {
                        text: matches,
                        username: 'FRC_Scouting',
                        channel: req.body.channel_id
                    }
                ]
            };
            send(slackResponse, function(error, status, body) {
                if (error) {
                    return next(error);
                } else if (status !== 200)
                {
                    return next(new Error('incoming webhook: ' + status));
                }
                else {
                    return res.status(200).end();
                }
            });
            res.send(slackResponse);*/
            return res.status(200).end();
        });
    }
    else {
        //Not a request sent through Slack
        res.send('Only works through Slack.');
    }
}

function send (payload, callback) {
    var uri = 'https://hooks.slack.com/services/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';
    request({
        uri: uri,
        method: 'POST',
        body: JSON.stringify(payload)
    }, function (error, response, body) {
        if (error) {
            return callback(error);
        }

        callback(null, response.statusCode, body);
    });
}
