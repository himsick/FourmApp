import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardMedia, Divider, Stack, Typography, Link, Box } from '@mui/material';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import { getPhotosOfUser } from '../../lib/api';


function fmtDate(s) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

function UserPhotos({ userId }) {
  const {
    data: photos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['photosOfUser', userId],
    queryFn: () => getPhotosOfUser(userId),
  });

  if (isLoading) return <Typography>Loading photos…</Typography>;
  if (error) return <Typography color="error">Failed to fetch photos.</Typography>;
  if (!photos.length) return <Typography>No photos yet.</Typography>;

  return (
    <Stack spacing={2}>
      {photos.map((p) => (
        <Card key={p._id} sx={{ overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={`/images/${p.file_name}`}
            alt={p.file_name}
            sx={{ maxHeight: 480, objectFit: 'contain', backgroundColor: '#000' }}
          />
          <CardContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Taken: {fmtDate(p.date_time)}
            </Typography>
            {p.comments?.length > 0 && (
              <Box className="photo-comments">
                {p.comments.map((c, idx) => (
                  <Fragment key={c._id || idx}>
                    <Box className="photo-comment-row">
                      <Link
                        component={RouterLink}
                        to={`/users/${c.user._id}`}
                        className="comment-author"
                      >
                        {c.user.first_name} {c.user.last_name}
                      </Link>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {c.comment}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ ml: 4 }}>
                      {fmtDate(c.date_time)}
                    </Typography>
                    {idx !== p.comments.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Fragment>
                ))}
              </Box>
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
