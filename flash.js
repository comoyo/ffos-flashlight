(function loadStuff(done, error) {
  var back = navigator.mozCameras.getListOfCameras().filter(function(c) {
    return c === 'back';
  })[0];

  if (!back) {
    return error('No back camera found on your device');
  }

  navigator.mozCameras.getCamera(back, {
    mode: 'picture',
    recorderProfile: 'jpg',
    previewSize: {
      width: 352,
      height: 288
    }
  }, function(c) {
    var f = c.capabilities.flashModes;
    if (!f || !f.length) {
      return error('No flash found on your device');
    }

    if (f.indexOf('torch') === -1) {
      return error('Flash does not support torch mode');
    }

    done(c);
  }, function() {
    error('Could not get the camera. Is another application using the camera?');
  });
})(function(camera) {
  var state = camera.flashMode;
  var toggleButton = document.querySelector('#toggle');
  document.body.classList.remove('loading');

  toggleButton.classList.toggle('on', state === 'torch');

  toggleButton.ontouchstart = function() {
    toggleButton.classList.toggle('on', state !== 'torch');

    // add some time to make the effect look better
    setTimeout(function() {
      camera.flashMode = state = camera.flashMode === 'torch' ?
        'off' :
        'torch';
    }, 100);
  };

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      camera.flashMode = 'off';
      toggleButton.classList.remove('on');
    }
  });
}, function(err) {
  alert(err);
  window.close();
});
