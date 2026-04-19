/* Decart — record page: PNINA mp3 + [data-record="play-stop"] / [data-record="restart"] */
(function () {
  var AUDIO_URL =
    'https://cdn.prod.website-files.com/69e4f7a5dc137a2d1a4a6a2e/69e5481736553239122c7834_pnina.mp3';

  function init() {
    var playStopBtn = document.querySelector('[data-record="play-stop"]');
    if (!playStopBtn) return;

    var audio = new Audio(AUDIO_URL);
    audio.preload = 'auto';

    var playIcon = playStopBtn.querySelector('[data-icon="play"]');
    var stopIcon = playStopBtn.querySelector('[data-icon="stop"]');

    function setPlayingUI(playing) {
      if (playIcon) playIcon.hidden = playing;
      if (stopIcon) stopIcon.hidden = !playing;
    }

    setPlayingUI(false);

    audio.addEventListener('play', function () {
      setPlayingUI(true);
    });
    audio.addEventListener('pause', function () {
      setPlayingUI(false);
    });
    audio.addEventListener('ended', function () {
      setPlayingUI(false);
    });

    playStopBtn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().catch(function () {});
      } else {
        audio.pause();
      }
    });

    var restartBtns = document.querySelectorAll('[data-record="restart"]');
    for (var i = 0; i < restartBtns.length; i++) {
      restartBtns[i].addEventListener('click', function () {
        audio.currentTime = 0;
        audio.play().catch(function () {});
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
