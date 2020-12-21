import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Badge from '@material-ui/core/Badge';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import FinalSchedule from './FinalSchedule';
import getFinal from './getFinal';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

export default function FullScreenDialog() {
  const dispatch = useDispatch();
  const {
    final, people, dataObj, currentDate, pongCount
  } = useSelector((store) => {
    return {
      final: store.settings.final,
      people: store.settings.people,
      dataObj: store.settings.dataObj,
      currentDate: store.settings.currentDate,
      pongCount: store.settings.pongCount
    }
  });

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const handleError = (error) => {
    dispatch({
      type: 'SET_ERROR',
      payload: {
        isError: error
      }
    })
  }

  const handleFinal = (final) => {
    dispatch({
      type: 'SET_FINAL',
      payload: {
        final: final.map(item => Object.values(item).filter(item => item['확정사람']))
      }
    })
  }

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBack = () => setIndex(prev => {
    if (prev === 0) return 0
    if (prev > 0) return prev - 1
  })

  const handleForward = () => setIndex(prev => {
    if (prev === final.length - 1) return final.length - 1
    if (prev < final.length - 1) return prev + 1
  })

  const handleOKAY = () => {
    if (people.length < 2) return handleError('당직자 수는 최소 2명 이상이어야 합니다.')

    if (currentMonthDays !== people.reduce((sum, person) => {
      return sum + person.count
    }, 0)) return handleError('총 당직일수의 합은 ' + currentMonthDays + '일이어야 합니다.')

    getFinal({ people, dataObj, currentDate, pongCount, handleError, handleFinal })
    setIndex(prev => {
      if (prev !== 0) return 0
      if (prev === 0) return 1
    })
  }

  if (final && final.length > 0)
    return (
      <div>
        <Badge color="secondary" badgeContent={final.length}>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            결과
          </Button>
        </Badge>
        <Dialog fullScreen open={open} onClose={handleClose}>
          <AppBar className={classes.appBar}>
            <Toolbar>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100vw' }}>
                <IconButton edge="start" color="inherit" onClick={handleClose} >
                  <CloseIcon />
                </IconButton>
                <div>
                  <Button color="inherit" variant="outlined" style={{ marginRight: '1rem' }} onClick={handleOKAY}>다시 돌리기</Button>
                  <IconButton edge="start" color="inherit" onClick={handleBack} >
                    <ArrowBackIosIcon />
                  </IconButton>
                  <IconButton edge="start" color="inherit" onClick={handleForward} >
                    <ArrowForwardIosIcon />
                  </IconButton>
                  <span>{index}/{final.length}</span>
                </div>
              </div>
            </Toolbar>
          </AppBar>
          <FinalSchedule finalData={final} finalIndex={index} />
        </Dialog>
      </div>
    );
  else return <div />
}
