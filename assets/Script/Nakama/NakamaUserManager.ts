import { ApiAccount, ApiUser } from "@heroiclabs/nakama-js/dist/api.gen";
import ccclass = cc._decorator.ccclass;
import NakamaManager from "./NakamaManager";

@ccclass
export default class NakamaUserManager extends cc.Component {
  static readonly OnLoaded: string = "NakamaUserManager.OnLoaded";

  account: ApiAccount = null;

  static instance: NakamaUserManager = null;
  loadingFinished: boolean = false;

  public getUser(): ApiUser {
    return this.account.user;
  }

  public getWallet(): string {
    return this.account.wallet;
  }

  public getDisplayName(): string {
    return this.account.user.display_name;
  }

  public onLoad() {
    NakamaUserManager.instance = this;
    cc.log("Tien log o day");
  }

  public start() {
    this.node.on(NakamaManager.OnLoginSuccess, this.autoLoad);
  }

  public onDestroy() {
    this.node.off(NakamaManager.OnLoginSuccess);
  }

  private async autoLoad() {
    this.account = await NakamaManager.instance.client.getAccount(
      NakamaManager.instance.session
    );
    cc.log("Tien log account", this.account);
    this.loadingFinished = true;
    cc.log("Tien log account", this.node);
    this.node.dispatchEvent(
      new cc.Event.EventCustom(NakamaUserManager.OnLoaded, true)
    );
  }

  public async updateDisplayName(displayName: string) {
    await NakamaManager.instance.client.updateAccount(
      NakamaManager.instance.session,
      {
        display_name: displayName,
      }
    );
  }
}
