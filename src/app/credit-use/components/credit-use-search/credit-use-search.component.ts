import {Component, OnInit,Inject} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ComService} from '../../../shared/services/com.service';
import {User} from '../../../shared/models/User';
import {Account} from '../../../shared/models/Account';

import {CreditUseSearchContainer,CreditUseSearchContainerModalPass} from '../../models/tranCreditUse';

@Component({
  selector: 'app-credit-use-search',
  templateUrl: './credit-use-search.component.html',
  styleUrls: ['./credit-use-search.component.css']
})

/**
* クレジットカード利用報告の検索条件を指定するための画面コンポーネント
*/
export class CreditUseSearchComponent implements OnInit {

    // 利用者の選択肢
    users: User[];
    filteredUsers: Observable<User[]>;
    usersControl = new FormControl();

    // 科目のプルダウン選択肢
    accounts: Account[];

    // バインドデータ
    model:CreditUseSearchContainer;

    constructor(private comService:ComService,
                private dialogRef:MatDialogRef<CreditUseSearchComponent>,
                @Inject(MAT_DIALOG_DATA) private data:CreditUseSearchContainerModalPass) {
    }

    /**
    画面初期処理
    */
    ngOnInit(): void {

        // 検索条件の初期化
        this.model = this.data.data;

        // Keyを押した時の処理
        this.dialogRef.keydownEvents().subscribe(event => {
            if (event.key === "Escape") {
                this.onCancel();
            }
            if (event.key === "Enter") {
                this.onExec();
            }
        });

        // バックドロップ部分を押下した時
        this.dialogRef.backdropClick().subscribe(event => {
            this.onCancel();
        });

        // 科目プルダウンの初期化
        this.comService.fetchAccounts().then((accounts => {this.accounts = accounts;}));

        // 利用者オートコンプリートの初期化
        this.comService.fetchUsers().then((users => 
        {
            this.users = users;
            this.filteredUsers = this.usersControl.valueChanges.pipe(
            startWith(null),
            map((emailAddress: string) => this.userFilter(emailAddress)));
        }));
    }

    /*
        検索時の処理
    */
    onExec(): void {
        this.dialogRef.close({
            data:this.model,
            isCancel:false
        });
    }

    /*
        キャンセル時の処理
    */
    onCancel(): void {
        this.dialogRef.close({
            data:this.model,
            isCancel:true
        });
    }

    /*
    検索条件の開始日付
    開始日の一週間後
    */
    calcStartAtToDate(): Date {
        if(this.model.useDateFrom === null) {
            return new Date();
        }

        return new Date(this.model.useDateFrom.getFullYear(),
                        this.model.useDateFrom.getMonth(),
                        this.model.useDateFrom.getDate() + 7);
    }


    /**
    * AutoComplateの選択肢を生成
    * １．前後方一致で検索
    * ２．大文字小文字は区別しない
    * @param value  検索ワード.
    * @returns ユーザー情報.
    */
    private userFilter(value: string): User[] {
        let result = this.users.filter(user => true);

        if(value === '' || value === null || value === undefined){ 
            return result;
        }

        const filterValue = value.toLowerCase();
        result = this.users.filter(user => user.emailAddress.toLowerCase().indexOf(filterValue) >= 0);
        return result;
    }
}
