import { Injectable } from '@angular/core';
import { Post } from './post'
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Comment } from './comment';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class PostService {
  async submitPost(author: string, date: Date, title: string, content: string, image: File, video: File): Promise<UploadTask | null> {
    const postsCollection = collection(db, 'posts');
    const submitDoc = await addDoc(postsCollection, { author, date, title, type: "post", content, downvotes: 0, upvotes: 0, image: '', video: '' });

    const storage = getStorage();
    var imageUrl = ''; var videoUrl = '';
    var uploadTask: UploadTask | null = null;
    if (image) {
      const imageRef = ref(storage, `images/${submitDoc.id}`);
      uploadTask = uploadBytesResumable(imageRef, image);
      uploadTask.on('state_changed', (snapshot) => { }, (error) => {
      }, () => {
        getDownloadURL(uploadTask!.snapshot.ref).then(async (downloadURL) => {
          imageUrl = downloadURL;
          await setDoc(submitDoc, { author, date, title, type: "post", content, downvotes: 0, upvotes: 0, image: imageUrl });
        });
      })
    }
    if (video) {
      const videoRef = ref(storage, `videos/${submitDoc.id}`);
      uploadTask = uploadBytesResumable(videoRef, video);
      uploadTask.on('state_changed', (snapshot) => { }, (error) => {
      }, () => {
        getDownloadURL(uploadTask!.snapshot.ref).then(async (downloadURL) => {
          videoUrl = downloadURL;
          await setDoc(submitDoc, { author, date, title, type: "post", content, downvotes: 0, upvotes: 0, image: imageUrl, video: videoUrl });
        });
      })
    }
    if (uploadTask) {
      return uploadTask;
    }
    return null;
  }
  async upvotePost(post: Post) {
    const docref = doc(db, "posts", post.id);
    await setDoc(docref, { author: post.author, date: post.date, title: post.title, content: post.content, type: "post", image: post.image ?? '', video: post.video ?? '', downvotes: post.downvotes, upvotes: post.upvotes + 1 });
  }
  async downvotePost(post: Post) {
    const docref = doc(db, "posts", post.id);
    await setDoc(docref, { author: post.author, date: post.date, title: post.title, content: post.content, type: "post", image: post.image ?? '', video: post.video ?? '', downvotes: post.downvotes + 1, upvotes: post.upvotes });
  }
  async deletePost(postId: string, comments?: Comment[]) {
    if (comments != undefined) {
      comments.forEach(async comment => {
        if (comment.post == postId) {
          const docref = doc(db, "posts", comment.id);
          await deleteDoc(docref);
        }
      });
    }
    const storage = getStorage();
    const imageRef = ref(storage, `images/${postId}`);
    deleteObject(imageRef).then(() => { }).catch((error) => {
    });
    const videoRef = ref(storage, `videos/${postId}`);
    deleteObject(videoRef).then(() => { }).catch((error) => {
    });
    const docref = doc(db, "posts", postId);
    await deleteDoc(docref);
  }
}
