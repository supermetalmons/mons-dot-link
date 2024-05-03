export const colors = {
  attackTarget: "#941651",
  destination: "#009500",
  spiritTarget: "#FF84FF",
  startFromSuggestion: "#FEFB00",
  selectedItem: "#00F900",
  trace: {
    1: "#FF2F92",
    2: "#FFD478",
    3: "#FFFB78",
    4: "#72FA78",
    5: "#73FDFF",
    6: "#75D5FF",
    7: "#D783FF",
  },

  getTrace: function (id: string) {
    return this.trace[id];
  },
};
