const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const stat = promisify(fs.stat);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const thumb = require('node-thumbnail').thumb;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

module.exports = function(data) {

    let {filename} = data
    let targetFolder = path.join(__dirname, "/../tmp/thumb/")
    let incomingFile = path.join(__dirname, "/../tmp/original/", filename)
    
    return new Promise(function(resolve, reject) {

        if(data.mimetype.indexOf("video") !== -1){

            ffmpeg(incomingFile)
                .on('end', function() {
                    console.log('Screenshots taken');
                    let obj = {...data, thumb: "Thumb-" + filename + ".jpg"}
                    resolve(obj);
                })
                .on('error', function(err) {
                    console.log(err);
                    stat(incomingFile).then(() => fs.unlink(incomingFile))
                    reject("Screenshot error");
                })
                .screenshots({
                    timestamps: [ '50%' ],
                    filename: "Thumb-" + filename + ".jpg",
                    size: '600x?',
                    folder: targetFolder,
                })

        }else if(data.mimetype.indexOf("image") !== -1){

            thumb({
                source: incomingFile, 
                destination: targetFolder,
                width: 450,
                concurrency: 4,
                prefix: 'Thumb-',
                suffix: ''
            }, (files, err, stdout, stderr) => {
                if (err) return reject(err)
                let obj = {...data, thumb: "Thumb-" + filename}
                resolve(obj)
            });

        }else{
            reject("Ошибка загрузки - неизвестный формат данных") 
        }


    })

}
