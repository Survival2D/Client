import { Match } from "@heroiclabs/nakama-js";

export default class MultiplayerMessage {
  json: string = null;
  bytes = null;

  dataCode: Code;
  sessionId: string;
  userId: string;
  username: string;

  public MultiplayerMessage(matchState: any) {
    //TODO:check
    this.dataCode = matchState.opCode as Code;
    if (matchState.UserPresence != null) {
      this.userId = matchState.userPresence.userId;
      this.sessionId = matchState.userPresence.sessionId;
      this.username = matchState.userPresence.username;
    }

    let encoder = new TextEncoder();
    this.bytes = encoder.encode(matchState.State);
    this.json = this.bytes.toString();
  }

  getData<T>() {
    // return json.Deserialize<T>();
  }

  getBytes() {
    return this.bytes;
  }
}
