import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppService } from '../../app.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  errorMsg = '';
  errorHeading = '';
  errorPresent = false;
  accountCreated = false;

  constructor(private appService: AppService) { }

  ngOnInit() {
    const name = '';
    const email = '';
    const username = '';
    const password = '';
    this.signupForm = new FormGroup({
      'name': new FormControl(name, [Validators.required]),
      'email': new FormControl(email, [Validators.required, Validators.email]),
      'username': new FormControl(username, [Validators.required, Validators.minLength(8)], this.checkUsername.bind(this)),
      'password': new FormControl(password, [Validators.required, Validators.minLength(8)])
    });
  }


  checkUsername(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
    const username = control.value;
    if (username.length >= 8) {
      this.appService.userUsernameAvailable(username)
        .subscribe(
          (response: Response) => {
            console.log(response);
            if (response['object'] != null) {
              resolve({ 'usernameIsInvalid': true });
            }
            else{
              resolve(null);
            }
          },
          (error: Response) => {
            console.log(error);
            resolve({'usernameIsInvalid': true});
          }
      );
    }
    });
    return promise;
  }

  onSignup() {
    const value = this.signupForm.value;
    const user = new User(
      value.name,
      value.email,
      value.username,
      value.password
    );
    this.appService.addUser(user)
      .subscribe(
        (response: Response) => {
          console.log(response);
          this.accountCreated = true;
        },
        (error: Response) => {
          console.log(error);
          this.errorPresent = true;
          this.errorHeading = error['error'].title;
          this.errorMsg = error['error'].error.message;
        }
      );
  }

}
