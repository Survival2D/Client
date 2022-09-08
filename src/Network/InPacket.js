/**
 * Created by quantm7 on 9/8/2022.
 */

var InPacket = cc.Class.extend({
    ctor: function () {

    },

    parseData: function (data) {
        for (var key in this) {
            if (data[key]) this[key] = data[key];
        }
    }
});