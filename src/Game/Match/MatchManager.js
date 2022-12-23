/**
 * Created by quantm7 on 9/18/2022.
 */

const MatchManager = cc.Class.extend({
    ctor: function () {
        this.matchId = "";

        this.gameState = MatchManager.STATE.WAIT;

        this.players = {};  // map
        this.outSightPlayers = {};  // map
        this.myPlayer = new PlayerData();

        this.mapWidth = Config.MAP_WIDTH;
        this.mapHeight = Config.MAP_HEIGHT;

        this.obstacles = {};    // map by id
        this.outSightObstacles = {};    // map by id
        this.items = {};    // map by id
        this.outSightItems = {};    // map by id

        this.safeZone = new SafeZoneData();
        this.nextSafeZone = new SafeZoneData();

        if (Constant.IS_OFFLINE) {

            let objId = 0;
            for (let i = 0; i < Math.min(5000, Config.MAP_OBJECT_POSITION.length); i++) {
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
                this.obstacles[objId] = obj;
                objId++;
            }

            this.myPlayer.position = gm.p(this.mapWidth/2 + 50, this.mapHeight/2);
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
        cc.log("obstacles", JSON.stringify(obstacles.map(e => {
            let type = "NONE";
            if (e instanceof TreeData) type = "TREE";
            if (e instanceof CrateData) type = "CRATE";
            if (e instanceof StoneData) type = "STONE";
            if (e instanceof WallData) type = "WALL";
            return {type: type, id: e.getObjectId()}
        })));

        cc.log("players", JSON.stringify(players.map(e => {
            return e.username
        })));

        for (let player of players) {
            this.players[player.username] = player;
        }

        this.myPlayer = this.players[GameManager.getInstance().userData.username];

        this._saveMyPlayerMoveAction = {
            position: this.myPlayer.position,
            rotation: this.myPlayer.rotation
        };

        for (let obs of obstacles) {
            this.obstacles[obs.getObjectId()] = obs;
        }

        for (let item of items) {
            this.items[item.getObjectId()] = item;
        }

        if (Constant.BLOCK_SIGHT) this.blockSight();

        if (this.isInMatch()) this.scene.updateMatchView();
    },

    blockSight: function () {
        let rect = {
            x: this.myPlayer.position.x - Constant.LOGIC_VIEW_WIDTH/2,
            y: this.myPlayer.position.y - Constant.LOGIC_VIEW_HEIGHT/2,
            w: Constant.LOGIC_VIEW_WIDTH,
            h: Constant.LOGIC_VIEW_HEIGHT
        }

        for (let key in this.players) {
            let player = this.players[key];
            if (!gm.checkCollisionCircleRectangle(player.position, player.radius, gm.p(rect.x, rect.y), rect.w, rect.h)) {
                this.outSightPlayers[player.username] = player;
                delete this.players[player.username];
            }
            else {
                delete this.outSightPlayers[player.username];
            }
        }

        for (let key in this.obstacles) {
            let obs = this.obstacles[key];
            let id = obs.getObjectId();
            if (obs instanceof TreeData || obs instanceof StoneData) {
                if (!gm.checkCollisionCircleRectangle(obs.position, obs.radius, gm.p(rect.x, rect.y), rect.w, rect.h)) {
                    this.outSightObstacles[id] = obs;
                    delete this.obstacles[id];
                }
                else {
                    delete this.outSightObstacles[id];
                }
            }
            if (obs instanceof WallData || obs instanceof CrateData) {
                if (!gm.checkCollisionRectangleRectangle(obs.position, obs.width, obs.height, gm.p(rect.x, rect.y), rect.w, rect.h)) {
                    this.outSightObstacles[id] = obs;
                    delete this.obstacles[id];
                }
                else {
                    delete this.outSightObstacles[id];
                }
            }
        }

        for (let key in this.items) {
            let item = this.items[key];
            let id = item.getObjectId();
            if (!gm.checkCollisionCircleRectangle(item.position, item.radius, gm.p(rect.x, rect.y), rect.w, rect.h)) {
                this.outSightItems[id] = item;
                delete this.items[id];
            }
            else {
                delete this.outSightItems[id];
            }
        }
    },

    updateMyPlayerInfo: function (hp, haveGun) {
        this.myPlayer.hp = hp;
        this.myPlayer.gun.isActive = !!haveGun;
    },

    getPlayerListByTeam: function (team) {
        let list = [];

        for (let username in this.players) {
            let player = this.players[username];
            if (player.team === team) {
                list.push(player);
            }
        }
        for (let username in this.outSightPlayers) {
            let player = this.outSightPlayers[username];
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
        for (let key in this.outSightPlayers) {
            if (!this.outSightPlayers[key].isDead()) alive++;
        }
        return alive;
    },

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleData}
     */
    getObstacleById: function (obstacleId) {
        if (this.obstacles[obstacleId]) return this.obstacles[obstacleId];
        if (this.outSightObstacles[obstacleId]) return this.outSightObstacles[obstacleId];
        return null;
    },

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleData}
     */
    getObstacleAndRemoveById: function (obstacleId) {
        if (this.obstacles[obstacleId]) {
            let obs = this.obstacles[obstacleId];
            delete this.obstacles[obstacleId];
            return obs;
        }
        if (this.outSightObstacles[obstacleId]) {
            let obs = this.outSightObstacles[obstacleId];
            delete this.outSightObstacles[obstacleId];
            return obs;
        }

        return null;
    },

    /**
     * @param {number} itemId
     * @return {null|ItemData}
     */
    getItemById: function (itemId) {
        if (this.items[itemId]) return this.items[itemId];

        return null;
    },

    /**
     * @param {number} itemId
     * @return {null|ItemData}
     */
    getItemAndRemoveById: function (itemId) {
        if (this.items[itemId]) {
            let item = this.items[itemId];
            delete this.items[itemId];
            return item;
        }
        if (this.outSightItems[itemId]) {
            let item = this.outSightItems[itemId];
            delete this.outSightItems[itemId];
            return item;
        }

        return null;
    },

    updateMyPlayerMove: function (unitVector, rotation) {
        let oldRotation = this.myPlayer.rotation;
        this.myPlayer.position.x += unitVector.x * Config.PLAYER_BASE_SPEED;
        this.myPlayer.position.y += unitVector.y * Config.PLAYER_BASE_SPEED;
        this.myPlayer.rotation = rotation;
        this.myPlayer.movingUnitVector = unitVector;

        if (unitVector.x !== 0 || unitVector.y !== 0 || oldRotation !== rotation) {
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

    myPlayerUseBandage: function () {
        if (this.myPlayer.numBandages > 0) {
            GameClient.getInstance().sendPlayerUseBandage();
        }
    },

    myPlayerUseMedKit: function () {
        if (this.myPlayer.numMedKits > 0) {
            GameClient.getInstance().sendPlayerUseMedKit();
        }
    },

    receivedMyPlayerHealed: function (remainHp, itemType, remainItem) {
        let oldHp = this.myPlayer.hp;
        this.myPlayer.hp = remainHp;

        switch (itemType) {
            case survival2d.flatbuffers.Item.BandageItem:
                this.myPlayer.numBandages = remainItem;
                break;
            case survival2d.flatbuffers.Item.MedKitItem:
                this.myPlayer.numMedKits = remainItem;
                break;
        }

        if (this.isInMatch()) this.scene.myPlayerHeal(oldHp);
    },

    receivedPlayerMove: function (username, pos, rotation) {
        let player = this.players[username];
        if (!player) {
            player = this.outSightPlayers[username];
            if (!player) {
                cc.log("Warning: we dont have player " + username + " in match");
                return;
            }
            this.players[username] = player;
            delete this.outSightPlayers[username];
        }

        if (username === GameManager.getInstance().userData.username) {
            if (Config.ENABLE_SMOOTH) {
                this._saveMyPlayerMoveAction = {
                    position: pos,
                    rotation: rotation
                }
                return;
            }
        }

        player.position = pos;
        player.rotation = rotation;

        let rect = {
            x: this.myPlayer.position.x - Constant.LOGIC_VIEW_WIDTH/2,
            y: this.myPlayer.position.y - Constant.LOGIC_VIEW_HEIGHT/2,
            w: Constant.LOGIC_VIEW_WIDTH,
            h: Constant.LOGIC_VIEW_HEIGHT
        }

        if (!gm.checkCollisionCircleRectangle(player.position, player.radius, gm.p(rect.x, rect.y), rect.w, rect.h)) {
            this.outSightPlayers[player.username] = player;
            delete this.players[player.username];
        }
        else {
            this.players[player.username] = player;
            delete this.outSightPlayers[player.username];
        }

        if (this.isInMatch()) this.scene.playerMove(username, pos, rotation);
    },

    syncMyPlayerMove: function () {
        if (Constant.IS_OFFLINE) return;
        if (this.gameState !== MatchManager.STATE.PLAY) return;
        if (!Config.ENABLE_SMOOTH) return;
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
        this.items[item.getObjectId()] = item;

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
    },

    receivedNewSafeZone: function (x, y, radius) {
        this.nextSafeZone.position = gm.p(x, y);
        this.nextSafeZone.radius = radius;
        this.nextSafeZone.level++;

        if (this.isInMatch()) this.scene.changeNextSafeZone();
    },

    receivedSafeZoneMove: function (x, y, radius) {
        this.safeZone.position = gm.p(x, y);
        this.safeZone.radius = radius;
        this.safeZone.level++;

        if (this.isInMatch()) this.scene.changeSafeZone();
    }
});

MatchManager.STATE = {
    WAIT: 0,
    PLAY: 1,
    END: 2
}