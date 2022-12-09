/**
 * Created by quantm7 on 9/18/2022.
 */

const MatchManager = cc.Class.extend({
    ctor: function () {
        this.matchId = "";

        this.gameState = MatchManager.STATE.WAIT;

        this.players = [];
        this.myPlayer = new PlayerData();

        this.mapWidth = Config.MAP_WIDTH;
        this.mapHeight = Config.MAP_HEIGHT;

        this.obstacles = [];
        this.items = [];

        this.safeZone = new SafeZoneData();
        this.nextSafeZone = new SafeZoneData();

        if (Config.IS_OFFLINE) {

            let objId = 0;
            for (let i = 0; i < Math.min(1000, Config.MAP_OBJECT_POSITION.length); i++) {
                let objPos = Config.MAP_OBJECT_POSITION[i];
                let type = objPos[0];
                if (type === 0) continue;
                let obj;
                switch (type) {
                    case Config.MAP_OBJECT_TYPE.TREE:
                        obj = new TreeData();
                        obj.position = gm.p(objPos[1][0] * 100 + obj.radius, objPos[1][1] * 100 + obj.radius);
                        break;
                    case Config.MAP_OBJECT_TYPE.CRATE:
                        obj = new CrateData();
                        obj.position = gm.p(objPos[1][0] * 100, objPos[1][1] * 100);
                        break;
                    case Config.MAP_OBJECT_TYPE.STONE:
                        obj = new StoneData();
                        obj.position = gm.p(objPos[1][0] * 100 + obj.radius, objPos[1][1] * 100 + obj.radius);
                        break;
                    case Config.MAP_OBJECT_TYPE.WALL:
                        obj = new WallData();
                        obj.position = gm.p(objPos[1][0] * 100, objPos[1][1] * 100);
                        break;
                }

                obj.setObjectId(objId);
                objId++;
                this.obstacles.push(obj);
            }

            this.myPlayer.position = gm.p(this.mapWidth/2, this.mapHeight/2);
            this.myPlayer.hp = Config.PLAYER_MAX_HP;
            this.myPlayer.playerId = this.myPlayer.username = GameManager.getInstance().userData.username;
            this.players[GameManager.getInstance().userData.username] = this.myPlayer;

            this.myPlayer.vest.level = 1;
            this.myPlayer.helmet.level = 1;

            this.safeZone.position.x = this.mapWidth/2;
            this.safeZone.position.y = this.mapHeight/2;
            this.safeZone.level = 0;

            this.nextSafeZone.position.x = this.mapWidth/2 + 100;
            this.nextSafeZone.position.y = this.mapHeight/2 + 100;
            this.nextSafeZone.level = 1;
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
        this.scene = SceneManager.getInstance().openMatchScene();
        this.scene.updateMatchView();
    },

    isInMatch: function () {
        return SceneManager.getInstance().getMainLayer() instanceof MatchScene && this.scene !== null;
    },

    /**
     * @param {PlayerData[]} players
     * @param {ObstacleData[]} obstacles
     * @param {ItemData[]} items
     */
    updateMatchInfo: function (players, obstacles, items) {
        this.players = players;
        this.myPlayer = this.players[GameManager.getInstance().userData.username];

        this._saveMyPlayerMoveAction = {
            position: this.myPlayer.position,
            rotation: this.myPlayer.rotation
        };

        this.obstacles = obstacles;

        this.items = items;

        if (this.isInMatch()) this.scene.updateMatchView();
    },

    updateMyPlayerInfo: function (hp, haveGun) {
        this.myPlayer.hp = hp
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

    getNumberOfAlivePlayers: function () {
        let alive = 0;
        for (let key in this.players) {
            if (!this.players[key].isDead()) alive++;
        }
        return alive;
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
            // let pk = new SendPlayerMoveAction(unitVector, rotation);
            // GameClient.getInstance().sendPacket(pk);
            GameClient.getInstance().sendPlayerMove(unitVector, rotation);
        }
    },

    updateMyPlayerWeapon: function (slot) {
        this.myPlayer.changeWeaponSlot(slot);
        // let pk = new SendPlayerChangeWeapon(slot);
        // GameClient.getInstance().sendPacket(pk);
        GameClient.getInstance().sendPlayerChangeWeapon(slot);
    },

    reloadMyPlayerWeapon: function () {
        if (this.myPlayer.canReloadBullets()) {
            GameClient.getInstance().sendPlayerReloadWeapon();
        }
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

    receivedPlayerAttack: function (username, slot, position) {
        let player = this.players[username];
        if (!player) {
            cc.log("Warning: we dont have player " + username + " in match");
            return;
        }

        if (username === GameManager.getInstance().userData.username) return;

        let direction = gm.vector(position.x - player.position.x, position.y - player.position.y);

        if (this.isInMatch()) this.scene.playerAttack(username, slot, direction);
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

    receivedPlayerReloadWeapon: function (numWeaponBullets, numBulletsRemain) {
        this.myPlayer.reloadBullets(numWeaponBullets, numBulletsRemain);
        if (this.isInMatch()) this.scene.updateMyPlayerItem();
    },

    /**G
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
     * @param {gm.Position} fromPosition
     */
    receivedItemCreated: function (item, fromPosition) {
        this.items.push(item);

        if (this.isInMatch()) this.scene.createItem(item, fromPosition);
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

        if (username === GameManager.getInstance().userData.username) {
            this.myPlayer.getItem(item);
            if (this.isInMatch()) this.scene.updateMyPlayerItem();
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