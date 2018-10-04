const AWS = require('aws-sdk');
const {promisify} = require('util');
const path = require('path');
const fs = require('fs');
const stat = promisify(fs.stat);

const {BUCKET_NAME, IAM_USER_KEY, IAM_USER_SECRET} = require('./config');

module.exports = function(data) {
    
    let {res, filename, thumb} = data

    return new Promise(function(resolve, reject) {

        try{

            const incomingFile = path.join(__dirname, "/../tmp/original/", filename)
            const incomingThumb = path.join(__dirname, "/../tmp/thumb/", thumb)
            const incomingFileStream = fs.createReadStream(incomingFile)
            const incomingThumbStream = fs.createReadStream(incomingThumb)

            const result = {}

            const s3uploader = (incomingStream, incomingFile, filename) => {
                return new Promise(function(resolve, reject) {
                    const s3bucket = new AWS.S3({
                        params: {Body: incomingStream, Bucket: BUCKET_NAME, Key: filename},
                        accessKeyId: IAM_USER_KEY,
                        secretAccessKey: IAM_USER_SECRET,
                        Bucket: BUCKET_NAME
                    });
                    s3bucket.upload().on('httpUploadProgress', function (evt) {
                        console.log(evt);
                    }).send(function (e, data) {
                        stat(incomingFile).then(() => fs.unlink(incomingFile))
                        console.log(e)
                        console.log('Successfully uploaded data'); 
                        resolve(data)
                    });
                })
            }

            new Promise(function(resolve, reject) {
                resolve()
            }).then(() => {
                return s3uploader(incomingFileStream, incomingFile, filename)
            })
            .then((data) => {
                result.dataFile = data
                return s3uploader(incomingThumbStream, incomingThumb, thumb)
            }).then((data) => {
                result.dataThumb = data
                return resolve({result, res})
            }).catch((e) => {
                reject(e)
            })

        }catch(e){
            reject(e)
        }
    })

}