const Busboy = require('busboy');
const localUploader = require('./uploader');
const thumbinator = require('./thumbinator');
const bucketUploader = require('./s3uploader');
const renderer = require('./renderer');
const errorHandler = require('./error');

module.exports = function(req, res) {

    new Promise(function(resolve, reject) {
        if(!req.headers["content-length"]) return reject("content-length header expected")
        resolve({req, res})
    })
    .then((data) => { 
        // upload file in temporary directory
        return localUploader(data)
    })
    .then((data) => { 
        // create thumbnail from temp file
        return thumbinator(data)
    })
    .then((data) => { 
        return bucketUploader(data)
    })
    .then((data) => { 
        return renderer(data)
    })
    .catch((err) => {
        errorHandler(res, err)
    });
 
 }