/**
 * Created by quantm7 on 9/11/2022.
 */

/**
 * @class OutPacket
 * @property {Number} cmdId
 * @property {Object} data - json object
 */
var OutPacket = cc.Class.extend({
    ctor: function (id) {
        this.cmdId = id;
        this.data = null;
    },

    setCmdId: function (id) {
        this.cmdId = id;
    },

    putData: function (data) {
        this.data = data;
    },

    send: function () {
        GameClient.getInstance().sendPacket(this);
    }
});