var camera;

(function() {
  var back = navigator.mozCameras.getListOfCameras().filter(function(c) {
    return c === 'back';
  })[0];
  
  if (!back) {
    return console.error('Aint no back camera');
  }
  
  navigator.mozCameras.getCamera(back, {
    mode: 'picture',
    recorderProfile: 'jpg',
    previewSize: {
      width: 352,
      height: 288
    }
  }, function(c) {
    console.log('success', c);
    window.c = c;

    var f = c.capabilities.flashModes;
    if (!f || !f.length) {
      return console.error('No flash mode');
    }

    if (f.indexOf('torch') === -1) {
      return console.error('Omg no torch mode');
    }

    camera = c;
  }, function(err) {
    console.error('err', err);
  });
})();

document.querySelector('#toggle').onclick = function() {
  camera.flashMode = camera.flashMode === 'torch' ?
    'off' :
    'torch';
};