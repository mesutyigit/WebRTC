if (Meteor.isServer) {
  Meteor.methods({
    "mergeAudioAndVideo": function(audioFileId, videoFileId) {
      //var fs = Meteor.npmRequire('fs');
      var filesReady = false;
      var audioPath = "./uploads/records-" + audioFileId + "-ses.wav";
      var videoPath = "./uploads/records-" + videoFileId + "-video.webm";



      var aviId = "merged-" + audioFileId + "-" + videoFileId;
      console
        .log("paths: " + audioPath + ' ** ' + videoPath);
      var outputPath = './uploads/' + aviId + '.webm';
      var FFmpeg = Meteor.npmRequire('fluent-ffmpeg');

      console.log("filesReady:" + filesReady);
      var command = new FFmpeg()
        .addInput(videoPath)
        .outputFPS(30)
        .addInput(audioPath)
        .size('640x400')
        .save(outputPath,
          './uploads/tempDir')
        .on('error', function(err) {
          filesReady = false;
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          console.log('Merging finished !');
          filesReady = true;
          bound(function() {
            console.log("wrapAsync");
            Records.insert(outputPath, function(err, fileObj) {
              if (err) {
                console.log("inserting error " + err);
              } else {
                console.log(
                  "merged file successfully added db: " +
                  fileObj._id);
              }
            });
          });



        });
      var meteor_root = fs.realpathSync(process.cwd());
      var audioPathRelative = meteor_root + "/uploads/records-" +
        audioFileId + "-ses.wav";
      console.log("root: " + meteor_root);
      var fileCheck = fs.readFileSync(audioPathRelative, null);
      if (fileCheck) {
        console.log("hata yok");
      } else {
        console.log("hata var");
      }
      /*
      fs.readFile(audioPathRelative, function(err, inodeStatus) {
        if (err)  {

          // file does not exist-
          if (err.code === 'ENOENT') {
            console.log('No file or directory at', audioPathRelative);
            //return;
          }

          // miscellaneous error (e.g. permissions)
          console.error(err);
          //return;
        } else {
          console.log("hata yok");
        }
      });
      */



    },

    "saveVideo": function(videoDataURL, audioDataURL) {
      var buf = Meteor.npmRequire('buffer');
      var arr = videoDataURL.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = new Buffer(arr[1]).toString('base64'),
        n = bstr.length;
      //u8arr = new Uint8Array(n);
      var buffer = Buffer(bstr.length);
      while (n--) {
        buffer[n] = bstr.charCodeAt(n);
      };

      var videoFile, audioFile;

      videoFile = new FS.File();
      audioFile = new FS.File();
      videoFile.name("video.webm");
      audioFile.name("ses.wav");
      videoFile.extension("webm");
      audioFile.extension("wav");
      videoFile.attachData(videoDataURL, {
        type: "video/webm"
      }, function() {
        return Records.insert(videoFile, function(err, fileObj) {
          if (err) {
            console.log("upload hata: " + err);
            Logger.log("upload hata: " + err);
          } else {
            console.log("upload succes - video");
            Logger.log("upload succes: file id :" + fileObj
              ._id);
          }
        });
      });

      //console.log("gelen audio: " + audioDataURL);
      audioFile.attachData(audioDataURL, {
        type: "audio/wav"
      }, function() {
        return Records.insert(audioFile, function(err, fileObj) {
          if (err) {
            console.log("upload hata: " + err);
            Logger.log("upload hata: " + err);
          } else {
            console.log("upload succes - audio");
            Logger.log("upload succes: file id :" + fileObj
              ._id);
          }
        });
      });

      /*  Records.storeBuffer('video2.webm', buffer, {
          // Set a contentType (optional)
          contentType: 'video/webm',
          // Set a user id (optional)
          //owner: Meteor.userId(),
          // Stop live update of progress (optional, defaults to false)
          noProgress: true,
          // Attach custom data to the file
          metadata: {
            text: 'some stuff'
          },
          // Set encoding (optional default 'utf-8')
          encoding: 'utf-8'
        });*/
    }
  });
  Meteor.startup(function() {
    Logger = new Loggly({
      token: "your-really-long-input-token",
      subdomain: "recordrtcdeneme.meteor.com",
      auth: {
        username: "mesutyigit",
        password: "080913*MeteoR"
      },
      //
      // Optional: Tag to send with EVERY log message
      //
      tags: ['MyLOG:'],
      // Optional: logs will be stored in JSON format
      json: true
    });


  });


  Records.allow({

    insert: function() {
      return true;
    },
    update: function() {
      return true;
    },
    remove: function() {
      return true;
    },
    download: function() {
      return true;
    }
  });


}
var bound = Meteor.bindEnvironment(function(callback) {
  callback();
});

function saveAviFile(outputPath) {
  Records.insert(outputPath, function(err, fileObj) {
    if (err) {
      console.log("inserting error " + err);
    } else {
      console.log(
        "merged file successfully added db: " +
        fileObj._id);
    }
  })
}
