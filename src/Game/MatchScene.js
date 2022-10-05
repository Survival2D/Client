/**
 * Created by quantm7 on 9/10/2022.
 */

var MatchScene = BaseLayer.extend({
    ctor: function () {
        this._super(MatchScene.className);
        this.loadCss(res.MATCH_SCENE);
        this.controller = new Controller();
        this.initKeyBoardController();
        this.initMouseController();

        this.playerUIs = [];
        this.bullets = [];
        this.workingBullets = [];
    },

    initGUI: function () {
        this.ground = this.getControl("ground");

        this.myPlayer = new PlayerUI();
        this.ground.addChild(this.myPlayer, MatchScene.Z_ORDER.PLAYER);
        this.myPlayer.setPosition(0, 0);
        this.myPlayer.setMyPlayer(true);
        this.myPlayer.unEquip();
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

        for (let playerId in match.players) {
            let player = match.players[playerId];
            if (player.playerId === GameManager.getInstance().userData.username) continue;
            let playerUI = this.playerUIs[player.playerId];
            if (!playerUI) {
                playerUI = new PlayerUI();
                this.ground.addChild(playerUI, MatchScene.Z_ORDER.PLAYER);
                playerUI.unEquip();
                this.playerUIs[player.playerId] = playerUI;
            }
            playerUI.setPosition(player.position);
            playerUI.setPlayerRotation(player.rotation);
            playerUI.setPlayerUIInfo(player.username);
        }
    },

    update: function (dt) {
        let oldPos = this.myPlayer.getPosition();
        let unitVector = this.controller.calculateMovementVector();
        let newPos = gm.calculateNextPosition(oldPos, unitVector, Config.PLAYER_BASE_SPEED);
        this.setMyPlayerPosition(newPos);

        let oldRotation = this.myPlayer.getPlayerRotation();
        let rotation = this.controller.calculateRotation(this.ground2ScenePosition(newPos));
        rotation = Math.round(gm.radToDeg(rotation));
        this.myPlayer.setPlayerRotation(rotation);

        if (oldPos.x !== newPos.x || oldPos.y !== newPos.y || oldRotation !== rotation) {
            let pk = new SendPlayerMoveAction(unitVector, rotation);
            GameClient.getInstance().sendPacket(pk);
        }

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

    checkCollision: function (pos = gm.p(0, 0)) {
        let match = GameManager.getInstance().getCurrentMatch();
        if (pos.x < 0 || pos.x > match.mapWidth || pos.y < 0 || pos.y > match.mapHeight) return true;
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
    },

    pickItem: function () {
        if (this.myPlayer.isEquip()) this.myPlayer.unEquip();
        else this.myPlayer.equipGun();
    },

    fire: function (destPos = gm.p(0, 0)) {
        destPos = this.scene2GroundPosition(destPos);
        if (this.myPlayer.isEquip()) {
            let bullet = this.getBulletFromPool();
            this.workingBullets.push(bullet);
            bullet.setPosition(this.myPlayer.getPosition());
            let vector = gm.vector(destPos.x - this.myPlayer.x, destPos.y - this.myPlayer.y);
            bullet.setMoveDirection(vector);
            bullet.animFire();
        }
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
    BULLET: 2
}