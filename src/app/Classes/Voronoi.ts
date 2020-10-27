//#region Voronoi classes
export class Voronoi {
  public totalWeight: number = undefined;
  public r: number = undefined;
  public g: number = undefined;
  public b: number = undefined;
  public a: number = undefined;

  constructor(
    public pos: Point,
    public pointArray: WeightedPoint[] = [],
  ) { }

  deterimeTotalWeight() {
    if (this.pointArray.length > 0) {
      this.totalWeight = 0;

      for (let index = 0; index < this.pointArray.length; index++) {
        this.totalWeight += this.pointArray[index].weight;
      }
    } else {
      this.totalWeight = undefined;
    }
  }

  moveMean() {
    if (this.pointArray.length <= 0)
      return;

    let xCenterTop = 0;
    let xCenterBottom = 0;

    let yCenterTop = 0;
    let yCenterBottom = 0;

    this.pointArray.forEach(p => {
      xCenterTop += (p.x * p.weight);
      xCenterBottom += p.weight;

      yCenterTop += (p.y * p.weight);
      yCenterBottom += p.weight;
    });

    let xCenter = xCenterTop / xCenterBottom;
    let yCenter = yCenterTop / yCenterBottom;

    this.pos.x = xCenter;
    this.pos.y = yCenter;
  }

  resetArray() {
    this.pointArray = [];
  }
}

export class WeightedPoint {
  constructor(
    public x: number,
    public y: number,
    public weight: number,
  ) { }
}

export class Point {
  constructor(
    public x: number,
    public y: number,
  ) { }
}
  //#endregion