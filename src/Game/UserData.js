/**
 * Created by quantm7 on 9/18/2022.
 */

var UserData = cc.Class.extend({
    ctor: function () {
        this.uid = 0;
        this.username = "-1";
    },

    setUserData: function (uid, username) {
        this.uid = uid;
        this.username = username;
    }
})