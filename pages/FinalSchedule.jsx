import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Resources,
  MonthView,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  EditRecurrenceMenu,
  DragDropProvider,
} from '@devexpress/dx-react-scheduler-material-ui';

const FinalScedule = ({ classes, finalData, finalIndex }) => {
  const {
    people,
    currentDate,
  } = useSelector((store) => {
    return { ...store.settings }
  });

  const [state, setState] = useState({
    data: finalData[finalIndex],
    resources: [
      {
        fieldName: '확정사람',
        title: '확정',
        instances: people,
      },
      {
        fieldName: '불가능사람',
        title: '불가능',
        instances: people,
        allowMultiple: true,
      },
    ]
  })

  useEffect(() => {
    setState(prev => ({
      ...prev,
      data: finalData[finalIndex]
    }))
  }, [finalIndex])

  const commitChanges = ({ changed }) => {
    setState((prev) => {
      let { data } = prev;
      if (changed) {
        const nextData = data
          .map(appointment => (changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment))
          .map(appointment => {
            if (appointment['확정사람']) appointment['title'] = appointment['확정사람']
            return appointment
          });
        return { ...prev, data: nextData };
      }
    });
  }

  const { data, resources } = state;

  return (
    <Paper>
      <Scheduler
        data={data}
      >
        <ViewState
          defaultCurrentDate={currentDate}
        />
        <EditingState
          onCommitChanges={commitChanges}
        />
        <EditRecurrenceMenu />
        <MonthView />
        <Appointments />
        <AppointmentTooltip
          showOpenButton
        />
        <AppointmentForm />
        <Resources
          data={resources}
          mainResourceName="확정사람"
        />
        <DragDropProvider />
      </Scheduler>
    </Paper>
  );
}

export default FinalScedule