import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Point } from '../Classes/Point';
import { Graph } from '../Classes/Graph';

@Component({
  selector: 'app-canvas-test',
  templateUrl: './canvas-test.component.html',
  styleUrls: ['./canvas-test.component.css']
})
export class CanvasTestComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  @ViewChild('canvasCopy', { static: true })
  canvasCopy: ElementRef<HTMLCanvasElement>;
  private ctxCopy: CanvasRenderingContext2D;

  points: Point[] = [];
  bestGraph: Graph;

  WIDTH = 5;
  HEIGHT = 5;

  temprature: number = 500;

  constructor() { }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctxCopy = this.canvasCopy.nativeElement.getContext('2d');
  }

  addPoint(e): void {
    const x = e.clientX - this.ctx.canvas.getBoundingClientRect().left;
    const y = e.clientY - this.ctx.canvas.getBoundingClientRect().top;

    this.points.push({ x: x, y: y });

    this.bestGraph = undefined;
    this.draw();
    this.drawCopy(undefined);
  }

  drawCopy(graph: Graph): void {
    this.erase(this.ctxCopy);

    for (let i = 0; i < this.points.length; i++) {
      const x = this.points[i].x;
      const y = this.points[i].y;

      this.ctxCopy.fillRect(x - this.WIDTH, y - this.HEIGHT, this.WIDTH, this.HEIGHT);
    }

    if (graph !== undefined) {
      for (let i = 0; i < graph.arcs.length; i++) {
        this.ctxCopy.beginPath();

        const pointA = graph.arcs[i].pointA;
        const pointB = graph.arcs[i].pointB;

        this.ctxCopy.moveTo(pointA.x - (this.WIDTH / 2), pointA.y - (this.HEIGHT / 2));
        this.ctxCopy.lineTo(pointB.x - (this.WIDTH / 2), pointB.y - (this.HEIGHT / 2));
        this.ctxCopy.stroke();
      }
    }
  }

  draw(): void {
    this.erase(this.ctx);

    for (let i = 0; i < this.points.length; i++) {
      const x = this.points[i].x;
      const y = this.points[i].y;

      this.ctx.fillRect(x - this.WIDTH, y - this.HEIGHT, this.WIDTH, this.HEIGHT);
    }

    if (this.bestGraph !== undefined) {
      for (let i = 0; i < this.bestGraph.arcs.length; i++) {
        this.ctx.beginPath();

        const pointA = this.bestGraph.arcs[i].pointA;
        const pointB = this.bestGraph.arcs[i].pointB;

        this.ctx.moveTo(pointA.x - (this.WIDTH / 2), pointA.y - (this.HEIGHT / 2));
        this.ctx.lineTo(pointB.x - (this.WIDTH / 2), pointB.y - (this.HEIGHT / 2));
        this.ctx.stroke();
      }
    }
  }

  erase(ctx): void {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  resetAll(): void {
    this.erase(this.ctx);

    this.points = [];
    this.bestGraph = undefined;
  }

  generateArcs(): void {
    if (this.points.length < 2)
      return;

    this.temprature = 500;
    this.bestGraph = new Graph();
    let tempPoints = this.points.slice(0);
    let index;

    do {
      index = Math.floor(Math.random() * tempPoints.length)
      this.bestGraph.points.push(tempPoints[index]);
      tempPoints.splice(index, 1);
    } while (tempPoints.length > 0)

    this.bestGraph.generateArcs();

    console.log(this.bestGraph.distance);
    this.draw();
    this.drawCopy(this.bestGraph);

    let iteration = 0;
    const i = setInterval(() => {
      this.runSimulatedAnnealing();
      iteration++;

      if (iteration >= 1000)
        clearInterval(i);
    }, 10);
  }

  runSimulatedAnnealing(): void {
    const ALPHA = 0.99;
    console.log(this.bestGraph.distance);

    let tempGraph = this.bestGraph.deepCopy();
    tempGraph.swapRandomValues();

    if (tempGraph.distance < this.bestGraph.distance)
      this.bestGraph = tempGraph.deepCopy();
    else {
      let differnce = (this.bestGraph.distance - tempGraph.distance) / this.temprature;
      differnce = Math.exp(differnce);

      let randomNum = Math.random();

      if (randomNum < differnce)
        this.bestGraph = tempGraph.deepCopy();
    }

    this.drawCopy(tempGraph);
    this.draw();
    this.temprature *= ALPHA;
  }
}
