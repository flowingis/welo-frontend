# Welo Frontend
An AngularJS Frontend for Welo


## Install

Prerequisites: nvm (node version manager) on the dev machine

- create a copy of `config.development.js.dist` named `config.development.js`
- customize `config.development.js` setting the `apiEndPoint` parameter
- nvm install
- npm start

A local node server will be started, acting like a proxy. This allows you to test the frontend with different environments.


## Deploy

From the project root run 
```
$ node_modules/grunt-cli/bin/grunt deploy
```

to deploy on production 

```
$ node_modules/grunt-cli/bin/grunt deploy_staging
```

to deploy on staging
