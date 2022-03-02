import Vector2 = sp.spine.Vector2;

class MapData {
    readonly MenuName = "NinjaBattle/MapData";

    public width: number;
    public height: number;
    public walls: Vector2[] = [];
    public jumpables: Vector2[] = [];
    public spawnPoints: Vector2[] = [];
    public minimumPlayers: number;
    public maximumPlayers: number;
}
