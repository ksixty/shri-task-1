const SCHEDULE_LINK = '//vanyaklimenko.ru/schedule.json'
const SCHEDULE_DOM = document.querySelector('#schedule')

const redux = {
    general: {
        schools: {},
        lecturers: {},
        venues: {}
    },
    venues: {},
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

    redux.general.schools = general.schools
    redux.general.lecturers = general.lecturers
    redux.general.venues = general.venues

    redux.schedule = schedule

    renderLectures()
})

const getMonth = time => {
    if (!time) return false
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель',
        'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
    time = new Date(time)
    return months[time.getMonth() + 1]
}

const getDayOfTheWeek = time => {
    if (!time) return false
    const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
    const currentDay = new Date(time).getDay() - 1
    return days[currentDay]
}

const getTime = time => {
    return new Date(time).toLocaleTimeString([], {
        hour12: false,
        hour: '2-digit',
        minute:'2-digit'
    })
}

const isToday = (eventStart) => {
    const today = new Date()
    const start = new Date(eventStart)
    if (today.getDate() == start.getDate()) return 'event__date--today'
        else if (today.getTime() > start.getTime()) return 'event__date--obsolete'
}

// const filterLectures = (lectures, filters) => {
//     return lectures
// }

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

    if (filters) {
        lecturesArray = lecturesArray.filter(lecture => {
            return lecture.school === filters
        })
    }

    lecturesArray.forEach(lecture => {
        const { start, end, school, venue } = lecture

        const month = new Date(start).getMonth()
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
    return schools[school]
}

const getVenue = venue => {
    const { venues } = redux.general
    return venues[venue] 
}

const renderVideo = (lecture, obsolete) => {
    if (obsolete) { 
        return  `
                <div class="event__video video">
                    <div class="video__hero">Лекция прошла, смотрите видео</div>
                    <img class="event__pic event__pic--video" src="${lecture.pic}">
                </div>
                `
    }
    else return `<img class="event__pic" src="${lecture.pic}">`
}

const renderLecture = lecture => {
    const { school, name, lecturer, pic, start, end, venue, id, video } = lecture
    const _lecturer = getLecturer(getVenue(venue).lecturer)
    const obsolete = (isToday(start) === 'event__date--obsolete')

    const lectureHTML = 
    `
        <div class="schedule__event event">
            <div class="event__header event__header--${school}">
                <div class="event__school">${getSchool(school).name}</div>
            </div>
            ${renderVideo(lecture, obsolete)}
            <div class="event__title">
                <div class="event__date ${isToday(start) || ''}">
                    <div class="event__date-number">${new Date(start).getDate()}</div>
                    <div class="event__date-week">${getDayOfTheWeek(start)}</div>
                </div>
                <div class="event__text">
                    ${obsolete ? '<div class="event__name event__name--link" onclick="window.open(\''+video+'\')">'+name+'<svg class="event__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508.492 508.492"><path d="M504.15 158.24c-2.829-33.848-23.011-76.532-64.487-78.058-115.815-7.787-253.02-9.916-370.933 0-36.582 4.1-61.658 48.659-64.391 82.507-5.784 71.097-5.784 111.557 0 182.654 2.765 33.848 27.206 78.662 64.455 83.365 119.311 7.787 255.849 8.899 370.933 0 36.105-6.261 61.69-49.517 64.455-83.365 5.752-71.129 5.752-116.006-.032-187.103zM190.647 344.199V161.926l158.912 91.152-158.912 91.121z"/></svg></div>' : '<div class="event__name">'+name+'</div>'}
                    <div class="event__meta meta">
                        <div class="meta__item meta__item--lecturer" onclick="showLecturer(${getVenue(venue).lecturer})">${_lecturer.name}</div>
                        <div class="meta__item meta__item--company">${_lecturer.company}</div>
                        <div class="meta__item meta__item--location">
                            <div class="meta__item meta__item--venue">
                                <svg class="meta__icon" xmlns="http://www.w3.org/2000/svg" width="430.114" height="430.114" viewBox="0 0 430.114 430.114"><path d="M356.208 107.051c-1.531-5.738-4.64-11.852-6.94-17.205C321.746 23.704 261.611 0 213.055 0 148.054 0 76.463 43.586 66.905 133.427v18.355c0 .766.264 7.647.639 11.089 5.358 42.816 39.143 88.32 64.375 131.136 27.146 45.873 55.314 90.999 83.221 136.106 17.208-29.436 34.354-59.259 51.17-87.933 4.583-8.415 9.903-16.825 14.491-24.857 3.058-5.348 8.9-10.696 11.569-15.672 27.145-49.699 70.838-99.782 70.838-149.104v-20.262c.001-5.347-6.627-24.081-7-25.234zm-141.963 92.142c-19.107 0-40.021-9.554-50.344-35.939-1.538-4.2-1.414-12.617-1.414-13.388v-11.852c0-33.636 28.56-48.932 53.406-48.932 30.588 0 54.245 24.472 54.245 55.06 0 30.587-25.305 55.051-55.893 55.051z"/></svg>
                                ${getVenue(venue).name}
                            </div>
                            <div class="meta__item meta__item--time">${getTime(start)}−${getTime(end)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `

    return lectureHTML
}

// const showLecturer = id => {
//     const { lecturers } = redux.general
//     const lecturer = lecturers[id]
//     const lecturerMeta = {
//         name: lecturer.name,
//         company: lecturer.company || 'Яндекс',
//         bio: lecturer.bio
//     }
//     const lecturerHTML =
//     `
//         <div class="lecturer">
//             <div></div>
//         </div>
//     `
//     const lecturerDOM = document.createElement('div')
//     lecturerDOM.innerHTML =
//      `
//         <div class="schedule__month month month--expanded">
//             <div class="schedule__title">${getMonth(monthNumber)}</div>
//             ${lectures.join('')}
//         </div>
//      `
//     body.appendChild(monthDOM)

// }