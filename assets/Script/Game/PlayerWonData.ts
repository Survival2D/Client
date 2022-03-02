class PlayerWonData {
    readonly TickKey = "tick";
    readonly PlayerNumberKey = "playerNumber";
    public tick: number;
    public playerNumber: number;

    public PlayerWonData(tick: number, playerNumber: number) {
        this.tick = tick;
        this.playerNumber = playerNumber;
    }
}
