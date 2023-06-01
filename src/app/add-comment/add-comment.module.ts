import { NgModule } from '@angular/core';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { AddPostComponent } from '../add-post/add-post.component';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
    imports: [ReactiveFormsModule,
        CommonModule],
    declarations: [ AddCommentComponent ],
    exports: [ AddCommentComponent ]
})
export class AddCommentModule { }