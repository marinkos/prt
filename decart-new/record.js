/* Decart — record page: PNINA mp3 + [data-record="play-stop"] / [data-record="restart"] + .hero_record-image spin */
(function () {
  var AUDIO_URL =
    'https://cdn.prod.website-files.com/69e4f7a5dc137a2d1a4a6a2e/69e5481736553239122c7834_pnina.mp3';

  var STYLE_ID = 'decart-record-spin-style';

  function injectSpinStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '@keyframes decart-hero-record-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' +
      '.hero_record-image.hero_record-image--spinning {' +
      'animation: decart-hero-record-spin 20s linear infinite;' +
      'transform-origin: 50% 50%;' +
      '}' +
      '.hero_record-image.hero_record-image--spinning.hero_record-image--spinning-paused {' +
      'animation-play-state: paused;' +
      '}';
    document.head.appendChild(style);
  }

  function init() {
    injectSpinStyles();

    var playStopBtn = document.querySelector('[data-record="play-stop"]');
    if (!playStopBtn) return;

    var audio = new Audio(AUDIO_URL);
    audio.preload = 'auto';

    var playIcon = playStopBtn.querySelector('[data-icon="play"]');
    var stopIcon = playStopBtn.querySelector('[data-icon="stop"]');
    var recordImages = document.querySelectorAll('.hero_record-image');

    function setPlayingUI(playing) {
      if (playIcon) playIcon.hidden = playing;
      /* [data-icon="stop"] { display: none } in Webflow beats the `hidden` attr — override with inline style */
      if (stopIcon) stopIcon.style.display = playing ? 'flex' : '';
    }

    function setRecordSpin(playing) {
      recordImages.forEach(function (el) {
        if (playing) {
          el.classList.add('hero_record-image--spinning');
          el.classList.remove('hero_record-image--spinning-paused');
        } else {
          if (el.classList.contains('hero_record-image--spinning')) {
            el.classList.add('hero_record-image--spinning-paused');
          }
        }
      });
    }

    function setPlayingState(playing) {
      setPlayingUI(playing);
      setRecordSpin(playing);
    }

    setPlayingState(false);

    audio.addEventListener('play', function () {
      setPlayingState(true);
    });
    audio.addEventListener('pause', function () {
      setPlayingState(false);
    });
    audio.addEventListener('ended', function () {
      setPlayingState(false);
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
        recordImages.forEach(function (el) {
          el.classList.remove('hero_record-image--spinning', 'hero_record-image--spinning-paused');
        });
        audio.currentTime = 0;
        audio.play().catch(function () {});
        /* If audio was already playing, `play` does not fire again — force UI + spin */
        setPlayingState(true);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
