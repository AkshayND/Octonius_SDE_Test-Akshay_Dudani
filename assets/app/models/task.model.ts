export class Task {
  _id: string;
  image: any;
  savedImageName: string;
  constructor(
    public heading: string,
    public content: string,
    public date: Date,
    public completed: boolean,
    public user: any
  ) {}
}
