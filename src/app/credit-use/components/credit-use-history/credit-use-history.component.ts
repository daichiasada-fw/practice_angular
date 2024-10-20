import * as firebase from 'firebase';
import {Router} from '@angular/router';

import {AngularFireAnalytics} from '@angular/fire/analytics';
import {AngularFireAuth} from '@angular/fire/auth';

import {Component, OnInit, ViewChild} from '@angular/core';

import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

import {MatDialog} from '@angular/material/dialog';

import {ComService} from '../../../shared/services/com.service';
import {OperatorInfoDialogComponent} from '../../../shared/components/operator-info-dialog/operator-info-dialog.component';

import {CreditUseTran,CreditUseSearchContainer} from '../../models/tranCreditUse';
import {CreditUseService} from '../../services/credit-use.service';
import {CreditUseEditComponent} from '../credit-use-edit/credit-use-edit.component';
import {CreditUseAddComponent} from '../credit-use-add/credit-use-add.component';
import {CreditUseRefComponent} from '../credit-use-ref/credit-use-ref.component';
import {CreditUseDeleteComponent} from '../credit-use-delete/credit-use-delete.component';
import {CreditUseEditReturnAmountComponent} from '../credit-use-edit-return-amount/credit-use-edit-return-amount.component';
import {CreditUseSearchComponent} from '../credit-use-search/credit-use-search.component';

@Component({
  selector: 'app-credit-use-history',
  templateUrl: './credit-use-history.component.html',
  styleUrls: ['./credit-use-history.component.css']
})

/**
* クレジットカード利用報告を管理するための画面コンポーネント
* 一覧の表示、各種機能のハンドリングを行う
*/
export class CreditUseHistoryComponent implements OnInit {

    // ページ名
    readonly screenName:string = 'CreditUseHistory';

    // 操作中ユーザー
    operator:firebase.User;
    operatorText:string;

    // 検索条件
    searchOptions:CreditUseSearchContainer = this.initsearchContainModel();

    // 検索ボックスのPlaceholder
    searchPlaceholder:string = "検索";

    // 検索プログレスバーの表示
    showSearchProgress:boolean;

    // 年度検索
    selectBizYears:number[];

    // 一覧表示用のデータ
    dataSource:MatTableDataSource<CreditUseTran>;

    // 表示列
    displayedColumns: string[] = ['menu',
                                'useDate', 
                                'cardUserName',
                                'accountName',
                                'reason', 
                                'content',
                                'amount',
                                'returnAmount',
                                '_createTimeStamp'
                                ];

    constructor(private service:CreditUseService,
                private comService:ComService,
                private dialog:MatDialog,
                private auth: AngularFireAuth,
                private analytics: AngularFireAnalytics,
                public router: Router) {}

    /**
    画面初期処理
    */
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    async ngOnInit() {
        // プログレススピナーの表示
        this.showSearchProgress = true;

        // アナリティクス用にページ名をセット
        this.analytics.setCurrentScreen(this.screenName);

        // 利用者を取得
        //this.operator = await this.auth.currentUser;
        //this.operatorText = this.operator.displayName + '\r\n' + this.operator.email;

        // 検索条件生成
        this.searchOptions.bizYear = await this.comService.calcBizYear(new Date());
        this.selectBizYears = this.createSelectBizYears();

        // 当年度のみ検索
        let creditUseTrans = await this.service.featchCreditUseHistrys(this.searchOptions.bizYear);
        this.dataSource = new MatTableDataSource(creditUseTrans);
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data: CreditUseTran, filter: string) => {
            return this.definitionFilter(data, filter);
        };
        this.searchCresitUseHistory();
        this.showSearchProgress = false;
    }

    /**
    * 検索処理
    * @event 検索マークを押したとき。
    * @event 検索入力欄でEnterを押した時
    */
    searchCresitUseHistory(){
        this.dataSource.filter = JSON.stringify(this.searchOptions);
    }


    /**
    * 全件検索
    * @event 検索入力欄が空になった時
    */
    searchAll(event:Event){
        const filterValue = (event.target as HTMLInputElement).value;
        if(filterValue === ''){
            this.searchCresitUseHistory();
        }
    }

    /**
    * 年度検索
    * @event 年度プルダウン変更時
    */
    async searchBizYear(){
        this.showSearchProgress = true;
        this.dataSource.data = await this.service.featchCreditUseHistrys(this.searchOptions.bizYear);
        this.searchCresitUseHistory();
        this.showSearchProgress = false;
    }

    /**
    * 登録画面呼び出し
    * @event 追加ボタンを押した時
    */
    openDialogAdd():void {
        this.dialog.open(CreditUseAddComponent,{
            width:'500px',
        }).afterClosed().subscribe(() =>{
            this.service.featchCreditUseHistrys(this.searchOptions.bizYear)
            .then(x => { this.dataSource.data = x });
        });
    }

    /**
    * 照会画面呼び出し
    * @event メニューの照会ボタンを押した時
    * @event 一覧をクリックした時
    */
    openDialogRef(row:CreditUseTran):void {
        this.dialog.open(CreditUseRefComponent,{
            width:'650px',
            data: {data : Object.assign({},row) }
        });
    }

    /**
    * 変更画面呼び出し
    * @event メニューの変更ボタンを押した時
    */
    openDialogEdit(row:CreditUseTran):void {
        this.dialog.open(CreditUseEditComponent,{
            width:'500px',
            data: {data : Object.assign({},row) }
        }).afterClosed().subscribe(() =>{
            this.service.featchCreditUseHistrys(this.searchOptions.bizYear)
            .then(x => { this.dataSource.data = x });
        });
    }

    /**
    * 削除画面呼び出し
    * @event メニューの削除ボタンを押した時
    */
    openDialogDel(row:CreditUseTran):void {
        this.dialog.open(CreditUseDeleteComponent,{
            width:'500px',
            data: {data : Object.assign({},row) }
        }).afterClosed().subscribe(() =>{
            this.service.featchCreditUseHistrys(this.searchOptions.bizYear)
            .then(x => { this.dataSource.data = x });
        });
    }

    /**
    * 再利用登録画面呼び出し
    * @event メニューの変更ボタンを押した時
    */
    openDialogCopy(row:CreditUseTran):void {
        this.dialog.open(CreditUseAddComponent,{
            width:'500px',
            data: {data : Object.assign({},row) }
        }).afterClosed().subscribe(() =>{
            this.service.featchCreditUseHistrys(this.searchOptions.bizYear)
            .then(x => { this.dataSource.data = x });
        });
    }

    /**
    * 返金登録画面呼び出し
    * @event メニューの返金登録ボタンを押した時
    */
    openDialogReturnAmountAdd(row:CreditUseTran):void {
        this.dialog.open(CreditUseEditReturnAmountComponent,{
            width:'850px',
            data: {data : Object.assign({},row) }
        });
    }

    /**
    * 検索オプション画面呼び出し
    * @event 検索オプション呼び出しボタン押下時
    */
    openDialogSearch():void {
        this.dialog.open(CreditUseSearchComponent,{
            width:'400px',
            position: { left: '445px', top:'60px' },
            data: { 
                data : this.searchOptions,
                isCancel: false,
            }
        })
        .afterClosed().subscribe(result => {
            if(result.isCancel === true) {
                return;
            }

            this.showSearchProgress = true;

            // モーダルクローズ時に検索処理を実行
            console.log(JSON.stringify(result.data));
            this.searchOptions = result.data;

            // 検索処理            
            this.searchCresitUseHistory();


            // 検索ボックスのTooltipを変更
            if(this.isOptionFilter() === true){
                this.searchPlaceholder = "検索（詳細検索中）";
            }else{
                this.searchPlaceholder = "検索";
            }

            this.showSearchProgress = false;
         });
    }

    /**
    * ユーザー情報ダイアログ呼び出し
    * @event ユーザーアイコン押下時
    */
    openDialogOperatorInfo():void{
        this.dialog.open(OperatorInfoDialogComponent,{
            position: { right: '5px', top:'60px' },
            width:'200px',
            backdropClass:'operaterBackDrop',
        });
    }

    /**
    * 検索条件の初期表示
    * @returns 検索条件オブジェクト.
    */
    private initsearchContainModel():CreditUseSearchContainer {
        let model:CreditUseSearchContainer;
        model = {
            bizYear      :0,
            searchWord   :'',
            useDateFrom  :null,
            useDateTo    :null,
            cardUserName :'',
            accountCode  :'',
            reason       :'',
            content      :'',
        };
        return model;
    }

    /**
    * 年度選択肢を作成
    * @return 年度選択肢
    */
    private createSelectBizYears():number[]{
        let result:number[] = new Array();
        result.push(this.searchOptions.bizYear - 1);
        result.push(this.searchOptions.bizYear);
        result.push(this.searchOptions.bizYear + 1);
        return result;
    }

    /**
    * 検索条件を定義
    * オプションはAND条件
    * 一覧の検索欄で入力した値はOR条件
    * 最初にオプションで絞り込んでその結果をさらにOR条件で検索する。
    * 一覧の検索欄で検索する列はコード内を参照
    * @return 検索条件
    */
    private definitionFilter(data:CreditUseTran, filter:string) : boolean{

        const customFilter = [];

        // 検索条件をオブジェクトに変換
        const searchContain = <CreditUseSearchContainer>JSON.parse(filter);

        // 検索前の加工処理
        let secondesFrom = firebase.firestore.Timestamp.fromDate(new Date(searchContain.useDateFrom)).seconds;
        let secondesTo   = firebase.firestore.Timestamp.fromDate(new Date(searchContain.useDateTo))  .seconds;


        // 必須検索
        customFilter.push((data.bizYear === searchContain.bizYear));

        // オプション検索
        if(secondesFrom !== 0) {
            customFilter.push(((<any>data.useDate).seconds >= secondesFrom));
        }

        if(secondesTo !== 0) {
            customFilter.push(((<any>data.useDate).seconds <= secondesTo));
        }

        if(searchContain.accountCode !== '') {
            customFilter.push(data.accountCode === searchContain.accountCode);
        }

        if(searchContain.cardUserName !== '') {
            customFilter.push(data.cardUserName.toLowerCase().includes(searchContain.cardUserName));
        }

        if(searchContain.reason !== '') {
            customFilter.push(data.reason.toLowerCase().includes(searchContain.reason));
        }

        if(searchContain.content !== '') {
            customFilter.push(data.content.toLowerCase().includes(searchContain.content));
        }

        // 一覧の検索窓のワードを検索
        if(searchContain.searchWord !== '') {
            const searchWordFilter = [];
            searchWordFilter.push(data.reason      .toLowerCase().includes(searchContain.searchWord));
            searchWordFilter.push(data.accountName .toLowerCase().includes(searchContain.searchWord));
            searchWordFilter.push(data.cardUserName.toLowerCase().includes(searchContain.searchWord));
            customFilter.push(searchWordFilter.some(Boolean));
        }
        return customFilter.every(Boolean);
    }

    /**
    オプション検索中か判定
    * @return オプション判定結果
    */
    private isOptionFilter():boolean {
        if(this.searchOptions.useDateFrom  != null) return true;
        if(this.searchOptions.useDateTo    != null) return true;
        if(this.searchOptions.accountCode  != '') return true;
        if(this.searchOptions.cardUserName != '') return true;
        if(this.searchOptions.content      != '') return true;
        if(this.searchOptions.reason       != '') return true;
        return false;
    }


    /**
    変更機能の表示条件
    */
    canEdit(data:CreditUseTran):boolean {
        if(this.operator.email !== data.cardUserId){
            return false;
        }
        return true;
    }

    /**
    削除の表示条件
    */
    canDelete(data:CreditUseTran):boolean {
        if(this.operator.email !== data.cardUserId){
            return false;
        }
        return true;
    }

    /**
    返金登録の表示条件
    */
    canReturnAmount(data:CreditUseTran):boolean {

        if(this.operator.email !== data.cardUserId){
            return false;
        }

        if(data.returnAmount === null || data.returnAmount === 0){
            return false;
        }
        return true;
    }
}
