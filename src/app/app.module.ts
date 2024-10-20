import {BrowserModule} from '@angular/platform-browser';
import {NgModule,LOCALE_ID} from '@angular/core';
import {MatNativeDateModule} from '@angular/material/core';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {DateAdapter} from '@angular/material/core';
import {RouterModule,Routes} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';

import {AppRoutingModule} from './app-routing.module';

import {environment} from '../environments/environment';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';

import {AngularFireRemoteConfigModule, SETTINGS} from '@angular/fire/remote-config';
import {AngularFireFunctionsModule,REGION} from '@angular/fire/functions';
import {AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService} from '@angular/fire/analytics';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {OverlayModule} from '@angular/cdk/overlay';

import {MatSortModule} from '@angular/material/sort';
import {MatSliderModule} from '@angular/material/slider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatChipsModule} from '@angular/material/chips';
import {MatTableModule} from '@angular/material/table';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRippleModule} from '@angular/material/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatTabsModule} from '@angular/material/tabs';

import localeJa from '@angular/common/locales/ja';
import {registerLocaleData} from '@angular/common';

import {JPDateAdapter} from './shared/adapters/jp-date-adapter';

import {AppComponent} from './app.component';
import {LoginComponent} from './shared/components/login/login.component';
import {OperatorInfoDialogComponent} from './shared/components/operator-info-dialog/operator-info-dialog.component';
import {CreditUseHistoryComponent} from './credit-use/components/credit-use-history/credit-use-history.component';
import {CreditUseEditComponent} from './credit-use/components/credit-use-edit/credit-use-edit.component';
import {CreditUseAddComponent} from './credit-use/components/credit-use-add/credit-use-add.component';
import {CreditUseRefComponent} from './credit-use/components/credit-use-ref/credit-use-ref.component';
import {CreditUseDeleteComponent} from './credit-use/components/credit-use-delete/credit-use-delete.component';
import {CreditUseSearchComponent} from './credit-use/components/credit-use-search/credit-use-search.component';
import {CreditUseEditReturnAmountComponent} from './credit-use/components/credit-use-edit-return-amount/credit-use-edit-return-amount.component';
import {CreditUseMonthCheckComponent} from './credit-use/components/credit-use-month-check/credit-use-month-check.component';
import { CreditUseMonthAddComponent } from './credit-use/components/credit-use-month-add/credit-use-month-add.component';
import { FirebaseTimeStamp2datePipe } from './shared/pipe/firebase-time-stamp2date.pipe';

registerLocaleData(localeJa);

@NgModule({
  declarations: [
    AppComponent,
    OperatorInfoDialogComponent,
    LoginComponent,
    CreditUseHistoryComponent,
    CreditUseEditComponent,
    CreditUseAddComponent,
    CreditUseRefComponent,
    CreditUseDeleteComponent,
    CreditUseSearchComponent,
    CreditUseEditReturnAmountComponent,
    CreditUseMonthCheckComponent,
    CreditUseMonthAddComponent,
    FirebaseTimeStamp2datePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFirestoreModule,
    AngularFireRemoteConfigModule,
    AngularFireFunctionsModule,
    BrowserAnimationsModule,ReactiveFormsModule,
    MatSliderModule,MatFormFieldModule,MatInputModule,MatDatepickerModule,MatCardModule,MatSelectModule,MatButtonModule,MatToolbarModule,MatIconModule,MatSnackBarModule,MatProgressBarModule,
    MatNativeDateModule,MatProgressSpinnerModule,MatGridListModule,MatChipsModule,MatTableModule,MatSidenavModule,MatDialogModule,MatMenuModule,MatListModule,MatAutocompleteModule,MatTooltipModule,MatSortModule,
    MatCheckboxModule,MatRippleModule,MatExpansionModule,MatDividerModule,MatTabsModule,
    FlexLayoutModule,
    OverlayModule
  ],
  providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},
        {provide: LOCALE_ID, useValue: 'ja-JP'},
        {provide: DateAdapter, useClass: JPDateAdapter},
        {provide: REGION,useValue:'asia-northeast1'},
        {provide: SETTINGS, useValue: {minimumFetchIntervalMillis: 1_000_000, fetchTimeoutMillis:5_000}},
        ScreenTrackingService,UserTrackingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
