class LipSyncProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        this.jobId = options.processorOptions.jobId;
        this.mouthThreshold = options.processorOptions.mouthThreshold;
        this.mouthBoost = options.processorOptions.mouthBoost;
        this.lastUpdate = 0;
        this.LIPS_SYNC_DELAY = 33;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;

        const now = currentTime * 1000;
        if (now - this.lastUpdate < this.LIPS_SYNC_DELAY) return true;

        const dataArray = new Uint8Array(512);
        let sum = 0;
        for (let i = 0; i < input[0].length; i++) {
            sum += Math.abs(input[0][i]) * 255;
        }
        const average = sum / input[0].length;
        const mouthValue = Math.min(1, Math.max(0, (average - this.mouthThreshold) / this.mouthBoost));

        this.port.postMessage({ jobId: this.jobId, mouthValue: mouthValue, average: average });
        this.lastUpdate = now;

        return true;
    }
}

registerProcessor('lip-sync-processor', LipSyncProcessor);
