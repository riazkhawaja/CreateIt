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

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(private imageCompress: NgxImageCompressService) {
    this.displayPosts = false;
    this.imageProgress = 100;
    this.videoProgress = 100;
  }

  postForm = new FormGroup({
    author: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
    content: new FormControl(''),
    /* image: new FormControl(null),
    video: new FormControl(null) */
  });

  imageUpload(event: any) {
    var files = event.target.files;
    this.image = files ? files[0] : null;
    if (this.image) { this.imageProgress = 0; }
  }

  videoUpload(event: any) {
    var files = event.target.files;
    this.video = files ? files[0] : null;
    if (this.video) { this.videoProgress = 0; }
  }

  uploadAndReturnWithMaxSize() {
    /* this.imageCompress.uploadFile().then(({ image, orientation }: UploadResponse) => {
      if (this.imageCompress.byteCount(image) > 1000000) {
        this.imageCompress.compressFile(image, orientation, 60).then((result: DataUrl) => {
          this.postForm.value.image = result;
        })
      } else {
        /* const fileReader = new FileReader();
        fileReader.readAsDataURL(event.target.files[0]); 
        this.postForm.value.image = image;
        return;
      }
    }); */
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
    console.log(image);
    console.log(video);

    await new Promise<void>(async (resolve, reject) => {
      if (imageToUpload) {
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
        await new Promise<void>((resolve, reject) => {
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
