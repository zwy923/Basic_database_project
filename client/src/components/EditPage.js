import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



const EditPage = ({ token }) => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchCodeSnippet = async () => {
      try {
        const response = await fetch(`http://localhost:1234/api/user/codeSnippets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}` 
          },
        });
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setCode(data.code);
        setTags(data.tags);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCodeSnippet();
  }, [id, token]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  // TAB
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const { selectionStart, selectionEnd } = event.target;
      const spaces = '    '; // use four spaces for each tab
      setCode(
        code.substring(0, selectionStart) +
          spaces +
          code.substring(selectionEnd)
      );
      event.target.setSelectionRange(selectionStart + spaces.length, selectionStart + spaces.length);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:1234/api/user/codeSnippets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title,
          description,
          code,
          tags,
        })
      })
      const data = await response.json();
      if (response.ok) {
        console.log(data)
        alert("Successful!")
        navigate('/')
        window.location.reload()
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Paper variant="elevation" sx={{ margin: 4}}>
      <Typography variant="h4">Edit Code Snippet</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          id="title"
          label="Title"
          fullWidth
          value={title}
          onChange={handleTitleChange}
          margin="normal"
        />
        <TextField
          id="description"
          label="Description"
          fullWidth
          multiline
          rows={5}
          value={description}
          onChange={handleDescriptionChange}
          margin="normal"
        />
        <TextField
          id="markdown"
          label="markdown"
          fullWidth
          onKeyDown={handleKeyDown} // handle Tab key press
          multiline
          rows={10}
          value={code}
          onChange={handleCodeChange}
          margin="normal"
        />
        <TextField
          id="tags"
          label="Tags"
          fullWidth
          value={tags}
          onChange={handleTagsChange}
          margin="normal"
        />
        <Button variant="contained" sx={{margin:2}} onClick={handleSubmit}>
          Save Changes
        </Button>
      </form>
    </Paper>
  );
};

export default EditPage;
