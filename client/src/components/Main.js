import React, { useState, useEffect } from 'react';
import CodeSnippet from './Card4CodeSnippet';
import Grid from '@mui/joy/Grid';
import Pagination from '@mui/material/Pagination';
import jwtDecode from 'jwt-decode';

const Main = ({ token ,isLoggedIn}) => {
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [id, setId] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem('authToken');
      } else {
        const { _id, role } = decodedToken;
        setId(_id);
        setRole(role);
      }
    }
    const fetchCodeSnippets = async () => {
      try {
        const response = await fetch(
          `http://localhost:1234/api/user/codesnippets?page=${page}`
        );
        const data = await response.json();
        setCodeSnippets(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCodeSnippets();
  }, [token, page]);

  const itemsPerPage = 6;
  const numPages = Math.ceil(codeSnippets.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <>
    <Grid justifyContent="center" direction="row"  display="flex" container spacing={2}>
      {codeSnippets.slice(startIdx, endIdx).map((snippet) => (
        <Grid key={snippet._id} item xs={12} md={4}>
          <CodeSnippet
            snippet={snippet}
            token={token}
            role={role}
            isLoggedIn={isLoggedIn}
            editable={snippet.user === id || role === 'admin'}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container justifyContent="center">
        <Pagination count={numPages} page={page} onChange={handlePageChange} />
    </Grid>
  </>
  );
};

export default Main;

