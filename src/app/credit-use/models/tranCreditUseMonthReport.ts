import {Timestamp} from '@firebase/firestore-types';

/** クレジットカード利用報告月別情報 */
export interface CreditUseMonthReportTran {
    id?              :string,
    bizYear          :number,  // 年度
    month            :number,  // 月
    inVoiceDateFrom  :Date,    // 請求期間開始日
    inVoiceDateTo    :Date,    // 請求期間終了日
    fixDate?         :Date,    // 締め処理日
    inVoiceFileLink? :string,  // 請求書
    isFix?           :boolean, // 確認済みかのフラグ
    order            :number,
   _createUserid?    :string,
   _createTimeStamp? :Timestamp,
   _updateTimeStamp? :Timestamp
   _updateUserid?    :string,
}
