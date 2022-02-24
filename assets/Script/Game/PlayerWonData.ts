using Newtonsoft.Json;

namespace NinjaBattle.Game
{
    public class PlayerWonData
    {
        #region FIELDS

        readonly TickKey = "tick";
        readonly PlayerNumberKey = "playerNumber";

        #endregion

        #region PROPERTIES

        [JsonProperty(TickKey)] public int Tick { get; private set; }
        [JsonProperty(PlayerNumberKey)] public int PlayerNumber { get; private set; }

        #endregion

        #region CONSTRUCTORS

        public PlayerWonData(int tick, int playerNumber)
        {
            Tick = tick;
            PlayerNumber = playerNumber;
        }

        #endregion
    }
}
