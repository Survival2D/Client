class MultiplayerLeaveMatchButton {
  private button: Button = null;

  private awake() {
    this.button.node.on("click", this.leaveMatch, this);
  }

  private leaveMatch() {
    this.button.interactable = false;
    MultiplayerManager.instance.leaveMatchAsync();
  }
}
