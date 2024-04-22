import init, { Location, Modifier, Color } from "mons-web";
import { setupBoard } from "./board.js";

async function run() {
  await init();
  const color = Color.Black;
  const modifier = Modifier.SelectPotion;
  const location = new Location(10, 10);
  console.log(color);
  console.log(modifier);
  console.log(location.i, location.j);
}

run();

setupBoard();
