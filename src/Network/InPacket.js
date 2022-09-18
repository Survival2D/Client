/**
 * Created by quantm7 on 9/8/2022.
 */

var InPacket = cc.Class.extend({
    ctor: function () {

    },

    parseData: function (data) {
        for (var key in this) {
            if (data[key]) this[key] = data[key];
        }
    }
});

var ReceivedUserInfo = InPacket.extend({
    ctor: function (data) {
        this.username = null;

        this.parseData(data);
    }
});

var ReceivedFindMatch = InPacket.extend({
    ctor: function (data) {
        this.result = null;
        this.gameId = null;

        this.parseData(data);
    }
});

var ReceivedCreateTeam = InPacket.extend({
    ctor: function (data) {
        this.teamId = null;

        this.parseData(data);
    }
});

var ReceivedJoinTeam = InPacket.extend({
    ctor: function (data) {
        this.result = null;
        this.teamId = null;

        this.parseData(data);
    }
});