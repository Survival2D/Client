class PlayerData {
    readonly PresenceKey = "presence";
    readonly DisplayNameKey = "displayName";

    presence: PresenceData = null;
    displayName: string = null;

    public PlayerData(presence: PresenceData, displayName: string) {
        this.presence = presence;
        this.displayName = displayName;
    }


}
