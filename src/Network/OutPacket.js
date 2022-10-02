/**
 * Created by quantm7 on 9/11/2022.
 */

const OutPacket = cc.Class.extend({
    ctor: function (id) {
        this.cmdId = id;
        this.data = null;
    },
});

const SendJoinTeam = OutPacket.extend({
    ctor: function (teamId) {
        this._super(Cmd.JOIN_TEAM);
        this.data = {
            teamId: teamId
        };
    }
});

const SendPlayerMoveAction = OutPacket.extend({
    ctor: function (pos, rotation) {
        this._super(Cmd.PLAYER_MOVE);
        this.data = {
            position: pos,
            rotation: rotation
        }
    }
})