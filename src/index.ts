import init, { MonsGameModel, Location as LocationModel, Modifier as ModifierModel, Color as ColorModel, OutputModelKind } from "mons-web";
import { setupBoard, putItem, setupSquare, applyHighlights } from "./board";
import { Location, Highlight, HighlightKind } from "./models";
import { colors } from "./colors";

setupBoard();

await init();
const game = MonsGameModel.new();

const locationsWithContent = game.locations_with_content();

locationsWithContent.forEach(loc => {
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
  const gameInput = currentInputs.map(input => new LocationModel(input.i, input.j));
  let output = game.process_input(gameInput);

  switch (output.kind) {
    case OutputModelKind.InvalidInput:
      currentInputs = [];
      processCurrentInputs(); // TODO: tune
      break;
    case OutputModelKind.LocationsToStartFrom:
      const highlights: Highlight[] = output.locations().map(loc => (new Highlight(new Location(loc.i, loc.j), HighlightKind.TargetSuggestion, colors.startFromSuggestion, true)));
      applyHighlights(highlights);
      break;
    case OutputModelKind.NextInputOptions:

      const nextInputs = output.next_inputs;

      console.log("next input options");
      break;
    case OutputModelKind.Events:
      currentInputs = [];
      console.log("events");
      break;
    default:
      console.log("unknown output kind");
  }
}