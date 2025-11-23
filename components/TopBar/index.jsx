import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, FormControlLabel, Switch } from '@mui/material';
import { useLocation, matchPath, useParams } from 'react-router-dom';
import './styles.css';
import { api } from '../../lib/api';
import { useAdvanced } from '../../lib/advancedContext';

function TopBar() {
  const advanced = useAdvanced();
  const { pathname } = useLocation();
  const [titleRight, setTitleRight] = useState('');
  useEffect(() => {
    let ignore = false;
    const match = matchPath('/comments/:id', pathname);
    if (match) {
      (async () => {
        try {
          const { data } = await api.get(`/user/${match.params.id}`);
          if (!ignore) setTitleRight(`${data.first_name} ${data.last_name}`);
        } catch {}
      })();
    }
    return () => { ignore = true; };
  }, [pathname]);


  useEffect(() => {
    let ignore = false;

    const userMatch = matchPath('/users/:id', pathname);
    const photosMatch = matchPath('/photos/:id', pathname);

    async function resolveTitle() {
      if (userMatch) {
        const id = userMatch.params.id;
        try {
          const r = await api.get(`/user/${id}`);
          if (!ignore) setTitleRight(`${r.data.first_name} ${r.data.last_name}`);
        } catch {
          if (!ignore) setTitleRight('User');
        }
        return;
      }

      if (photosMatch) {
        const id = photosMatch.params.id;
        try {
          const r = await api.get(`/user/${id}`);
          if (!ignore) setTitleRight(`Photos of ${r.data.first_name} ${r.data.last_name}`);
        } catch {
          if (!ignore) setTitleRight('Photos');
        }
        return;
      }

      setTitleRight('Users');
    }

    resolveTitle();
    return () => { ignore = true; };
  }, [pathname]);

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
          control={<Switch color="default" checked={advanced.enabled} onChange={(e) => advanced.setEnabled(e.target.checked)} />}
          label="Enable Advanced Features"
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
