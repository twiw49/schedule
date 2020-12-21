import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { useSelector, useDispatch } from 'react-redux';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ErrorBar() {
  const dispatch = useDispatch();
  const isError = useSelector((state) => {
    return state.settings.isError
  });

  const handleClose = () => {
    dispatch({
      type: 'SET_ERROR',
      payload: {
        isError: false
      }
    })
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isError ? true : false}
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity="error">
        {isError}
      </Alert>
    </Snackbar>
  );
}
