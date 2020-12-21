const G = require('generatorics')

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}

const convertDateToString = (dateObj) => {
  const month = dateObj.getMonth() + 1;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const output = year + '/' + month + '/' + day;
  return output
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

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function factorial(number) {
  var value = number;
  for (var i = number; i > 1; i--)
    value *= i - 1;
  return value;
};

function combination(n, r) {
  if (n == r) return 1;
  return factorial(n) / (factorial(r) * factorial(n - r));
};

const getFinal = ({ people, dataObj, currentDate, pongCount, handleError, handleFinal }) => {
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const getPossibleDays = ({ monthDataObj, personId, interval }) => {
    const impossibleDays = Object.keys(monthDataObj).reduce((prev, date) => {
      const { 확정사람, 불가능사람 } = monthDataObj[date]
      let result = [...prev]
      if (확정사람) {
        if (personId === 확정사람) {
          const days_exclude = interval === 0 ?
            [
              ...prev,
              convertDateToString(new Date(date))
            ] :
            [...Array(interval + 1).keys()].slice(1).reduce((prev, curr) => {
              return [
                ...prev,
                convertDateToString(new Date(date)),
                convertDateToString(new Date(date).addHours(24 * curr)),
                convertDateToString(new Date(date).addHours(24 * curr * -1))
              ]
            }, [])
          result = [...result, ...days_exclude]
        } else {
          result = [...result, date]
        }
      }
      if (불가능사람.includes(personId)) result = [...result, date]
      return result
    }, [])

    return Object.keys(monthDataObj).filter(date => !impossibleDays.includes(date))
  }

  const filterCombis = (combis, interval) =>
    combis.filter(combi => {
      const days_exclude = [...Array(interval + 1).keys()].slice(1).reduce((prev, curr) => {
        return [
          ...prev,
          ...combi.map(date => convertDateToString(new Date(date).addHours(24 * curr)))
        ]
      }, [])
      const intersection = combi.filter(x => days_exclude.includes(x));
      return intersection.length === 0
    })

  const monthDataObj = [...Array(currentMonthDays + 1).keys()].slice(1).map(day => {
    return currentYear + '/' + String(currentMonth).padStart(2, '0') + '/' + String(day).padStart(2, '0');
  }).reduce((prev, date) => {
    if (date in dataObj) {
      prev[date] = dataObj[date]
    } else {
      prev[date] = {
        id: makeId(),
        title: '',
        '확정사람': '',
        '불가능사람': [],
        startDate: new Date(date),
        endDate: new Date(new Date(date).getTime()).addHours(24),
      }
    }
    return prev
  }, {})

  let final = []

  const factorial = (monthDataObj, interval, personIdx) => {
    const possibleDays = getPossibleDays({ monthDataObj, personId: people[personIdx].id, interval })
    const moreDaysLength = people[personIdx].count - people[personIdx]["확정날짜"].filter(date => convertDateToString(date).slice(0, 7) === convertDateToString(currentDate).slice(0, 7)).length
    console.log({ possibleDays, moreDaysLength, personIdx })

    if (personIdx === 0) {
      const combNum = parseInt(combination(possibleDays.length, moreDaysLength))
      console.log({ combNum })
      if (combNum > 100000) {
        handleError(combNum.toLocaleString() + '개!! ' + '경우의 수가 너무 많습니다. 조건을 설정해주세요.')
        return false;
      }
    }

    const combis = [...G.clone.combination(possibleDays, moreDaysLength)]
    shuffle(combis)

    const filteredCombis = filterCombis(combis, interval).map(combi => combi.concat(people[personIdx]["확정날짜"].map(date => convertDateToString(date))))
    const monthDataObjArray = filteredCombis.map(dates => {
      return dates.reduce((prev, date) => {
        if (date in prev) {
          prev[date]['title'] = people[personIdx].id
          prev[date]['확정사람'] = people[personIdx].id
        }
        return prev
      }, JSON.parse(JSON.stringify(monthDataObj)))
    })

    if (personIdx === people.length - 1) {
      final = [...final, ...monthDataObjArray]
    }

    personIdx = personIdx + 1
    if (personIdx === people.length) return;

    for (let i = 0; i < monthDataObjArray.length; i++) {
      factorial(monthDataObjArray[i], interval, personIdx)
      if (final.length > 100) break
    }

    return true
  }
  shuffle(final)
  const result = factorial(monthDataObj, pongCount, 0)

  if (result) {
    if (final.length === 0) {
      handleError('경우의 수가 없습니다. 조건을 다시 설정해주세요.')
      return false;
    }
    handleFinal(final)
    return true;
  }
  return false;
}

export default getFinal