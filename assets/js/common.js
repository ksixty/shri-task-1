const SCHEDULE_LINK = 'https://vanyaklimenko.ru/schedule.json'
const SCHEDULE_DOM = document.querySelector('#schedule')
let SCHOOL_FILTERS = []
let LECTURER_FILTERS = []

// Редакс - это шутка
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

const toggleFilter = (newFilter, filtersArray) => {
    const filterIndex = filtersArray.indexOf(newFilter)

    if (filterIndex > -1) {
        document.getElementById(newFilter).classList.remove('tabs__opiton--chosen');
        filtersArray.splice(filterIndex, 1)
    } else {
        document.getElementById(newFilter).classList.add('tabs__opiton--chosen');
        filtersArray.push(newFilter);
    }

    renderLectures()
}

const hideSpinner = () => {
    document.querySelector('.spinner').classList.add('spinner--hidden')
}

const renderLectures = () => {
    SCHEDULE_DOM.innerHTML = ''
    SCHEDULE_DOM.classList.add('schedule--hidden')

    const lectures = redux.schedule
    const venues = redux.general.venues
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

    if (SCHOOL_FILTERS.length > 0) {
        lecturesArray = lecturesArray.filter(lecture => {
            return (SCHOOL_FILTERS.indexOf(lecture.school) > -1)
        })
    }

    if (LECTURER_FILTERS.length > 0) {
        lecturesArray = lecturesArray.filter(lecture => {
            return (LECTURER_FILTERS.indexOf(venues[lecture.venue].lecturer) > -1)
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

    if (lecturesArray.length == 0) {
        const emptyDOM = document.createElement('div')
        emptyDOM.innerHTML = 
        `
            <div class="schedule__error error">
                <svg class="error__pic" width="51px" height="86px" viewBox="352 259 51 86" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M375.556,326.099 C375.556,322.872317 375.838331,320.028846 376.403,317.5685 C376.967669,315.108154 377.733995,312.91001 378.702,310.974 C379.670005,309.03799 380.799327,307.283508 382.09,305.7105 C383.380673,304.137492 384.751993,302.66534 386.204,301.294 C387.656007,299.92266 389.107993,298.490841 390.56,296.9985 C392.012007,295.506159 393.302661,293.953341 394.432,292.34 C395.561339,290.726659 396.46883,288.992343 397.1545,287.137 C397.84017,285.281657 398.183,283.305344 398.183,281.208 C398.183,278.223318 397.638505,275.662177 396.5495,273.5245 C395.460495,271.386823 394.008509,269.612174 392.1935,268.2005 C390.378491,266.788826 388.301345,265.760337 385.962,265.115 C383.622655,264.469663 381.202679,264.147 378.702,264.147 C375.071982,264.147 371.88568,264.751994 369.143,265.962 C366.40032,267.172006 364.121509,268.865989 362.3065,271.044 C360.491491,273.222011 359.120171,275.783152 358.1925,278.7275 C357.264829,281.671848 356.801,284.878316 356.801,288.347 L352.203,288.347 C352.203,284.071645 352.787827,280.159351 353.9575,276.61 C355.127173,273.060649 356.841322,270.015513 359.1,267.4745 C361.358678,264.933487 364.161817,262.97734 367.5095,261.606 C370.857183,260.23466 374.708978,259.549 379.065,259.549 C382.291683,259.549 385.336819,259.992662 388.2005,260.88 C391.064181,261.767338 393.584989,263.098324 395.763,264.873 C397.941011,266.647676 399.65516,268.90632 400.9055,271.649 C402.15584,274.39168 402.781,277.577982 402.781,281.208 C402.781,283.789346 402.478503,286.068157 401.8735,288.0445 C401.268497,290.020843 400.461838,291.815659 399.4535,293.429 C398.445162,295.042341 397.295673,296.514493 396.005,297.8455 C394.714327,299.176507 393.38334,300.487327 392.012,301.778 C390.64066,302.988006 389.249174,304.258493 387.8375,305.5895 C386.425826,306.920507 385.155339,308.513657 384.026,310.369 C382.896661,312.224343 381.969004,314.422487 381.243,316.9635 C380.516996,319.504513 380.154,322.549649 380.154,326.099 L375.556,326.099 Z M374.03,340.622 C374.03,338.409547 375.828049,336.616 378.036,336.616 L378.036,336.616 C380.248453,336.616 382.042,338.414049 382.042,340.622 L382.042,340.622 C382.042,342.834453 380.243951,344.628 378.036,344.628 L378.036,344.628 C375.823547,344.628 374.03,342.829951 374.03,340.622 L374.03,340.622 Z" id="?" stroke="none"></path></svg>
                <div class="error__hero">Таких лекций нет</div>
                <div class="error__text">Попробуйте изменить критерии</div>
            </div>
        `;
        SCHEDULE_DOM.appendChild(emptyDOM)
    }

    hideSpinner()

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
            `;
            SCHEDULE_DOM.appendChild(monthDOM)
        }
    }
    SCHEDULE_DOM.classList.remove('schedule--hidden')
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
    `;

    return lectureHTML
}

const showLecturer = id => {
    const { lecturers } = redux.general
    const lecturer = lecturers[id]
    const lecturerMeta = {
        name: lecturer.name,
        company: lecturer.company || 'Яндекс',
        bio: lecturer.bio
    }
    const lecturerHTML =
    `
        <div class="lecturer">
            <div></div>
        </div>
    `
    const lecturerDOM = document.createElement('div')
    lecturerDOM.innerHTML =
     `
        <div class="schedule__month month month--expanded">
            <div class="schedule__title">${getMonth(monthNumber)}</div>
            ${lectures.join('')}
        </div>
     `
    body.appendChild(monthDOM)

}