import { Point } from './Point';

export class Arc {
    pointA: Point;
    pointB: Point;

    constructor(pointA: Point, pointB: Point) {
        this.pointA = pointA;
        this.pointB = pointB;
    }

    compareArc(arc) {
        if (this.pointA == arc.pointA && this.pointB == arc.pointB)
            return true;
        else if (this.pointB == arc.pointA && this.pointA == arc.pointB)
            return true;

        return false;
    }
}