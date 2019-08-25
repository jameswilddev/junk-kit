function renderNonInteractiveGame(
  parent: EngineViewport | EngineAnimation,
  gamePhase: GamePhase,
): () => void {
  const level = levels[gamePhase.level]

  for (const room of level.rooms) {
    const roomGroup = group(parent)
    translate(roomGroup, room.x * roomSpacing, room.y * roomSpacing)

    switch (room.type) {
      case `empty`:
        sprite(roomGroup, game_room_empty_svg)
        break
      case `mcguffin`:
        sprite(roomGroup, game_room_mcguffin_a_svg)
        break
      case `switch`:
        sprite(roomGroup, game_room_switch_a_svg)
        break
      default:
        throw null
    }
  }

  for (const corridor of level.corridors) {
    const corridorGroup = group(parent)
    translate(corridorGroup, corridor.x * roomSpacing, corridor.y * roomSpacing)
    rotate(corridorGroup, facingDegrees[corridor.facing])

    switch (corridor.type) {
      case `empty`:
        sprite(corridorGroup, game_corridor_empty_svg)
        break
      case `ledge`:
        sprite(corridorGroup, game_corridor_ledge_svg)
        break
      case `stairs`:
        sprite(corridorGroup, game_corridor_stairs_svg)
        break
      case `openDoor`:
        sprite(corridorGroup, game_corridor_door_open_svg)
        break
      case `closedDoor`:
        sprite(corridorGroup, game_corridor_door_closed_svg)
        break
      case `goal`:
        sprite(corridorGroup, game_corridor_goal_closed_svg)
        break
      default:
        throw null
    }
  }

  return phase
}

function renderInteractiveGame(
  mainViewport: EngineViewport,
  gamePhase: GamePhase,
): void {
  mainViewport
  gamePhase
}
