import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Task } from '../models/task.model';
import { AppService } from '../app.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';

// const URL = 'http://localhost:3000/tasks/uploadImage';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit, OnChanges {

  @Input() task: Task;
  showContentAdd = false;
  showImageAdd = false;
  editForm: FormGroup;
  uploader: FileUploader;
  imgSrc: string;
  URL: string;
  updatingTask = false;

  constructor(private appService: AppService, private router: Router) { }

  ngOnInit() {
    // console.log(this.task.image);
    // if (this.task.image !== undefined) {
    //   this.imgSrc = 'data:' + this.task.image.contentType + ';base64,' + this.task.image.image;
    // }
    this.URL = this.appService.serverURL + '/tasks/uploadImage';
  }

  ngOnChanges(changes: SimpleChanges) {
    // for (let propName in changes) {

    //   /*let chng = changes[propName];
    //   let cur  = JSON.stringify(chng.currentValue);
    //   let prev = JSON.stringify(chng.previousValue);
    //   this.changeLog.push(`propName: currentValue = cur, previousValue = prev`);*/
    // }
    console.log(this.task.image);
    if (this.task.image !== undefined) {
      this.imgSrc = 'data:' + this.task.image.contentType + ';base64,' + this.task.image.image;
    }

    this.showContentAdd = false;
    this.showImageAdd = false;
  }

  toggleShowAddContent() {
    this.showContentAdd = !this.showContentAdd;
    if (this.showContentAdd === true) {
      this.editForm = new FormGroup({
        'content': new FormControl('', [Validators.required])
      });
    }
    else {
      this.editForm = null;
    }
  }

  saveContent() {
    const value = this.editForm.value;
    this.task.content = value.content;
    this.appService.updateTask(this.task._id, this.task).subscribe(
      (response: Response) => {
        console.log(response);
        this.appService.passUpdatedTask(this.task);
      },
      (error: Response) => {
        console.log(error);
      }
    );
  }

  toggleAddImage(){
    this.showImageAdd = !this.showImageAdd;
    if ( this.showImageAdd) {
      this.uploader = new FileUploader({url: this.URL + '?taskId=' + this.task._id, itemAlias: 'myImage'});
      this.uploader.onAfterAddingFile = (file)=> { file.withCredentials = false; };
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers:any) => {
          console.log("ImageUpload:uploaded:", item, status);
          if(status === 201){
            this.updatingTask = true
            this.appService.getTask(this.task.heading, this.task.user).subscribe(
              (response: Response) => {
                console.log(response);
                this.task = response['object'];
                this.imgSrc = 'data:' + this.task.image.contentType + ';base64,' + this.task.image.image;
                this.appService.passUpdatedTask(this.task);
                this.updatingTask = false;
              },
              (error: Response) => {
                console.log(error);
              }
            )
          }
      };
    }
    else {
      this.uploader = undefined;
    }
  }

  completeTask() {
    this.task.completed = !this.task.completed;
    this.appService.updateTask(this.task._id, this.task).subscribe(
      (response: Response) => {
        console.log(response);
        this.appService.passUpdatedTask(this.task);
      },
      (error: Response) => {
        console.log(error);
      }
    );
  }

  editTask(){
    this.router.navigate(['addEditTask'], {queryParams: {functionality: 'Edit', taskHeading: this.task.heading}});
  }

}
