Router.route('/', {
  template: 'home',
  name: 'home',
  onBeforeAction: function() {
    //IRLibLoader.load('//cdn.WebRTC-Experiment.com/RecordRTC.js');
    this.next();
  },

  waitOn: function() {
    return [
      IRLibLoader.load('//cdn.WebRTC-Experiment.com/RecordRTC.js')
      // IRLibLoader.load(
      //   'https://cdn.webrtc-experiment.com/MediaStreamRecorder.js')
    ]
  }
});
