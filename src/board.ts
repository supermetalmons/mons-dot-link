import * as MonsWeb from "mons-web";
import * as SVG from "./helpers/svg";
import { didClickSquare, didSelectInputModifier, isPlayerSideTurn } from "./index";
import { Highlight, HighlightKind, InputModifier, Location, Sound, Trace } from "./helpers/game-models";
import { colors } from "./helpers/colors";
import { isDesktopSafari, isModernAndPowerful } from "./helpers/browser";
import { playSounds } from "./helpers/sounds";

const assets = (await import("./helpers/assets")).assets;
const board = document.getElementById("monsboard");
const highlightsLayer = document.getElementById("highlightsLayer");
const itemsLayer = document.getElementById("itemsLayer");
const controlsLayer = document.getElementById("controlsLayer");
const items: { [key: string]: SVGElement } = {};
const basesPlaceholders: { [key: string]: SVGElement } = {};
const wavesFrames: { [key: string]: SVGElement } = {};

const opponentMoveStatusItems: SVGElement[] = [];
const playerMoveStatusItems: SVGElement[] = [];

let isFlipped = false;
let traceIndex = 0;

let itemSelectionOverlay: SVGElement | undefined;
let opponentScoreText: SVGElement | undefined;
let playerScoreText: SVGElement | undefined;

let currentPlayerEmojiId = "";
let currentOpponentEmojiId = "";

const drainer = loadImage(assets.drainer);
const angel = loadImage(assets.angel);
const demon = loadImage(assets.demon);
const spirit = loadImage(assets.spirit);
const mystic = loadImage(assets.mystic);
const mana = loadImage(assets.mana);
const drainerB = loadImage(assets.drainerB);
const angelB = loadImage(assets.angelB);
const demonB = loadImage(assets.demonB);
const spiritB = loadImage(assets.spiritB);
const mysticB = loadImage(assets.mysticB);
const manaB = loadImage(assets.manaB);
const bombOrPotion = loadImage(assets.bombOrPotion);
const bomb = loadImage(assets.bomb);
const supermana = loadImage(assets.supermana);
const supermanaSimple = loadImage(assets.supermanaSimple);
const emojis = (await import("./helpers/emojis")).emojis;

export function updateMoveStatus(color: MonsWeb.Color, moveKinds: Int32Array) {
  const monMoves = moveKinds[0];
  let manaMoves = moveKinds[1];
  let actions = moveKinds[2];
  let potions = moveKinds[3];

  const total = monMoves + manaMoves + actions + potions;

  const playerSideActive = isFlipped ? color == MonsWeb.Color.White : color == MonsWeb.Color.Black;

  const itemsToHide = playerSideActive ? playerMoveStatusItems : opponentMoveStatusItems;
  const itemsToSetup = playerSideActive ? opponentMoveStatusItems : playerMoveStatusItems;

  for (const item of itemsToHide) {
    SVG.setHidden(item, true);
  }
  for (const [index, item] of itemsToSetup.entries()) {
    if (index < total) {
      SVG.setHidden(item, false);
      if (manaMoves > 0) {
        SVG.setImage(item, emojis.statusMana);
        manaMoves -= 1;
      } else if (potions > 0) {
        SVG.setImage(item, emojis.statusPotion);
        potions -= 1;
      } else if (actions > 0) {
        SVG.setImage(item, emojis.statusAction);
        actions -= 1;
      } else {
        SVG.setImage(item, emojis.statusMove);
      }
    } else {
      SVG.setHidden(item, true);
    }
  }
}

export function removeItem(location: Location) {
  location = inBoardCoordinates(location);
  const locationKey = location.toString();
  const toRemove = items[locationKey];
  if (toRemove !== undefined) {
    toRemove.remove();
    delete items[locationKey];
  }
}

export function updateScore(player: number, opponent: number) {
  playerScoreText.textContent = player.toString();
  opponentScoreText.textContent = opponent.toString();
}

export function showItemSelection() {
  const overlay = document.createElementNS(SVG.ns, "g");
  itemSelectionOverlay = overlay;

  const background = document.createElementNS(SVG.ns, "rect");
  SVG.setOrigin(background, 0, 1);
  SVG.setSizeStr(background, "100%", "11");
  SVG.setFill(background, colors.itemSelectionBackground);
  background.style.backdropFilter = "blur(1px)";
  overlay.appendChild(background);

  const bombButton = document.createElementNS(SVG.ns, "image");
  SVG.setImage(bombButton, assets.bomb);
  SVG.setFrameStr(bombButton, "25%", "40%", "20%", "20%");
  bombButton.addEventListener("click", (event) => {
    event.stopPropagation();
    didSelectInputModifier(InputModifier.Bomb);
    overlay.remove();
  });
  overlay.appendChild(bombButton);

  const potionButton = document.createElementNS(SVG.ns, "image");
  SVG.setImage(potionButton, assets.potion);
  SVG.setFrameStr(potionButton, "55%", "40%", "20%", "20%");
  potionButton.addEventListener("click", (event) => {
    event.stopPropagation();
    didSelectInputModifier(InputModifier.Potion);
    overlay.remove();
  });
  overlay.appendChild(potionButton);

  background.addEventListener("click", (event) => {
    event.stopPropagation();
    didSelectInputModifier(InputModifier.Cancel);
    overlay.remove();
  });

  itemsLayer.appendChild(overlay);
}

export function putItem(item: MonsWeb.ItemModel, location: Location) {
  switch (item.kind) {
    case MonsWeb.ItemModelKind.Mon:
      const isBlack = item.mon.color == MonsWeb.Color.Black;
      const isFainted = item.mon.is_fainted();
      switch (item.mon.kind) {
        case MonsWeb.MonKind.Demon:
          placeItem(isBlack ? demonB : demon, location, isFainted);
          break;
        case MonsWeb.MonKind.Drainer:
          placeItem(isBlack ? drainerB : drainer, location, isFainted);
          break;
        case MonsWeb.MonKind.Angel:
          placeItem(isBlack ? angelB : angel, location, isFainted);
          break;
        case MonsWeb.MonKind.Spirit:
          placeItem(isBlack ? spiritB : spirit, location, isFainted);
          break;
        case MonsWeb.MonKind.Mystic:
          placeItem(isBlack ? mysticB : mystic, location, isFainted);
          break;
      }
      break;
    case MonsWeb.ItemModelKind.Mana:
      switch (item.mana.kind) {
        case MonsWeb.ManaKind.Regular:
          const isBlack = item.mana.color == MonsWeb.Color.Black;
          placeItem(isBlack ? manaB : mana, location);
          break;
        case MonsWeb.ManaKind.Supermana:
          placeItem(supermana, location);
          break;
      }
      break;
    case MonsWeb.ItemModelKind.MonWithMana:
      const isBlackDrainer = item.mon.color == MonsWeb.Color.Black;
      const isSupermana = item.mana.kind == MonsWeb.ManaKind.Supermana;
      if (isSupermana) {
        placeMonWithSupermana(isBlackDrainer ? drainerB : drainer, location);
      } else {
        const isBlackMana = item.mana.color == MonsWeb.Color.Black;
        placeMonWithMana(isBlackDrainer ? drainerB : drainer, isBlackMana ? manaB : mana, location);
      }
      break;
    case MonsWeb.ItemModelKind.MonWithConsumable:
      const isBlackWithConsumable = item.mon.color == MonsWeb.Color.Black;
      switch (item.mon.kind) {
        case MonsWeb.MonKind.Demon:
          placeMonWithBomb(isBlackWithConsumable ? demonB : demon, location);
          break;
        case MonsWeb.MonKind.Drainer:
          placeMonWithBomb(isBlackWithConsumable ? drainerB : drainer, location);
          break;
        case MonsWeb.MonKind.Angel:
          placeMonWithBomb(isBlackWithConsumable ? angelB : angel, location);
          break;
        case MonsWeb.MonKind.Spirit:
          placeMonWithBomb(isBlackWithConsumable ? spiritB : spirit, location);
          break;
        case MonsWeb.MonKind.Mystic:
          placeMonWithBomb(isBlackWithConsumable ? mysticB : mystic, location);
          break;
      }
      break;
    case MonsWeb.ItemModelKind.Consumable:
      placeItem(bombOrPotion, location, false, true);
      break;
  }
}

export function setupSquare(square: MonsWeb.SquareModel, location: Location) {
  if (square.kind == MonsWeb.SquareModelKind.MonBase) {
    const isBlack = square.color == MonsWeb.Color.Black;
    switch (square.mon_kind) {
      case MonsWeb.MonKind.Demon:
        setBase(isBlack ? demonB : demon, location);
        break;
      case MonsWeb.MonKind.Drainer:
        setBase(isBlack ? drainerB : drainer, location);
        break;
      case MonsWeb.MonKind.Angel:
        setBase(isBlack ? angelB : angel, location);
        break;
      case MonsWeb.MonKind.Spirit:
        setBase(isBlack ? spiritB : spirit, location);
        break;
      case MonsWeb.MonKind.Mystic:
        setBase(isBlack ? mysticB : mystic, location);
        break;
    }
  }
}

export async function setupGameInfoElements() {
  const statusMove = loadImage(emojis.statusMove);

  const shouldOffsetFromBorders = window.innerWidth / window.innerHeight < 0.72;
  const offsetX = shouldOffsetFromBorders ? 0.21 : 0;
  const [playerEmojiId, playerEmoji] = emojis.getRandomEmoji();
  const [opponentEmojiId, opponentEmoji] = emojis.getRandomEmojiOtherThan(playerEmojiId);

  currentPlayerEmojiId = playerEmojiId;
  currentOpponentEmojiId = opponentEmojiId;

  for (const isOpponent of [true, false]) {
    const y = isOpponent ? 0.333 : 12.169;
    const avatarOffsetY = isOpponent ? 0.23 : -0.1;
    const avatarSize = 0.777;

    const numberText = document.createElementNS(SVG.ns, "text");
    SVG.setOrigin(numberText, offsetX + avatarSize + 0.21, y + 0.55 - avatarOffsetY + (isOpponent ? 0.013 : 0));
    SVG.setFill(numberText, colors.scoreText);
    SVG.setOpacity(numberText, 0.69);
    numberText.setAttribute("font-size", "0.5");
    numberText.setAttribute("font-weight", "600");
    numberText.textContent = "0";
    controlsLayer.append(numberText);
    if (isOpponent) {
      opponentScoreText = numberText;
    } else {
      playerScoreText = numberText;
    }

    const statusItemsOffsetX = shouldOffsetFromBorders ? 0.15 : 0;
    const statusItemsOffsetY = isOpponent ? 0.1 : -0.155;
    for (let x = 0; x < 9; x++) {
      const img = statusMove.cloneNode() as SVGElement;
      SVG.setFrame(img, 10.5 - x * 0.55 - statusItemsOffsetX, y - statusItemsOffsetY, 0.5, 0.5);
      controlsLayer.appendChild(img);

      if (isOpponent) {
        opponentMoveStatusItems.push(img);
      } else {
        playerMoveStatusItems.push(img);
      }

      const isActiveSide = isFlipped ? isOpponent : !isOpponent;
      if (isActiveSide) {
        if (x > 4) {
          SVG.setHidden(img, true);
        }
      } else {
        SVG.setHidden(img, true);
      }
    }

    const avatar = loadImage(isOpponent ? opponentEmoji : playerEmoji);
    avatar.style.pointerEvents = "auto";
    SVG.setFrame(avatar, offsetX, y - avatarOffsetY, avatarSize, avatarSize);
    controlsLayer.append(avatar);

    avatar.addEventListener("click", (event) => {
      event.stopPropagation();

      const playerSideActive = isFlipped ? !isPlayerSideTurn() : isPlayerSideTurn();

      if (isOpponent) {
        if (!playerSideActive) {
          const [newId, newEmoji] = emojis.getRandomEmojiOtherThan(currentOpponentEmojiId);
          currentOpponentEmojiId = newId;
          SVG.setImage(avatar, newEmoji);
          playSounds([Sound.Click]);
        }

        if (!isModernAndPowerful) { return; }

        avatar.style.transition = "transform 0.3s";
        avatar.style.transform = "scale(1.8)";
        setTimeout(() => {
          avatar.style.transform = "scale(1)";
        }, 300);
      } else {
        if (playerSideActive) {
          const [newId, newEmoji] = emojis.getRandomEmojiOtherThan(currentPlayerEmojiId);
          currentPlayerEmojiId = newId;
          SVG.setImage(avatar, newEmoji);
          playSounds([Sound.Click]);
        }

        if (!isModernAndPowerful) { return; }

        if (isDesktopSafari) {
          const scale = 1.8;
          const sizeString = avatarSize.toString();
          const newSizeString = (avatarSize * scale).toString();

          avatar.animate(
            [
              {
                width: sizeString,
                height: sizeString,
                transform: "translate(0, 0)",
                easing: "ease-out",
              },
              {
                width: newSizeString,
                height: newSizeString,
                transform: `translate(0px, -0.77pt)`,
                easing: "ease-in-out",
              },
              {
                width: sizeString,
                height: sizeString,
                transform: "translate(0, 0)",
                easing: "ease-in",
              },
            ],
            {
              duration: 420,
              fill: "forwards",
            }
          );
        } else {
          avatar.style.transformOrigin = "0px 13px";
          avatar.style.transform = "scale(1.8)";
          avatar.style.transition = "transform 0.3s";
          setTimeout(() => {
            avatar.style.transform = "scale(1)";
          }, 300);
        }
      }
    });
  }
}

export function setupBoard() {
  document.addEventListener("click", function (event) {
    const target = event.target as SVGElement;
    if (target && target.nodeName === "rect" && target.classList.contains("board-rect")) {
      const x = parseInt(target.getAttribute("x") || "-1");
      const rawY = parseInt(target.getAttribute("y") || "-1") - 1;

      const y = isFlipped ? 10 - rawY : rawY;

      didClickSquare(new Location(y, x));
      event.preventDefault();
      event.stopPropagation();
    } else if (!target.closest("a, button")) {
      if (itemSelectionOverlay) {
        itemSelectionOverlay.remove();
      }
      didClickSquare(new Location(-1, -1));
      event.preventDefault();
      event.stopPropagation();
    }
  });

  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      const rect = document.createElementNS(SVG.ns, "rect");
      SVG.setFrame(rect, x, y + 1, 1, 1);
      SVG.setFill(rect, "transparent");
      rect.classList.add("board-rect");
      itemsLayer.appendChild(rect);
    }
  }

  for (const location of [new Location(0, 0), new Location(10, 0), new Location(0, 10), new Location(10, 10)]) {
    addWaves(location);
  }
}

export function removeHighlights() {
  while (highlightsLayer.firstChild) {
    highlightsLayer.removeChild(highlightsLayer.firstChild);
  }
}

export function applyHighlights(highlights: Highlight[]) {
  highlights.forEach((highlight) => {
    switch (highlight.kind) {
      case HighlightKind.Selected:
        highlightSelectedItem(highlight.location, highlight.color);
        break;
      case HighlightKind.EmptySquare:
        highlightEmptyDestination(highlight.location, highlight.color);
        break;
      case HighlightKind.TargetSuggestion:
        highlightDestinationItem(highlight.location, highlight.color);
        break;
      case HighlightKind.StartFromSuggestion:
        highlightStartFromSuggestion(highlight.location, highlight.color);
        break;
    }
  });
}

export function drawTrace(trace: Trace) {
  const from = inBoardCoordinates(trace.from);
  const to = inBoardCoordinates(trace.to);

  const gradient = document.createElementNS(SVG.ns, "linearGradient");
  gradient.setAttribute("id", `trace-gradient-${from.toString()}-${to.toString()}`);
  const colors = getTraceColors();

  const stop1 = document.createElementNS(SVG.ns, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", colors[1]);
  gradient.appendChild(stop1);

  const stop2 = document.createElementNS(SVG.ns, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", colors[0]);
  gradient.appendChild(stop2);
  board.appendChild(gradient);

  const rect = document.createElementNS(SVG.ns, "rect");
  const fromCenter = { x: from.j + 0.5, y: from.i + 0.5 };
  const toCenter = { x: to.j + 0.5, y: to.i + 0.5 };
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const transform = `translate(${fromCenter.x},${fromCenter.y}) rotate(${angle})`;

  SVG.setFrame(rect, 0, -0.1, length, 0.2);
  rect.setAttribute("transform", transform);

  SVG.setFill(rect, `url(#trace-gradient-${from.toString()}-${to.toString()})`);
  board.append(rect);

  const fadeOut = rect.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 2000,
    easing: "ease-out",
  });

  fadeOut.onfinish = () => {
    rect.remove();
    gradient.remove();
  };
}

export function hasBasePlaceholder(location: Location): boolean {
  location = inBoardCoordinates(location);
  const key = location.toString();
  return basesPlaceholders.hasOwnProperty(key);
}

function loadImage(data: string) {
  const image = document.createElementNS(SVG.ns, "image");
  SVG.setImage(image, data);
  SVG.setSize(image, 1, 1);
  image.setAttribute("class", "item");
  return image;
}

function placeMonWithBomb(item: SVGElement, location: Location) {
  location = inBoardCoordinates(location);
  const img = item.cloneNode() as SVGElement;
  SVG.setOrigin(img, location.j, location.i);

  const carriedBomb = bomb.cloneNode() as SVGElement;
  SVG.setFrame(carriedBomb, location.j + 0.52, location.i + 0.495, 0.54, 0.54);

  const container = document.createElementNS(SVG.ns, "g");
  container.appendChild(img);
  container.appendChild(carriedBomb);

  itemsLayer.appendChild(container);
  items[location.toString()] = container;
}

function placeMonWithSupermana(item: SVGElement, location: Location) {
  location = inBoardCoordinates(location);
  const img = item.cloneNode() as SVGElement;
  SVG.setOrigin(img, location.j, location.i);

  const carriedMana = supermanaSimple.cloneNode() as SVGElement;
  SVG.setFrame(carriedMana, location.j + 0.13, location.i - 0.13, 0.74, 0.74);

  const container = document.createElementNS(SVG.ns, "g");
  container.appendChild(img);
  container.appendChild(carriedMana);

  itemsLayer.appendChild(container);
  items[location.toString()] = container;
}

function placeMonWithMana(item: SVGElement, mana: SVGElement, location: Location) {
  location = inBoardCoordinates(location);
  const img = item.cloneNode() as SVGElement;
  SVG.setOrigin(img, location.j, location.i);

  const carriedMana = mana.cloneNode() as SVGElement;
  SVG.setFrame(carriedMana, location.j + 0.34, location.i + 0.27, 0.93, 0.93);

  const container = document.createElementNS(SVG.ns, "g");
  container.appendChild(img);
  container.appendChild(carriedMana);

  itemsLayer.appendChild(container);
  items[location.toString()] = container;
}

function placeItem(item: SVGElement, location: Location, fainted = false, sparkles = false) {
  const logicalLocation = location;
  location = inBoardCoordinates(location);
  const key = location.toString();
  if (hasBasePlaceholder(logicalLocation)) {
    SVG.setHidden(basesPlaceholders[key], true);
  }
  const img = item.cloneNode() as SVGElement;
  if (fainted) {
    SVG.setOrigin(img, 0, 0);
    const container = document.createElementNS(SVG.ns, "g");
    container.setAttribute("transform", `translate(${location.j + 1}, ${location.i}) rotate(90)`);
    container.appendChild(img);
    itemsLayer.appendChild(container);
    items[key] = container;
  } else if (sparkles) {
    const container = document.createElementNS(SVG.ns, "g");
    const sparkles = createSparklingContainer(location);
    SVG.setOrigin(img, location.j, location.i);
    container.appendChild(sparkles);
    container.appendChild(img);
    itemsLayer.appendChild(container);
    items[key] = container;
  } else {
    SVG.setOrigin(img, location.j, location.i);
    itemsLayer.appendChild(img);
    items[key] = img;
  }
}

function createSparklingContainer(location: Location): SVGElement {
  const container = document.createElementNS(SVG.ns, "g");
  container.setAttribute("class", "item");

  const mask = document.createElementNS(SVG.ns, "mask");
  mask.setAttribute("id", `mask-square-${location.toString()}`);

  const rect = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(rect, location.j, location.i, 1, 1);
  SVG.setFill(rect);

  mask.appendChild(rect);
  container.appendChild(mask);
  container.setAttribute("mask", `url(#mask-square-${location.toString()})`);

  if (!isModernAndPowerful) {
    for (let i = 0; i < 19; i++) {
      createSparkleParticle(location, container, false);
    }
  } else {
    const intervalId = setInterval(() => {
      if (!container.parentNode.parentNode) {
        clearInterval(intervalId);
        return;
      }
      createSparkleParticle(location, container);
    }, 230);
  }

  return container;
}

function createSparkleParticle(location: Location, container: SVGElement, animating: boolean = true) {
  const particle = sparkle.cloneNode(true) as SVGElement;
  const y = location.i + Math.random();
  const size = Math.random() * 0.05 + 0.075;
  const opacity = 0.3 + 0.42 * Math.random();
  SVG.setFrame(particle, location.j + Math.random(), y, size, size);
  SVG.setOpacity(particle, opacity);
  container.appendChild(particle);

  if (!animating) { return; }

  const velocity = (4 + 2 * Math.random()) * 0.01;
  const duration = Math.random() * 1000 + 2500;
  let startTime: number = null;

  function animateParticle(time: number) {
    if (!startTime) { startTime = time; }

    let timeDelta = time - startTime;
    let progress = timeDelta / duration;
    if (progress > 1) {
      container.removeChild(particle);
      return;
    }

    particle.setAttribute("y", (y - (velocity * timeDelta) / 1000).toString());
    SVG.setOpacity(particle, Math.max(0, opacity - (0.15 * timeDelta) / 1000));
    requestAnimationFrame(animateParticle);
  }

  requestAnimationFrame(animateParticle);
}

function setBase(item: SVGElement, location: Location) {
  const logicalLocation = location;
  location = inBoardCoordinates(location);
  const key = location.toString();
  if (hasBasePlaceholder(logicalLocation)) {
    SVG.setHidden(basesPlaceholders[key], false);
  } else {
    const img = item.cloneNode() as SVGElement;
    SVG.setFrame(img, location.j + 0.2, location.i + 0.2, 0.6, 0.6);
    SVG.setOpacity(img, 0.4);
    board.appendChild(img);
    basesPlaceholders[key] = img;
  }
}

function highlightEmptyDestination(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = SVG.circle(location.j + 0.5, location.i + 0.5, 0.15);
  highlight.style.pointerEvents = "none";
  SVG.setFill(highlight, color);
  highlightsLayer.append(highlight);
}

function highlightSelectedItem(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = document.createElementNS(SVG.ns, "g");
  highlight.style.pointerEvents = "none";

  const circle = SVG.circle(location.j + 0.5, location.i + 0.5, 0.56);
  SVG.setFill(circle, color);  
  
  const mask = document.createElementNS(SVG.ns, "mask");
  mask.setAttribute("id", `highlight-mask-${location.toString()}`);
  const maskRect = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(maskRect, location.j, location.i, 1, 1);
  SVG.setFill(maskRect);
  mask.appendChild(maskRect);
  highlight.appendChild(mask);

  circle.setAttribute("mask", `url(#highlight-mask-${location.toString()})`);
  highlight.appendChild(circle);
  highlightsLayer.append(highlight);
}

function highlightStartFromSuggestion(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = document.createElementNS(SVG.ns, "g");
  highlight.style.pointerEvents = "none";

  const circle = SVG.circle(location.j + 0.5, location.i + 0.5, 0.56);
  SVG.setFill(circle, color);
  
  circle.setAttribute("stroke", colors.startFromStroke);
  circle.setAttribute("stroke-width", "0.023");

  const mask = document.createElementNS(SVG.ns, "mask");
  mask.setAttribute("id", `highlight-mask-${location.toString()}`);
  const maskRect = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(maskRect, location.j, location.i, 1, 1);
  SVG.setFill(maskRect);
  mask.appendChild(maskRect);
  highlight.appendChild(mask);

  circle.setAttribute("mask", `url(#highlight-mask-${location.toString()})`);
  SVG.setOpacity(highlight, 0.69);
  highlight.appendChild(circle);
  highlightsLayer.append(highlight);

  setTimeout(() => {
    highlight.remove();
  }, 100);
}

function highlightDestinationItem(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = document.createElementNS(SVG.ns, "g");
  highlight.style.pointerEvents = "none";

  const rect = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(rect, location.j, location.i, 1, 1);
  SVG.setFill(rect, color);

  const mask = document.createElementNS(SVG.ns, "mask");
  mask.setAttribute("id", `highlight-mask-${location.toString()}`);

  const maskRect = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(maskRect, location.j, location.i, 1, 1);
  SVG.setFill(maskRect);
  mask.appendChild(maskRect);

  const maskCircle = SVG.circle(location.j + 0.5, location.i + 0.5, 0.56);
  SVG.setFill(maskCircle, "black");
  mask.appendChild(maskCircle);

  highlight.appendChild(mask);
  highlight.appendChild(rect);

  rect.setAttribute("mask", `url(#highlight-mask-${location.toString()})`);

  highlightsLayer.append(highlight);
}

function getTraceColors(): string[] {
  if (traceIndex == 6) { traceIndex = 0; }

  traceIndex += 1;

  const a = colors.getRainbow(traceIndex.toString());
  const b = colors.getRainbow((traceIndex + 1).toString());

  return [a, b];
}

function addWaves(location: Location) {
  location = inBoardCoordinates(location);
  const wavesSquareElement = document.createElementNS(SVG.ns, "g");
  wavesSquareElement.setAttribute("transform", `translate(${location.j}, ${location.i})`);
  SVG.setOpacity(wavesSquareElement, 0.5);
  board.appendChild(wavesSquareElement);

  let frameIndex = 0;
  wavesSquareElement.appendChild(getWavesFrame(location, frameIndex));
  if (!isModernAndPowerful) { return; }
  setInterval(() => {
    frameIndex = (frameIndex + 1) % 9;
    wavesSquareElement.innerHTML = "";
    wavesSquareElement.appendChild(getWavesFrame(location, frameIndex));
  }, 200);
}

function getWavesFrame(location: Location, frameIndex: number) {
  const pixel = 1 / 32;
  const key = location.toString() + frameIndex.toString();
  if (!wavesFrames[key]) {
    if (frameIndex == 0) {
      const frame = document.createElementNS(SVG.ns, "g");
      for (let i = 0; i < 10; i++) {
        const width = (Math.floor(Math.random() * 4) + 3) * pixel;
        const x = Math.random() * (1 - width);
        const y = pixel * (2 + i * 3);
        const baseColor = i % 2 == 0 ? colors.wave1 : colors.wave2;

        const baseBottomRect = document.createElementNS(SVG.ns, "rect");
        SVG.setFrame(baseBottomRect, x, y, width, pixel);
        SVG.setFill(baseBottomRect, baseColor);
        baseBottomRect.setAttribute("class", "base-bottom-rect");

        const slidingBottomRect = document.createElementNS(SVG.ns, "rect");
        SVG.setFrame(slidingBottomRect, x + width, y, 0, pixel);
        SVG.setFill(slidingBottomRect, colors.pool);
        slidingBottomRect.setAttribute("class", "sliding-bottom-rect");

        const slidingTopRect = document.createElementNS(SVG.ns, "rect");
        SVG.setFrame(slidingTopRect, x + width, y - pixel, 0, pixel);
        SVG.setFill(slidingTopRect, baseColor);
        slidingTopRect.setAttribute("class", "sliding-top-rect");

        frame.appendChild(baseBottomRect);
        frame.appendChild(slidingTopRect);
        frame.appendChild(slidingBottomRect);
      }
      wavesFrames[key] = frame;
    } else {
      const prevKey = location.toString() + (frameIndex - 1).toString();
      const frame = wavesFrames[prevKey].cloneNode(true) as SVGElement;

      const baseBottomRects = frame.querySelectorAll(".base-bottom-rect");
      const slidingBottomRects = frame.querySelectorAll(".sliding-bottom-rect");
      const slidingTopRects = frame.querySelectorAll(".sliding-top-rect");

      for (let i = 0; i < baseBottomRects.length; i++) {
        const baseBottomRect = baseBottomRects[i];
        const slidingBottomRect = slidingBottomRects[i];
        const slidingTopRect = slidingTopRects[i];
        const baseX = parseFloat(baseBottomRect.getAttribute("x"));
        const baseWidth = parseFloat(baseBottomRect.getAttribute("width"));
        let sliderX = baseX + baseWidth - pixel * frameIndex;
        const attemptedWidth = Math.min(frameIndex, 3) * pixel;
        const visibleWidth = (() => {
          if (sliderX < baseX) {
            if (sliderX + attemptedWidth <= baseX) {
              return 0;
            } else {
              const visible = attemptedWidth - baseX + sliderX;
              if (visible < pixel / 2) {
                return 0;
              } else {
                sliderX = baseX;
                return visible;
              }
            }
          } else {
            return attemptedWidth;
          }
        })();
        slidingBottomRect.setAttribute("x", sliderX.toString());
        slidingTopRect.setAttribute("x", sliderX.toString());
        slidingBottomRect.setAttribute("width", visibleWidth.toString());
        slidingTopRect.setAttribute("width", visibleWidth.toString());
      }
      wavesFrames[key] = frame;
    }
  }
  return wavesFrames[key];
}

function inBoardCoordinates(location: Location): Location {
  if (isFlipped) {
    return new Location(12 - (location.i + 1), location.j);
  } else {
    return new Location(location.i + 1, location.j);
  }
}

const sparkle = (() => {
  const svg = document.createElementNS(SVG.ns, "svg");
  SVG.setSize(svg, 3, 3);
  svg.setAttribute("viewBox", "0 0 3 3");
  SVG.setFill(svg, "transparent");

  const rect1 = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(rect1, 0, 1, 3, 1);
  SVG.setFill(rect1, colors.sparkleLight);
  svg.appendChild(rect1);

  const rect2 = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(rect2, 1, 0, 1, 3);
  SVG.setFill(rect2, colors.sparkleLight);
  svg.appendChild(rect2);

  const rect3 = document.createElementNS(SVG.ns, "rect");
  SVG.setFrame(rect3, 1, 1, 1, 1);  
  SVG.setFill(rect3, colors.sparkleDark);
  svg.appendChild(rect3);

  return svg;
})();