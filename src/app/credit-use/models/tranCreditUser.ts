import {Timestamp} from '@firebase/firestore-types';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {User} from '../../shared/models/User';

/** クレジットカード返金情報 */
export interface CreditUserTran {
    id?               :string,
    cardUserId        :string, // 利用者コード
    cardUserName      :string, // 利用者名
    returnAmount?     :number, // 返金額
    returnMethodCode? :string, // 返金方法
    returnMethodName? :string, // 返金方法
   _createTimeStamp?  : Timestamp
}

/** クレジットカード返金情報 */
export interface CreditUserView {
    position:number,
    userControl?:FormControl,
    filteredUsers?: Observable<User[]>,
    data: CreditUserTran
}
