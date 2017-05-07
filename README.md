# Задание 1 · ШРИ-2017 → [Результат в Pages](http://vanyaklimenko.ru/shri-task-1)
[Веб-приложение](http://vanyaklimenko.ru/shri-task-1), позволяющее отображать расписание «Мобилизации» из JSON-файла. Написано на чистом ES6, собрано Галпом, скомпилировано Бабелем, изображения сжаты плагином `gulp-imagemin`.

Умеет:
1. Рендерить лекции из JSON-файла
2. Фильтровать лекции по школам и лекторам
3. Отмечать прошедшие и сегодняшние лекции особыми способами
4. Показывать информацию о лекторе по клику на его имя
5. Давать ссылку на видео прошедших лекций
6. Резиниться и быть красивым как на телефоне, так и на компьютере

## По порядку
Вся логика находится в файле [`assets/js/common.js`](https://github.com/vanya-klimenko/shri-task-1/blob/master/assets/js/scripts.js).
Первым делом мною была создана модель хранилища расписания, которое представляет собой упорядоченный файл, который имеет примерно следующую структуру:
```
general
    → schools
      → shri: name, students
        ...
    → lecturers
      → dushkin: name, bio, pic
        ...
    → venues
      → skit: name, lecturer, capacity
        ...
schedule
  → 0: start, end, school, mdev, venue, name, pic, video, id
    ...
```
Файл фетчится откуда угодно, так что не имеет значения, где он хранится. Я разместил его на своём сервере, чтобы иметь возможность редактировать данные и чинить что-то на лету. Можете посмотреть на него → [`http://vanyaklimenko.ru/schedule.json`](http://vanyaklimenko.ru/schedule.json). Затем, разумеется, были описаны методы парсинга и обработки этого JSON-файла — данные заносятся в объект с забавным именем [`redux`](https://github.com/vanya-klimenko/shri-task-1/blob/master/assets/js/common.js#L4).

Для рендера всего этого был реализованы метод [`renderLectures`](https://github.com/vanya-klimenko/shri-task-1/blob/master/assets/js/common.js#L71) и [`renderLecture`](https://github.com/vanya-klimenko/shri-task-1/blob/master/assets/js/common.js#L152). Работают они так:
1. Первый берёт данные из объекта `redux`
2. Если ему передаётся параметр `filters`, фильтрует лекции.
2. Сортирует лекции, (вы, наверное, могли заметить, что они группируются по разным блокам с клёвым прилипающим заголовком)
3. Раскидывает по месяцам
4. Для каждой лекции вызывает второй метод, который делает ХТМЛ-разметку со всеми данными
5. Рендерит месяца и только что полученный ХМТЛ через `append` 
 
Где-то рядом определены функции показа и скрытия модалки с информацией о лекторах.

Такие дела. 

## Прошедшие, сегодняшние и будущие лекции
Прежде всего хочу показать картинку, потому что время — вещь непостоянная и состояние сегодняшей лекции вы можете не увидеть в приложении вживую:  
  
<img src="http://vanyaklimenko.ru/i/shri-1.png" width="307">  

Определение лекций реализовано довольно просто. Проверка на сегодняшие лекции происходит путём сравнения только номера дня в месяце и номера дня сегодняшнего. Проверка на прошедшие — сравнением таймштампа начала лецкии → [`common.js:60`](https://github.com/vanya-klimenko/shri-task-1/blob/master/assets/js/common.js#L60`).

В зависимости от результатов проверки, ХТМЛ-элементам присваиваются разные ЦСС-классы, и рендерятся — либо не рендерятся — ссылки на видео.

## Фильтрация
Логика максимально изолирована от DOM-дерева, чтобы не возится с этой медленной штукой и не плодить макаронного кода. Вместо этого она рендерит новый контент, заменяя старый целиком каждый раз. Поэтому для фильтрации я просто прошу рендерить только отмеченные элементы. Готово!

---

Спасибо за внимание. 🌚
