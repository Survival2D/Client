import { eventHandler } from "../Utils/EventHandler";
import NakamaManager from "../Nakama/NakamaManager";

export default class SceneChanger {
  static instance: SceneChanger;

  static init() {
    cc.log("SceneChanger::init");
    SceneChanger.instance = new SceneChanger();
    eventHandler.on(
        NakamaManager.OnLoginSuccess,
        SceneChanger.instance.loadHomeScene.bind(this)
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
