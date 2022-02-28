import {Match, Presence, RpcResponse} from "@heroiclabs/nakama-js";
import Action = cc.Action;

class MultiplayerManager
    {
   tickRate: number= 5;
       sendRate: number= 1 / this.tickRate;
        joinOrCreateMatchRpc:string = "JoinOrCreateMatchRpc";
       logFormat:string = "{0} with code {1}:\n{2}";
        static readonly SendingDataLog:string = "Sending data";
        static readonly SeceivedDataLog:string = "Received data";

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
            let rpcResult:RpcResponse = await NakamaManager.instance.sendRPC(JoinOrCreateMatchRpc);
            let matchId:string = rpcResult.payload;
            this.match = await NakamaManager.Instance.Socket.JoinMatchAsync(matchId);
            this.onMatchJoin?.Invoke();
        }

        private disconnected()
        {
            NakamaManager.Instance.onDisconnected -= Disconnected;
            NakamaManager.Instance.Socket.ReceivedMatchState -= Receive;
            this.match = null;
            this.onMatchLeave?.Invoke();
        }

        public async leaveMatchAsync()
        {
            NakamaManager.Instance.onDisconnected -= Disconnected;
            NakamaManager.Instance.Socket.ReceivedMatchState -= Receive;
            await NakamaManager.Instance.Socket.LeaveMatchAsync(match);
            this.match = null;
            this.onMatchLeave?.Invoke();
        }

        public send( code:Code,  data:object)
        {
            if (this.match == null)
                return;

            let json:string = JSON.stringify(data);
            if (this.enableLog)
                cc.log(MultiplayerManager.SendingDataLog, code, json);

            NakamaManager.instance.socket.SendMatchStateAsync(match.Id, (long)code, json);
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

            console.log(string.Format(LogFormat, description, (Code)dataCode, json));
        }

}
