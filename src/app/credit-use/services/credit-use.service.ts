import * as firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {CreditUseTran,} from '../models/tranCreditUse';
import {CreditUserTran} from '../models/tranCreditUser';

import {ComService} from '../../shared/services/com.service';
import {Account} from '../../shared/models/Account';

import {from} from 'rxjs';
import {min} from "rxjs/operators";

// Collection名
const firestoreCollectionName = 'CreditUseTrans';
const subCollectionName = 'CreditUsers';

// ゲスト用アドレスの接頭辞
const prefixGestAddress = '_gest_';

@Injectable({
  providedIn: 'root'
})


/**
* クレジットカード利用報告管理サービス
*/
export class CreditUseService {

    // 返金方法一覧
    returnMethods:any;

    // 科目一覧
    accounts:Account[];

    constructor(private db: AngularFirestore,
                private comSerivce:ComService,
                private auth: AngularFireAuth) {

        // 返金方法一覧の初期化
        this.comSerivce.fetchRemoteConfigValue('returnMethods').then(x => {
            this.returnMethods = JSON.parse(x.asString()).returnMethods;
        });

        // 科目一覧の初期化
        this.comSerivce.fetchAccounts().then(x => {this.accounts = x});
     }

    /**
    * DBからクレジットカード利用報告の一覧を取得
    * @param bizYear  検索対象の年度
    * @param startDate 検索対象開始日
    * @param endDate   検索対象終了日
    * @returns クレジットカード利用報告の一覧.
    */
    async featchCreditUseHistrys(bizYear:number):Promise<CreditUseTran[]> {
        let result: CreditUseTran[] = new Array();

        const collection = this.db.collection<CreditUseTran>(firestoreCollectionName).ref
                                    .where('bizYear', '==', bizYear)
                                    .orderBy('_createTimeStamp','desc');

        await collection.get()
        .then(snapshot =>{
            snapshot.forEach(doc => {
                const data:CreditUseTran = <CreditUseTran>doc.data();
                data.id = doc.id;
                result.push(data);
            });
        });
        return result;
    }

    /**
    * DBにクレジットカード利用報告を登録
    * @param model  DBに登録するオブジェクト.
    * @param users  DBに登録する利用者オブジェクト.
    * @returns 登録したクレジットカードの参照オブジェクト
    */
    async addCreditUseHistry(model: CreditUseTran, users:CreditUserTran[]):Promise<void> {

        try {
            // バッチオブジェクト
            let batch = this.db.firestore.batch();

            // 登録モデルの加工
            let registModel:CreditUseTran = await this.preProcess(model);
            registModel._createTimeStamp = firebase.firestore.Timestamp.fromDate(new Date());
            let docId = new Date().getTime().toString() + '_' + registModel.cardUserId;
            let doc = this.db.collection(firestoreCollectionName).doc(docId);

            // メインドキュメントの生成
            batch.set(doc.ref, registModel, {merge:true});

            // 利用者一覧を登録
            users.forEach((x,i) =>{
                let registModel:CreditUserTran = x;
                registModel.cardUserId = (x.cardUserId === '') ? 'gest_' + i.toString() : x.cardUserId;
                registModel._createTimeStamp = firebase.firestore.Timestamp.fromDate(new Date()); 

                let subDoc = doc.collection(subCollectionName).doc(registModel.cardUserId);
                batch.set(subDoc.ref, registModel, {merge:true});
            });

            batch.commit();
        } catch(e) {
            throw e;
        }
    }

    /**
    * DBのクレジットカード利用報告を変更
    * @param model  変更するオブジェクト.
    * @param users  DBに登録する利用者オブジェクト.
    */
    async updateCreditUseHistry(model: CreditUseTran, users:CreditUserTran[]):Promise<void> {

        try {
            // バッチオブジェクト
            let batch = this.db.firestore.batch();

            // メインドキュメントの取得
            let doc = this.db.collection(firestoreCollectionName).doc<CreditUseTran>(model.id);

            // モデルの加工
            let registModel:CreditUseTran = await this.preProcess(model);
            registModel._updateTimeStamp = firebase.firestore.Timestamp.fromDate(new Date);
            batch.set(doc.ref, registModel, {merge:true});

            // 利用者一覧の削除(今回消した人)
            await doc.collection(subCollectionName).get().toPromise()
            .then(x =>{
                x.forEach(sub => {
                    if(users.find(y => y.cardUserId === sub.id) === undefined)
                    {   
                        batch.delete(sub.ref);
                    }
                });
            });

            // 利用者一覧を登録
            users.forEach((x,i) =>{
                let registModel:CreditUserTran = this.preProcessUser(x,i);
                let sub = doc.collection(subCollectionName).doc<CreditUserTran>(registModel.cardUserId);
                batch.set(sub.ref, registModel, {merge:true});
            });
            batch.commit();
        }catch(e) {
            throw e;
        }
    }

    /**
    * DBのクレジットカード利用報告を削除
    * @param delleteModelId  削除するデータの管理ID.
    */
    async deleteCreditUseHistry(delleteModelId: string):Promise<void> {
        try {

            // バッチオブジェクト
            let batch = this.db.firestore.batch();

            // メインコレクションの削除
            let doc = this.db.collection(firestoreCollectionName).doc(delleteModelId);
            batch.delete(doc.ref);

            // サブコレクションの削除
            await this.db.collection(firestoreCollectionName).doc(delleteModelId).collection(subCollectionName)
            .get().toPromise()
            .then(x =>{
                x.forEach(doc => batch.delete(doc.ref));
            })

            batch.commit();
        } catch(e){
            console.error(e);
            throw e;
        }
    }


    /**
    * 登録および変更前の前加工処理
    * @param model  加工するデータ.
    * @returns 加工したデータ.
    */
    async preProcess(model:CreditUseTran):Promise<CreditUseTran> {

        model.cardUserId   = model.cardUserId; 
        model.cardUserName = model.cardUserName; 
        model.reason       = model.reason.trim();
        model.content      = model.content.trim();
        model.accountName  = this.accounts.find(x => x.accountCode === model.accountCode).accountName;
        model.bizYear      = await this.comSerivce.calcBizYear(model.useDate);
        return model;
    }

    /**
    * 登録および変更前の前加工処理
    * @param model  加工するデータ.
    * @param i  登録順.
    * @returns 加工したデータ.
    */
    preProcessUser(model:CreditUserTran,i:number):CreditUserTran{

        let resultModel:CreditUserTran={
            cardUserId       : (model.cardUserId === '') ? prefixGestAddress + i.toString() : model.cardUserId,
            cardUserName     : model.cardUserName,
            _createTimeStamp : firebase.firestore.Timestamp.fromDate(new Date())
        }

        if(model.returnAmount !== undefined){
            resultModel.returnAmount     = model.returnAmount;
            resultModel.returnMethodCode = model.returnMethodCode;
            resultModel.returnMethodName = this.returnMethods.find(y => y.MethodCode === model.returnMethodCode).MethodName;
        }

        return resultModel;
    }


    /**
    * DBからクレジットカード利用者の一覧を取得
    * @param   docId 削除対象クレジットカード利用履歴のドキュメントID
    * @returns クレジットカード利用者の一覧.
    */
    async featchCreditUsers(docId:string):Promise<CreditUserTran[]> {
        let result:CreditUserTran[] = new Array();

        await this.db.collection<CreditUseTran>(firestoreCollectionName)
        .doc(docId)
        .collection(subCollectionName, ref => ref)
        .ref.get()
        .then(snapshot => {
            snapshot.forEach(doc => result.push({
                    cardUserId        :doc.data().cardUserId,
                    cardUserName      :doc.data().cardUserName,
                    returnAmount      :doc.data().returnAmount,
                    returnMethodCode  :doc.data().returnMethodCode,
                    returnMethodName  :doc.data().returnMethodName
                }));
        });

        return result;
    }

    /**
    * 返金額を各担当に割り振り
    * @param model  加工するデータ.
    * @returns 加工したデータ.
    */
    allocationReturnAmount(models:CreditUserTran[], sumReturnAmount:number):CreditUserTran[] {

        // 100円単位で割り振り
        let temp = (sumReturnAmount / 100);
        temp = Math.floor(temp);

        for(let i = 0,iModel = 0; i < temp; iModel++) {

            if(iModel > (models.length-1)) {
                iModel = 0;
            }

            models[iModel].returnAmount += 100;
            i++;
        }

        // 端数を割り振り(金額が一番小さい人に割り振る)
        from(models).pipe(
            min<CreditUserTran>(
                (a:CreditUserTran,b:CreditUserTran) => 
                (a.returnAmount < b.returnAmount) ? -1 : 1),
        ).subscribe((x:CreditUserTran) => {
            let temp2 = (sumReturnAmount - (temp * 100));
            x.returnAmount  += temp2;
        });

        return models;
    }

    /**
    * DBの返金情報を変更
    * @param documentId  変更するオブジェクトのドキュメントID.
    * @param models  変更するオブジェクト.
    */
    async updateCreditReturnAmounts(documentId: string, models:CreditUserTran[]):Promise<void> {

        try{
            // バッチオブジェクト
            let batch = this.db.firestore.batch();
            let collection = this.db.collection(firestoreCollectionName).doc(documentId).collection(subCollectionName);

            // 削除処理
            await collection.get().toPromise()
            .then(x =>{
                x.forEach(doc => {
                    if(models.find(y => y.cardUserId === doc.data().cardUserId) === undefined) {batch.delete(doc.ref);}
                });
            });

            // 登録処理
            models.forEach((x:CreditUserTran,i) => {
                let registModel = this.preProcessUser(x , i);
                let doc = collection.doc(registModel.cardUserId);
                batch.set(doc.ref, registModel, {merge:true});
            });

            batch.commit();
        }catch(e){
            throw e;
        }
    }
}

