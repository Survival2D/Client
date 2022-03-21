export interface JoinMatchData {
  matchId: string;
}

//TODO: define struct data

export interface Position {
  x: number;
  y: number;
}

export interface TestData {
  userID: string;
  id: number;
  position: Position;
  str: string;
  obj: object;
}
