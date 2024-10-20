import * as firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {CreditUseMonthReportTran} from '../models/tranCreditUseMonthReport';

import {ComService} from '../../shared/services/com.service';
import {Account} from '../../shared/models/Account';

import {from} from 'rxjs';
import {min} from "rxjs/operators";

// Collection名
const firestoreCollectionName = 'CreditUseMonthReport';

@Injectable({
  providedIn: 'root'
})

/**
* クレジットカード月次報告サービス
*/
export class CreditUseMonthCheckService {

    // 利用者
    operator:firebase.User;

    constructor(private db: AngularFirestore,
                private comSerivce:ComService,
                private auth: AngularFireAuth) {
        this.auth.currentUser.then(x => this.operator = x);
    }

        /**
    * DBからクレジットカード月次報告の一覧を取得
    * @param bizYear 検索対象の年度
    * @returns クレジットカード月次報告の一覧.
    */
    async featchCreditUseReport(bizYear:number):Promise<CreditUseMonthReportTran[]> {
        let result: CreditUseMonthReportTran[] = new Array();

        const collection = this.db.collection<CreditUseMonthReportTran>(firestoreCollectionName)
        .ref.where('bizYear', '==', bizYear).orderBy('order','asc');

        await collection.get()
        .then(snapshot =>{
            snapshot.forEach(doc => {
                const data:CreditUseMonthReportTran = <CreditUseMonthReportTran>doc.data();
                data.id = doc.id;
                result.push(data);
            });
        });
        return result;
    }

    /**
    * DBにクレジットカード月次報告を登録
    * @param model  DBに登録するオブジェクト.
    * @returns 登録した報告書の参照オブジェクト
    */
    async addCreditUseMonthReport(model: CreditUseMonthReportTran):Promise<void> {

        try {
            // バッチオブジェクト
            let batch = this.db.firestore.batch();

            // 登録モデルの加工
            let docId = model.bizYear.toString() + ('00' + model.month).slice(-2);
            let registModel:CreditUseMonthReportTran = model;

            registModel._createUserid    = this.operator.email;
            registModel._createTimeStamp = firebase.firestore.Timestamp.fromDate(new Date());

            let doc = this.db.collection(firestoreCollectionName).doc(docId);

            // メインドキュメントの生成
            batch.set(doc.ref, registModel, {merge:true});

            batch.commit();
        } catch(e) {
            throw e;
        }
    }
}

