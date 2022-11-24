/**
 * Created by quantm7 on 8/7/2022.
 */

const BaseLayer = cc.Layer.extend({
    ctor: function (id) {
        this._super();

        this._id = id;

        this._layout = null;
    },

    checkLayerId: function (id) {
        return this._id === id;
    },

    onEnter: function () {
        this._super();
        this.setContentSize(cc.winSize);
        this.setAnchorPoint(0.5,0.5);

        this.effectIn();
    },

    /**
     * @abstract
     */
    effectIn: function () {

    },

    onExit: function () {
        this._super();
    },

    loadCss: function (json) {
        let jsonLayout = ccs.load(json);
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
        let p = null;
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
        let control = ccui.helper.seekWidgetByName(p,cName);
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
        let btn = this.getControl(name, parent);
        if(!btn) return null;
        btn.setPressedActionEnabled(true);
        if (target === undefined) target = this;
        btn.addTouchEventListener(function (sender, type) {
            if (type === ccui.Widget.TOUCH_ENDED) {
                listener.call(target);
            }
        }, this);
        return btn;
    },

    customTextLabel: function (name, parent, fontName, fontSize) {
        let text = this.getControl(name, parent);
        if (!text) return null;
        text.ignoreContentAdaptWithSize(true);
        if (fontName) text.setFontName(fontName);
        if (fontSize) text.setFontName(fontSize);
        return text;
    }
})
