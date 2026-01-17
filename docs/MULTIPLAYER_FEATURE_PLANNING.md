# Multiplayer Feature Planning: Human vs Human (Pi Network)

## Overview
This document outlines the requirements and considerations for adding a real-time, two-player (human vs human) mode to the Checkers4Pi game, leveraging the Pi Network for user authentication and matchmaking.

**Note:** The current single-player AI opponent uses three difficulty levels:
	- Beginner: Random moves
	- Intermediate: Minimax algorithm (depth = 1) with positional weighting (center control, king's row, etc.)
	- Advanced: Minimax algorithm (depth > 1) with alpha-beta pruning and full positional scoring

---

## Core Features

### 1. User Authentication & Identity
- Integrate Pi Network authentication for both players.
- Ensure each player is uniquely identified and verified.

### 2. Game Session Management
- Ability to create, join, or invite users to game sessions.
- Lobby or room system for waiting and matchmaking.
- Store session state (invited, joined, active, completed).

### 3. Real-Time Communication
- Use WebSockets or similar protocol for live move updates.
- Server relays moves and game state between players.
- Handle network latency and synchronization.

### 4. UI Changes
- Add options to invite/search for Pi users.
- Display lobby, waiting, and in-game states.
- Indicate whose turn it is and game status.

### 5. Backend Changes
- Store game state for 2-player games.
- Handle game creation, joining, move validation, and session lifecycle.
- Support for reconnection and persistence.

### 6. Error Handling & Edge Cases
- Handle disconnects, timeouts, forfeits, and reconnections.
- Ensure fair play and security (prevent cheating).
- Graceful handling of abandoned games.

### 7. Chat Feature (Optional but Recommended)
- In-game chat for player communication.
- Basic text chat, possibly with moderation/filtering.
- UI for chat window integrated with game board.

### 8. Testing & Quality Assurance
- Test for latency, synchronization, and user experience.
- Simulate edge cases (disconnects, simultaneous moves, etc.).
- Ensure robust error handling and recovery.

---

## Additional Considerations

---

## Database Requirements (SQL Server)

### Why Use a Database?
A SQL Server database is recommended for:
- Storing user profiles and authentication data
- Managing game sessions, invitations, and waiting rooms
- Persisting game state for reconnections and analytics
- Tracking player statistics and game outcomes
- Storing chat history (if chat is implemented)

### Suggested Tables & Schema

**Users**
- UserID (PK)
- PiNetworkID
- DisplayName
- RegistrationDate
- LastActive

**GameSessions**
- SessionID (PK)
- Player1ID (FK to Users)
- Player2ID (FK to Users)
- Status (waiting, active, completed, abandoned)
- CreatedAt
- UpdatedAt

**Moves**
- MoveID (PK)
- SessionID (FK to GameSessions)
- PlayerID (FK to Users)
- MoveData (JSON or string)
- MoveNumber
- Timestamp

**ChatMessages** (optional)
- MessageID (PK)
- SessionID (FK to GameSessions)
- SenderID (FK to Users)
- MessageText
- SentAt

**Statistics**
- StatID (PK)
- UserID (FK to Users)
- GamesPlayed
- GamesWon
- GamesLost
- LastGameDate

**Invitations**
- InvitationID (PK)
- InviterID (FK to Users)
- InviteeID (FK to Users)
- SessionID (FK to GameSessions, nullable until accepted)
- Status (pending, accepted, declined, expired)
- SentAt

### Notes
- Use foreign keys for data integrity.
- Consider indexing frequently queried columns (e.g., PiNetworkID, SessionID).
- Store game moves as JSON for flexibility.
- Archive completed games and chat for analytics and moderation.

---

---

## Effort Estimate
- **Moderate to significant**: Real-time multiplayer and session management are the most complex parts.
- **Timeframe**: Several days to weeks for a robust, production-ready implementation, depending on existing backend and Pi Network integration.

---

## Deployment Notes
- Recommend launching single-player/AI mode first.
- Gather user feedback before adding multiplayer features.
- Consider phased rollout (invite-only, beta testing, etc.).

---

## References
- Pi Network Developer Docs
- WebSocket/real-time communication libraries
- Multiplayer game design best practices

---

*Prepared by GitHub Copilot, January 2026*
