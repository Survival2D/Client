import MatchScene from "../MatchScene";
import {BulletFire, NewPlayerJoin, PlayerEquip, PlayerPosition} from "../../Nakama/RPCData";
import {MatchNetwork} from "./MatchNetwork";
import {Code} from "../../Nakama/OperationCode";
import SceneChanger from "../../General/SceneChanger";
import {PlayerLogic} from "./PlayerLogic";
import GameManager from "../../Game/GameManager";

export class MatchManager {
    private static instance: MatchManager;

    public static getInstance () {
        if (!this.instance) this.instance = new MatchManager();
        return this.instance;
    }

    private matchScene: MatchScene = null;
    private network: MatchNetwork = null;

    private mainPlayerLogic: PlayerLogic;
    private playerLogicsMap: Map<string, PlayerLogic>;

    private obstacleLogics: [];

    newMatch () {
        this.playerLogicsMap = new Map<string, PlayerLogic>();
        this.mainPlayerLogic = new PlayerLogic();

        SceneChanger.instance.loadMatchScene();
        this.network = new MatchNetwork(this);
        this.network.subscribeListener();
    }

    setScene (scene: MatchScene) {
        this.matchScene = scene;
    }

    inMatch () {
        return this.matchScene instanceof MatchScene;
    }

    onReceiveNewPlayerJoin (pk: NewPlayerJoin) {
        cc.log("NEW PLAYER JOIN, ID: ", pk.userID);
        this.createNewPlayer(pk.userID);
    }

    createNewPlayer (id: string) {
        let playerLogic = new PlayerLogic(id);
        this.playerLogicsMap.set(id, playerLogic);
        this.matchScene.newPlayerJoin(id);
    }

    getPlayerLogic (id: string) {
        if (!this.playerLogicsMap.has(id)) return null;
        return this.playerLogicsMap.get(id);
    }

    getMainPlayerLogic () {
        return this.mainPlayerLogic;
    }

    sendUpdatePlayerPos (x: number, y: number, angle: number) {
        let data: PlayerPosition = {
            x: x,
            y: y,
            angle: angle,
            userID: GameManager.instance.userInfo.userId
        }
        this.network.send(Code.PlayerPosition, data);
    }

    onReceivePlayerUpdatePos (pk: PlayerPosition) {
        if (pk.userID === GameManager.instance.userInfo.userId) return;
        else {
            this.updatePlayerPos(pk.userID, pk.x, pk.y, pk.angle);
        }
    }

    updatePlayerPos (id: string, x: number, y: number, angle: number) {
        if (!this.playerLogicsMap.has(id)) {
            this.createNewPlayer(id);
        }
        let playerLogic = this.playerLogicsMap.get(id);
        playerLogic.setPosition(x, y);
        playerLogic.setRotation(angle);
        this.matchScene.updatePlayerPos(id, x, y, angle);
    }

    updateMainPlayerPos (x: number, y: number, angle: number) {
        this.mainPlayerLogic.setPosition(x, y);
        this.mainPlayerLogic.setRotation(angle);
        this.matchScene.updateMyPlayerPos( x, y);
    }

    sendFire (x: number, y: number, angle: number) {
        let data: BulletFire = {
            x: x,
            y: y,
            angle: angle,
            userID: GameManager.instance.userInfo.userId
        }
        this.network.send(Code.BulletFire, data);
    }

    onReceiveFire (pk: BulletFire) {
        if (pk.userID !== GameManager.instance.userInfo.userId) this.matchScene.onFire(pk.x, pk.y, pk.angle);
    }

    sendPlayerEquip (isEquip: boolean) {
        let data: PlayerEquip = {
            isEquip: isEquip,
            userID: GameManager.instance.userInfo.userId
        }
        this.network.send(Code.PlayerEquip, data);
    }

    onReceivePlayerEquip (pk: PlayerEquip) {
        if (pk.userID !== GameManager.instance.userInfo.userId) {
            this.updatePlayerEquip(pk.userID, pk.isEquip);
        }
    }

    updatePlayerEquip (id: string, isEquip: boolean) {
        if (!this.playerLogicsMap.has(id)) {
            this.createNewPlayer(id);
        }
        this.playerLogicsMap.get(id).setEquip(isEquip);
        this.matchScene.onPlayerEquip(id, isEquip);
    }

    onReceiveDied (userId: string) {
        if (userId !== GameManager.instance.userInfo.userId) this.matchScene.onDied(userId);
        else {
            // main player died, end match
            this.matchScene.onMainPlayerDied();
        }
    }


    // for calculating input from scene

    calculateMovePlayer (newX: number, newY: number) {

    }
}