import {Component, OnInit,Inject} from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';

import {ComService} from '../../../shared/services/com.service';

import {CreditUseView,CreditUseModalPass} from '../../models/tranCreditUse';
import {CreditUserView} from '../../models/tranCreditUser';
import {CreditUseService} from '../../services/credit-use.service';

@Component({
  selector: 'app-credit-use-ref',
  templateUrl: './credit-use-ref.component.html',
  styleUrls: ['./credit-use-ref.component.css']
})

/**
* クレジットカード利用報告を照会するための画面コンポーネント
*/
export class CreditUseRefComponent implements OnInit {

    // バインドデータ
    model:CreditUseView;
    models:CreditUserView[] = new Array;

    // 返金一覧
    displayedColumns:string[]= ['name','emailAddress'];
    dataSource:MatTableDataSource<CreditUserView>;

    // ロード中
    isLoaded:boolean = false;

    // ゲスト用アドレスの接頭辞
    readonly prefixGestAddress = '_gest_';

    constructor(private comService:ComService,
                private service:CreditUseService,
                private dialogRef:MatDialogRef<CreditUseRefComponent>,
                @Inject(MAT_DIALOG_DATA) private data:CreditUseModalPass) {
    }

    /**
    画面初期処理
    */
    async ngOnInit() {
        // 一覧画面のデータを連携
        this.model = {data:this.data.data};
        this.model.data.returnAmountSum = 0;
        this.model.data.useDate =  this.comService.timestamp2Date(this.data.data.useDate);

        // 利用者一覧を取得
        await this.service.featchCreditUsers(this.model.data.id)
        .then(x => {
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
                console.log('returnAmount : ' + model.returnAmount)
                console.log('returnAmountSum : ' + this.model.data.returnAmountSum)
                this.model.data.returnAmountSum += model.returnAmount;
            });
        });

        // ソート定義
        this.models.sort((a,b)=>{
            if(a.position < b.position) return -1;
            if(a.position > b.position) return 1;
            return 0;
        })

        // データソースへ登録
        this.dataSource = new MatTableDataSource<CreditUserView>(this.models);

        // 返金一覧用の列設定
        if(this.existReturnAmount === true){
            this.displayedColumns = this.displayedColumns.concat(['returnAmount','returnMethod']);
        }

        // 画面サイズの設定
        this.setWidth();

        this.isLoaded = true;
    }

    /**
    返金情報を表示するかの判定
    */
    get existReturnAmount():boolean {
        return (this.model.data.returnAmount > 0)
    }

    /**
    ユーザー一覧を表示するかの判定
    */
    get existUsers():boolean {
        return (this.models.length > 0)
    }

    /*
    モーダルの横サイズ
    */
    setWidth():void {

        // 利用者がいない時
        if(this.existUsers === false){
            this.dialogRef.updateSize('300px');
        }

        // 返金一覧用の設定
        if(this.existReturnAmount === true){
            this.dialogRef.updateSize('850px');
        }
    }
}
