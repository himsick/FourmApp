import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Stack, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './styles.css';
import { api } from '../../lib/api';

function fmt(v) { return v ?? '—'; }

function UserDetail({ userId }) {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await api.get(`/user/${userId}`);
        if (!ignore) setUser(res.data);
      } catch (e) {
        setErr('User not found.');
      }
    })();
    return () => { ignore = true; };
  }, [userId]);

  if (err) return <Typography color="error">{err}</Typography>;
  if (!user) return <Typography>Loading…</Typography>;

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>{fullName}</Typography>
          <Typography variant="body2">Location: {fmt(user.location)}</Typography>
          <Typography variant="body2">Occupation: {fmt(user.occupation)}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            About: {fmt(user.description)}
          </Typography>
        </CardContent>
      </Card>

      <Typography>
        <Link component={RouterLink} to={`/photos/${user._id}`}>
          View photos of {fullName}
        </Link>
      </Typography>
    </Stack>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;
