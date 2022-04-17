import NakamaManager from "../../Nakama/NakamaManager";
import MultiplayerManager from "../../Nakama/MultiplayerManager";
import {MatchManager} from "./MatchManager";
import {Code} from "../../Nakama/OperationCode";
import {Config} from "../../Game/GameConstants";

export class MatchNetwork {

    private mgr: MatchManager = null;

    constructor(mgr) {
        this.mgr = mgr;
    }

    subscribeListener () {
        if (!Config.IS_ONLINE) return;
        NakamaManager.instance.socket.onmatchdata = (matchData) => {
            // cc.log("MatchData:", matchData);
            this.onReceivePacket(matchData.op_code, matchData.data);
        };
    }

    onReceivePacket (code: Code, data: any) {
        if (!this.mgr.inMatch()) return;
        switch (code) {
            case Code.PlayerJoined: {
                this.mgr.onReceiveNewPlayerJoin(data);
                break;
            }
            case Code.PlayerPosition: {
                this.mgr.onReceivePlayerUpdatePos(data);
                break;
            }
            case Code.PlayerEquip: {
                this.mgr.onReceivePlayerEquip(data);
                break;
            }
            case Code.BulletFire: {
                this.mgr.onReceiveFire(data);
                break;
            }
            default: break;
        }
    }

    async send (code: Code, data: object | []) {
        if (!Config.IS_ONLINE) return;
        await MultiplayerManager.instance.send(code, data);
    }
}
