import * as firebase from 'firebase';

import {AngularFireAuth} from '@angular/fire/auth';
import {Component,OnInit} from '@angular/core';

import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'app-operator-info-dialog',
  templateUrl: './operator-info-dialog.component.html',
  styleUrls: ['./operator-info-dialog.component.css']
})
export class OperatorInfoDialogComponent implements OnInit {

    // 操作中ユーザー
    operator:firebase.User;

    constructor(private snackBar: MatSnackBar,
                private dialogRef:MatDialogRef<OperatorInfoDialogComponent>,
                private auth:AngularFireAuth,
                private router: Router){}

    ngOnInit(): void {
        this.auth.currentUser.then(x => this.operator = x);
    }

    logout(){
        this.auth.signOut()
        .then(() =>{
            // 完了メッセージを表示
            let snakbarRef = this.snackBar.open('ログアウトが完了しました。', "OK", { duration: 1000 ,horizontalPosition:"start" });
            this.router.navigate(['']);
            this.dialogRef.close();
        });
    }
}
