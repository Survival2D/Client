/**
 * Tự tạo một global cc.EventTarget cho tiện, dispatch event cũng dễ hơn
 */
class EventHandler {
  private readonly eventTarget: cc.EventTarget = new cc.EventTarget();

  on(event: string, callback: (...params) => void) {
    this.eventTarget.on(event, callback);
  }

  off(event: string, callback: (...params) => void) {
    this.eventTarget.off(event, callback);
  }

  dispatchEvent(event: string | cc.Event, data?: any) {
    if (event instanceof cc.Event) this.eventTarget.dispatchEvent(event);
    else {
      const eventCustom = new cc.Event.EventCustom(event, true);
      eventCustom.setUserData(data);
      this.eventTarget.dispatchEvent(eventCustom);
    }
  }
}

export var eventHandler = new EventHandler();
