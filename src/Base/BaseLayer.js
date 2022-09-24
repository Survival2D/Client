/**
 * Created by quantm7 on 8/7/2022.
 */

var BaseLayer = cc.Layer.extend({
    ctor: function (id) {
        this._super();

        this._id = id;

        this._layout = null;
    },

    onEnter: function () {
        this._super();
        this.setContentSize(cc.winSize);
        this.setAnchorPoint(0.5,0.5);
    },

    onExit: function () {
        this._super();
    },

    loadCss: function (json) {
        var jsonLayout = ccs.load("res/ui/" + json);
        this._layout = jsonLayout.node;
        this._action = jsonLayout.action;
        this._layout.setContentSize(cc.director.getWinSize());
        ccui.helper.doLayout(this._layout);
        this.addChild(this._layout);

        this.initGUI();
    },

    /**
     * @abstract
     */
    initGUI: function () {},

    getControl: function (cName,parent) {
        var p = null;
        if(typeof  parent === 'undefined')
        {
            p = this._layout;
        }
        else if(typeof parent === 'string')
        {
            p = ccui.helper.seekWidgetByName(this._layout, parent);
        }
        else
        {
            p = parent;
        }

        if(p == null)
        {
            cc.log("### getControl error parent " + cName);
            return null;
        }
        var control = ccui.helper.seekWidgetByName(p,cName);
        if (control == null) control = p.getChildByName(cName);
        if(control == null)
        {
            cc.log("### getControl error control " + cName);
            return null;
        }

        control.defaultPosition = control.getPosition();

        return control;
    },

    customButton: function (name, listener, target, parent) {
        var btn = this.getControl(name, parent);
        if(!btn) return null;
        btn.setPressedActionEnabled(true);
        if (target === undefined) target = this;
        btn.addTouchEventListener(function (sender, type) {
            if (type === ccui.Widget.TOUCH_ENDED) {
                listener.call(target);
            }
        }, this);
        return btn;
    }
})
