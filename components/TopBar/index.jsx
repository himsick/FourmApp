import React, { useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import { useLocation, matchPath } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './styles.css';
import { getUser, logout, uploadPhoto } from '../../lib/api';
import { useAppStore } from '../../lib/store';

function TopBar() {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const advancedEnabled = useAppStore((s) => s.advancedEnabled);
  const setAdvancedEnabled = useAppStore((s) => s.setAdvancedEnabled);

  const currentUser = useAppStore((s) => s.currentUser);
  const clearCurrentUser = useAppStore((s) => s.clearCurrentUser);

  // Figure out which user ID is in the URL (for the right-hand title)
  const commentsMatch = matchPath('/comments/:id', pathname);
  const usersMatch = matchPath('/users/:id', pathname);
  const photosMatch = matchPath('/photos/:id', pathname);

  const currentUserId =
    commentsMatch?.params?.id ||
    usersMatch?.params?.id ||
    photosMatch?.params?.id ||
    null;

  const { data: routeUser } = useQuery({
    queryKey: ['user', currentUserId],
    queryFn: () => getUser(currentUserId),
    enabled: !!currentUserId && !!currentUser, // don’t fetch if not logged in
  });

  let titleRight = '';
  if (!currentUser) {
    titleRight = 'Please Login';
  } else if (pathname === '/') {
    titleRight = 'Welcome';
  } else if (commentsMatch && routeUser) {
    titleRight = `Comments by ${routeUser.first_name} ${routeUser.last_name}`;
  } else if (usersMatch && routeUser) {
    titleRight = `${routeUser.first_name} ${routeUser.last_name}`;
  } else if (photosMatch && routeUser) {
    titleRight = `Photos of ${routeUser.first_name} ${routeUser.last_name}`;
  } else {
    titleRight = '';
  }

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearCurrentUser();
      queryClient.clear();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: ['photosOfUser', currentUser._id] });
      }
    },
  });

  const fileInputRef = useRef(null);

  const handleAddPhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelected = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    uploadMutation.mutate(file);
    // clear input so same file can be selected again
    event.target.value = '';
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" color="inherit" noWrap>
          Faizul Anis - PhotoShare
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Hidden file input for uploads */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />

        {currentUser && (
          <Button
            color="inherit"
            size="small"
            onClick={handleAddPhotoClick}
            disabled={uploadMutation.isLoading}
            sx={{ mr: 1 }}
          >
            {uploadMutation.isLoading ? 'Uploading…' : 'Add Photo'}
          </Button>
        )}

        <Box sx={{ mr: 3, textAlign: 'right' }}>
          {currentUser ? (
            <>
              <Typography variant="subtitle2">
                Hi {currentUser.first_name}
              </Typography>
              {titleRight && (
                <Typography variant="caption">
                  {titleRight}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="subtitle2">
              Please Login
            </Typography>
          )}
        </Box>

        {currentUser && (
          <Button
            color="inherit"
            size="small"
            onClick={handleLogout}
            disabled={logoutMutation.isLoading}
            sx={{ mr: 2 }}
          >
            Logout
          </Button>
        )}

        <FormControlLabel
          control={(
            <Switch
              color="default"
              checked={advancedEnabled}
              onChange={(e) => setAdvancedEnabled(e.target.checked)}
            />
          )}
          label="Enable Advanced Features"
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;