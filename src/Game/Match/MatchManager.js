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
      for (let i = 0; i < Math.min(5000, Config.MAP_OBJECT_POSITION.length);
          i++) {
        let objPos = Config.MAP_OBJECT_POSITION[i];
        let type = objPos[0];
        if (type === 0) {
          continue;
        }
        let obj;
        switch (type) {
          case Config.MAP_OBJECT_TYPE.TREE:
            obj = new TreeData();
            obj.position = gm.p(objPos[1][0] * 100 + obj.radius,
                objPos[1][1] * 100 + obj.radius);
            break;
          case Config.MAP_OBJECT_TYPE.CRATE:
            obj = new CrateData();
            obj.position = gm.p(objPos[1][0] * 100, objPos[1][1] * 100);
            break;
          case Config.MAP_OBJECT_TYPE.STONE:
            obj = new StoneData();
            obj.position = gm.p(objPos[1][0] * 100 + obj.radius,
                objPos[1][1] * 100 + obj.radius);
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

      this.myPlayer.position = gm.p(this.mapWidth / 2 + 50, this.mapHeight / 2);
      this.myPlayer.hp = Config.PLAYER_MAX_HP;
      this.myPlayer.playerId = this.myPlayer.playerName = GameManager.getInstance().userData.uid;
      this.players[GameManager.getInstance().userData.uid] = this.myPlayer;

      this.myPlayer.vest.level = 1;
      this.myPlayer.helmet.level = 1;

      this.safeZone.position.x = this.mapWidth / 2;
      this.safeZone.position.y = this.mapHeight / 2;
      this.safeZone.level = 0;

      this.nextSafeZone.position.x = this.mapWidth / 2 + 100;
      this.nextSafeZone.position.y = this.mapHeight / 2 + 100;
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
    return SceneManager.getInstance().getMainLayer() instanceof MatchScene
        && this.scene !== null;
  },

  /**
   * @param {PlayerData[]} players
   * @param {ObstacleData[]} obstacles
   * @param {ItemData[]} items
   */
  updateMatchInfo: function (players, obstacles, items) {
    cc.log("obstacles", JSON.stringify(obstacles.map(e => {
      let type = "NONE";
      if (e instanceof TreeData) {
        type = "TREE";
      }
      if (e instanceof CrateData) {
        type = "CRATE";
      }
      if (e instanceof StoneData) {
        type = "STONE";
      }
      if (e instanceof WallData) {
        type = "WALL";
      }
      return {type: type, id: e.getObjectId()}
    })));

    cc.log("players", JSON.stringify(players.map(e => {
      return e.playerName
    })));

    for (let player of players) {
      this.players[player.playerId] = player;
    }

    cc.log("players", JSON.stringify(this.players))
    cc.log("myPlayer", JSON.stringify(GameManager.getInstance().userData.uid))

    this.myPlayer = this.players[GameManager.getInstance().userData.uid];

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

    if (Constant.BLOCK_SIGHT) {
      this.blockSight();
    }

    if (this.isInMatch()) {
      this.scene.updateMatchView();
    }
  },

  blockSight: function () {
    let rect = {
      x: this.myPlayer.position.x - Constant.LOGIC_VIEW_WIDTH / 2,
      y: this.myPlayer.position.y - Constant.LOGIC_VIEW_HEIGHT / 2,
      w: Constant.LOGIC_VIEW_WIDTH,
      h: Constant.LOGIC_VIEW_HEIGHT
    }

    for (let key in this.players) {
      /**
       * @type PlayerData
       */
      let player = this.players[key];
      if (!gm.checkCollisionCircleRectangle(player.position,
          player.radius + 100, gm.p(rect.x, rect.y), rect.w, rect.h)) {
        this.outSightPlayers[player.playerId] = player;
        delete this.players[player.playerId];
      } else {
        delete this.outSightPlayers[player.playerId];
      }
    }

    for (let key in this.obstacles) {
      let obs = this.obstacles[key];
      let id = obs.getObjectId();
      if (obs instanceof TreeData || obs instanceof StoneData) {
        if (!gm.checkCollisionCircleRectangle(obs.position, obs.radius,
            gm.p(rect.x, rect.y), rect.w, rect.h)) {
          this.outSightObstacles[id] = obs;
          delete this.obstacles[id];
        } else {
          delete this.outSightObstacles[id];
        }
      }
      if (obs instanceof WallData || obs instanceof CrateData) {
        if (!gm.checkCollisionRectangleRectangle(obs.position, obs.width,
            obs.height, gm.p(rect.x, rect.y), rect.w, rect.h)) {
          this.outSightObstacles[id] = obs;
          delete this.obstacles[id];
        } else {
          delete this.outSightObstacles[id];
        }
      }
    }

    for (let key in this.items) {
      let item = this.items[key];
      let id = item.getObjectId();
      if (!gm.checkCollisionCircleRectangle(item.position, item.radius,
          gm.p(rect.x, rect.y), rect.w, rect.h)) {
        this.outSightItems[id] = item;
        delete this.items[id];
      } else {
        delete this.outSightItems[id];
      }
    }
  },

  /**
   * @param {number} hp
   * @param {GunData[]} guns
   * @param remainBullets
   */
  updateMyPlayerInfo: function (hp, guns, remainBullets) {
    this.myPlayer.hp = hp;
    this.myPlayer.guns = guns;
    this.myPlayer.numBackBullets = remainBullets;

    if (this.isInMatch()) {
      this.scene.updateMyPlayerItem();
    }
  },

  getPlayerListByTeam: function (team) {
    let list = [];

    for (let playerId in this.players) {
      let player = this.players[playerId];
      if (player.team === team) {
        list.push(player);
      }
    }
    for (let playerId in this.outSightPlayers) {
      let player = this.outSightPlayers[playerId];
      if (player.team === team) {
        list.push(player);
      }
    }

    return list;
  },

  getNumberOfAlivePlayers: function () {
    let alive = 0;
    for (let key in this.players) {
      if (!this.players[key].isDead()) {
        alive++;
      }
    }
    for (let key in this.outSightPlayers) {
      if (!this.outSightPlayers[key].isDead()) {
        alive++;
      }
    }
    return alive;
  },

  /**
   * @param {number} obstacleId
   * @return {null|ObstacleData}
   */
  getObstacleById: function (obstacleId) {
    if (this.obstacles[obstacleId]) {
      return this.obstacles[obstacleId];
    }
    if (this.outSightObstacles[obstacleId]) {
      return this.outSightObstacles[obstacleId];
    }
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
    if (this.items[itemId]) {
      return this.items[itemId];
    }

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
      // cc.log("Send player move")
      let builder = new flatbuffers.Builder(0);
      let direction = fbs.Vector2Struct.createVector2Struct(builder,
          unitVector.x, unitVector.y);
      let playerMoveRequest = fbs.PlayerMoveRequest.createPlayerMoveRequest(
          builder, direction, rotation);
      let request = fbs.Request.createRequest(builder,
          fbs.RequestUnion.PlayerMoveRequest, playerMoveRequest);
      builder.finish(request);
      fbsClient.sendBinary(builder.asUint8Array());
    }
  },

  updateMyPlayerWeapon: function (slot) {
    this.myPlayer.changeWeaponSlot(slot);
    let builder = new flatbuffers.Builder(0);
    let playerChangeWeaponRequest = fbs.PlayerChangeWeaponRequest.createPlayerChangeWeaponRequest(
        builder, slot);
    let request = fbs.Request.createRequest(builder,
        fbs.RequestUnion.PlayerChangeWeaponRequest, playerChangeWeaponRequest);
    builder.finish(request);
    fbsClient.sendBinary(builder.asUint8Array());
  },

  reloadMyPlayerWeapon: function () {
    if (this.myPlayer.canReloadBullets()) {
      let builder = new flatbuffers.Builder(0);
      let playerReloadWeaponRequest = fbs.PlayerReloadWeaponRequest.createPlayerReloadWeaponRequest(
          builder);
      let request = fbs.Request.createRequest(builder,
          fbs.RequestUnion.PlayerReloadWeaponRequest,
          playerReloadWeaponRequest);
      builder.finish(request);
      fbsClient.sendBinary(builder.asUint8Array());
    }
  },

  myPlayerUseBandage: function () {
    if (this.myPlayer.numBandages > 0) {
      cc.log("Error: deprecated function myPlayerUseBandage");
    }
  },

  myPlayerUseMedKit: function () {
    if (this.myPlayer.numMedKits > 0) {
      cc.log("Error: deprecated function myPlayerUseMedKit");
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

    if (this.isInMatch()) {
      this.scene.myPlayerHeal(oldHp);
    }
  },

  receivedPlayerMove: function (playerId, pos, rotation) {
    /**
     * @type PlayerData
     */
    let player = this.players[playerId];
    if (!player) {
      player = this.outSightPlayers[playerId];
      if (!player) {
        cc.log("Warning: we dont have player " + playerId + " in match");
        return;
      }
      this.players[playerId] = player;
      delete this.outSightPlayers[playerId];
    }

    if (playerId === GameManager.getInstance().userData.uid) {
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
      x: this.myPlayer.position.x - Constant.LOGIC_VIEW_WIDTH / 2,
      y: this.myPlayer.position.y - Constant.LOGIC_VIEW_HEIGHT / 2,
      w: Constant.LOGIC_VIEW_WIDTH,
      h: Constant.LOGIC_VIEW_HEIGHT
    }

    if (!gm.checkCollisionCircleRectangle(player.position, player.radius + 100,
        gm.p(rect.x, rect.y), rect.w, rect.h)) {
      this.outSightPlayers[player.playerId] = player;
      delete this.players[player.playerId];
    } else {
      this.players[player.playerId] = player;
      delete this.outSightPlayers[player.playerId];
    }

    if (this.isInMatch()) {
      this.scene.playerMove(playerId, pos, rotation);
    }
  },

  syncMyPlayerMove: function () {
    if (Constant.IS_OFFLINE) {
      return;
    }
    if (this.gameState !== MatchManager.STATE.PLAY) {
      return;
    }
    if (!Config.ENABLE_SMOOTH) {
      return;
    }
    cc.log("--Sync my player move");
    this.myPlayer.position = this._saveMyPlayerMoveAction.position;
    this.myPlayer.rotation = this._saveMyPlayerMoveAction.rotation;

    if (this.isInMatch()) {
      this.scene.playerMove(GameManager.getInstance().userData.uid,
          this.myPlayer.position, this.myPlayer.rotation);
    }
  },

  receivedPlayerAttack: function (playerId, slot, position) {
    let player = this.players[playerId];
    if (!player) {
      cc.log("Warning: we dont have player " + playerId + " in match");
      return;
    }

    let gun;
    switch (slot) {
      case PlayerData.WEAPON_SLOT.PISTOL:
        gun = player.getGun(GunData.GUN_TYPE.PISTOL);
        break;
      case PlayerData.WEAPON_SLOT.SHOTGUN:
        gun = player.getGun(GunData.GUN_TYPE.SHOTGUN);
        break;
      case PlayerData.WEAPON_SLOT.SNIPER:
        gun = player.getGun(GunData.GUN_TYPE.SNIPER);
        break;
    }

    if (gun) gun.numBullets--;

    if (playerId === GameManager.getInstance().userData.uid) {
      if (Config.ENABLE_SMOOTH) return;
      this.scene.updateMyPlayerItem();
    }

    let direction = gm.vector(position.x - player.position.x,
        position.y - player.position.y);

    if (this.isInMatch()) {
      this.scene.playerAttack(playerId, slot, direction);
    }
  },

  receivedPlayerChangeWeapon: function (playerId, weaponId) {
    let player = this.players[playerId];
    if (!player) {
      cc.log("Warning: we dont have player " + playerId + " in match");
      return;
    }

    player.weaponSlot = weaponId;

    // if (playerId === GameManager.getInstance().userData.uid) return;

    if (this.isInMatch()) {
      this.scene.playerChangeWeapon(playerId, weaponId);
    }
  },

  /**
   * @param {GunData.GUN_TYPE} gunType
   * @param {number} numWeaponBullets
   * @param {number} numBulletsRemain
   */
  receivedPlayerReloadWeapon: function (gunType, numWeaponBullets, numBulletsRemain) {
    this.myPlayer.reloadBullets(gunType, numWeaponBullets, numBulletsRemain);
    if (this.isInMatch()) {
      this.scene.updateMyPlayerItem();
    }
  },

  /**G
   * @param {BulletData} bullet
   */
  receivedCreateBullet: function (bullet) {
    let player = this.players[bullet.ownerId];
    if (!player) {
      cc.log("Warning: we dont have player " + playerId + " in match");
    }

    if (bullet.ownerId === GameManager.getInstance().userData.uid) {
      if (Config.ENABLE_SMOOTH ) return;
    }

    if (this.isInMatch()) {
      this.scene.fireBullet(bullet.rawPosition, bullet.direction);
    }
  },

  receivedPlayerTakeDamage: function (playerId, hp) {
    let player = this.players[playerId];
    if (!player) {
      cc.log("Warning: we dont have player " + playerId + " in match");
      return;
    }

    let oldHp = player.hp;
    player.hp = hp;

    if (this.isInMatch()) {
      this.scene.playerTakeDamage(playerId, oldHp);
    }
  },

  receivedPlayerDead: function (playerId) {
    let player = this.players[playerId];
    if (!player) {
      cc.log("Warning: we dont have player " + playerId + " in match");
      return;
    }

    player.hp = 0;

    if (this.isInMatch()) {
      this.scene.playerDead(playerId);
    }
  },

  receivedObstacleTakeDamage: function (obstacleId, hp) {
    let obs = this.getObstacleById(obstacleId);
    if (!obs) {
      cc.log("Warning: we dont have obstacle " + obstacleId + " in match");
      return;
    }

    obs.hp = hp;

    if (this.isInMatch()) {
      this.scene.obstacleTakeDamage(obstacleId);
    }
  },

  receivedObstacleDestroyed: function (obstacleId) {
    let obs = this.getObstacleAndRemoveById(obstacleId);
    if (!obs) {
      cc.log("Warning: we dont have obstacle " + obstacleId + " in match");
      return;
    }

    obs.hp = 0;

    if (this.isInMatch()) {
      this.scene.obstacleDestroyed(obstacleId);
    }
  },

  /**
   * @param {ItemData} item
   * @param {gm.Position} fromPosition
   */
  receivedItemCreated: function (item, fromPosition) {
    this.items[item.getObjectId()] = item;

    if (this.isInMatch()) {
      this.scene.createItem(item, fromPosition);
    }
  },

  receivedPlayerTakeItem: function (playerId, itemId) {
    let player = this.players[playerId];
    if (!player) {
      cc.log("Warning: we dont have player " + playerId + " in match");
      return;
    }

    let item = this.getItemAndRemoveById(itemId);
    if (!item) {
      cc.log("Warning: we dont have item " + itemId + " in match");
      return;
    }

    if (playerId === GameManager.getInstance().userData.uid) {
      this.myPlayer.getItem(item);
      if (this.isInMatch()) {
        this.scene.updateMyPlayerItem();
      }
    }

    if (this.isInMatch()) {
      this.scene.playerTakeItem(itemId);
    }
  },

  receivedMatchResult: function (winTeam) {
    this.gameState = MatchManager.STATE.END;

    let gui = SceneManager.getInstance().getGUIByClassName(ResultGUI.className);
    if (gui) {
      gui.setResultInfo(winTeam);
      gui.effectIn();
    } else {
      let gui = new ResultGUI();
      SceneManager.getInstance().openGUI(gui, ResultGUI.ZORDER);
      gui.setResultInfo(winTeam);
    }

    if (this.isInMatch()) {
      this.scene.endMatch();
    }
  },

  receivedNewSafeZone: function (x, y, radius) {
    this.nextSafeZone.position = gm.p(x, y);
    this.nextSafeZone.radius = radius;
    this.nextSafeZone.level++;

    if (this.isInMatch()) {
      this.scene.changeNextSafeZone();
    }
  },

  receivedSafeZoneMove: function (x, y, radius) {
    this.safeZone.position = gm.p(x, y);
    this.safeZone.radius = radius;
    this.safeZone.level++;

    if (this.isInMatch()) {
      this.scene.changeSafeZone();
    }
  },

  receivedSetAutoPlay: function (isAutoPlay) {
    Config.ENABLE_AUTO_PLAY = isAutoPlay;
    if (this.isInMatch()) {
      this.scene.updateAutoPlay();
    }
  }
});

MatchManager.STATE = {
  WAIT: 0,
  PLAY: 1,
  END: 2
}
