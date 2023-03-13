import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DetailSnippet from './Detail4Snippet';

// Defining the styled component 'ExpandMore'
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

// Defining the component 'CodeSnippet'
const CodeSnippet = ({snippet, token, editable, role, isLoggedIn}) => {
  
  const navigate = useNavigate();
  // Destructuring required properties from 'snippet'
  const { title, tags, createdAt, updatedAt, description, user, _id} = snippet;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [userName, setUserName] = useState('');
  
  const [detailOpen, setDetailOpen] = useState(false);
  // State for handling vote
  const [isVoted, setIsVoted] = useState(false);
  const [count,setCount] = useState(0)

  // Constant for menu height
  const ITEM_HEIGHT = 48;
  
  // Function to handle click of the menu button
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to handle closing of the menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setAnchorEl(null);
    navigate(`/edit/${_id}`);
  };
  
  const go4More = () => {
    setDetailOpen(true)
  }


  const initVote = async (_id) => {
    try{
      const response = await fetch(`http://localhost:1234/api/user/votes/${_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const Data = await response.json()
        setIsVoted(Data.isvoted);
      } else if (response.status === 401) {
        alert('You need to be logged in to vote.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    }catch (error) {
      alert(`Error voting: ${error.message}`);
    }
  }

  const initVoteCount = async(_id) =>{
    try{
      const response = await fetch(`http://localhost:1234/api/user/votes/count/${_id}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json',},
      });
      if (response.ok) {
        const Data = await response.json()
        setCount(Data.count)
      }else 
      {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    }catch (error) {
      alert(`Error voting: ${error.message}`);
    }
  }
  const goVote = async () => {
    try {

      const response = await fetch(`http://localhost:1234/api/user/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: snippet._id,
        }),
      });
  
      if (response.ok) {
        const Data = await response.json()
        setIsVoted(Data.isvoted);
        window.location.reload();
      } else if (response.status === 401) {
        alert('You need to be logged in to vote.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      alert(`Error voting: ${error.message}`);
    }
  }

  const handleDelete = async () => {
    setAnchorEl(null);
    try {
    const response = await fetch(`http://localhost:1234/api/user/codeSnippets/${_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      alert('Code snippet deleted successfully.');
      window.location.reload();
    } else if (response.status === 401) {
      alert('You are not authorized to delete this code snippet.');
    } else if (response.status === 404) {
      alert('Code snippet not found.');
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    } catch (error) {
      alert(`Error deleting code snippet: ${error.message}`);
    }
  }


  useEffect(() => {
    initVoteCount(_id)
    if(token){
      initVote(_id)
    }
    const fetchUserName = async () => {
      const response = await fetch(`http://localhost:1234/api/user/getusername`,{
        method:'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "userid":user
        })});
      const data = await response.json();
      setUserName(data.name);
    };
    if (user) {
      fetchUserName();
    }
  }, [user]);
  
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ maxWidth: 345 ,margin : 10}}>
      <DetailSnippet open={detailOpen} handleClose={() => setDetailOpen(false)} name={userName} snippet={snippet} editable={editable} role={role} token={token} isLoggedIn={isLoggedIn}/>
      <CardHeader
        action={
          <div>
            {editable ?(
            <IconButton
              aria-label="more"
              id="long-button"
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            ):(<></>)}
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                style: {maxHeight: ITEM_HEIGHT * 4.5,
                width: '6.8ch',},}}>

          <MenuItem key={'Edit'} onClick={handleEdit} >
            <EditIcon />
          </MenuItem>

          <MenuItem key={'Delete'} onClick={handleDelete}>
            <DeleteIcon />
          </MenuItem>
      </Menu>
    </div>}
        title={title}
        subheader={userName}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        
        <Button variant="text" onClick={go4More}>More</Button>
        
        {isLoggedIn ? (
        <IconButton aria-label="add to favorites" onClick={goVote} style={{ color: isVoted ? 'red' : 'grey' }}>
          <FavoriteIcon />
        </IconButton>):(<></>)
        }
        <p>{count} liked</p>

        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          Created At: {createdAt}<br></br>
          Updated At: {updatedAt}<br></br>
          {tags}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default CodeSnippet;
