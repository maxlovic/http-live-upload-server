// Require express and create an instance of it
const express = require('express');
const fse = require('fs-extra');
const serve_index = require('serve-index');
const path = require("path");
const extend = require('node.extend');
const ip = require("ip");
const cors = require('cors')
const util = require('util');
const HTTP_STATUS = require('http-status-codes');


const defaults = {
    upload_url: '/upload',
    directory: './',
    allow_cors: true,
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
        const self = this;
        //const staticMiddleware = express.static('./');
        //app.get('./*', staticMiddleware);

        if (self.options.allow_cors)
            app.use(cors());

        app.disable('etag');
        app.disable('view cache');
        app.use(express.static('hls', {maxAge: 10}), serve_index('hls'));

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
            req.on('error', (err) => { console.error(err); })
            .on('data', (chunk) => { body.push(chunk); })
            .on('end', () => {
                body = Buffer.concat(body);

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
        });

        // Change the 404 message modifing the middleware
        app.use(function(req, res, next) {
            console.log("ERROR 404: " + req.path);
            res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
        });

        return app;
    };

    listen(options) {
        const self = this;
        const opts = extend( {}, listen_defaults, options );
        const app = express();
        self.attach(app).listen(opts.port, () => { console.log('Listening on ' + ip.address() + ':' + opts.port); });
        return self;
    }


}


const server = new HTTPLiveUploadServer().listen();

