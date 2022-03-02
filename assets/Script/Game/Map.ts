import Vector2 = sp.spine.Vector2;

class Map
    {
      private  hazardPrefab:Hazard = null;
        private  waterPrefab:GameObject = null;
       private  wallPrefab:GameObject = null;
         private  ninjaPrefab:Ninja = null;
         private  gameCamera:GameCamera = null;

        private  mapWallTiles:Vector2[] = [];
        private  mapDangerousTiles:Vector2[] = [];
        private  ninjaDangerousTiles:Vector2[] = [];


        public ninjas:Ninja[]=[];


        public void Initialize(MapData mapData, List<PlayerData> players)
        {
            int halfWidth = mapData.Width / 2;
            int halfHeight = mapData.Height / 2;
            for (int x = -halfWidth; x <= halfWidth; x++)
            {
                SetTileAsWall(new Vector2Int(x, halfHeight));
                SetTileAsWall(new Vector2Int(x, -halfHeight));
            }

            for (int y = -halfHeight; y <= halfHeight; y++)
            {
                SetTileAsWall(new Vector2Int(-halfWidth, y));
                SetTileAsWall(new Vector2Int(halfWidth, y));
            }

            foreach (Vector2Int wallCoordinates in mapData.Walls)
                SetTileAsWall(wallCoordinates);

            foreach (Vector2Int obstacle in mapData.Jumpables)
                SetTileAsWater(obstacle);

            for (int playerNumber = 0; playerNumber < players.Count; playerNumber++)
                if (players[playerNumber] != null)
                    InstantiateNinja(playerNumber, mapData.SpawnPoints[playerNumber], players[playerNumber].Presence.SessionId);
        }

        public void SetTileAsWall(Vector2Int coordinates)
        {
            if (IsWallTile(coordinates))
                return;

            Instantiate(wallPrefab, (Vector2)coordinates, Quaternion.identity, transform);
            mapWallTiles.Add(coordinates);
        }

        public void SetTileAsWater(Vector2Int coordinates)
        {
            if (IsDangerousTile(coordinates))
                return;

            Instantiate(waterPrefab, (Vector2)coordinates, Quaternion.identity, transform);
            mapDangerousTiles.Add(coordinates);
        }

        public void SetHazard(int tick, Color color, Vector2Int coordinates)
        {
            if (IsDangerousTile(coordinates))
                return;

            Hazard dangerousTile = Instantiate(hazardPrefab, (Vector2)coordinates, Quaternion.identity, transform);
            dangerousTile.Initialize(tick, coordinates, color, this);
            ninjaDangerousTiles.Add(coordinates);
        }

        public void RemoveHazard(Hazard hazard)
        {
            if (!ninjaDangerousTiles.Contains(hazard.Coordinates))
                return;

            ninjaDangerousTiles.Remove(hazard.Coordinates);
        }

        public bool IsWallTile(Vector2Int coordinates)
        {
            return mapWallTiles.Contains(coordinates);
        }

        public bool IsDangerousTile(Vector2Int coordinates)
        {
            return mapDangerousTiles.Contains(coordinates) || ninjaDangerousTiles.Contains(coordinates);
        }

        public void InstantiateNinja(int playerNumber, SpawnPoint spawnPoint, string sessionId)
        {
            Ninja ninja = Instantiate(ninjaPrefab, transform);
            ninja.Initialize(spawnPoint, playerNumber, this, sessionId);
            Ninjas.Add(ninja);
            if (MultiplayerManager.Instance.Self.SessionId == sessionId)
                gameCamera.SetStartingPosition(spawnPoint.Coordinates);
        }

        public Ninja GetNinja(int playerNumber)
        {
            return Ninjas[playerNumber];
        }

        #endregion
    }
}
