import initMonsWeb, * as MonsWeb from "mons-web";
import * as Board from "./board";
import { Location, Highlight, HighlightKind, AssistedInputKind, Sound, InputModifier, Trace } from "./helpers/game-models";
import { colors } from "./helpers/colors";
import { playSounds } from "./helpers/sounds";
import { tunePage } from "./helpers/browser";

tunePage();
Board.setupBoard();
Board.decorateBoard();

await initMonsWeb();
const game = MonsWeb.MonsGameModel.new();

const locationsWithContent = game.locations_with_content();

locationsWithContent.forEach((loc) => {
  const location = new Location(loc.i, loc.j);
  updateLocation(location);
});

Board.setupGameInfoElements();

var currentInputs: Location[] = [];

export function isPlayerSideTurn(): boolean {
  return game.active_color() == MonsWeb.Color.White;
}

export function didSelectInputModifier(inputModifier: InputModifier) {
  processInput(AssistedInputKind.None, inputModifier);
}

export function didClickSquare(location: Location) {
  processInput(AssistedInputKind.None, InputModifier.None, location);
}

function processInput(assistedInputKind: AssistedInputKind, inputModifier: InputModifier, inputLocation?: Location) {
  const opponentsTurn = game.active_color() == MonsWeb.Color.Black;

  if (inputLocation) {
    currentInputs.push(inputLocation);
  }

  const gameInput = currentInputs.map((input) => new MonsWeb.Location(input.i, input.j));
  let output: MonsWeb.OutputModel;
  if (inputModifier != InputModifier.None) {
    let modifier: MonsWeb.Modifier;
    switch (inputModifier) {
      case InputModifier.Bomb:
        modifier = MonsWeb.Modifier.SelectBomb;
        break;
      case InputModifier.Potion:
        modifier = MonsWeb.Modifier.SelectPotion;
        break;
      case InputModifier.Cancel:
        currentInputs = [];
        return;
    }
    output = game.process_input(gameInput, modifier);
  } else {
    output = game.process_input(gameInput);
  }

  switch (output.kind) {
    case MonsWeb.OutputModelKind.InvalidInput:
      const shouldTryToReselect = assistedInputKind == AssistedInputKind.None && currentInputs.length > 1 && !currentInputs[0].equals(inputLocation);
      const shouldHelpFindOptions = assistedInputKind == AssistedInputKind.None && currentInputs.length == 1;
      currentInputs = [];
      Board.removeHighlights();
      if (shouldTryToReselect) {
        processInput(AssistedInputKind.ReselectLastInvalidInput, InputModifier.None, inputLocation);
      } else if (shouldHelpFindOptions) {
        processInput(AssistedInputKind.FindStartLocationsAfterInvalidInput, InputModifier.None);
      }
      break;
    case MonsWeb.OutputModelKind.LocationsToStartFrom:
      const startFromHighlights: Highlight[] = output.locations().map((loc) => new Highlight(new Location(loc.i, loc.j), HighlightKind.StartFromSuggestion, colors.startFromSuggestion));
      Board.removeHighlights();
      Board.applyHighlights(startFromHighlights);
      break;
    case MonsWeb.OutputModelKind.NextInputOptions:
      const nextInputs = output.next_inputs();

      if (nextInputs[0].kind == MonsWeb.NextInputKind.SelectConsumable) {
        Board.removeHighlights();
        Board.showItemSelection();
        return;
      }

      const nextInputHighlights = nextInputs.flatMap((input) => {
        const location = new Location(input.location.i, input.location.j);
        let color: string;
        let highlightKind: HighlightKind;
        switch (input.kind) {
          case MonsWeb.NextInputKind.MonMove:
            highlightKind = hasItemAt(location) || Board.hasBasePlaceholder(location) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.destination;
            break;
          case MonsWeb.NextInputKind.ManaMove:
            highlightKind = hasItemAt(location) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.destination;
            break;
          case MonsWeb.NextInputKind.MysticAction:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.attackTarget;
            break;
          case MonsWeb.NextInputKind.DemonAction:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.attackTarget;
            break;
          case MonsWeb.NextInputKind.DemonAdditionalStep:
            highlightKind = Board.hasBasePlaceholder(location) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.attackTarget;
            break;
          case MonsWeb.NextInputKind.SpiritTargetCapture:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.spiritTarget;
            break;
          case MonsWeb.NextInputKind.SpiritTargetMove:
            highlightKind = hasItemAt(location) || Board.hasBasePlaceholder(location) ? HighlightKind.TargetSuggestion : HighlightKind.EmptySquare;
            color = colors.spiritTarget;
            break;
          case MonsWeb.NextInputKind.SelectConsumable:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.selectedItem;
            break;
          case MonsWeb.NextInputKind.BombAttack:
            highlightKind = HighlightKind.TargetSuggestion;
            color = colors.attackTarget;
            break;
        }
        return new Highlight(location, highlightKind, color);
      });

      const selectedItemsHighlights = currentInputs.map((input, index) => {
        let color: string;
        if (index > 0) {
          switch (nextInputs[nextInputs.length - 1].kind) {
            case MonsWeb.NextInputKind.DemonAdditionalStep:
              color = colors.attackTarget;
              break;
            case MonsWeb.NextInputKind.SpiritTargetMove:
              color = colors.spiritTarget;
              break;
            default:
              color = colors.selectedItem;
              break;
          }
        } else {
          color = colors.selectedItem;
        }
        return new Highlight(input, HighlightKind.Selected, color);
      });

      Board.removeHighlights();
      Board.applyHighlights([...selectedItemsHighlights, ...nextInputHighlights]);
      break;
    case MonsWeb.OutputModelKind.Events:
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
          case MonsWeb.EventModelKind.MonMove:
            sounds.push(Sound.Move);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            mightKeepHighlightOnLocation = to;
            traces.push(new Trace(from, to));
            break;
          case MonsWeb.EventModelKind.ManaMove:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case MonsWeb.EventModelKind.ManaScored:
            if (event.mana.kind == MonsWeb.ManaKind.Supermana) {
              sounds.push(Sound.ScoreSupermana);
            } else {
              sounds.push(Sound.ScoreMana);
            }
            locationsToUpdate.push(from);
            mustReleaseHighlight = true;
            // TODO: based on player side
            Board.updateScore(game.white_score(), game.black_score());
            break;
          case MonsWeb.EventModelKind.MysticAction:
            sounds.push(Sound.MysticAbility);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case MonsWeb.EventModelKind.DemonAction:
            sounds.push(Sound.DemonAbility);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case MonsWeb.EventModelKind.DemonAdditionalStep:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case MonsWeb.EventModelKind.SpiritTargetMove:
            sounds.push(Sound.SpiritAbility);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case MonsWeb.EventModelKind.PickupBomb:
            sounds.push(Sound.PickupBomb);
            locationsToUpdate.push(from);
            mustReleaseHighlight = true;
            break;
          case MonsWeb.EventModelKind.PickupPotion:
            sounds.push(Sound.PickupPotion);
            locationsToUpdate.push(from);
            mustReleaseHighlight = true;
            break;
          case MonsWeb.EventModelKind.PickupMana:
            sounds.push(Sound.ManaPickUp);
            locationsToUpdate.push(from);
            break;
          case MonsWeb.EventModelKind.MonFainted:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            break;
          case MonsWeb.EventModelKind.ManaDropped:
            locationsToUpdate.push(from);
            break;
          case MonsWeb.EventModelKind.SupermanaBackToBase:
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            break;
          case MonsWeb.EventModelKind.BombAttack:
            sounds.push(Sound.Bomb);
            locationsToUpdate.push(from);
            locationsToUpdate.push(to);
            traces.push(new Trace(from, to));
            break;
          case MonsWeb.EventModelKind.MonAwake:
            locationsToUpdate.push(from);
            break;
          case MonsWeb.EventModelKind.BombExplosion:
            sounds.push(Sound.Bomb);
            locationsToUpdate.push(from);
            break;
          case MonsWeb.EventModelKind.NextTurn:
            sounds.push(Sound.EndTurn);
            // TODO: update for the next turn
            break;
          case MonsWeb.EventModelKind.GameOver:
            // TODO: based on player side
            sounds.push(Sound.Victory);
            // sounds.push(Sound.Defeat);
            break;
        }
      }

      Board.removeHighlights();

      for (const location of locationsToUpdate) {
        updateLocation(location);
        // TODO: do not update twice – keep a list of uniques
      }

      Board.updateMoveStatus(game.active_color(), game.available_move_kinds());

      if (opponentsTurn) {
        for (const trace of traces) {
          Board.drawTrace(trace);
        }
      }

      playSounds(sounds);

      if (mightKeepHighlightOnLocation != undefined && !mustReleaseHighlight) {
        processInput(AssistedInputKind.KeepSelectionAfterMove, InputModifier.None, mightKeepHighlightOnLocation);
      }

      break;
  }
}

function updateLocation(location: Location) {
  Board.removeItem(location);
  const item = game.item(new MonsWeb.Location(location.i, location.j));
  if (item !== undefined) {
    Board.putItem(item, location);
  } else {
    const square = game.square(new MonsWeb.Location(location.i, location.j));
    if (square !== undefined) {
      Board.setupSquare(square, location);
    }
  }
}

function location(locationModel: MonsWeb.Location): Location {
  return new Location(locationModel.i, locationModel.j);
}

function hasItemAt(location: Location): boolean {
  const item = game.item(new MonsWeb.Location(location.i, location.j));
  if (item !== undefined) {
    return true;
  } else {
    return false;
  }
}
