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

    loadCss: function (json) {
        var jsonLayout = ccs.load("res/ui/" + json);
        this._layout = jsonLayout.node;
        this._action = jsonLayout.action;
        this._layout.setContentSize(cc.director.getWinSize());
        ccui.Helper.doLayout(this._layout);
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
            p = ccui.Helper.seekWidgetByName(this._layout, parent);
        }
        else
        {
            p = parent;
        }

        if(p == null)
        {
            cc.log("###################### getControl error parent " + cName);
            return null;
        }
        var control = ccui.Helper.seekWidgetByName(p,cName);
        if (control == null) control = p.getChildByName(cName);
        if(control == null)
        {
            cc.log("###################### getControl error control " + cName);
            return null;
        }

        control.defaultPosition = control.getPosition();

        return control;
    },

    customButton: function (name, tag, parent, action) {
        if(action === undefined)
            action = true;

        var btn = this.getControl(name, parent);
        if(!btn) return null;
        btn.setPressedActionEnabled(action);
        btn.setTag(tag);
        btn.addTouchEventListener(this.onTouchEventHandler, this);
        return btn;
    },

    onTouchEventHandler: function(sender,type){
        switch (type){
            case ccui.Widget.TOUCH_BEGAN:
                this.onButtonTouched(sender,sender.getTag());
                break;
            case ccui.Widget.TOUCH_ENDED:
                this.onButtonRelease(sender, sender.getTag());
                break;
            case ccui.Widget.TOUCH_CANCELED:
                this.onButtonCanceled(sender, sender.getTag());
                break;
        }
    },

    /**
     * @abstract
     */
    onButtonRelease: function(button,id){},

    /**
     * @abstract
     */
    onButtonTouched: function(button,id){},

    /**
     * @abstract
     */
    onButtonCanceled: function(button,id){},
})