# FriendsServ

NodeJS, Express, MongoDB coding exercise from https://gist.github.com/winston/51d26e4587b5e0bbf03fcad558111c08

- Run MongoDB locally on localhost:27017
- Clone files from https://github.com/calenz/friendsserv master branch and save to a local folder, e.g. friendsserv
- Navigate to 'friendsserv' subdirectory in Terminal
- Run "npm install"
- Run "node server.js" and server will be listening on port 3000
- Use Postman to import "FriendsServ Localhost.postman_environment.json" from 'postman' folder in Manage Environments
- Import "FriendsServ APIs.postman_collection.json" to run the APIs and ensure 'FriendsServ Localhost' environment is selected in the dropdown

## Sample Data in MongoDB
### Schema

#### 1. Connections
- _id
- email1
- email2

Note: Use /friends/connect API multiple times to create the connection records
e.g.
```
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
```

#### 2. Subscriptions
- _id
- requestor
- target

Note: Use /friends/subscribe API multiple times to create the subscription records
e.g.
```
{ 
    "_id" : ObjectId("5b0cf7b57d92783a9d1f26ed"), 
    "requestor" : "peter@example.com", 
    "target" : "vivian@example.com"
}
{ 
    "_id" : ObjectId("5b0cf7ec7657043aa7aed39d"), 
    "requestor" : "jane@example.com", 
    "target" : "vivian@example.com"
}
```

#### 3. Blocklist
- _id
- requestor
- target

Note: Use /friends/block API multiple times to create the blocklist records
e.g.
```
{ 
    "_id" : ObjectId("5b0d03ab0f04323be69df4e1"), 
    "requestor" : "vivian@example.com", 
    "target" : "john@example.com"
}
{ 
    "_id" : ObjectId("5b0d03eb90dde03bf3fd0fa1"), 
    "requestor" : "felicia@example.com", 
    "target" : "andy@example.com"
}

```

## Sample API Calls

### 1. As a user, I need an API to create a friend connection between two email addresses.
API: POST {{friendsserv_url}}/friends/connect

Sample Request:
```
{
  "friends": [
  	"john@example.com", "felicia@example.com"
  ]
}
```
Sample Response:
```
{
    "success": true
}
```

### 2. As a user, I need an API to retrieve the friends list for an email address.
API: POST {{friendsserv_url}}/friends/list

Sample Request:
```
{
  "email": "john@example.com"
}
```
Sample Response:
```
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
```

### 3. As a user, I need an API to retrieve the common friends list between two email addresses.
API: POST {{friendsserv_url}}/friends/common

Sample Request:
```
{
  "friends": [
  	"vivian@example.com", "john@example.com"
  ]
}
```
Sample Response:
```
{
    "success": true,
    "friends": [
        "andy@example.com",
        "peter@example.com",
        "felicia@example.com"
    ],
    "count": 3
}
```

### 4. As a user, I need an API to subscribe to updates from an email address.
API: POST {{friendsserv_url}}/friends/subscribe

Sample Request:
```
{
  "requestor": "vivian@example.com",
  "target": "andy@example.com"
}
```
Sample Response:
```
{
    "success": true
}
```

### 5. As a user, I need an API to block updates from an email address.
API: POST {{friendsserv_url}}/friends/block

Sample Request:
```
{
  "requestor": "vivian@example.com",
  "target": "john@example.com"
}
```
Sample Response:
```
{
    "success": true
}
```

### 6. As a user, I need an API to retrieve all email addresses that can receive updates from an email address.
API: POST {{friendsserv_url}}/friends/listemails

Sample Request:
```
{
  "sender":  "john@example.com",
  "text": "Hello World! vivian@example.com kate@example.com jane@example.com welcome!"
}
```
Sample Response:
```
{
    "success": true,
    "recipients": [
        "andy@example.com",
        "peter@example.com",
        "felicia@example.com",
        "kate@example.com",
        "jane@example.com"
    ]
}
```



