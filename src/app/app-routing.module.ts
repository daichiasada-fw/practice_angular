import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreditUseHistoryComponent} from './credit-use/components/credit-use-history/credit-use-history.component';
import {CreditUseMonthCheckComponent} from './credit-use/components/credit-use-month-check/credit-use-month-check.component';

import { LoginComponent } from './shared/components/login/login.component';

const routes: Routes = [
    {path:'', component:CreditUseHistoryComponent},
    {path:'credituse/hist', component:CreditUseHistoryComponent},
    {path:'credituse/monthcheck', component:CreditUseMonthCheckComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
