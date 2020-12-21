/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-unused-state */
import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Toolbar,
  MonthView,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  DragDropProvider,
  EditRecurrenceMenu,
  DateNavigator,
  TodayButton,
  Resources
} from '@devexpress/dx-react-scheduler-material-ui';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import Settings from './Settings'
import Final from './Final'
import ErrorBar from './ErrorBar'

const styles = theme => ({
});

const Demo = ({ classes }) => {
  const dispatch = useDispatch();
  const {
    people,
    data,
    currentDate,
    confirmationVisible,
    deletedAppointmentId,
  } = useSelector((store) => {
    return { ...store.settings }
  });

  const resources = [
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
  ];

  const setSettings = (payload) => dispatch({
    type: 'SET_SETTINGS',
    payload
  })

  const currentDateChange = (currentDate) => setSettings({ currentDate });
  const setDeletedAppointmentId = (id) => setSettings({ deletedAppointmentId: id })
  const toggleConfirmationVisible = () => setSettings({ confirmationVisible: !confirmationVisible })

  const commitDeletedAppointment = () => {
    const nextData = data
      .filter(appointment => appointment.id !== deletedAppointmentId)
      .map(appointment => {
        if (appointment['확정사람']) appointment['title'] = appointment['확정사람']
        return appointment
      })
    setSettings({ data: nextData, deletedAppointmentId: null })
    toggleConfirmationVisible();
  }

  const commitChanges = ({ added, changed, deleted }) => {
    if (added) {
      const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
      const nextData = [...data, { id: startingAddedId, ...added }].map(appointment => {
        if (appointment['확정사람']) appointment['title'] = appointment['확정사람']
        return appointment
      });
      setSettings({ data: nextData })
    }
    if (changed) {
      const nextData = data
        .map(appointment => (changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment))
        .map(appointment => {
          if (appointment['확정사람']) appointment['title'] = appointment['확정사람']
          return appointment
        });
      setSettings({ data: nextData })
    }
    if (deleted !== undefined) {
      setDeletedAppointmentId(deleted);
      toggleConfirmationVisible();
    }
  }

  return (
    <Fragment>
      <Paper>
        <Scheduler
          data={data}
          height="100vh"
        >
          <ViewState
            currentDate={currentDate}
            onCurrentDateChange={currentDateChange}
          />
          <EditingState
            onCommitChanges={commitChanges}
          />
          <MonthView />
          <EditRecurrenceMenu />
          <Appointments />
          <AppointmentTooltip
            showOpenButton
            showCloseButton
            showDeleteButton
          />
          <Toolbar />
          <DateNavigator />
          <TodayButton />
          <AppointmentForm />
          <Resources
            data={resources}
            mainResourceName="확정사람"
          />
          <DragDropProvider allowResize={() => false} />
        </Scheduler>

        <Dialog
          open={confirmationVisible}
          onClose={(e) => console.log(e)}
        >
          <DialogTitle>
            Delete Appointment
     </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this appointment?
       </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleConfirmationVisible} color="primary" variant="outlined">
              Cancel
       </Button>
            <Button onClick={commitDeletedAppointment} color="secondary" variant="outlined">
              Delete
       </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem', position: 'absolute', top: 0, right: 24 }}>
        <Settings />
        <Final />
      </div>
      <ErrorBar />
    </Fragment>
  );
}

export default withStyles(styles)(Demo);
