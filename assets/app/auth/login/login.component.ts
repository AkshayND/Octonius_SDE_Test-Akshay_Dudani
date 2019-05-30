import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  errorMsg = '';
  errorHeading = '';
  errorPresent = false;

  constructor(
    private router: Router,
    private appService: AppService
  ) { }

  ngOnInit() {
    const username = '';
    const password = '';
    this.loginForm = new FormGroup({
      'username': new FormControl(username, [Validators.required]),
      'password': new FormControl(password, [Validators.required])
    });
  }

  login() {
    const value = this.loginForm.value;
    console.log(value);
    this.appService.userSignin(value.username, value.password)
      .subscribe(
        (response: Response) => {
          this.errorPresent = false;
          console.log(response);
          localStorage.setItem('token', response['token']);
          localStorage.setItem('userId', response['userId']);
          this.router.navigate(['home', value.username]);
        },
        (error: Response) => {
          console.log(error);
          this.errorPresent = true;
          this.errorHeading = error['error'].title;
          this.errorMsg = error['error'].error.message;
        }
      );
  }

  createAccount() {
    this.router.navigate(['signup']);
  }

}
