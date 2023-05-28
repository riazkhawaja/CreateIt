import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../post';
import { PostService } from '../post.service';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where} from 'firebase/firestore';
import { CommentService } from '../comment.service';
import { Comment } from '../comment';
import { AddCommentComponent } from '../add-comment/add-comment.component';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, RouterModule, AddCommentComponent],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  @Input() post!: Post;
  
  commentList: Comment[] = [];
  postService = inject(PostService);
  commentService = inject(CommentService);

  constructor() {
  }

  q = query(collection(db, 'posts'), where("type", "==", "comment"));
  unsub = onSnapshot(this.q, async (snapshot) => {
    this.commentList = snapshot?.docs.map(doc => { 
      var comment: any = doc.data(); 
      comment.id = doc.id; 
      comment.date = doc.data()['date']?.toDate(); 
      return <Comment>comment; }) 
  });

  upvotePost(post: Post) {
    this.postService.upvotePost(post);
  }
  downvotePost(post: Post) {
    this.postService.downvotePost(post);
  }
  upvoteComment(comment: Comment) {
    this.commentService.upvoteComment(comment);
  }
  downvoteComment(comment: Comment) {
    this.commentService.downvoteComment(comment);
  }
}
