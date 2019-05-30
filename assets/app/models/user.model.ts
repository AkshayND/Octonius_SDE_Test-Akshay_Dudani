import { Task } from './task.model';

export class User {
  _id: string;
  tasks: Task[];
  constructor(
    public name: string,
    public email: string,
    public username: string,
    public password: string,
  ) {}
}
