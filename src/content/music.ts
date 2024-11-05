const tracks = ["arploop", "band", "bell-dance", "bell-glide", "bounce", "bubble-jam", "buzz", "change", "chimes-photography_going-home", "clock-tower", "cloud-propeller-2", "cloud-propeller", "crumbs", "driver", "drreams", "ewejam", "gilded", "gustofwind", "honkshoooo-memememeee-zzzZZZ", "jelly-jam", "mana-pool", "melodine", "object", "organwhawha", "ping", "runner", "spirit-track", "super", "whale2"];

let audioElement: HTMLAudioElement | null = null;
const isMediaArtworkEnabled = false;

export function showMonsAlbumArtwork() {
  if (isMediaArtworkEnabled && "mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      artwork: [
        {
          src: `${window.location.origin}/favicon-96x96.png`,
          sizes: "34x34",
          type: "image/png",
        },
      ],
    });
  }
}

export function startPlayingMusic(): void {
  if (!audioElement) {
    audioElement = new Audio(getRandomTrackUrl());
    audioElement.addEventListener("ended", playNextTrack);
  }
  audioElement.play().catch((error) => {
    console.error("Error playing audio:", error);
  });
}

export function stopPlayingMusic(): void {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement.removeEventListener("ended", playNextTrack);
    audioElement = null;
  }
}

function playNextTrack(): void {
  if (audioElement) {
    audioElement.src = getRandomTrackUrl();
    audioElement.play().catch((error) => {
      console.error("Error playing next track:", error);
    });
  }
}

function getRandomTrackUrl(): string {
  const randomIndex = Math.floor(Math.random() * tracks.length);
  const randomTrack = tracks[randomIndex];
  return `https://assets.mons.link/music/${randomTrack}.aac`;
}
