import NakamaManager from "../Nakama/NakamaManager";
import MultiplayerManager from "../Nakama/MultiplayerManager";
import {PlayerPosition} from "../Nakama/RPCData";

export class MatchNetwork {
     public static instance: MatchNetwork;

     public static getInstance () {
         if (!MatchNetwork.instance) MatchNetwork.instance = new MatchNetwork();
         return MatchNetwork.instance;
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
                 break;
             }
             default: break;
         }
     }

     async sendPosition (x: number, y: number) {
         let data: PlayerPosition = {
             x: x,
             y: y,
             userID: NakamaManager.instance.session.user_id,
         };
         await MultiplayerManager.instance.send(Code.PlayerPosition, data);
     }
}