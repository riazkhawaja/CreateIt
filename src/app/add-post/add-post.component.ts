import { Component, Input, Output, inject, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Post } from '../post';
import { PostService } from '../post.service';
import { DataUrl, NgxImageCompressService, UploadResponse } from 'ngx-image-compress';
import imageCompression from 'browser-image-compression';
import { UploadTask, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent {
  @Input() post!: Post;
  @Input() displayPosts: boolean;
  @Output() displayPostsChange = new EventEmitter();
  imgResultAfterResize: DataUrl = '';
  postService: PostService = inject(PostService);
  imageProgress: number;
  videoProgress: number;
  image: File | null = null;
  video: File | null = null;

  constructor() {
    this.displayPosts = false;
    this.imageProgress = 100;
    this.videoProgress = 100;
  }

  postForm = new FormGroup({
    author: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
    content: new FormControl(''),
  });

  imageUpload(event: any) {
    var files = event.target.files;
    this.image = files ? files[0] : null;
    //if (this.image) { this.imageProgress = 0; }
  }

  videoUpload(event: any) {
    var files = event.target.files;
    this.video = files ? files[0] : null;
    //if (this.video) { this.videoProgress = 0; }
  }

  processVideo(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const ffmpeg = createFFmpeg({ progress: (e) => this.videoProgress = 100 * e.ratio });
      await ffmpeg.load();
      ffmpeg.FS("writeFile", this.video!.name, await fetchFile(this.video!));
      await ffmpeg.run('-i', this.video!.name, '-c:v', 'h264', '-crf', '30', '-b:v', '0', '-row-mt', '1', '-f', 'mp4', "output.mp4");
      const data = ffmpeg.FS("readFile", "output.mp4");
      const file = new File([data.buffer], "output.mp4");
      /* const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      ); */
      this.video = file;
      resolve();
    });
  }

  async submitPost() {

    var postbtn = <HTMLButtonElement>document.getElementById('postbtn');
    document.getElementById("postbtn")!.innerText = "Posting . . .";
    const postsCollection = collection(db, 'posts');
    var submitDoc = await addDoc(postsCollection, { author: this.postForm.value.author ?? '', date: new Date(), title: this.postForm.value.title ?? '', type: "post", content: this.postForm.value.content ?? '', downvotes: 0, upvotes: 0, image: '', video: '' });
    var image = this.image; var video = this.video;
    var imageToUpload: boolean = image != null && image != undefined; var videoToUpload: boolean = video != null && video != undefined;

    if (!imageToUpload && !videoToUpload) {
      this.displayPostsChange.emit(true);
      this.postForm.reset();
      return;
    }

    const storage = getStorage();
    var imageUrl = ''; var videoUrl = '';

    await new Promise<void>(async (resolve, reject) => {
      if (imageToUpload) {
        this.imageProgress = 0;
        await new Promise<void>(async (resolve, reject) => {
          const imageRef = ref(storage, `images/${submitDoc.id}`);
          var uploadTask = uploadBytesResumable(imageRef, image!);
          uploadTask.on('state_changed', (snapshot) => {
            this.imageProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(this.imageProgress);
          }, (error) => {
          }, () => {
            getDownloadURL(uploadTask!.snapshot.ref).then(async (downloadURL) => {
              imageUrl = downloadURL;
              await setDoc(submitDoc, { author: this.postForm.value.author ?? '', date: new Date(), title: this.postForm.value.title ?? '', type: "post", content: this.postForm.value.content ?? '', downvotes: 0, upvotes: 0, image: imageUrl, video: '' });
              resolve();
            });
          });
        });
      }
      if (videoToUpload) {
        this.videoProgress = 0;
        await this.processVideo();
        await new Promise<void>((resolve, reject) => {
          video = this.video;
          const videoRef = ref(storage, `videos/${submitDoc.id}`);
          var uploadTask = uploadBytesResumable(videoRef, video!);
          uploadTask.on('state_changed', (snapshot) => {
            this.videoProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(this.videoProgress);
          }, (error) => {
          }, () => {
            getDownloadURL(uploadTask!.snapshot.ref).then(async (downloadURL) => {
              videoUrl = downloadURL;
              await setDoc(submitDoc, { author: this.postForm.value.author ?? '', date: new Date(), title: this.postForm.value.title ?? '', type: "post", content: this.postForm.value.content ?? '', downvotes: 0, upvotes: 0, image: imageUrl, video: videoUrl });
              resolve();
            });
          })
        });
      }
      if (this.imageProgress == 100 && this.videoProgress == 100) {
        this.displayPostsChange.emit(true);
        this.postForm.reset();
        this.video = null; this.image = null;
      }
      resolve();
    });
  }
}
