class TrophiesUI {
    private nakamaCollectionObject: NakamaCollectionObject = null;
    private text: TMP_Text = null;

    public Start() {
        let trophiesData: TrophiesData = this.nakamaCollectionObject.GetValue<TrophiesData>();
        if (trophiesData == null)
            trophiesData = new TrophiesData();

        this.text.text = trophiesData.amount;
    }
}
