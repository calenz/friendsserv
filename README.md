# FriendsServ

NodeJS, Express, MongoDB coding exercise

- Run MongoDB locally on localhost:27017
- Pull files from https://github.com/calenz/friendsserv master branch and save to a local folder, e.g. friendsserv
- Navigate to 'friendsserv' subdirectory in Terminal
- Run "npm install"
- Run "node server.js" and server will be listening on port 3000
- Use Postman to import "FriendsServ Localhost.postman_environment.json" from 'postman' folder in Manage Environments
- Import "FriendsServ APIs.postman_collection.json" to run the APIs and ensure 'FriendsServ Localhost' environment is selected in the dropdown

## Sample Data in MongoDB
###Schema: Connections
* Used /friends/connect API multiple times to create the connection records

{ 
    "_id" : ObjectId("5b098519bfbe9184d596ed1f"), 
    "email1" : "andy@example.com", 
    "email2" : "john@example.com"
}
{ 
    "_id" : ObjectId("5b0cbbcf3eff23334570f4c8"), 
    "email1" : "andy@example.com", 
    "email2" : "jane@example.com"
}
{ 
    "_id" : ObjectId("5b0cbbd53eff23334570f4c9"), 
    "email1" : "andy@example.com", 
    "email2" : "peter@example.com"
}
{ 
    "_id" : ObjectId("5b0cbf7991f30533a895a126"), 
    "email1" : "vivian@example.com", 
    "email2" : "peter@example.com"
}
{ 
    "_id" : ObjectId("5b0cbf7d91f30533a895a127"), 
    "email1" : "vivian@example.com", 
    "email2" : "jane@example.com"
}
{ 
    "_id" : ObjectId("5b0cbfa891f30533a895a128"), 
    "email1" : "vivian@example.com", 
    "email2" : "felicia@example.com"
}
{ 
    "_id" : ObjectId("5b0cbfac91f30533a895a129"), 
    "email1" : "jane@example.com", 
    "email2" : "felicia@example.com"
}
{ 
    "_id" : ObjectId("5b0cc1ce61ba2433c514267c"), 
    "email1" : "peter@example.com", 
    "email2" : "john@example.com"
}
{ 
    "_id" : ObjectId("5b0cc54b9a7e8b33f77e8440"), 
    "email1" : "john@example.com", 
    "email2" : "vivian@example.com"
}

## Sample API Calls

1. As a user, I need an API to create a friend connection between two email addresses.
API: POST {{friendsserv_url}}/friends/connect

Sample Request:
{
  "friends": [
  	"john@example.com", "felicia@example.com"
  ]
}

Sample Response:
{
    "success": true
}

2. As a user, I need an API to retrieve the friends list for an email address.
API: POST {{friendsserv_url}}/friends/list

Sample Request:
{
  "email": "john@example.com"
}

Sample Response:
{
    "success": true,
    "friends": [
        "andy@example.com",
        "peter@example.com",
        "vivian@example.com",
        "felicia@example.com"
    ],
    "count": 4
}

3. As a user, I need an API to retrieve the common friends list between two email addresses.
API: POST {{friendsserv_url}}/friends/common

Sample Request:
{
  "friends": [
  	"vivian@example.com", "john@example.com"
  ]
}

Sample Response:
{
    "success": true,
    "friends": [
        "andy@example.com",
        "peter@example.com",
        "felicia@example.com"
    ],
    "count": 3
}

4. As a user, I need an API to subscribe to updates from an email address.
API: POST {{friendsserv_url}}/friends/subscribe

Sample Request:
{
  "requestor": "vivian@example.com",
  "target": "andy@example.com"
}

Sample Response:
{
    "success": true
}

5. As a user, I need an API to block updates from an email address.
API: POST {{friendsserv_url}}/friends/block

Sample Request:
{
  "requestor": "vivian@example.com",
  "target": "john@example.com"
}

Sample Response:
{
    "success": true
}








