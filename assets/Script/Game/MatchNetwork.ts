import NakamaManager from "../Nakama/NakamaManager";
import MultiplayerManager from "../Nakama/MultiplayerManager";
import {MatchManager} from "./MatchManager";

export class MatchNetwork {
     private static instance: MatchNetwork;

     public static getInstance () {
         if (!this.instance) this.instance = new MatchNetwork();
         return this.instance;
     }

     subscribeListener () {
         NakamaManager.instance.socket.onmatchdata = (matchData) => {
             cc.log("MatchData:", matchData);
             this.onReceivePacket(matchData.op_code, matchData.data);
         };
     }

     onReceivePacket (code: Code, data: any) {
         switch (code) {
             case Code.PlayerPosition: {
                 MatchManager.getInstance().onReceivePlayerUpdatePos(data);
                 break;
             }
             default: break;
         }
     }

     async send (code: Code, data: object | []) {
         await MultiplayerManager.instance.send(code, data);
     }
}