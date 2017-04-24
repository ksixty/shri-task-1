const SCHEDULE_LINK = '//vanya-klimenko.github.io/shri-task-1/assets/js/schedule.json'
const SCHEDULE_DOM = document.querySelector('#schedule')

const redux = {
    general: {
        schools: {},
        lecturers: {}
    },
    schedule: {}
}

const fetchSchedule = () => {
    return new Promise((resolve, reject) => {
        fetch(SCHEDULE_LINK)
            .then(r => r.json())
            .then(r => resolve(r))
            .catch(e => reject(e))
        })
}

fetchSchedule().then(json => {
    const { schedule, general } = json
    console.log(json)

    redux.general.schools = general.schools
    redux.general.lecturers = general.lecturers

    redux.schedule = schedule

    renderLectures()
})

const getMonth = time => {
    if (!time) return false
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь'
    ]
    time = new Date(time)
    return months[time.getMonth()] || false
}

const getDayOfTheWeek = time => {
    if (!time) return false
    const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
    const currentDay = new Date(time).getDay()
    if (currentDay > 4) {
        let weekend = 'event__date-week--weekend';
    } 
    return days[currentDay]
}

const filterLectures = (lectures, filters) => {
    return lectures
}

const renderLectures = filters => {
    const lectures = redux.schedule
    if (!lectures) return false

    const monthHashTable = {}

    for (let i = 0; i < 12; i++) {
        monthHashTable[i] = []
    }

    let lecturesArray = []
    for (const lectureIndex in lectures) {
        const lecture = lectures[lectureIndex]
        lecturesArray.push(lecture)
    }

    // TODO: make nice filters
    // lecturesArray = lecturesArray.filter(lecture => {
    //     return lecture.school === 'mdev'
    // })

    lecturesArray.forEach(lecture => {
        const { date, school } = lecture

        const month = new Date(date).getMonth()
        const domLecture = renderLecture(lecture)
        const curr = monthHashTable[month]
        curr.push(domLecture)
        monthHashTable[month] = curr
    })

    for (const monthNumber in monthHashTable) {
        const lectures = monthHashTable[monthNumber]
        if (lectures.length > 0) {

            const monthDOM = document.createElement('div')
            monthDOM.innerHTML =
             `
                <div class="schedule__month month month--expanded">
                    <div class="schedule__title">${getMonth(monthNumber)}</div>
                    ${lectures.join('')}
                </div>
             `
            SCHEDULE_DOM.appendChild(monthDOM)
        }
    }
}

const getLecturer = _lecturer => {
    const { lecturers } = redux.general
    const lecturer = lecturers[_lecturer]
    return {
        name: lecturer.name,
        company: lecturer.company || 'Яндекс',
        bio: lecturer.bio
    }
}

const getSchool = school => {
    const { schools } = redux.general
    
    if (!school) return schools.all
    return schools[school]
}

const renderLecture = lecture => {
    const { school, name, lecturer, pic, date, venue } = lecture
    const _lecturer = getLecturer(lecturer)

    const lectureHTML = 
    `
        <div class="schedule__event event">
            <div class="event__header event__header--${school || 'all'}">
                <div class="event__school">${getSchool(school)}</div>
            </div>
            <img class="event__pic" src="${pic}">
            <div class="event__title">
                <div class="event__date">
                    <div class="event__date-number">${new Date(date).getDate()}</div>
                    <div class="event__date-week">${getDayOfTheWeek(date)}</div>
                </div>
                <div class="event__text">
                    <div class="event__name">${name}</div>
                    <div class="event__meta meta">
                        <div class="meta__item meta__item--lecturer">${_lecturer.name}</div>
                        <div class="meta__item meta__item--company">${_lecturer.company}</div>
                        <div class="meta__item meta__item--place">${venue}</div>
                    </div>
                </div>
            </div>
        </div>
    `

    return lectureHTML
}
