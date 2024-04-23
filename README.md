# mons-dot-link
`npm start`


##### using mons-web
```
import init, { MonsGameModel, Location as LocationModel, Modifier as ModifierModel, Color as ColorModel, OutputModelKind } from "mons-web";

await init();

const color = ColorModel.Black;
const modifier = ModifierModel.SelectPotion;
const location = new LocationModel(0, 5);
const fen =
  "0 0 w 0 0 0 0 0 1 n03y0xs0xd0xa0xe0xn03/n11/n11/n04xxmn01xxmn04/n03xxmn01xxmn01xxmn03/xxQn04xxUn04xxQ/n03xxMn01xxMn01xxMn03/n04xxMn01xxMn04/n11/n11/n03E0xA0xD0xS0xY0xn03";

const game = MonsGameModel.new();
const gameFromFen = MonsGameModel.from_fen(fen);
const moves = game.available_move_kinds();
const output = game.process_input([], undefined);
const outputFromFenInput = game.process_input_fen("");
const squareAt = game.square(new LocationModel(5, 5));
const itemAt = game.item(location);
const isLaterThan = game.is_later_than(fen);
const activeColor = game.active_color();
const winnerColor = game.winner_color();
const blackScore = game.black_score();
const whiteScore = game.white_score();
const locationsWithContent = game.locations_with_content();
```