/**
 * Created by quantm7 on 9/8/2022.
 */

const InPacket = cc.Class.extend({
    ctor: function (data) {
        this.parseData(this, data);
    },

    /**
     * recursive function that parse all data field of a node
     * @param node
     * @param data
     */
    parseData: function (node, data) {
        for (let key in node) {
            let childNode = node[key];
            let childData = data[key];
            if (typeof childData != "undefined") {
                if (typeof childNode == "object") this.parseData(childNode, childData);
                else childNode = childData;
            }
        }
    }
});

const ReceivedUserInfo = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        
        this._super(data);
    }
});

const ReceivedFindMatch = InPacket.extend({
    ctor: function (data) {
        this.result = 0;
        this.gameId = 0;

        this._super(data);
    }
});

const ReceivedCreateTeam = InPacket.extend({
    ctor: function (data) {
        this.teamId = 0;

        this._super(data);
    }
});

const ReceivedJoinTeam = InPacket.extend({
    ctor: function (data) {
        this.result = 0;
        this.teamId = 0;

        this._super(data);
    }
});

const ReceivedNewPlayerJoin = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.teamId = 0;

        this._super(data);
    }
});

const ReceivedNewTeamJoin = InPacket.extend({
    ctor: function (data) {
        this.teamId = 0;
        this.players = [];

        this._super(data);
    }
});

const ReceivedPlayerMoveAction = InPacket.extend({
    ctor: function (data) {
        this.username = "";
        this.position = new gm.Position(0, 0);
        this.angle = 0;

        this._super(data);
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

        this._super(data);
    }
});

const ReceivedBulletFired = InPacket.extend({
    ctor: function (data) {
        this.x = 0;
        this.y = 0;
        this.angle = 0;

        this.type = 0;

        this._super(data);
    }
});

const ReceivedPlayerHit = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;
        this.hp = 0;

        this._super(data);
    }
});

const ReceivedPlayerDead = InPacket.extend({
    ctor: function (data) {
        this.uid = 0;

        this._super(data);
    }
});

const ReceivedObstacleSpawn = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.type = 0;

        this.x = 0;
        this.y = 0;

        this.hp = 0;

        this._super(data);
    }
});

const ReceivedObstacleHit = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.hp = 0;

        this._super(data);
    }
});

const ReceivedObstacleDestroyed = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this._super(data);
    }
});

const ReceivedItemSpawn = InPacket.extend({
    ctor: function (data) {
        this.id = 0;

        this.type = 0;

        this.x = 0;
        this.y = 0;

        this._super(data);
    }
});

const ReceivedUpdateGameState = InPacket.extend({
    ctor: function (data) {
        this.gameId = 0;

        this.teams = [];

        this.obstacles = [];

        this.items = [];

        this._super(data);
    }
});

const ReceivedGameConfig = InPacket.extend({
    ctor: function (data) {

        this._super(data);
    }
});