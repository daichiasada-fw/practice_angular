import {COMMA,ENTER} from '@angular/cdk/keycodes';
import {AngularFireAuth} from '@angular/fire/auth';
import {Component,OnInit,Inject,ViewChild,ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';

import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ComService} from '../../../shared/services/com.service';
import {ExecutionStatus} from '../../../shared/models/ExecutionStatus';
import {User} from '../../../shared/models/User';
import {Account} from '../../../shared/models/Account';

import {CreditUseMonthReportTran} from '../../models/tranCreditUseMonthReport';
import {CreditUseMonthCheckService} from '../../services/credit-use-month-check.service';

@Component({
  selector: 'app-credit-use-month-add',
  templateUrl: './credit-use-month-add.component.html',
  styleUrls: ['./credit-use-month-add.component.css']
})

/**
* クレジットカード月次レポートを追加するための画面コンポーネント
*/
export class CreditUseMonthAddComponent implements OnInit {

    // 操作中ユーザー
    operator:firebase.User;

    // メッセージ
    messages:any;

    // 請求月のプルダウン選択肢
    months: number[];

    // 処理状況
    executionStatus: ExecutionStatus = new ExecutionStatus();

    // バインドデータ
    model:CreditUseMonthReportTran;

    constructor(private comService:ComService,
                private service:CreditUseMonthCheckService,
                private snackBar: MatSnackBar,
                private dialogRef:MatDialogRef<CreditUseMonthAddComponent>,
                private auth:AngularFireAuth,
                @Inject(MAT_DIALOG_DATA) public data:CreditUseMonthReportTran) {
    }

    /**
    画面初期処理
    */
    async ngOnInit() {

        // 利用者を取得
        this.operator = await this.auth.currentUser;

        // モデルの初期化
        this.model = this.initModel();

        // メッセージ一覧を取得
        this.comService.fetchRemoteConfigValue('CreditMonthReportViewMessages').then(value =>{
            this.messages = JSON.parse(value.asString());
        });

        // 月プルダウンの初期化
        this.months = [8,9,10,11,12,1,2,3,4,5,6,7];
    }

    /**
    * 追加処理
    * @event 報告ボタンをクリックした時
    */
    async execProcess(){

        // 処理状況の更新
        this.executionStatus.toExec();

        // 登録
        try {
            await this.service.addCreditUseMonthReport(this.model);

            // 完了メッセージを表示
            let snakbarRef = this.snackBar.open(this.messages.normal_end, "OK", { duration: 1000 ,horizontalPosition:"start" });
            this.executionStatus.toFinish();

            // 完了メッセージ終了時の処理
            snakbarRef.afterDismissed().toPromise().then(()=>{
                this.dialogRef.close();
            });

        }catch(e){
            console.log(e);
            this.snackBar.open(this.messages.abnormal_end, "Close", { duration: 1000});
            this.executionStatus.reset();
        }
    }

    /**
    * クレジットカード月次利用報告の初期表示
    * @returns クレジットカード月次利用報告オブジェクト.
    */
    private initModel():CreditUseMonthReportTran {

        let model:CreditUseMonthReportTran;
        model = {
            bizYear          :2020,
            month            :7,
            inVoiceDateFrom  :new Date(),
            inVoiceDateTo    :new Date(),
            isFix            :false,
            order            :0
        };
        return model;
    }
}
