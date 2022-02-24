import {Presence} from "@heroiclabs/nakama-js/socket";

class UserPresence implements Presence {
    persistence: string;
    status: string;
    username: string;
    session_id: string;
    user_id: string;
    node: string;


    public UserPresence(persistence: string, session_id: string, status: string, username: string, user_id: string) {
        this.persistence = persistence;
        this.session_id = session_id;
        this.status = status;
        this.username = username;
        this.user_id = user_id;
    }
}
