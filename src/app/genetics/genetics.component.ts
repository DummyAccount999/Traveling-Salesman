import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
  ComponentFactory
} from '@angular/core';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import { GeneticGraph } from '../Classes/GeneticGraph';
import { Point } from '../Classes/Point';
import { Arc } from '../Classes/Arc';
import { Population } from '../Classes/Population';
import { CanvasTemplateComponent } from '../canvas-template/canvas-template.component';

@Component({
  selector: 'app-genetics',
  templateUrl: './genetics.component.html',
  styleUrls: ['./genetics.component.css'],
  animations: [
    trigger('showRandomPoints', [
      state('show', style({
        opacity: 1,
        overflow: 'hidden',
        height: '*',
      })),
      state('hide', style({
        opacity: 0,
        overflow: 'hidden',
        height: '0px',
      })),
      transition('* => *', animate('300ms ease')),
    ]),

    trigger('showMiniCanvas', [
      state('show', style({
        opacity: 1,
        overflow: 'hidden',
        height: '*',
      })),
      state('hide', style({
        opacity: 0,
        overflow: 'hidden',
        height: '0px',
      })),
      transition('* => *', animate('300ms ease')),
    ]),
  ],
})
export class GeneticsComponent implements OnInit {
  //#region Create mini-canvases
  @ViewChild('canvasContainer', { read: ViewContainerRef }) container: ViewContainerRef;
  canvases: ComponentRef<CanvasTemplateComponent>[] = [];
  canvasCount = 6;
  miniCanvasCheck = false;

  createCanvases(): void {
    this.container.clear();
    this.canvases = [];

    for (let i = 0; i < this.canvasCount; i++) {
      const factory = this.resolver.resolveComponentFactory(CanvasTemplateComponent);
      const componentRef = this.container.createComponent(factory);
      this.canvases.push(componentRef);
    }
  }

  //#endregion

  @ViewChild('mainCanvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  points: Point[] = [];

  buttonText: string = 'Start!';
  buttonFunction: Function = this.runGeneticFunction;

  WIDTH = 5;
  HEIGHT = 5;

  speed: number = 100;
  rndPointsCheck: boolean = true;
  rndPoints: number = 10;
  id: number = 0;

  generations: number = 1000;
  mutationRate: number = 0.01;
  population: number = 500;
  pop: Population = undefined;

  timer: number;

  constructor(private resolver: ComponentFactoryResolver) { }

  //#region Initialization
  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.canvas.width = (window.innerWidth - (window.innerWidth * 0.5));
  }

  addPoint(e): void {
    if (!this.rndPointsCheck) {
      const x = e.clientX - this.ctx.canvas.getBoundingClientRect().left;
      const y = e.clientY - this.ctx.canvas.getBoundingClientRect().top;

      this.points.push({ x: x, y: y, id: this.id++ });

      this.draw(undefined, this.ctx);
    }
  }

  erase(ctx): void {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  resetAll(): void {
    this.erase(this.ctx);

    if (this.timer !== undefined)
      clearInterval(this.timer);

    this.timer = undefined;
    this.points = [];
    this.buttonText = "Start!";
    this.buttonFunction = this.runGeneticFunction;
    this.id = 0;
    this.miniCanvasCheck = false;
  }

  stopProcess(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
    }

    this.timer = undefined;
    this.buttonText = "Start!";
    this.buttonFunction = this.runGeneticFunction;
  }

  draw(arcs: Arc[], ctx: CanvasRenderingContext2D): void {
    this.erase(ctx);

    for (let i = 0; i < this.points.length; i++) {
      const x = this.points[i].x;
      const y = this.points[i].y;

      ctx.fillRect(x - this.WIDTH, y - this.HEIGHT, this.WIDTH, this.HEIGHT);
    }

    if (arcs !== undefined) {
      for (let i = 0; i < arcs.length; i++) {
        ctx.beginPath();

        const pointA = arcs[i].pointA;
        const pointB = arcs[i].pointB;

        ctx.moveTo(pointA.x - (this.WIDTH / 2), pointA.y - (this.HEIGHT / 2));
        ctx.lineTo(pointB.x - (this.WIDTH / 2), pointB.y - (this.HEIGHT / 2));
        ctx.stroke();
      }
    }
  }

  runButtonFunction(): void {
    this.buttonFunction();
  }
  //#endregion

  runGeneticFunction(): void {
    if (this.rndPointsCheck) {
      if (this.points.length <= 0) {
        for (let i = 0; i < this.rndPoints; i++) {
          let xVal = Math.floor(Math.random() * this.ctx.canvas.width);
          let yVal = Math.floor(Math.random() * this.ctx.canvas.height);

          this.points.push({ x: xVal, y: yVal, id: this.id++ });
          this.pop = undefined;
          this.draw(undefined, this.ctx);
        }
      }
    }

    if (this.points.length <= 2)
      return;

    this.buttonText = "Stop!";
    this.buttonFunction = this.stopProcess;

    this.createCanvases();

    this.pop = new Population(this.population, this.points, this.mutationRate);
    let best = this.pop.getBestContender();

    this.draw(best.arcs, this.ctx);

    for (let i = 0; i < this.canvases.length; i++) {
      this.canvases[i].instance.initialize(this.ctx.canvas.width, this.ctx.canvas.height);

      let graph = this.pop.getRandomContender();
      this.canvases[i].instance.draw(graph.arcs, graph.points);
    }

    this.miniCanvasCheck = true;

    let generationCount = 0;
    this.timer = window.setInterval(() => {
      this.nextGen();
      generationCount++;

      if (generationCount >= this.generations) {
        clearInterval(this.timer);
        this.timer = undefined;
        this.buttonText = "Start!";
        this.buttonFunction = this.runGeneticFunction;
      }
    }, this.speed);
  }

  nextGen(): void {
    this.pop.calculateFitness();
    this.pop.breed();
    this.pop.calculateFitness();

    let best = this.pop.getBestContender();
    this.draw(best.arcs, this.ctx);

    for (let i = 0; i < this.canvases.length; i++) {
      let graph = this.pop.getRandomContender();
      this.canvases[i].instance.draw(graph.arcs, graph.points);
    }
  }

}
