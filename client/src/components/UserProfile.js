import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Avatar,
  Input
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';



function UserProfileDialog({ open, onClose, userId }) {
    const [profile, setProfile] = useState({ gender: '', address: '', major: '' });
    const [avatar, setAvatar] = useState(null);
  
    useEffect(() => {
      // Fetch user profile and avatar
      const fetchUserProfile = async () => {
        try {
          const profileResponse = await fetch(`http://localhost:1234/api/user/user-profile/${userId}`);
          const avatarResponse = await fetch(`http://localhost:1234/api/user/user-avatar/${userId}`);
  
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setProfile(profileData);
          }
  
          if (avatarResponse.ok) {
            const avatarBlob = await avatarResponse.blob();
            setAvatar(URL.createObjectURL(avatarBlob));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      if (userId) {
        fetchUserProfile();
      }
    }, [userId]);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    };
  
    const handleAvatarChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('user_id', userId);
  
        try {
          const response = await fetch('http://localhost:1234/api/user/upload-avatar', {
            method: 'POST',
            body: formData,
          });
  
          if (response.ok) {
            const result = await response.json();
            console.log('Avatar uploaded:', result);
            setAvatar(URL.createObjectURL(file));
          } else {
            console.error('Error uploading avatar:', response.statusText);
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
        }
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const response = await fetch('http://localhost:1234/api/user/user-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, ...profile }),
        });
  
        if (response.ok) {
          const result = await response.json();
          console.log('Profile updated:', result);
          onClose();
        } else {
          console.error('Error updating profile:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
          <DialogTitle>User Profile</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  alt="User Avatar"
                  src={avatar}
                  sx={{ width: 100, height: 100 }}
                />
                <label htmlFor="avatar-upload">
                  <Input
                    accept="image/*"
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload avatar"
                    component="span"
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              </div>
              <TextField
                fullWidth
                margin="normal"
                name="gender"
                label="Gender"
                value={profile.gender}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="address"
                label="Address"
                value={profile.address}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="major"
                label="Major"
                value={profile.major}
                onChange={handleInputChange}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained">
              <EditIcon />
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      );}

export default UserProfileDialog;