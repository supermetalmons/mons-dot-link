import initMonsWeb, * as MonsWeb from "mons-web";
import * as Board from "./board";
import { Location, Highlight, HighlightKind, AssistedInputKind, Sound, InputModifier, Trace } from "../utils/gameModels";
import { colors } from "../content/colors";
import { playSounds, playReaction } from "../content/sounds";
import { setupPage, sendMove, isCreateNewInviteFlow, sendEmojiUpdate, isModernAndPowerful, setVoiceReactionSelectHidden, showVoiceReactionText } from "../pageSetup";

let isWatchOnly = false;
let isOnlineGame = false;
let isReconnect = false;
let didConnect = false;

let whiteProcessedMovesCount = 0;
let blackProcessedMovesCount = 0;
let didSetWhiteProcessedMovesCount = false;
let didSetBlackProcessedMovesCount = false;

export let initialFen = "";
let game;
let playerSideColor;

let lastReactionTime = 0;
let isGameOver = false;
const processedVoiceReactions = new Set<string>();

var currentInputs: Location[] = [];

// TODO: it was called immediatelly before, now it's called after the board component is created, not sure if it's ok
export async function go() {
  setupPage();

  Board.setupBoard();

  await initMonsWeb();

  playerSideColor = MonsWeb.Color.White;
  game = MonsWeb.MonsGameModel.new();
  initialFen = game.fen();

  if (isCreateNewInviteFlow) {
    game.locations_with_content().forEach((loc) => {
      const location = new Location(loc.i, loc.j);
      updateLocation(location);
    });
  } else {
    isOnlineGame = true;
  }

  Board.setupGameInfoElements(!isCreateNewInviteFlow);
}

export function canChangeEmoji(opponents: boolean): boolean {
  if (isOnlineGame) {
    return opponents ? false : !isWatchOnly;
  } else {
    return isPlayerSideTurn() ? !opponents : opponents;
  }
}

export function updateEmoji(newId: number) {
  if (isOnlineGame && !isWatchOnly) {
    sendEmojiUpdate(newId);
  }
}

export function isPlayerSideTurn(): boolean {
  return game.active_color() === playerSideColor;
}

export function didSelectInputModifier(inputModifier: InputModifier) {
  if ((isOnlineGame && !didConnect) || isWatchOnly) {
    return;
  }
  processInput(AssistedInputKind.None, inputModifier);
}

export function didClickSquare(location: Location) {
  if ((isOnlineGame && !didConnect) || isWatchOnly) {
    return;
  }
  processInput(AssistedInputKind.None, InputModifier.None, location);
}

function applyOutput(output: MonsWeb.OutputModel, isRemoteInput: boolean, assistedInputKind: AssistedInputKind, inputLocation?: Location) {
  switch (output.kind) {
    case MonsWeb.OutputModelKind.InvalidInput:
      const shouldTryToReselect = assistedInputKind === AssistedInputKind.None && currentInputs.length > 1 && !currentInputs[0].equals(inputLocation);
      const shouldHelpFindOptions = assistedInputKind === AssistedInputKind.None && currentInputs.length === 1;
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

      if (nextInputs[0].kind === MonsWeb.NextInputKind.SelectConsumable) {
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
      if (isOnlineGame && !isRemoteInput) {
        const moveFen = output.input_fen();
        const gameFen = game.fen();
        sendMove(moveFen, gameFen);
      }

      currentInputs = [];
      const events = output.events();
      let locationsToUpdate: Location[] = [];
      let mightKeepHighlightOnLocation: Location | undefined;
      let mustReleaseHighlight = isRemoteInput;
      let sounds: Sound[] = [];
      let traces: Trace[] = [];
      let popOpponentsEmoji = false;

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
            if (event.mana.kind === MonsWeb.ManaKind.Supermana) {
              sounds.push(Sound.ScoreSupermana);
            } else {
              sounds.push(Sound.ScoreMana);
            }
            locationsToUpdate.push(from);
            mustReleaseHighlight = true;
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
            if (!isWatchOnly && isOnlineGame && isPlayerSideTurn()) {
              popOpponentsEmoji = true;
            }
            break;
          case MonsWeb.EventModelKind.GameOver:
            const isVictory = !isOnlineGame || event.color === playerSideColor;
            let winnerAlertText = (event.color === MonsWeb.Color.White ? "⚪️" : "⚫️") + "🏅";
            if (!isModernAndPowerful) {
              winnerAlertText = (event.color === MonsWeb.Color.White ? "white" : "black") + " wins";
            }

            if (isVictory) {
              sounds.push(Sound.Victory);
            } else {
              sounds.push(Sound.Defeat);
            }

            setTimeout(() => {
              alert(winnerAlertText);
            }, 420);

            isGameOver = true;

            break;
        }
      }

      Board.removeHighlights();

      const didUpdate = new Set<string>();
      for (const location of locationsToUpdate) {
        const key = location.toString();
        if (!didUpdate.has(key)) {
          didUpdate.add(key);
          updateLocation(location);
        }
      }

      Board.updateMoveStatus(game.active_color(), game.available_move_kinds());

      if (isRemoteInput) {
        for (const trace of traces) {
          Board.drawTrace(trace);
        }
      }

      playSounds(sounds);

      if (popOpponentsEmoji) {
        Board.popOpponentsEmoji();
      }

      if (mightKeepHighlightOnLocation !== undefined && !mustReleaseHighlight) {
        processInput(AssistedInputKind.KeepSelectionAfterMove, InputModifier.None, mightKeepHighlightOnLocation);
      }

      break;
  }
}

function processInput(assistedInputKind: AssistedInputKind, inputModifier: InputModifier, inputLocation?: Location) {
  if (isOnlineGame) {
    if (game.active_color() !== playerSideColor) {
      return;
    }
  }

  if (inputLocation) {
    currentInputs.push(inputLocation);
  }

  const gameInput = currentInputs.map((input) => new MonsWeb.Location(input.i, input.j));
  let output: MonsWeb.OutputModel;
  if (inputModifier !== InputModifier.None) {
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

  applyOutput(output, false, assistedInputKind, inputLocation);
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

function didConnectTo(opponentMatch: any) {
  if (!isWatchOnly) {
    setVoiceReactionSelectHidden(false);
  }

  Board.updateEmojiIfNeeded(opponentMatch.emojiId.toString(), isWatchOnly ? opponentMatch.color === "black" : true);

  if (isWatchOnly) {
    playerSideColor = MonsWeb.Color.White;
  } else {
    playerSideColor = opponentMatch.color === "white" ? MonsWeb.Color.Black : MonsWeb.Color.White;
  }

  if (!isWatchOnly) {
    Board.setBoardFlipped(opponentMatch.color === "white");
  }

  if (!isReconnect || (isReconnect && !game.is_later_than(opponentMatch.fen)) || isWatchOnly) {
    console.log("updating local game with opponent's fen");
    game = MonsWeb.MonsGameModel.from_fen(opponentMatch.fen);
  } else {
    console.log("got opponent's match, but keeping the local fen");
  }

  if (isReconnect || isWatchOnly) {
    const movesCount = opponentMatch.movesFens ? opponentMatch.movesFens.length : 0;
    setProcessedMovesCountForColor(opponentMatch.color, movesCount);
  }

  if (opponentMatch.reaction && opponentMatch.reaction.uuid) {
    processedVoiceReactions.add(opponentMatch.reaction.uuid);
  }

  isOnlineGame = true;
  currentInputs = [];

  setNewBoard();
}

function setNewBoard() {
  Board.resetForNewGame();
  Board.updateScore(game.white_score(), game.black_score());
  Board.updateMoveStatus(game.active_color(), game.available_move_kinds());

  game.locations_with_content().forEach((loc) => {
    const location = new Location(loc.i, loc.j);
    updateLocation(location);
  });
}

function getProcessedMovesCount(color: string): number {
  return color === "white" ? whiteProcessedMovesCount : blackProcessedMovesCount;
}

function setProcessedMovesCountForColor(color: string, count: number) {
  if (color === "white") {
    whiteProcessedMovesCount = count;
    didSetWhiteProcessedMovesCount = true;
  } else {
    blackProcessedMovesCount = count;
    didSetBlackProcessedMovesCount = true;
  }
}

export function didUpdateOpponentMatch(match: any) {
  if (isGameOver) {
    return;
  }

  console.log(`didUpdateOpponentMatch`, match);

  if (!didConnect) {
    didConnectTo(match);
    didConnect = true;
    if (!isReconnect) {
      playSounds([Sound.DidConnect]);
    }
    return;
  }

  const movesCount = match.movesFens ? match.movesFens.length : 0;
  if (isWatchOnly && (!didSetWhiteProcessedMovesCount || !didSetBlackProcessedMovesCount)) {
    if (!game.is_later_than(match.fen)) {
      game = MonsWeb.MonsGameModel.from_fen(match.fen);
      setNewBoard();
    }

    setProcessedMovesCountForColor(match.color, movesCount);
  }

  const processedMovesCount = getProcessedMovesCount(match.color);
  if (movesCount > processedMovesCount) {
    for (let i = processedMovesCount; i < movesCount; i++) {
      const moveFen = match.movesFens[i];
      const output = game.process_input_fen(moveFen);
      applyOutput(output, true, AssistedInputKind.None);
    }

    setProcessedMovesCountForColor(match.color, movesCount);

    if (match.fen !== game.fen()) {
      // TODO: show something is wrong alert
      console.log("fens do not match");
    } else {
      console.log("fens ok");
    }
  }

  const isOpponentSide = !isWatchOnly || match.color === "black";
  Board.updateEmojiIfNeeded(match.emojiId.toString(), isOpponentSide);

  if (match.status === "surrendered") {
    isGameOver = true;
    setTimeout(() => {
      alert(match.color + " left the game");
    }, 420);
  }

  if (!isWatchOnly && match.reaction && match.reaction.uuid && !processedVoiceReactions.has(match.reaction.uuid)) {
    processedVoiceReactions.add(match.reaction.uuid);
    const currentTime = Date.now();
    if (currentTime - lastReactionTime > 5000) {
      showVoiceReactionText(match.reaction.kind, true);
      playReaction(match.reaction);
      lastReactionTime = currentTime;
    }
  }
}

export function didRecoverMyMatch(match: any) {
  isReconnect = true;

  playerSideColor = match.color === "white" ? MonsWeb.Color.White : MonsWeb.Color.Black;
  game = MonsWeb.MonsGameModel.from_fen(match.fen);
  const movesCount = match.movesFens ? match.movesFens.length : 0;
  setProcessedMovesCountForColor(match.color, movesCount);
  Board.updateEmojiIfNeeded(match.emojiId.toString(), false);
  console.log(`didRecoverMyMatch:`, match);
}

export function enterWatchOnlyMode() {
  isWatchOnly = true;
}
