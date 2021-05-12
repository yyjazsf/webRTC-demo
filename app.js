let localStream = null;
let displayStream = null;
let devices = [];

async function start() {
  //   video: {
  //     width: { min: 1024, ideal: 1280, max: 1920 },
  //     height: { min: 576, ideal: 720, max: 1080 }
  //   }
  devices = await navigator.mediaDevices.enumerateDevices();

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 640, // this is near     {"exact": 1024}
        height: 480,
        facingMode: "user", // facingMode: { exact: "environment" }
        frameRate: { ideal: 10, max: 15 },
        // deviceId:
      },
    });
    showVideo("#myself", localStream);
  } catch (error) {
    console.log(`getUserMedia() error: ${error.name}`);
  }
}

async function startShareDisplayMedia() {
  displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "always", //'always' | 'motion' | 'never',
      displaySurface: "application", //'browser' | 'browser' | 'monitor' | 'window'
    },
  });
  showVideo("#myself", displayStream);
}

// Listen for changes to media devices and update the list accordingly
navigator.mediaDevices.addEventListener("devicechange", async (event) => {
  devices = await navigator.mediaDevices.enumerateDevices();
});

async function makeCall() {
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  const peerConnection = new RTCPeerConnection(configuration);
  signalingChannel.addEventListener("message", async (message) => {
    if (message.answer) {
      const remoteDesc = new RTCSessionDescription(message.answer);
      await peerConnection.setRemoteDescription(remoteDesc);
    }
    // Listen for remote ICE candidates and add them to the local RTCPeerConnection
    if (message.iceCandidate) {
      try {
        await peerConnection.addIceCandidate(message.iceCandidate);
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    }
  });
  // Listen for local ICE candidates on the local RTCPeerConnection
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      signalingChannel.send({ "new-ice-candidate": event.candidate });
    }
  });
  // Listen for connectionstatechange on the local RTCPeerConnection
  peerConnection.addEventListener("connectionstatechange", (event) => {
    if (peerConnection.connectionState === "connected") {
      // Peers connected!
      console.log('Peers connected!');
    }
  });
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
});
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  signalingChannel.send({ offer: offer });
}
