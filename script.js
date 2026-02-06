// Плавное появление элементов при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Наблюдаем за всеми элементами, которые должны появляться
document.addEventListener('DOMContentLoaded', () => {
    // Секции с заголовками
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        observer.observe(title);
    });

    // Контент истории
    const storyContent = document.querySelector('.story-content');
    if (storyContent) {
        observer.observe(storyContent);
    }

    // Карточки деталей
    const detailCards = document.querySelectorAll('.detail-card');
    detailCards.forEach((card, index) => {
        setTimeout(() => {
            observer.observe(card);
        }, index * 100);
    });

    // Элементы галереи
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        setTimeout(() => {
            observer.observe(item);
        }, index * 150);
    });

    // Список гостей
    const guestsSubtitle = document.querySelector('.guests-subtitle');
    if (guestsSubtitle) {
        observer.observe(guestsSubtitle);
    }

    const guestsList = document.querySelector('.guests-list');
    if (guestsList) {
        observer.observe(guestsList);
    }

    const guestItems = document.querySelectorAll('.guest-item');
    guestItems.forEach((item, index) => {
        setTimeout(() => {
            observer.observe(item);
        }, index * 50);
    });

    // RSVP форма
    const rsvpSubtitle = document.querySelector('.rsvp-subtitle');
    if (rsvpSubtitle) {
        observer.observe(rsvpSubtitle);
    }

    const rsvpForm = document.querySelector('.rsvp-form');
    if (rsvpForm) {
        observer.observe(rsvpForm);
    }

    // Блок благодарности
    const thanksContent = document.querySelector('.thanks-content');
    if (thanksContent) {
        observer.observe(thanksContent);
    }
});

// Обработка формы RSVP
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            familyName: document.getElementById('familyName').value,
            phone: document.getElementById('phone').value,
            guestsCount: document.getElementById('guestsCount').value
        };

        // Здесь можно добавить отправку данных на сервер
        // Например, через fetch API или email сервис
        
        // Показываем сообщение об успехе
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Отправлено! ✓';
        submitBtn.style.background = 'linear-gradient(135deg, var(--sage) 0%, #B5C5A5 100%)';
        submitBtn.disabled = true;
        
        // Очищаем форму
        rsvpForm.reset();
        
        // Через 3 секунды возвращаем кнопку в исходное состояние
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 3000);
        
        // В реальном приложении здесь будет отправка данных
        console.log('RSVP данные:', formData);
    });
}

// Плавная прокрутка для якорных ссылок (если будут добавлены)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Легкий эффект масштабирования изображения/видео при скролле
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    const heroVideo = document.querySelector('.hero-video');
    const heroMedia = heroImage || heroVideo;
    
    if (heroMedia && currentScroll < window.innerHeight) {
        // Легкое увеличение масштаба при скролле вниз для эффекта глубины
        const scale = 1 + (currentScroll / window.innerHeight) * 0.1;
        heroMedia.style.transform = `scale(${scale})`;
    }
    
    lastScroll = currentScroll;
});

// Добавляем эффект "дыхания" для декоративных элементов
const addBreathingEffect = () => {
    const petals = document.querySelectorAll('.petal');
    petals.forEach((petal, index) => {
        const delay = index * 2;
        petal.style.animation = `float 20s infinite ease-in-out, breathe 4s ${delay}s infinite ease-in-out`;
    });
};

// Добавляем CSS для эффекта дыхания через JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes breathe {
        0%, 100% {
            opacity: 0.3;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(style);

// Инициализация эффекта дыхания
addBreathingEffect();

// Функция для загрузки подтвержденных гостей из localStorage
function loadConfirmedGuests() {
    const confirmed = JSON.parse(localStorage.getItem('confirmedGuests') || '{}');
    Object.keys(confirmed).forEach(guestName => {
        const guestItem = document.querySelector(`[data-guest="${guestName}"]`);
        if (guestItem) {
            guestItem.classList.add('confirmed');
        }
    });
}

// Функция для сохранения подтвержденного гостя
function saveConfirmedGuest(guestName, phone) {
    const confirmed = JSON.parse(localStorage.getItem('confirmedGuests') || '{}');
    confirmed[guestName] = {
        phone: phone,
        date: new Date().toISOString()
    };
    localStorage.setItem('confirmedGuests', JSON.stringify(confirmed));
    
    // Обновляем визуальное состояние
    const guestItem = document.querySelector(`[data-guest="${guestName}"]`);
    if (guestItem) {
        guestItem.classList.add('confirmed');
    }
}

// Модальное окно для подтверждения гостя
const guestModal = document.getElementById('guestModal');
const closeModal = document.getElementById('closeModal');
const guestConfirmForm = document.getElementById('guestConfirmForm');
const modalGuestName = document.getElementById('modalGuestName');
let currentGuestName = '';

// Загружаем подтвержденных гостей при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadConfirmedGuests();
});

// Обработка клика на карточку гостя
document.addEventListener('DOMContentLoaded', () => {
    const guestItems = document.querySelectorAll('.guest-item');
    
    guestItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const guestName = item.getAttribute('data-guest');
            
            // Если гость уже подтвержден, не открываем модальное окно
            if (item.classList.contains('confirmed')) {
                return;
            }
            
            currentGuestName = guestName;
            modalGuestName.textContent = guestName;
            guestModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
});

// Закрытие модального окна
if (closeModal) {
    closeModal.addEventListener('click', () => {
        guestModal.classList.remove('active');
        document.body.style.overflow = '';
        guestConfirmForm.reset();
    });
}

// Закрытие модального окна при клике на overlay
if (guestModal) {
    guestModal.addEventListener('click', (e) => {
        if (e.target === guestModal) {
            guestModal.classList.remove('active');
            document.body.style.overflow = '';
            guestConfirmForm.reset();
        }
    });
}

// Обработка формы подтверждения гостя
if (guestConfirmForm) {
    guestConfirmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const phone = document.getElementById('guestPhone').value;
        
        if (!currentGuestName) return;
        
        // Сохраняем подтверждение
        saveConfirmedGuest(currentGuestName, phone);
        
        // Показываем сообщение об успехе
        const submitBtn = guestConfirmForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Подтверждено! ✓';
        submitBtn.style.background = 'linear-gradient(135deg, var(--sage) 0%, #B5C5A5 100%)';
        submitBtn.disabled = true;
        
        // Закрываем модальное окно через 1.5 секунды
        setTimeout(() => {
            guestModal.classList.remove('active');
            document.body.style.overflow = '';
            guestConfirmForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 1500);
        
        // В реальном приложении здесь будет отправка данных на сервер
        console.log('Подтверждение гостя:', {
            name: currentGuestName,
            phone: phone
        });
    });
}

// Обратный отсчет до свадьбы
function updateCountdown() {
    const weddingDate = new Date('2026-08-08T00:00:00');
    const now = new Date();
    const difference = weddingDate - now;
    
    if (difference <= 0) {
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        return;
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Обновляем отсчет каждую секунду
setInterval(updateCountdown, 1000);
updateCountdown();
