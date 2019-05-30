import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from './models/user.model';
import { Task } from './models/task.model';
import { Subject } from 'rxjs';

@Injectable()
export class AppService {

  // public serverURL = 'http://localhost:3000';
  public serverURL = 'http://todoapp-env.s2cuypbsuk.us-east-1.elasticbeanstalk.com';

  public selectedTask = new Subject<Task>();
  public updatedTask = new Subject<Task>();

  constructor(
    private http: HttpClient
  ) {}

  addUser(user: User) {
      const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});

      const body = JSON.stringify(user);
      return this.http.post(this.serverURL + '/users', body, {headers: headers});
  }

  userUsernameAvailable(username: string) {
    const params = new HttpParams().set('validate', 'true');
    return this.http.get(this.serverURL + '/users/' + username, {params: params});
  }

  userSignin(username: string, password: string) {
    const login = {
        username: username,
        password: password
    };
    const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    const body = JSON.stringify(login);
    return this.http.post(this.serverURL + '/users/signin', body, { headers: headers });
  }

  getUser(username: string) {
    return this.http.get(this.serverURL + '/users/' + username);
  }

  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  }

  logout() {
      localStorage.clear();
  }

  getTasks(userId: string) {
    let params = new HttpParams().set('userId', userId);
    return this.http.get(this.serverURL + '/tasks/', {params: params});
  }

  searchTasks(userId: string, searchText: string) {
    let params = new HttpParams().set('userId', userId);
    params = params.append('searchText', searchText);
    return this.http.get(this.serverURL + '/tasks/', {params: params});
  }

  getTask(heading: string, userId: string) {
    const params = new HttpParams().set('userId', userId);
    return this.http.get(this.serverURL + '/tasks/' + heading, {params: params});
  }

  selectTask(task: Task) {
    this.selectedTask.next(task);
  }

  passUpdatedTask(task: Task) {
    this.updatedTask.next(task);
  }

  addTask(task: Task) {
      const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});

      const body = JSON.stringify(task);
      return this.http.post(this.serverURL + '/tasks', body, {headers: headers});
  }

  taskAvailable(heading: string, userId: string) {
    let params = new HttpParams().set('validate', 'true');
    params = params.append('userId', userId);
    return this.http.get(this.serverURL + '/tasks/' + heading, {params: params});
  }

  updateTask(taskId: string, updatedTask: Task) {
    console.log(taskId);
    const headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    const body = JSON.stringify(updatedTask);
    return this.http.patch(this.serverURL + '/tasks/' + taskId, body, {headers: headers});
  }

  deleteTask(taskId: string, userId: string) {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete(this.serverURL + '/tasks/' + taskId, {params: params});
  }

}
