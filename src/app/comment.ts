export interface Comment {
  id: string;
  author: string;
  date: Date;
  content: string;
  upvotes: number;
  downvotes: number;
  post: string;
  type: string;
}