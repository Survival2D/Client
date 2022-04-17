import NakamaManager from "./NakamaManager";
import NakamaConnectionData from "./NakamaConnectionData";
import { eventHandler } from "../Utils/EventHandler";

export default class NakamaAutoLogin {
  private retryTime: number = 5;

  static init() {
    new NakamaAutoLogin().onLoad();
  }

  async onLoad() {
    cc.log("NakamaAutoLogin.start");
    eventHandler.on(NakamaManager.OnLoginFail, this.loginFailed.bind(this));
    await this.tryLogin();
    eventHandler.on(NakamaManager.OnLoginSuccess, () => {
      cc.log("Tien log bat event On Login Success");
    });
  }

  onDestroy(): void {
    eventHandler.off(NakamaManager.OnLoginFail, this.loginFailed);
  }

  async tryLogin() {
    await NakamaManager.instance.loginWithDeviceId();
  }

  loginFailed() {
    setTimeout(async () => {
      await this.tryLogin();
    }, this.retryTime * 1000);
    // this.schedule(() => {
    //     this.tryLogin();
    // }, this.retryTime);
  }
}
