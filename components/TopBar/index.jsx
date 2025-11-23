import React from 'react';
import { AppBar, Toolbar, Typography, Box, FormControlLabel, Switch } from '@mui/material';
import { useLocation, matchPath } from 'react-router-dom';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../lib/api';
import { useAdvanced } from '../../lib/advancedContext';

function TopBar() {
  const advanced = useAdvanced();
  const { pathname } = useLocation();

  const commentsMatch = matchPath('/comments/:id', pathname);
  const usersMatch = matchPath('/users/:id', pathname);
  const photosMatch = matchPath('/photos/:id', pathname);

  const currentUserId =
    commentsMatch?.params?.id
    || usersMatch?.params?.id
    || photosMatch?.params?.id
    || null;

  const { data: user } = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: () => getUser(currentUserId),
    enabled: !!currentUserId,
  });

  let titleRight = 'Users';
  if (commentsMatch && user) {
    titleRight = `${user.first_name} ${user.last_name}`;
  } else if (usersMatch && user) {
    titleRight = `${user.first_name} ${user.last_name}`;
  } else if (photosMatch && user) {
    titleRight = `Photos of ${user.first_name} ${user.last_name}`;
  } else if (photosMatch) {
    titleRight = 'Photos';
  }

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="inherit">
          Faizul Anis -
        </Typography>
        <Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {titleRight}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <FormControlLabel
          control={(
            <Switch
              color="default"
              checked={advanced.enabled}
              onChange={(e) => advanced.setEnabled(e.target.checked)}
            />
          )}
          label="Enable Advanced Features"
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;