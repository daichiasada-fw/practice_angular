import {Component,OnInit,Inject,ViewChild,ElementRef} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {FormControl} from '@angular/forms';

import {MatTableDataSource} from '@angular/material/table';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import {from} from 'rxjs';
import {map,startWith,reduce} from 'rxjs/operators';

import {ComService} from '../../../shared/services/com.service';
import {ExecutionStatus} from '../../../shared/models/ExecutionStatus';
import {User} from '../../../shared/models/User';

import {CreditUseTran,CreditUseModalPass} from '../../models/tranCreditUse';
import {CreditUserTran,CreditUserView} from '../../models/tranCreditUser';
import {CreditUseService} from '../../services/credit-use.service';

@Component({
  selector: 'app-credit-use-edit-return-amount',
  templateUrl: './credit-use-edit-return-amount.component.html',
  styleUrls: ['./credit-use-edit-return-amount.component.css']
})

/**
* 返金情報を登録変更するための画面コンポーネント
*/


export class CreditUseEditReturnAmountComponent implements OnInit {
    // ロード中
    isLoaded:boolean = false;

    // ゲスト用アドレスの接頭辞
    readonly prefixGestAddress = '_gest_';

    // ドメイン
    domain:string;

    // メッセージ
    messages:any;

    // 利用者の選択肢
    users: User[];

    // 返金方法の選択肢
    returnMethods = [];

    // 処理状況
    executionStatus: ExecutionStatus = new ExecutionStatus();

    // バインドデータ
    readOnlymodel:CreditUseTran;
    models:CreditUserView[] = new Array;

    // 返金一覧
    displayedColumns:string[]= ['select','name','emailAddress','returnAmount','returnMethod'];
    dataSource:MatTableDataSource<CreditUserView>;
    selection: SelectionModel<CreditUserView>;

    constructor(private comService:ComService,
                private service:CreditUseService,
                private snackBar: MatSnackBar,
                public dialogRef:MatDialogRef<CreditUseEditReturnAmountComponent>,
                @Inject(MAT_DIALOG_DATA) public data:CreditUseModalPass) {
    }

    /**
    画面初期処理
    */
    ngOnInit(): void {

        // 一覧画面のデータを連携
        this.readOnlymodel = this.data.data;
        this.readOnlymodel.returnAmountSum = 0;
        this.readOnlymodel.useDate =  this.comService.timestamp2Date(this.data.data.useDate);

        // ドメインを取得
        this.comService.fetchRemoteConfigValue('domain').then(domain =>{
            this.domain = domain.asString();
        });

        // 返金方法一覧の初期化
        this.comService.fetchRemoteConfigValue('returnMethods').then(x => {
            this.returnMethods = JSON.parse(x.asString()).returnMethods;
        });

        // メッセージ一覧を取得
        this.comService.fetchRemoteConfigValue('ReturnAmountViewMessages').then(value =>{
            this.messages = JSON.parse(value.asString());
        });

        // 利用者一覧を取得
        this.service.featchCreditUsers(this.readOnlymodel.id)
        .then(x => 
        {
            x.forEach((doc,i) => {

                let model = {
                    cardUserId        : (doc.cardUserId.startsWith(this.prefixGestAddress) === true) ? '' : doc.cardUserId,
                    cardUserName      : doc.cardUserName,
                    returnAmount      : (doc.returnAmount     === undefined) ? 0  : doc.returnAmount,
                    returnMethodCode  : (doc.returnMethodCode === undefined) ? '' : doc.returnMethodCode,
                    returnMethodName  : (doc.returnMethodName === undefined) ? '' : doc.returnMethodName
                };

                // IDを持たない人は後ろに表示
                let position = (model.cardUserId === '') ? i + 100 : i;

                this.models.push({position: position, data: model});
                this.readOnlymodel.returnAmountSum += model.returnAmount;
            });
        })
        .then(()=>{
            this.models.sort((a,b)=>{
                if(a.position < b.position) return -1;
                if(a.position > b.position) return 1;
                return 0;
            })
        })
        .then(()=>{
            // 返金一覧の生成
            this.dataSource = new MatTableDataSource<CreditUserView>(this.models);
            this.selection  = new SelectionModel<CreditUserView>(true,[]);

            // メールアドレス入力用のフォームコントロールを生成
            // セレクトボックスの初期化
            this.dataSource.data.forEach(x => {
                if(x.data.returnAmount > 0){ this.selection.select(x);}
                x.userControl = new FormControl({ value: x.data.cardUserId, disabled: !this.selection.isSelected(x)});
            });

            this.isLoaded = true;
        });

        // 利用者オートコンプリートの初期化
        this.comService.fetchUsers().then((users => 
        {
            this.users = users;
            this.dataSource.data.forEach(data => {
                data.filteredUsers = data.userControl.valueChanges.pipe(
                startWith(null),
                map((emailAddress: string) => this._filter(emailAddress)));
            });
        }));
    }

    /**
    * 変更処理
    * @event 報告ボタンをクリックした時
    */
    async execProcess() {

        // 返金合計額の整合性チェック
        if(this.readOnlymodel.returnAmount != this.readOnlymodel.returnAmountSum){
            this.snackBar.open(this.messages.amount_an_match, "Close", { duration: 3000});
            return;
        }

        // 入力チェック
        if(this.validation() === false){
            return;
        }

        // 処理状況の更新
        this.executionStatus.toExec();

        // ViewModelからデータ部を取り出す
        let dataModels:CreditUserTran[] = [];
        this.dataSource.data.forEach(x => { dataModels.push(x.data);});

        try {

            // 登録処理
            await this.service.updateCreditReturnAmounts(this.readOnlymodel.id,dataModels);

            // 処理が速すぎるのでWait
            await this.comService.sleep(500);

            // 完了メッセージの表示
            let snakbarRef = this.snackBar.open(this.messages.normal_end, "OK", { duration: 1000 ,horizontalPosition:"start" });
            snakbarRef.afterDismissed().toPromise().then(()=>{
                this.dialogRef.close();
            });

            this.executionStatus.toFinish();

        }catch(e){
            this.snackBar.open(this.messages.abnormal_end, "Close", { duration: 1000});
            this.executionStatus.reset();
            return;
        }
    }

    /**
    * 返金額合計を再計算
    * @event 各返金金額入力時.
    */
    sumChange(){
        this.readOnlymodel.returnAmountSum = 0;
        from(this.models).pipe(reduce((acc,val)=> acc + val.data.returnAmount, 0))
        .subscribe((sum:number) => { this.readOnlymodel.returnAmountSum = sum});
    }

    /**
    *チェックボックス変更時の処理
    * @param event 
    * @param row 操作対象のオブジェクト
    * @event 返金対象から除外した時.
    */
    changeSelect(event, row:CreditUserView){
        if(!event) return null;
        this.selection.toggle(row)
        this.changeSelectModel(row);
    }

    /**
    * 返金額合計を再計算
    * @param event 
    * @param row 操作対象のオブジェクト
    * @event 返金対象から除外した時.
    */
    changeSelectModel(row:CreditUserView){

        if(this.selection.isSelected(row) == true) {
            row.userControl.enable();
            if(row.data.returnMethodCode === ''){
                row.data.returnMethodCode = 'DEDU';
            }
        }else{
            row.userControl.disable();
            this.readOnlymodel.returnAmountSum = 0;
            row.data.returnAmount = 0;
            row.data.returnMethodCode = '';
            from(this.models).pipe(reduce((acc,val)=> acc + val.data.returnAmount, 0))
            .subscribe((sum:number) => { this.readOnlymodel.returnAmountSum = sum});
        }
    }

    /**
    * 返金額から担当へ返金額を割り振り
    * @event 自動計算ボタンをクリック.
    */
    execAutoCalc(){

        // 入力チェック
        if(this.validation() === false) return;

        // チェック済みのデータのみ抽出
        let dataModels = new Array();
        this.dataSource.data.forEach(x => {
            if(this.selection.isSelected(x) === true){
                dataModels.push(x.data);
            }
        });

        // 初期化
        this.readOnlymodel.returnAmountSum = 0;
        this.models.forEach(x => {x.data.returnAmount = 0});

        // 計算
        dataModels = this.service.allocationReturnAmount(dataModels, this.readOnlymodel.returnAmount);

        // 計算結果をモデルに戻す
        this.models.forEach(x => {
            if(this.selection.isSelected(x) === false) {return;}
            let tempModel = dataModels.find(y => y.cardUserId === x.data.cardUserId);
            if(tempModel !== null) {x.data = tempModel;}
        });

        // 合計を再計算
        from(this.models).pipe(reduce((acc,val)=> acc + val.data.returnAmount, 0))
        .subscribe((sum:number) => { this.readOnlymodel.returnAmountSum = sum});
    }

    /**
    * AutoComplateの選択肢を生成
    * @event アドレス入力欄フォーカス時.
    */
    getAutoComplate(){
        this.dataSource.data.forEach(data => {
            data.filteredUsers = data.userControl.valueChanges.pipe(
            startWith(null),
            map((emailAddress: string) => this._filter(emailAddress)));
        });
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

        //１．既に選択済みのユーザーは選択肢に表示しない
        this.models.forEach(x => {
            for(var key in result) {
                if(result[key].emailAddress == x.data.cardUserId) {
                    result.splice(Number(key),1);
                }
            }
        });

        if(value === '' || value === null || value === undefined){ 
            return result;
        }

        const filterValue = value.toLowerCase();
        result = result.filter(user => user.emailAddress.toLowerCase().replace(this.domain,'').indexOf(filterValue) >= 0);
        return result;
    }

    /**
    * 入力チェック処理
    * @returns ok:true.
    */
    validation(){
        let dataModels = new Array();
        this.dataSource.data.forEach(x => {
            if(this.selection.isSelected(x) === true){
                dataModels.push(x.data);
            }
        });

        // 入力チェック
        for(let model of dataModels){

            let message = '';
            if(model.cardUserId       === '') { message = this.messages.not_found_email;}
            if(model.returnMethodCode === '') { message = this.messages.not_found_return_method;}

            if(message !== '') {
                this.snackBar.open(message, "Close", { duration: 3000});
                this.executionStatus.reset();
                return false;
            }
        }

        return true;
    }
    /**
    * チェックボックスがすべて選択されているか判定
    * @returns 全てチェック:true.
    */
    isAllSelected() {
        const numSlected = this.selection.selected.length;
        const numRows    = this.dataSource.data.length;
        return (numSlected === numRows);
    }

    /**
    * チェックボックスの一括変更
    * @event ヘッダー列のチェックボックスをクリック
    */
    masterToggle() {

        if(this.isAllSelected() === true) {
            this.selection.clear();
        }else {
            // 全項目チェック
            this.dataSource.data.forEach(row => { this.selection.select(row); });
        }

        // セレクトボックスに対応してモデルを変更
        this.dataSource.data.forEach(row => {
            this.changeSelectModel(row);
        });
    }
    /**
    * チェックボックスのラベル表現
    */
    checkboxLabel(row?:CreditUserView){
        if(!row){
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }else{
            return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position}`;
        }
    }
}
