﻿import ccclass = cc._decorator.ccclass;
import NakamaManager from "./NakamaManager";
import NakamaConnectionData from "./NakamaConnectionData";

@ccclass
export default class NakamaAutoLogin extends cc.Component {
  private retryTime: number = 5;

  public onLoad() {
    cc.log("NakamaAutoLogin.start");
    this.node.on(NakamaManager.OnLoginFail, this.loginFailed);
    this.tryLogin();
    this.node.on(NakamaManager.OnLoginSuccess, () => {
      cc.log("Tien log bat event");
    });
  }

  public onDestroy(): void {
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
