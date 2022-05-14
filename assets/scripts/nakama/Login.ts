import { _decorator, Component, Node, EditBox, Button, logID } from 'cc';
import nk from "@heroiclabs/nakama-js";
import v4 from 'uuid';
// Hoặc dùng
// import nk from './ImportUtil';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    @property({type: EditBox})
    userid

    @property({type:Button})
    button

    start() {
        this.button.node.on(Button.EventType.CLICK, this.login, this);
    }

    async login(button: Button) {
        let userId = this.userid.node.string;
        console.log(0, userId);
        var useSSL = false; // Enable if server is run with an SSL certificate.
        var client = new nk.Client("defaultkey", "127.0.0.1", "7350", useSSL);
        var email = "test@email.com";
        var password = "password";
        const session = await client.authenticateEmail(email, password);
        console.log(0, session);
    }

    update(deltaTime: number) {
        
    }
}
