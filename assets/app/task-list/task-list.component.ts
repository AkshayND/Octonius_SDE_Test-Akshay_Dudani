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


  constructor(private appService: AppService) { }

  ngOnInit() {
  }

  completeTask(task: Task) {
    task.completed = !task.completed;
    this.appService.updateTask(task._id,task).subscribe(
      (response: Response) => {
        console.log(response);
        if (task.heading === this.selectedTask.heading) {
          this.selectedTask = task;
          this.appService.selectTask(this.selectedTask);
        }
      },
      (error: Response) => {
        console.log(error);
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
    this.appService.deleteTask(task._id, task.user)
      .subscribe(
        (response: Response) => {
          console.log(response);
          this.tasks.splice(ind, 1);
          if ( this.selectedTask !== undefined && task.heading === this.selectedTask.heading ) {
            this.selectedTask = undefined;
            this.appService.selectTask(this.selectedTask);
          }
        },
        (error: Response) => {
          console.log(error);
        }
      )
  }

  checkTask(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
    const task = control.value;
    if (task.length >= 1) {
      console.log(this.userId);
      this.appService.taskAvailable(task, this.userId)
        .subscribe(
          (response: Response) => {
            console.log(response);
            if (response['object'] != null) {
              resolve({ 'taskIsInvalid': true });
            }
            else{
              resolve(null);
            }
          },
          (error: Response) => {
            console.log(error);
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

    this.appService.addTask(newTask)
      .subscribe(
        (response: Response) => {
          console.log(response);
          this.tasks.push(response['object']);
          this.toggleAddForm();
        },
        (error: Response) => {
          console.log(error);
        }
      );
  }

}
