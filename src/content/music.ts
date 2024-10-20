const tracks = [
  "arploop",
  "band",
  "bell-dance",
  "bell-glide",
  "bounce",
  "bubble-jam",
  "buzz",
  "change",
  "chimes-photography_going-home",
  "clock-tower",
  "cloud-propeller-2",
  "cloud-propeller",
  "crumbs",
  "driver",
  "drreams",
  "ewejam",
  "gilded",
  "gustofwind",
  "honkshoooo-memememeee-zzzZZZ",
  "jelly-jam",
  "mana-pool",
  "melodine",
  "object",
  "organwhawha",
  "ping",
  "runner",
  "spirit-track",
  "super",
  "whale2"
];

export function getRandomTrackUrl(): string {
  const randomIndex = Math.floor(Math.random() * tracks.length);
  const randomTrack = tracks[randomIndex];
  return `https://assets.mons.link/music/${randomTrack}.aac`;
}
