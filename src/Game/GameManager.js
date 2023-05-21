/**
 * Created by quantm7 on 9/11/2022.
 */

const GameManager = cc.Class.extend({
  ctor: function () {
    this.userData = new UserData();
    this.match = null;

    GameManager.preloadResources();
  },

  findMatch: function () {
    let builder = new flatbuffers.Builder(0);
    let findMatchRequest = fbs.FindMatchRequest.createFindMatchRequest(builder);
    let request = fbs.Request.createRequest(builder,
        fbs.RequestUnion.FindMatchRequest, findMatchRequest);
    builder.finish(request);
    fbsClient.sendBinary(builder.asUint8Array());
  },

  joinTeam: function (teamId = 0) {
    let builder = new flatbuffers.Builder(0);
    let joinTeamRequest = fbs.JoinTeamRequest.createJoinTeamRequest(builder,
        teamId);
    let request = fbs.Request.createRequest(builder,
        fbs.RequestUnion.JoinTeamRequest, joinTeamRequest);
    builder.finish(request);
    fbsClient.sendBinary(builder.asUint8Array());
  },

  createTeam: function () {
    let builder = new flatbuffers.Builder(0);
    let createTeamRequest = fbs.CreateTeamRequest.createCreateTeamRequest(builder);
    let request = fbs.Request.createRequest(builder,
        fbs.RequestUnion.CreateTeamRequest, createTeamRequest);
    builder.finish(request);
    fbsClient.sendBinary(builder.asUint8Array());
  },

  findMatchWithTeam: function () {

  },

  onReceivedFindMatch: function (matchId) {
    this.match = new MatchManager();
    this.match.newMatch(matchId);
  },

  onReceivedCreateTeam: function (teamId) {
    SceneManager.getInstance().openLobbyScene();
  },

  onReceivedJoinTeam: function (teamId) {
    SceneManager.getInstance().openLobbyScene();
  },

  /**
   * @returns {null|MatchManager}
   */
  getCurrentMatch: function () {
    return this.match;
  },

  startPing: function () {
    this._pingTime = Date.now();
    //TODO: start ping pong
  },

  receivedPong: function () {
    let time = Date.now();
    let oldTime = this._pingTime || 0;
    let ping = time - oldTime;
    // cc.log("--- PING: " + ping + "ms");

    setTimeout(this.startPing.bind(this), 1000);
  }
});

/**
 * @returns {GameManager}
 */
GameManager.getInstance = function () {
  if (!this._instance) {
    this._instance = new GameManager();
  }
  return this._instance;
};

/**
 * @returns {GameManager}
 */
GameManager.newInstance = function () {
  this._instance = new GameManager();
  return this._instance;
};

GameManager.preloadResources = function () {
  // for (var i in game_images) {
  //     cc.textureCache.addImage(game_images[i]);
  // }

  cc.spriteFrameCache.addSpriteFrames("res/ui/Game/game_art.plist",
      "res/ui/Game/game_art.png");
};
