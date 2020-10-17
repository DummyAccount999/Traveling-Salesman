import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Arc } from '../Classes/Arc';
import { Point } from '../Classes/Point';

@Component({
  selector: 'app-canvas-template',
  templateUrl: './canvas-template.component.html',
  styleUrls: ['./canvas-template.component.css']
})
export class CanvasTemplateComponent implements OnInit {
  canvasWidth: number = 0.9;

  xMap: number = 0;
  yMap: number = 0;

  WIDTH = 2;
  HEIGHT = 2;

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit(): void {
  }

  erase(): void {
    const canvas = this.ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  initialize(totalWidth: number, totalHeight: number): void {
    console.log('Running init');
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.canvas.width = (window.innerWidth - (window.innerWidth * this.canvasWidth));

    this.xMap = this.ctx.canvas.width / totalWidth;
    this.yMap = this.ctx.canvas.height / totalHeight
  }

  draw(arcs: Arc[], points: Point[]): void {
    if (this.ctx === undefined) {
      console.log('ERR!');
      return;
    }

    this.erase();

    for (let i = 0; i < points.length; i++) {
      const x = points[i].x;
      const y = points[i].y;

      this.ctx.fillRect((x - this.WIDTH) * this.xMap, (y - this.HEIGHT) * this.yMap, this.WIDTH, this.HEIGHT);
    }

    if (arcs !== undefined) {
      for (let i = 0; i < arcs.length; i++) {
        this.ctx.beginPath();

        const pointA = arcs[i].pointA;
        const pointB = arcs[i].pointB;

        this.ctx.lineWidth = 0.5;
        this.ctx.moveTo((pointA.x - (this.WIDTH / 2)) * this.xMap, (pointA.y - (this.HEIGHT / 2)) * this.yMap);
        this.ctx.lineTo((pointB.x - (this.WIDTH / 2)) * this.xMap, (pointB.y - (this.HEIGHT / 2)) * this.yMap);
        this.ctx.stroke();
      }
    }
  }

}
