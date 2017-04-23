var rp = require('request-promise');

/**
 * GET /match
 */
exports.index = function(req, res) {
    var alliances = req.session.alliances;
    var matchCode = req.session.matchCode;
    var eventCode = req.session.eventCode;
    var options = {
        method: 'GET',
        uri: '',
        headers: {
            'X-TBA-App-Id':'tsuruta:frc_mc:v1'
        }
    };

    var blueAlliance = [];
    var redAlliance = [];

    //Look through all blue teams for awards
    for (var i = 0; i < 3; i ++)
    {
        console.log("Doing team " + (i+1));
        var team = {
            name: alliances.blue.teams[i],
            awards: []
        };

        //Get the history of every event that team has attended.
        options.uri = 'https://thebluealliance.com/api/v2/team/' + alliances.blue.teams[i] + '/history/awards';
        rp(options)
            .then(function (body) {
                //Information was retrieved
                eventList = JSON.parse(body);
                console.log("Team history found");
                //Goes through every event that the team has competed at to get lots of data
                for (var j = 0; j < eventList.length; j++)
                {
                    var award = {
                        location: eventList[j].event_key,
                        year: eventList[j].year,
                        type: eventList[j].award_type,
                        name: eventList[j].name,
                        alliance: [],
                        opponents: []
                    };
                    console.log("award found");
                    //Add in the alliances if it was winner/finalist
                    if(award.type == 1 || award.type == 2) {
                        //Add the partners
                        for (var z = 0; z < eventList[j].recipient_list.length; z++)
                        {
                            award.alliance.push(eventList[j].recipient_list[z].team_number);
                        }
                        //Add the opponents

                    }
                    team.awards.push(award);
                }
                console.log("awards done");
                //If it was the last team, move forward.
                if(i == 2)
                {
                    console.log("Teams done");
                    doWork(blueAlliance, redAlliance, res);
                }
            })
            .catch(function (err) {
                console.log("Team lookup failed, " + err);
            });

        //Add the finished team to the alliance
        blueAlliance.push(team);
    }
};

doWork = function(blueAlliance, redAlliance, res) {
    console.log("Done with teams");

    res.render('match', {
        title: 'Match Information',
        matchCode: matchCode,
        blueTeams: alliances.blue.teams,
        redTeams: alliances.red.teams,
        eventCode: eventCode
    });
};

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
