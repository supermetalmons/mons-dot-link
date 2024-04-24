export class Location {

  i: number;
  j: number;

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }

  toString(): string {
    return `${this.i}-${this.j}`;
  }
  
}

export class Highlight {
  location: Location;
  kind: HighlightKind;
  color: string;
  isBlink: boolean;

  constructor(location: Location, kind: HighlightKind, color: string, isBlink: boolean) {
    this.location = location;
    this.kind = kind;
    this.color = color;
    this.isBlink = isBlink;
  }
}

export enum HighlightKind {
  Selected,
  EmptySquare,
  TargetSuggestion
}