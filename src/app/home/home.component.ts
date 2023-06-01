import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../post';
import { PostService } from '../post.service';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { CommentService } from '../comment.service';
import { Comment } from '../comment';
import DateDiff from 'date-diff';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  postList: Post[] = [];
  commentList: Comment[] = [];
  filteredPostList: Post[] = [];
  filterSearch: string = '';
  displayPosts: boolean;
  displayCommentForm: string;
  dateFilter: string;
  postService: PostService = inject(PostService);
  commentService: CommentService = inject(CommentService);

  constructor() {
    this.displayPosts = true;
    this.displayCommentForm = '';
    this.dateFilter = 'Today';
  }

  postsQuery = query(collection(db, 'posts'), where("type", "==", "post"));
  unsubPosts = onSnapshot(this.postsQuery, async (snapshot) => {
    this.postList = snapshot?.docs.map(doc => { var post: any = doc.data(); post.id = doc.id; post.date = doc.data()['date']?.toDate(); return <Post>post; });
    this.postList.sort((a, b) => {
      return b.date.getTime() - a.date.getTime() //+ a.downvotes - b.downvotes;
    });
    if (!this.filterSearch || this.filterSearch == '') {
      this.filteredPostList = this.postList;
      this.adjustDate(this.dateFilter);
    }
  });

  adjustDate(text: string) {
    var today = new Date();
    var lastweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

    switch (text) {
      case 'Today': {
        this.filteredPostList = this.filteredPostList.filter(a => {
          var diff = new DateDiff(today, a.date);
          return diff.days() < 1;
        });
        break;
      }
      case 'Last 7 Days':
        this.filteredPostList = this.filteredPostList.filter(a => {
          var diff = new DateDiff(lastweek, a.date);
          return diff.days() < 7;
        });
        break;
      case 'All posts':
        this.filteredPostList = this.filteredPostList;
        break;
    }
  }

  filterResults(text: string) {
    this.filteredPostList = this.postList;
    text = text.trim();
    this.filterSearch = text;
    this.filteredPostList = this.filteredPostList?.filter(
      post => post?.content[0]?.toLowerCase().includes(text!.toLowerCase()) || post?.author?.toLowerCase().includes(text!.toLowerCase())
    );
    this.adjustDate(this.dateFilter);
  }

  commentsQuery = query(collection(db, 'posts'), where("type", "==", "comment"));
  unsubComments = onSnapshot(this.commentsQuery, async (snapshot) => {
    this.commentList = snapshot?.docs.map(doc => {
      var comment: any = doc.data();
      comment.id = doc.id;
      comment.date = doc.data()['date']?.toDate();
      return <Comment>comment;
    })
    this.commentList.sort((a, b) => {
      return b.date.getTime() - a.date.getTime() //+ a.downvotes - b.downvotes;
    });
  });

  upvotePost(post: Post) {
    this.postService.upvotePost(post);
  }
  downvotePost(post: Post) {
    this.postService.downvotePost(post);
  }
  deletePost(post: Post, comments: Comment[]) {
    this.postService.deletePost(post.id, comments);
  }
  upvoteComment(comment: Comment) {
    this.commentService.upvoteComment(comment);
  }
  downvoteComment(comment: Comment) {
    this.commentService.downvoteComment(comment);
  }
  deleteComment(comment: Comment) {
    this.commentService.deleteComment(comment);
  }
}
