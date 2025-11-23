import React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { CircularProgress, Typography, Link } from '@mui/material';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import { getCommentsOfUser, getUser } from '../../lib/api';

function fmtDate(s) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

function UserComments() {
  const { userId } = useParams();

  const {
    data: items,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ['commentsOfUser', userId],
    queryFn: () => getCommentsOfUser(userId),
  });

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
  });

  if (commentsLoading || userLoading) return <CircularProgress />;

  const err = commentsError || userError;
  if (err) {
    return (
      <Typography color="error">
        {err.message || 'Failed to load'}
      </Typography>
    );
  }

  if (!items || items.length === 0) return <Typography>No comments yet.</Typography>;

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="comments-grid">
      <Typography variant="h6">Comments by {fullName}</Typography>
      {items.map((it) => (
        <div className="comment-card" key={it._id}>
          <RouterLink to={`/photos/${it.photo.user_id}/${it.photo._id}`}>
            <img className="comment-thumb" src={`/images/${it.photo.file_name}`} alt="" />
          </RouterLink>
          <div className="comment-body">
            <Link
              component={RouterLink}
              to={`/photos/${it.photo.user_id}/${it.photo._id}`}
              className="comment-text"
            >
              {it.comment}
            </Link>
            <Typography className="comment-meta">{fmtDate(it.date_time)}</Typography>
          </div>
        </div>
      ))}
    </div>
  );
}


export default UserComments;
