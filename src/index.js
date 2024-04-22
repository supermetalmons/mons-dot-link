import init, { hello } from "mons-web";
import { setupBoard } from "./board.js";

async function run() {
  await init();
  console.log(hello());
}

run();

setupBoard();
