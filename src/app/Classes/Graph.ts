import { Arc } from './Arc';
import { Point } from './Point';

export class Graph {
    arcs: Arc[] = [];
    points: Point[] = [];
    distance: number = 0;

    deepCopy(): Graph {
        let temp = new Graph;
        temp.arcs = this.arcs.slice(0);
        temp.points = this.points.slice(0);
        temp.distance = this.distance;

        return temp;
    }

    generateArcs(): void {
        this.arcs = [];
        this.distance = 0;

        for (let i = 0; i < this.points.length - 1; i++) {
            let tempArc = new Arc(this.points[i], this.points[i + 1]);
            this.arcs.push(tempArc);

            this.distance += this.calculateDistance(this.points[i], this.points[i + 1]);
        }
        let tempArc = new Arc(this.points[0], this.points[this.points.length - 1]);
        this.arcs.push(tempArc);

        this.distance += this.calculateDistance(this.points[0], this.points[this.points.length - 1]);
    }

    swapRandomValues(): void {
        let position1 = Math.floor(Math.random() * this.arcs.length);
        let position2 = Math.floor(Math.random() * this.arcs.length);

        while (position1 === position2) {
            position1 = Math.floor(Math.random() * this.arcs.length);
            position2 = Math.floor(Math.random() * this.arcs.length);
        }

        let tempPoint = this.points[position1];
        this.points[position1] = this.points[position2];
        this.points[position2] = tempPoint;

        this.generateArcs();
    }

    calculateDistance(pointA: Point, pointB: Point): number {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }
}