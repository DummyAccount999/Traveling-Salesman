import { Arc } from './Arc';
import { Point } from './Point';

export class GeneticGraph {
    arcs: Arc[] = [];
    points: Point[] = [];
    fitness: number = 0;

    constructor(p: Point[]) {
        this.points = p.slice(0);
    }

    randomizePoints(): void {
        for (let i = 0; i < this.points.length; i++) {
            let point1 = Math.floor(Math.random() * this.points.length);
            let point2 = Math.floor(Math.random() * this.points.length);

            let temp = this.points[point1];
            this.points[point1] = this.points[point2];
            this.points[point2] = temp;
        }

        this.generateArcs();
    }

    calculateFitness(): number {
        this.fitness = 0;

        for (let i = 0; i < this.arcs.length; i++) {
            this.fitness += this.calculateDistance(this.arcs[i].pointA, this.arcs[i].pointB);
        }

        this.fitness = Math.pow(1.0 / this.fitness, 0.5);
        return this.fitness;
    }

    generateArcs(): void {
        this.arcs = [];
        this.fitness = 0;

        for (let i = 0; i < this.points.length - 1; i++) {
            let tempArc = new Arc(this.points[i], this.points[i + 1]);
            this.arcs.push(tempArc);

            this.fitness += this.calculateDistance(this.points[i], this.points[i + 1]);
        }
        let tempArc = new Arc(this.points[0], this.points[this.points.length - 1]);
        this.arcs.push(tempArc);

        this.fitness += this.calculateDistance(this.points[0], this.points[this.points.length - 1]);
    }

    mutate(chance: number) {
        for (let i = 0; i < this.points.length; i++) {
            let rnd = Math.random();
            if (rnd < chance) {
                let p2 = Math.floor(Math.random() * this.points.length);

                let temp = this.points[i];
                this.points[i] = this.points[p2];
                this.points[p2] = temp;
            }
        }

        this.generateArcs();
    }

    deepCopy(): GeneticGraph {
        let temp = new GeneticGraph([{x: 0, y: 0, id: 0}]);
        temp.arcs = this.arcs.slice(0);
        temp.points = this.points.slice(0);
        temp.fitness = this.fitness;

        return temp;
    }

    calculateDistance(pointA: Point, pointB: Point): number {
        return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
    }
}