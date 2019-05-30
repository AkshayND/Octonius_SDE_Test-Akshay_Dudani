import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from '../models/user.model';
import { Task } from '../models/task.model';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  user: User;
  selectTaskSubscription: Subscription;
  updatedTaskSubscription: Subscription;
  selectedTask: Task;
  showSearch = false;
  searchForm: FormGroup;
  searchResults: Task[];
  gotTasks = false;
  filterTasks = false;

  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        const username = params['username'];
        this.appService.getUser(username)
          .subscribe(
            (response: Response) => {
              console.log(response);
              this.user = response['object'];
              this.appService.getTasks(this.user._id)
                .subscribe(
                  (response: Response) => {
                    console.log(response);
                    this.user.tasks = response['object'];
                    this.gotTasks = true;
                    this.searchResults = response['object'];
                    this.selectTaskSubscription = this.appService.selectedTask.subscribe(
                      (task: Task) => {
                        console.log(task);
                        this.selectedTask = task;
                      }
                    );

                    this.updatedTaskSubscription = this.appService.updatedTask.subscribe(
                      (updatedTask: Task) => {
                        this.appService.getTasks(this.user._id).subscribe(
                          (response: Response) => {
                            console.log(response);
                            this.user.tasks = response['object'];
                          },
                          (error: Response) => {
                            console.log(error);
                          }
                        );
                      }
                    );
                  },
                  (error: Response) => {
                    console.log(error);
                  }
                )
            },
            (error: Response) => {
              console.log(error);
            }
          );
      }
    );
  }

  toggleShowSearch(){
    this.showSearch = !this.showSearch;
    if(this.showSearch){
      const searchText = '';
      this.searchForm = new FormGroup({
        'searchText': new FormControl(searchText)
      });
      this.searchForm.controls['searchText'].valueChanges.subscribe(
        (searchText: string) => {
          this.filterTasks = true;
          this.appService.searchTasks(this.user._id, searchText).subscribe(
            (response: Response) => {
              console.log(response);
              this.searchResults = response['object'];
              this.filterTasks = false;
            },
            (error: Response) => {
              console.log(error);
              this.filterTasks = false;
            }
          )
        }
      )
    }
    else{
      this.searchForm = undefined;
      this.searchResults = this.user.tasks;
    }
  }

  addTask() {
    this.router.navigate(['addEditTask'], {queryParams: {functionality: 'Add'}});
  }

  ngOnDestroy() {
    this.selectTaskSubscription.unsubscribe();
    this.updatedTaskSubscription.unsubscribe();
  }

}
