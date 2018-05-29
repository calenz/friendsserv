const express = require('express');
const bodyParser= require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const mongodbdbname = "friendsserv";
const mongodburl = "mongodb://localhost:27017/"+mongodbdbname;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Connect to the db
MongoClient.connect(mongodburl, function(err, client) {
    if (err) {
        return console.dir(err);
    }
    console.log("We are connected");
    db = client.db(mongodbdbname);
    db.createCollection("connections", function (err, res) {
        if (err) throw err;
        db.collection('connections').createIndex( { "email1": 1, "email2": 1 }, { unique: true } );
    });
    app.listen(3000, () => {
        console.log('listening on 3000');
    })
});

function objectId() {
    const os = require('os');
    const crypto = require('crypto');

    const seconds = Math.floor(new Date()/1000).toString(16);
    const machineId = crypto.createHash('md5').update(os.hostname()).digest('hex').slice(0, 6);
    const processId = process.pid.toString(16).slice(0, 4).padStart(4, '0');
    const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0');

    return seconds + machineId + processId + counter;
}

app.get('/', (req, res) => {
    res.send('FriendsServ');
})

// 1. As a user, I need an API to create a friend connection between two email addresses.
app.post('/friends/connect', (req, res) => {
    console.log('Create Friend Connection API Request: '+req.body);
    if (req.body.friends && req.body.friends.length >= 2) {         
        MongoClient.connect(mongodburl, function(err, client) {
            if (err) {
                return console.dir(err);
            }
            db = client.db(mongodbdbname);
            // check if a connection already exists, check both emails in 2 direction
            db.collection('connections').find( {$or: [{email1: req.body.friends[0], email2: req.body.friends[1]}, 
                {email2: req.body.friends[0], email1: req.body.friends[1]}] }).toArray(function(err, results) {
                if (results.length > 0) {                    
                    var errRespObject = {"success": false, "error": 'Connection for '+req.body.friends[0]+' and '+req.body.friends[1]+' already exists!'};
                    res.status(500).json(errRespObject);
                    client.close();
                } else { // create a connection
                    var myConnection = { email1: req.body.friends[0], email2: req.body.friends[1] };
                    db.collection("connections").insertOne(myConnection, function (err, result) {
                        if (err) {
                            var errRespObject = {"success": false, "error": err.message};
                            res.status(500).json(errRespObject);
                            client.close();
                            return; 
                        }
                        console.log("1 connection inserted for "+req.body.friends[0]+" and "+req.body.friends[1]);
                        var respObject = {"success": true};
                        res.json(respObject);
                        client.close();
                    });
                }
            });
        });
    } else {
        res.status(500).send('Less than 2 email addresses!');
    }        
})

// 2. As a user, I need an API to retrieve the friends list for an email address.
app.post('/friends/list', (req, res) => {
    console.log('Get Friend List API Request: '+req.body);
    if (req.body.email) {
        MongoClient.connect(mongodburl, function(err, client) {
            if (err) {
                return console.dir(err);
            }
            db = client.db(mongodbdbname);
            db.collection('connections').find( {$or: [{email1: req.body.email}, {email2: req.body.email}] }).toArray(function(err, results) {
                console.log(results);                
                var intCount = results.length;
                if (intCount >= 0) {
                    var strJson = "";
                    for (var i = 0; i < intCount;) {                        
                        var friendemail = results[i].email2;
                        // make sure email is not own email, if it is, then friend's email is in email1 field
                        if (req.body.email == friendemail) {
                            friendemail = results[i].email1
                        }
                        strJson += '"' + friendemail + '"';
                        i++;  
                        if (i < intCount) {
                            strJson += ',';
                        }
                    }
                    strJson = '{"success": true, "friends": [' + strJson + '], "count": ' + intCount + '}'
                    console.log("strJson: \n"+strJson);
                }
                res.json(JSON.parse(strJson));
                client.close();
            });
        });
    } else {
        res.status(500).send('Require an email address!');
    }        
})

// 3. As a user, I need an API to retrieve the common friends list between two email addresses.
app.post('/friend/common', (req, res) => {
    console.log('Get Friend List API Request: '+req.body);
    if (req.body.email) {
        MongoClient.connect(mongodburl, function(err, client) {
            if (err) {
                return console.dir(err);
            }
            db = client.db(mongodbdbname);
            db.collection('connections').find( {$or: [{email1: req.body.email}, {email2: req.body.email}] }).toArray(function(err, results) {
                console.log(results);                
                var intCount = results.length;
                if (intCount >= 0) {
                    var strJson = "";
                    for (var i = 0; i < intCount;) {                        
                        var friendemail = results[i].email2;
                        // make sure email is not own email, if it is, then friend's email is in email1 field
                        if (req.body.email == friendemail) {
                            friendemail = results[i].email1
                        }
                        strJson += '"' + friendemail + '"';
                        i++;  
                        if (i < intCount) {
                            strJson += ',';
                        }
                    }
                    strJson = '{"success": true, "friends": [' + strJson + '], "count": ' + intCount + '}'
                    console.log("strJson: \n"+strJson);
                }
                res.json(JSON.parse(strJson));
                client.close();
            });
        });
    } else {
        res.status(500).send('Require an email address!');
    }        
})