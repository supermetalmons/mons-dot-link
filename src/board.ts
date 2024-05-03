import { didClickSquare, didSelectInputModifier, isPlayerSideTurn } from "./index";
import { Highlight, HighlightKind, InputModifier, Location, Sound, Trace } from "./helpers/models";
import { colors } from "./helpers/colors";
import { isModernAndPowerful } from "./helpers/page-tuning";
import { Color as ColorModel, MonKind, ItemModelKind, ItemModel, SquareModel, ManaKind, SquareModelKind } from "mons-web";
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

export function updateMoveStatus(color: ColorModel, moveKinds: Int32Array) {
  const monMoves = moveKinds[0];
  let manaMoves = moveKinds[1];
  let actions = moveKinds[2];
  let potions = moveKinds[3];

  const total = monMoves + manaMoves + actions + potions;

  const playerSideActive = isFlipped ? color == ColorModel.White : color == ColorModel.Black;

  const itemsToHide = playerSideActive ? playerMoveStatusItems : opponentMoveStatusItems;
  const itemsToSetup = playerSideActive ? opponentMoveStatusItems : playerMoveStatusItems;

  for (const item of itemsToHide) {
    item.setAttribute("display", "none");
  }
  for (const [index, item] of itemsToSetup.entries()) {
    if (index < total) {
      item.setAttribute("display", "");
      if (manaMoves > 0) {
        item.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${emojis.statusMana}`);
        manaMoves -= 1;
      } else if (potions > 0) {
        item.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${emojis.statusPotion}`);
        potions -= 1;
      } else if (actions > 0) {
        item.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${emojis.statusAction}`);
        actions -= 1;
      } else {
        item.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${emojis.statusMove}`);
      }
    } else {
      item.setAttribute("display", "none");
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
  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
  itemSelectionOverlay = overlay;

  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute("x", "0");
  background.setAttribute("y", "1");
  background.setAttribute("width", "100%");
  background.setAttribute("height", "11");
  background.setAttribute("fill", "rgba(0, 0, 0, 0.5)");
  background.style.backdropFilter = "blur(1px)";
  overlay.appendChild(background);

  const bombButton = document.createElementNS("http://www.w3.org/2000/svg", "image");
  bombButton.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${assets.bomb}`);
  bombButton.setAttribute("x", "25%");
  bombButton.setAttribute("y", "40%");
  bombButton.setAttribute("width", "20%");
  bombButton.setAttribute("height", "20%");
  bombButton.addEventListener("click", (event) => {
    event.stopPropagation();
    didSelectInputModifier(InputModifier.Bomb);
    overlay.remove();
  });
  overlay.appendChild(bombButton);

  const potionButton = document.createElementNS("http://www.w3.org/2000/svg", "image");
  potionButton.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${assets.potion}`);
  potionButton.setAttribute("x", "55%");
  potionButton.setAttribute("y", "40%");
  potionButton.setAttribute("width", "20%");
  potionButton.setAttribute("height", "20%");
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

export function putItem(item: ItemModel, location: Location) {
  switch (item.kind) {
    case ItemModelKind.Mon:
      const isBlack = item.mon.color == ColorModel.Black;
      const isFainted = item.mon.is_fainted();
      switch (item.mon.kind) {
        case MonKind.Demon:
          placeItem(isBlack ? demonB : demon, location, isFainted);
          break;
        case MonKind.Drainer:
          placeItem(isBlack ? drainerB : drainer, location, isFainted);
          break;
        case MonKind.Angel:
          placeItem(isBlack ? angelB : angel, location, isFainted);
          break;
        case MonKind.Spirit:
          placeItem(isBlack ? spiritB : spirit, location, isFainted);
          break;
        case MonKind.Mystic:
          placeItem(isBlack ? mysticB : mystic, location, isFainted);
          break;
      }
      break;
    case ItemModelKind.Mana:
      switch (item.mana.kind) {
        case ManaKind.Regular:
          const isBlack = item.mana.color == ColorModel.Black;
          placeItem(isBlack ? manaB : mana, location);
          break;
        case ManaKind.Supermana:
          placeItem(supermana, location);
          break;
      }
      break;
    case ItemModelKind.MonWithMana:
      const isBlackDrainer = item.mon.color == ColorModel.Black;
      const isSupermana = item.mana.kind == ManaKind.Supermana;
      if (isSupermana) {
        placeMonWithSupermana(isBlackDrainer ? drainerB : drainer, location);
      } else {
        const isBlackMana = item.mana.color == ColorModel.Black;
        placeMonWithMana(isBlackDrainer ? drainerB : drainer, isBlackMana ? manaB : mana, location);
      }
      break;
    case ItemModelKind.MonWithConsumable:
      const isBlackWithConsumable = item.mon.color == ColorModel.Black;
      switch (item.mon.kind) {
        case MonKind.Demon:
          placeMonWithBomb(isBlackWithConsumable ? demonB : demon, location);
          break;
        case MonKind.Drainer:
          placeMonWithBomb(isBlackWithConsumable ? drainerB : drainer, location);
          break;
        case MonKind.Angel:
          placeMonWithBomb(isBlackWithConsumable ? angelB : angel, location);
          break;
        case MonKind.Spirit:
          placeMonWithBomb(isBlackWithConsumable ? spiritB : spirit, location);
          break;
        case MonKind.Mystic:
          placeMonWithBomb(isBlackWithConsumable ? mysticB : mystic, location);
          break;
      }
      break;
    case ItemModelKind.Consumable:
      placeItem(bombOrPotion, location, false, true);
      break;
  }
}

export function setupSquare(square: SquareModel, location: Location) {
  if (square.kind == SquareModelKind.MonBase) {
    const isBlack = square.color == ColorModel.Black;
    switch (square.mon_kind) {
      case MonKind.Demon:
        setBase(isBlack ? demonB : demon, location);
        break;
      case MonKind.Drainer:
        setBase(isBlack ? drainerB : drainer, location);
        break;
      case MonKind.Angel:
        setBase(isBlack ? angelB : angel, location);
        break;
      case MonKind.Spirit:
        setBase(isBlack ? spiritB : spirit, location);
        break;
      case MonKind.Mystic:
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

    const numberText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    numberText.setAttribute("x", (offsetX + avatarSize + 0.21).toString());
    numberText.setAttribute("y", (y + 0.55 - avatarOffsetY + (isOpponent ? 0.013 : 0)).toString());
    numberText.setAttribute("fill", "gray");
    numberText.setAttribute("font-size", "0.5");
    numberText.setAttribute("font-weight", "600");
    numberText.setAttribute("opacity", "0.69");
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
      img.setAttribute("x", (10.5 - x * 0.55 - statusItemsOffsetX).toString());
      img.setAttribute("y", (y - statusItemsOffsetY).toString());
      img.setAttribute("width", "0.5");
      img.setAttribute("height", "0.5");
      controlsLayer.appendChild(img);

      if (isOpponent) {
        opponentMoveStatusItems.push(img);
      } else {
        playerMoveStatusItems.push(img);
      }

      const isActiveSide = isFlipped ? isOpponent : !isOpponent;
      if (isActiveSide) {
        if (x > 4) {
          img.setAttribute("display", "none");
        }
      } else {
        img.setAttribute("display", "none");
      }
    }

    const avatar = loadImage(isOpponent ? opponentEmoji : playerEmoji);
    avatar.style.pointerEvents = "auto";
    avatar.setAttribute("x", offsetX.toString());
    avatar.setAttribute("y", (y - avatarOffsetY).toString());
    avatar.setAttribute("width", avatarSize.toString());
    avatar.setAttribute("height", avatarSize.toString());
    controlsLayer.append(avatar);

    avatar.addEventListener("click", (event) => {
      event.stopPropagation();

      const playerSideActive = isFlipped ? !isPlayerSideTurn() : isPlayerSideTurn();

      if (isOpponent) {
        if (!playerSideActive) {
          const [newId, newEmoji] = emojis.getRandomEmojiOtherThan(currentOpponentEmojiId);
          currentOpponentEmojiId = newId;
          avatar.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${newEmoji}`);
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
          avatar.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${newEmoji}`);
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
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", (y + 1).toString());
      rect.setAttribute("width", "1");
      rect.setAttribute("height", "1");
      rect.setAttribute("fill", "rgba(255, 255, 255, 0)");
      rect.classList.add("board-rect");
      itemsLayer.appendChild(rect);
    }
  }
}

export function decorateBoard() {
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

function loadImage(data: string) {
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/webp;base64,${data}`);
  image.setAttribute("width", "1");
  image.setAttribute("height", "1");
  image.setAttribute("class", "item");
  return image;
}

function placeMonWithBomb(item: SVGElement, location: Location) {
  location = inBoardCoordinates(location);
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", location.j.toString());
  img.setAttribute("y", location.i.toString());

  const carriedBomb = bomb.cloneNode() as SVGElement;
  carriedBomb.setAttribute("x", (location.j + 0.52).toString());
  carriedBomb.setAttribute("y", (location.i + 0.495).toString());
  carriedBomb.setAttribute("width", (0.54).toString());
  carriedBomb.setAttribute("height", (0.54).toString());

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.appendChild(img);
  container.appendChild(carriedBomb);

  itemsLayer.appendChild(container);
  items[location.toString()] = container;
}

function placeMonWithSupermana(item: SVGElement, location: Location) {
  location = inBoardCoordinates(location);
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", location.j.toString());
  img.setAttribute("y", location.i.toString());

  const carriedMana = supermanaSimple.cloneNode() as SVGElement;
  carriedMana.setAttribute("x", (location.j + 0.13).toString());
  carriedMana.setAttribute("y", (location.i - 0.13).toString());
  carriedMana.setAttribute("width", (0.74).toString());
  carriedMana.setAttribute("height", (0.74).toString());

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.appendChild(img);
  container.appendChild(carriedMana);

  itemsLayer.appendChild(container);
  items[location.toString()] = container;
}

function placeMonWithMana(item: SVGElement, mana: SVGElement, location: Location) {
  location = inBoardCoordinates(location);
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", location.j.toString());
  img.setAttribute("y", location.i.toString());

  const carriedMana = mana.cloneNode() as SVGElement;
  carriedMana.setAttribute("x", (location.j + 0.34).toString());
  carriedMana.setAttribute("y", (location.i + 0.27).toString());
  carriedMana.setAttribute("width", (0.93).toString());
  carriedMana.setAttribute("height", (0.93).toString());

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
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
    basesPlaceholders[key].style.display = "none";
  }
  const img = item.cloneNode() as SVGElement;
  if (fainted) {
    img.setAttribute("x", "0");
    img.setAttribute("y", "0");
    const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.setAttribute("transform", `translate(${location.j + 1}, ${location.i}) rotate(90)`);
    container.appendChild(img);
    itemsLayer.appendChild(container);
    items[key] = container;
  } else if (sparkles) {
    const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const sparkles = createSparklingContainer(location);
    img.setAttribute("x", location.j.toString());
    img.setAttribute("y", location.i.toString());
    container.appendChild(sparkles);
    container.appendChild(img);
    itemsLayer.appendChild(container);
    items[key] = container;
  } else {
    img.setAttribute("x", location.j.toString());
    img.setAttribute("y", location.i.toString());
    itemsLayer.appendChild(img);
    items[key] = img;
  }
}

function createSparklingContainer(location: Location): SVGElement {
  const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
  container.setAttribute("class", "item");

  const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  mask.setAttribute("id", `mask-square-${location.toString()}`);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", location.j.toString());
  rect.setAttribute("y", location.i.toString());
  rect.setAttribute("width", "1");
  rect.setAttribute("height", "1");
  rect.setAttribute("fill", "white");

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
  particle.setAttribute("x", (location.j + Math.random()).toString());
  particle.setAttribute("y", y.toString());
  const opacity = 0.3 + 0.42 * Math.random();
  particle.setAttribute("opacity", opacity.toString());

  const size = Math.random() * 0.05 + 0.075;
  particle.setAttribute("width", size.toString());
  particle.setAttribute("height", size.toString());
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
    particle.setAttribute("opacity", Math.max(0, opacity - (0.15 * timeDelta) / 1000).toString());
    requestAnimationFrame(animateParticle);
  }

  requestAnimationFrame(animateParticle);
}

function setBase(item: SVGElement, location: Location) {
  const logicalLocation = location;
  location = inBoardCoordinates(location);
  const key = location.toString();
  if (hasBasePlaceholder(logicalLocation)) {
    basesPlaceholders[key].style.display = "";
  } else {
    const img = item.cloneNode() as SVGElement;
    img.setAttribute("width", "0.6");
    img.setAttribute("height", "0.6");
    const adjustedX = location.j + 0.2;
    const adjustedY = location.i + 0.2;
    img.setAttribute("x", adjustedX.toString());
    img.setAttribute("y", adjustedY.toString());
    img.style.opacity = "0.4";
    board.appendChild(img);
    basesPlaceholders[key] = img;
  }
}

function highlightEmptyDestination(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  highlight.style.pointerEvents = "none";
  const circleRadius = 0.15;
  const circleCenter = { x: location.j + 0.5, y: location.i + 0.5 };
  highlight.setAttribute("cx", circleCenter.x.toString());
  highlight.setAttribute("cy", circleCenter.y.toString());
  highlight.setAttribute("r", circleRadius.toString());
  highlight.setAttribute("fill", color);
  highlightsLayer.append(highlight);
}

function highlightSelectedItem(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "g");
  highlight.style.pointerEvents = "none";

  const circleRadius = 0.56;
  const circleCenter = { x: location.j + 0.5, y: location.i + 0.5 };

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", circleCenter.x.toString());
  circle.setAttribute("cy", circleCenter.y.toString());
  circle.setAttribute("r", circleRadius.toString());
  circle.setAttribute("fill", color);

  const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  mask.setAttribute("id", `highlight-mask-${location.toString()}`);
  const maskRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  maskRect.setAttribute("x", location.j.toString());
  maskRect.setAttribute("y", location.i.toString());
  maskRect.setAttribute("width", "1");
  maskRect.setAttribute("height", "1");
  maskRect.setAttribute("fill", "white");
  mask.appendChild(maskRect);
  highlight.appendChild(mask);

  circle.setAttribute("mask", `url(#highlight-mask-${location.toString()})`);
  highlight.appendChild(circle);
  highlightsLayer.append(highlight);
}

function highlightStartFromSuggestion(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "g");
  highlight.style.pointerEvents = "none";

  const circleRadius = 0.56;
  const circleCenter = { x: location.j + 0.5, y: location.i + 0.5 };

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", circleCenter.x.toString());
  circle.setAttribute("cy", circleCenter.y.toString());
  circle.setAttribute("r", circleRadius.toString());
  circle.setAttribute("fill", color);
  circle.setAttribute("stroke", "#fbbf24");
  circle.setAttribute("stroke-width", "0.023");

  const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  mask.setAttribute("id", `highlight-mask-${location.toString()}`);
  const maskRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  maskRect.setAttribute("x", location.j.toString());
  maskRect.setAttribute("y", location.i.toString());
  maskRect.setAttribute("width", "1");
  maskRect.setAttribute("height", "1");
  maskRect.setAttribute("fill", "white");
  mask.appendChild(maskRect);
  highlight.appendChild(mask);

  circle.setAttribute("mask", `url(#highlight-mask-${location.toString()})`);
  highlight.setAttribute("opacity", "0.69");
  highlight.appendChild(circle);
  highlightsLayer.append(highlight);

  setTimeout(() => {
    highlight.remove();
  }, 100);
}

function highlightDestinationItem(location: Location, color: string) {
  location = inBoardCoordinates(location);
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "g");
  highlight.style.pointerEvents = "none";

  const circleRadius = 0.56;
  const circleCenter = { x: location.j + 0.5, y: location.i + 0.5 };

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", location.j.toString());
  rect.setAttribute("y", location.i.toString());
  rect.setAttribute("width", "1");
  rect.setAttribute("height", "1");
  rect.setAttribute("fill", color);

  const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  mask.setAttribute("id", `highlight-mask-${location.toString()}`);

  const maskRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  maskRect.setAttribute("x", location.j.toString());
  maskRect.setAttribute("y", location.i.toString());
  maskRect.setAttribute("width", "1");
  maskRect.setAttribute("height", "1");
  maskRect.setAttribute("fill", "white");
  mask.appendChild(maskRect);

  const maskCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  maskCircle.setAttribute("cx", circleCenter.x.toString());
  maskCircle.setAttribute("cy", circleCenter.y.toString());
  maskCircle.setAttribute("r", circleRadius.toString());
  maskCircle.setAttribute("fill", "black");
  mask.appendChild(maskCircle);

  highlight.appendChild(mask);
  highlight.appendChild(rect);

  rect.setAttribute("mask", `url(#highlight-mask-${location.toString()})`);

  highlightsLayer.append(highlight);
}

export function drawTrace(trace: Trace) {
  const from = inBoardCoordinates(trace.from);
  const to = inBoardCoordinates(trace.to);

  const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  gradient.setAttribute("id", `trace-gradient-${from.toString()}-${to.toString()}`);
  const colors = getTraceColors();

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", colors[1]);
  gradient.appendChild(stop1);

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", colors[0]);
  gradient.appendChild(stop2);
  board.appendChild(gradient);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  const fromCenter = { x: from.j + 0.5, y: from.i + 0.5 };
  const toCenter = { x: to.j + 0.5, y: to.i + 0.5 };
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const transform = `translate(${fromCenter.x},${fromCenter.y}) rotate(${angle})`;

  rect.setAttribute("x", "0");
  rect.setAttribute("y", "-0.1");
  rect.setAttribute("width", length.toString());
  rect.setAttribute("height", "0.2");
  rect.setAttribute("transform", transform);

  rect.setAttribute("fill", `url(#trace-gradient-${from.toString()}-${to.toString()})`);
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

let traceIndex = 0;

function getTraceColors(): string[] {
  if (traceIndex == 6) {
    traceIndex = 0;
  }

  traceIndex += 1;

  const a = colors.getTrace(traceIndex.toString());
  const b = colors.getTrace((traceIndex + 1).toString());

  return [a, b];
}

function addWaves(location: Location) {
  location = inBoardCoordinates(location);
  const wavesSquareElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  wavesSquareElement.setAttribute("transform", `translate(${location.j}, ${location.i})`);
  wavesSquareElement.setAttribute("opacity", "0.5");
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
      const frame = document.createElementNS("http://www.w3.org/2000/svg", "g");
      for (let i = 0; i < 10; i++) {
        const width = (Math.floor(Math.random() * 4) + 3) * pixel;
        const x = Math.random() * (1 - width);
        const y = pixel * (2 + i * 3);
        const baseColor = i % 2 == 0 ? "#6666FF" : "#00FCFF";

        const baseBottomRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        baseBottomRect.setAttribute("x", x.toString());
        baseBottomRect.setAttribute("y", y.toString());
        baseBottomRect.setAttribute("width", width.toString());
        baseBottomRect.setAttribute("height", pixel.toString());
        baseBottomRect.setAttribute("fill", baseColor);
        baseBottomRect.setAttribute("class", "base-bottom-rect");

        const slidingBottomRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        slidingBottomRect.setAttribute("x", (x + width).toString());
        slidingBottomRect.setAttribute("y", y.toString());
        slidingBottomRect.setAttribute("width", "0");
        slidingBottomRect.setAttribute("height", pixel.toString());
        slidingBottomRect.setAttribute("fill", "#030DF4");
        slidingBottomRect.setAttribute("class", "sliding-bottom-rect");

        const slidingTopRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        slidingTopRect.setAttribute("x", (x + width).toString());
        slidingTopRect.setAttribute("y", (y - pixel).toString());
        slidingTopRect.setAttribute("width", "0");
        slidingTopRect.setAttribute("height", pixel.toString());
        slidingTopRect.setAttribute("fill", baseColor);
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

const isDesktopSafari = (() => {
  const userAgent = window.navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  return isSafari && !isIos;
})();

const sparkle = (() => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "3");
  svg.setAttribute("height", "3");
  svg.setAttribute("viewBox", "0 0 3 3");
  svg.setAttribute("fill", "none");

  const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect1.setAttribute("y", "1");
  rect1.setAttribute("width", "3");
  rect1.setAttribute("height", "1");
  rect1.setAttribute("fill", "#FEFEFE");
  svg.appendChild(rect1);

  const rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect2.setAttribute("x", "1");
  rect2.setAttribute("width", "1");
  rect2.setAttribute("height", "3");
  rect2.setAttribute("fill", "#FEFEFE");
  svg.appendChild(rect2);

  const rect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect3.setAttribute("x", "1");
  rect3.setAttribute("y", "1");
  rect3.setAttribute("width", "1");
  rect3.setAttribute("height", "1");
  rect3.setAttribute("fill", "black");
  svg.appendChild(rect3);

  return svg;
})();
