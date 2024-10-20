import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import {AngularFireAnalytics} from '@angular/fire/analytics';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'tfounion-finance';

  constructor(public auth: AngularFireAuth,
              public analytics:AngularFireAnalytics,
              private router: Router){}
  ngOnInit(){

      this.auth.onAuthStateChanged((user)=>{
          if(user){
              this.analytics.setUserId(user.email);
          }
      });
  }
}


