# Remote Dex Spreadsheet Modifier

## Overview

Through the use of AWS Lambda and Google Cloud this project allows for a Google Spreadsheet to be used as a database. 

The current use of this code is to modify a spreadsheet filled with all the Pokemon up to a certain point. You can set any of the Pokemon in the database to be obtained or not, as well as get a "Pokemon" object which contains the name and other useful data about it.

It works by sending a request to AWS which requests which operation should be run. That function is run using the google-spreadsheets wrapper of the official Google Sheets API. Currently the request is entered through command line or changing the aws website in the  url, but in future version the requests would be through a front end website.

The example spreadsheet anyone can view is at: https://docs.google.com/spreadsheets/d/1F3vkkhJPt0S1EO6gcjIQLqLa501E3XohItdWX3eAlxs/

## Examples

### Running functions

### &emsp;From command line: 

 &emsp;Example command:
```
curl --location --request GET "https://ygmsph3t55.execute-api.us-east-1.amazonaws.com/dev/getPokemonObject?names=Bulbasaur,Charmander"
```

  &emsp; Replace the url above with one of the bellow urls (the  query strings are an example) and change ``GET`` to ``POST`` for the ``setCaught`` and ``setUncaught`` functions
  
   &emsp; \*Note: it might take a while to load\*

&emsp; &emsp; 1. ``getPokemonObject``: (returns useful info about the requested Pokemon)

&emsp; &emsp; https://ygmsph3t55.execute-api.us-east-1.amazonaws.com/dev/getPokemonObject?names=Bulbasaur,Charmander

&emsp; &emsp; 2. ``setCaught``: (sets the "Obtained!" Column E for the requested Pokemon to true)

&emsp; &emsp; https://ygmsph3t55.execute-api.us-east-1.amazonaws.com/dev/setCaught?names=Bulbasaur,Charmander

&emsp; &emsp; 3. ``setUncaught``: (sets the "Obtained!" Column E for the requested Pokemon to false)

&emsp; &emsp; https://ygmsph3t55.execute-api.us-east-1.amazonaws.com/dev/setCaught?names=Bulbasaur,Charmander

<br>

### Event Example

The event created by calling the ``setCaught`` function through the ``/setCaught`` function url with query string parameters ``?names=Snubbull,Granbul`` :

```js
    {
        resource: '/setCaught',
        path: '/setCaught',
        httpMethod: 'POST',
        headers: {
            Accept: '*/*',
            'CloudFront-Forwarded-Proto': 'https',
            'CloudFront-Is-Desktop-Viewer': 'true',
            'CloudFront-Is-Mobile-Viewer': 'false',
            'CloudFront-Is-SmartTV-Viewer': 'false',
            'CloudFront-Is-Tablet-Viewer': 'false',
            'CloudFront-Viewer-ASN': '7922',
            'CloudFront-Viewer-Country': 'US',
            Host: 'ygmsph3t55.execute-api.us-east-1.amazonaws.com',
            'User-Agent': 'curl/8.4.0',
            Via: '1.1 23d87d8c2ce38e34462e6c134d187eea.cloudfront.net (CloudFront)',
            'X-Amz-Cf-Id': 'd6gNwVIwwNSwZtVgLIBeTBvHvUsCV3ZqL11oH0XpwPMcwOc9j9Y6CA==',
            'X-Amzn-Trace-Id': 'Root=1-6595b4ff-330143515d3c6bb12227bdb4',
            'X-Forwarded-For': '76.131.85.72, 70.132.0.68',
            'X-Forwarded-Port': '443',
            'X-Forwarded-Proto': 'https'
        },
        multiValueHeaders: {
            Accept: [ '*/*' ],
            'CloudFront-Forwarded-Proto': [ 'https' ],
            'CloudFront-Is-Desktop-Viewer': [ 'true' ],
            'CloudFront-Is-Mobile-Viewer': [ 'false' ],
            'CloudFront-Is-SmartTV-Viewer': [ 'false' ],
            'CloudFront-Is-Tablet-Viewer': [ 'false' ],
            'CloudFront-Viewer-ASN': [ '7922' ],
            'CloudFront-Viewer-Country': [ 'US' ],
            Host: [ 'ygmsph3t55.execute-api.us-east-1.amazonaws.com' ],
            'User-Agent': [ 'curl/8.4.0' ],
            Via: [
            '1.1 23d87d8c2ce38e34462e6c134d187eea.cloudfront.net (CloudFront)'
            ],
            'X-Amz-Cf-Id': [ 'd6gNwVIwwNSwZtVgLIBeTBvHvUsCV3ZqL11oH0XpwPMcwOc9j9Y6CA==' ],
            'X-Amzn-Trace-Id': [ 'Root=1-6595b4ff-330143515d3c6bb12227bdb4' ],
            'X-Forwarded-For': [ '76.131.85.72, 70.132.0.68' ],
            'X-Forwarded-Port': [ '443' ],
            'X-Forwarded-Proto': [ 'https' ]
        },
        queryStringParameters: { names: 'Snubbull,Granbull' },
        multiValueQueryStringParameters: { names: [ 'Snubbull,Granbull' ] },
        pathParameters: null,
        stageVariables: null,
        requestContext: {
            resourceId: 'xt8oie',
            resourcePath: '/setCaught',
            httpMethod: 'POST',
            extendedRequestId: 'Q-k4AH0FoAMEMtA=',
            requestTime: '03/Jan/2024:19:26:55 +0000',
            path: '/dev/setCaught',
            accountId: '174400779650',
            protocol: 'HTTP/1.1',
            stage: 'dev',
            domainPrefix: 'ygmsph3t55',
            requestTimeEpoch: 1704310015786,
            requestId: 'aaaf5b56-a0bc-48a8-9536-ae9324595d22',
            identity: {
            cognitoIdentityPoolId: null,
            accountId: null,
            cognitoIdentityId: null,
            caller: null,
            sourceIp: '76.131.85.72',
            principalOrgId: null,
            accessKey: null,
            cognitoAuthenticationType: null,
            cognitoAuthenticationProvider: null,
            userArn: null,
            userAgent: 'curl/8.4.0',
            user: null
            },
            domainName: 'ygmsph3t55.execute-api.us-east-1.amazonaws.com',
            apiId: 'ygmsph3t55'
        },
        body: null,
        isBase64Encoded: false
        }
```

## Setting up Google Cloud

TODO

### Obtaining client_secret.json
    
TODO

### .env.yml

.env.yml should look like this:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL: aws-lambda@nat-dex-lambda-sheets.iam.gserviceaccount.com GOOGLE_PRIVATE_KEY: "<Private Key>"
```

