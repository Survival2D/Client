/**
 * Created by quantm7 on 9/10/2022.
 */

const MatchScene = BaseLayer.extend({
    ctor: function () {
        this.playerUIs = {};    // map by id
        this.obstacleUIs = {};  // map by id
        this.itemUIs = {};      // map by id
        this.bullets = [];
        this.workingBullets = [];

        this._cooldownAttack = 0;

        this._syncTime = 0;

        this._super(MatchScene.className);
        this.loadCss(game_UIs.MATCH_SCENE);
        this.controller = new Controller();
        this.initKeyBoardController();
        this.initMouseController();
    },

    initGUI: function () {
        this.ground = this.getControl("ground");

        this.myPlayer = new PlayerUI();
        this.ground.addChild(this.myPlayer, MatchScene.Z_ORDER.PLAYER);
        this.myPlayer.setPosition(30, 30);
        this.myPlayer.setMyPlayer(true);
        this.myPlayer.unEquip();

        let drawNode = new cc.DrawNode();
        drawNode.drawRect(cc.p(-Constant.LOGIC_VIEW_WIDTH/2, -Constant.LOGIC_VIEW_HEIGHT/2),
            cc.p(Constant.LOGIC_VIEW_WIDTH/2, Constant.LOGIC_VIEW_HEIGHT/2),
            cc.color(0, 0, 0, 0), 4, cc.color(255, 0, 0, 255));

        this.myPlayer.addChild(drawNode);

        drawNode = new cc.DrawNode();
        drawNode.drawRect(cc.p(-Constant.WIDTH/2, -Constant.HEIGHT/2),
            cc.p(Constant.WIDTH/2, Constant.HEIGHT/2),
            cc.color(0, 0, 0, 0), 4, cc.color(255, 255, 0, 255));

        this.myPlayer.addChild(drawNode);

        this.playerUIs[GameManager.getInstance().userData.uid] = this.myPlayer;

        this.safeZoneUI = new SafeZoneUI();
        this.safeZoneUI.setMapSize(Config.MAP_WIDTH, Config.MAP_HEIGHT);
        this.ground.addChild(this.safeZoneUI, MatchScene.Z_ORDER.SAFE_ZONE);
        this.safeZoneUI.setVisible(false);

        this.hud = this.getControl("hud");

        this.hud.setVisible(false);

        let pPlayerLeft = this.getControl("numPlayerLeft", this.hud);
        this.numPlayerLeft = this.customTextLabel("num", pPlayerLeft);

        this.miniMap = new MiniMap();
        this.hud.addChild(this.miniMap);
        this.miniMap.setAnchorPoint(0, 0);
        this.miniMap.setPosition(30, 30);

        this.myHp = this.getControl("myHp", this.hud);
        this.myHp.bar = this.getControl("bar", this.myHp);
        this.myHp.bar.defaultWidth = this.myHp.bar.getContentSize().width;
        this.myHp.barShadow = this.getControl("barShadow", this.myHp);

        let pMyEquipItem = this.getControl("pMyEquipItem", this.hud);
        this.myEquipVest = this.getControl("vest", pMyEquipItem);
        this.myEquipHelmet = this.getControl("helmet", pMyEquipItem);

        for (let item of [this.myEquipVest, this.myEquipHelmet]) {
            item.img = this.getControl("img", item);
            item.lblLevel = this.customTextLabel("level", item);
        }

        this.lblMyAmmoPistolHave = this.getControl("num", this.getControl("ammoPistolHave", this.hud));
        this.lblMyAmmoShotgunHave = this.getControl("num", this.getControl("ammoShotgunHave", this.hud));
        this.lblMyAmmoSniperHave = this.getControl("num", this.getControl("ammoSniperHave", this.hud));

        this.bandage = this.getControl("bandageHave", this.hud);
        this.lblNumBandage = this.getControl("num", this.bandage);
        this.medKit = this.getControl("medKitHave", this.hud);
        this.lblNumMedKit = this.getControl("num", this.medKit);

        this.bandage.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                let match = GameManager.getInstance().getCurrentMatch();
                if (match) match.myPlayerUseBandage();
            }
        }, this);

        this.medKit.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                let match = GameManager.getInstance().getCurrentMatch();
                if (match) match.myPlayerUseMedKit();
            }
        }, this);

        let pWeaponPack = this.getControl("pWeaponPack", this.hud);
        this.weaponSlotFist = this.getControl("slotFist", pWeaponPack);
        this.weaponSlotPistol = this.getControl("slotPistol", pWeaponPack);
        this.weaponSlotShotgun = this.getControl("slotShotgun", pWeaponPack);
        this.weaponSlotSniper = this.getControl("slotSniper", pWeaponPack);

        this.weaponSlotPistol.lblNumBullets = this.getControl("numBullets", this.weaponSlotPistol);
        this.weaponSlotShotgun.lblNumBullets = this.getControl("numBullets", this.weaponSlotShotgun);
        this.weaponSlotSniper.lblNumBullets = this.getControl("numBullets", this.weaponSlotSniper);
        this.weaponSlotPistol.lblNumBullets.ignoreContentAdaptWithSize(true);
        this.weaponSlotShotgun.lblNumBullets.ignoreContentAdaptWithSize(true);
        this.weaponSlotSniper.lblNumBullets.ignoreContentAdaptWithSize(true);

        this.weaponSlotFist.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.myPlayerChangeWeapon(PlayerData.WEAPON_SLOT.FIST);
            }
        }, this);

        this.weaponSlotPistol.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.myPlayerChangeWeapon(PlayerData.WEAPON_SLOT.PISTOL);
            }
        }, this);

        this.weaponSlotShotgun.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.myPlayerChangeWeapon(PlayerData.WEAPON_SLOT.SHOTGUN);
            }
        }, this);

        this.weaponSlotSniper.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.myPlayerChangeWeapon(PlayerData.WEAPON_SLOT.SNIPER);
            }
        }, this);

        this.weaponSlots = [this.weaponSlotFist, this.weaponSlotPistol, this.weaponSlotShotgun, this.weaponSlotSniper];

        this.loadingLayer = this.getControl("loadingLayer");
        this.loadingLogo = this.getControl("logo", this.loadingLayer);

        this.customButton("btnSetting", this.onSetting, this, this.hud);

        this.lblAutoPlay = this.getControl("lbAutoPlay", this.hud);
        this.lblAutoPlay.ignoreContentAdaptWithSize(true);
    },

    initKeyBoardController: function () {
        let that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                that.controller.onKeyPressed(keyCode);
            },
            onKeyReleased: function(keyCode, event){
                that.controller.onKeyReleased(keyCode);
            }
        }, this);
    },

    initMouseController: function () {
        let that = this;
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            // onMouseDown: function (event) {
            //     that.controller.onMouseDown(event.getLocationX(), event.getLocationY());
            // },
            // onMouseUp: function (event) {
            //     that.controller.onMouseUp(event.getLocationX(), event.getLocationY());
            // },
            onMouseMove: function (event) {
                that.controller.onMouseMove(event.getLocationX(), event.getLocationY());
            },
            onMouseScroll: function (event) {
                that.controller.onMouseScroll();
                if (Constant.TEST) {
                    let scroll = event.getScrollY();
                    if (scroll > 0) {
                        if (that.ground.getScale() > 1) return;
                        that.ground.setScale(that.ground.getScale() * 2);
                    }
                    if (scroll < 0) {
                        if (that.ground.getScale() <= 1/20) return;
                        that.ground.setScale(that.ground.getScale() / 2);
                    }
                }
            },
        }, this.ground);

        this.ground.addTouchEventListener((sender, type) => {
            switch (type) {
                case ccui.Widget.TOUCH_BEGAN:
                    that.controller.onMouseDown(sender.getTouchBeganPosition().x, sender.getTouchBeganPosition().y);
                    break;
                case ccui.Widget.TOUCH_ENDED:
                    that.controller.onMouseUp(sender.getTouchEndPosition().x, sender.getTouchEndPosition().y);
                    break;
            }
        }, this)
    },

    onEnter: function () {
        this._super();

        for (let slot of this.weaponSlots) {
            slot.setScale(1);
            slot.setOpacity(100);
        }

        this.weaponSlotFist.setScale(1.2);
        this.weaponSlotFist.setOpacity(255);

        this.updateMatchView();

        this.controller.setControllerEnabled(true);

        this.scheduleUpdate();

        this._firstUpdateMatchView = true;

        this.loadingLayer.setVisible(true);
        this.effectIntroStartMatch();
    },

    effectIntroStartMatch: function () {
        this.loadingLogo.setVisible(true);
        this.loadingLogo.setRotation(0);
        this.loadingLogo.setOpacity(255);
        this.loadingLogo.stopAllActions();
        this.loadingLogo.runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.rotateBy(1.5, 180).easing(cc.easeExponentialInOut()),
            cc.fadeOut(0.35),
            cc.hide()
        ));

        this.loadingLayer.setOpacity(255);
        this.loadingLayer.setScale(1);
        this.loadingLayer.stopAllActions();
        this.loadingLayer.runAction(cc.sequence(
            cc.delayTime(1),
            cc.spawn(
                cc.fadeOut(1),
                cc.sequence(
                    cc.delayTime(0.7),
                    cc.scaleTo(0.5, 2).easing(cc.easeSineOut())
                )
            ),
            cc.hide()
        ));
    },

    onExit: function () {
        this.unscheduleUpdate();
        this._super();
    },

    onSetting: function () {
        let gui = SceneManager.getInstance().getGUIByClassName(SettingGUI.className);
        if (gui) {
            gui.onClose();
        }
        else {
            let gui = new SettingGUI();
            SceneManager.getInstance().openGUI(gui, ResultGUI.ZORDER);
        }
    },

    updateAutoPlay: function () {
        if (Config.ENABLE_AUTO_PLAY) {
            this.lblAutoPlay.setString("Auto play: TRUE");
        }
        else {
            this.lblAutoPlay.setString("Auto play: FALSE");
        }
    },

    updateMatchView: function () {
        let match = GameManager.getInstance().getCurrentMatch();
        if (!match) return;

        this.ground.setContentSize(match.mapWidth, match.mapHeight);

        if (this.crossline) this.crossline.removeFromParent(true);
        let drawNode = new cc.DrawNode();
        let x = 500, y = 500;
        while (x < match.mapWidth) {
            drawNode.drawSegment(cc.p(x, 0), cc.p(x, match.mapHeight), 3, cc.color(0, 0, 0, 40));
            x += 500;
        }
        while (y < match.mapHeight) {
            drawNode.drawSegment(cc.p(0, y), cc.p(match.mapWidth, y), 3, cc.color(0, 0, 0, 40));
            y += 500;
        }
        this.ground.addChild(drawNode, MatchScene.Z_ORDER.BG);
        this.crossline = drawNode;

        this.miniMap.updateMiniMapView();

        for (let playerId in match.players) {
            /**
             * @type PlayerData
             */
            let player = match.players[playerId];
            let playerUI = this.playerUIs[player.playerId];
            if (!playerUI) {
                playerUI = new PlayerUI();
                this.ground.addChild(playerUI, MatchScene.Z_ORDER.PLAYER);
                this.playerUIs[player.playerId] = playerUI;
                playerUI.unEquip();
            }
            playerUI.setPosition(player.position);
            playerUI.setPlayerRotation(Math.round(gm.radToDeg(player.rotation)));
            playerUI.setPlayerUIInfo(player.playerName);
            playerUI.setPlayerColorByTeam(player.team);
            playerUI.setVestLevel(player.vest.level);
            playerUI.setHelmetLevel(player.helmet.level);
            if (player.weaponSlot !== PlayerData.WEAPON_SLOT.FIST) {
                switch (player.weaponSlot) {
                    case PlayerData.WEAPON_SLOT.PISTOL:
                        playerUI.setGunType(GunData.GUN_TYPE.PISTOL);
                        break;
                    case PlayerData.WEAPON_SLOT.SHOTGUN:
                        playerUI.setGunType(GunData.GUN_TYPE.SHOTGUN);
                        break;
                    case PlayerData.WEAPON_SLOT.SNIPER:
                        playerUI.setGunType(GunData.GUN_TYPE.SNIPER);
                        break;
                }
                playerUI.equipGun();
            }
            playerUI.setVisible(true);
        }

        for (let key in match.outSightPlayers) {
            /**
             * @type PlayerData
             */
            let player = match.outSightPlayers[key];
            let playerUI = this.playerUIs[player.playerId];
            if (playerUI) {
                playerUI.setVisible(false);
            }
        }

        for (let key in match.obstacles) {
            let obs = match.obstacles[key];
            let id = obs.getObjectId();
            let obsUI = this.obstacleUIs[id];
            if (obsUI) {
                obsUI.setPosition(obs.position);
                let hpRatio = obs.hp / Config.MAX_HP;
                obsUI.setScale(0.5 + 0.5 * hpRatio);
                obsUI.setVisible(true);
                continue;
            }
            if (obs instanceof TreeData) obsUI = new TreeUI();
            if (obs instanceof CrateData) obsUI = new CrateUI();
            if (obs instanceof StoneData) obsUI = new StoneUI();
            if (obs instanceof WallData) obsUI = new WallUI();
            this.ground.addChild(obsUI, MatchScene.Z_ORDER.OBSTACLE);
            obsUI.setPosition(obs.position);
            obsUI.setObstacleId(id);
            this.obstacleUIs[id] = obsUI;
        }

        for (let key in match.outSightObstacles) {
            let obs = match.outSightObstacles[key];
            let id = obs.getObjectId();
            let obsUI = this.obstacleUIs[id];
            if (obsUI) {
                obsUI.setVisible(false);
            }
        }

        for (let key in match.items) {
            this.createItem(match.items[key]);
        }

        for (let key in match.outSightItems) {
            let item = match.outSightItems[key];
            let id = item.getObjectId();
            let itemUI = this.obstacleUIs[id];
            if (itemUI) {
                itemUI.setVisible(false);
            }
        }

        this.safeZoneUI.setPosition(0, 0);
        this.safeZoneUI.setSafeZoneUI(match.safeZone);

        this.setMyPlayerPosition(match.myPlayer.position);
        this.myPlayer.setPlayerRotation(Math.round(gm.radToDeg(match.myPlayer.rotation)));

        this.updateMyHpProgress(match.myPlayer.hp);

        this.updateMyPlayerItem();

        this.numPlayerLeft.setString(match.getNumberOfAlivePlayers());

        this.updateAutoPlay();

        if (this._firstUpdateMatchView) this.effectIntroStartMatch();
        this._firstUpdateMatchView = false;
    },

    update: function (dt) {
        let match = GameManager.getInstance().getCurrentMatch();

        if (!match.myPlayer.isDead()) {
            let oldPos = match.myPlayer.position;
            let unitVector = this.controller.calculateMovementVector();
            let newPos = gm.calculateNextPosition(oldPos, unitVector, Config.PLAYER_BASE_SPEED);

            if (Config.CHECK_MOVE_COLLISION) {
                if (this.checkPlayerCollision(newPos, match.myPlayer.radius)) {
                    newPos = oldPos;
                    unitVector = gm.vector(0, 0);
                }
            }

            let rotation = this.controller.calculateRotation(this.ground2ScenePosition(newPos));
            let degRotation = Math.round(gm.radToDeg(rotation));

            if (Config.ENABLE_SMOOTH) {
                this.setMyPlayerPosition(newPos);
                this.myPlayer.setPlayerRotation(degRotation);
            }

            match.updateMyPlayerMove(unitVector, rotation);

            let isAttack = this.controller.checkAttacking();
            if (isAttack && this._cooldownAttack <= 0) {
                this.myPlayerAttack(this.controller.getDestPosition());
                if (match.myPlayer.weaponSlot) this._cooldownAttack = Config.COOLDOWN_FIRE;
                else this._cooldownAttack = Config.COOLDOWN_ATTACK;
            }
        }

        if (this._cooldownAttack > 0) this._cooldownAttack -= dt;

        for (let i = 0; i < this.workingBullets.length; i++) {
            let bullet = this.workingBullets[i];
            if (this.checkBulletCollision(bullet.getPosition())
                || bullet.isOutOfRange()) {
                this.workingBullets.splice(i, 1);
                i--;
                bullet.setVisible(false);
            }
            else bullet.updateBullet(dt);
        }


        this._syncTime += dt;
        if (this._syncTime >= Config.SYNC_DELTA_TIME) {
            match.syncMyPlayerMove();
            this._syncTime = 0;
        }
    },

    checkPlayerCollision: function (pos = gm.p(0, 0)) {
        let match = GameManager.getInstance().getCurrentMatch();
        let radius = match.myPlayer.radius;
        if (pos.x - radius < 0 || pos.x + radius > match.mapWidth || pos.y - radius < 0 || pos.y + radius > match.mapHeight) return true;
        for (let key in match.obstacles) {
            let obs = match.obstacles[key];
            if (obs instanceof TreeData || obs instanceof StoneData)
                if (gm.checkCollisionCircleCircle(pos, obs.position, radius, obs.radius)) return true;
            if (obs instanceof CrateData || obs instanceof WallData)
                if (gm.checkCollisionCircleRectangle(pos, radius, obs.position, obs.width, obs.height)) return true;
        }
        return false;
    },

    checkBulletCollision: function (pos = gm.p(0, 0)) {
        let match = GameManager.getInstance().getCurrentMatch();
        let radius = 0;
        if (pos.x < 0 || pos.x > match.mapWidth || pos.y < 0 || pos.y > match.mapHeight) return true;
        for (let key in match.obstacles) {
            let obs = match.obstacles[key];
            if (obs instanceof TreeData || obs instanceof StoneData)
                if (gm.checkCollisionCircleCircle(pos, obs.position, radius, obs.radius)) {
                    this.obstacleTakeDamage(obs.getObjectId());
                    return true;
                }
            if (obs instanceof CrateData|| obs instanceof WallData)
                if (gm.checkCollisionCircleRectangle(pos, radius, obs.position, obs.width, obs.height)) {
                    this.obstacleTakeDamage(obs.getObjectId());
                    return true;
                }
        }
        for (let username in match.players) {
            let player = match.players[username];
            if (gm.checkCollisionCircleCircle(pos, player.position, radius, player.radius)) {
                return true;
            }
        }
        return false;
    },

    ground2ScenePosition: function (pos) {
        return this.ground.convertToWorldSpace(pos);
    },

    scene2GroundPosition: function (pos) {
        return this.ground.convertToNodeSpace(pos);
    },

    setMyPlayerPosition: function (pos) {
        this.myPlayer.setPosition(pos);
        let scenePos = this.ground2ScenePosition(pos);
        this.ground.setPosition(this.ground.x + cc.winSize.width/2 - scenePos.x, this.ground.y + cc.winSize.height/2 - scenePos.y);
        this.miniMap.setMyPlayerPosition(pos);
    },

    playerMove: function (playerId, position, rotation) {
        if (playerId === GameManager.getInstance().userData.uid) {
            this.setMyPlayerPosition(position);
            this.myPlayer.setPlayerRotation(Math.round(gm.radToDeg(rotation)));
            return;
        }
        let playerUI = this.playerUIs[playerId];
        if (playerUI) {
            let match = GameManager.getInstance().getCurrentMatch();
            playerUI.setVisible(true);
            playerUI.setPosition(position);
            playerUI.setPlayerRotation(Math.round(gm.radToDeg(rotation)));
        }
    },

    myPlayerPickItem: function () {
        let match = GameManager.getInstance().getCurrentMatch();
        for (let key in match.items) {
            let item = match.items[key];
            if (gm.checkCollisionCircleCircle(match.myPlayer.position, item.position, match.myPlayer.radius, item.radius)) {
                if (item instanceof ItemGunData && match.myPlayer.isHaveGun(item.getGunType())) return;

                // GameClient.getInstance().sendEmptyPacket(Cmd.TAKE_ITEM);
                let builder = new flatbuffers.Builder(0);
                let playerTakeItemRequest = fbs.PlayerTakeItemRequest.createPlayerTakeItemRequest(builder);
                let request = fbs.Request.createRequest(builder,
                    fbs.RequestUnion.PlayerTakeItemRequest, playerTakeItemRequest);
                builder.finish(request);
                fbsClient.sendBinary(builder.asUint8Array());

                if (Constant.IS_OFFLINE)
                    match.receivedPlayerTakeItem(GameManager.getInstance().userData.uid, item.getObjectId());
                return;
            }
        }
    },

    updateMyPlayerItem: function () {
        let myPlayer = GameManager.getInstance().getCurrentMatch().myPlayer;

        if (myPlayer.vest.level === 0) {
            this.myEquipVest.setOpacity(100);
        }
        else {
            this.myEquipVest.setOpacity(255);
        }

        if (myPlayer.helmet.level === 0) {
            this.myEquipHelmet.setOpacity(100);
        }
        else {
            this.myEquipHelmet.setOpacity(255);
        }

        this.myEquipVest.lblLevel.setString("lv. " + myPlayer.vest.level);
        this.myEquipHelmet.lblLevel.setString("lv. " + myPlayer.helmet.level);

        this.lblMyAmmoPistolHave.setString(myPlayer.numBackBullets[GunData.GUN_TYPE.PISTOL]);
        this.lblMyAmmoShotgunHave.setString(myPlayer.numBackBullets[GunData.GUN_TYPE.SHOTGUN]);
        this.lblMyAmmoSniperHave.setString(myPlayer.numBackBullets[GunData.GUN_TYPE.SNIPER]);

        this.lblNumBandage.setString(myPlayer.numBandages);
        this.lblNumMedKit.setString(myPlayer.numMedKits);

        this.weaponSlotPistol.lblNumBullets.setString(myPlayer.getGun(GunData.GUN_TYPE.PISTOL).numBullets);
        this.weaponSlotShotgun.lblNumBullets.setString(myPlayer.getGun(GunData.GUN_TYPE.SHOTGUN).numBullets);
        this.weaponSlotSniper.lblNumBullets.setString(myPlayer.getGun(GunData.GUN_TYPE.SNIPER).numBullets);

        this.playerChangeWeapon(myPlayer.playerId, myPlayer.weaponSlot);
    },

    myPlayerChangeWeapon: function (slot) {
        let match = GameManager.getInstance().getCurrentMatch();
        if (match.myPlayer.isDead()) return;

        for (let slot of this.weaponSlots) {
            slot.setScale(1);
            slot.setOpacity(100);
        }

        if (slot === PlayerData.WEAPON_SLOT.FIST) {
            this.myPlayer.unEquip();
            this.weaponSlotFist.setScale(1.2);
            this.weaponSlotFist.setOpacity(255);
        }
        else {
            switch (slot) {
                case PlayerData.WEAPON_SLOT.PISTOL:
                    if (!match.myPlayer.isHaveGun(GunData.GUN_TYPE.PISTOL)) return;
                    this.weaponSlotPistol.setScale(1.2);
                    this.weaponSlotPistol.setOpacity(255);
                    this.myPlayer.setGunType(GunData.GUN_TYPE.PISTOL);
                    break;
                case PlayerData.WEAPON_SLOT.SHOTGUN:
                    if (!match.myPlayer.isHaveGun(GunData.GUN_TYPE.SHOTGUN)) return;
                    this.weaponSlotShotgun.setScale(1.2);
                    this.weaponSlotShotgun.setOpacity(255);
                    this.myPlayer.setGunType(GunData.GUN_TYPE.SHOTGUN);
                    break;
                case PlayerData.WEAPON_SLOT.SNIPER:
                    if (!match.myPlayer.isHaveGun(GunData.GUN_TYPE.SNIPER)) return;
                    this.weaponSlotSniper.setScale(1.2);
                    this.weaponSlotSniper.setOpacity(255);
                    this.myPlayer.setGunType(GunData.GUN_TYPE.SNIPER);
                    break;
                default: break;
            }

            this.myPlayer.equipGun();
        }

        match.updateMyPlayerWeapon(slot);
    },

    myPlayerAttack: function (destPos = gm.p(0, 0)) {
        if (Config.ENABLE_SMOOTH) {
            let match = GameManager.getInstance().getCurrentMatch();
            destPos = this.scene2GroundPosition(destPos);
            if (match.myPlayer.weaponSlot) {
                if (!match.myPlayer.canFire()) return;
                let vector = gm.vector(destPos.x - this.myPlayer.x, destPos.y - this.myPlayer.y);
                vector.normalize();
                let createPos = gm.p(this.myPlayer.x + vector.x * (Config.BULLET_CREATE_DISTANCE + match.myPlayer.radius),
                    this.myPlayer.y + vector.y * (Config.BULLET_CREATE_DISTANCE + match.myPlayer.radius));
                this.fireBullet(match.myPlayer.getCurrentGun().type, createPos, createPos, vector);
                match.myPlayer.fire();
                this.updateMyPlayerItem();
            }
            else {
                this.myPlayer.animAttack();
            }
        }

        cc.log("myPlayerAttack");

        let builder = new flatbuffers.Builder(0);
        let playerAttackRequest = fbs.PlayerAttackRequest.createPlayerAttackRequest(builder);
        let request = fbs.Request.createRequest(builder,
            fbs.RequestUnion.PlayerAttackRequest, playerAttackRequest);
        builder.finish(request);
        fbsClient.sendBinary(builder.asUint8Array());
    },

    playerChangeWeapon: function (playerId, weaponId) {
        let playerUI = this.playerUIs[playerId];
        if (playerUI) {
            if (weaponId) {
                switch (weaponId) {
                    case PlayerData.WEAPON_SLOT.PISTOL:
                        playerUI.setGunType(GunData.GUN_TYPE.PISTOL);
                        break;
                    case PlayerData.WEAPON_SLOT.SHOTGUN:
                        playerUI.setGunType(GunData.GUN_TYPE.SHOTGUN);
                        break;
                    case PlayerData.WEAPON_SLOT.SNIPER:
                        playerUI.setGunType(GunData.GUN_TYPE.SNIPER);
                        break;
                }
                playerUI.equipGun();
            }
            else playerUI.unEquip();
        }
    },

    playerAttack: function (playerId, slot, direction) {
        let playerUI = this.playerUIs[playerId];
        if (playerUI) {
            if (slot) {
                switch (slot) {
                    case PlayerData.WEAPON_SLOT.PISTOL:
                        playerUI.setGunType(GunData.GUN_TYPE.PISTOL);
                        break;
                    case PlayerData.WEAPON_SLOT.SHOTGUN:
                        playerUI.setGunType(GunData.GUN_TYPE.SHOTGUN);
                        break;
                    case PlayerData.WEAPON_SLOT.SNIPER:
                        playerUI.setGunType(GunData.GUN_TYPE.SNIPER);
                        break;
                }
                playerUI.equipGun();
            }
            else playerUI.unEquip();
            let rotation = gm.calculateVectorAngleInclination(direction);
            rotation = Math.round(gm.radToDeg(rotation));
            playerUI.setPlayerRotation(rotation);
            playerUI.animAttack();
        }
    },

    playerTakeDamage: function (playerId, oldHp) {
        let playerUI = this.playerUIs[playerId];
        if (playerUI) {
            playerUI.animTakeDamage();
        }

        if (playerId === GameManager.getInstance().userData.uid) {
            this.updateMyHpProgress(GameManager.getInstance().getCurrentMatch().myPlayer.hp, oldHp);
        }
    },

    myPlayerHeal: function (oldHp) {
        this.myPlayer.animHeal();
        this.updateMyHpProgress(GameManager.getInstance().getCurrentMatch().myPlayer.hp, oldHp);

        this.updateMyPlayerItem();
    },

    updateMyHpProgress: function (curHp, oldHp) {
        let width = this.myHp.bar.defaultWidth * curHp / Config.PLAYER_MAX_HP;
        this.myHp.bar.setContentSize(width, this.myHp.bar.height);

        if (!oldHp) oldHp = curHp;

        let oldWidth = this.myHp.bar.defaultWidth * oldHp / Config.PLAYER_MAX_HP;
        this.myHp.barShadow.setContentSize(oldWidth, this.myHp.barShadow.height);
        this.myHp.barShadow.setScaleX(1);

        if (oldHp !== curHp) {
            this.myHp.barShadow.stopAllActions();
            this.myHp.barShadow.runAction(cc.scaleTo(0.5, width/ oldWidth, 1));
        }
    },

    playerDead: function (playerId) {
        let playerUI = this.playerUIs[playerId];
        if (playerUI) {
            playerUI.animDead();

            let spr = new cc.Sprite("res/ui/Game/Player/dead_blood.png");
            this.ground.addChild(spr, MatchScene.Z_ORDER.BG);
            spr.setColor(cc.color("#CA2400"));
            spr.setPosition(playerUI.getPosition());
            spr.setOpacity(0);
            spr.setScale(0.3);
            spr.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeIn(0.3),
                    cc.sequence(
                        cc.scaleTo(0.1, 1).easing(cc.easeIn(2)),
                        cc.scaleTo(1, 1.3)
                    ),
                    cc.sequence(
                        cc.delayTime(1),
                        cc.fadeOut(0.7)
                    )
                ),
                cc.removeSelf(true)
            ));
        }

        if (playerId === GameManager.getInstance().userData.uid) {
            // TODO: end game
            this.hud.stopAllActions();
            this.hud.runAction(cc.fadeOut(0.3));
        }

        this.numPlayerLeft.setString(GameManager.getInstance().getCurrentMatch().getNumberOfAlivePlayers());
    },

    /**
     * @param {GunData.GUN_TYPE} gunType
     * @param {gm.Position} pos
     * @param {gm.Position} rawPos
     * @param {gm.Vector} direction
     */
    fireBullet: function (gunType, pos, rawPos, direction) {
        let bullet = this.getBulletFromPool();
        this.workingBullets.push(bullet);
        bullet.setGunType(gunType);
        bullet.setRawPosition(rawPos);
        bullet.setPosition(pos);
        bullet.setMoveDirection(direction);
        bullet.animFire();
    },

    /**
     * @returns {BulletUI}
     */
    getBulletFromPool: function () {
        for (let bullet of this.bullets) {
            if (!bullet.isVisible()) {
                bullet.setVisible(true);
                return bullet;
            }
        }

        let bullet = new BulletUI();
        this.ground.addChild(bullet, MatchScene.Z_ORDER.BULLET);
        this.bullets.push(bullet);
        return bullet;
    },

    obstacleTakeDamage: function (obstacleId) {
        let obs = GameManager.getInstance().getCurrentMatch().getObstacleById(obstacleId);
        let obsUI = this.obstacleUIs[obstacleId];
        if (obsUI) {
            let hpRatio = obs.hp / Config.MAX_HP;
            obsUI.animTakeDamage(hpRatio);
        }
    },

    obstacleDestroyed: function (obstacleId) {
        let obsUI = this.obstacleUIs[obstacleId];
        if (obsUI) {
            obsUI.animDestroyed();
            delete this.obstacleUIs[obstacleId];
        }

        this.miniMap.obstacleDestroyed(obstacleId);
    },

    /**
     * @param {ItemData} item
     * @param {gm.Position=} fromPosition
     */
    createItem: function (item, fromPosition) {
        let id = item.getObjectId();
        let itemUI = this.itemUIs[id];
        if (itemUI) {
            itemUI.setPosition(item.position);
            itemUI.setVisible(true);
            return;
        }

        fromPosition = fromPosition || item.position;
        if (item instanceof ItemGunData) itemUI = new ItemGunUI();
        else if (item instanceof ItemBulletData) {
            itemUI = new ItemBulletUI();
            itemUI.setGunType(item.getGunType());
        }
        else if (item instanceof ItemVestData) itemUI = new ItemVestUI();
        else if (item instanceof ItemHelmetData) itemUI = new ItemHelmetUI();
        else if (item instanceof ItemBandageData) itemUI = new ItemBandageUI();
        else if (item instanceof ItemMedKitData) itemUI = new ItemMedKitUI();
        else return;
        itemUI.setItemId(id);
        this.itemUIs[id] = itemUI;
        this.ground.addChild(itemUI, MatchScene.Z_ORDER.ITEM);
        itemUI.setPosition(fromPosition);
        itemUI.runAction(cc.moveTo(0.3, item.position).easing(cc.easeIn(2.5)));
    },

    playerTakeItem: function (itemId) {
        let itemUI = this.itemUIs[itemId];
        if (itemUI) {
            itemUI.animTaken();
            delete this.itemUIs[itemId];
        }
    },

    changeSafeZone: function () {
        let match = GameManager.getInstance().getCurrentMatch();
        this.safeZoneUI.animChangeSafeZone(match.safeZone);
        this.miniMap.changeSafeZone();
    },

    changeNextSafeZone: function () {
        this.miniMap.changeNextSafeZone();
    },

    endMatch: function () {
        this.controller.setControllerEnabled(false);
    },
});

MatchScene.className = "MatchScene";

MatchScene.Z_ORDER = {
    BG: 0,
    ITEM: 1,
    PLAYER: 2,
    BULLET: 3,
    OBSTACLE: 4,
    SAFE_ZONE: 5
}
