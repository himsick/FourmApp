import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import './styles.css';
import { api } from '../../lib/api';
import { useAdvanced } from '../../lib/advancedContext';

function UserList() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({});
  const { enabled } = useAdvanced();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await api.get('/user/list');
        if (!ignore) setUsers(res.data || []);
      } catch (e) {
        setErr('Failed to fetch users.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!enabled) { setCounts({}); return; }
    (async () => {
      try {
        const res = await api.get('/counts');
        if (!ignore) setCounts(res.data || {});
      } catch (e) {
        // ignore for now
      }
    })();
    return () => { ignore = true; };
  }, [enabled]);

  if (loading) return <Typography sx={{ p: 2 }}>Loading users…</Typography>;
  if (err) return <Typography color="error" sx={{ p: 2 }}>{err}</Typography>;

  return (
    <Paper elevation={0} className="userlist-root">
      <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, opacity: 0.7 }}>
        Users
      </Typography>
      <List dense>
        {users.map((u) => {
          const name = `${u.first_name} ${u.last_name}`;
          const c = counts[u._id];
          const photosN = c ? c.photoCount : 0;
          const commentsN = c ? c.commentCount : 0;
          const to = `/users/${u._id}`;
          const selected = pathname === to;
          return (
            <ListItemButton key={u._id} component={RouterLink} to={to} selected={selected}>
              <ListItemText
                primary={<span className="user-row">
                  <span className="user-name">{name}</span>
                  {enabled && (
  <span className="bubbles" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
    <RouterLink
      to={`/photos/${u._id}`}
      className="bubble bubble-green"
      title="Photos"
      onClick={(e) => e.stopPropagation()}
    >
      {photosN}
    </RouterLink>
    <RouterLink
      to={`/comments/${u._id}`}
      className="bubble bubble-red"
      title="Comments"
      onClick={(e) => e.stopPropagation()}
    >
      {commentsN}
    </RouterLink>
  </span>
)}
                </span>}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

export default UserList;
