import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import MultipleDatesPicker from '@randex/material-ui-multiple-dates-picker'
import Button from '@material-ui/core/Button';


const DatesPicker = ({ keyName, person }) => {
  const dispatch = useDispatch();
  const { selectedPerson, people } = useSelector((state) => {
    return {
      selectedPerson: state.settings.people.filter(p => p.id === person.id)[0],
      people: state.settings.people
    }
  });

  const handleError = (error) => {
    dispatch({
      type: 'SET_ERROR',
      payload: {
        isError: error
      }
    })
  }

  const convertDateToString = (dateObj) => {
    const month = dateObj.getMonth() + 1;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const output = year + '/' + month + '/' + day;
    return output
  }

  const [open, setOpen] = useState(false)
  const handleSumit = dates => {
    const datesStr = dates.map(date => convertDateToString(date))
    if (keyName === '확정날짜') {
      let allDates = people.filter(person => person.id !== selectedPerson.id).map(person => person["확정날짜"])
      allDates = [].concat(...allDates).map(date => convertDateToString(date))
      const duplicated = datesStr.filter(date => allDates.indexOf(date) !== -1).sort()

      if (duplicated.length > 0) {
        handleError(duplicated.join(', ') + ' : 이미 등록된 확정날짜입니다.')
        return
      }
    }

    dispatch({
      type: "SET_" + keyName,
      payload: {
        person,
        dates
      }
    })
    setOpen(false)
  }

  const handleCancel = () => {
    dispatch({
      type: "SET_" + keyName,
      payload: {
        person,
        dates: []
      }
    })
    setOpen(false)
  }

  return (
    <div>
      <Button variant="outlined" onClick={() => setOpen(!open)}>
        {keyName}
      </Button>
      <MultipleDatesPicker
        open={open}
        selectedDates={selectedPerson[keyName]}
        onCancel={handleCancel}
        onSubmit={handleSumit}
        cancelButtonText="모두취소"
        submitButtonText="적용"
      />
    </div>
  )
}

export default DatesPicker