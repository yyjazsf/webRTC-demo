// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function (constraints) {
    // First get ahold of the legacy getUserMedia, if present
    var getUserMedia =
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(
        new Error("getUserMedia is not implemented in this browser")
      );
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function (resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  };
}

function setVideoSrc(video, mediaStream) {
    if ("srcObject" in video) {
        video.srcObject = mediaStream;
    } else {
        // Avoid using this in new browsers, as it is going away.
        video.src = window.URL.createObjectURL(mediaStream);
    }
}


function showVideo(selector, mediaStream) {
  const dom = document.querySelector(selector);
  if (!dom) {
    return;
  }
  dom.innerHTML = "";
  const video = document.createElement("video");
  const audio = document.createElement("audio");
  audio.muted = true;
  video.muted = true;

  video.onloadedmetadata = function (e) {
    video.play();
  };

  // video.srcObject = mediaStream;
  setVideoSrc(video, mediaStream);

  dom.appendChild(video);
  dom.appendChild(audio);
}
