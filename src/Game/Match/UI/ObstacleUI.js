/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleUI = ccui.ImageView.extend({
    ctor: function (path, textureType) {
        this._super(path, textureType);
        this._obstacleId = 0;
        this.ignoreContentAdaptWithSize(false);

        this.setCascadeOpacityEnabled(false);

        this._brokenPieces = [];
    },

    setObstacleId: function (id) {
        this._obstacleId = id;
    },

    getObstacleId: function () {
        return this._obstacleId;
    },

    createResidue: function () {

    },

    createBrokenPiece: function () {
        for (let piece of this._brokenPieces) {
            if (!piece.isVisible()) return piece;
        }

        let piece = new ccui.ImageView("res/ui/Game/Player/circle.png");
        piece.ignoreContentAdaptWithSize(false);
        piece.setColor(this.getPieceColor());
        piece.setContentSize(15, 15);
        this.addChild(piece);
        this._brokenPieces.push(piece);

        return piece;
    },

    /**
     * @return {cc.Color}
     */
    getPieceColor: function () {

    },

    animTakeDamage: function (hpRatio) {
        if (!hpRatio) hpRatio = 1;
        this.stopAllActions();
        this.runAction(cc.scaleTo(0.3, 0.5 + hpRatio * 0.5).easing(cc.easeBackInOut()));

        let piece = this.createBrokenPiece();
        piece.setVisible(true);
        piece.setPosition(this.width/4 + Math.random() * this.width/2, this.height/4 + Math.random() * this.height/2);
        piece.setScale(0);
        piece.setOpacity(255);
        let randX = (10 + Math.random() * 20) * (Math.random() > 0.5 ? 1: -1);
        let randY = (10 + Math.random() * 20) * (Math.random() > 0.5 ? 1: -1);
        piece.stopAllActions();
        piece.runAction(cc.sequence(
            cc.spawn(
                cc.moveBy(0.7, randX, randY).easing(cc.easeSineOut()),
                cc.scaleTo(0.7, 1 + Math.random() * 0.5),
                cc.sequence(
                    cc.delayTime(0.2),
                    cc.fadeOut(0.5)
                )
            ),
            cc.hide()
        ))
    },

    animDestroyed: function () {
        let residue = this.createResidue();
        if (!residue) return;
        residue.setVisible(true);
        residue.setPosition(this.width/2, this.height/2);
        residue.stopAllActions();
        residue.setOpacity(0);
        residue.runAction(cc.sequence(
            cc.fadeIn(0.4),
            cc.delayTime(1),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.removeFromParent(true);
            })
        ));

        this.stopAllActions();
        this.runAction(cc.fadeOut(0.3));
    }
});

const TreeUI = ObstacleUI.extend({
    ctor: function () {
        this._super("Obstacle/tree.png", ccui.Widget.PLIST_TEXTURE);
        this.setContentSize(Config.TREE_RADIUS * 6, Config.TREE_RADIUS * 6);
    },

    createResidue: function () {
        let residue = new ccui.ImageView("Obstacle/tree_residue.png", ccui.Widget.PLIST_TEXTURE);
        residue.ignoreContentAdaptWithSize(false);
        this.addChild(residue, -1);

        return residue;
    },

    getPieceColor: function () {
        return cc.color("#439203");
    }
});

const CrateUI = ObstacleUI.extend({
    ctor: function () {
        this._super("Obstacle/crate.png", ccui.Widget.PLIST_TEXTURE);
        this.setContentSize(Config.CRATE_WIDTH, Config.CRATE_HEIGHT);
    },

    setPosition: function (position, y) {
        let realX, realY;
        if (y === undefined) {
            realX = position.x;
            realY = position.y
        }
        else {
            realX = position;
            realY = y;
        }

        realX += this.width/2;
        realY += this.height/2;

        this._super(realX, realY);
    },

    createResidue: function () {
        let residue = new ccui.ImageView("Obstacle/crate_residue.png", ccui.Widget.PLIST_TEXTURE);
        residue.ignoreContentAdaptWithSize(false);
        residue.setContentSize(this.width, this.height);
        this.addChild(residue, -1);

        return residue;
    },

    getPieceColor: function () {
        return cc.color("#7D4311");
    }
});

const StoneUI = ObstacleUI.extend({
    ctor: function () {
        if (Math.random() > 0.5) this._super("Obstacle/stone_1.png", ccui.Widget.PLIST_TEXTURE);
        else this._super("Obstacle/stone_2.png", ccui.Widget.PLIST_TEXTURE);
        this.setContentSize(Config.STONE_RADIUS * 2, Config.STONE_RADIUS * 2);
    },

    getPieceColor: function () {
        return cc.color("#8F8F8F");
    }
});

const WallUI = ObstacleUI.extend({
    ctor: function () {
        this._super("Obstacle/wall.png", ccui.Widget.PLIST_TEXTURE);
        this.setContentSize(Config.WALL_WIDTH - 2, Config.WALL_HEIGHT - 2);

        // let border = new ccui.Layout();
        // border.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        // border.setBackGroundColor(cc.color("#000000"));
        // border.setContentSize(Config.WALL_WIDTH, Config.WALL_HEIGHT);
        // this.addChild(border, -1);
        // border.setAnchorPoint(0.5, 0.5);
        // border.setPosition(this.width/2, this.height/2);
    },

    setPosition: function (position, y) {
        let realX, realY;
        if (y === undefined) {
            realX = position.x;
            realY = position.y
        }
        else {
            realX = position;
            realY = y;
        }

        realX += Config.WALL_WIDTH/2;
        realY += Config.WALL_HEIGHT/2;

        this._super(realX, realY);
    },

    animTakeDamage: function (hpRatio) {

    },
});
