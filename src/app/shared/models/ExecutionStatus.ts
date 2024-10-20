/**
* 画面実行状況を管理
*/
export class ExecutionStatus {
    status : number = 0;

    constructor(){
    }

    /**
    * 実行状況を実行中に変更
    */
    public toExec(){
        this.status = 1;
    }

    /**
    * 実行状況を完了に変更
    */
    public toFinish(){
        this.status = 2;
    }

    /**
    * 実行状況を準備完了に変更
    */
    public reset(){
        this.status = 0;
    }

    /**
    * 実行状況が実行中か判定
    */
    get isExec():boolean{
        if(this.status === 1){
            return true;
        }else{
            return false;
        }
    }

    /**
    * 実行状況が完了か判定
    */
    get isFinish(){
        if(this.status === 2){
            return true;
        }else{
            return false;
        }
    }

    /**
    * 実行状況が準備完了か判定
    */
    get isReady(){
        if(this.status === 0){
            return true;
        }else{
            return false;
        }
    }
}
