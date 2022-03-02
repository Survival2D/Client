
     class BattleManager
    {

         tickRate:number = 4.5;
         startDuration:number = 3.5;

         maps:Map[] = null;
          map:Map = null;
          players:PlayerData[] = null;
         currentMap:MapData = null;

           onTick = null;
        onTickEnd = null;
         onRewind = null;


         tickDuration():number { return  1 / this.tickRate; }
         currentTick:number;
         static instance:BattleManager = null;
         roundEnded;// = new RollbackVar<bool>();

        private  Awake()
        {
            BattleManager.instance = this;
        }

        private  Start()
        {
            MultiplayerManager.Instance.Subscribe(MultiplayerManager.Code.PlayerInput, ReceivedPlayerInput);
            players = PlayersManager.Instance.Players;
            Initialize(players.Count);
            StartGame();
        }

        private void OnDestroy()
        {
            MultiplayerManager.Instance.Unsubscribe(MultiplayerManager.Code.PlayerInput, ReceivedPlayerInput);
        }

        private void ReceivedPlayerInput(MultiplayerMessage message)
        {
            InputData inputData = message.GetData<InputData>();
            SetPlayerInput(GetPlayerNumber(message.SessionId), inputData.Tick, (Direction)inputData.Direction);
        }

        private int GetPlayerNumber(string sessionId)
        {
            for (int i = 0; i < players.Count; i++)
                if (players[i].Presence.SessionId == sessionId)
                    return i;

            return -1;
        }

        private void Initialize(int playersAmount)
        {
            List<MapData> possibleMaps = maps.FindAll(map => playersAmount >= map.MinimumPlayers && playersAmount <= map.MaximumPlayers);
            currentMap = possibleMaps[UnityEngine.Random.Range(0, possibleMaps.Count)];
            map.Initialize(currentMap, players);
        }

        private void StartGame()
        {
            InvokeRepeating(nameof(ProcessTick), StartDuration, TickDuration);
            onTickEnd += CheckWinner;
        }

        private void CheckWinner(int tick)
        {
            if (RoundEnded.GetLastValue(tick))
                return;

            IEnumerable<Ninja> playersAlive = map.Ninjas.Where(ninja => ninja.IsAlive.GetLastValue(tick));
            RoundEnded[tick] = false;
            if (playersAlive.Count() > 1)
                return;

            if (playersAlive.Count() == 0)
                MultiplayerManager.Instance.Send(MultiplayerManager.Code.Draw, new DrawData(tick));
            else
                MultiplayerManager.Instance.Send(MultiplayerManager.Code.PlayerWon, new PlayerWonData(tick, GetPlayerNumber(playersAlive.First().SessionId)));

            RoundEnded[tick] = true;
        }

        private void ProcessTick()
        {
            onTick?.Invoke(CurrentTick);
            onTickEnd?.Invoke(CurrentTick);
            CurrentTick++;
        }

        public void SetPlayerInput(int playerNumber, int tick, Direction direction)
        {
            if (tick <= default(int))
                return;

            if (RoundEnded.GetLastValue(tick))
                return;

            map.GetNinja(playerNumber).SetInput(direction, tick);
            if (tick < CurrentTick)
            {
                onRewind?.Invoke(tick);
                while (tick < CurrentTick)
                {
                    onTick?.Invoke(tick);
                    onTickEnd?.Invoke(tick);
                    tick++;
                }
            }

            if (tick > CurrentTick)
            {
                CancelInvoke(nameof(ProcessTick));
                InvokeRepeating(nameof(ProcessTick), TickDuration, TickDuration);
                while (tick > CurrentTick)
                {
                    onTick?.Invoke(CurrentTick);
                    onTickEnd?.Invoke(CurrentTick);
                    CurrentTick++;
                }
            }
        }
    }
}
