from typing import Dict, Any, List
import datetime

class SessionContext:
    def __init__(self, session_id: str, store_id: str):
        self.session_id = session_id
        self.store_id = store_id
        self.history: List[Dict[str, Any]] = []
        self.last_intent: str = "GENERAL_HELP"
        self.last_period: Dict[str, str] = {}
        self.updated_at = datetime.datetime.now()

class ContextManager:
    def __init__(self, max_history_turns: int = 10):
        self._sessions: Dict[str, SessionContext] = {}
        self.max_history_turns = max_history_turns

    def get_or_create_session(self, session_id: str, store_id: str) -> SessionContext:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionContext(session_id, store_id)
        session = self._sessions[session_id]
        # Invariant check: Store ID must match
        if session.store_id != store_id:
            session.store_id = store_id
            session.history.clear() # Reset context if switching stores
        return session

    def add_message(self, session_id: str, role: str, content: Any, name: str = None):
        if session_id in self._sessions:
            session = self._sessions[session_id]
            msg = {"role": role, "content": content}
            if name:
                msg["name"] = name
            session.history.append(msg)
            # Prune if exceeding window
            if len(session.history) > self.max_history_turns * 2:
                session.history = session.history[-self.max_history_turns * 2:]
            session.updated_at = datetime.datetime.now()

    def get_history(self, session_id: str) -> List[Dict[str, Any]]:
        if session_id in self._sessions:
            return list(self._sessions[session_id].history)
        return []

context_manager = ContextManager()
