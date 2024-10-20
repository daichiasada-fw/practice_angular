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

import {CreditUseTran,CreditUseView,CreditUseModalPass} from '../../models/tranCreditUse';
import {CreditUserTran} from '../../models/tranCreditUser';
import {CreditUseService} from '../../services/credit-use.service';

@Component({
  selector: 'app-credit-use-add',
  templateUrl: './credit-use-add.component.html',
  styleUrls: ['./credit-use-add.component.css']
})

/**
* クレジットカード利用報告を追加するための画面コンポーネント
*/
export class CreditUseAddComponent implements OnInit {
    // ドメイン
    domain:string;

    // 操作中ユーザー
    operator:firebase.User;

    // メッセージ
    messages:any;

    // 利用者の選択肢
    users: User[];

    // 科目のプルダウン選択肢
    accounts: Account[];

    // 処理状況
    executionStatus: ExecutionStatus = new ExecutionStatus();

    // バインドデータ
    model:CreditUseView;

    @ViewChild('usersInput') usersInput: ElementRef<HTMLInputElement>;
    constructor(private comService:ComService,
                private service:CreditUseService,
                private snackBar: MatSnackBar,
                private dialogRef:MatDialogRef<CreditUseAddComponent>,
                private auth:AngularFireAuth,
                @Inject(MAT_DIALOG_DATA) public data:CreditUseModalPass) {
    }

    /**
    画面初期処理
    */
    async ngOnInit() {

        // 利用者を取得
        this.operator = await this.auth.currentUser;

        // モデルの初期化
        this.model = this.initModel();

        // 一覧画面からの引継ぎ情報(一覧画面で再利用を選択)
        if(this.data !== undefined && this.data !== null){
            this.model.data = this.copyModel(this.data.data, this.model.data);
        }

        // ドメインを取得
        this.comService.fetchRemoteConfigValue('domain').then(domain => {
            this.domain = domain.asString();
        });

        // メッセージ一覧を取得
        this.comService.fetchRemoteConfigValue('CreditHistryViewMessages').then(value =>{
            this.messages = JSON.parse(value.asString());
        });

        // 科目プルダウンの初期化
        this.comService.fetchAccounts().then(accounts => {
            this.accounts = accounts;
        });

        // 利用者オートコンプリートの初期化
        this.comService.fetchUsers().then(users => 
        {
            this.users = users;
            this.filteredUsers = this.usersControl.valueChanges.pipe(
            startWith(null),
            map((emailAddress: string) => this._filter(emailAddress)));
        });
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
            await this.service.addCreditUseHistry(this.model.data, this.model.users);

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

    // Chips処理
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    usersControl = new FormControl();
    filteredUsers: Observable<User[]>;

    /**
    * 追加したChipに紐づく利用者情報をモデルに追加
    * @param event  イベント情報.
    * @event Chip追加した時
    */
    addChip(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our user
        if ((value || '').trim()) {
            this.model.users.push({cardUserName: event.value, cardUserId: ''});
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.usersControl.setValue(null);
    }

    /**
    * 削除したChipに紐づく利用者情報をモデルから削除
    * @param value  削除するチップ情報.
    * @event Chipを削除した時
    */
    removeChip(user: CreditUserTran): void {
        const index = this.model.users.indexOf(user);

        if (index >= 0) {
            this.model.users.splice(index, 1);
        }
        this.usersControl.setValue(null);
    }

    /**
    * 選択したAutoComplateの情報をモデルに追加
    * @param event  イベント情報.
    * @event AutoComplate選択肢を選択
    */
    selected(event: MatAutocompleteSelectedEvent): void {
        this.model.users.push({cardUserName: event.option.viewValue, cardUserId: event.option.id});
        this.usersInput.nativeElement.value = '';
        this.usersControl.setValue(null);
    }

    /**
    * AutoComplateの選択肢を生成
    * １．既に選択済みのユーザーは選択肢に表示しない
    * ２．前後方一致で検索
    * ３．大文字小文字は区別しない
    * @param value  検索ワード.
    * @returns ユーザー情報.
    */
    private _filter(value: string): User[] {
        let result = this.users.filter(user => true);
        this.model.users.forEach(x => {
            result = result.filter(user => user.emailAddress.indexOf(x.cardUserId) === -1);
        });

        if(value === '' || value === null || value === undefined){ 
            return result;
        }

        const filterValue = value.toLowerCase();
        result = this.users.filter(user => user.emailAddress.toLowerCase().replace(this.domain,'').indexOf(filterValue) >= 0);
        return result;
    }

    /**
    * クレジットカード利用報告の初期表示
    * @returns クレジットカード利用報告オブジェクト.
    */
    private initModel():CreditUseView {

        let model:CreditUseView;
        model = {
            data:{
                bizYear      : 0,
                useDate      : new Date(),
                cardUserId   : this.operator.email,
                cardUserName : this.operator.displayName,
                accountCode  : '',
                accountName  : '',
                reason       : '',
                content      : '',
                amount       : null,
                returnAmount : null,
                _createTimeStamp: null,
                _updateTimeStamp: null
            },
            users: []
        };
        return model;
    }


    /**
    * クレジットカード利用報告の再利用時の項目コピー
    * @param   from コピー元のオブジェクト.
    * @param   to   コピー先のオブジェクト.
    * @returns コピー後のオブジェクト.
    */
    private copyModel(from:CreditUseTran, to:CreditUseTran):CreditUseTran {

        let model:CreditUseTran;
        model = {
            // コピーする項目
            accountCode  : from.accountCode,
            accountName  : from.accountName,
            reason       : from.reason,
            content      : from.content,

            // 初期値をそのまま利用
            bizYear      : to.bizYear,
            useDate      : to.useDate,
            cardUserId   : to.cardUserId,
            cardUserName : to.cardUserName,
            amount       : to.amount,
            returnAmount : to.returnAmount,
            _createTimeStamp: null,
            _updateTimeStamp: null
        };
        return model;
    }
}
