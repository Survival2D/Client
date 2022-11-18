/**
 * Created by quantm7 on 9/18/2022.
 */

const MatchManager = cc.Class.extend({
    ctor: function () {
        this.matchId = "";

        this.players = [];
        this.myPlayer = new PlayerData();

        this.mapWidth = 1000;
        this.mapHeight = 1000;

        this.obstacles = [];
        for (let i = 0; i < 10; i++) {
            let obstacleData = new TreeData();
            let x = Math.round(Math.random() * this.mapWidth);
            let y = Math.round(Math.random() * this.mapHeight);
            obstacleData.position = gm.p(x, y);
            obstacleData.setObstacleId(i);
            this.obstacles.push(obstacleData);
        }
        for (let i = 0; i < 10; i++) {
            let obstacleData = new CrateData();
            let x = Math.round(Math.random() * this.mapWidth);
            let y = Math.round(Math.random() * this.mapHeight);
            obstacleData.position = gm.p(x, y);
            obstacleData.setObstacleId(10 + i);
            this.obstacles.push(obstacleData);
        }

        this.scene = null;
    },

    newMatch: function (matchId) {
        this.matchId = "";
        this.myPlayer.position = gm.p(30, 30);
        this.myPlayer.hp = Config.PLAYER_MAX_HP;
        this.myPlayer.playerId = this.myPlayer.username = GameManager.getInstance().userData.username;
        this.players[GameManager.getInstance().userData.username] = this.myPlayer;
        this.scene = SceneManager.getInstance().openMatchScene();
        this.scene.updateMatchView();
    },

    isInMatch: function () {
        return SceneManager.getInstance().getMainLayer() instanceof MatchScene && this.scene !== null;
    },

    /**
     * @param {PlayerData[]} players
     */
    updateMatchInfo: function (players) {
        this.players = players;
        this.myPlayer = this.players[GameManager.getInstance().userData.username];

        if (this.isInMatch()) this.scene.updateMatchView();
    },

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleData}
     */
    getObstacleById: function (obstacleId) {
        for (let obs of this.obstacles) {
            if (obs.getObstacleId() === obstacleId) return obs;
        }

        return null
    },

    updateMyPlayerMove: function (vector, rotation) {
        this.myPlayer.position.x += vector.x;
        this.myPlayer.position.y += vector.y;
        this.myPlayer.rotation = rotation;

        let pk = new SendPlayerMoveAction(vector, rotation);
        GameClient.getInstance().sendPacket(pk);
    },

    updateMyPlayerWeapon: function (slot) {
        let pk = new SendPlayerChangeWeapon(slot);
        GameClient.getInstance().sendPacket(pk);
    },

    receivedPlayerMove: function (username, pos, rotation) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        if (username === GameManager.getInstance().userData.username) return;

        player.position = pos;
        player.rotation = rotation;

        if (this.isInMatch()) this.scene.playerMove(username, pos, rotation);
    },

    receivedPlayerAttack: function (username, weaponId, direction) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        if (username === GameManager.getInstance().userData.username) return;

        if (this.isInMatch()) this.scene.playerAttack(username, weaponId, direction);
    },

    receivedPlayerChangeWeapon: function (username, weaponId) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        if (username === GameManager.getInstance().userData.username) return;

        if (this.isInMatch()) this.scene.playerChangeWeapon(username, weaponId);
    },

    /**
     * @param {BulletData} bullet
     */
    receivedCreateBullet: function (bullet) {
        if (this.isInMatch()) this.scene.fire(bullet.rawPosition, bullet.direction);
    },

    receivedPlayerTakeDamage: function (username, hp) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        let oldHp = player.hp;
        player.hp = hp;

        if (this.isInMatch()) this.scene.playerTakeDamage(username, oldHp);
    },

    receivedPlayerDead: function (username) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        player.hp = 0;

        if (this.isInMatch()) this.scene.playerDead(username);
    },

    receivedObstacleTakeDamage: function (obstacleId, hp) {
        let obs = this.getObstacleById(obstacleId);
        if (!obs) {
            cc.log("Warning: we dont have obstacle " + obstacleId + " in match");
            return;
        }

        obs.hp = hp;

        if (this.isInMatch()) this.scene.obstacleTakeDamage(obstacleId);
    },

    receivedObstacleDestroyed: function (obstacleId) {
        let obs = this.getObstacleById(obstacleId);
        if (!obs) {
            cc.log("Warning: we dont have obstacle " + obstacleId + " in match");
            return;
        }

        obs.hp = 0;

        if (this.isInMatch()) this.scene.obstacleDestroyed(obstacleId);
    }
});