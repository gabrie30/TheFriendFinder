
## TheFriendFinder App - Learning Node, Express, and Dynamodb

## Use case
- Users must create an account to use the app
- Once logged in users can input an email to search FullContact API
- Results from the query are returned to the user

## Setup
- Get a FullContact API Key: https://www.fullcontact.com/developer
- Follow instructions in example.api_keys.js
- Configure your Dyanamodb tables

## Features
- Authentication
- Uses AWS Dynamodb NoSQL database to cache API requests
- Queries FullContact API

## TODOS
- Improve the design/UI
- Limit number of requests per user
- Push to Heroku
- Add additonal lookup information to user

## Pics
![screen shot 2016-04-11 at 10 12 10 am](https://cloud.githubusercontent.com/assets/1512282/14435700/031b77c8-ffce-11e5-85dc-916b335a7123.png)
![screen shot 2016-04-11 at 10 12 37 am](https://cloud.githubusercontent.com/assets/1512282/14435712/10e36e60-ffce-11e5-891f-e30e8db62132.png)
![screen shot 2016-04-11 at 10 07 55 am](https://cloud.githubusercontent.com/assets/1512282/14435579/722e0f8c-ffcd-11e5-8d95-eebc1694d9a5.png)
