import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Voronoi, Point, WeightedPoint } from '../Classes/Voronoi';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-image-page',
  templateUrl: './image-page.component.html',
  styleUrls: ['./image-page.component.css'],
  animations: [
    trigger('showNeighbourButton', [
      state('show', style({
        opacity: 1,
        overflow: 'hidden',
        width: '*',
      })),
      state('hide', style({
        opacity: 0,
        overflow: 'hidden',
        width: '0px',
      })),
      transition('* => *', animate('300ms ease')),
    ]),

    trigger('arrowRotation', [
      state('rotate', style({
        transform: 'rotate(-90deg)',
      })),
      state('default', style({
        transform: 'rotate(0deg)',
      })),
      transition('* => *', animate('300ms ease')),
    ]),

    trigger('showDropDown', [
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
export class ImagePageComponent implements OnInit {
  @ViewChild('canvasMain', { static: true }) canvasMain: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;

  @ViewChild('canvasCopy', { static: true }) canvasCopy: ElementRef<HTMLCanvasElement>;
  ctxCopy: CanvasRenderingContext2D;

  constructor() { }

  ngOnInit(): void {
    this.ctx = this.canvasMain.nativeElement.getContext('2d');
    this.ctxCopy = this.canvasCopy.nativeElement.getContext('2d');

    const CANVASWIDTH = 0.75;
    this.ctx.canvas.width = (window.innerWidth - (window.innerWidth * CANVASWIDTH));
    this.ctxCopy.canvas.width = (window.innerWidth - (window.innerWidth * CANVASWIDTH));
  }

  //#region Create region
  //Variables
  buttonString: string = 'Generate points';
  fileUploaded: boolean = false;
  currentlyRunning: boolean = false;
  pointsGenerated: boolean = false;
  url: any;
  vArray: Voronoi[] = [];
  pixels: any;
  pointPath: any[] = [];
  totalLength: number = 0;
  maxSpeed: number = 100;
  maxDots: number = 20000;
  whiteWeight: number = 50;
  groupingWeight: number = 40;

  //Functions
  selectFile(event): void {
    let reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (_event) => {
      this.url = reader.result;
      let img = new Image;

      img.onload = (res) => {
        this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        let imgCopy = new Image;
        imgCopy.src = this.url;
        this.ctxCopy.drawImage(imgCopy, 0, 0, imgCopy.width, imgCopy.height, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.vArray = [];
        this.pointsGenerated = false;

        this.fileUploaded = true;
      }
      img.src = this.url;
    }
  }

  filterImage(): void {
    this.pointsGenerated = false;

    let imgCopy = new Image;
    imgCopy.src = this.url;

    let id = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.pixels = id.data;

    this.vArray = [];

    while (this.vArray.length < Math.floor(this.maxDots / 10)) {
      let x = Math.floor(Math.random() * this.ctxCopy.canvas.width);
      let y = Math.floor(Math.random() * this.ctxCopy.canvas.height);

      this.vArray.push(new Voronoi({ x, y }));
    }
  }

  moveVoronoi() {
    if (this.vArray.length <= 0)
      this.filterImage();

    this.currentlyRunning = true;
    this.buttonString = 'Busy...';

    while (this.vArray.length > this.maxDots) {
      let rnd = Math.floor(Math.random() * this.vArray.length);

      this.vArray.splice(rnd, 1);
    }

    let firstFunction = (xCounter: number, yCounter: number, yLength: number) => {
      for (let x = xCounter; x < xCounter + 1; x += 1) {

        if (x >= this.ctxCopy.canvas.width) {
          continue;
        }

        for (let y = yCounter; y < yCounter + yLength; y += 1) {

          if (y >= this.ctxCopy.canvas.height) {
            continue;
          }

          let i = ((y * this.ctxCopy.canvas.width) + x) * 4;
          let brightness = (this.pixels[i] + this.pixels[i + 1] + this.pixels[i + 2]) / 3;

          // if (brightness > 126)
          //   continue;

          let minDistance = Number.MAX_VALUE;
          let vIndex = 0;

          this.vArray.forEach((voronoi, index) => {
            const dist = this.calcDist({ x, y }, voronoi.pos);

            if (dist < minDistance) {
              minDistance = dist;
              vIndex = index;
            }
          });

          let weight = 0;
          weight = this.map(brightness, 0, 255, 1, (this.whiteWeight / 100));

          this.vArray[vIndex].pointArray.push({ x, y, weight });
        }
      }
    }

    let secondFunction = () => {
      let removeArr = [];

      let groupingWeightChanged = Math.abs(100 - this.groupingWeight - 1);
      const maxWeight = groupingWeightChanged / 2;
      const minWeight = maxWeight / 2;

      this.vArray.forEach((v) => {
        v.moveMean();
        v.deterimeTotalWeight();

        let isNewPoint = false;
        if (v.totalWeight === undefined) {
          isNewPoint = true;
        }

        if (!isNewPoint) {
          if (v.pointArray.length <= 0) {
            removeArr.push(v);
          }

          if (v.totalWeight < minWeight) {
            removeArr.push(v);
          } else if (v.totalWeight >= maxWeight) {
            if (this.vArray.length < this.maxDots) {
              let dist = 2;

              let x = v.pos.x + (Math.random() * dist);
              let y = v.pos.y + (Math.random() * dist);

              this.vArray.push(new Voronoi({ x, y }));
            }
          }
        }

        v.resetArray();
      });

      this.vArray = this.vArray.filter(val => !removeArr.includes(val));

      this.ctxCopy.clearRect(0, 0, this.ctxCopy.canvas.width, this.ctxCopy.canvas.height);
      this.ctxCopy.fillStyle = '#FFFFFF';
      this.ctxCopy.fillRect(0, 0, this.ctxCopy.canvas.width, this.ctxCopy.canvas.height)

      this.vArray.forEach(v => {
        let vPos = (Math.floor(v.pos.y) * this.ctxCopy.canvas.width + Math.floor(v.pos.x)) * 4;
        v.r = this.pixels[vPos];
        v.g = this.pixels[vPos + 1];
        v.b = this.pixels[vPos + 2];
        v.a = this.pixels[vPos + 3];

        let hex = "#" + ("000000" + this.rgbToHex(v.r, v.g, v.b)).slice(-6);

        if (v.r !== undefined) {
          this.ctxCopy.fillStyle = hex;
          this.ctxCopy.fillRect(v.pos.x, v.pos.y, 1, 1);
        }
      });

      console.log(this.vArray.length);
      this.currentlyRunning = false;
      this.buttonString = 'Generate points';
    }

    let xCounter = 0;
    let yCounter = 0;
    let timeoutTimer = undefined;
    let intervalTimer = window.setInterval(() => {
      if (timeoutTimer === undefined) {
        if (xCounter < this.ctxCopy.canvas.width) {
          timeoutTimer = window.setTimeout(() => {
            this.buttonString = `${xCounter}...(${this.ctxCopy.canvas.width - 1})`;

            const ySkip = Math.floor(Math.floor(100000.0 / (this.vArray.length / 10)));
            firstFunction(xCounter, yCounter, ySkip);
            yCounter += ySkip;

            if (yCounter >= this.ctxCopy.canvas.height) {
              yCounter = 0;
              xCounter++;
            }

            timeoutTimer = undefined;
          });
        } else {
          timeoutTimer = undefined;
          clearInterval(intervalTimer);
          intervalTimer = undefined;

          secondFunction();
          this.pointsGenerated = true;
        }
      }
    });
  }

  nearestNeighbour() {
    let removeList = [];
    this.vArray.forEach(v => {
      if (v.r === undefined) {
        removeList.push(v);
      }
    });

    this.vArray.forEach(v => {
      let vPos = (Math.floor(v.pos.y) * this.ctxCopy.canvas.width + Math.floor(v.pos.x)) * 4;
      v.r = this.pixels[vPos];
      v.g = this.pixels[vPos + 1];
      v.b = this.pixels[vPos + 2];
      v.a = this.pixels[vPos + 3];
    });

    this.vArray.filter(val => !removeList.includes(val));

    this.pointPath = [];
    let arrCopy = this.vArray.slice(0);

    let rndPoint = Math.floor(Math.random() * arrCopy.length);
    this.pointPath.push({ pos: arrCopy[rndPoint].pos, col: [arrCopy[rndPoint].r, arrCopy[rndPoint].b, arrCopy[rndPoint].g] });
    arrCopy.splice(rndPoint, 1);

    let runMinDist = () => {
      if (arrCopy.length > 0) {
        let minDistance = Number.MAX_VALUE;
        let lastPoint = this.pointPath[this.pointPath.length - 1].pos;
        let indexKeep = 0;

        for (let index = 0; index < arrCopy.length; index++) {
          let dist = this.calcDist(lastPoint, arrCopy[index].pos);
          if (dist < minDistance) {
            minDistance = dist;
            indexKeep = index;
          }
        }

        let hex = "#" + ("000000" + this.rgbToHex(arrCopy[indexKeep].r, arrCopy[indexKeep].g, arrCopy[indexKeep].b)).slice(-6);
        this.pointPath.push({ pos: arrCopy[indexKeep].pos, col: hex });
        arrCopy.splice(indexKeep, 1);

        let index = this.pointPath.length - 1;
        this.ctxCopy.lineWidth = 0.5;
        this.ctxCopy.strokeStyle = this.pointPath[index - 1].col;

        this.ctxCopy.beginPath();
        this.ctxCopy.moveTo(this.pointPath[index - 1].pos.x, this.pointPath[index - 1].pos.y);
        this.ctxCopy.lineTo(this.pointPath[index].pos.x, this.pointPath[index].pos.y);
        this.ctxCopy.stroke();

        this.totalLength += this.calcDist(this.pointPath[index - 1].pos, this.pointPath[index].pos);
        this.totalLength = Math.floor(this.totalLength);
      }
    }

    this.ctxCopy.clearRect(0, 0, this.ctxCopy.canvas.width, this.ctxCopy.canvas.height);
    this.totalLength = 0;

    this.currentlyRunning = true;
    let timeTimeout = undefined;
    let timeInterval = window.setInterval(() => {
      if (timeTimeout === undefined) {
        if (this.pointPath.length < this.vArray.length) {
          timeTimeout = window.setTimeout(() => {
            for (let speed = 0; speed < this.maxSpeed; speed++) {
              runMinDist();
            }
            timeTimeout = undefined;
          });
        } else {
          clearInterval(timeInterval);
          timeTimeout = undefined;
          timeInterval = undefined;
          this.currentlyRunning = false;
        }
      }
    }, 5);
  }
  //#endregion

  //#region Extra functions
  calculateTotalDistance(arr: Point[]) {
    let tempDist = 0;

    for (let i = 0; i < arr.length - 1; i++) {
      tempDist += this.calcDist(arr[i], arr[i + 1]);
    }

    return tempDist;
  }

  calcDist(p1: Point, p2: Point): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  }

  map(value: number, istart: number, istop: number, ostart: number, ostop: number): number {
    return (ostart + (ostop - ostart) * ((value - istart) / (istop - istart)));
  }

  rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  erase(ctx): void {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  //#endregion

  //#region Information
  showInformation: boolean = false;

  toggleInformation() {
    this.showInformation = !this.showInformation;
  }
  //#endregion

  //#region Settings
  showSettings: boolean = false;

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }
  //#endregion
}
