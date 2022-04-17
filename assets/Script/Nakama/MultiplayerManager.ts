import { Match, Presence, RpcResponse } from "@heroiclabs/nakama-js";
import MultiplayerMessage from "./MultiplayerMessage";
import NakamaManager from "./NakamaManager";
import { eventHandler } from "../Utils/EventHandler";
import RPCs from "../Utils/RPCs";
import { JoinMatchData } from "./RPCData";
import {Code} from "./OperationCode";

export default class MultiplayerManager {
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

  static init() {
    MultiplayerManager.instance = new MultiplayerManager();
    MultiplayerManager.instance.interval = setInterval(MultiplayerManager.instance.localTickPassed, MultiplayerManager.instance.sendRate * 1000);
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

    if (this.enableLog) cc.log(MultiplayerManager.SendingDataLog, code, data);

    await NakamaManager.instance.socket.sendMatchState(
      this.match.match_id,
      code,
      data
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
