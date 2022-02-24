// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    isUp: boolean = false;
    isDown: boolean = false;
    isLeft: boolean = false;
    isRight: boolean = false;


    @property
    vel: number = 100;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.isLeft = true;
                break;
            case cc.macro.KEY.s:
                this.isDown = true;
                break;
            case cc.macro.KEY.d:
                this.isRight = true;
                break;
            case cc.macro.KEY.w:
                this.isUp = true;
                break;
        }
    }

    onKeyUp (event) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this.isLeft = false;
                break;
            case cc.macro.KEY.s:
                this.isDown = false;
                break;
            case cc.macro.KEY.d:
                this.isRight = false;
                break;
            case cc.macro.KEY.w:
                this.isUp = false;
                break;
        }
    }

    update (dt) {
        if (this.isLeft && this.isUp) {
            this.node.x -= this.vel/1.4 * dt;
            this.node.y += this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isDown) {
            this.node.x -= this.vel/1.4 * dt;
            this.node.y -= this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isUp) {
            this.node.x += this.vel/1.4 * dt;
            this.node.y += this.vel/1.4 * dt;
        }
        else if (this.isRight && this.isDown) {
            this.node.x += this.vel/1.4 * dt;
            this.node.y -= this.vel/1.4 * dt;
        }
        else if (this.isLeft && this.isRight) {}
        else if (this.isUp && this.isDown) {}
        else if (this.isLeft) this.node.x -= this.vel * dt;
        else if (this.isRight) this.node.x += this.vel * dt;
        else if (this.isUp) this.node.y += this.vel * dt;
        else if (this.isDown) this.node.y -= this.vel * dt;
    }

    onDestroy () {
        // Cancel keyboard input monitoring
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
}
