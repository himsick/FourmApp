import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../lib/api';
import { useAppStore } from '../../lib/store';

function LoginRegister() {
  const [loginName, setLoginName] = useState('');
  const [localError, setLocalError] = useState('');
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setCurrentUser(data);
      setLocalError('');
    },
    onError: (err) => {
      const msg = err?.response?.data || 'Login failed';
      setLocalError(String(msg));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loginName.trim()) {
      setLocalError('Please enter a login name.');
      return;
    }
    loginMutation.mutate({ login_name: loginName.trim() });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper sx={{ p: 3, maxWidth: 400, width: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Please Login
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Use your last name in lowercase (e.g., <code>levin</code>, <code>turing</code>)
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Login name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              autoFocus
              fullWidth
              size="small"
            />

            {localError && (
              <Alert severity="error">
                {localError}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? 'Logging in…' : 'Login'}
            </Button>

            <Typography variant="body2" sx={{ mt: 1 }}>
              New user? Registration coming in Problem 4.
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default LoginRegister;
