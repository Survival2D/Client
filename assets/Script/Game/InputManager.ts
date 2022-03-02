import KEY = cc.macro.KEY;

class InputManager
    {

        private  delay:number = 0;
        private  keyUp:KEY = KEY.dpadUp;
        private  keyLeft = KEY.dpadLeft;
        private  keyRight = KEY.dpadRight;
        private  keyDown = KEY.dpadDown;

        private update()
        {
            let battleManager:BattleManager = BattleManager.instance;
            if (Input.GetKeyDown(keyUp))
                SendData(battleManager.CurrentTick - delay, Direction.North);
            else if (Input.GetKeyDown(keyLeft))
                SendData(battleManager.CurrentTick - delay, Direction.West);
            else if (Input.GetKeyDown(keyRight))
                SendData(battleManager.CurrentTick - delay, Direction.East);
            else if (Input.GetKeyDown(keyDown))
                SendData(battleManager.CurrentTick - delay, Direction.South);
            else
                return;
        }

        private sendData( tick:number,  direction:Direction)
        {
            MultiplayerManager.instance.send(Code.PlayerInput, new InputData(tick, direction));
        }
}
