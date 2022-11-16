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

const ReceivedPlayerAttackAction = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.weaponId = 0;
        this.direction = gm.vector(0, 0);

        this.autoParseData(data);
    }
});

const ReceivedPlayerChangeWeapon = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.slot = 0;

        this.autoParseData(data);
    }
});

const ReceivedCreateBullet = InPacket.extend({
    ctor: function (data) {
        this.bullet = new BulletData();

        this.autoParseData(data);
    }
});

const ReceivedPlayerTakeDamage = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.hp = 0;

        this.autoParseData(data);
    }
});

const ReceivedPlayerDead = InPacket.extend({
    ctor: function (data) {
        this.username = "";

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

const ReceivedObstacleTakeDamage = InPacket.extend({
    ctor: function (data) {
        this.obstacleId = 0;
        this.hp = 0;

        this.autoParseData(data);
    }
});

const ReceivedObstacleDestroyed = InPacket.extend({
    ctor: function (data) {
        this.obstacleId = 0;

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
                playerData.hp = Config.PLAYER_MAX_HP;
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