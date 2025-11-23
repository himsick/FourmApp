import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getCounts } from '../../lib/api';
import { useAppStore } from '../../lib/store';

function UserList() {
  const advancedEnabled = useAppStore((s) => s.advancedEnabled);
  const currentUser = useAppStore((s) => s.currentUser);
  const { pathname } = useLocation();

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: !!currentUser, // only fetch when logged in
  });

  const {
    data: counts = {},
  } = useQuery({
    queryKey: ['counts'],
    queryFn: getCounts,
    enabled: advancedEnabled, // only fetch counts when advanced mode is on
  });

  if (isLoading) return <Typography sx={{ p: 2 }}>Loading users…</Typography>;
  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error.message || 'Failed to fetch users.'}
      </Typography>
    );
  }

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
                primary={(
                  <span className="user-row">
                    <span className="user-name">{name}</span>
                    {advancedEnabled && (
                      <span
                        className="bubbles"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
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
                  </span>
                )}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

export default UserList;
