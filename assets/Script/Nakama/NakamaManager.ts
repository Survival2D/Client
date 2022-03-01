import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import { RpcResponse } from "@heroiclabs/nakama-js/client";
import { v4 as uuid } from "uuid";
import ccclass = cc._decorator.ccclass;
import NakamaConnectionData from "./NakamaConnectionData";

@ccclass
export default class NakamaManager extends cc.Component {
  static readonly OnConnecting: string = "NakamaManager.OnConnecting";
  static readonly OnConnected: string = "NakamaManager.OnConnected";
  static readonly OnDisconnected: string = "NakamaManager.OnDisconnected";
  static readonly OnLoginSuccess: string = "NakamaManager.OnLoginSuccess";
  static readonly OnLoginFail: string = "NakamaManager.OnLoginFail";

  connectionData: NakamaConnectionData = new NakamaConnectionData(
    "127.0.0.1",
    "7350",
    "defaultkey"
  );

  client: Client = null;
  session: Session = null;
  socket: Socket = null;

  static instance: NakamaManager = null;

  username(): string {
    return this.session == null ? "" : this.session.username;
  }

  isLoggedIn(): boolean {
    return this.socket != null; // && this.socket.adapter.isConnected();
  }

  start() {
    cc.log("NakamaManager.start");
    NakamaManager.instance = this;
  }

  onApplicationQuit() {
    if (this.socket != null) this.socket.disconnect(true);
  }

  loginWithUdid() {
    // let udid = PlayerPrefs.GetString(UdidKey, Guid.NewGuid().ToString());
    // PlayerPrefs.SetString(UdidKey, udid);
    // this.client = new Client(this.connectionData.scheme, this.connectionData.host, this.connectionData.port, this.connectionData.serverKey, UnityWebRequestAdapter.Instance);
    // this.loginAsync(this.connectionData, this.client.authenticateDevice(udid));
  }

  loginWithDevice() {
    this.client = new Client(
      this.connectionData.serverKey,
      this.connectionData.host,
      this.connectionData.port
    );

    let deviceId: string = uuid();
    // If the user's device ID is already stored, grab that - alternatively get the System's unique device identifier.
    try {
      // const value = AsyncStorage.getItem("@MyApp:deviceKey");
      // if (value !== null) {
      //   deviceId = value;
      // } else {
      //   // deviceId = DeviceInfo.getUniqueId();
      //   deviceId = DeviceInfo.getDeviceId();
      //   // Save the user's device ID so it can be retrieved during a later play session for re-authenticating.
      //   AsyncStorage.setItem("@MyApp:deviceKey", deviceId).catch(function (
      //     error
      //   ) {
      //     console.log("An error occurred: %o", error);
      //   });
      // }
    } catch (error) {
      console.log("An error occurred: %o", error);
    }

    this.loginAsync(
      this.connectionData,
      // this.client.authenticateDevice(SystemInfo.deviceUniqueIdentifier)
      this.client.authenticateDevice(deviceId)
    );
  }

  loginWithCustomId(customId: string) {
    this.client = new Client(
      this.connectionData.serverKey,
      this.connectionData.host,
      this.connectionData.port
    );
    this.loginAsync(
      this.connectionData,
      this.client.authenticateCustom(customId)
    );
  }

  async loginAsync(connectionData, sessionTask: Promise<Session>) {
    this.node.dispatchEvent(
      new cc.Event.EventCustom(NakamaManager.OnConnecting, true)
    );
    sessionTask
      .then((session) => {
        this.session = session;
        this.socket = this.client.createSocket(false);
        // this.socket.connected += this.connected;
        // this.socket.closed += Disconnected;
        this.socket.connect(this.session, true);
        this.node.dispatchEvent(
          new cc.Event.EventCustom(NakamaManager.OnLoginSuccess, true)
        );
        cc.log("login thanh cong", this.session, this.client);
      })
      .catch((exception) => {
        cc.error(exception);
        this.node.dispatchEvent(
          new cc.Event.EventCustom(NakamaManager.OnLoginFail, true)
        );
      });
  }

  logOut() {
    this.socket.disconnect(true);
  }

  connected() {
    this.node.dispatchEvent(
      new cc.Event.EventCustom(NakamaManager.OnConnected, true)
    );
  }

  disconnected() {
    this.node.dispatchEvent(
      new cc.Event.EventCustom(NakamaManager.OnDisconnected, true)
    );
  }

  async sendRPC(rpc: string, payload: object): Promise<RpcResponse> {
    if (this.client === null || this.session == null) return null;
    return await this.client.rpc(this.session, rpc, payload);
  }
}
