using Newtonsoft.Json;

namespace NinjaBattle.Game
{
    public class InputData
    {
        #region FIELDS

        readonly TickKey = "tick";
        readonly DirectionKey = "direction";

        #endregion

        #region PROPERTIES

        [JsonProperty(TickKey)] public int Tick { get; private set; }
        [JsonProperty(DirectionKey)] public int Direction { get; private set; }

        #endregion

        #region CONSTRUCTORS

        public InputData(int tick, int direction)
        {
            Tick = tick;
            Direction = direction;
        }

        #endregion
    }
}
