import {Client} from "@heroiclabs/nakama-js";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property
    client: Client = new Client("defaultkey");

    onLoad() {
        this.connect();
    }

    async connect() {
        this.client = new Client("defaultkey");

        console.info(this.client);

        const email = "hello@example.com";
        const password = "somesupersecretpassword";
        const session = await this.client.authenticateEmail(email, password);

        localStorage.nakamaAuthToken = session.token;

        console.info("Authenticated successfully. User id:", session.user_id);
    }

    start() {

    }

    update(dt) {
    }
}
