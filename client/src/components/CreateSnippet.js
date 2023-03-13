import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import 'highlight.js/styles/vs2015.css';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import { Checkbox } from '@mui/material';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {atomDark} from 'react-syntax-highlighter/dist/esm/styles/prism'

const CreateSnippet = ({token}) => {
  

  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('')
  
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  // Handle TAB key down
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

  const label = { inputProps: { 'yes': 'no' } };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:1234/api/user/codeSnippets',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title,
          code,
          tags,
          description
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
      <Typography variant="h4">Create New Snippet</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          id="title"
          label="Title"
          value={title}
          onChange={handleTitleChange}
          margin="normal"
        />

        <TextField
          id="tags"
          label="Tags"
          value={tags}
          onChange={handleTagsChange}
          margin="normal"
        />
        <br />
        <TextField
          id="description"
          fullWidth
          rows={5}
          label="Description"
          value={description}
          onChange={handleDescriptionChange}
          margin="normal"
        />
        <br />
        <TextField
          id="code"
          label="Markdown"
          fullWidth
          multiline
          rows={10}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          margin="normal"
        />
        <Box  margin="normal" border={1} height={200}>
        <Typography variant="subtitle1" component="div">
          Preview
        </Typography>
        
        <ReactMarkdown
          children={code}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
            />
          ) : (
            <code className={className} {...props}>
            {children}
            </code>
            )
          }
        }}
       />
        </Box>

        <Button variant="contained" sx={{margin:2}} endIcon={<SendIcon />} onClick={handleSubmit}>
          Create
        </Button>Anonymous
        <Checkbox {...label} defaultChecked />    
      </form>
    </Paper>
  );
};

export default CreateSnippet;
