import init, {
  NextInputKind,
  MonsGameModel,
  Location as LocationModel,
  Modifier as ModifierModel,
  Color as ColorModel,
  OutputModelKind,
} from "mons-web";

import { setupBoard, putItem, setupSquare, applyHighlights } from "./board";
import { Location, Highlight, HighlightKind } from "./models";
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
  console.log(location);
  currentInputs.push(location);
  processCurrentInputs();
}

function processCurrentInputs() {
  const gameInput = currentInputs.map(
    (input) => new LocationModel(input.i, input.j)
  );
  let output = game.process_input(gameInput);

  switch (output.kind) {
    case OutputModelKind.InvalidInput:
      currentInputs = [];
      processCurrentInputs(); // TODO: tune
      break;
    case OutputModelKind.LocationsToStartFrom:
      const startFromHighlights: Highlight[] = output
        .locations()
        .map(
          (loc) =>
            new Highlight(
              new Location(loc.i, loc.j),
              HighlightKind.TargetSuggestion,
              colors.startFromSuggestion,
              true
            )
        );
      applyHighlights(startFromHighlights);
      break;
    case OutputModelKind.NextInputOptions:
      const nextInputs = output.next_inputs();
      const nextInputHighlights = nextInputs.flatMap((input) => {
        const location = new Location(input.location.i, input.location.j);
        let color: string;
        let highlightKind:  HighlightKind;
        switch (input.kind) {
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
      applyHighlights(nextInputHighlights);

      // TODO: apply at once with others
      const selectedItemHighlight = new Highlight(currentInputs[0], HighlightKind.Selected, colors.selectedItem, false);
      applyHighlights([selectedItemHighlight]);

      break;
    case OutputModelKind.Events:
      currentInputs = [];
      console.log("events");
      break;
    default:
      console.log("unknown output kind");
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
