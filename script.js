// ============================================
//  ВИКИНЫ СНЫ — логика
// ============================================

const state = {
  currentIndex: 0,
  isViewing: false,
};

// ----- DOM -----
const catalog       = document.getElementById('catalog');
const catalogGrid   = document.getElementById('catalogGrid');
const dreamCount    = document.getElementById('dreamCount');
const viewer        = document.getElementById('viewer');
const card          = document.getElementById('card');
const cardCover     = document.getElementById('cardCover');
const cardDate      = document.getElementById('cardDate');
const cardTitle     = document.getElementById('cardTitle');
const cardText      = document.getElementById('cardText');
const viewerCounter = document.getElementById('viewerCounter');
const closeBtn      = document.getElementById('closeBtn');
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const flipBackBtn   = document.getElementById('flipBackBtn');

// ----- Прелоад обложек -----
function preloadCovers() {
  dreams.forEach(d => {
    const img = new Image();
    img.src = d.cover;
  });
}

// ----- Заглушка на случай отсутствия картинки -----
function coverPlaceholder() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a1430"/>
          <stop offset="100%" stop-color="#0d0b16"/>
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#g)"/>
      <text x="200" y="300" text-anchor="middle" fill="#c9a86a"
            font-family="serif" font-size="20" opacity="0.6">сон</text>
    </svg>
  `);
}

// ----- Рендер каталога -----
function renderCatalog() {
  catalogGrid.innerHTML = '';
  dreamCount.textContent = dreams.length;

  if (!dreams.length) {
    catalogGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:.5">Сны ещё не записаны.</p>';
    return;
  }

  dreams.forEach((dream, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.animationDelay = `${i * 60}ms`;
    tile.dataset.index = i;

    tile.innerHTML = `
      <img src="${dream.cover}" alt="${dream.title}"
           onerror="this.src='${coverPlaceholder()}'">
      <div class="tile__preview">
        <div class="tile__preview-date">${dream.date}</div>
        <div class="tile__preview-title">${dream.title}</div>
      </div>
    `;

    tile.addEventListener('click', () => openDream(i));
    catalogGrid.appendChild(tile);
  });
}

// ----- Открыть сон -----
function openDream(index) {
  state.currentIndex = index;
  state.isViewing = true;

  updateCardContent();
  card.classList.remove('is-flipped');
  card.scrollTop = 0;

  document.body.classList.add('is-viewing');
  viewer.setAttribute('aria-hidden', 'false');

  updateCounter();
}

// ----- Обновить содержимое карточки -----
function updateCardContent() {
  const dream = dreams[state.currentIndex];
  if (!dream) return;

  cardCover.src = dream.cover;
  cardCover.onerror = () => { cardCover.src = coverPlaceholder(); };
  cardCover.alt = dream.title;
  cardDate.textContent = dream.date;
  cardTitle.textContent = dream.title;
  cardText.textContent = dream.text;

  const back = card.querySelector('.card__face--back');
  if (back) back.scrollTop = 0;
}

// ----- Переворот карточки -----
card.addEventListener('click', (e) => {
  if (e.target.closest('.viewer__nav')) return;
  if (e.target.closest('.card__flip-back')) return;
  if (e.target.closest('.card__face--back')) return;

  card.classList.toggle('is-flipped');
});

// ----- Кнопка возврата к обложке -----
flipBackBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  card.classList.remove('is-flipped');
});

// ----- Закрыть просмотр -----
function closeViewer() {
  state.isViewing = false;
  document.body.classList.remove('is-viewing');
  viewer.setAttribute('aria-hidden', 'true');
  card.classList.remove('is-flipped');
}

closeBtn.addEventListener('click', closeViewer);

// ----- Навигация -----
function goTo(delta) {
  const wasFlipped = card.classList.contains('is-flipped');

  const finish = () => {
    let next = state.currentIndex + delta;
    if (next < 0) next = dreams.length - 1;
    if (next >= dreams.length) next = 0;
    state.currentIndex = next;

    updateCardContent();
    updateCounter();

    card.classList.remove('is-flipped');
  };

  if (wasFlipped) {
    card.classList.remove('is-flipped');
    setTimeout(finish, 420);
  } else {
    finish();
  }
}

prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(-1); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(1); });

function updateCounter() {
  viewerCounter.textContent = `${state.currentIndex + 1} / ${dreams.length}`;
}

// ----- Клавиатура -----
document.addEventListener('keydown', (e) => {
  if (!state.isViewing) return;

  if (e.key === 'Escape')     closeViewer();
  if (e.key === 'ArrowLeft')  goTo(-1);
  if (e.key === 'ArrowRight') goTo(1);
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    card.classList.toggle('is-flipped');
  }
});

// ----- Свайпы на мобиле -----
let touchStartX = 0;
let touchStartY = 0;

viewer.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

viewer.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    if (dx < 0) goTo(1);
    else        goTo(-1);
  }
}, { passive: true });

// ----- Старт -----
preloadCovers();
renderCatalog();