class MultiplayerIdentity {
  private static currentId: number = 0;

  public id: string = null;

  public isLocalPlayer(): boolean {
    return (
      MultiplayerManager.instance.self != null &&
      MultiplayerManager.instance.self.sessionId == this.id
    );
  }

  private awake() {
    this.assignIdentity();
  }

  private assignIdentity() {
    this.id = String(MultiplayerIdentity.currentId++);
  }

  public setId(id: string) {
    this.id = id;
  }

  public static resetIds() {
    MultiplayerIdentity.currentId = 0;
  }
}
