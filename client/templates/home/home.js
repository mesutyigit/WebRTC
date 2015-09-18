var startRecording,
  stopRecording,
  cameraPreview,
  mediaRecorder,
  videosContainer,
  multiStreamRecorder,
  index = 1,
  inner,
  videoPlayer,
  isFirefox = false,
  recordRTC,
  mergedVideoReady = false;


if (Meteor.isClient) {
  Template.home.rendered = function() {

    console.log("render edildi");
    videoPlayer = document.getElementById('videoPlayer');
    startRecording = document.getElementById('start-recording');
    stopRecording = document.getElementById('stop-recording');
    cameraPreview = document.getElementById('camera-preview');
  }
  Template.home.events({

    "click #start-recording": function() {
      startRecord();
    },

    "click #stop-recording": function() {

      startRecording.disabled = false;
      stopRecording.disabled = true;

      window.audioVideoRecorder.stopRecording(function(url) {

        console.log("url: " + URL.createObjectURL(
          audioVideoRecorder
          .getBlob()));
        cameraPreview.src = url;
        cameraPreview.muted = false;
        cameraPreview.play();
        var videoFile = new FS.File();
        videoFile.name("video.webm");
        videoFile.extension("webm");
        videoPath = "./uploads/records-";
        videoFileId = 0;
        videoFile.attachData(audioVideoRecorder.getBlob(), {
          type: "video/webm"

        }, function() {
          return Records.insert(videoFile, function(err, fileObj) {
            if (err)
              console.log("video upload hata: " + err);
            else {
              console.log("video upload succes: file id :" +
                fileObj
                ._id);
              console.dir(fileObj);
              videoPath = videoPath + fileObj._id +
                "-video.webm";
              console.log("videoPath: " + videoPath);
              videoFileId = fileObj._id;


            }
          });
        });
        cameraPreview.onended = function() {
          cameraPreview.pause();
          cameraPreview.src = URL.createObjectURL(
            audioVideoRecorder
            .getBlob());
        };
      });
    }
  });

  function startRecord() {
    stopRecording.disabled = false;
    startRecording.disabled = true;
    captureUserMedia(function(stream) {
      window.audioVideoRecorder = window.RecordRTC(stream, {
        type: 'video', // don't forget this; otherwise you'll get video/webm instead of audio/ogg
        recorderType: MediaStreamRecorder
      });
      window.audioVideoRecorder.startRecording();
    });



    function captureUserMedia(callback) {
      navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
      navigator.getUserMedia({
        audio: true,
        video: true
      }, function(stream) {
        cameraPreview.src = URL.createObjectURL(stream);
        cameraPreview.muted = true;
        cameraPreview.controls = true;
        cameraPreview.play();
        callback(stream);
      }, function(error) {
        console.error(error);
      });
    }


    window.onbeforeunload = function() {
      document.querySelector('#start-recording').disabled = false;
    };
  }
}

if (Meteor.isServer) {

}
