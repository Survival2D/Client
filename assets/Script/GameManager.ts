import {Client} from "@heroiclabs/nakama-js";
import {RpcResponse} from "@heroiclabs/nakama-js/client";

const {ccclass, property} = cc._decorator;

enum TienTestError {
    SUCCESS,
    UNKNOWN
}

interface TienTestReq {
    userId: string;
    time: number;
}

interface TienTestRes {
    error: TienTestError;
    result: string;
}

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

        try {
            let payload: TienTestReq = {
                time: new Date().getTime(), userId: session.user_id
            }
            console.log("Get here!")
            let response: RpcResponse = await this.client.rpc(session, "tien_test", payload);
            switch (response.id) {

            }
            let result: TienTestRes = response.payload as TienTestRes;
            console.log("Response: ", result.error, result.result);

            this.client.listMatches()
        } catch (error) {
            console.log("Error: %o", error.message);
        }
    }

    start() {
    }

    update(dt) {
    }
}
