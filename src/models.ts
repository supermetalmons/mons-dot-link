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