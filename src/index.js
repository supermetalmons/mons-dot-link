import init, { MonsGameModel, Location, Modifier, Color, OutputModelKind } from "mons-web";
import { setupBoard, blinkLocations } from "./board.js";

setupBoard();

export function didClickSquare(i, j) {
  currentInputs.push({i, j});
  processCurrentInputs();
}

await init();
const color = Color.Black;
const modifier = Modifier.SelectPotion;
const location = new Location(0, 5);
const fen =
  "0 0 w 0 0 0 0 0 1 n03y0xs0xd0xa0xe0xn03/n11/n11/n04xxmn01xxmn04/n03xxmn01xxmn01xxmn03/xxQn04xxUn04xxQ/n03xxMn01xxMn01xxMn03/n04xxMn01xxMn04/n11/n11/n03E0xA0xD0xS0xY0xn03";

const game = MonsGameModel.new();
const gameFromFen = MonsGameModel.from_fen(fen);
const moves = game.available_move_kinds();
const output = game.process_input([], undefined);
const outputFromFenInput = game.process_input_fen("");
const squareAt = game.square(new Location(5, 5));
const itemAt = game.item(location);
const isLaterThan = game.is_later_than(fen);
const activeColor = game.active_color();
const winnerColor = game.winner_color();
const blackScore = game.black_score();
const whiteScore = game.white_score();
const locationsWithContent = game.locations_with_content();

if (fen != game.fen() || fen != gameFromFen.fen()) {
  throw new Error("smth is wrong with a fen");
}

console.log("color:", color);
console.log("modifier:", modifier);
console.log("moves:", moves);
console.log("output:", output);
console.log("output from fen input:", outputFromFenInput);
console.log("square at location:", squareAt);
console.log("item at location:", itemAt);
console.log("is later than:", isLaterThan);
console.log("active color:", activeColor);
console.log("winner color:", winnerColor);
console.log("black score:", blackScore);
console.log("white score:", whiteScore);
console.log("locations with content:", locationsWithContent);

var currentInputs = [];

function processCurrentInputs() {
  const gameInput = currentInputs.map(input => new Location(input.i, input.j));
  let output = game.process_input(gameInput);

  switch (output.kind) {
    case OutputModelKind.InvalidInput:
      currentInputs = [];
      processCurrentInputs(); // TODO: tune
      console.log("invalid input");
      break;
    case OutputModelKind.LocationsToStartFrom:
      const locations = output.locations().map(loc => ({i: loc.i, j: loc.j}));
      blinkLocations(locations);
      break;
    case OutputModelKind.NextInputOptions:
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
