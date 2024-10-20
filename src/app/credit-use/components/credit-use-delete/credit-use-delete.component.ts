import {Component, OnInit,Inject} from '@angular/core';

import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ExecutionStatus} from '../../../shared/models/ExecutionStatus';
import {ComService} from '../../../shared/services/com.service';

import {CreditUseTran,CreditUseModalPass} from '../../models/tranCreditUse';
import {CreditUseService} from '../../services/credit-use.service';

@Component({
  selector: 'app-credit-use-delete',
  templateUrl: './credit-use-delete.component.html',
  styleUrls: ['./credit-use-delete.component.css']
})

/**
* クレジットカード利用報告を削除するための画面コンポーネント
*/
export class CreditUseDeleteComponent implements OnInit {
    // メッセージ
    messages:any;

    // 処理状況
    executionStatus: ExecutionStatus = new ExecutionStatus();

    // バインドデータ
    model:CreditUseTran;

    constructor(private comService:ComService,
                private serivce:CreditUseService,
                private snackBar: MatSnackBar,
                private dialogRef:MatDialogRef<CreditUseDeleteComponent>,
                @Inject(MAT_DIALOG_DATA) private data:CreditUseModalPass) {

    }

    /**
    画面初期処理
    */
    ngOnInit(): void {
        // 一覧画面のデータを連携
        this.model = this.data.data;

        // メッセージ一覧を取得
        this.comService.fetchRemoteConfigValue('CreditHistryViewMessages').then(value =>{
            this.messages = JSON.parse(value.asString());
        });
    }

    /**
    * 削除処理
    * @event 削除ボタンをクリックした時
    */
    async execProcess(){

        // 処理状況の更新
        this.executionStatus.toExec();

        try {
            await this.serivce.deleteCreditUseHistry(this.model.id)

            // 完了メッセージを表示
            let snakbarRef = this.snackBar.open(this.messages.del_normal_end, "OK", { duration: 1000 ,horizontalPosition:"start" });
            this.executionStatus.toFinish();

            // 完了メッセージ終了時の処理
            snakbarRef.afterDismissed().toPromise().then(()=>{
                this.dialogRef.close();
            });

        } catch(e) {
            this.snackBar.open(this.messages.abnormal_end, "Close", { duration: 1000});
            this.executionStatus.reset();
            return;
        }
    }
}
