import Event = cc.Event;

class OnStart {
  public onStart: Event = null;

  private start() {
    this.onStart?.Invoke();
  }
}
