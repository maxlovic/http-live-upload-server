// Require express and create an instance of it
var express = require('express');
const fse = require('fs-extra')
const extend = require( 'node.extend' );
var HTTP_STATUS = require('http-status-codes');


const defaults = {
    upload_url: '/upload',
    directory: './',
    overwrite: true
};

const listen_defaults = {
    port: 3000
};


class HTTPLiveUploadServer {
    constructor(options) {
        const self = this;
        self.options = extend({}, defaults, options);
    }


    attach(app) {
        // on the request to root (localhost:3000/)
        app.get('/', function (req, res) {
            console.log("GET");
            res.send('<b>My</b> first express http server');
        });

        // On localhost:3000/welcome
        app.get('/welcome', function (req, res) {
            res.send('<b>Hello</b> welcome to my http server made with express');
        });

        // On localhost:3000/welcome
        app.post('/', function (req, res) {
            console.log("POST");
            res.send('<b>POST</b> done');
        });

        // On localhost:3000/
        app.put('/*', function (req, response) {
            const file = './' + req.path;
            console.log("PUT " + file);
            // With Promises:
            fse.outputFile(file, req.body)
            .then(() => fse.ensureFile(file))
            .then(() => {
                console.log('success!')
            })
            .catch(err => {
                console.error(err)
            })

            response.status(HTTP_STATUS.OK).send('OK');
        });

        // Change the 404 message modifing the middleware
        app.use(function(req, res, next) {
            console.log("404" + req);
            res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
        });

        return app;
    };

    listen(options) {
        const self = this;
        const opts = extend( {}, listen_defaults, options );
        const app = express();
        self.attach(app).listen(opts.port);
        return self;
    }


}


const server = new HTTPLiveUploadServer().listen();

