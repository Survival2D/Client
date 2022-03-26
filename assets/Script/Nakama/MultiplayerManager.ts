import { Match, Presence, RpcResponse } from "@heroiclabs/nakama-js";
import Action = cc.Action;
import ccclass = cc._decorator.ccclass;
import MultiplayerMessage from "./MultiplayerMessage";
import NakamaManager from "./NakamaManager";
import { eventHandler } from "../Utils/EventHandler";
import RPCs from "../Utils/RPCs";
import { JoinMatchData } from "./RPCData";
import {Code} from "./OperationCode";
import {MatchManager} from "../Game/MatchManager";

@ccclass
export default class MultiplayerManager extends cc.Component {
  static readonly OnLocalTick: string = "MultiplayerManager.OnLocalTick";
  static readonly OnMatchLeave: string = "MultiplayerManager.OnMatchLeave";
  static readonly OnMatchJoin: string = "MultiplayerManager.OnMatchJoin";

  tickRate: number = 5;
  sendRate: number = 1 / this.tickRate;
  logFormat: string = "{0} with code {1}:\n{2}";
  static readonly SendingDataLog: string = "Sending data";
  static readonly ReceivedDataLog: string = "Received data";

  enableLog: boolean = false;

  // onReceiveData: Map<Code, Action<MultiplayerMessage>> = new Map<
  //   Code,
  //   Action<MultiplayerMessage>
  // >();
  match: Match = null;

  static instance: MultiplayerManager = null;
  private interval: NodeJS.Timer;

  self(): Presence {
    return this.match == null ? null : this.match.self;
  }

  isOnMatch(): boolean {
    return this.match != null;
  }

  onLoad() {
    MultiplayerManager.instance = this;
  }

  start() {
    this.interval = setInterval(this.localTickPassed, this.sendRate * 1000);
  }

  localTickPassed() {
    eventHandler.dispatchEvent(MultiplayerManager.OnLocalTick);
  }

  async joinMatchAsync() {
    // NakamaManager.instance.socket.ReceivedMatchState -= Receive;
    // NakamaManager.instance.socket.ReceivedMatchState += Receive;
    eventHandler.on(NakamaManager.OnDisconnected, this.disconnected.bind(this));
    cc.log("NakamaManager:", NakamaManager.instance);
    let rpcResult: RpcResponse = await NakamaManager.instance.sendRPC(
      RPCs.JoinOrCreateMatchRpc
    );
    cc.log("rpcResult:", JSON.stringify(rpcResult));
    let result = rpcResult.payload as JoinMatchData;
    let matchId: string = result.matchId;
    cc.log("matchId", matchId);
    this.match = await NakamaManager.instance.socket.joinMatch(matchId);

    cc.log("match:", this.match);
    eventHandler.dispatchEvent(MultiplayerManager.OnMatchJoin);
  }

  private disconnected() {
    eventHandler.off(NakamaManager.OnDisconnected, this.disconnected);
    // NakamaManager.Instance.Socket.ReceivedMatchState -= Receive;
    this.match = null;
    eventHandler.dispatchEvent(MultiplayerManager.OnMatchLeave);
  }

  public async leaveMatchAsync() {
    eventHandler.off(NakamaManager.OnDisconnected, this.disconnected);
    // NakamaManager.Instance.Socket.ReceivedMatchState -= Receive;
    await NakamaManager.instance.socket.leaveMatch(this.match.match_id);
    this.match = null;
    eventHandler.dispatchEvent(MultiplayerManager.OnMatchLeave);
  }

  public async send(code: Code, data: object | []) {
    if (this.match == null) return;

    let json: string = JSON.stringify(data);
    if (this.enableLog) cc.log(MultiplayerManager.SendingDataLog, code, json);

    await NakamaManager.instance.socket.sendMatchState(
      this.match.match_id,
      code,
      json
    );
  }

  receive(newState): void {
    if (this.enableLog) {
      let encoder = new TextEncoder();
      const json = encoder.encode(newState.State);
      cc.log(MultiplayerManager.ReceivedDataLog, newState.OpCode, json);
    }

    // let
    // multiplayerMessage:MultiplayerMessage = new MultiplayerMessage(newState);
    // if (this.onReceiveData.has(multiplayerMessage.dataCode))
    //     onReceiveData[multiplayerMessage.DataCode]?.Invoke(multiplayerMessage);
  }

  // public
  // subscribe(Code
  // code, Action < MultiplayerMessage > action
  // )
  // {
  //     if (!this.onReceiveData.has(code))
  //         onReceiveData.Add(code, null);
  //
  //     onReceiveData[code] += action;
  // }
  //
  // unsubscribe(code
  // :
  // Code, Action < MultiplayerMessage > action
  // )
  // {
  //     if (this.onReceiveData.has(code))
  //         onReceiveData[code] -= action;
  // }
  //
  // logData(description
  // :
  // string, dataCode
  // :
  // number, json
  // :
  // string
  // )
  // {
  //
  //     console.log(string.Format(LogFormat, description, (Code)
  //     dataCode, json
  // ))
  //     ;
  // }
}
