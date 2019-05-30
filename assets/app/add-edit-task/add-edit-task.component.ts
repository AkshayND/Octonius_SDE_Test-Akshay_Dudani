import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Task } from '../models/task.model';
import { AppService } from '../app.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';

const URL = 'http://localhost:3000/tasks/uploadImage';

@Component({
  selector: 'app-add-edit-task',
  templateUrl: './add-edit-task.component.html',
  styleUrls: ['./add-edit-task.component.css']
})
export class AddEditTaskComponent implements OnInit {

  addEditTaskForm: FormGroup;
  functionality: string;
  userId: string;
  taskHeading: string;
  task: Task;
  uploader: FileUploader;
  imgSrc: string;
  showImageAdd = false;
  image: any;
  respObject: any;
  // errorMsg = '';
  // errorHeading = '';
  // errorPresent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private appService: AppService
  ) { }

  ngOnInit() {
    console.log(this.route)
    this.userId = localStorage.getItem('userId');
    let heading = '';
    let content = '';
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.functionality = params['functionality'];
        if (this.functionality === 'Edit') {
          this.taskHeading = params['taskHeading'];
          this.appService.getTask(this.taskHeading, this.userId)
            .subscribe(
              (response: Response) => {
                this.task = response['object'];
                console.log(response);
                this.addEditTaskForm = new FormGroup({
                  'heading': new FormControl(this.task.heading, [Validators.required]),
                  'content': new FormControl(this.task.content, []),
                });
                this.imgSrc = 'data:' + this.task.image.contentType + ';base64,' + this.task.image.image;
              },
              (error: Response) => {
                console.log(error);
              }
            );
        }
        else {
          this.addEditTaskForm = new FormGroup({
            'heading': new FormControl(heading, [Validators.required]),
            'content': new FormControl(content, []),
          });
        }
      }
    );
  }

  back() {
    this.location.back();
  }

  addSaveTask() {
    const value = this.addEditTaskForm.value;
    const newTask = new Task(
      value.heading,
      value.content,
      new Date(),
      false,
      this.userId
    );
    if (this.functionality === 'Add') {

      this.appService.addTask(newTask)
        .subscribe(
          (response: Response) => {
            console.log(response);
            this.location.back();
          },
          (error: Response) => {
            console.log(error);
          }
        );
    }
    else {
      this.appService.updateTask(this.task._id, newTask)
        .subscribe(
          (response: Response) => {
            console.log(response);
            this.location.back();
          },
          (error: Response) => {
            console.log(error);
          }
        );
    }
  }

}
