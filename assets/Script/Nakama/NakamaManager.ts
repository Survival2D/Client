import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import { RpcResponse } from "@heroiclabs/nakama-js/client";

class NakamaManager extends cc.Node {
  readonly udidKey: string = "udid";

  connectionData: NakamaConnectionData = null;

  client: Client = null;
  session: Session = null;
  socket: Socket = null;

  onConnecting = null;
  onConnected = null;
  onDisconnected = null;
  onLoginSuccess = null;
  onLoginFail = null;

  static instance: NakamaManager = null;

  username(): string {
    return this.session == null ? "" : this.session.username;
  }

  isLoggedIn(): boolean {
    return this.socket != null; // && this.socket.adapter.isConnected();
  }

  awake() {
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
      this.connectionData.scheme,
      this.connectionData.host,
      this.connectionData.port
    );

    let deviceId = null;
    // If the user's device ID is already stored, grab that - alternatively get the System's unique device identifier.
    try {
      const value = AsyncStorage.getItem("@MyApp:deviceKey");
      if (value !== null) {
        deviceId = value;
      } else {
        // deviceId = DeviceInfo.getUniqueId();
        deviceId = DeviceInfo.getDeviceId();
        // Save the user's device ID so it can be retrieved during a later play session for re-authenticating.
        AsyncStorage.setItem("@MyApp:deviceKey", deviceId).catch(function (
          error
        ) {
          console.log("An error occurred: %o", error);
        });
      }
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
      this.connectionData.scheme,
      this.connectionData.host,
      this.connectionData.port,
      this.connectionData.serverKey,
      UnityWebRequestAdapter.Instance
    );
    this.loginAsync(
      this.connectionData,
      this.client.authenticateCustom(customId)
    );
  }

  async loginAsync(
    connectionData,
    sessionTask: () => Promise<Session>
  ): NakamaConnectionData {
    this.onConnecting.call();
    try {
      this.session = await sessionTask();
      this.socket = this.client.createSocket(true);
      this.socket.connected += this.connected;
      this.socket.closed += Disconnected;
      await this.socket.connect(this.session, true);
      this.dispatchEvent(
        new cc.Event.EventCustom(GameEventType.LOGIN_SUCCESS, true)
      );
    } catch (exception) {
      console.error(exception);
      this.dispatchEvent(
        new cc.Event.EventCustom(GameEventType.LOGIN_FAIL, true)
      );
    }
  }

  logOut() {
    this.socket.disconnect(true);
  }

  connected() {
    this.dispatchEvent(new cc.Event.EventCustom(GameEventType.CONNECTED, true));
  }

  disconnected() {
    this.dispatchEvent(
      new cc.Event.EventCustom(GameEventType.DISCONNECTED, true)
    );
  }

  async sendRPC(rpc: string, payload: object): Promise<RpcResponse> {
    if (this.client === null || this.session == null) return null;
    return await this.client.rpc(this.session, rpc, payload);
  }
}
