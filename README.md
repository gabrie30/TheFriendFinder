
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