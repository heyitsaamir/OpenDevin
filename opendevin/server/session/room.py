from typing import Dict

from opendevin.core.logger import opendevin_logger as logger


class SessionRoomManager:
    _session_id_to_user_id: Dict[str, str] = {}  # 1 user can have multiple session ids
    _user_id_to_session_id: Dict[
        str, list[str]
    ] = {}  # 1 session id can only have 1 user

    def add_session(self, sid: str, uid: str):
        self._session_id_to_user_id[sid] = uid
        sessions_for_uid = self._user_id_to_session_id.get(uid, [])
        try:
            sessions_for_uid.remove(sid)
        except ValueError:
            pass
        logger.info(
            f'Adding session {sid} for user {uid}. Current sessions: {sessions_for_uid}'
        )
        sessions_for_uid.append(sid)
        self._user_id_to_session_id[uid] = sessions_for_uid

    def remove_session(self, sid: str):
        uid = self._session_id_to_user_id.get(sid)
        if uid is not None:
            sessions_for_uid = self._user_id_to_session_id.get(uid, [])
            try:
                sessions_for_uid.remove(sid)
            except ValueError:
                pass
            self._user_id_to_session_id[uid] = sessions_for_uid
            del self._session_id_to_user_id[sid]

    def get_all_sessions_for_user(self, uid: str) -> list[str]:
        return self._user_id_to_session_id.get(uid, [])

    def get_user_for_session(self, sid: str) -> str | None:
        return self._session_id_to_user_id.get(sid)

    def get_all_related_sessions(self, sid: str) -> list[str]:
        uid = self._session_id_to_user_id.get(sid)
        if uid is not None:
            related_sessions = self._user_id_to_session_id.get(uid, [])
            deduped_related_sessions = list(set(related_sessions))
            return deduped_related_sessions
        return [sid]


room_manager = SessionRoomManager()
