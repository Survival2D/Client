import ccclass = cc._decorator.ccclass;
import NakamaManager from "./NakamaManager";

@ccclass
export default class NakamaAutoLogin extends cc.Component {
  private retryTime: number = 5;

  public start() {
    cc.log("NakamaAutoLogin.start");
    this.node.on(NakamaManager.OnLoginFail, this.loginFailed);
    this.tryLogin();
  }

  public onDestroy() {
    this.node.off(NakamaManager.OnLoginFail);
  }

  private tryLogin() {
    NakamaManager.instance.loginWithDevice();
  }

  private loginFailed() {
    setTimeout(() => {
      this.tryLogin();
    }, this.retryTime * 1000);
    // this.schedule(() => {
    //     this.tryLogin();
    // }, this.retryTime);
  }
}
