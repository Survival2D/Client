const State = {
  NULL: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  DISCONNECTED: 3,
  FAILURE: 4,
  RECONNECTING: 5,
}

const WsClient = cc.Class.extend({
  ctor: function (url) {
    this.url = url;
  },
  connect: function () {
    cc.log("connect");
    this.ws = new WebSocket(this.url);
    const self = this;
    this.ws.onopen = function () {
      cc.log("connected to: " + self.url);
    }
    this.ws.onmessage = function (event) {
      const data = event.data;
      if (typeof data == "string") {
        cc.log("onmessage: " + data);
      } else {
        self.handleBinaryMessage(data);
      }
    }
    this.ws.onclose = function () {
      cc.log("disconnected from: " + self.url);
    }
    this.ws.onerror = function (e) {
      cc.log("connect to: " + self.url + " error : " + JSON.stringify(e));
    }
  },
  handleBinaryMessage: function (data) {
    cc.log("handleBinaryMessage: " + data);
  },
  disconnect: function () {
    cc.log("disconnect from " + this.url);
    this.ws.close();
  },
  destroy: function () {
    cc.log("destroy");
    this.disconnect();
  },
  sendBinary: function (data) {
    cc.log("sendBinary: " + data);
    this.ws.send(data);
  },
  sendText: function (text) {
    cc.log("sendText: " + text);
    this.ws.send(text);
  },
  sendData: function (data) {
    const json = JSON.stringify(data);
    this.sendText(json);
  }
});

const fbsClient = new WsClient("ws://localhost:1999/fbs");
fbsClient.connect();

const jsonClient = new WsClient("ws://localhost:1999/json");
jsonClient.connect();
jsonClient.sendText("hello world");
jsonClient.disconnect();
