// Require express and create an instance of it
var express = require('express');
const fse = require('fs-extra');
var bodyParser = require('body-parser');
const path = require("path");
const extend = require('node.extend');
const util = require('util');
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

        const staticMiddleware = express.static('./');
        app.get('./*', staticMiddleware);

        //app.get('/', function (req, res) {
        //    console.log("GET");
        //    res.send('<b>My</b> first express http server');
        //});

        //app.get('/welcome', function (req, res) {
        //    res.send('<b>Hello</b> welcome to my http server made with express');
        //});

        app.post('/', function (req, res) {
            console.log("POST");
        });

        app.put('/*', function (req, response) {
            const filename = path.normalize('./' + req.path);

            let body = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body)
            });
            
            //console.log(util.inspect(req));
            fse.outputFile(filename, body)
            .then(() => fse.ensureFile(filename))
            .then(() => {
                const stats = fse.statSync(filename);
                console.log('PUT ' + filename + ' (' + stats.size + ' bytes) succeeded!');
                response.status(HTTP_STATUS.OK).send('OK');
            })
            .catch(err => {
                console.log('PUT ' + filename + ' ' + err);
                response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(err);
            })
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
        self.attach(app).listen(opts.port, () => { console.log('Listening on port ' + opts.port); });
        return self;
    }


}


const server = new HTTPLiveUploadServer().listen();

