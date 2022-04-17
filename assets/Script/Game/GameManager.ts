import { Client } from "@heroiclabs/nakama-js";
import { RpcResponse } from "@heroiclabs/nakama-js/client";
import MultiplayerManager from "../Nakama/MultiplayerManager";
import { eventHandler } from "../Utils/EventHandler";
import SceneChanger from "../General/SceneChanger";
import {MatchManager} from "../Match/Logic/MatchManager";
import {UserInfo} from "./UserInfo";
import NakamaManager from "../Nakama/NakamaManager";

export default class GameManager {
  public readonly VictoriesRequiredToWin = 3;

  public static instance: GameManager = null;
  public playersWins: number[] = [];
  public winner?: number = 0;

  public userInfo = new UserInfo();

  static init() {
    GameManager.instance = new GameManager();

    eventHandler.on(
        NakamaManager.OnLoginSuccess,
        () => {GameManager.instance.userInfo = new UserInfo(NakamaManager.instance.session.user_id);}
    );

    // MultiplayerManager.instance.Subscribe(MultiplayerManager.Code.PlayerWon, ReceivedPlayerWonRound);
    // MultiplayerManager.Instance.Subscribe(MultiplayerManager.Code.Draw, ReceivedDrawRound);
    // MultiplayerManager.Instance.Subscribe(MultiplayerManager.Code.ChangeScene, ReceivedChangeScene);
    eventHandler.on(
        MultiplayerManager.OnMatchJoin,
        GameManager.instance.joinedMatch.bind(GameManager.instance)
    );
    eventHandler.on(
        MultiplayerManager.OnMatchLeave,
        GameManager.instance.leavedMatch.bind(GameManager.instance)
    );
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
    SceneChanger.instance.loadHomeScene();
  }

  goToLobby() {
    MatchManager.getInstance().newMatch();
  }
}
