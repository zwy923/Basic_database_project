import React, { useState} from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Textarea from '@mui/joy/Textarea';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';


// These fucking parameters have to be enclosed in brackets!
const CreateComment = ({token,onCommentCreated,codeSnippetId}) =>{
  const [commentText, setCommentText] = useState('');
  const [italic, setItalic] = React.useState(false);
  const [fontWeight, setFontWeight] = React.useState('normal');
  const [anchorEl, setAnchorEl] = React.useState(null);

  // This function handles the form submission when a user submits a new comment
  const handleSubmitComment = async (event) => {
    event.preventDefault();
    setItalic((bool) => !bool)
    // Attempt to submit the comment to the server
    try {
      const response = await fetch('http://localhost:1234/api/user/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          text: commentText,
          codeSnippetId: codeSnippetId,
          vote: 0
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setCommentText('');
      onCommentCreated(); // invoke the callback function
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Textarea
        placeholder="Comment here…"
        minRows={2}
        value={commentText}
        onChange={(event) => setCommentText(event.target.value)}
        endDecorator={
          <Box
            sx={{
              display: 'flex',
              gap: 'var(--Textarea-paddingBlock)',
              pt: 'var(--Textarea-paddingBlock)',
              borderTop: '1px solid',
              borderColor: 'divider',
              flex: 'auto',
            }}
          >
            <IconButton
              variant="plain"
              color="neutral"
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              <FormatBold />(useless)
              <KeyboardArrowDown fontSize="md" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              size="sm"
              placement="bottom-start"
              sx={{ '--List-decorator-size': '24px' }}
            >
              <MenuItem
                onClick={() => setFontWeight((weight) => weight === 'bold' ? 'normal' : 'bold')}
              >
                Bold
              </MenuItem>
            </Menu>
            <IconButton
              variant={italic ? 'soft' : 'plain'}
              color={italic ? 'primary' : 'neutral'}
              aria-pressed={italic}
              onClick={() => setItalic((bool) => !bool)}
            >
              <FormatItalic />
            </IconButton>
            <Button onClick={handleSubmitComment} sx={{ ml: 'auto' }}>Send</Button>
          </Box>
        }
        sx={{
          minWidth: 300,
          fontWeight,
          fontStyle: italic ? 'italic' : 'initial',
        }}
      />
    </div>
  );

}

export default CreateComment;