function start() {
  if (!navigator.getUserMedia) {
    alert("不支持 webrtc");
    return;
  }
  //   video: {
  //     width: { min: 1024, ideal: 1280, max: 1920 },
  //     height: { min: 576, ideal: 720, max: 1080 }
  //   }
  getMedia({
    audio: true,
    video: {
      width: 1280,
      height: 720,
      facingMode: "user", // facingMode: { exact: "environment" }
      frameRate: { ideal: 10, max: 15 },
      // deviceId:
    },
  });
}

async function getMedia(constraints) {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    showVideo("#myself", stream);
  } catch (err) {
    console.log(`getUserMedia() error: ${err.name}`);
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

start();
