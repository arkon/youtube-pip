'use strict';

// ========================================================================= //
// GLOBAL STATE / REFERENCES                                                 //
// ========================================================================= //

const state = {
  isPolymer    : false,
  inPipMode    : false,
  manualPip    : false,
  manualResize : false
};

const elRefs = {
  player    : null,
  container : null,
  player_container: null,
  msg       : null,
  header    : null
};


// ========================================================================= //
// PIP LOGIC                                                                 //
// ========================================================================= //

function injectPIP() {
  if (document.getElementById('yt-pip-toggle')) {
    return;
  }

  let elPlayer;

  // Get element references
  if (state.isPolymer) {
    elRefs.player = document.querySelector('#top #player');
    elRefs.container = document.querySelector('#top #player #player-container');
    elRefs.player_container = document.querySelector('#movie_player .html5-video-container');
    elPlayer = document.querySelector('#player-container #movie_player');
  } else {
    elRefs.player = document.querySelector('#player-api');
    elRefs.container = document.querySelector('#movie_player');
    elRefs.player_container = document.querySelector('#movie_player .html5-video-container');
    elPlayer = document.querySelector('#movie_player');
  }

  // Add toggle button to corner of player
  const elTogglePIP = document.createElement('button');
  elTogglePIP.id = 'yt-pip-toggle';
  elTogglePIP.title = 'Toggle PIP';
  elTogglePIP.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 22.11"><rect x="18.73" y="10.53" width="17.27" height="11.58" fill="#777"/><polygon points="30.85 1 3.48 1 1.55 1 1.55 2.93 1.55 17.48 1.55 19.41 3.48 19.41 16.69 19.41 16.69 17.48 3.48 17.48 3.48 2.93 30.85 2.93 30.85 8.69 32.78 8.69 32.78 2.93 32.78 1 30.85 1" fill="#777"/><rect x="17.18" y="9.53" width="17.27" height="11.58" fill="#fff"/><polygon points="29.3 0 1.93 0 0 0 0 1.93 0 16.48 0 18.41 1.93 18.41 15.14 18.41 15.14 16.48 1.93 16.48 1.93 1.93 29.3 1.93 29.3 7.69 31.23 7.69 31.23 1.93 31.23 0 29.3 0" fill="#fff"/></svg>';
  elPlayer.appendChild(elTogglePIP);

  // Add listener to toggle button
  elTogglePIP.addEventListener('click', () => {
    state.manualPip = true;
    togglePIP();
  });

  // Auto-PIP on scroll (if not manually done)
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if ((entry.intersectionRatio < 0.5 && !state.inPipMode) ||
          (entry.intersectionRatio > 0.5 && state.inPipMode && !state.manualPip)) {
        togglePIP();
      }
    });
  }, {
    threshold: 0.5
  });
  observer.observe(elRefs.player);
}

function togglePIP() {
  state.inPipMode = !state.inPipMode;
  elRefs.player.classList.toggle('yt-pip', state.inPipMode);

  if (state.inPipMode) {
    // attachPIPHeader();
    movePlayer();

    window.addEventListener('resize', resizePIP);
    addPlayerMsg();
  } else {
    state.manualPip = false;

    // removePIPHeader();
    resetStyles();

    window.removeEventListener('resize', resizePIP);
    removePlayerMsg();
  }

  state.manualResize = false;
  window.dispatchEvent(new Event('resize'));
}

function attachPIPHeader() {
  elRefs.header = document.createElement('div');
  elRefs.header.classList.add('yt-pip-header');
  elRefs.header.innerText = 'Header test';

  elRefs.container.insertBefore(elRefs.header, elRefs.container.firstChild);

  // TODO: allow dragging/resizing of PIP player
}

function removePIPHeader() {
  elRefs.container.removeChild(elRefs.header);
  elRefs.header = null;
}

function movePlayer() {
  elRefs.container.style.bottom = '16px';
  elRefs.container.style.right  = '16px';
}

function addPlayerMsg() {
  elRefs.msg = document.createElement('div');
  elRefs.msg.classList.add('yt-pip-player-msg');
  elRefs.msg.innerText = 'Click to return player';
  elRefs.msg.addEventListener('click', togglePIP);
  elRefs.player.appendChild(elRefs.msg);
}

function removePlayerMsg() {
  elRefs.msg.removeEventListener('click', togglePIP);
  elRefs.player.removeChild(elRefs.msg);
  elRefs.msg = null;
}

function resizePIP() {
  requestAnimationFrame(() => {
    let newWidth = window.innerWidth / 3;
    if (newWidth < 330) {
      newWidth = 330;
    }

    let newHeight = newWidth / 16 * 9;

    elRefs.container.style.width  = `${newWidth}px`;
    elRefs.container.style.height = `${newHeight}px`;

    elRefs.player_container.style.width  = `${newWidth}px`;
    elRefs.player_container.style.height = `${newHeight}px`;

    if (!state.manualResize) {
      state.manualResize = true;
      window.dispatchEvent(new Event('resize'));
    } else {
      state.manualResize = false;
    }
  });
}

function resetStyles() {
  elRefs.container.style = null;
  elRefs.player_container.style = null;
}


// ========================================================================= //
// INIT                                                                      //
// ========================================================================= //

let watchCheckQuery;

function checkIfWatching() {
  if (document.location.pathname === '/watch') {
    // TODO: better check
    const interval = setInterval(checkForPlayer, 100);
    function checkForPlayer() {
      if (document.querySelector(watchCheckQuery)) {
        clearInterval(interval);
        injectPIP();
      }
    }
  }
}

state.isPolymer = document.querySelector('body#body') === null;

if (state.isPolymer) {
  watchCheckQuery = 'ytd-watch';

  window.addEventListener('yt-navigate-finish', checkIfWatching);
} else {
  watchCheckQuery = '#player-api';
}

checkIfWatching();
