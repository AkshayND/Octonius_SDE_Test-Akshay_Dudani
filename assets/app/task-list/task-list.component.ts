import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../app.service';
import { Task } from '../models/task.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {

  @Input() tasks: Task[] = [];
  showAddForm = false;
  addTaskForm: FormGroup;
  @Input() userId: string;
  selectedTask: Task;
  updatedTaskSubscription: Subscription;
  checkingAvailability: boolean = false;
  addingTask = false;
  removingTask = false;
  updatingTask = false;


  constructor(private appService: AppService) { }

  ngOnInit() {
  }

  completeTask(task: Task) {
    task.completed = !task.completed;
    this.updatingTask = true;
    this.appService.updateTask(task._id,task).subscribe(
      (response: Response) => {
        console.log(response);
        if (this.selectedTask != undefined && task.heading === this.selectedTask.heading) {
          this.selectedTask = task;
          this.appService.selectTask(this.selectedTask);
        }
        this.updatingTask = false;
      },
      (error: Response) => {
        console.log(error);
        this.updatingTask = false;
      }
    );
  }

  selectTask(task: Task) {
    if (this.selectedTask === undefined) {
      this.selectedTask = task;
    }
    else if(this.selectedTask.heading !== task.heading){
      this.selectedTask = task;
    }
    else {
      this.selectedTask = undefined;
    }
    this.appService.selectTask(this.selectedTask);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.addTaskForm = new FormGroup({
        'heading': new FormControl('', [Validators.required], this.checkTask.bind(this))
      });
    }
    else {
      this.addTaskForm = null;
    }
  }

  removeTask(task: Task){
    const ind = this.tasks.indexOf(task);
    this.removingTask = true;
    this.appService.deleteTask(task._id, task.user)
      .subscribe(
        (response: Response) => {
          console.log(response);
          this.tasks.splice(ind, 1);
          if ( this.selectedTask !== undefined && task.heading === this.selectedTask.heading ) {
            this.selectedTask = undefined;
            this.appService.selectTask(this.selectedTask);
          }
          this.removingTask = false;
        },
        (error: Response) => {
          console.log(error);
          this.removingTask = false;
        }
      )
  }

  checkTask(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
    const task = control.value;
    if (task.length >= 1) {
      console.log(this.userId);
      this.checkingAvailability = true;
      this.appService.taskAvailable(task, this.userId)
        .subscribe(
          (response: Response) => {
            console.log(response);
            this.checkingAvailability = false;
            if (response['object'] != null) {
              resolve({ 'taskIsInvalid': true });
            }
            else{
              resolve(null);
            }
          },
          (error: Response) => {
            console.log(error);
            this.checkingAvailability = false;
            resolve({'taskIsInvalid': true});
          }
      );
    }
    });
    return promise;
  }

  saveAdd() {
    const value = this.addTaskForm.value;
    const newTask = new Task(
      value.heading,
      '',
      new Date(),
      false,
      this.userId
    );
    this.addingTask = true;
    this.appService.addTask(newTask)
      .subscribe(
        (response: Response) => {
          console.log(response);
          this.tasks.push(response['object']);
          this.toggleAddForm();
          this.addingTask = false;
        },
        (error: Response) => {
          console.log(error);
          this.addingTask = false;
        }
      );
  }

}
