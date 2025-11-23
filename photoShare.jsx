import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams,
} from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';  // ⬅ add this


import './styles/main.css';
// Import mock setup - Remove this once you have implemented the actual API calls
//import './lib/mockSetup.js';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserComments from './components/UserComments';
import LoginRegister from './components/LoginRegister';
import { useAppStore } from './lib/store';

const queryClient = new QueryClient();

function UserDetailRoute() {
  const { userId } = useParams();
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return <UserPhotos userId={userId} />;
}

function AppBody() {
  const currentUser = useAppStore((s) => s.currentUser);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TopBar />
      </Grid>
      <div className="main-topbar-buffer" />
      <Grid item sm={3}>
        <Paper className="main-grid-item">
          {/* Only show user list when logged in */}
          {currentUser ? (
            <UserList />
          ) : (
            <Typography sx={{ p: 2 }}>Login to see users.</Typography>
          )}
        </Paper>
      </Grid>
      <Grid item sm={9}>
        <Paper className="main-grid-item">
          {currentUser ? (
            <Routes>
              <Route
                path="/"
                element={(
                  <Typography variant="body1">
                    Welcome back, {currentUser.first_name}!
                  </Typography>
                )}
              />
              <Route path="/users/:userId" element={<UserDetailRoute />} />
              <Route path="/photos/:userId" element={<UserPhotosRoute />} />
              <Route path="/comments/:userId" element={<UserComments />} />
              <Route
                path="*"
                element={<Typography>Page not found.</Typography>}
              />
            </Routes>
          ) : (
            // Not logged in → always show LoginRegister
            <LoginRegister />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

function PhotoShare() {
  return (
    <BrowserRouter>
      <AppBody />
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(
  <QueryClientProvider client={queryClient}>
    <PhotoShare />
  </QueryClientProvider>
);
