import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material/';
import Slide from '@mui/material/Slide';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

const SearchDialog = ({ query, results, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} TransitionComponent={Transition} fullWidth={true} maxWidth={"sm"}>
      <DialogTitle>Search Results</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Showing results for "{query}"
        </DialogContentText>
        <List>
          {results.users && (
            <>
              <ListItem>
                <ListItemText primary="Users: " />
              </ListItem>
              {results.users.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText primary={user.name} />
                  <ListItemSecondaryAction>
                    <ListItemText primary={user.email} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </>
          )}
          {results.snippets && (
            <>
              <ListItem>
                <ListItemText primary="Code Snippets: " />
              </ListItem>
              {results.snippets.map((snippet) => (
                <ListItem key={snippet.id}>
                  <ListItemText primary={snippet.title} />
                  <ListItemSecondaryAction>
                    <ListItemText primary={snippet.description} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
