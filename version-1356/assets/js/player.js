function initMoviePlayer(videoId, playId, coverId, url) {
  var video = document.getElementById(videoId);
  var play = document.getElementById(playId);
  var cover = document.getElementById(coverId);
  var loaded = false;
  var hlsInstance = null;

  if (!video || !play || !cover || !url) {
    return;
  }

  var load = function () {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  };

  var start = function () {
    load();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    video.play().catch(function () {});
  };

  cover.addEventListener('click', start);
  play.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
