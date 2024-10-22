import { Sound } from "../utils/gameModels";
import { getIsMuted } from "../ui/BottomControlsActions";

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
const audioBuffers: { [key: string]: AudioBuffer } = {};
const playingSounds: { [key: string]: AudioBufferSourceNode[] } = {};
const loadingPromises: { [key: string]: Promise<AudioBuffer> } = {};

async function loadAudio(path: string): Promise<AudioBuffer> {
  if (audioBuffers[path]) {
    return audioBuffers[path];
  }

  if (loadingPromises[path]) {
    return loadingPromises[path];
  }

  loadingPromises[path] = fetch(`/assets/${path}`)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      audioBuffers[path] = audioBuffer;
      delete loadingPromises[path];
      return audioBuffer;
    });

  return loadingPromises[path];
}

function playSound(path: string) {
  if (!playingSounds[path]) {
    playingSounds[path] = [];
  }

  if (playingSounds[path].length >= 7) {
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers[path];
  source.connect(audioContext.destination);
  source.start(0);

  playingSounds[path].push(source);

  source.onended = () => {
    const index = playingSounds[path].indexOf(source);
    if (index > -1) {
      playingSounds[path].splice(index, 1);
    }
    if (playingSounds[path].length === 0) {
      delete playingSounds[path];
    }
  };
}

export async function playReaction(reaction: any) {
  if (getIsMuted()) {
    return;
  }

  const path = `reactions/${reaction.kind}${reaction.variation}.wav`;
  await loadAudio(path);
  playSound(path);
}

export function newReactionOfKind(kind: string): any {
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  let variation = 1;
  switch (kind) {
    case "yo":
      variation = Math.floor(Math.random() * 4) + 1;
      break;
    case "gg":
      variation = Math.floor(Math.random() * 2) + 1;
      break;
    case "wahoo":
    case "drop":
    case "slurp":
      variation = 1;
      break;
  }
  return { uuid: uuid, variation: variation, kind: kind };
}

export async function playSounds(sounds: Sound[]) {
  if (getIsMuted()) {
    return;
  }

  const maxSoundPriority = Math.max(...sounds.map((sound) => getSoundPriority(sound)));
  sounds = sounds.filter((sound) => getSoundPriority(sound) === maxSoundPriority || sound === Sound.EndTurn);

  for (const sound of sounds) {
    let name: string;
    switch (sound) {
      case Sound.Bomb:
        name = "bomb";
        break;
      case Sound.Click:
        name = "click";
        break;
      case Sound.DemonAbility:
        name = "demonAbility";
        break;
      case Sound.ManaPickUp:
        name = "manaPickUp";
        break;
      case Sound.Move:
        name = "move";
        break;
      case Sound.EndTurn:
        name = "endTurn";
        break;
      case Sound.MysticAbility:
        name = "mysticAbility";
        break;
      case Sound.PickupPotion:
        name = "pickupPotion";
        break;
      case Sound.PickupBomb:
        name = "pickupBomb";
        break;
      case Sound.ChoosePickup:
        name = "choosePickup";
        break;
      case Sound.ScoreMana:
        name = "scoreMana";
        break;
      case Sound.ScoreSupermana:
        name = "scoreSuperMana";
        break;
      case Sound.SpiritAbility:
        name = "spiritAbility";
        break;
      case Sound.Victory:
        name = "victory";
        break;
      case Sound.Defeat:
        name = "defeat";
        break;
      case Sound.DidConnect:
        name = "didConnect";
        break;
      case Sound.Undo:
        name = "undo";
        break;
    }

    const path = `sounds/${name}.wav`;
    await loadAudio(path);
    playSound(path);
  }
}

const getSoundPriority = (sound: Sound) => {
  switch (sound) {
    case Sound.Click:
    case Sound.EndTurn:
    case Sound.Move:
    case Sound.DidConnect:
      return 0;
    case Sound.ManaPickUp:
    case Sound.ChoosePickup:
    case Sound.MysticAbility:
    case Sound.SpiritAbility:
    case Sound.DemonAbility:
    case Sound.Bomb:
    case Sound.PickupBomb:
    case Sound.PickupPotion:
      return 1;
    case Sound.ScoreMana:
    case Sound.ScoreSupermana:
    case Sound.Victory:
    case Sound.Defeat:
    case Sound.Undo:
      return 2;
  }
};
