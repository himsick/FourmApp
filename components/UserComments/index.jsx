
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { CircularProgress, Typography, Link } from '@mui/material';
import './styles.css';
import { api } from '../../lib/api';

function fmtDate(s) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

function UserComments() {
  const { userId } = useParams();
  const [items, setItems] = useState(null);
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [{ data: comments }, { data: userObj }] = await Promise.all([
          api.get(`/commentsOfUser/${userId}`),
          api.get(`/user/${userId}`),
        ]);
        if (!ignore) {
          setItems(comments);
          setUser(userObj);
        }
      } catch (e) {
        setErr(e?.response?.data || 'Failed to load');
      }
    })();
    return () => { ignore = true; };
  }, [userId]);

  if (err) return <Typography color="error">{String(err)}</Typography>;
  if (!items || !user) return <CircularProgress />;
  if (items.length === 0) return <Typography>No comments yet.</Typography>;

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
            <Link component={RouterLink} to={`/photos/${it.photo.user_id}/${it.photo._id}`} className="comment-text">
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
