import Color = cc.Color;

class BattleWinnerFeedback
    {
        public const string VictoryText = "VICTORY";
        public const string DefeatText = "DEFEAT";
        public const string DrawText = "DRAW";

         private  text:TMP_Text = null;
        private victoryColor: Color = Color.WHITE;
        private defeatColor: Color = Color.WHITE;
        private drawColor: Color = Color.WHITE;
         private  victorySound:AudioClip = null;
         private  defeatSound:AudioClip = null;
         private  drawSound:AudioClip = null;



        private start()
        {
            MultiplayerManager.instance.subscribe(Code.PlayerWon, ReceivedPlayerWonRound);
            MultiplayerManager.instance.subscribe(Code.Draw, ReceivedDrawRound);
        }

        private onDestroy()
        {
            MultiplayerManager.instance.unsubscribe(MultiplayerManager.Code.PlayerWon, ReceivedPlayerWonRound);
            MultiplayerManager.instance.unsubscribe(MultiplayerManager.Code.Draw, ReceivedDrawRound);
        }

        private void ReceivedPlayerWonRound(MultiplayerMessage message)
        {
            AudioManager.Instance.StopMusic();
            PlayerWonData data = message.GetData<PlayerWonData>();
            bool playerWon = PlayersManager.Instance.CurrentPlayerNumber == data.PlayerNumber;
            AudioManager.Instance.PlaySound(playerWon ? victorySound : defeatSound);
            text.text = playerWon ? VictoryText : DefeatText;
            text.color = playerWon ? victoryColor : defeatColor;
        }

        private void ReceivedDrawRound(MultiplayerMessage message)
        {
            AudioManager.Instance.StopMusic();
            AudioManager.Instance.PlaySound(drawSound);
            text.text = DrawText;
            text.color = drawColor;
        }

        #endregion
    }
}
