import { Client } from "@heroiclabs/nakama-js";
import { RpcResponse } from "@heroiclabs/nakama-js/client";

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
    // MultiplayerManager.Instance.onMatchJoin += JoinedMatch;
    // MultiplayerManager.Instance.onMatchLeave += LeavedMatch;
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

  private joinedMatch() {
    this.resetPlayerWins();
    this.goToLobby();
  }

  leavedMatch() {
    this.goToHome();
  }

  resetPlayerWins() {
    this.playersWins = new Array(4);
  }

  goToHome() {
    // SceneManager.LoadScene((int)Scenes.Home);
  }

  goToLobby() {
    // SceneManager.LoadScene((int)Scenes.Lobby);
  }
}
