import init, { MonsGameModel, Location, Modifier, Color } from "mons-web";
import { setupBoard } from "./board.js";

async function run() {
  await init();
  const color = Color.Black;
  const modifier = Modifier.SelectPotion;
  const location = new Location(10, 10);
  const fen = "0 0 w 0 0 0 0 0 1 n03y0xs0xd0xa0xe0xn03/n11/n11/n04xxmn01xxmn04/n03xxmn01xxmn01xxmn03/xxQn04xxUn04xxQ/n03xxMn01xxMn01xxMn03/n04xxMn01xxMn04/n11/n11/n03E0xA0xD0xS0xY0xn03";
  const game = MonsGameModel.from_fen(fen);

  if (fen != game.fen()) {
    throw new Error("smth is wrong with fen");
  }

  console.log(game.fen());
  console.log(color);
  console.log(modifier);
  console.log(location.i, location.j);
}

run();

setupBoard();
