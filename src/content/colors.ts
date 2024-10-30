export const colors = {
  attackTarget: "#941651",
  destination: "#009500",
  spiritTarget: "#FF84FF",
  startFromSuggestion: "#FEFB00",
  selectedItem: "#00F900",
  rainbow: {
    1: "#FF2F92",
    2: "#FFD478",
    3: "#FFFB78",
    4: "#72FA78",
    5: "#73FDFF",
    6: "#75D5FF",
    7: "#D783FF",
  } as { [key: string]: string },

  getRainbow: function (index: string) {
    return this.rainbow[index];
  },
  itemSelectionBackground: "rgba(0, 0, 0, 0.5)",
  scoreText: "gray",
  wave1: "#6666FF",
  wave2: "#00FCFF",
  pool: "#030DF4",
  sparkleLight: "#FEFEFE",
  sparkleDark: "#000",
  startFromStroke: "#fbbf24",
};
