import ccclass = cc._decorator.ccclass;

@ccclass
export default class NakamaAutoLogin extends cc.Component {
    private retryTime: number = 5;

    public start() {
        NakamaManager.instance.onLoginFail += LoginFailed;
        this.tryLogin();
    }

    public onDestroy() {
        NakamaManager.instance.onLoginFail -= LoginFailed;
    }

    private tryLogin() {
        NakamaManager.instance.loginWithUdid();
    }

    private loginFailed() {
        // setTimeout(() => {
        //     this.tryLogin();
        // }, this.retryTime * 1000);
        this.schedule(() => {
            this.tryLogin();
        }, this.retryTime);
    }
}
