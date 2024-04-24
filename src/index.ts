import init, { NextInputKind, MonsGameModel, Location as LocationModel, Modifier as ModifierModel, Color as ColorModel, OutputModelKind, EventModelKind } from "mons-web";
import { setupBoard, putItem, setupSquare, applyHighlights, removeHighlights } from "./board";
import { Location, Highlight, HighlightKind, AssistedInputKind, Sound, InputModifier } from "./models";
import { colors } from "./colors";

setupBoard();

await init();
const game = MonsGameModel.new();

const locationsWithContent = game.locations_with_content();

locationsWithContent.forEach((loc) => {
  const location = new Location(loc.i, loc.j);
  const item = game.item(new LocationModel(location.i, location.j));
  if (item !== undefined) {
    putItem(item, location);
  } else {
    const square = game.square(new LocationModel(location.i, location.j));
    if (square !== undefined) {
      setupSquare(square, location);
    }
  }
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
  let output = game.process_input(gameInput);

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
      // TODO: handle select bomb or potion
      const nextInputHighlights = nextInputs.flatMap((input) => {
        const location = new Location(input.location.i, input.location.j);
        let color: string;
        let highlightKind: HighlightKind;
        switch (input.kind) {
          // TODO: different style for mons bases
          case NextInputKind.MonMove:
            highlightKind = hasItemAt(location) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
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
            highlightKind = HighlightKind.EmptySquare;
            color = colors.attackTarget;
            break;
          case NextInputKind.SpiritTargetCapture:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.spiritTarget;
            break;
          case NextInputKind.SpiritTargetMove:
            highlightKind = hasItemAt(location) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.spiritTarget;
            break;
          case NextInputKind.SelectConsumable:
            return [];
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

      for (const event of events) {
        switch (event.kind) {
          case EventModelKind.MonMove:
            break;
          case EventModelKind.ManaMove:
            break;
          case EventModelKind.ManaScored:
            break;
          case EventModelKind.MysticAction:
            break;
          case EventModelKind.DemonAction:
            break;
          case EventModelKind.DemonAdditionalStep:
            break;
          case EventModelKind.SpiritTargetMove:
            break;
          case EventModelKind.PickupBomb:
            break;
          case EventModelKind.PickupPotion:
            break;
          case EventModelKind.PickupMana:
            break;
          case EventModelKind.MonFainted:
            break;
          case EventModelKind.ManaDropped:
            break;
          case EventModelKind.SupermanaBackToBase:
            break;
          case EventModelKind.BombAttack:
            break;
          case EventModelKind.MonAwake:
            break;
          case EventModelKind.BombExplosion:
            break;
          case EventModelKind.NextTurn:
            break;
          case EventModelKind.GameOver:
            break;
        }
      }

      removeHighlights();
      break;
  }
}

function hasItemAt(location: Location): boolean {
  const item = game.item(new LocationModel(location.i, location.j));
  if (item !== undefined) {
    return true;
  } else {
    return false;
  }
}
