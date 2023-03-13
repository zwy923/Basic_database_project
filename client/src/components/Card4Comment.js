import React, { useEffect } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardOverflow from '@mui/joy/CardOverflow';
import { Avatar } from '@mui/material';
import Box from '@mui/joy/Box';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton'
import { red } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/joy/Button/Button';
import EditIcon from '@mui/icons-material/Edit'
import jwtDecode from 'jwt-decode';

const CommentCard = ({ comment, token, role}) => {
  const { text, user, createdAt, _id} = comment;
  const [deleted, setDeleted] = useState(false);
  const [edited,setEdited] = useState(false)
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(text);
  const [userId,setUserID] = useState("")
  useEffect(() => {
    if(token){
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem('authToken')
      } else {
        setUserID(decodedToken._id)
      }
    }},[])

  const handleEditClick = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditTextChange = (event) => {
    setEditText(event.target.value);
  };
  
  // This function handles the submission of an edited comment
  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:1234/api/user/comments/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: editText })});
      if (response.ok) {
        setEditOpen(false)
        setEdited(true)
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      alert(`Error editing comment: ${error.message}`);
    }
    };

  // Define an asynchronous function to handle comment deletion
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:1234/api/user/comments/${_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setDeleted(true);
      } else if (response.status === 401) {
        alert('You are not authorized to delete this comment.');
      } else if (response.status === 404) {
        alert('Comment not found.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      alert(`Error deleting comment: ${error.message}`);
    }
  }
  
  if (deleted) {
    return null;
  }

  if (edited) {
    window.location.reload()
  }

  return (
    <Card
    variant="outlined"
    sx={{ bgcolor: 'background.body' }}>
        <Box margin={1} sx={{ display: 'flex', gap: 1.5, mt: 1 ,mb:0} }>
            <Avatar variant="soft" color="neutral">
              
            </Avatar>
            <div>
              <Typography level="body2">by</Typography>
              <Typography fontWeight="lg" level="body2">
                {user.name}
              </Typography>
            </div>
        </Box>
        <br />
        <Box margin={2}>{text}</Box>
        <p style={{ textAlign: 'right', marginRight: '20px' }}>Commented at {new Date(createdAt).toLocaleString()}</p>

        <CardOverflow sx={{ p: 'var(--Card-padding)', display: 'flex' }}>
        <Input
          variant="plain"
          size="sm"
          placeholder="Can't comment on the comment yet…"
          sx={{ flexGrow: 1, mr: 1, '--Input-focusedThickness': '0px' }}
        />
        <Link disabled underline="none" role="button" margin={2}>
          Post
        </Link>
        {(user._id === userId || role === "admin") && (
          <IconButton onClick={handleEditClick} size="small">
            <EditIcon fontSize="inherit" />
          </IconButton>
        )}
        {(user._id === userId || role === "admin") && (
          <IconButton onClick={handleDelete}>
            <DeleteIcon sx={{ color: red[500] }} />
          </IconButton>
        )}
        </CardOverflow>
        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={editText}
              onChange={handleEditTextChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save</Button>
          </DialogActions>
      </Dialog>
    </Card>
  );
}

export default CommentCard;
