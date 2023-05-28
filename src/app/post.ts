export interface Post {
  id: string;
  author: string;
  date: Date;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  type: string;
  image: string;
  video: string;
}