import MultiplayerManager from "../Nakama/MultiplayerManager";
import PlayersManager from "./PlayersManager";
import MultiplayerMessage from "../Nakama/MultiplayerMessage";

export default class BattleManager
    {
        readonly static OnTick:string = "BattleManager.OnTick";
        readonly static OnTickEnd:string = "BattleManager.OnTickEnd";
        readonly static OnRewind: string = "BattleManager.OnRewind";

         tickRate:number = 4.5;
         startDuration:number = 3.5;

         maps:Map[] = null;
          map:Map = null;
          players:PlayerData[] = null;
         currentMap:MapData = null;


         tickDuration():number { return  1 / this.tickRate; }
         currentTick:number;
         static instance:BattleManager = null;
         roundEnded;// = new RollbackVar<bool>();

        private  awake()
        {
            BattleManager.instance = this;
        }

          start()
        {
            MultiplayerManager.instance.Subscribe(Code.PlayerInput, ReceivedPlayerInput);
            this.players = PlayersManager.instance.Players;
            this.initialize(players.Count);
            this.startGame();
        }

          onDestroy()
        {
            MultiplayerManager.Instance.Unsubscribe(MultiplayerManager.Code.PlayerInput, ReceivedPlayerInput);
        }

          receivedPlayerInput( message:MultiplayerMessage)
        {
            InputData inputData = message.GetData<InputData>();
            this.setPlayerInput(GetPlayerNumber(message.SessionId), inputData.Tick, (Direction)inputData.Direction);
        }

         getPlayerNumber( sessionId:string):number
        {
            for (let i = 0; i < this.players.length; i++)
                if (this.players[i].presence.sessionId == sessionId)
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

        processTick()
        {
            onTick?.Invoke(CurrentTick);
            onTickEnd?.Invoke(CurrentTick);
            CurrentTick++;
        }

         setPlayerInput( playerNumber:number, int tick, Direction direction)
        {
            if (tick <= 0)
                return;

            if (this.roundEnded.GetLastValue(tick))
                return;

            this.map.GetNinja(playerNumber).SetInput(direction, tick);
            if (tick < this.currentTick)
            {
                eventHandler.dispatchEvent(BattleManager)
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
