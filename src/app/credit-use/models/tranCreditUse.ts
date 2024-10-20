import {Timestamp} from '@firebase/firestore-types';
import {CreditUserTran} from './tranCreditUser'

/** クレジットカード利用報告 */
export interface CreditUseTran {
    id?              :string,
    bizYear          :number, // 年度
    useDate          :Date,   // 利用日
    cardUserId       :string, // 利用者コード
    cardUserName     :string, // 利用者名
    accountCode      :string, // 科目コード
    accountName      :string, // 科目名
    reason           :string, // 利用
    content          :string, // 内容
    amount           :number, // 金額
    returnAmount     :number, // 返金額
    returnAmountSum? :number, // 返金額合計
   _createTimeStamp: Timestamp,
   _updateTimeStamp: Timestamp
}

/** クレジットカード利用報告 */
export interface CreditUseView {
    isHeader? : boolean,    // グループ化する時に利用するダミーヘッダーかの判定
    isOpen? : boolean,
    data:CreditUseTran,
    users?:CreditUserTran[],// カード利用者
}

/** 検索条件 */
export interface CreditUseSearchContainer {
    searchWord   :string,  // 汎用フィルター
    bizYear      :number, // 年度
    useDateFrom  :Date,    // 利用日
    useDateTo    :Date,    // 利用日
    cardUserName :string,  // 利用者名
    accountCode  :string,  // 科目コード
    reason       :string,  // 利用
    content      :string,  // 内容
}


/** モーダル連携用ラップＩＦ */
export interface CreditUseModalPass {
    data:CreditUseTran
}

/** モーダル連携用ラップＩＦ */
export interface CreditUseSearchContainerModalPass {
    data:CreditUseSearchContainer,
    isCancel : boolean,
}
