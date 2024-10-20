import { FirebaseTimeStamp2datePipe } from './firebase-time-stamp2date.pipe';

describe('FirebaseTimeStamp2datePipe', () => {
  it('create an instance', () => {
    const pipe = new FirebaseTimeStamp2datePipe();
    expect(pipe).toBeTruthy();
  });
});
