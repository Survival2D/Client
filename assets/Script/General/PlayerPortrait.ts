 class PlayerPortrait
    {

          playerNumber:number = 0;
           portrait:cc.Sprite = null;
           noPlayerColor:Color = Color.WHITE;
          connectedPlayerColor:Color = Color.WHITE;
         displayName:cc.Label = null;
         youColor:Color = Color.WHITE;
          othersColor:Color = Color.WHITE;

          playersManager:PlayersManager = null;


        private awake()
        {
            this.playersManager = PlayersManager.instance;
        }

        private  start()
        {
            this.playersManager.onPlayerJoined += PlayerJoined;
            this.playersManager.onPlayerLeft += PlayerLeft;
            this.playersManager.onPlayersReceived += PlayersReceived;
            this.playersManager.onLocalPlayerObtained += LocalPlayerObtained;
            this.setPortrait(playersManager.Players);
        }

        private  onDestroy()
        {
           this. playersManager.onPlayerJoined -= PlayerJoined;
            this.playersManager.onPlayerLeft -= PlayerLeft;
            this.playersManager.onPlayersReceived -= PlayersReceived;
            this.playersManager.onLocalPlayerObtained -= LocalPlayerObtained;
        }

        private  LocalPlayerObtained( player:PlayerData,  playerNumber:number)
        {
            this.displayName.node.color = this.playerNumber == playerNumber ? this.youColor : this.othersColor;
        }

        private PlayersReceived(List<PlayerData> players)
        {
            SetPortrait(players);
        }

        private void PlayerLeft(PlayerData player)
        {
            SetPortrait(playersManager.Players);
        }

        private void PlayerJoined(PlayerData player)
        {
            SetPortrait(playersManager.Players);
        }

        private void SetPortrait(List<PlayerData> players)
        {
            bool hasPlayer = players != null && players.Count > playerNumber && players[playerNumber] != null;
            portrait.color = hasPlayer ? connectedPlayerColor : noPlayerColor;
            displayName.text = hasPlayer ? players[playerNumber].DisplayName : string.Empty;
            displayName.color = playersManager.CurrentPlayerNumber == playerNumber ? youColor : othersColor;
        }

        #endregion
    }
}
