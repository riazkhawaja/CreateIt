import { NgModule } from '@angular/core';
import { AddPostComponent } from '../add-post/add-post.component';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
    imports: [ReactiveFormsModule,
        CommonModule],
    declarations: [ AddPostComponent ],
    exports: [ AddPostComponent ]
})
export class AddPostModule { }