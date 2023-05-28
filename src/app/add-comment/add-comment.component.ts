import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentService } from '../comment.service';
import { Comment } from '../comment';
import { Post } from '../post';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.css']
})
export class AddCommentComponent {
  @Input() post!: Post;
  @Input() displayCommentForm: string;
  @Output() displayCommentFormChange = new EventEmitter();
  commentService: CommentService = inject(CommentService);
  
  constructor() {
    this.displayCommentForm = '';
  }

  commentForm = new FormGroup({
    author: new FormControl('', Validators.required),
    content: new FormControl('', Validators.required)
  });

  submitComment(post: Post) {
    this.commentService.submitComment(
      this.commentForm.value.author ?? '',
      new Date(),
      this.commentForm.value.content ?? '',
      post.id
    );
  }
}
