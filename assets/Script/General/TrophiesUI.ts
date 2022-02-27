class TrophiesUI {
    private nakamaCollectionObject: NakamaCollectionObject = null;
    private text: cc.Label = null;

    public Start() {
        let trophiesData: TrophiesData = this.nakamaCollectionObject.GetValue<TrophiesData>();
        if (trophiesData == null)
            trophiesData = new TrophiesData();

        this.text.string = String(trophiesData.amount);
    }
}
