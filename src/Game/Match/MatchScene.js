/**
 * Created by quantm7 on 9/10/2022.
 */

const MatchScene = BaseLayer.extend({
    ctor: function () {
        this.playerUIs = [];
        this.obstacleUIs = [];
        this.itemUIs = [];
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

        this.playerUIs[GameManager.getInstance().userData.username] = this.myPlayer;

        this.safeZoneUI = new SafeZoneUI();
        this.ground.addChild(this.safeZoneUI, MatchScene.Z_ORDER.SAFE_ZONE);
        this.safeZoneUI.setVisible(false);

        this.hud = this.getControl("hud");

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

        let pWeaponPack = this.getControl("pWeaponPack", this.hud);
        this.weaponSlotFist = this.getControl("slotFist", pWeaponPack);
        this.weaponSlotGun = this.getControl("slotGun", pWeaponPack);

        this.lblMyAmmoHave = this.getControl("num", this.getControl("ammoHave", this.hud));

        this.weaponSlotFist.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.myPlayerChangeWeapon(PlayerData.WEAPON_SLOT.FIST);
            }
        }, this);

        this.weaponSlotGun.addTouchEventListener((sender, type) => {
            if (type === ccui.Widget.TOUCH_ENDED) {
                this.myPlayerChangeWeapon(PlayerData.WEAPON_SLOT.GUN);
            }
        }, this);
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
                if (Config.TEST) {
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

        this.weaponSlotFist.setScale(1.2);
        this.weaponSlotFist.setOpacity(255);
        this.weaponSlotGun.setScale(1);
        this.weaponSlotGun.setOpacity(100);

        this.updateMatchView();

        this.controller.setControllerEnabled(true);

        this.scheduleUpdate();
    },

    onExit: function () {
        this.unscheduleUpdate();
        this._super();
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

        for (let username in match.players) {
            let player = match.players[username];
            let playerUI = this.playerUIs[player.username];
            if (!playerUI) {
                playerUI = new PlayerUI();
                this.ground.addChild(playerUI, MatchScene.Z_ORDER.PLAYER);
                this.playerUIs[player.username] = playerUI;
            }
            playerUI.unEquip();
            playerUI.setPosition(player.position);
            playerUI.setPlayerRotation(Math.round(gm.radToDeg(player.rotation)));
            playerUI.setPlayerUIInfo(player.username);
            playerUI.setPlayerColorByTeam(player.team);
            playerUI.setVestLevel(player.vest.level);
            playerUI.setHelmetLevel(player.helmet.level);
        }

        for (let obsUI of this.obstacleUIs) {
            obsUI.removeFromParent(true);
        }
        this.obstacleUIs = [];

        for (let obs of match.obstacles) {
            let obsUI;
            if (obs instanceof TreeData) obsUI = new TreeUI();
            if (obs instanceof CrateData) obsUI = new CrateUI();
            if (obs instanceof StoneData) obsUI = new StoneUI();
            if (obs instanceof WallData) obsUI = new WallUI();
            this.ground.addChild(obsUI, MatchScene.Z_ORDER.OBSTACLE);
            obsUI.setPosition(obs.position);
            obsUI.setObstacleId(obs.getObjectId());
            this.obstacleUIs.push(obsUI);
        }

        for (let itemUI of this.itemUIs) {
            itemUI.removeFromParent(true);
        }
        this.itemUIs = [];

        for (let item of match.items) {
            this.createItem(item);
        }

        this.safeZoneUI.setPosition(0, 0);
        this.safeZoneUI.setSafeZoneUI(match.safeZone);

        this.updateMyHpProgress(match.myPlayer.hp);

        this.updateMyPlayerItem();


        this.numPlayerLeft.setString(match.getNumberOfAlivePlayers());
    },

    update: function (dt) {
        let match = GameManager.getInstance().getCurrentMatch();

        if (!match.myPlayer.isDead()) {
            let oldPos = match.myPlayer.position;
            let unitVector = this.controller.calculateMovementVector();
            let newPos = gm.calculateNextPosition(oldPos, unitVector, Config.PLAYER_BASE_SPEED);
            if (this.checkPlayerCollision(newPos, match.myPlayer.radius)) {
                newPos = oldPos;
                unitVector = gm.vector(0, 0);
            }

            this.setMyPlayerPosition(newPos);

            let rotation = this.controller.calculateRotation(this.ground2ScenePosition(newPos));
            let degRotation = Math.round(gm.radToDeg(rotation));
            this.myPlayer.setPlayerRotation(degRotation);

            match.updateMyPlayerMove(unitVector, rotation);

            let isAttack = this.controller.checkAttacking();
            if (isAttack && this._cooldownAttack <= 0) {
                this.myPlayerAttack(this.controller.getDestPosition());
                if (this.myPlayer.isEquip()) this._cooldownAttack = Config.COOLDOWN_FIRE;
                else this._cooldownAttack = Config.COOLDOWN_ATTACK;
            }
        }

        if (this._cooldownAttack > 0) this._cooldownAttack -= dt;

        for (let i = 0; i < this.workingBullets.length; i++) {
            let bullet = this.workingBullets[i];
            if (this.checkBulletCollision(bullet.getPosition())) {
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
        for (let obs of match.obstacles) {
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
        for (let obs of match.obstacles) {
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

    playerMove: function (username, position, rotation) {
        let playerUI = this.playerUIs[username];
        if (playerUI) {
            playerUI.setPosition(position);
            playerUI.setPlayerRotation(Math.round(gm.radToDeg(rotation)));
        }
    },

    myPlayerPickItem: function () {
        let match = GameManager.getInstance().getCurrentMatch();
        for (let item of match.items) {
            if (gm.checkCollisionCircleCircle(match.myPlayer.position, item.position, match.myPlayer.radius, item.radius)) {
                if (item instanceof ItemGunData && match.myPlayer.isHaveGun()) return;

                // GameClient.getInstance().sendEmptyPacket(Cmd.TAKE_ITEM);
                GameClient.getInstance().sendPlayerTakeItem();

                if (Config.IS_OFFLINE)
                    match.receivedPlayerTakeItem(GameManager.getInstance().userData.username, item.getObjectId());
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

        this.lblMyAmmoHave.setString(myPlayer.numBackBullets);
    },

    myPlayerChangeWeapon: function (slot) {
        let match = GameManager.getInstance().getCurrentMatch();
        if (match.myPlayer.isDead()) return;

        if (slot === PlayerData.WEAPON_SLOT.FIST) {
            if (this.myPlayer.isEquip()) this.myPlayer.unEquip();
            this.weaponSlotFist.setScale(1.2);
            this.weaponSlotFist.setOpacity(255);
            this.weaponSlotGun.setScale(1);
            this.weaponSlotGun.setOpacity(100);
        }
        else {
            if (!match.myPlayer.isHaveGun()) return;
            if (!this.myPlayer.isEquip()) this.myPlayer.equipGun();
            this.weaponSlotGun.setScale(1.2);
            this.weaponSlotGun.setOpacity(255);
            this.weaponSlotFist.setScale(1);
            this.weaponSlotFist.setOpacity(100);
        }

        match.updateMyPlayerWeapon(slot);
    },

    myPlayerAttack: function (destPos = gm.p(0, 0)) {
        let match = GameManager.getInstance().getCurrentMatch();
        destPos = this.scene2GroundPosition(destPos);
        if (this.myPlayer.isEquip()) {
            if (!match.myPlayer.gun.canFire()) return;
            let vector = gm.vector(destPos.x - this.myPlayer.x, destPos.y - this.myPlayer.y);
            vector.normalize();
            let createPos = gm.p(this.myPlayer.x + vector.x * (Config.BULLET_CREATE_DISTANCE + match.myPlayer.radius),
                this.myPlayer.y + vector.y * (Config.BULLET_CREATE_DISTANCE + match.myPlayer.radius));
            this.fire(createPos, vector);
            match.myPlayer.gun.numBullets--;
        }
        else {
            this.myPlayer.animAttack();
        }

        // GameClient.getInstance().sendEmptyPacket(Cmd.PLAYER_ATTACK);
        GameClient.getInstance().sendPlayerAttack();
    },

    playerChangeWeapon: function (username, weaponId) {
        let playerUI = this.playerUIs[username];
        if (playerUI) {
            if (weaponId) playerUI.equipGun();
            else playerUI.unEquip();
        }
    },

    playerAttack: function (username, slot, direction) {
        let playerUI = this.playerUIs[username];
        if (playerUI) {
            if (slot) playerUI.equipGun();
            else playerUI.unEquip();
            let rotation = gm.calculateVectorAngleInclination(direction);
            rotation = Math.round(gm.radToDeg(rotation));
            playerUI.setPlayerRotation(rotation);
            playerUI.animAttack();
        }
    },

    playerTakeDamage: function (username, oldHp) {
        let playerUI = this.playerUIs[username];
        if (playerUI) {
            playerUI.animTakeDamage();
        }

        if (username === GameManager.getInstance().userData.username) {
            this.updateMyHpProgress(GameManager.getInstance().getCurrentMatch().myPlayer.hp, oldHp);
        }
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

    playerDead: function (username) {
        let playerUI = this.playerUIs[username];
        if (playerUI) {
            playerUI.animDead();

            let spr = new cc.Sprite("res/ui/Game/Player/dead_blood.png");
            this.ground.addChild(spr, MatchScene.Z_ORDER.BG);
            spr.setColor(cc.color("#CA2400"));
            spr.setPosition(playerUI.getPosition());
            spr.setOpacity(0);
            spr.setScale(0.1);
            spr.runAction(cc.sequence(
                cc.spawn(
                    cc.fadeIn(0.3),
                    cc.sequence(
                        cc.scaleTo(0.1, 0.3).easing(cc.easeIn(2)),
                        cc.scaleTo(1, 0.5)
                    ),
                    cc.sequence(
                        cc.delayTime(1),
                        cc.fadeOut(0.7)
                    )
                ),
                cc.removeSelf(true)
            ));
        }

        if (username === GameManager.getInstance().userData.username) {
            // TODO: end game
            this.hud.stopAllActions();
            this.hud.runAction(cc.fadeOut(0.3));
        }

        this.numPlayerLeft.setString(GameManager.getInstance().getCurrentMatch().getNumberOfAlivePlayers());
    },

    fire: function (pos, direction) {
        let bullet = this.getBulletFromPool();
        this.workingBullets.push(bullet);
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

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleUI}
     */
    getObstacleUIById: function (obstacleId) {
        for (let obsUI of this.obstacleUIs) {
            if (obsUI.getObstacleId() === obstacleId) return obsUI;
        }

        return null;
    },

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleUI}
     */
    getObstacleUIAndRemoveById: function (obstacleId) {
        for (let i = 0; i < this.obstacleUIs.length; i++) {
            let obsUI = this.obstacleUIs[i];
            if (obsUI.getObstacleId() === obstacleId) {
                this.obstacleUIs.splice(i, 1);
                return obsUI;
            }
        }

        return null;
    },

    obstacleTakeDamage: function (obstacleId) {
        let obs = GameManager.getInstance().getCurrentMatch().getObstacleById(obstacleId);
        let obsUI = this.getObstacleUIById(obstacleId);
        if (obsUI) {
            let hpRatio = obs.maxHp === 0 ? 0 : obs.hp / obs.maxHp;
            obsUI.animTakeDamage(hpRatio);
        }
    },

    obstacleDestroyed: function (obstacleId) {
        let obsUI = this.getObstacleUIAndRemoveById(obstacleId);
        if (obsUI) {
            obsUI.animDestroyed();
        }

        this.miniMap.obstacleDestroyed(obstacleId);
    },

    /**
     * @param {ItemData} item
     * @param {gm.Position=} fromPosition
     */
    createItem: function (item, fromPosition) {
        fromPosition = fromPosition || item.position;
        let itemUI;
        if (item instanceof ItemGunData) itemUI = new ItemGunUI();
        if (item instanceof ItemBulletData) itemUI = new ItemBulletUI();
        if (item instanceof ItemVestData) itemUI = new ItemVestUI();
        if (item instanceof ItemHelmetData) itemUI = new ItemHelmetUI();
        itemUI.setItemId(item.getObjectId());
        this.itemUIs.push(itemUI);
        this.ground.addChild(itemUI, MatchScene.Z_ORDER.ITEM);
        itemUI.setPosition(fromPosition);
        itemUI.runAction(cc.moveTo(0.3, item.position).easing(cc.easeIn(2.5)));
    },

    playerTakeItem: function (itemId) {
        for (let i = 0; i < this.itemUIs.length; i++) {
            let itemUI = this.itemUIs[i];
            if (itemUI.getItemId() === itemId) {
                this.itemUIs.splice(i, 1);

                itemUI.animTaken();
            }
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