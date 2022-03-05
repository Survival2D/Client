import Button = cc.Button;

class NakamaDisconnectButton extends cc.Button {
  private button: Button = null;
  private clickEventHandler: cc.Component.EventHandler;

  ctor() {
    this.clickEventHandler = new cc.Component.EventHandler();
    this.clickEventHandler.target = this.node; // This node is the node to which your event handler code component belongs
    this.clickEventHandler.component = "NakamaDisconnectButton"; // This is the code file name
    this.clickEventHandler.handler = "disconnect";
    this.clickEventHandler.customEventData = "";
  }

  private awake() {
    this.button.clickEvents.push(this.clickEventHandler);
  }

  public onDestroy(): void {
    let index = this.button.clickEvents.indexOf(this.clickEventHandler);
    this.button.clickEvents.splice(index, 1);
  }

  private disconnect() {
    NakamaManager.instance.logOut();
  }
}
