/**
 * Created by quantm7 on 10/15/2022.
 */

const MiniMap = ccui.Layout.extend({
    ctor: function () {
        this._super();

        this.setContentSize(cc.winSize.width / 4, cc.winSize.height / 4);

        this.miniObstacleUIs = [];

        let jsonLayout = ccs.load(game_UIs.MINIMAP_LAYER);
        this._layout = jsonLayout.node;
        this._action = jsonLayout.action;
        this._layout.setContentSize(cc.director.getWinSize());
        ccui.helper.doLayout(this._layout);
        this.addChild(this._layout);
        this._layout.setPosition(0, 0);

        this.initGUI();
    },

    initGUI: function () {
        this.ground = ccui.helper.seekWidgetByName(this._layout, "ground");

        this.ground.setScale(Config.MINI_MAP_SCALE);

        this.myPlayer = new MiniPlayerUI();
        this.ground.addChild(this.myPlayer, 1);
        this.myPlayer.setPosition(30, 30);

        this.setClippingEnabled(true);

        let drawNode = new cc.DrawNode();
        drawNode.drawRect(cc.p(0, 0), cc.p(this.width, this.height), cc.color(0, 0, 0, 0), 4, cc.color(0, 0, 0, 255));
        this.addChild(drawNode);

        this.bg = ccui.helper.seekWidgetByName(this._layout, "bg");
    },

    updateMiniMapView: function () {
        let match = GameManager.getInstance().getCurrentMatch();
        if (!match) return;

        this.ground.setContentSize(match.mapWidth, match.mapHeight);

        for (let obsUI of this.miniObstacleUIs) {
            obsUI.removeFromParent(true);
        }
        this.miniObstacleUIs = [];

        for (let obs of match.obstacles) {
            let obsUI;
            if (obs instanceof TreeData) obsUI = new TreeUI();
            if (obs instanceof CrateData) obsUI = new CrateUI();
            if (obs instanceof StoneData) obsUI = new StoneUI();
            if (obs instanceof WallData) obsUI = new WallUI();
            this.ground.addChild(obsUI, MatchScene.Z_ORDER.OBSTACLE);
            obsUI.setPosition(obs.position);
            obsUI.setObstacleId(obs.getObjectId());
            this.miniObstacleUIs.push(obsUI);
        }
    },

    setMyPlayerPosition: function (pos) {
        this.myPlayer.setPosition(pos);
        let scenePos = this.ground2ScenePosition(pos);
        this.ground.setPosition(this.ground.x + this.width/2 - scenePos.x, this.ground.y + this.height/2 - scenePos.y);
    },

    ground2ScenePosition: function (pos) {
        let worldPos = this.ground.convertToWorldSpace(pos);
        return this.convertToNodeSpace(worldPos);
    },

    scene2GroundPosition: function (pos) {
        let worldPos = this.convertToWorldSpace(pos);
        return this.ground.convertToNodeSpace(worldPos);
    },

    /**
     * @param {number} obstacleId
     * @return {null|ObstacleUI}
     */
    getObstacleUIAndRemoveById: function (obstacleId) {
        for (let i = 0; i < this.miniObstacleUIs.length; i++) {
            let obsUI = this.miniObstacleUIs[i];
            if (obsUI.getObstacleId() === obstacleId) {
                this.miniObstacleUIs.splice(i, 1);
                return obsUI;
            }
        }

        return null;
    },

    obstacleDestroyed: function (obstacleId) {
        let obsUI = this.getObstacleUIAndRemoveById(obstacleId);
        if (obsUI) {
            obsUI.removeFromParent(true);
        }
    },
})