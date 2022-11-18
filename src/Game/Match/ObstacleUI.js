/**
 * Created by quantm7 on 10/9/2022.
 */

const ObstacleUI = ccui.ImageView.extend({
    ctor: function (path, textureType) {
        this._super(path, textureType);
        this._obstacleId = 0;
        this.ignoreContentAdaptWithSize(false);

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

        let piece = new ccui.ImageView("res/Game/Player/circle.png");
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
        residue.setVisible(true);
        residue.stopAllActions();
        residue.setOpacity(0);
        residue.runAction(cc.sequence(
            cc.fadeIn(0.4),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.removeFromParent(true);
            })
        ));
    }
});

const TreeUI = ObstacleUI.extend({
    ctor: function () {
        this._super("res/Game/Obstacle/tree.png", ccui.Widget.LOCAL_TEXTURE);
    },

    createResidue: function () {
        let residue = new ccui.ImageView("res/Game/Obstacle/tree_residue.png");
        residue.ignoreContentAdaptWithSize(false);
        this.addChild(residue);

        return residue;
    },

    getPieceColor: function () {
        return cc.color("#439203");
    }
});

const CrateUI = ObstacleUI.extend({
    ctor: function () {
        this._super("res/Game/Obstacle/crate.png", ccui.Widget.LOCAL_TEXTURE);
    },

    createResidue: function () {
        let residue = new ccui.ImageView("res/Game/Obstacle/crate_residue.png");
        residue.ignoreContentAdaptWithSize(false);
        residue.setContentSize(this.width, this.height);
        this.addChild(residue);

        return residue;
    },

    getPieceColor: function () {
        return cc.color("#7D4311");
    }
});
