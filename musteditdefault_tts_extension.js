async function playAudioData(audioJob) {
    const { audioBlob, char } = audioJob;
    // Since current audio job can be cancelled, don't playback if it is null
    if (currentAudioJob == null) {
        console.log('Cancelled TTS playback because currentAudioJob was null');
    }
    if (audioBlob instanceof Blob) {
        const srcUrl = await getBase64Async(audioBlob);

        // VRM lip sync
        if (extension_settings.vrm?.enabled && typeof window['vrmLipSync'] === 'function') {
            await window['vrmLipSync'](audioBlob, char);
        }

        // Live2D lip sync ... 
        if (extension_settings.live2d?.enabled && extension_settings.live2d?.ttsLipSync && typeof window['live2dLipSync'] === 'function') {
            await window['live2dLipSync'](audioBlob, char);
            //return; // Skip default playback since audioTalk handles it
        }

        audioElement.src = srcUrl;
    } else if (typeof audioBlob === 'string') {
        audioElement.src = audioBlob;
    } else {
        throw `TTS received invalid audio data type ${typeof audioBlob}`;
    }
    audioElement.addEventListener('ended', completeCurrentAudioJob);
    audioElement.addEventListener('canplay', () => {
        console.debug('Starting TTS playback');
        audioElement.playbackRate = extension_settings.tts.playback_rate;
        audioElement.play();
    });
}
