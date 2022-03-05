import ccclass = cc._decorator.ccclass;
import NakamaManager from "../Nakama/NakamaManager";
import MultiplayerManager from "../Nakama/MultiplayerManager";
import MultiplayerMessage from "../Nakama/MultiplayerMessage";

@ccclass
export default class PlayersManager extends cc.Component {
  private nakamaManager: NakamaManager = null;
  private multiplayerManager: MultiplayerManager = null;
  private blockJoinsAndLeaves: boolean = false;

  // public event Action<List<PlayerData>> onPlayersReceived;
  // public event Action<PlayerData> onPlayerJoined;
  // public event Action<PlayerData> onPlayerLeft;
  // public event Action<PlayerData, int> onLocalPlayerObtained;

  public static instance: PlayersManager = null;
  public players: PlayerData[] = [];

  public playersCount(): number {
    return this.players.filter((player) => player != null).length;
  }

  public currentPlayer: PlayerData = null;
  public currentPlayerNumber: number = -1;

  onLoad() {
    PlayersManager.instance = this;
  }

  start() {
    // this.multiplayerManager = MultiplayerManager.instance;
    // this.nakamaManager = NakamaManager.instance;
    // multiplayerManager.onMatchJoin += MatchJoined;
    // multiplayerManager.onMatchLeave += ResetLeaved;
    // multiplayerManager.Subscribe(MultiplayerManager.Code.Players, SetPlayers);
    // multiplayerManager.Subscribe(MultiplayerManager.Code.PlayerJoined, PlayerJoined);
    // multiplayerManager.Subscribe(MultiplayerManager.Code.ChangeScene, MatchStarted);
  }

  onDestroy() {
    // multiplayerManager.onMatchJoin -= MatchJoined;
    // multiplayerManager.onMatchLeave -= ResetLeaved;
    // multiplayerManager.Unsubscribe(MultiplayerManager.Code.Players, SetPlayers);
    // multiplayerManager.Unsubscribe(MultiplayerManager.Code.PlayerJoined, PlayerJoined);
    // multiplayerManager.Unsubscribe(MultiplayerManager.Code.ChangeScene, MatchStarted);
  }

  private setPlayers(message: MultiplayerMessage) {
    // Players = message.GetData<List<PlayerData>>();
    // onPlayersReceived?.Invoke(Players);
    // GetCurrentPlayer();
  }

  private playerJoined(message: MultiplayerMessage) {
    // PlayerData player = message.GetData<PlayerData>();
    // int index = Players.IndexOf(null);
    // if (index > -1)
    //     Players[index] = player;
    // else
    //     Players.Add(player);
    //
    // onPlayerJoined?.Invoke(player);
  }

  private playersChanged(matchPresenceEvent /*:IMatchPresenceEvent*/) {
    // if (blockJoinsAndLeaves)
    //     return;
    //
    // foreach (IUserPresence userPresence in matchPresenceEvent.Leaves)
    // {
    //     for (int i = 0; i < Players.Count(); i++)
    //     {
    //         if (Players[i] != null && Players[i].Presence.SessionId == userPresence.SessionId)
    //         {
    //             onPlayerLeft?.Invoke(Players[i]);
    //             Players[i] = null;
    //         }
    //     }
    // }
  }

  private matchJoined() {
    // this.nakamaManager.socket.ReceivedMatchPresence += PlayersChanged;
    // this.getCurrentPlayer();
  }

  private getCurrentPlayer() {
    // if (this.players == null)
    //     return;
    //
    // if (this.multiplayerManager.Self == null)
    //     return;
    //
    // if (this.currentPlayer != null)
    //     return;
    //
    // this.currentPlayer = this.players.find(player=>player.Presence.SessionId = this.multiplayerManager.Self.SessionId);
    //
    // this.currentPlayerNumber = this.players.indexOf(this.currentPlayer);
    // this.onLocalPlayerObtained?.Invoke(CurrentPlayer, CurrentPlayerNumber);
  }

  private resetLeaved() {
    // this.nakamaManager.Socket.ReceivedMatchPresence -= PlayersChanged;
    this.blockJoinsAndLeaves = false;
    this.players = null;
    this.currentPlayer = null;
    this.currentPlayerNumber = -1;
  }

  public matchStarted(message: MultiplayerMessage) {
    this.blockJoinsAndLeaves = true;
  }
}
