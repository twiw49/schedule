import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import DatesPicker from './DatesPicker'
import getFinal from './getFinal'

export default function Setting() {
  const dispatch = useDispatch();
  const { people, dataObj, currentDate, pongCount } = useSelector((state) => {
    return {
      people: state.settings.people,
      dataObj: state.settings.dataObj,
      currentDate: state.settings.currentDate,
      pongCount: state.settings.pongCount
    }
  });

  const [open, setOpen] = useState(people.length === 0);
  const [newPerson, setNewPerson] = useState('')

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

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    if (people.length < 2) {
      handleError('당직자 수는 최소 2명 이상이어야 합니다.')
    } else {
      setOpen(false);
    }
  }

  const addNewPerson = () => {
    if (newPerson === '') {
      handleError('성함을 입력해주세요')
      return
    }

    if (people.reduce((isAlready, person) => isAlready ? true : person.text === newPerson, false)) {
      handleError('이미 등록된 이름입니다')
      return
    }

    dispatch({
      type: 'ADD_NEW_PERSON',
      payload: {
        newPerson
      }
    })
    setNewPerson('')

  }

  const handleCount = ({ count, personId }) => {
    dispatch({
      type: 'SET_COUNT',
      payload: {
        personId,
        count
      }
    })
  }

  const handlePongCount = ({ pongCount }) => {
    dispatch({
      type: 'SET_PONG_COUNT',
      payload: {
        pongCount
      }
    })
  }

  const handleRemovePerson = (personId) => {
    const isConfirmed = confirm(personId + '님을 삭제할까요?')
    isConfirmed && dispatch({
      type: 'REMOVE_PERSON',
      payload: {
        personId
      }
    })
  }

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const convertDateToString = (dateObj) => {
    const month = dateObj.getMonth() + 1;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const output = year + '/' + month + '/' + day;
    return output
  }

  const handleOKAY = () => {
    if (people.length < 2) return handleError('당직자 수는 최소 2명 이상이어야 합니다.')

    if (currentMonthDays !== people.reduce((sum, person) => {
      return sum + person.count
    }, 0)) return handleError('총 당직일수의 합은 ' + currentMonthDays + '일이어야 합니다.')

    const isSuccess = getFinal({ people, dataObj, currentDate, pongCount, handleError, handleFinal })

    if (isSuccess) handleClose()
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen} style={{ marginRight: '10px' }} >
        설정
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {currentDate.getFullYear() + '년 ' + (currentDate.getMonth() + 1) + '월'}
        </DialogContent>
        <DialogContent style={{ overflow: 'initial' }}>
          <TextField
            autoFocus
            label="당직자성함"
            type="text"
            fullWidth
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') addNewPerson()
            }}
            InputProps={{
              endAdornment: <Button color="primary" onClick={addNewPerson}>추가</Button>,
            }}
          />
        </DialogContent>
        <DialogContent style={{ overflow: 'initial' }}>
          <FormControl style={{ width: '100%' }}>
            <InputLabel id="demo-simple-select-label">최소 '퐁' 개수</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={pongCount}
              onChange={e => handlePongCount({ pongCount: e.target.value })}
            >
              <MenuItem value={0}>0일(연당)</MenuItem>
              <MenuItem value={1}>1일(퐁당)</MenuItem>
              <MenuItem value={2}>2일(퐁퐁당)</MenuItem>
              <MenuItem value={3}>3일(퐁퐁퐁당)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <div style={{ overflowY: 'scroll' }}>
          {people.map(person =>
            <DialogContent key={person.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '.6rem', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton edge="start" color="inherit" onClick={() => handleRemovePerson(person.id)}>
                    <CloseIcon fontSize="small" style={{ color: 'gray' }} />
                  </IconButton>
                  <div style={{ marginRight: '1rem', fontWeight: 'bold', fontSize: '1rem' }}>{person.id}</div>
                </div>
                <FormControl style={{ width: 95 }} >
                  <InputLabel htmlFor={person.id}>총 당직일수</InputLabel>
                  <Select
                    native
                    value={person.count}
                    onChange={e => handleCount({ personId: person.id, count: Number(e.target.value) })}
                    inputProps={{
                      id: person.id,
                    }}
                  >
                    <option value={0}>0일</option>
                    {
                      [...Array(currentMonthDays + 1).keys()].slice(1)
                        .map(day => <option key={day} value={day}>{day}일</option>)
                    }
                  </Select>
                </FormControl>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <DatesPicker keyName="확정날짜" person={person} />
                  <div>
                    {
                      person['확정날짜'].length > 0 && person["확정날짜"]
                        .filter(date => convertDateToString(date).slice(0, 7) === convertDateToString(currentDate).slice(0, 7))
                        .map(date => <div key={date}>{convertDateToString(date)}</div>)
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <DatesPicker keyName="불가능날짜" person={person} />
                  <div>{person["불가능날짜"].map(date => <div key={date}>{convertDateToString(date)}</div>)}</div>
                </div>
              </div>
            </DialogContent>
          )}
        </div>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
          <Button onClick={handleOKAY} color="secondary">
            채우기
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
}
