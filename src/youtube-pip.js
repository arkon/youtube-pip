'use strict';

// State flag
let inPipMode = false;
let manualResize = false;

let elPlayerContainer;

const interval = setInterval(checkForPlayer, 100);

function checkForPlayer() {
  if (document.querySelector('ytd-watch')) {
    clearInterval(interval);
    injectPIP();
  }
}

function injectPIP() {
  const elPlayer = document.querySelector('#top #player');
  elPlayerContainer = document.querySelector('#player #player-container');
  const elPlayerControls = document.querySelector('#player-container #movie_player');

  // Add toggle button
  const elTogglePIP = document.createElement('button');
  elTogglePIP.id = 'youtube-pip-toggle';
  elTogglePIP.title = 'Toggle PIP';
  elTogglePIP.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 0 36 36" width="100%"><path fill="#FFF" d="M0 6.9v22.2h36V6.9H0zm35 21.2H1V7.9h34v20.2z"/><path fill="#FFF" d="M34.2 14H15.4v13.6h18.8V14zm-1 12.5H16.5V15.1h16.7v11.4z"/></svg>';
  elPlayerControls.appendChild(elTogglePIP);

  // Add listener to toggle button
  elTogglePIP.onclick = () => {
    inPipMode = !inPipMode;
    elPlayer.classList.toggle('youtube-pip', inPipMode);

    manualResize = false;

    if (inPipMode) {
      elPlayerContainer.style.bottom = '16px';
      elPlayerContainer.style.right = '16px';

      window.addEventListener('resize', resizePIP);
    } else {
      elPlayerContainer.style = null;
      window.removeEventListener('resize', resizePIP);
    }

    window.dispatchEvent(new Event('resize'));
  };
}

function resizePIP() {
  const newWidth = window.innerWidth / 3;
  const newHeight = newWidth / 16 * 9;

  elPlayerContainer.style.width = newWidth + 'px';
  elPlayerContainer.style.height = newHeight + 'px';

  if (!manualResize) {
    manualResize = true;
    window.dispatchEvent(new Event('resize'));
  } else {
    manualResize = false;
  }
}
