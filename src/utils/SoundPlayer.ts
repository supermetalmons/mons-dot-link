export class SoundPlayer {
  private audioContext!: AudioContext;
  private audioBufferCache: Map<string, AudioBuffer>;
  private isInitialized: boolean;
  private silentAudio: HTMLAudioElement;

  constructor() {
    this.audioBufferCache = new Map();
    this.isInitialized = false;
    this.silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGwBtbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1t//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAARsxqNYnAAAAAAAAAAAAAAAAAAAA//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
    this.silentAudio.loop = true;
  }

  public initialize(): void {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.audioContext = new AudioContext();
      this.silentAudio.play().catch((_) => {}); // TODO: only on ios
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
    soundPlayer.initialize();
  },
  { once: true }
);

document.addEventListener(
  "click",
  async () => {
    soundPlayer.initialize();
  },
  { once: true }
);
