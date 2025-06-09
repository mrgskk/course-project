document.addEventListener('DOMContentLoaded', function() {
    // Текущая дата
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = new Date();
    
    // Модальные окна
    const eventModal = document.getElementById('event-modal');
    const authModal = document.getElementById('auth-modal');
    const addEventBtn = document.getElementById('add-event-btn');
    const closeButtons = document.querySelectorAll('.close');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authSwitchLink = document.getElementById('auth-switch-link');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authNameGroup = document.getElementById('auth-name-group');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authForm = document.getElementById('auth-form');
    
    // Форма события
    const eventForm = document.getElementById('event-form');
    const eventTitle = document.getElementById('event-title');
    const eventDate = document.getElementById('event-date');
    const eventTime = document.getElementById('event-time');
    const eventCategory = document.getElementById('event-category');
    const eventDescription = document.getElementById('event-description');
    const eventShare = document.getElementById('event-share');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendsList = document.getElementById('friends-list');
    const saveEventBtn = document.getElementById('save-event-btn');
    const deleteEventBtn = document.getElementById('delete-event-btn');
    const modalTitle = document.getElementById('modal-title');
    
    // Календарь
    const currentMonthElement = document.getElementById('current-month');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    // События
    const eventsDate = document.getElementById('events-date');
    const eventsContainer = document.getElementById('events-container');
    
    // Состояние приложения
    let events = JSON.parse(localStorage.getItem('events')) || [];
    let friends = [];
    let isEditing = false;
    let currentEventId = null;
    let isLoginMode = true;
    let isLoggedIn = false;

    // Элементы поиска
    const eventSearch = document.getElementById('event-search');
    const searchBtn = document.getElementById('search-btn');
    
    // Инициализация приложения
    function init() {
        renderCalendar();
        renderEvents(selectedDate);
        
        // Установка текущей даты в форме
        const formattedDate = formatDateForInput(selectedDate);
        eventDate.value = formattedDate;
        
        // Проверяем, был ли пользователь авторизован ранее
        checkAuthStatus();
        
        // Добавляем обработчики для фильтрации по категориям
        setupCategoryFilters();
    }

    
    // Настройка фильтров по категориям
    function setupCategoryFilters() {
        const categoryElements = document.querySelectorAll('.category-filter');
        
        categoryElements.forEach(element => {
            element.addEventListener('click', function() {
                const category = this.dataset.category;
                filterEventsByCategory(category);
                
                // Обновляем активный фильтр
                categoryElements.forEach(el => el.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Кнопка "Все" для сброса фильтра
        document.getElementById('all-categories').addEventListener('click', function() {
            renderEvents(selectedDate);
            categoryElements.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
        });
    }
    
    function filterEventsByCategory(category) {
        const filteredEvents = events.filter(event => event.category === category);
        
        eventsContainer.innerHTML = '';
        
        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = '<p>Нет событий в этой категории</p>';
            return;
        }
        
        // Группируем события по дате
        const eventsByDate = {};
        filteredEvents.forEach(event => {
            const dateStr = new Date(event.date).toLocaleDateString('ru-RU');
            if (!eventsByDate[dateStr]) {
                eventsByDate[dateStr] = [];
            }
            eventsByDate[dateStr].push(event);
        });
        
         // Сортируем даты
        const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
            return new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-'));
        });
        
        // Отображаем события
        sortedDates.forEach(dateStr => {
            const dateHeader = document.createElement('h3');
            dateHeader.className = 'category-date-header';
            dateHeader.textContent = dateStr;
            eventsContainer.appendChild(dateHeader);
            
            eventsByDate[dateStr].forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event-card ${event.category}`;
                eventElement.dataset.id = event.id;
                
                let timeHTML = '';
                if (event.time) {
                    timeHTML = `<div class="event-time">${event.time}</div>`;
                }
                
                eventElement.innerHTML = `
                    <h4>${event.title}</h4>
                    ${timeHTML}
                    <div class="event-description">${event.description || ''}</div>
                `;
                
                eventElement.addEventListener('click', () => editEvent(event.id));
                eventsContainer.appendChild(eventElement);
            });
        });
    }
    
    // Проверка статуса авторизации
    function checkAuthStatus() {
        const authStatus = localStorage.getItem('isLoggedIn');
        if (authStatus === 'true') {
            isLoggedIn = true;
            updateAuthUI();
        }
    }
    
   // Обновление UI в зависимости от статуса авторизации
    function updateAuthUI() {
        if (isLoggedIn) {
            loginBtn.textContent = 'Выйти';
            registerBtn.style.display = 'none';
            addEventBtn.style.display = 'block';
            // Показываем навигацию только для авторизованных пользователей
            document.querySelector('.main-nav').style.display = 'flex';
            renderCalendar();
            renderEvents(selectedDate);
        } else {
            loginBtn.textContent = 'Войти';
            registerBtn.style.display = 'inline-block';
            addEventBtn.style.display = 'none';
            // Скрываем навигацию для неавторизованных
            document.querySelector('.main-nav').style.display = 'none';
            eventsContainer.innerHTML = '<p>Пожалуйста, войдите для просмотра событий</p>';
            document.querySelectorAll('.day.has-events').forEach(day => {
                day.classList.remove('has-events');
            });
        }
    }
    
    // Форматирование даты для input[type="date"]
    function formatDateForInput(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        
        return [year, month, day].join('-');
    }
    
    // Рендер календаря
    function renderCalendar() {
        // Очистка календаря
        calendarDays.innerHTML = '';
        
        // Заголовки дней недели
        const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day-header';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        });
        
        // Первый день месяца
        const firstDay = new Date(currentYear, currentMonth, 1);
        // Последний день месяца
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        // День недели первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Преобразуем к 0-6 (пн-вс)
        
        // Обновление заголовка месяца
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        // Добавляем пустые ячейки для дней предыдущего месяца (для выравнивания)
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Дни текущего месяца
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = i;
            
            const date = new Date(currentYear, currentMonth, i);
            
            // Проверка на сегодняшний день
            if (isSameDay(date, new Date())) {
                dayElement.classList.add('today');
            }
            
            // Проверка на выбранный день
            if (isSameDay(date, selectedDate)) {
                dayElement.classList.add('selected');
            }
            
            // Проверка на наличие событий (только если пользователь авторизован)
            if (isLoggedIn && hasEventsOnDate(date)) {
                dayElement.classList.add('has-events');
            }
            
            dayElement.addEventListener('click', () => selectDate(date));
            calendarDays.appendChild(dayElement);
        }
        
        // Добавляем CSS для пустых ячеек
        const style = document.createElement('style');
        style.textContent = `
            .day.empty {
                visibility: hidden;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
    // Проверка на совпадение дат (без времени)
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    // Проверка наличия событий на дату
    function hasEventsOnDate(date) {
        return events.some(event => isSameDay(new Date(event.date), date));
    }
    
    // Выбор даты
    function selectDate(date) {
        selectedDate = date;
        renderCalendar();
        renderEvents(date);
        
        // Обновление заголовка событий
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        eventsDate.textContent = `События на ${date.toLocaleDateString('ru-RU', options)}`;
    }
    
    // Рендер событий
    function renderEvents(date) {
        eventsContainer.innerHTML = '';
        
        if (!isLoggedIn) {
            eventsContainer.innerHTML = '<p>Пожалуйста, войдите для просмотра событий</p>';
            return;
        }
        
        const filteredEvents = events.filter(event => isSameDay(new Date(event.date), date));
        
        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = '<p>Нет событий на эту дату</p>';
            return;
        }
        
        filteredEvents.sort((a, b) => {
            if (a.time && b.time) {
                return a.time.localeCompare(b.time);
            }
            return 0;
        });
        
        filteredEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-card ${event.category}`;
            eventElement.dataset.id = event.id;
            
            let timeHTML = '';
            if (event.time) {
                timeHTML = `<div class="event-time">${event.time}</div>`;
            }
            
            eventElement.innerHTML = `
                <h4>${event.title}</h4>
                ${timeHTML}
                <div class="event-description">${event.description || ''}</div>
            `;
            
            eventElement.addEventListener('click', () => editEvent(event.id));
            eventsContainer.appendChild(eventElement);
        });
    }
    
    // Переключение месяца
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Открытие модального окна для добавления события
    addEventBtn.addEventListener('click', () => {
        if (!isLoggedIn) return;
        
        isEditing = false;
        currentEventId = null;
        modalTitle.textContent = 'Добавить новое событие';
        eventForm.reset();
        friends = [];
        renderFriendsList();
        deleteEventBtn.classList.add('hidden');
        
        // Установка выбранной даты
        eventDate.value = formatDateForInput(selectedDate);
        
        openModal(eventModal);
    });
    
    // Редактирование события
    function editEvent(id) {
        if (!isLoggedIn) return;
        
        const event = events.find(e => e.id === id);
        if (!event) return;
        
        isEditing = true;
        currentEventId = id;
        modalTitle.textContent = 'Редактировать событие';
        deleteEventBtn.classList.remove('hidden');
        
        // Заполнение формы
        eventTitle.value = event.title;
        eventDate.value = formatDateForInput(new Date(event.date));
        eventTime.value = event.time || '';
        eventCategory.value = event.category;
        eventDescription.value = event.description || '';
        
        friends = event.sharedWith || [];
        renderFriendsList();
        
        openModal(eventModal);
    }
    
    // Рендер списка друзей
    function renderFriendsList() {
        friendsList.innerHTML = '';
        friends.forEach((friend, index) => {
            const friendElement = document.createElement('div');
            friendElement.className = 'friend-tag';
            friendElement.innerHTML = `
                ${friend}
                <button data-index="${index}">&times;</button>
            `;
            friendsList.appendChild(friendElement);
        });
        
        // Обработчики удаления друзей
        document.querySelectorAll('.friend-tag button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                friends.splice(index, 1);
                renderFriendsList();
            });
        });
    }
    
    // Добавление друга
    addFriendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = eventShare.value.trim();
        if (email && !friends.includes(email)) {
            friends.push(email);
            eventShare.value = '';
            renderFriendsList();
        }
    });
    
    // Сохранение события
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const event = {
            id: isEditing ? currentEventId : Date.now().toString(),
            title: eventTitle.value,
            date: eventDate.value,
            time: eventTime.value,
            category: eventCategory.value,
            description: eventDescription.value,
            sharedWith: [...friends]
        };
        
        if (isEditing) {
            // Обновление существующего события
            const index = events.findIndex(e => e.id === currentEventId);
            if (index !== -1) {
                events[index] = event;
            }
        } else {
            // Добавление нового события
            events.push(event);
        }
        
        // Сохранение в localStorage
        localStorage.setItem('events', JSON.stringify(events));
        
        // Обновление интерфейса
        renderCalendar();
        renderEvents(selectedDate);
        closeModal(eventModal);
    });
    
    // Удаление события
    deleteEventBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите удалить это событие?')) {
            events = events.filter(e => e.id !== currentEventId);
            localStorage.setItem('events', JSON.stringify(events));
            renderCalendar();
            renderEvents(selectedDate);
            closeModal(eventModal);
        }
    });
    
    // Управление модальными окнами
    function openModal(modal) {
        modal.style.display = 'block';
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    
    // Функция переключения в режим входа
    function switchToLoginMode() {
        isLoginMode = true;
        authModalTitle.textContent = 'Вход';
        authNameGroup.classList.add('hidden');
        authSubmitBtn.textContent = 'Войти';
        document.getElementById('auth-switch-text').textContent = 'Нет аккаунта? ';
        authSwitchLink.textContent = 'Зарегистрироваться';
    }
    
    // Функция переключения в режим регистрации
    function switchToRegisterMode() {
        isLoginMode = false;
        authModalTitle.textContent = 'Регистрация';
        authNameGroup.classList.remove('hidden');
        authSubmitBtn.textContent = 'Зарегистрироваться';
        document.getElementById('auth-switch-text').textContent = 'Уже есть аккаунт? ';
        authSwitchLink.textContent = 'Войти';
    }
    
    // Авторизация/регистрация
    loginBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            // Выход из аккаунта
            isLoggedIn = false;
            localStorage.setItem('isLoggedIn', 'false');
            updateAuthUI();
            return;
        }
        
        switchToLoginMode();
        openModal(authModal);
    });
    
    registerBtn.addEventListener('click', () => {
        switchToRegisterMode();
        openModal(authModal);
    });
    
    authSwitchLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoginMode) {
            switchToRegisterMode();
        } else {
            switchToLoginMode();
        }
    });
    
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        
        if (isLoginMode) {
            // Логика входа
            isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            alert(`Вход выполнен для ${email}`);
        } else {
            const name = document.getElementById('auth-name').value;
            // Логика регистрации
            isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            alert(`Пользователь ${name} (${email}) зарегистрирован`);
        }
        
        closeModal(authModal);
        updateAuthUI();
    });


     // Обработчики поиска
    searchBtn.addEventListener('click', searchEvents);
    eventSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchEvents();
        }
    });
    
    function searchEvents() {
        const searchTerm = eventSearch.value.trim().toLowerCase();
        
        if (!searchTerm) {
            renderEvents(selectedDate);
            return;
        }
        
        const filteredEvents = events.filter(event => 
            event.title.toLowerCase().includes(searchTerm) || 
            (event.description && event.description.toLowerCase().includes(searchTerm))
        );
        
        displaySearchResults(filteredEvents);
    }
    
    function displaySearchResults(filteredEvents) {
        eventsContainer.innerHTML = '';
        
        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = '<p>События не найдены</p>';
            return;
        }
        
        filteredEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-card ${event.category}`;
            eventElement.dataset.id = event.id;
            
            let timeHTML = '';
            if (event.time) {
                timeHTML = `<div class="event-time">${event.time}</div>`;
            }
            
            eventElement.innerHTML = `
                <h4>${event.title}</h4>
                ${timeHTML}
                <div class="event-date">${new Date(event.date).toLocaleDateString('ru-RU')}</div>
                <div class="event-description">${event.description || ''}</div>
            `;
            
            eventElement.addEventListener('click', () => editEvent(event.id));
            eventsContainer.appendChild(eventElement);
        });
    }
    
    // Инициализация приложения
    init();
    
    // Обработчик изменения размера окна для корректного отображения кнопок
    window.addEventListener('resize', function() {
        updateAuthUI();
    });
});
    