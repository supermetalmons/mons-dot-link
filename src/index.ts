import init, { NextInputKind, MonsGameModel, Location as LocationModel, Modifier as ModifierModel, Color as ColorModel, OutputModelKind, EventModelKind, OutputModel, ManaKind } from "mons-web";
import { setupBoard, putItem, setupSquare, applyHighlights, removeHighlights, removeItem, hasBasePlaceholder } from "./board";
import { Location, Highlight, HighlightKind, AssistedInputKind, Sound, InputModifier, Trace } from "./models";
import { colors } from "./colors";
import { playSounds } from "./sounds";

setupBoard();

await init();
const game = MonsGameModel.new();

const locationsWithContent = game.locations_with_content();

locationsWithContent.forEach((loc) => {
  const location = new Location(loc.i, loc.j);
  updateLocation(location);
});

var currentInputs: Location[] = [];

export function didClickSquare(location: Location) {
  processInput(AssistedInputKind.None, InputModifier.None, location);
}

function processInput(assistedInputKind: AssistedInputKind, inputModifier: InputModifier, inputLocation?: Location) {
  if (inputLocation) {
    currentInputs.push(inputLocation);
  }

  const gameInput = currentInputs.map((input) => new LocationModel(input.i, input.j));
  let output: OutputModel;
  if (inputModifier != InputModifier.None) {
    let modifier: ModifierModel
    switch (inputModifier) {
      case InputModifier.Bomb:
        modifier = ModifierModel.SelectBomb;
        break;
      case InputModifier.Potion:
        modifier = ModifierModel.SelectPotion;
        break;
      case InputModifier.Cancel:
        modifier = ModifierModel.Cancel;
        break;
      default:
        modifier = undefined;
        break;
    }
    output = game.process_input(gameInput, modifier);
  } else {
    output = game.process_input(gameInput);
  }

  switch (output.kind) {
    case OutputModelKind.InvalidInput:
      const shouldTryToReselect = assistedInputKind == AssistedInputKind.None && currentInputs.length > 1 && !currentInputs[0].equals(inputLocation);
      const shouldHelpFindOptions = assistedInputKind == AssistedInputKind.None && currentInputs.length == 1;
      currentInputs = [];
      removeHighlights();
      if (shouldTryToReselect) {
        processInput(AssistedInputKind.ReselectLastInvalidInput, InputModifier.None, inputLocation);
      } else if (shouldHelpFindOptions) {
        processInput(AssistedInputKind.FindStartLocationsAfterInvalidInput, InputModifier.None);
      }
      break;
    case OutputModelKind.LocationsToStartFrom:
      const startFromHighlights: Highlight[] = output.locations().map((loc) => new Highlight(new Location(loc.i, loc.j), HighlightKind.TargetSuggestion, colors.startFromSuggestion, true));
      removeHighlights();
      applyHighlights(startFromHighlights);
      break;
    case OutputModelKind.NextInputOptions:
      const nextInputs = output.next_inputs();

      if (nextInputs[0].kind == NextInputKind.SelectConsumable) {
        // TODO: select consumable
        processInput(AssistedInputKind.None, InputModifier.Bomb);
        return;
      }

      const nextInputHighlights = nextInputs.flatMap((input) => {
        const location = new Location(input.location.i, input.location.j);
        let color: string;
        let highlightKind: HighlightKind;
        switch (input.kind) {
          case NextInputKind.MonMove:
            highlightKind = (hasItemAt(location) || hasBasePlaceholder(location.toString())) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.destination;
            break;
          case NextInputKind.ManaMove:
            highlightKind = hasItemAt(location) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.destination;
            break;
          case NextInputKind.MysticAction:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.attackTarget;
            break;
          case NextInputKind.DemonAction:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.attackTarget;
            break;
          case NextInputKind.DemonAdditionalStep:
            highlightKind = hasBasePlaceholder(location.toString()) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.attackTarget;
            break;
          case NextInputKind.SpiritTargetCapture:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.spiritTarget;
            break;
          case NextInputKind.SpiritTargetMove:
            highlightKind = (hasItemAt(location) || hasBasePlaceholder(location.toString())) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.spiritTarget;
            break;
          case NextInputKind.SelectConsumable:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.selectedItem;
            break;
          case NextInputKind.BombAttack:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.attackTarget;
            break;
        }
        return new Highlight(location, highlightKind, color, false);
      });

      const selectedItemsHighlights = currentInputs.map((input, index) => {
        let color: string;
        if (index > 0) {
          switch (nextInputs[nextInputs.length - 1].kind) {
            case NextInputKind.DemonAdditionalStep:
              color = colors.attackTarget;
              break;
            case NextInputKind.SpiritTargetMove:
              color = colors.spiritTarget;
              break;
            default:
              color = colors.selectedItem;
              break;
          }
        } else {
          color = colors.selectedItem;
        }
        return new Highlight(input, HighlightKind.Selected, color, false);
      });

      removeHighlights();
      applyHighlights([...selectedItemsHighlights, ...nextInputHighlights]);
      break;
    case OutputModelKind.Events:
      currentInputs = [];
      const events = output.events();
      let locationsToUpdate: Location[] = [];
      let mightKeepHighlightOnLocation: Location | undefined;
      let mustReleaseHighlight = false;
      let sounds: Sound[] = [];
      let traces: Trace[] = [];

      for (const event of events) {
        const from = event.loc1 ? location(event.loc1) : undefined;
        const to = event.loc2 ? location(event.loc2) : undefined;
        switch (event.kind) {
          case EventModelKind.MonMove:
            sounds.push(Sound.Move);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            mightKeepHighlightOnLocation = to;
            traces.push(new Trace(from, to));
            break;
          case EventModelKind.ManaMove:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case EventModelKind.ManaScored:
            if (event.mana.kind == ManaKind.Supermana) {
              sounds.push(Sound.ScoreSupermana);
            } else {
              sounds.push(Sound.ScoreMana);
            }
            locationsToUpdate.push(from);
            mustReleaseHighlight = true;
            break;
          case EventModelKind.MysticAction:
            sounds.push(Sound.MysticAbility);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case EventModelKind.DemonAction:
            sounds.push(Sound.DemonAbility);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case EventModelKind.DemonAdditionalStep:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case EventModelKind.SpiritTargetMove:
            sounds.push(Sound.SpiritAbility);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case EventModelKind.PickupBomb:
            sounds.push(Sound.PickupBomb);
            locationsToUpdate.push(from);
            mustReleaseHighlight = true;
            break;
          case EventModelKind.PickupPotion:
            sounds.push(Sound.PickupPotion);
            locationsToUpdate.push(from);
            mustReleaseHighlight = true;
            break;
          case EventModelKind.PickupMana:
            sounds.push(Sound.ManaPickUp);
            locationsToUpdate.push(from);
            break;
          case EventModelKind.MonFainted:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            break;
          case EventModelKind.ManaDropped:
            locationsToUpdate.push(from);
            break;
          case EventModelKind.SupermanaBackToBase:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            break;
          case EventModelKind.BombAttack:
            sounds.push(Sound.Bomb);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case EventModelKind.MonAwake:
            locationsToUpdate.push(from);
            break;
          case EventModelKind.BombExplosion:
            sounds.push(Sound.Bomb);
            locationsToUpdate.push(from);
            break;
          case EventModelKind.NextTurn:
            sounds.push(Sound.EndTurn);
            // TODO: update for the next turn
            break;
          case EventModelKind.GameOver:
            // TODO: based on player side
            sounds.push(Sound.Victory);
            // sounds.push(Sound.Defeat);
            break;
        }
      }

      removeHighlights();

      for (const location of locationsToUpdate) {
        updateLocation(location);
        // TODO: do not update twice – keep a list of uniques
      }

      // TODO: update game status controls
      // TODO: draw traces

      playSounds(sounds);

      if (mightKeepHighlightOnLocation != undefined && !mustReleaseHighlight) {
        processInput(AssistedInputKind.KeepSelectionAfterMove, InputModifier.None, mightKeepHighlightOnLocation);
      }

      break;
  }
}

function updateLocation(location: Location) {
  removeItem(location);
  const item = game.item(new LocationModel(location.i, location.j));
  if (item !== undefined) {
    putItem(item, location);
  } else {
    const square = game.square(new LocationModel(location.i, location.j));
    if (square !== undefined) {
      setupSquare(square, location);
    }
  }
}

function location(locationModel: LocationModel): Location {
  return new Location(locationModel.i, locationModel.j);
}

function hasItemAt(location: Location): boolean {
  const item = game.item(new LocationModel(location.i, location.j));
  if (item !== undefined) {
    return true;
  } else {
    return false;
  }
}
