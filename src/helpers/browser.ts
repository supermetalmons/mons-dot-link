export function tunePage() {
  if (!isModernAndPowerful) {
    ["github", "app store", "steam", "x"].forEach((key: string) => {
      const link: HTMLAnchorElement | null = document.querySelector(`a[data-key="${key}"]`);
      if (link) {
        link.textContent = link.getAttribute("data-text") || "";
      }
    });
  }
}

export const isDesktopSafari = (() => {
  const userAgent = window.navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  return isSafari && !isIos;
})();

export const isModernAndPowerful = (() => {
  if (isDesktopSafari) { return true; }
  for (const char of ["⚔︎", "𝕏", "♡", "☆", "↓"]) {
    if (!supportsCharacter(char)) {
      return false;
    }
  }
  return true;
})();

function supportsCharacter(character: string): boolean {
  const testElement: HTMLSpanElement = document.createElement("span");
  testElement.style.visibility = "hidden";
  testElement.style.position = "absolute";
  testElement.style.fontSize = "32px";
  document.body.appendChild(testElement);

  testElement.textContent = "\uFFFF";
  const initialWidth: number = testElement.clientWidth;
  testElement.textContent = character;
  const characterWidth: number = testElement.clientWidth;
  document.body.removeChild(testElement);
  return initialWidth !== characterWidth;
}
