import Util, {EzyGuid, EzyLogger} from './ezy-util';
import Entity, {EzyApp, EzyUser, EzyZone} from './ezy-entities';
import Const from './ezy-constants';
import Config from './ezy-configs';
import EventHandler, {
    EzyConnectionFailureHandler,
    EzyConnectionSuccessHandler,
    EzyDisconnectionHandler
} from './ezy-event-handlers';
import DataHandler, {
    EzyAppAccessHandler,
    EzyAppExitHandler, EzyAppResponseHandler,
    EzyHandshakeHandler, EzyLoginErrorHandler, EzyLoginSuccessHandler,
    EzyPluginInfoHandler, EzyPluginResponseHandler,
    EzyPongHandler
} from './ezy-data-handlers';
import EzyClient from './ezy-client';
import EzyClients from './ezy-clients';

let Ezy: {
    App: EzyApp; AppExitHandler: EzyAppExitHandler; User: EzyUser; EventType: { DISCONNECTION: string; LOST_PING: string; CONNECTION_FAILURE: string; TRY_CONNECT: string; CONNECTION_SUCCESS: string }; PongHandler: EzyPongHandler; DisconnectReasonNames: any; Guid: EzyGuid; Logger: EzyLogger; PluginInfoHandler: EzyPluginInfoHandler; ConnectionSuccessHandler: EzyConnectionSuccessHandler; HandshakeHandler: EzyHandshakeHandler; AppResponseHandler: EzyAppResponseHandler; ConnectionFailureHandler: EzyConnectionFailureHandler; DisconnectReason: { NOT_LOGGED_IN: number; SERVER_ERROR: number; UNAUTHORIZED: number; IDLE: number; ADMIN_BAN: number; ANOTHER_SESSION_LOGIN: number; ADMIN_KICK: number; CLOSE: number; UNKNOWN: number; MAX_REQUEST_PER_SECOND: number; MAX_REQUEST_SIZE: number; SERVER_NOT_RESPONDING: number }; LoginErrorHandler: EzyLoginErrorHandler; Commands: any; ConnectionStatus: { RECONNECTING: string; NULL: string; DISCONNECTED: string; CONNECTING: string; CONNECTED: string; FAILURE: string }; ClientConfig: EzyClientConfig; DisconnectionHandler: EzyDisconnectionHandler; PluginResponseHandler: EzyPluginResponseHandler; Client: EzyClient; AppAccessHandler: EzyAppAccessHandler; Zone: EzyZone; LoginSuccessHandler: EzyLoginSuccessHandler; Clients: EzyClients; Command: { APP_REQUEST: { name: string; id: number }; LOGOUT: { name: string; id: number }; APP_EXIT: { name: string; id: number }; LOGIN_ERROR: { name: string; id: number }; APP_REQUEST_ERROR: { name: string; id: number }; PLUGIN_REQUEST: { name: string; id: number }; APP_ACCESS: { name: string; id: number }; APP_ACCESS_ERROR: { name: string; id: number }; PLUGIN_INFO: { name: string; id: number }; PING: { name: string; id: number }; HANDSHAKE: { name: string; id: number }; ERROR: { name: string; id: number }; LOGIN: { name: string; id: number }; DISCONNECT: { name: string; id: number }; PONG: { name: string; id: number } }; ConnectionFailedReason: { CONNECTION_REFUSED: string; UNKNOWN_HOST: string; NETWORK_UNREACHABLE: string; UNKNOWN: string }
};
Ezy = {
    Guid: Util.EzyGuid,
    Logger: Util.EzyLogger,
    App: Entity.EzyApp,
    User: Entity.EzyUser,
    Zone: Entity.EzyZone,
    Command: Const.EzyCommand,
    Commands: Const.EzyCommands,
    DisconnectReason: Const.EzyDisconnectReason,
    DisconnectReasonNames: Const.EzyDisconnectReasonNames,
    ConnectionFailedReason: Const.EzyConnectionFailedReason,
    ConnectionStatus: Const.EzyConnectionStatus,
    EventType: Const.EzyEventType,
    ClientConfig: Config.EzyClientConfig,
    ConnectionSuccessHandler: EventHandler.EzyConnectionSuccessHandler,
    ConnectionFailureHandler: EventHandler.EzyConnectionFailureHandler,
    DisconnectionHandler: EventHandler.EzyDisconnectionHandler,
    HandshakeHandler: DataHandler.EzyHandshakeHandler,
    LoginSuccessHandler: DataHandler.EzyLoginSuccessHandler,
    LoginErrorHandler: DataHandler.EzyLoginErrorHandler,
    AppAccessHandler: DataHandler.EzyAppAccessHandler,
    AppExitHandler: DataHandler.EzyAppExitHandler,
    AppResponseHandler: DataHandler.EzyAppResponseHandler,
    PluginInfoHandler: DataHandler.EzyPluginInfoHandler,
    PluginResponseHandler: DataHandler.EzyPluginResponseHandler,
    PongHandler: DataHandler.EzyPongHandler,
    Client: EzyClient,
    Clients: EzyClients,
};

export default Ezy;
