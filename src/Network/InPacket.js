/**
 * Created by quantm7 on 9/8/2022.
 */

const InPacket = cc.Class.extend({
    ctor: function () {

    },

    autoParseData: function (data) {
        this.parseData(this, data);
    },

    /**
     * recursive function that parse all data field of a node
     * @param node
     * @param data
     */
    parseData: function (node, data) {
        for (let key in node) {
            if (typeof data[key] != "undefined") {
                if (typeof node[key] == "object") this.parseData(node[key], data[key]);
                else node[key] = data[key];
            }
        }
    }
});

const ReceivedUserInfo = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        
        this.autoParseData(data);
    }
});

const ReceivedFindMatch = InPacket.extend({
    ctor: function (data) {
        this.result = 0;
        this.gameId = 0;

        this.autoParseData(data);
    }
});

const ReceivedCreateTeam = InPacket.extend({
    ctor: function (data) {
        this.teamId = 0;

        this.autoParseData(data);
    }
});

const ReceivedJoinTeam = InPacket.extend({
    ctor: function (data) {
        this.result = 0;
        this.teamId = 0;

        this.autoParseData(data);
    }
});

const ReceivedNewPlayerJoin = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.teamId = 0;

        this.autoParseData(data);
    }
});

const ReceivedNewTeamJoin = InPacket.extend({
    ctor: function (data) {
        this.teamId = 0;
        this.players = [];

        this.autoParseData(data);
    }
});

const ReceivedPlayerMoveAction = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.position = new gm.Position(0, 0);
        this.rotation = 0;

        this.autoParseData(data);
    }
});

const ReceivedPlayerState = InPacket.extend({
    ctor: function (data) {
        this.username = "";

        this.position = new gm.Position(0, 0);
        this.angle = 0;

        this.weaponId = 0;
        this.helmetId = 0;
        this.armorId = 0;

        this.speed = 0;

        this.hp = 0;

        this.autoParseData(data);
    }
});

const ReceivedBulletFired = InPacket.extend({
    ctor: function (data) {
        this.x = 0;
        this.y = 0;
        this.angle = 0;

        this.type = 0;

        this.autoParseData(data);
    }
});

const ReceivedPlayerHit = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;
        this.hp = 0;

        this.autoParseData(data);
    }
});

const ReceivedPlayerDead = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;

        this.autoParseData(data);
    }
});

const ReceivedObstacleSpawn = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.type = 0;

        this.x = 0;
        this.y = 0;

        this.hp = 0;

        this.autoParseData(data);
    }
});

const ReceivedObstacleHit = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.hp = 0;

        this.autoParseData(data);
    }
});

const ReceivedObstacleDestroyed = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.autoParseData(data);
    }
});

const ReceivedItemSpawn = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.type = 0;

        this.x = 0;
        this.y = 0;

        this.autoParseData(data);
    }
});

const ReceivedUpdateMatchInfo = InPacket.extend({
    ctor: function (data) {
        this.teams = [];

        this.players = [];
        if (typeof data["players"] != "undefined") {
            for (let playerId in data.players) {
                let playerData = new PlayerData();
                this.parseData(playerData, data.players[playerId]);
                playerData.username = playerData.playerId = playerId;
                this.players[playerId] = playerData;
            }
        }

        this.obstacles = [];

        this.items = [];
    }
});

const ReceivedGameConfig = InPacket.extend({
    ctor: function (data) {

        this.autoParseData(data);
    }
});