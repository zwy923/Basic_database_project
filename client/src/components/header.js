import AccountCircle from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { alpha, createTheme, styled } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));


const theme = createTheme({
  palette: {
    primary: {
      light: '#222226',
      main: '#222226',
      dark: '#222226',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function Header({ isLoggedIn, onLogout, token}) {
  const [anchor1, setAnchor1] = React.useState(null);
  const [anchor2, setAnchor2] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('')
  const [userRole, setUserRole] = React.useState('')
  
  useEffect(() => {
    if(token){
      const decodedToken = jwtDecode(token);
      const name = decodedToken.name
      const role = decodedToken.role
      setUserName(name)
      setUserRole(role)
    }
  },[])

  const isProfileMenuOpen = Boolean(anchor1);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isMenuOpen = Boolean(anchor2)

  const navigate = useNavigate();

  const onLogin = () =>{
    navigate('/login')
  }

  const handleProfileMenuOpen = (event) => {
    setAnchor1(event.currentTarget);
  };

  const handleMenuOpen = (event) => {
    setAnchor2(event.currentTarget)
  }

  const handleClickOpen = () => {//if exit
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleProfileMenuClose = () => {
    setAnchor1(null);
    alert("User name: " + userName + "\nGroup: " + userRole)
  };

  const handleOnclose = () => {
    setAnchor1(null);
  }

  const handleMenuClose = () => {
    setAnchor2(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const onAdd = () =>{
    navigate('/createsnippet')
  }

  const gohome = ()=>{
    navigate("/")
    setAnchor2(null);
  }

  const menuId = 'primary-search-account-menu';
  const renderProfileMenu = (
    <Menu theme={theme}
      anchorEl={anchor1}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isProfileMenuOpen}
      onClose={handleOnclose}
    >
      <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleProfileMenuClose}>My account</MenuItem>
    </Menu>
  );
    
  const rendereMenu = (
    <Menu theme={theme}
      anchorEl={anchor2}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={gohome}>Home</MenuItem>
      
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu theme={theme}
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
  
      {isLoggedIn ?(
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          ) : (
            <IconButton size="large"  color="inherit" onClick={onLogin}>
              <Badge badgeContent={0} color="error">
                <LoginIcon />
              </Badge>
            </IconButton>
          )}
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" theme={theme}>
        <Toolbar>
          <IconButton
            onClick={handleMenuOpen}
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          {rendereMenu}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            HEBUT
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          <Dialog
              open={open}
              TransitionComponent={Transition}
              keepMounted
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
          >
            <DialogTitle>{"Sure you want to logout?"}</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
            If you logout, you will not be able to post something new.
            </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>NO</Button>
              <Button onClick={onLogout}>YES</Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {isLoggedIn ?(
            <IconButton size="large"  color="inherit" onClick={handleClickOpen}>
              <Badge badgeContent={0} color="error">
                <ExitToAppIcon />
              </Badge>
              
            </IconButton>
          ) : (
            <></>
          )
          }
          {isLoggedIn ?(
            <IconButton size="large"  color="inherit" onClick={onAdd}>
              <Badge badgeContent={0} color="error">
                <AddIcon />
              </Badge>
            </IconButton>
          ) : (
            <></>
          )
          }
          {isLoggedIn ?(
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          ) : (
            <IconButton size="large"  color="inherit" onClick={onLogin}>
              <Badge badgeContent={0} color="error">
                <LoginIcon />
              </Badge>
            </IconButton>
          )}
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderProfileMenu}
    </Box>
  );
}