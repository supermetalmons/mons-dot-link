import init, { hello } from 'mons-web';

async function run() {
  await init();
  console.log(hello());
}

run();

const overlay = document.getElementById("overlay");
const images = {};

for (let y = 0; y < 11; y++) {
  for (let x = 0; x < 11; x++) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", 1);
    rect.setAttribute("height", 1);
    rect.setAttribute("fill", "rgba(255, 255, 255, 0)");
    rect.addEventListener("click", function () {
      toggleItem(x, y);
    });
    overlay.appendChild(rect);
  }
}

const drainerImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
drainerImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", "../img/drainer.png");
drainerImage.setAttribute("width", 1);
drainerImage.setAttribute("height", 1);
drainerImage.setAttribute("class", "item");

function toggleItem(x, y) {
  const key = `item-${x}-${y}`;
  if (images[key]) {
    images[key].remove();
    delete images[key];
  } else {
    const img = drainerImage.cloneNode();
    img.setAttribute("x", x);
    img.setAttribute("y", y);
    overlay.appendChild(img);
    images[key] = img;
  }
}

placeRandomMons();

function placeRandomMons() {
  const positions = new Set();
  while (positions.size < 9) {
    const x = Math.floor(Math.random() * 11);
    const y = Math.floor(Math.random() * 11);
    positions.add(`${x}-${y}`);
  }

  positions.forEach((pos) => {
    const [x, y] = pos.split("-").map(Number);
    toggleItem(x, y);
  });
}
