import * as firebase from 'firebase';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firebaseTimeStamp2date'
})
export class FirebaseTimeStamp2datePipe implements PipeTransform {

  transform(value: firebase.firestore.Timestamp): Date {
      if(value === null) return null;
    return value.toDate();
  }
}
