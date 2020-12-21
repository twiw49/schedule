import {
  amber,
  blue,
  blueGrey,
  brown,
  common,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow
} from '@material-ui/core/colors';

const colorArray = [
  orange,
  green,
  pink,
  cyan,
  purple,
  red,
  teal,
  yellow,
  blueGrey,
  amber,
  brown,
  common,
  deepOrange,
  deepPurple,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
];

const convertDateToString = (dateObj) => {
  const month = dateObj.getMonth() + 1;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const output = year + '/' + month + '/' + day;
  return output
}

const makeDataObj = (data) => data.reduce((prev, curr) => {
  const date = convertDateToString(curr.startDate)
  const result = { ...prev, [date]: curr }
  return result
}, {})

const makePeopleObj = (data, people) => {
  const peopleObj = data.reduce((peopleObj, curr) => {
    const { 확정사람, 불가능사람, startDate } = curr;

    if (확정사람 in peopleObj) {
      peopleObj[확정사람]['확정날짜'] = [...peopleObj[확정사람]['확정날짜'], startDate]
    } else {
      peopleObj[확정사람] = {
        "확정날짜": [startDate],
        "불가능날짜": []
      }
    }

    불가능사람.map(id => {
      if (id in peopleObj) {
        peopleObj[id]['불가능날짜'] = [...peopleObj[id]['불가능날짜'], startDate]
      } else {
        peopleObj[id] = {
          "확정날짜": [],
          "불가능날짜": [startDate]
        }
      }
    })
    return peopleObj;
  }, {})

  return people.map(person => {
    return {
      ...person,
      ...peopleObj[person.id]
    }
  })
}

const makeId = () => {
  const length = 5
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

const settings = (state = {
  people: [],
  data: [],
  dataObj: {},
  currentDate: new Date(),
  confirmationVisible: false,
  deletedAppointmentId: undefined,
  final: [],
  pongCount: 1,
  isError: false
}, action) => {
  switch (action.type) {
    case 'REMOVE_PERSON': {
      return {
        ...state,
        people: state.people.filter(person => person.id !== action.payload.personId)
      }
    }
    case 'SET_ERROR': {
      return {
        ...state,
        isError: action.payload.isError
      }
    }
    case 'SET_PONG_COUNT': {
      return {
        ...state,
        pongCount: action.payload.pongCount
      }
    }
    case 'ADD_NEW_PERSON':
      const { newPerson } = action.payload;
      return {
        ...state,
        people: [...state.people, { text: newPerson, id: newPerson, count: 0, '확정날짜': [], "불가능날짜": [], color: colorArray[state.people.length] }]
      };

    case 'SET_COUNT':
      const { count, personId } = action.payload;
      return {
        ...state,
        people: [...state.people].map(person => {
          if (person.id === personId) {
            person.count = count
          }
          return person
        })
      }

    case 'SET_불가능날짜': {
      const { person, dates } = action.payload;
      const newDataObj = dates.reduce((prev, date) => {
        const dateStr = convertDateToString(date)
        if (dateStr in prev)
          prev[dateStr]['불가능사람'] = [...new Set([...prev[dateStr]['불가능사람'], person.id])]
        else {
          prev[dateStr] = {
            id: makeId(),
            title: '',
            '확정사람': '',
            '불가능사람': [person.id],
            startDate: date,
            endDate: new Date(date.getTime()).addHours(24),
          }
        }
        return prev
      }, { ...state.dataObj })

      return {
        ...state,
        people: state.people.map(p => {
          if (p.id === person.id) {
            p['불가능날짜'] = dates
            return p
          }
          return p
        }),
        dataObj: newDataObj,
        data: Object.values(newDataObj)
      }
    }

    case 'SET_확정날짜': {
      const { person, dates } = action.payload;
      const newDataObj = dates.reduce((prev, date) => {
        const dateStr = convertDateToString(date)
        if (dateStr in prev)
          prev[dateStr]['확정사람'] = person.id
        else {
          prev[dateStr] = {
            id: makeId(),
            title: person.id,
            '확정사람': person.id,
            '불가능사람': [],
            startDate: date,
            endDate: new Date(date.getTime()).addHours(24),
          }
        }
        return prev
      }, { ...state.dataObj })
      return {
        ...state,
        people: state.people.map(p => {
          if (p.id === person.id) {
            p['확정날짜'] = dates
            return p
          }
          return p
        }),
        dataObj: newDataObj,
        data: Object.values(newDataObj)
      }
    }

    case 'SET_SETTINGS': {
      return {
        ...state,
        ...action.payload,
        dataObj: ('data' in action.payload) ? makeDataObj(action.payload.data) : state.dataObj,
        people: ('data' in action.payload) ? makePeopleObj(action.payload.data, [...state.people]) : [...state.people]

      }
    }

    case 'SET_FINAL': {
      return {
        ...state,
        ...action.payload,
      }
    }

    default:
      return state;
  }
};

export default settings;
