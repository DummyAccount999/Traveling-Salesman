import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Point } from '../Classes/Point';
import { Graph } from '../Classes/Graph';

@Component({
  selector: 'app-graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.css']
})
export class GraphDisplayComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  @ViewChild('canvasCopy', { static: true })
  canvasCopy: ElementRef<HTMLCanvasElement>;
  private ctxCopy: CanvasRenderingContext2D;

  points: Point[] = [];
  bestGraph: Graph;

  buttonText: string = 'Start!';
  buttonFunction: Function = this.generateArcs;

  WIDTH = 5;
  HEIGHT = 5;

  alpha: number = 0.95;
  iterations: number = 1000;
  temprature: number = 500;
  tempratureCopy: number = 0;
  speed: number = 50;

  timer: number;

  constructor() { }

  addPoint(e): void {
    const x = e.clientX - this.ctx.canvas.getBoundingClientRect().left;
    const y = e.clientY - this.ctx.canvas.getBoundingClientRect().top;

    this.points.push({ x: x, y: y });

    this.bestGraph = undefined;
    this.draw();
    this.drawCopy(undefined);
  }

  erase(ctx): void {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  resetAll(): void {
    this.erase(this.ctx);
    this.erase(this.ctxCopy);

    if (this.timer !== undefined)
      clearInterval(this.timer);

    this.timer = undefined;
    this.points = [];
    this.bestGraph = undefined;
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctxCopy = this.canvasCopy.nativeElement.getContext('2d');

    this.ctx.canvas.width = (window.innerWidth - (window.innerWidth * 0.7));
    this.ctxCopy.canvas.width = (window.innerWidth  - (window.innerWidth * 0.7));
  }

  stopProcess(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
    }

    this.timer = undefined;
    this.buttonText = "Start!";
    this.buttonFunction = this.generateArcs;
  }

  generateArcs(): void {
    if (this.points.length < 2)
      return;

    this.buttonText = 'Stop!';
    this.buttonFunction = this.stopProcess;

    this.tempratureCopy = this.temprature;

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
    this.timer = window.setInterval(() => {
      this.runSimulatedAnnealing();
      iteration++;

      if (iteration >= this.iterations) {
        clearInterval(this.timer);
        this.timer = undefined;
        this.buttonText = "Start!";
        this.buttonFunction = this.generateArcs;
      }
    }, this.speed);
  }

  runSimulatedAnnealing(): void {
    let tempGraph = this.bestGraph.deepCopy();
    tempGraph.swapRandomValues();

    if (tempGraph.distance < this.bestGraph.distance)
      this.bestGraph = tempGraph.deepCopy();
    else {
      let differnce = (this.bestGraph.distance - tempGraph.distance) / this.tempratureCopy;
      differnce = Math.exp(differnce);

      let randomNum = Math.random();

      if (randomNum < differnce)
        this.bestGraph = tempGraph.deepCopy();
    }

    this.drawCopy(tempGraph);
    this.draw();
    this.tempratureCopy *= this.alpha;
  }

  runButtonFunction(): void {
    this.buttonFunction();
  }

}
