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

var ReceivedNewPlayerJoin = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.uid = 0;
        this.teamId = 0;

        this.parseData(data);
    }
});

var ReceivedNewTeamJoin = InPacket.extend({
    ctor: function (data) {
        this.teamId = 0;
        this.players = [];

        this.parseData(data);
    }
});

var ReceivedPlayerMoveAction = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;
        this.x = 0;
        this.y = 0;
        this.angle = 0;

        this.parseData(data);
    }
});

var ReceivedPlayerState = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;

        this.x = 0;
        this.y = 0;
        this.angle = 0;

        this.weaponId = 0;
        this.helmetId = 0;
        this.armorId = 0;
        this.speed = 0;

        this.parseData(data);
    }
});

var ReceivedBulletFired = InPacket.extend({
    ctor: function (data) {
        this.x = 0;
        this.y = 0;

        this.type = 0;

        this.parseData(data);
    }
});

var ReceivedPlayerHit = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;
        this.hp = 0;

        this.parseData(data);
    }
});

var ReceivedPlayerDead = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;

        this.parseData(data);
    }
});

var ReceivedObstacleSpawn = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.type = 0;

        this.x = 0;
        this.y = 0;

        this.hp = 0;

        this.parseData(data);
    }
});

var ReceivedObstacleHit = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.hp = 0;

        this.parseData(data);
    }
});

var ReceivedObstacleDestroyed = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.parseData(data);
    }
});

var ReceivedItemSpawn = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.type = 0;

        this.x = 0;
        this.y = 0;

        this.parseData(data);
    }
});

var ReceivedUpdateGameState = InPacket.extend({
    ctor: function (data) {
        this.gameId = 0;

        this.teams = [];

        this.obstacles = [];

        this.items = [];

        this.parseData(data);
    }
});