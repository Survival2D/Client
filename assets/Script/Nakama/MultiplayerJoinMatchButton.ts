class MultiplayerJoinMatchButton {
  private button: Button = null;

  private awake() {
    this.button.onClick.AddListener(FindMatch);
  }

  private findMatch() {
    this.button.interactable = false;
    MultiplayerManager.instance.joinMatchAsync();
  }
}
