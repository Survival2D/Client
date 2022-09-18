/**
 * Created by quantm7 on 9/18/2022.
 */

var UserData = cc.Class.extend({
    ctor: function () {
        this.username = "";
    },

    setUserData: function (username) {
        this.username = username;
    }
})