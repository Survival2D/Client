import GameScene from "./GameScene";
import {PlayerPosition} from "../Nakama/RPCData";
import NakamaManager from "../Nakama/NakamaManager";
import {MatchNetwork} from "./MatchNetwork";

export class MatchManager {
    private static instance: MatchManager;

    public static getInstance () {
        if (!this.instance) this.instance = new MatchManager();
        return this.instance;
    }

    private matchScene: GameScene = null;

    newMatch () {
        cc.director.loadScene("GameScene");
    }

    setScene (scene: GameScene) {
        this.matchScene = scene;
    }

    inMatch () {
        return this.matchScene instanceof GameScene;
    }

    sendUpdatePlayerPos (x: number, y: number) {
        let data: PlayerPosition = {
            x: x,
            y: y,
            userID: NakamaManager.instance.session.user_id,
        }
        MatchNetwork.getInstance().send(Code.PlayerPosition, data);
    }

    onReceivePlayerUpdatePos (pk: PlayerPosition) {
        if (!this.inMatch()) return;
        this.matchScene.updatePlayerPos(pk.userID, pk.x, pk.y);
    }
}