enum Direction {
    North,
    West,
    East,
    South
}

class DirectionMethods {
    public static toVector2(direction: Direction): Vector2 {
        switch (direction) {
            case Direction.North:
                return new Vector2(0, 1);
            case Direction.West:
                return new Vector2(-1, 0);
            case Direction.East:
                return new Vector2(1, 0);
            case Direction.South:
                return new Vector2(0, -1);
            default:
                return new Vector2(0, 0);
        }
    }

    public static opposite(direction: Direction): Direction {
        switch (direction) {
            case Direction.North:
                return Direction.South;
            case Direction.West:
                return Direction.East;
            case Direction.East:
                return Direction.West;
            case Direction.South:
                return Direction.North;
            default:
                return Direction.West;
        }
    }
}
