import ccclass = cc._decorator.ccclass;

@ccclass
export default class NakamaDisconnectedChangeScene extends cc.Component {
  private sceneName: string = null;
  isListening: boolean = false;

  ctor() {}

  start() {
    // NakamaManager.instance.onDisconnected += this.disconnected;
  }

  onDestroy() {
    // NakamaManager.instance.onDisconnected -= this.disconnected;
  }

  private disconnected() {
    // SceneManager.loadScene(this.sceneName);
  }
}
