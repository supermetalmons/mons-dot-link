import { didClickSquare, didSelectInputModifier } from "./index";
import { Highlight, HighlightKind, InputModifier, Location, Trace } from "./models";
import { colors } from "./colors";
import { Color as ColorModel, MonKind, ItemModelKind, ItemModel, SquareModel, ManaKind, SquareModelKind } from "mons-web";

const assets = (await import("./assets")).assets;
const board = document.getElementById("monsboard");
const highlightsLayer = document.getElementById("highlightsLayer");
const itemsLayer = document.getElementById("itemsLayer");
const items: { [key: string]: SVGElement } = {};
const basesPlaceholders: { [key: string]: SVGElement } = {};

let itemSelectionOverlay: SVGElement | undefined;
let opponentScoreText: SVGElement | undefined;
let playerScoreText: SVGElement | undefined;

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

const statusMove = loadImage(assets.statusMove);
const statusMana = loadImage(assets.statusMana);
const statusAction = loadImage(assets.statusAction);
const statusPotion = loadImage(assets.statusPotion);

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
  bombButton.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/png;base64,${assets.bomb}`);
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
  potionButton.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/png;base64,${assets.potion}`);
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
      placeItem(bombOrPotion, location);
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

function setupGameInfoElements() {
  for (const isOpponent of [true, false]) {
    const y = isOpponent ? 0.333 : 12.169;


    const randomEmojiId = Math.floor(Math.random() * 5) + 1;
    let emojiValue: string;
    switch (randomEmojiId) {
      case 1:
        emojiValue = assets.emoji1;
        break;
      case 2:
        emojiValue = assets.emoji2;
        break;
      case 3:
        emojiValue = assets.emoji3;
        break;
      case 4:
        emojiValue = assets.emoji4;
        break;
      case 5:
        emojiValue = assets.emoji5;
        break;
    }

    const avatar = loadImage(emojiValue);
    avatar.style.pointerEvents = "none";
    const avatarSize = 0.639;
    avatar.setAttribute("x",  0.05.toString());
    avatar.setAttribute("y", (y - 0.042).toString());
    avatar.setAttribute("width", avatarSize.toString());
    avatar.setAttribute("height", avatarSize.toString());
    board.append(avatar);

    const numberText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    numberText.setAttribute("x", (0.83).toString());
    numberText.setAttribute("y", (y + 0.44).toString());
    numberText.setAttribute("fill", "gray");
    numberText.setAttribute("font-size", "0.5");
    numberText.textContent = "0";
    board.append(numberText);
    if (isOpponent) {
      opponentScoreText = numberText;
    } else {
      playerScoreText = numberText;
    }

    for (let x = 0; x < 7; x++) {
      const img = statusMove.cloneNode() as SVGElement;
      img.setAttribute("x", (10.5 - x * 0.55 - 0.069).toString());
      img.setAttribute("y", y.toString());
      img.setAttribute("width", "0.5");
      img.setAttribute("height", "0.5");
      board.appendChild(img);
    }
  }
}

export function setupBoard() {
  setupGameInfoElements();
  document.addEventListener("touchend", function() {});
  document.addEventListener("click", function(event) {
    const target = event.target as SVGElement;
    if (target && target.nodeName === "rect" && target.classList.contains("board-rect")) {
      const x = parseInt(target.getAttribute("x") || "-1");
      const y = parseInt(target.getAttribute("y") || "-1") - 1;
      didClickSquare(new Location(y, x));
      event.preventDefault();
      event.stopPropagation();
    } else if (!target.closest('a, button')) {
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
        highlightDestinationItem(highlight.location, highlight.isBlink, highlight.color);
        break;
    }
  });
}

function loadImage(data: string) {
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttributeNS("http://www.w3.org/1999/xlink", "href", `data:image/png;base64,${data}`);
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

function placeItem(item: SVGElement, location: Location, fainted = false) {
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
  } else {
    img.setAttribute("x", location.j.toString());
    img.setAttribute("y", location.i.toString());
    itemsLayer.appendChild(img);
    items[key] = img;
  }
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

function highlightDestinationItem(location: Location, blink = false, color: string) {
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

  if (blink) {
    setTimeout(() => {
      highlight.remove();
    }, 100);
  }
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

  switch (traceIndex) {
    case 1:
      return [colors.trace1, colors.trace2];
    case 2:
      return [colors.trace2, colors.trace3];
    case 3:
      return [colors.trace3, colors.trace4];
    case 4:
      return [colors.trace4, colors.trace5];
    case 5:
      return [colors.trace5, colors.trace6];
    case 6:
      return [colors.trace6, colors.trace7];
  }
}

function addWaves(location: Location) {
  location = inBoardCoordinates(location);
  const waveElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  waveElement.setAttribute("transform", `translate(${location.j}, ${location.i})`);
  waveElement.setAttribute("opacity", "0.5");

  const height = 1 / 32;
  for (let i = 0; i < 10; i++) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const width = Math.random() * (3/32) + 3/32;
    const x = Math.random() * (1 - width);
    const y = height * (2 + i * 3);
    rect.setAttribute("x", x.toString());
    rect.setAttribute("y", y.toString());
    rect.setAttribute("width", width.toString());
    rect.setAttribute("height", height.toString());
    rect.setAttribute("fill", i % 2 == 0 ? "#6666FF" : "#00FCFF");
    waveElement.appendChild(rect);
  }

  board.appendChild(waveElement);
}

function inBoardCoordinates(location: Location): Location {
  return new Location(location.i + 1, location.j);
}