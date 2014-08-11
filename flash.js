(function() {
  function loadStuff(done, error) {
    var cameraApi = navigator.mozCameras || navigator.mozCamera;

    if (!cameraApi) {
      return error('Cannot get access to the camera API');
    }

    var back = cameraApi.getListOfCameras().filter(function(c) {
      return c === 'back';
    })[0];

    if (!back) {
      return error('No back camera found on your device');
    }

    cameraApi.getCamera(back, {
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
  }

  function done(camera) {
    var state = camera.flashMode;
    var toggleButton = document.querySelector('#toggle');
    var st;
    var screenWakelock;

    document.body.classList.remove('loading');

    toggleButton.classList.toggle('on', state === 'torch');
    if (state === 'torch') {
      screenWakelock = navigator.requestWakeLock('screen');
    }

    var ots;
    toggleButton.addEventListener('touchstart', ots = function() {
      toggleButton.classList.toggle('on', state !== 'torch');

      if (st) {
        clearTimeout(st);
      }

      // add some time to make the effect look better
      st = setTimeout(function() {
        camera.flashMode = state = camera.flashMode === 'torch' ?
          'off' :
          'torch';
        toggleButton.classList.toggle('on', state === 'torch');

        if (state === 'torch') {
          screenWakelock = navigator.requestWakeLock('screen');
        }
        else if (screenWakelock) {
          screenWakelock.unlock();
          screenWakelock = null;
        }
      }, 100);
    });

    var vc;
    document.addEventListener('visibilitychange', vc = function() {
      if (document.hidden) {
        camera.flashMode = 'off';
        toggleButton.classList.remove('on');

        if (screenWakelock) {
          screenWakelock.unlock();
          screenWakelock = null;
        }

        release();
      }
      else {
        document.removeEventListener('visibilitychange', vc);

        loadStuff(done, error);
      }
    });

    function release() {
      camera.release();
      camera = null;

      document.body.classList.add('loading');
      toggleButton.removeEventListener('touchstart', ots);
    }
  }

  function error(err) {
    alert(err);
    window.close();
  }

  loadStuff(done, error);
})();