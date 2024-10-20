import {Injectable} from '@angular/core';
import {User} from '../models/User';
import {Account} from '../models/Account';
import {AngularFirestore} from '@angular/fire/firestore';

import {AngularFireRemoteConfig} from '@angular/fire/remote-config';
import {AngularFireFunctions} from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})

/**
* 共通サービス
* 未開発のデータの取得処理もここに入れている
* 随時別機能に分けていく
*/
export class ComService {

    constructor(private db:AngularFirestore, 
                private config: AngularFireRemoteConfig,
                private functions: AngularFireFunctions) {
    }

    /**
    * ユーザー情報を取得
    * @returns ユーザーオブジェクト.
    */
    async fetchUsers():Promise<User[]> {
        let result: User[] = new Array();

        await this.db.collection<User>('Users', ref => ref)
                    .ref.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            result.push({
                                userName:doc.data().userName,
                                emailAddress: doc.data().emailAddress
                            });
                        });
                    });
        return result;
    }

    /**
    * 勘定科目情報を取得
    * @returns 勘定科目オブジェクト.
    */
    async fetchAccounts():Promise<Account[]> {
        let result: Account[] = new Array();

        await this.db.collection<Account>('Accounts', ref => ref)
                    .ref.get().then(snapshot => {
                        snapshot.forEach(doc => {
                            result.push({
                                id:doc.id,
                                accountCode: doc.data().accountCode,
                                accountName: doc.data().accountName
                            });
                        });
                    });
        return result;
    }

    /**
    * 勘定科目情報を取得
    * @param id  ID.
    * @returns 勘定科目オブジェクト.
    */
    async fetchAccount(id:string):Promise<Account> {
        const doc = await this.db.collection<Account>('Accounts').doc(id).get().toPromise();
        return (Object.assign({ id: doc.id }, doc.data()) as Account);
    }

    /**
    * 会計年度を取得
    * @param value  会計年度を判定する日付.
    * @returns 会計年度.
    */
    calcBizYear(value: Date) :Promise<number> {

        return this.fetchRemoteConfigValue('BizYearBorderMonth')
        .then(x => {
            if(value.getMonth() < x.asNumber()){
                return value.getFullYear();
            } else {
                return value.getFullYear() + 1;
            }
        });
    }

    /**
    * FirebaseのRemoteConfigで設定した値を読み出す
    * Firebaseの仕様で12時間キャッシュされるので注意
    * @param config  RemoteConfigの設定.
    * @returns 設定値.
    */
    fetchRemoteConfigValue(config:string):Promise<any> {
        return new Promise((resolve) => {
            this.config.fetchAndActivate().then(()=>{
                resolve(this.config.getValue(config));
            });
        });
    }

    /**
    * FirestoreのTimeStamp型の日付をDate型に変換
    * @param unix_timestamp  unix時間のタイムスタンプ.
    * @returns Date型に変換した日付.
    */
    public timestamp2Date(unix_timestamp:any):Date {
        var date = new Date(unix_timestamp.seconds * 1000);
        return date;
    }

    /**
    * FunctionsのTest用関数
    */
    public testFirebaseFunction():void {
        const callable = this.functions.httpsCallable('helloWorld');
        callable({}).subscribe((x=>{
            console.log(x.message);
        }))
    }

    /**
    * Sleep処理
    * @param milliseconds スリープ時間
    */
    public sleep(milliseconds: number):Promise<void> {
        return new Promise<void>(resolve => {
        setTimeout(() => resolve(), milliseconds);
        });
    }
}
