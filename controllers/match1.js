var rp = require('request-promise');
var blueAlliance = [];
var redAlliance = [];
var matchCode = '';
var eventCode = '';
var i = 0;
var q = 0;

/**
 * GET /match
 */
exports.index = function(req, res) {
    var alliances = req.session.alliances;
    matchCode = req.session.matchCode;
    eventCode = req.session.eventCode;
    var options = {
        method: 'GET',
        uri: '',
        headers: {
            'X-TBA-App-Id':'tsuruta:frc_mc:v1'
        }
    };

    //Start recursive data calls. Those will trigger data processing when finished.
    getData(i, res, alliances, options);
};

//Recursive function for Award History API calls on TBA for each robot on alliance.
getData = function(i, res, alliances, options) {
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
            //Add the finished team to the alliance
            blueAlliance.push(team);

            //Repeat the data call for next robot in alliance. Move on if done.
            //TODO: Make this flexible; if alliance has more than 3 members
            if (i < 2)
            {
                getData(i+1, res, alliances, options);
            }
            else
            {
                getRedData(q, res, alliances, options);
            }
        })
        .catch(function (err) {
            console.log("Blue team lookup failed, " + err);
        });
};

//TODO: Lump this into the above function, save space.
getRedData = function(q, res, alliances, options) {
    var team = {
        name: alliances.red.teams[q],
        awards: []
    };
    //Get the history of every event that team has attended.
    options.uri = 'https://thebluealliance.com/api/v2/team/' + alliances.red.teams[q] + '/history/awards';
    rp(options)
        .then(function (body) {
            //Information was retrieved
            eventList = JSON.parse(body);
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
            //Add the finished team to the alliance
            redAlliance.push(team);
            if (q < 2)
            {
                getRedData(q+1, res, alliances, options);
            }
            else
            {
                doWork(res, alliances);
            }
        })
        .catch(function (err) {
            console.log("Red team lookup failed, " + err);
        });
};

//After data has been found, start looking for interesting facts in history
doWork = function(res, alliances) {
    seeAllData();

    //Look to see if robots were at this event last year


    //What did robot get last year at this event?

    //Display the match overview screen, with appropriate data
    res.render('match', {
        title: 'Match Information',
        matchCode: matchCode,
        blueTeams: alliances.blue.teams,
        redTeams: alliances.red.teams,
        eventCode: eventCode
    });
};

//Used to dump all downloaded award data for debugging
seeAllData = function() {
    for(var q = 0; q < 3; q++)
    {
        for(var i = 0; i < blueAlliance[q].awards.length; i ++)
        {
            var asdf = blueAlliance[q].awards[i];
            console.log(blueAlliance[q].name + " won " + asdf.name + " at " + asdf.location + " in " + asdf.year);
            if (asdf.type == 1 || asdf.type == 2)
            {
                console.log("Alliance was " + asdf.alliance[0] + " " + asdf.alliance[1] + " " + asdf.alliance[2])
            }
        }
    }
    console.log(" ");
    for(var q = 0; q < 3; q++)
    {
        for(var i = 0; i < redAlliance[q].awards.length; i ++)
        {
            var asdf = redAlliance[q].awards[i];
            console.log(redAlliance[q].name + " won " + asdf.name + " at " + asdf.location + " in " + asdf.year);
            if (asdf.type == 1 || asdf.type == 2)
            {
                console.log("Alliance was " + asdf.alliance[0] + " " + asdf.alliance[1] + " " + asdf.alliance[2])
            }
        }
    }
};
