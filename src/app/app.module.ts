import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { GraphDisplayComponent } from './graph-display/graph-display.component';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { GeneticsComponent } from './genetics/genetics.component';
import { CanvasTemplateComponent } from './canvas-template/canvas-template.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphDisplayComponent,
    NavBarComponent,
    AboutPageComponent,
    GeneticsComponent,
    CanvasTemplateComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot([
    {path: 'genetic', component: GeneticsComponent},
    {path: 'about', component: AboutPageComponent},
    {path: '', component: GraphDisplayComponent},
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
