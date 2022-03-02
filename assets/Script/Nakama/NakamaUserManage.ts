﻿import { ApiAccount, ApiUser } from "@heroiclabs/nakama-js/dist/api.gen";
import ccclass = cc._decorator.ccclass;

@ccclass
class NakamaUserManager extends cc.Component {
  private account: ApiAccount = null;

  public static instance: NakamaUserManager = null;
  public loadingFinished: boolean = false;

  public getUser(): ApiUser {
    return this.account.user;
  }

  public getWallet(): string {
    return this.account.wallet;
  }

  public getDisplayName(): string {
    return this.account.user.display_name;
  }

  private awake() {
    NakamaUserManager.instance = this;
  }

  public start() {
    NakamaManager.instance.onLoginSuccess += AutoLoad;
  }

  public onDestroy() {
    NakamaManager.Instance.onLoginSuccess -= AutoLoad;
  }

  private async autoLoad() {
    this.account = await NakamaManager.Instance.Client.GetAccountAsync(
      NakamaManager.Instance.Session
    );
    this.loadingFinished = true;
    this.onLoaded?.Invoke();
  }

  public async updateDisplayName(displayName: string) {
    await NakamaManager.Instance.Client.UpdateAccountAsync(
      NakamaManager.Instance.Session,
      null,
      displayName
    );
  }
}
