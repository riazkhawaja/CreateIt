import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { CommonModule } from '@angular/common';
import { AddCommentModule } from '../add-comment/add-comment.module';
import { AddPostModule } from '../add-post/add-post.module';
import { HomeRoutingModule } from './home-routing.module';


@NgModule({
    imports: [HomeRoutingModule, CommonModule, AddCommentModule, AddPostModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule],
    declarations: [HomeComponent]
})
export class HomeModule { }