/**
 * Created by quantm7 on 9/10/2022.
 */

const MatchScene = BaseLayer.extend({
    ctor: function () {
        this.playerUIs = [];
        this.obstacleUIs = [];
        this.bullets = [];
        this.workingBullets = [];

        this._cooldownAttack = 0;

        this._super(MatchScene.className);
        this.loadCss(res.MATCH_SCENE);
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

        this.hud = this.getControl("hud");

        this.miniMap = new MiniMap();
        this.hud.addChild(this.miniMap);
        this.miniMap.setAnchorPoint(0, 0);
        this.miniMap.setPosition(30, 30);

        this.myHp = this.getControl("myHp", this.hud);
        this.myHp.bar = this.getControl("bar", this.myHp);
        this.myHp.bar.defaultWidth = this.myHp.bar.getContentSize().width;
        this.myHp.barShadow = this.getControl("barShadow", this.myHp);
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
            onMouseDown: function (event) {
                that.controller.onMouseDown(event.getLocationX(), event.getLocationY());
            },
            onMouseUp: function (event) {
                that.controller.onMouseUp(event.getLocationX(), event.getLocationY());
            },
            onMouseMove: function (event) {
                that.controller.onMouseMove(event.getLocationX(), event.getLocationY());
            },
            onMouseScroll: function (event) {
                that.controller.onMouseScroll();
            },
        }, this);
    },

    onEnter: function () {
        this._super();

        this.updateMatchView();

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
            x += 200;
        }
        while (y < match.mapHeight) {
            drawNode.drawSegment(cc.p(0, y), cc.p(match.mapWidth, y), 3, cc.color(0, 0, 0, 40));
            y += 200;
        }
        this.ground.addChild(drawNode, MatchScene.Z_ORDER.BG);
        this.crossline = drawNode;

        this.miniMap.updateMiniMapView();

        for (let playerId in match.players) {
            let player = match.players[playerId];
            let playerUI = this.playerUIs[player.playerId];
            if (!playerUI) {
                playerUI = new PlayerUI();
                this.ground.addChild(playerUI, MatchScene.Z_ORDER.PLAYER);
                this.playerUIs[player.playerId] = playerUI;
            }
            playerUI.unEquip();
            playerUI.setPosition(player.position);
            playerUI.setPlayerRotation(Math.round(gm.radToDeg(player.rotation)));
            playerUI.setPlayerUIInfo(player.username);
        }

        for (let obsUI of this.obstacleUIs) {
            obsUI.removeFromParent(true);
        }
        this.obstacleUIs = [];

        for (let obs of match.obstacles) {
            let obsUI = new TreeUI();
            this.ground.addChild(obsUI, MatchScene.Z_ORDER.OBSTACLE);
            obsUI.setPosition(obs.position);
            this.obstacleUIs.push(obsUI);
        }

        this.updateMyHpProgress(match.myPlayer.hp);
    },

    update: function (dt) {
        let match = GameManager.getInstance().getCurrentMatch();

        let oldPos = match.myPlayer.position;
        let unitVector = this.controller.calculateMovementVector();
        let newPos = gm.calculateNextPosition(oldPos, unitVector, Config.PLAYER_BASE_SPEED);
        if (this.checkCollision(newPos, 30)) {
            newPos = oldPos;
        }

        this.setMyPlayerPosition(newPos);

        let rotation = this.controller.calculateRotation(this.ground2ScenePosition(newPos));
        let degRotation = Math.round(gm.radToDeg(rotation));
        this.myPlayer.setPlayerRotation(degRotation);

        if (oldPos.x !== newPos.x || oldPos.y !== newPos.y || match.myPlayer.rotation !== rotation) {
            match.updateMyPlayerMove(gm.vector(newPos.x - oldPos.x, newPos.y - oldPos.y), rotation);
        }

        let isAttack = this.controller.checkAttacking();
        if (isAttack && this._cooldownAttack <= 0) {
            this.myPlayerAttack(this.controller.getDestPosition());
            if (this.myPlayer.isEquip()) this._cooldownAttack = Config.COOLDOWN_FIRE;
            else this._cooldownAttack = Config.COOLDOWN_ATTACK;
        }

        if (this._cooldownAttack > 0) this._cooldownAttack -= dt;

        for (let i = 0; i < this.workingBullets.length; i++) {
            let bullet = this.workingBullets[i];
            if (this.checkCollision(bullet.getPosition())) {
                this.workingBullets.splice(i, 1);
                i--;
                bullet.setVisible(false);
            }
            else bullet.updateBullet(dt);
        }
    },

    checkCollision: function (pos = gm.p(0, 0), radius = 0) {
        let match = GameManager.getInstance().getCurrentMatch();
        if (pos.x - radius < 0 || pos.x + radius > match.mapWidth || pos.y - radius < 0 || pos.y + radius > match.mapHeight) return true;
        for (let obs of match.obstacles) {
            if (gm.checkCollisionCircleCircle(pos, obs.position, radius, obs.radius)) return true;
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
        // fake
        if (this.myPlayer.isEquip()) this.myPlayer.unEquip();
        else this.myPlayer.equipGun();

        let match = GameManager.getInstance().getCurrentMatch();
        match.updateMyPlayerWeapon(this.myPlayer.isEquip() ? 1 : 0);
    },

    myPlayerAttack: function (destPos = gm.p(0, 0)) {
        destPos = this.scene2GroundPosition(destPos);
        if (this.myPlayer.isEquip()) {
            let vector = gm.vector(destPos.x - this.myPlayer.x, destPos.y - this.myPlayer.y);
            this.fire(this.myPlayer.getPosition(), vector);
        }
        else {
            this.myPlayer.animAttack();
        }

        GameClient.getInstance().sendEmptyPacket(Cmd.PLAYER_ATTACK);
    },

    playerChangeWeapon: function (username, weaponId) {
        let playerUI = this.playerUIs[username];
        if (playerUI) {
            if (weaponId) playerUI.equipGun();
            else playerUI.unEquip();
        }
    },

    playerAttack: function (username, weaponId, direction) {
        let playerUI = this.playerUIs[username];
        if (playerUI) {
            playerUI.equipGun();
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

            let spr = new cc.Sprite("res/Game/Player/dead_blood.png");
            this.ground.addChild(spr, MatchScene.Z_ORDER.BG);
            spr.setPosition(playerUI.getPosition());
            spr.runAction(cc.sequence(
                cc.spawn(
                    cc.moveTo(1, 0, -30).easing(cc.easeOut(2)),
                    cc.sequence(
                        cc.delayTime(0.7),
                        cc.fadeOut(0.3)
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
    }
});

MatchScene.className = "MatchScene";

MatchScene.Z_ORDER = {
    BG: 0,
    PLAYER: 1,
    BULLET: 2,
    OBSTACLE: 3
}