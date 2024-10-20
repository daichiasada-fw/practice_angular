import * as firebase from 'firebase';
import {AfterViewInit,DoCheck,Component, OnInit, ViewChild} from '@angular/core';

import {from, of} from 'rxjs';
import {map,startWith,reduce, filter,distinct,mergeMap,groupBy,toArray,tap} from 'rxjs/operators';

import {Router} from '@angular/router';

import {AngularFireAnalytics} from '@angular/fire/analytics';
import {AngularFireAuth} from '@angular/fire/auth';


import {MatTableDataSource} from '@angular/material/table';

import {MatDialog} from '@angular/material/dialog';

import {ComService} from '../../../shared/services/com.service';
import {OperatorInfoDialogComponent} from '../../../shared/components/operator-info-dialog/operator-info-dialog.component';

import {CreditUseTran,CreditUseSearchContainer,CreditUseView} from '../../models/tranCreditUse';
import {CreditUseMonthReportTran} from '../../models/tranCreditUseMonthReport';

import {CreditUseService} from '../../services/credit-use.service';
import {CreditUseMonthCheckService} from '../../services/credit-use-month-check.service';

import {CreditUseMonthAddComponent} from '../credit-use-month-add/credit-use-month-add.component';
import {CreditUseRefComponent} from '../credit-use-ref/credit-use-ref.component';
import {CreditUseSearchComponent} from '../credit-use-search/credit-use-search.component';

@Component({
  selector: 'app-credit-use-month-check',
  templateUrl: './credit-use-month-check.component.html',
  styleUrls: ['./credit-use-month-check.component.css']
})

/**
* 月次のクレジットカードの確認画面
* 請求書との突合せ作業等を行う
*/
export class CreditUseMonthCheckComponent implements OnInit {
//export class CreditUseMonthCheckComponent implements OnInit, AfterViewInit, DoCheck {

    // ページ名
    readonly screenName:string = 'CreditUseMonthCheck';

    // 操作中ユーザー
    operator:firebase.User;
    operatorText:string;

    // 検索条件
    searchOptions:CreditUseSearchContainer = this.initsearchContainModel();
    choiseUsers:string[] = [];

    // 検索ボックスのPlaceholder
    searchPlaceholder:string = "検索";

    // 検索プログレスバーの表示
    showSearchProgress:boolean;

    // 現在月
    currentMonthIndex:number;

    // 年度検索
    selectBizYears:number[];

    // 一覧表示用のデータ
    dataSource:MatTableDataSource<CreditUseView>;
    creditUseTrans:CreditUseTran[];
    creditUseReports:CreditUseMonthReportTran[];
    viewReport:CreditUseMonthReportTran;
    sumAmount:number;

    // 表示列
    displayedColumns: string[] = [
                                'useDate', 
                                'accountName',
                                'reason', 
                                'content',
                                'amount',
                                'returnAmount',
                                '_createTimeStamp'
                                ];

    opened: boolean = false;

    rectH = 100;
    rectW = 100;
    rectC = '#FF0000';
    context:CanvasRenderingContext2D;


    //@ViewChild('myCanvas') myCanvas;
    constructor(private service:CreditUseService,
                private serviceReportMonth:CreditUseMonthCheckService,
                private comService:ComService,
                private dialog:MatDialog,
                private auth: AngularFireAuth,
                private analytics: AngularFireAnalytics,
                public router: Router) {}

/*
    ngAfterViewInit(){

        const canvas = this.myCanvas.nativeElement;
        this.context = canvas.getContext('2d');
        this.draw();
    }
    ngDoCheck():void{
        this.draw();
    }

    draw(){
        const ctx = this.context;
        if(ctx){
            ctx.clearRect(0,0,400,400);
            ctx.fillStyle = this.rectC;
            ctx.fillRect(0,0, this.rectW, this.rectH);
        }
    }
*/

    /**
    画面初期処理
    */
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

        // 請求書情報を生成
        this.creditUseReports = await this.serviceReportMonth.featchCreditUseReport(this.searchOptions.bizYear);
        this.viewReport = this.creditUseReports.find(x => x.month === (new Date().getMonth() + 1));
        this.currentMonthIndex = this.viewReport.order;

        // 当年度当月のみ検索
        await this.creditUseSearch();
        this.showSearchProgress = false;
    }

    isGroup(index, item): boolean {
        return item.isHeader;
    }

    groupHeaderClick(row:CreditUseView){
        row.isOpen = !row.isOpen;

        if(row.isOpen === true){
            this.choiseUsers.push(row.data.cardUserId);
        }
        else{
            let index = this.choiseUsers.findIndex(x => x === row.data.cardUserId);
            this.choiseUsers.splice(index, 1);
        }
        this.dataSource.filter = JSON.stringify(this.searchOptions);
    }

    /**
    * 月の合計利用金額を計算
    */
    clacSumAmount(trans:CreditUseTran[]){
        from(trans).pipe(
            filter(x => (x.useDate >= this.viewReport.inVoiceDateFrom)),
            filter(x => (x.useDate <= this.viewReport.inVoiceDateTo)),
            reduce((acc,val)=> acc + val.amount, 0))
        .subscribe((sum:number) => { this.sumAmount = sum});
    }

    /**
    * タブをDisableにする条件
    * @param 表示するタブのIndex
    */
    isDisabled(order:number){

        if(order > this.currentMonthIndex){
            return true;
        }
        return false;
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

        // 請求書情報を生成
        this.creditUseReports = await this.serviceReportMonth.featchCreditUseReport(this.searchOptions.bizYear);
        this.viewReport = this.creditUseReports.find(x => x.month === (new Date().getMonth() + 1));
        this.currentMonthIndex = this.viewReport.order;

        // 当年度当月のみ検索
        this.creditUseTrans = null;
        this.creditUseSearch();
        this.showSearchProgress = false;
    }

    /**
    * 登録画面呼び出し
    * @event 追加ボタンを押した時
    */
    openDialogAdd():void {
        this.dialog.open(CreditUseMonthAddComponent,{
            width:'300px',
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
        result.push(this.searchOptions.bizYear);
        return result;
    }

    /**
    * 検索条件を定義
    * 一覧の検索欄で入力した値はOR条件
    * 最初にオプションで絞り込んでその結果をさらにOR条件で検索する。
    * 一覧の検索欄で検索する列はコード内を参照
    * @return 検索条件
    */
    private definitionFilter(data:CreditUseView, filter:string) : boolean{

        const customFilter = [];
        const headerFilter = [];
        const usersFilter  = [];

        // 検索条件をオブジェクトに変換
        const searchContain = <CreditUseSearchContainer>JSON.parse(filter);

        // ヘッダー行は必ず表示
        headerFilter.push(data.isHeader === true);

        // 必須検索
        customFilter.push((data.data.bizYear === searchContain.bizYear));
        customFilter.push((data.data.useDate >= this.viewReport.inVoiceDateFrom));
        customFilter.push((data.data.useDate <= this.viewReport.inVoiceDateTo));

        // ユーザーサブヘッダーの非表示
        this.choiseUsers.forEach(x => usersFilter.push((data.data.cardUserId === x)));
        if(usersFilter.length == 0){customFilter.push((false))}
        if(usersFilter.length >  0){customFilter.push(usersFilter.some(Boolean))}

        // 一覧の検索窓のワードを検索
        if(searchContain.searchWord !== '') {
            const searchWordFilter = [];
            searchWordFilter.push(data.data.reason      .toLowerCase().includes(searchContain.searchWord));
            searchWordFilter.push(data.data.accountName .toLowerCase().includes(searchContain.searchWord));
            searchWordFilter.push(data.data.cardUserName.toLowerCase().includes(searchContain.searchWord));
            customFilter.push(searchWordFilter.some(Boolean));
        }

        headerFilter.push(customFilter.every(Boolean));

        return headerFilter.some(Boolean);
    }

    /*
    *　ヘッダーに表示しているレポートの情報を切り替える
    */
    async viewReportInfo(event){
        if(!this.creditUseTrans) return;
        this.viewReport = this.creditUseReports[event.index];

        this.choiseUsers = [];
        from(this.creditUseTrans).pipe(
            distinct(x => x.cardUserId),
            map(x => x.cardUserId)
        ).subscribe(x => {this.choiseUsers.push(x)});

        this.creditUseSearch();
    }

    /*
    *　当年度当月のみ検索
    */
    async creditUseSearch(){

        if(!this.creditUseTrans){
            this.creditUseTrans = await this.service.featchCreditUseHistrys(this.searchOptions.bizYear);
            from(this.creditUseTrans).pipe(
                distinct(x => x.cardUserId),
                map(x => x.cardUserId)
            ).subscribe(x => {this.choiseUsers.push(x)});
        }


        let result:CreditUseView[] = new Array();

        from(this.creditUseTrans).pipe(
            groupBy((tran:CreditUseTran) => tran.cardUserId),
            mergeMap(group => group.pipe(toArray())),
        ).subscribe((x)=> {
            let temps:CreditUseView[] = new Array();
            temps.push({data:x[0], isHeader:true, isOpen: true });
            x.forEach(element => {
                temps.push({data:element, isHeader:false});
            });
            result = result.concat(temps);
        },
        (error)=> {},
        () =>{
            this.dataSource = new MatTableDataSource(result);
            this.dataSource.filterPredicate = (data: CreditUseView, filter: string) => {
                return this.definitionFilter(data, filter);
            };
            this.dataSource.filter = JSON.stringify(this.searchOptions);
            this.clacSumAmount(this.creditUseTrans);
        });
    }
}

