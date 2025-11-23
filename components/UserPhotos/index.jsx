import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardMedia, Divider, Stack, Typography, Link, Box } from '@mui/material';
import './styles.css';
import { api } from '../../lib/api';

function fmtDate(s) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

function UserPhotos({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        try {
          const res = await api.get(`/photos/${userId}`);
          if (!ignore) setPhotos(res.data || []);
        } catch {
          const res2 = await api.get(`/photosOfUser/${userId}`);
          if (!ignore) setPhotos(res2.data || []);
        }
      } catch (e) {
        setErr('Failed to fetch photos.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [userId]);

  if (loading) return <Typography>Loading photos…</Typography>;
  if (err) return <Typography color="error">{err}</Typography>;
  if (!photos.length) return <Typography>No photos yet.</Typography>;

  return (
    <Stack spacing={2}>
      {photos.map((p) => (
        <Card key={p._id} sx={{ overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={`/images/${p.file_name}`}
            alt={p.file_name}
          />
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Added: {fmtDate(p.date_time)}
            </Typography>

            {Array.isArray(p.comments) && p.comments.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Comments</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1.5}>
                  {p.comments.map((c) => (
                    <Fragment key={c._id}>
                      <Typography variant="body2">
                        <Link component={RouterLink} to={`/users/${c.user._id}`}>
                          {c.user.first_name} {c.user.last_name}
                        </Link>{' '}
                        on {fmtDate(c.date_time)}
                      </Typography>
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {c.comment}
                      </Typography>
                      <Divider />
                    </Fragment>
                  ))}
                </Stack>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                No comments yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserPhotos;
