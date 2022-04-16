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
    eventHandler.on(
      NakamaManager.OnLoginSuccess,
      this.loadHomeScene.bind(this)
    );
  }

  loadHomeScene() {
    cc.log("SceneChanger::loadHomeScene");
    cc.director.loadScene("HomeScene");
  }

  loadLobbyScene() {
    cc.log("SceneChanger::loadLobbyScene");
    cc.director.loadScene("LobbyScene");
  }

  loadMatchScene() {
    cc.log("SceneChanger::loadMatchScene");
    cc.director.loadScene("MatchScene");
  }
}
