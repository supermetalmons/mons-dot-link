import { didClickSquare } from "./index";
import { Highlight, HighlightKind, Location } from "./models";
import { colors } from "./colors";
import { Color as ColorModel, MonKind, ItemModelKind, ItemModel, SquareModel, ManaKind } from "mons-web";

const board = document.getElementById("monsboard");
const highlightsLayer = document.getElementById("highlightsLayer");
const itemsLayer = document.getElementById("itemsLayer");
const items: { [key: string]: SVGElement } = {};

const drainer = loadImage("drainer");
const angel = loadImage("angel");
const demon = loadImage("demon");
const spirit = loadImage("spirit");
const mystic = loadImage("mystic");
const mana = loadImage("mana");
const drainerB = loadImage("drainer-black");
const angelB = loadImage("angel-black");
const demonB = loadImage("demon-black");
const spiritB = loadImage("spirit-black");
const mysticB = loadImage("mystic-black");
const manaB = loadImage("mana-black");
const bombOrPotion = loadImage("bombOrPotion");
const bomb = loadImage("bomb");
const potion = loadImage("potion");
const supermana = loadImage("supermana");
const supermanaSimple = loadImage("supermana-simple");

export function putItem(item: ItemModel, location: Location) {
  switch (item.kind) {
    case ItemModelKind.Mon:
      const isBlack = item.mon.color == ColorModel.Black;
      switch (item.mon.kind) {
        case MonKind.Demon:
          placeItem(isBlack ? demonB : demon, location);
          break;
        case MonKind.Drainer:
          placeItem(isBlack ? drainerB : drainer, location);
          break;
        case MonKind.Angel:
          placeItem(isBlack ? angelB : angel, location);
          break;
        case MonKind.Spirit:
          placeItem(isBlack ? spiritB : spirit, location);
          break;
        case MonKind.Mystic:
          placeItem(isBlack ? mysticB : mystic, location);
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
       // TODO: implement
      placeMonWithSupermana(drainer, location);
      placeMonWithMana(drainer, mana, location);
      break;
    case ItemModelKind.MonWithConsumable:
       // TODO: implement
      placeMonWithBomb(drainer, location);
      break;
    case ItemModelKind.Consumable:
      placeItem(bombOrPotion, location);
      break;
  }
}

export function setupSquare(square: SquareModel, location: Location) {
  // TODO: implement
}

export function setupBoard() {
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", "1");
      rect.setAttribute("height", "1");
      rect.setAttribute("fill", "rgba(255, 255, 255, 0)");
      rect.addEventListener("click", function () {
        didClickSquare(new Location(y, x));
      });
      itemsLayer.appendChild(rect);
    }
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

function loadImage(name: string) {
  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.setAttributeNS("http://www.w3.org/1999/xlink", "href", `../img/${name}.png`);
  image.setAttribute("width", "1");
  image.setAttribute("height", "1");
  image.setAttribute("class", "item");
  return image;
}

function placeMonWithBomb(item: SVGElement, location: Location) {
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
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("x", location.j.toString());
  img.setAttribute("y", location.i.toString());
  itemsLayer.appendChild(img);
  items[location.toString()] = img;
  if (fainted) {
    faint(img, location);
  }
}

function setBase(item: SVGElement, location: Location) {
  const img = item.cloneNode() as SVGElement;
  img.setAttribute("width", "0.6");
  img.setAttribute("height", "0.6");
  const adjustedX = location.j + 0.2;
  const adjustedY = location.j + 0.2;
  img.setAttribute("x", adjustedX.toString());
  img.setAttribute("y", adjustedY.toString());
  img.style.opacity = "0.4";
  board.appendChild(img);
}

function faint(img: SVGElement, location: Location) {
  img.style.transform = "rotate(90deg)";
  img.style.transformOrigin = `${location.j + 0.5}px ${location.i + 0.5}px`;
}

function highlightEmptyDestination(location: Location, color: string) {
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  highlight.setAttribute("class", `highlight-${location.toString()}`);
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
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "g");
  highlight.setAttribute("class", `highlight-${location.toString()}`);
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
  maskRect.setAttribute("width","1");
  maskRect.setAttribute("height", "1");
  maskRect.setAttribute("fill", "white");
  mask.appendChild(maskRect);
  highlight.appendChild(mask);

  circle.setAttribute("mask", `url(#highlight-mask-${location.toString()})`);
  highlight.appendChild(circle);
  highlightsLayer.append(highlight);
}

function highlightDestinationItem(location: Location, blink = false, color: string) {
  const highlight = document.createElementNS("http://www.w3.org/2000/svg", "g");
  highlight.setAttribute("class", `highlight-${location.toString()}`);
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

function drawTrace(start: Location, end: Location) {
  // TODO: implement
}

// TODO: deprecate
function toggleItem(location: Location) {
  const img = items[location.toString()];
  if (img) {
    const existingHighlight = highlightsLayer.querySelector(`.highlight-${location.toString()}`);
    if (existingHighlight) {
      existingHighlight.remove();
    } else {
    }
  } else {
    const existingHighlight = highlightsLayer.querySelector(`.highlight-${location.toString()}`);
    if (existingHighlight) {
      existingHighlight.remove();
    } else {
    }
  }
}
