import {Match, Presence} from "@heroiclabs/nakama-js";
import Action = cc.Action;

class MultiplayerManager
    {
   tickRate: number= 5;
       sendRate: number= 1 / this.tickRate;
        joinOrCreateMatchRpc:string = "JoinOrCreateMatchRpc";
       logFormat:string = "{0} with code {1}:\n{2}";
        sendingDataLog:string = "Sending data";
        receivedDataLog:string = "Received data";

        enableLog:boolean = false;

        onReceiveData:Map<Code, Action<MultiplayerMessage>> = new Map<Code, Action<MultiplayerMessage>>();
         match:Match = null;

        onMatchJoin:Action = null;
        onMatchLeave:Action = null;
        onLocalTick:Action = null;

        static instance:MultiplayerManager = null;
        self():Presence { return this.match == null ? null : this.match.self; }
        isOnMatch():boolean { return this.match != null }

        awake()
        {
            MultiplayerManager.instance = this;
        }

        start()
        {
            InvokeRepeating(nameof(LocalTickPassed), SendRate, SendRate);
        }

        localTickPassed()
        {
            this.onLocalTick?.Invoke();
        }

        joinMatchAsync()
        {
            NakamaManager.instance.Socket.ReceivedMatchState -= Receive;
            NakamaManager.instance.Socket.ReceivedMatchState += Receive;
            NakamaManager.instance.onDisconnected += Disconnected;
            IApiRpc rpcResult = await NakamaManager.instance.sendRPC(JoinOrCreateMatchRpc);
            string matchId = rpcResult.Payload;
            match = await NakamaManager.Instance.Socket.JoinMatchAsync(matchId);
            onMatchJoin?.Invoke();
        }

        private void Disconnected()
        {
            NakamaManager.Instance.onDisconnected -= Disconnected;
            NakamaManager.Instance.Socket.ReceivedMatchState -= Receive;
            match = null;
            onMatchLeave?.Invoke();
        }

        public async void LeaveMatchAsync()
        {
            NakamaManager.Instance.onDisconnected -= Disconnected;
            NakamaManager.Instance.Socket.ReceivedMatchState -= Receive;
            await NakamaManager.Instance.Socket.LeaveMatchAsync(match);
            match = null;
            onMatchLeave?.Invoke();
        }

        public void Send(Code code, object data = null)
        {
            if (match == null)
                return;

            string json = data != null ? data.Serialize() : string.Empty;
            if (enableLog)
                LogData(SendingDataLog, (long)code, json);

            NakamaManager.Instance.Socket.SendMatchStateAsync(match.Id, (long)code, json);
        }

        public void Send(Code code, byte[] bytes)
        {
            if (match == null)
                return;

            if (enableLog)
                LogData(SendingDataLog, (long)code, String.Empty);

            NakamaManager.Instance.Socket.SendMatchStateAsync(match.Id, (long)code, bytes);
        }

        private void Receive(IMatchState newState)
        {
            if (enableLog)
            {
                var encoding = System.Text.Encoding.UTF8;
                var json = encoding.GetString(newState.State);
                LogData(ReceivedDataLog, newState.OpCode, json);
            }

            MultiplayerMessage multiplayerMessage = new MultiplayerMessage(newState);
            if (onReceiveData.ContainsKey(multiplayerMessage.DataCode))
                onReceiveData[multiplayerMessage.DataCode]?.Invoke(multiplayerMessage);
        }

        public void Subscribe(Code code, Action<MultiplayerMessage> action)
        {
            if (!onReceiveData.ContainsKey(code))
                onReceiveData.Add(code, null);

            onReceiveData[code] += action;
        }

        unsubscribe(code:Code, Action<MultiplayerMessage> action)
        {
            if (this.onReceiveData.has(code))
                onReceiveData[code] -= action;
        }

        logData(description:string, dataCode:number, json:string)
        {

            Debug.Log(string.Format(LogFormat, description, (Code)dataCode, json));
        }

        #endregion
    }
}
