using Newtonsoft.Json;

namespace NinjaBattle.Game
{
    public class PresenceData
    {
        #region FIELDS

        readonly SessionIdKey = "sessionId";

        #endregion

        #region PROPERTIES

        [JsonProperty(SessionIdKey)] public string SessionId { get; private set; }

        #endregion

        #region CONSTRUCTORS

        public PresenceData(string sessionId)
        {
            SessionId = sessionId;
        }

        #endregion
    }
}
