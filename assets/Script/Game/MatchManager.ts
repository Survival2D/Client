import GameScene from "./GameScene";
import {BulletFire, NewPlayerJoin, PlayerPosition} from "../Nakama/RPCData";
import NakamaManager from "../Nakama/NakamaManager";
import {MatchNetwork} from "./MatchNetwork";
import {Code} from "../Nakama/OperationCode";
import SceneChanger from "../General/SceneChanger";

export class MatchManager {
    private static instance: MatchManager;

    public static getInstance () {
        if (!this.instance) this.instance = new MatchManager();
        return this.instance;
    }

    private matchScene: GameScene = null;
    private network: MatchNetwork = null;

    newMatch () {
        SceneChanger.instance.loadLobbyScene();
        this.network = new MatchNetwork(this);
        this.network.subscribeListener();
    }

    setScene (scene: GameScene) {
        this.matchScene = scene;
    }

    inMatch () {
        return this.matchScene instanceof GameScene;
    }

    onReceiveNewPlayerJoin (pk: NewPlayerJoin) {
        this.matchScene.newPlayerJoin(pk.userID);
    }

    sendUpdatePlayerPos (x: number, y: number) {
        let data: PlayerPosition = {
            x: x,
            y: y,
            userID: NakamaManager.instance.session.user_id
        }
        this.network.send(Code.PlayerPosition, data);
    }

    onReceivePlayerUpdatePos (pk: PlayerPosition) {
        // cc.log("onReceivePlayerUpdatePos:", pk);
        if (pk.userID === NakamaManager.instance.session.user_id) this.matchScene.updateMyPlayerPos(pk.x, pk.y);
        this.matchScene.updatePlayerPos(pk.userID, pk.x, pk.y);
    }

    sendFire (x: number, y: number, angle: number) {
        let data: BulletFire = {
            x: x,
            y: y,
            angle: angle,
            userID: NakamaManager.instance.session.user_id
        }
        this.network.send(Code.BulletFire, data);
    }

    onReceiveFire (pk: BulletFire) {
        this.matchScene.onFire(pk.x, pk.y, pk.angle);
    }
}