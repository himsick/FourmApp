import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { login, registerUser } from "../../lib/api";
import { useAppStore } from "../../lib/store";

function LoginRegister() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  // --- login form state ---
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);

  // --- register form state ---
  const [reg, setReg] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [regError, setRegError] = useState(null);
  const [regMessage, setRegMessage] = useState(null);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setCurrentUser(user);
      setLoginError(null);
      setLoginMessage("Login successful.");
      setLoginPassword("");
    },
    onError: (err) => {
      setLoginMessage(null);
      const msg = err?.response?.data || "Login failed.";
      setLoginError(String(msg));
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (newUser) => {
      setRegError(null);
      setRegMessage(`User ${newUser.login_name} registered successfully.`);
      setReg({
        login_name: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
      });
    },
    onError: (err) => {
      setRegMessage(null);
      const msg = err?.response?.data || "Registration failed.";
      setRegError(String(msg));
    },
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginMessage(null);
    loginMutation.mutate({ login_name: loginName, password: loginPassword });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError(null);
    setRegMessage(null);

    if (!reg.password || !reg.password2) {
      setRegError("Password and confirm password are required.");
      return;
    }
    if (reg.password !== reg.password2) {
      setRegError("Passwords do not match.");
      return;
    }

    registerMutation.mutate({
      login_name: reg.login_name,
      password: reg.password,
      first_name: reg.first_name,
      last_name: reg.last_name,
      location: reg.location,
      description: reg.description,
      occupation: reg.occupation,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Login
              </Typography>

              {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
              {loginMessage && <Alert severity="success" sx={{ mb: 2 }}>{loginMessage}</Alert>}

              <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                <TextField fullWidth label="Login name" margin="normal" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
                <TextField fullWidth label="Password" type="password" margin="normal" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" type="submit" disabled={loginMutation.isLoading}>Log In</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
          <Divider orientation="horizontal" flexItem sx={{ display: { xs: "block", md: "none" } }}>OR</Divider>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Register
              </Typography>

              {regError && <Alert severity="error" sx={{ mb: 2 }}>{regError}</Alert>}
              {regMessage && <Alert severity="success" sx={{ mb: 2 }}>{regMessage}</Alert>}

              <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
                <TextField fullWidth label="Login name" margin="normal" value={reg.login_name} onChange={(e) => setReg((r) => ({ ...r, login_name: e.target.value }))} />
                <TextField fullWidth label="Password" type="password" margin="normal" value={reg.password} onChange={(e) => setReg((r) => ({ ...r, password: e.target.value }))} />
                <TextField fullWidth label="Confirm password" type="password" margin="normal" value={reg.password2} onChange={(e) => setReg((r) => ({ ...r, password2: e.target.value }))} />

                <TextField fullWidth label="First name" margin="normal" value={reg.first_name} onChange={(e) => setReg((r) => ({ ...r, first_name: e.target.value }))} />
                <TextField fullWidth label="Last name" margin="normal" value={reg.last_name} onChange={(e) => setReg((r) => ({ ...r, last_name: e.target.value }))} />
                <TextField fullWidth label="Location" margin="normal" value={reg.location} onChange={(e) => setReg((r) => ({ ...r, location: e.target.value }))} />
                <TextField fullWidth label="Description" margin="normal" multiline minRows={2} value={reg.description} onChange={(e) => setReg((r) => ({ ...r, description: e.target.value }))} />
                <TextField fullWidth label="Occupation" margin="normal" value={reg.occupation} onChange={(e) => setReg((r) => ({ ...r, occupation: e.target.value }))} />

                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" type="submit" disabled={registerMutation.isLoading}>Register Me</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default LoginRegister;
