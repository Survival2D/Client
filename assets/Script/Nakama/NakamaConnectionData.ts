export default class NakamaConnectionData {
  // scheme: string = null;
  host: string = null;
  port: string = null;
  serverKey: string = null;

  constructor(
    // scheme?: string,
    host?: string,
    port?: string,
    serverKey?: string
  ) {
    // this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.serverKey = serverKey;
  }
}
