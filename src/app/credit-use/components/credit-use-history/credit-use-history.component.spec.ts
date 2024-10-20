import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, OnInit,Inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireRemoteConfig } from '@angular/fire/remote-config';

import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForm} from '@angular/forms';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-credit-use-history',
  templateUrl: './credit-use-history.component.html',
  styleUrls: ['./credit-use-history.component.css']
})

export class CreditUseHistoryComponent implements OnInit {

  // 検索Word
  searchWord: string = '';

  // 科目のプルダウン選択肢
  accountCollection:AngularFirestoreCollection<Account>;
  accounts: Account[];

  //プログレスバーの設定
  showProgressbar: boolean = false;

  // Collection名
  readonly firestoreCollectionName:string = 'CreditUseTrans';

  // 一覧表示用のデータ
  collection:AngularFirestoreCollection<CreditUseTran>;
  dataSource:MatTableDataSource<any>;
  displayedColumns: string[] = ['useDate', 
                                'cardUserName',
                                'accountName',
                                'reason', 
                                'content',
                                'amount',
                                'returnAmount',
                                '_createTimeStamp'
                                ];
  // バインドデータ
  model:CreditUseTran = this.initModel();

  constructor(public db:AngularFirestore,
              private _snackBar: MatSnackBar,
              public config: AngularFireRemoteConfig
              ) { }

  
  // 初期処理
  ngOnInit(): void {
    // 全件取得
    this.collection = this.db.collection<CreditUseTran>(this.firestoreCollectionName, ref => ref);
    this.collection.valueChanges().subscribe(data => {
        this.dataSource = new MatTableDataSource(data);
    });

    // 科目プルダウンの初期化
    this.accountCollection = this.db.collection<Account>('Accounts', ref => ref);
    const accountsObservabl = this.accountCollection.valueChanges(); 
    accountsObservabl.subscribe(accounts => this.accounts = accounts);
  }

  // 登録
  async addCresitUseHistory(form:NgForm){
    // ProgresBarの操作
    this.showProgressbar = true;
    
    // 入力データ加工処理
    this.model._createTimeStamp = new Date();
    this.model.useDate.setHours(0, 0, 0, 0);
    this.model.accountName = this.accounts.find(
        (a) => { return (a.accountCode === this.model.accountCode) })
        .accountName;
    this.model.bizYear = await this.calcBizYear(this.model.useDate);
    this.model.users = this.users;
    this.model.reason = this.model.reason.trim();
    this.model.content = this.model.content.trim();

    // 登録
    await this.collection.add(this.model)
        .then(() =>{
            // プログレスバーの終了
            this.showProgressbar = false;

            // 完了メッセージを表示
            this._snackBar.open("登録しました", "OK", { duration: 1000 ,
            horizontalPosition:"start" });

            // 初期化処理
            form.resetForm();
            this.users = [];
            this.model = this.initModel();
        })
        .catch(() =>{
             this._snackBar.open("登録に失敗しました", "Close", { duration: 2000});
             return;
         });
  }

  // 削除
  remove(id:string){
       this.collection.doc(id).delete();
  }

  // Model初期化処理
  private initModel():CreditUseTran {
    let model:CreditUseTran;
    model = {
            bizYear      : 0,
            useDate      : new Date(),
            cardUserId   : '',
            cardUserName : '',
            accountCode  : '',
            accountName  : '',
            reason       : '',
            content      : '',
            amount       : null,
            returnAmount : null,
            users        : null,
            _createTimeStamp: null
        };
    return model;
  }

  // 検索処理
  showSearchProgressbar:boolean;
  searcCresitUseHistory(){

    this.showSearchProgressbar = true;
    this.dataSource.filter = this.searchWord.trim();

    setTimeout(() => {
        this.showSearchProgressbar = false;
    }, 500);
  }


  // 検索欄がブランク時は全部検索
  searchAll(event:Event){
    
    const filterValue = (event.target as HTMLInputElement).value;
    if(filterValue === ''){
        this.dataSource.filter = filterValue;
    }
  }


  // 会計年度を取得
  async calcBizYear(useDate: Date) :Promise<number> {
      const val = await this.comService.fetchRemoteConfigValue('BizYearBorderMonth');
      if(useDate.getMonth() < val.asNumber()){
          return useDate.getFullYear();
      } else {
          return useDate.getFullYear() + 1;
      }
  }

  // Chips処理
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  users: User[] = [];

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our user
    if ((value || '').trim()) {
      this.users.push({name: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeChip(user: User): void {
    const index = this.users.indexOf(user);

    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }
  // Chips処理終了
}

export interface CreditUseTran {
    id?          :string,
    bizYear      :number, // 年度
    useDate      :Date,   // 利用日
    cardUserId   :string, // 利用者コード
    cardUserName :string, // 利用者名
    accountCode  :string, // 科目コード
    accountName  :string, // 科目名
    reason       :string, // 利用
    content      :string, // 内容
    amount       :number, // 金額
    returnAmount :number, // 返金額
    users        : User[],// カード利用者
   _createTimeStamp: Date,
}

export interface Account {
    id : string,
    accountCode : string,
    accountName : string
}

export interface User {
    id?  : string,
    name : string
}
