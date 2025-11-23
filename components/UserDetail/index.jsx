import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Stack, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../../lib/api';

function fmt(v) { return v ?? '—'; }

function UserDetail({ userId }) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
  });

  if (isLoading) return <Typography>Loading…</Typography>;
  if (error || !user) return <Typography color="error">User not found.</Typography>;

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
