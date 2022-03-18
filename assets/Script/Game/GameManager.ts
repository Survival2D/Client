import { Client } from "@heroiclabs/nakama-js";
import { RpcResponse } from "@heroiclabs/nakama-js/client";
import MultiplayerManager from "../Nakama/MultiplayerManager";
import { eventHandler } from "../Utils/EventHandler";
import SceneChanger from "../General/SceneChanger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
  public readonly VictoriesRequiredToWin = 3;

  public static instance: GameManager = null;
  public playersWins: number[] = [];
  public winner?: number = 0;

  onLoad() {
    GameManager.instance = this;
  }

  start() {
    // MultiplayerManager.instance.Subscribe(MultiplayerManager.Code.PlayerWon, ReceivedPlayerWonRound);
    // MultiplayerManager.Instance.Subscribe(MultiplayerManager.Code.Draw, ReceivedDrawRound);
    // MultiplayerManager.Instance.Subscribe(MultiplayerManager.Code.ChangeScene, ReceivedChangeScene);
    eventHandler.on(MultiplayerManager.OnMatchJoin, this.joinedMatch);
    eventHandler.on(MultiplayerManager.OnMatchLeave, this.leavedMatch);
  }

  onDestroy(): void {
    // {
    //     MultiplayerManager.Instance.Unsubscribe(MultiplayerManager.Code.PlayerWon, ReceivedPlayerWonRound);
    //     MultiplayerManager.Instance.Unsubscribe(MultiplayerManager.Code.Draw, ReceivedDrawRound);
    //     MultiplayerManager.Instance.Unsubscribe(MultiplayerManager.Code.PlayerInput, ReceivedChangeScene);
    //     MultiplayerManager.Instance.onMatchJoin -= JoinedMatch;
    //     MultiplayerManager.Instance.onMatchLeave -= LeavedMatch;
  }

  // receivedPlayerWonRound(message: MultiplayerMessage) {
  //   // PlayerWonData playerWonData = message.GetData<PlayerWonData>();
  //   // PlayersWins[playerWonData.PlayerNumber]++;
  //   // Winner = playerWonData.PlayerNumber;
  // }
  //
  // receivedDrawRound(message: MultiplayerMessage) {
  //   this.winner = null;
  // }
  //
  // receivedChangeScene(message: MultiplayerMessage) {
  //   // SceneManager.LoadScene(message.GetData<int>());
  // }

  joinedMatch() {
    cc.log("GameManager", this);
    cc.log("instance", GameManager.instance);
    this.resetPlayerWins();
    this.goToLobby();
  }

  leavedMatch() {
    this.goToHome();
  }

  resetPlayerWins() {
    cc.log("ResetPlayerWins");
    this.playersWins = new Array(4);
  }

  goToHome() {
    SceneChanger.instance.loadGameScene();
  }

  goToLobby() {
    SceneChanger.instance.loadLobbyScene();
  }
}
