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
MongoClient.connect(process.env.MONGODB_URI || mongodburl, function(err, client) {
    if (err) {
        return console.dir(err);
    }
    console.log("We are connected");
    db = client.db(mongodbdbname);
    db.createCollection("connections", function (err, res) {
        if (err) throw err;
        db.collection('connections').createIndex( { "email1": 1, "email2": 1 }, { unique: true } );
    });
    db.createCollection("subscriptions", function (err, res) {
        if (err) throw err;
        db.collection('subscriptions').createIndex( { "requestor": 1, "target": 1 }, { unique: true } );
    });
    db.createCollection("blocklist", function (err, res) {
        if (err) throw err;
        db.collection('blocklist').createIndex( { "requestor": 1, "target": 1 }, { unique: true } );
    });
    app.listen(process.env.PORT || 3000, () => {
        console.log('listening...');
    })
});

app.get('/', (req, res) => {
    res.send('FriendsServ');
})

// 1. As a user, I need an API to create a friend connection between two email addresses.
app.post('/friends/connect', (req, res) => {
    console.log('Create Friend Connection API Request: '+req.body.friends);
    if (req.body.friends && req.body.friends.length >= 2) {         
        MongoClient.connect(process.env.MONGODB_URI || mongodburl, function(err, client) {
            if (err) {
                res.status(500).send(err);
                return console.dir(err);
            }
            db = client.db(mongodbdbname);            
            // check if a connection already exists, check both emails in 2 direction
            db.collection('connections').find( {$or: [{email1: req.body.friends[0], email2: req.body.friends[1]}, 
                {email2: req.body.friends[0], email1: req.body.friends[1]}] }).toArray(function(err, results) {
                if (results != null && results.length > 0) {                    
                    var errRespObject = {"success": false, "error": 'Connection for '+req.body.friends[0]+' and '+req.body.friends[1]+' already exists!'};
                    res.status(500).json(errRespObject);
                    client.close();
                } else { 
                    // check if the connection is in the blocklist
                    db.collection('blocklist').find( {$or: [{requestor: req.body.friends[0], target: req.body.friends[1]}, 
                        {requestor: req.body.friends[1], target: req.body.friends[0]}] }).toArray(function(err, results) {                
                        if (results != null && results.length > 0) {
                            var errRespObject = {"success": false, "error": 'Connection has been blocked for '+req.body.friends[0]+' and '+req.body.friends[1]+', unable to add as a friend!'};
                            res.status(500).json(errRespObject);
                            client.close();
                        } else {
                            // create a connection
                            var myConnection = { email1: req.body.friends[0], email2: req.body.friends[1] };
                            db.collection("connections").insertOne(myConnection, function (err, result) {
                                if (err) {
                                    var errRespObject = {"success": false, "error": err.message};
                                    res.status(500).json(errRespObject);
                                    client.close();
                                    return; 
                                }
                                console.log("Successful connection created for "+req.body.friends[0]+" and "+req.body.friends[1]);
                                var respObject = {"success": true};
                                res.json(respObject);
                                client.close();
                            });
                        }
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
    console.log('Friends List API Request: '+req.body.email);
    if (req.body.email) {
        MongoClient.connect(process.env.MONGODB_URI || mongodburl, function(err, client) {
            if (err) {
                res.status(500).send(err);
                return console.dir(err);
            }
            db = client.db(mongodbdbname);
            db.collection('connections').find( {$or: [{email1: req.body.email}, {email2: req.body.email}] }).toArray(function(err, results) {
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
                    console.log("Friends List strJson: \n"+strJson);
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
app.post('/friends/common', (req, res) => {
    console.log('Common Friends List API Request: '+req.body.friends);
    if (req.body.friends && req.body.friends.length >= 2) {         
        MongoClient.connect(process.env.MONGODB_URI || mongodburl, function(err, client) {
            if (err) {
                res.status(500).send(err);
                return console.dir(err);
            }
            db = client.db(mongodbdbname);            
            var friendsArray1 = []; 
            // get friends list of 1st email
            db.collection('connections').find( {$or: [{email1: req.body.friends[0]}, {email2: req.body.friends[0]}] }).toArray(function(err, results) {
                for (var i = 0; i < results.length; i++) {
                    var friendemail = results[i].email2;
                    // make sure email is not own email, if it is, then friend's email is in email1 field
                    if (req.body.friends[0] == friendemail) {
                        friendemail = results[i].email1
                    }
                    console.log("friends1: "+friendemail)
                    friendsArray1.push(friendemail);                    
                }
            });
            var strJson = "";
            var intCount = 0;
            // get friends list of 2nd email            
            db.collection('connections').find( {$or: [{email1: req.body.friends[1]}, {email2: req.body.friends[1]}] }).toArray(function(err, results) {
                for (var i = 0; i < results.length; i++) {
                    var friendemail = results[i].email2;
                    // make sure email is not own email, if it is, then friend's email is in email1 field
                    if (req.body.friends[1] == friendemail) {
                        friendemail = results[i].email1
                    }
                    // find common friend, use for loop instead of forEach in order to use 'break'
                    for (var j = 0; j < friendsArray1.length; j++) {
                        var email1 = friendsArray1[j];
                        if (email1 == friendemail) {
                            intCount++;
                            if (strJson == "") {
                                strJson += '"' + friendemail + '"';
                            } else {
                                strJson += ',"' + friendemail + '"';
                            }
                            break;
                        }
                    }
                }                
                client.close();
                strJson = '{"success": true, "friends": [' + strJson + '], "count": ' + intCount + '}'
                console.log("Common Friends List strJson: \n"+strJson);        
                res.json(JSON.parse(strJson));
            });            
        });
    } else {
        res.status(500).send('Less than 2 email addresses!');
    }        
})

// 4. As a user, I need an API to subscribe to updates from an email address.
app.post('/friends/subscribe', (req, res) => {
    console.log('Subscribe to Email API Request: '+req.body.requestor+', '+req.body.target);
    if (req.body.requestor && req.body.target) {         
        MongoClient.connect(process.env.MONGODB_URI || mongodburl, function(err, client) {
            if (err) {
                res.status(500).send(err);
                return console.dir(err);
            }
            db = client.db(mongodbdbname);
            // check if a subscription already exists
            db.collection('subscriptions').find( {requestor: req.body.requestor, target: req.body.target} ).toArray(function(err, results) {
                if (results != null && results.length > 0) {
                    var errRespObject = {"success": false, "error": 'Subscription for '+req.body.requestor+' to '+req.body.target+' already exists!'};
                    res.status(500).json(errRespObject);
                    client.close();
                } else { 
                    // check if the connection is in the blocklist
                    db.collection('blocklist').find( {$or: [{requestor: req.body.requestor, target: req.body.target}, 
                        {requestor: req.body.target, target: req.body.requestor}] }).toArray(function(err, results) {                
                        if (results != null && results.length > 0) {
                            var errRespObject = {"success": false, "error": 'Subscription  has been blocked for '+req.body.requestor+' and '+req.body.target+', unable to subscribe!'};
                            res.status(500).json(errRespObject);
                            client.close();
                        } else {
                            // create a subscription
                            var mySubcription = { requestor: req.body.requestor, target: req.body.target };
                            db.collection("subscriptions").insertOne(mySubcription, function (err, result) {
                                if (err) {
                                    var errRespObject = {"success": false, "error": err.message};
                                    res.status(500).json(errRespObject);
                                    client.close();
                                    return; 
                                }
                                console.log("Successful subscription created for "+req.body.requestor+" to "+req.body.target);
                                var respObject = {"success": true};
                                res.json(respObject);
                                client.close();
                            });
                        }
                    }); 
                }
            });
        });
    } else {
        res.status(500).send('Invalid requestor and target!');
    }        
})

// 5. As a user, I need an API to block updates from an email address.
app.post('/friends/block', (req, res) => {
    console.log('Block Updates from Email API Request: '+req.body.requestor+', '+req.body.target);
    if (req.body.requestor && req.body.target) {
        MongoClient.connect(process.env.MONGODB_URI || mongodburl, function(err, client) {
            if (err) {
                res.status(500).send(err);
                return console.dir(err);
            }
            db = client.db(mongodbdbname);
            // check if a block record already exists
            db.collection('blocklist').find( {requestor: req.body.requestor, target: req.body.target} ).toArray(function(err, results) {                
                if (results != null && results.length > 0) {
                    var errRespObject = {"success": false, "error": 'Block record for '+req.body.requestor+' from '+req.body.target+' already exists!'};
                    res.status(500).json(errRespObject);
                    client.close();
                } else { 
                    // create a block record
                    var myBlockRecord = { requestor: req.body.requestor, target: req.body.target };
                    db.collection("blocklist").insertOne(myBlockRecord, function (err, result) {
                        if (err) {
                            var errRespObject = {"success": false, "error": err.message};
                            res.status(500).json(errRespObject);
                            client.close();
                            return; 
                        }
                        console.log("Successful block record created for "+req.body.requestor+" from "+req.body.target);
                        var respObject = {"success": true};
                        res.json(respObject);                     
                    });
                    // remove subscription
                    db.collection("subscriptions").deleteOne( {requestor: req.body.requestor, target: req.body.target}, function(err, result) {
                        if (err) {
                            var errRespObject = {"success": false, "error": err.message};
                            res.status(500).json(errRespObject);
                            client.close();
                            return; 
                        }
                        client.close();
                    });
                }
            });
        });
    } else {
        res.status(500).send('Invalid requestor and target!');
    }        
})

function GetEmailsFromString(input) {
    var ret = [];
    var email = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    var match;
    while (match = email.exec(input)) {
      ret.push(match[1]);
    }
    return ret;
  }

// 6. As a user, I need an API to retrieve all email addresses that can receive updates from an email address.
app.post('/friends/listemails', (req, res) => {
    console.log('List Eligible Emails for Updates API Request: '+req.body.sender+','+req.body.text);
    if (req.body.sender && req.body.text) {
        MongoClient.connect(process.env.MONGODB_URI || mongodburl, function(err, client) {
            if (err) {
                return console.dir(err);
            }
            // extract emails from text            
            var extractedEmailsArray = GetEmailsFromString(req.body.text);
            console.log("req.body.text: "+req.body.text);
            console.log("extractedEmailsArray: "+extractedEmailsArray);            
            // get friends list of sender
            var recipientsArray = [];
            db.collection('connections').find( {$or: [{email1: req.body.sender}, {email2: req.body.sender}] }).toArray(function(err, results) {
                if (results!= null) {
                    for (var i = 0; i < results.length; i++) {                        
                        var friendemail = results[i].email2;
                        // make sure email is not own email, if it is, then friend's email is in email1 field
                        if (req.body.sender == friendemail) {
                            friendemail = results[i].email1
                        }
                        recipientsArray.push(friendemail);                        
                    }
                }
                // get emails subscribed to sender
                db.collection('subscriptions').find( {target: req.body.sender} ).toArray(function(err, results) {                
                    if (results!= null) {
                        for (var i = 0; i < results.length; i++) {                        
                            recipientsArray.push(results[i].requestor);                        
                        }
                    }
                    // add on emails mentioned in the text
                    for (var i = 0; i < extractedEmailsArray.length; i++) {                        
                        recipientsArray.push(extractedEmailsArray[i]);                        
                    }
                    // make unique array
                    var uniqueRecipientsArray = [...new Set(recipientsArray)]
                    // remove those emails in the blocklist
                    db.collection('blocklist').find( {$or: [{requestor: req.body.sender}, 
                        {target: req.body.sender}] }).toArray(function(err, results) {                
                        if (results != null) {
                            for (var i = 0; i < results.length; i++) {                        
                                console.log("blocked: "+results[i].requestor);
                                // remove blocked email from uniqueRecipientsArray
                                var foundindex = uniqueRecipientsArray.indexOf(results[i].requestor);
                                if (foundindex !== -1) {
                                    uniqueRecipientsArray.splice(foundindex, 1);
                                }
                            }                            
                        }
                        client.close();
                        var strJson = "";
                        for (var i = 0; i < uniqueRecipientsArray.length; i++) {                        
                            if (strJson == "") {
                                strJson += '"' + uniqueRecipientsArray[i] + '"';
                            } else {
                                strJson += ',"' + uniqueRecipientsArray[i] + '"';
                            }                            
                        }
                        strJson = '{"success": true, "recipients": [' + strJson + ']}'
                        console.log("List Eligible Emails for Updates strJson: \n"+strJson);
                        res.json(JSON.parse(strJson));                        
                    }); 
                }); 
            });       
        });
    } else {
        res.status(500).send('Less than 2 email addresses!');
    }        
})