import { Injectable } from '@angular/core';
import {NativeDateAdapter} from '@angular/material/core';
// NativeDateAdapterの一部を上書きしたJPDateAdapterを作る
// 参考：https://qiita.com/pittanko_pta/items/4766a1dfb9a682b76181
@Injectable({
  providedIn: 'root'
})
export class JPDateAdapter extends NativeDateAdapter {
    getDateNames(): string[] {
        return Array.from(Array(31), (v, k) => `${k + 1}`);
    }
}