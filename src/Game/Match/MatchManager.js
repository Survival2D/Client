/**
 * Created by quantm7 on 9/18/2022.
 */

const MatchManager = cc.Class.extend({
    ctor: function () {
        this.matchId = "";

        this.gameState = MatchManager.STATE.WAIT;

        this.players = [];
        this.myPlayer = new PlayerData();

        this.mapWidth = 10000;
        this.mapHeight = 10000;

        this.obstacles = [];
        this.items = [];

        if (Config.IS_OFFLINE) {
            this.mapWidth = 2000;
            this.mapHeight = 1500;

            // for (let i = 0; i < 10; i++) {
            //     let obstacleData = new TreeData();
            //     let x = Math.round(Math.random() * this.mapWidth);
            //     let y = Math.round(Math.random() * this.mapHeight);
            //     obstacleData.position = gm.p(x, y);
            //     obstacleData.setObjectId(i);
            //     this.obstacles.push(obstacleData);
            // }
            // for (let i = 0; i < 10; i++) {
            //     let obstacleData = new CrateData();
            //     let x = Math.round(Math.random() * this.mapWidth);
            //     let y = Math.round(Math.random() * this.mapHeight);
            //     obstacleData.position = gm.p(x, y);
            //     obstacleData.setObjectId(10 + i);
            //     this.obstacles.push(obstacleData);
            // }

            for (let i = 0; i < 1; i++) {
                let itemData = new ItemGunData();
                let x = Math.round(Math.random() * this.mapWidth);
                let y = Math.round(Math.random() * this.mapHeight);
                itemData.position = gm.p(x, y);
                itemData.setObjectId(i);
                this.items.push(itemData);
            }
            for (let i = 0; i < 2; i++) {
                let itemData = new ItemBulletData();
                let x = Math.round(Math.random() * this.mapWidth);
                let y = Math.round(Math.random() * this.mapHeight);
                itemData.position = gm.p(x, y);
                itemData.setObjectId(i);
                this.items.push(itemData);
            }
        }

        this.scene = null;

        this._saveMyPlayerMoveAction = {
            position: gm.p(0, 0),
            rotation: 0
        };
    },

    newMatch: function (matchId) {
        this.matchId = "";
        this.gameState = MatchManager.STATE.PLAY;
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
     * @param {ObstacleData[]} obstacles
     */
    updateMatchInfo: function (players, obstacles) {
        this.players = players;
        this.myPlayer = this.players[GameManager.getInstance().userData.username];

        this._saveMyPlayerMoveAction = {
            position: this.myPlayer.position,
            rotation: this.myPlayer.rotation
        };

        this.obstacles = obstacles;

        if (this.isInMatch()) this.scene.updateMatchView();
    },

    getPlayerListByTeam: function (team) {
        let list = [];

        for (let username in this.players) {
            let player = this.players[username];
            if (player.team === team) {
                list.push(player);
            }
        }

        return list;
    },

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleData}
     */
    getObstacleById: function (obstacleId) {
        for (let obs of this.obstacles) {
            if (obs.getObjectId() === obstacleId) return obs;
        }

        return null
    },

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleData}
     */
    getObstacleAndRemoveById: function (obstacleId) {
        for (let i = 0; i < this.obstacles.length; i++) {
            let obs = this.obstacles[i];
            if (obs.getObjectId() === obstacleId) {
                this.obstacles.splice(i, 1);
                return obs;
            }
        }

        return null
    },

    /**
     * @param {number} itemId
     * @return {null|ItemData}
     */
    getItemById: function (itemId) {
        for (let item of this.items) {
            if (item.getObjectId() === itemId) return item;
        }

        return null
    },

    /**
     * @param {number} itemId
     * @return {null|ItemData}
     */
    getItemAndRemoveById: function (itemId) {
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            if (item.getObjectId() === itemId) {
                this.items.splice(i, 1);
                return item;
            }
        }

        return null
    },

    updateMyPlayerMove: function (unitVector, rotation) {
        let oldMovingUnitVector = this.myPlayer.movingUnitVector;
        let oldRotation = this.myPlayer.rotation;
        this.myPlayer.position.x += unitVector.x * Config.PLAYER_BASE_SPEED;
        this.myPlayer.position.y += unitVector.y * Config.PLAYER_BASE_SPEED;
        this.myPlayer.rotation = rotation;
        this.myPlayer.movingUnitVector = unitVector;

        if (oldMovingUnitVector.x !== unitVector.x || oldMovingUnitVector.y !== unitVector.y || oldRotation !== rotation) {
            let pk = new SendPlayerMoveAction(unitVector, rotation);
            GameClient.getInstance().sendPacket(pk);
        }
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

        if (username === GameManager.getInstance().userData.username) {
            this._saveMyPlayerMoveAction = {
                position: pos,
                rotation: rotation
            }
            return;
        }

        player.position = pos;
        player.rotation = rotation;

        if (this.isInMatch()) this.scene.playerMove(username, pos, rotation);
    },

    syncMyPlayerMove: function () {
        if (Config.IS_OFFLINE) return;
        if (this.gameState !== MatchManager.STATE.PLAY) return;
        cc.log("--Sync my player move");
        this.myPlayer.position = this._saveMyPlayerMoveAction.position;
        this.myPlayer.rotation = this._saveMyPlayerMoveAction.rotation;

        if (this.isInMatch())
            this.scene.playerMove(GameManager.getInstance().userData.username, this.myPlayer.position, this.myPlayer.rotation);
    },

    receivedPlayerAttack: function (username, weaponId, position) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        if (username === GameManager.getInstance().userData.username) return;

        let direction = gm.vector(position.x - player.position.x, position.y - player.position.y);

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
        if (bullet.ownerId === GameManager.getInstance().userData.username) return;
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
        let obs = this.getObstacleAndRemoveById(obstacleId);
        if (!obs) {
            cc.log("Warning: we dont have obstacle " + obstacleId + " in match");
            return;
        }

        obs.hp = 0;

        if (this.isInMatch()) this.scene.obstacleDestroyed(obstacleId);
    },

    /**
     * @param {ItemData} item
     */
    receivedItemCreated: function (item) {
        this.items.push(item);

        if (this.isInMatch()) this.scene.createItem(item);
    },

    receivedPlayerTakeItem: function (username, itemId) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        let item = this.getItemAndRemoveById(itemId);
        if (!item) {
            cc.log("Warning: we dont have item " + itemId + " in match");
            return;
        }

        if (this.isInMatch()) this.scene.playerTakeItem(itemId);
    },

    receivedMatchResult: function (winTeam) {
        this.gameState = MatchManager.STATE.END;

        let gui = SceneManager.getInstance().getGUIByClassName(ResultGUI.className);
        if (gui) {
            gui.setResultInfo(winTeam);
            gui.effectIn();
        }
        else {
            let gui = new ResultGUI();
            SceneManager.getInstance().openGUI(gui, ResultGUI.ZORDER);
            gui.setResultInfo(winTeam);
        }

        if (this.isInMatch()) this.scene.endMatch();
    }
});

MatchManager.STATE = {
    WAIT: 0,
    PLAY: 1,
    END: 2
}