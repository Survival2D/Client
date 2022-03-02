 class PlayerThatWon
    {
         portrait:PlayerPortrait = null;
          winnerPortrait:Image = null;
         playersPortrait: Sprite[] = null;
           nakamaCollectionObject:NakamaCollectionObject = null;


        private awake()
        {
            this.portrait.PlayerNumber = GameManager.Instance.Winner.Value;
            winnerPortrait.sprite = playersPortrait[GameManager.Instance.Winner.Value];
            if (PlayersManager.Instance.CurrentPlayerNumber == GameManager.Instance.Winner.Value)
            {
                TrophiesData trophiesData = nakamaCollectionObject.GetValue<TrophiesData>();
                trophiesData = new TrophiesData(trophiesData.Amount + 1);
                nakamaCollectionObject.SetValue(trophiesData.Serialize());
            }
        }


}
