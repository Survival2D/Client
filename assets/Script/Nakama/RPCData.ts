export interface JoinMatchData {
  matchId: string;
}

//TODO: define struct data

export interface NewPlayerJoin {
  userID: string;
  // x: number;
  // y: number;
}

export interface PlayerPosition {
  userID: string;
  x: number;
  y: number;
}

export interface BulletFire {
  userID: string;
  x: number;
  y: number;
  angle: number;
}