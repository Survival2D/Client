/**
 * Created by quantm7 on 11/16/2022.
 */

const MapObjectData = cc.Class.extend({
    ctor: function () {
        this._objectId = 0;
        this.position = gm.p(0, 0);
    },

    setObjectId: function (id) {
        this._objectId = id;
    },

    getObjectId: function () {
        return this._objectId;
    },
});