import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginButtonImage = '/assets/btn_google_signin_dark_normal_web.png';

  constructor(public auth: AngularFireAuth,
              private snackBar: MatSnackBar,
              private router: Router){}

  ngOnInit(): void {
      this.auth.user.subscribe(user =>{
          if(user !== null){
            this.router.navigate(['credituse/hist']);
          }
      });
  }

  login(){
      this.loginButtonImage = '/assets/btn_google_signin_dark_pressed_web.png';
      this.auth.signInWithPopup(new auth.GoogleAuthProvider())
      .then(x =>{
          if(x.user){
            this.snackBar.open("ログインに成功しました。", "OK", { duration: 1000 ,horizontalPosition:"start" });
            this.router.navigate(['credituse/hist']);
          }
      })
      .catch((error)=>
      {
          //console.log(error);
      });
  }
}
