var request = require('request');

/**
 * GET /
 */
exports.index = function(req, res) {
  req.session.alliances = null;
  req.session.matchCode = null;
  res.render('home', {
    title: 'Home'
  });
};

/**
 * POST /
 */
exports.execute = function(req, res) {
    //Get the inputted codes from the user.
    eventCode = req.body.eventCode;
    matchCode = req.body.matchCode;
    totalCode = eventCode + "_" + matchCode;
    var options = {headers:{'X-TBA-App-Id':'tsuruta:frc_mc:v1'}};
    request.get('https://thebluealliance.com/api/v2/match/'+totalCode,options,function(err,response,body){
        if(err)
        {
            //TODO: Say something about an error. Tell them to read the info above.
        }
        jsonResponse = JSON.parse(body);
        req.session.matchCode = jsonResponse.comp_level + jsonResponse.set_number + jsonResponse.match_number;
        req.session.alliances = jsonResponse.alliances;
        req.session.eventCode = eventCode;
        res.redirect('/match');
    });
};

exports.getEvents = function(req, res) {
    var options = {headers:{'X-TBA-App-Id':'tsuruta:frc_mc:v1'}};
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
};
