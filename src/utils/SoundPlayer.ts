import { showMonsAlbumArtwork } from "../content/music";
import { getIsMuted } from "../ui/BottomControlsActions";
import { isMobileOrVision } from "./misc";

export class SoundPlayer {
  private audioContext!: AudioContext;
  private audioBufferCache: Map<string, AudioBuffer>;
  private isInitialized: boolean;
  private silentAudio: HTMLAudioElement | null;

  constructor() {
    this.audioBufferCache = new Map();
    this.isInitialized = false;
    this.silentAudio = null;
  }

  createSilentAudioDataUrl(durationInSeconds: number) {
    const sampleRate = 8000;
    const numOfChannels = 1;
    const bitsPerSample = 8;

    const totalSamples = sampleRate * durationInSeconds;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = totalSamples * blockAlign;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, "WAVE");
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    this.writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    const offset = 44;
    const silentValue = 128;
    for (let i = 0; i < totalSamples; i++) {
      view.setUint8(offset + i, silentValue);
    }

    const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `data:audio/wav;base64,${base64String}`;
  }

  writeString(view: any, offset: any, string: any) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  public initialize(force: boolean): void {
    if (!this.isInitialized && (force || !getIsMuted() || !isMobileOrVision)) {
      if (isMobileOrVision) {
        const silentAudioUrl = this.createSilentAudioDataUrl(3);
        this.silentAudio = new Audio(silentAudioUrl);
        this.silentAudio.loop = true;
        this.silentAudio.volume = 0.01;
      }

      this.startSilentAudioIfNeeded();
      this.audioContext = new AudioContext();
      this.isInitialized = true;
    }
  }

  private startSilentAudioIfNeeded() {
    if (!getIsMuted() && isMobileOrVision) {
      this.silentAudio?.play().catch((_) => {});
      showMonsAlbumArtwork();
    }
  }

  private pauseSilentAudioIfNeeded() {
    if (isMobileOrVision) {
      this.silentAudio?.pause();
    }
  }

  public didBecomeMuted(muted: boolean) {
    if (muted) {
      this.pauseSilentAudioIfNeeded();
    } else {
      this.startSilentAudioIfNeeded();
    }
  }

  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    if (this.audioBufferCache.has(url)) {
      return this.audioBufferCache.get(url)!;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioBufferCache.set(url, audioBuffer);
    return audioBuffer;
  }

  public async playSound(url: string): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    const audioBuffer = await this.loadAudioBuffer(url);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }
}

export const soundPlayer = new SoundPlayer();

document.addEventListener(
  "touchend",
  async () => {
    soundPlayer.initialize(false);
  },
  { once: true }
);

document.addEventListener(
  "click",
  async () => {
    soundPlayer.initialize(false);
  },
  { once: true }
);
