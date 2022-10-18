const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("localhost running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
intializeDbAndServer();

//Get list of players
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * 
    FROM cricket_team
    ORDER BY player_id;
    `;

  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayerObj) =>
      convertDbObjectToResponseObject(eachPlayerObj)
    )
  );
});

// Post the cricket team

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO
            cricket_team(player_name,jersey_number,role)
        VALUES
         (
              '${playerName}',
               ${jerseyNumber},
               '${role}'
         );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//PUT METHOD

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const putQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE
          player_id = ${playerId};`;
  await db.run(putQuery);
  response.send("Player Details Updated");
});
//DELETE METHOD

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
        DELETE FROM cricket_team WHERE player_id = ${playerId};            
`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
