/**
 * Created by quantm7 on 9/11/2022.
 */

var PlayerUI = cc.Node.extend({
    ctor: function () {
        this._super();
        this.initPlayerUI();
    },

    initPlayerUI: function () {
        var drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 30, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 30, 0, 10000, false, 3, cc.color("#000000"));
        this.addChild(drawNode);
        this._body = drawNode;

        drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 10, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 10, 0, 10000, false, 3, cc.color("#000000"));
        this._body.addChild(drawNode);
        drawNode.setPosition(-20, 25);
        this._leftArm = drawNode;

        drawNode = new cc.DrawNode();
        drawNode.drawDot(cc.p(0, 0), 10, cc.color("#f8c574"));
        drawNode.drawCircle(cc.p(0, 0), 10, 0, 10000, false, 3, cc.color("#000000"));
        this._body.addChild(drawNode);
        drawNode.setPosition(20, 25);
        this._rightArm = drawNode;


        var lbl = new ccui.Text("Name");
        lbl.setFontSize(22);
        this.addChild(lbl);
        lbl.setPosition(0, 45);
        this._name = lbl;
    },

    setPlayerUIInfo: function (name) {
        this._name.setString(name);
    },

    setMyPlayer: function (isMyPlayer = true) {
        if (isMyPlayer) {

        }
        else {

        }
    }
})