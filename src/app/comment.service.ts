import { Injectable } from '@angular/core';
import { Post } from './post'
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Comment } from './comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  async submitComment(author: string, date: Date, content: string, post: string): Promise<any> {
    const postsCollection = collection(db, 'posts');
    const submitDoc = await addDoc(postsCollection, { author, date, content, type: "comment", downvotes: 0, upvotes: 0, post });
    return submitDoc;
  }
  async upvoteComment(comment: Comment) {
    const docref = doc(db, "posts", comment.id);
    await setDoc(docref, { author: comment.author, date: comment.date, content: comment.content, post: comment.post, type: "comment", downvotes: comment.downvotes, upvotes: comment.upvotes + 1});
  }
  async downvoteComment(comment: Comment) {
    const docref = doc(db, "posts", comment.id);
    await setDoc(docref, { author: comment.author, date: comment.date, content: comment.content, post: comment.post, type: "comment", downvotes: comment.downvotes + 1, upvotes: comment.upvotes});
  }
  async deleteComment(comment: Comment) {
    const docref = doc(db, "posts", comment.id);
    await deleteDoc(docref);
  }
}
