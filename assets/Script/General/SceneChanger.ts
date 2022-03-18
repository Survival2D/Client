import ccclass = cc._decorator.ccclass;
import { eventHandler } from "../Utils/EventHandler";
import NakamaManager from "../Nakama/NakamaManager";
import property = cc._decorator.property;

@ccclass
export default class SceneChanger extends cc.Component {
  static instance: SceneChanger;

  onLoad() {
    cc.log("SceneChanger::onLoad");
    SceneChanger.instance = this;
    eventHandler.on(NakamaManager.OnLoginSuccess, this.loadHomeScene);
  }

  loadHomeScene() {
    cc.log("SceneChanger::loadHomeScene");
    cc.director.loadScene("HomeScene");
  }

  loadLobbyScene() {
    this.loadGameScene();
    return; //TODO
    cc.log("SceneChanger::loadLobbyScene");
    cc.director.loadScene("LobbyScene");
  }

  loadGameScene() {
    cc.log("SceneChanger::loadGameScene");
    cc.director.loadScene("GameScene");
  }
}
