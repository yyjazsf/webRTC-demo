const remoteStream = MediaStream();
showVideo('#app', remoteStream)

const peerConnection = new RTCPeerConnection(configuration);

peerConnection.addEventListener('track', async (event) => {
    remoteStream.addTrack(event.track, remoteStream);
});
signalingChannel.addEventListener('message', async message => {
    if (message.offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingChannel.send({'answer': answer});
    }
});

