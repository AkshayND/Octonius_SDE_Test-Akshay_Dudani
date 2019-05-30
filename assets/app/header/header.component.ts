import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, private appService: AppService) { }

  ngOnInit() {
  }

  authorize() {
    return this.appService.isAuthenticated();
  }

  logout() {
    this.appService.logout();
    this.router.navigate(['login']);
  }

}
