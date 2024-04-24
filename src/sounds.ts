import { Sound } from "./models";

export function playSounds(sounds: Sound[]) {
  // TODO: prioritize
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
        name = "scoreSupermana";
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
    }
    const audio = new Audio(`./assets/sounds/${name}.wav`);
    audio.play();
  }
}
