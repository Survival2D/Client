/**
 * Tự tạo một global cc.EventTarget cho tiện, dispatch event cũng dễ hơn
 */
class EventHandler {
  private readonly eventTarget: cc.EventTarget = new cc.EventTarget();

  on(event: string, callback: () => void) {
    this.eventTarget.on(event, callback);
  }

  off(event: string, callback: () => void) {
    this.eventTarget.off(event, callback);
  }

  dispatchEvent(event: string | cc.Event) {
    if (event instanceof cc.Event) this.eventTarget.dispatchEvent(event);
    else this.eventTarget.dispatchEvent(new cc.Event.EventCustom(event, true));
  }
}

export var eventHandler = new EventHandler();
