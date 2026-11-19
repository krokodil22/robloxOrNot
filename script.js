const trainerFrame = document.querySelector('#trainer-wrap iframe');
const trainerStart = document.querySelector('#trainer-start');
const result = document.querySelector('#result');
let trainerScore = 0;

trainerStart.addEventListener('click', () => {
  trainerStart.parentElement.hidden = true;
  trainerFrame.inert = false;
  trainerFrame.contentWindow.focus();
});

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.source !== trainerFrame.contentWindow) return;
  if (event.data?.type !== 'trainer-score' || !Number.isInteger(event.data.score)) return;
  trainerScore = event.data.score;
  result.textContent = '';
});

const translations = [
  ['color', 'цвет'],
  ['house', 'дом'],
  ['light', 'свет'],
  ['fly', 'полет'],
  ['health', 'здоровье'],
];
const englishWords = translations.map(([english]) => english);
for (let i = englishWords.length - 1; i > 0; i -= 1) {
  const j = Math.floor(Math.random() * (i + 1));
  [englishWords[i], englishWords[j]] = [englishWords[j], englishWords[i]];
}

const wordRows = document.querySelector('#word-rows');
const wordBank = document.querySelector('#word-bank');
let selectedCard = null;
let draggedCard = null;

function selectCard(card) {
  selectedCard?.setAttribute('aria-pressed', 'false');
  selectedCard = card;
  selectedCard?.setAttribute('aria-pressed', 'true');
}

function placeCard(card, destination) {
  const source = card.closest('.word-slot, .word-bank');
  if (source !== destination) {
    const previous = destination.matches('.word-slot') && destination.querySelector('.word-card');
    if (previous) card.replaceWith(previous);
    destination.append(card);
    result.textContent = '';
  }
  selectCard(null);
}

function allowDrop(destination) {
  destination.addEventListener('dragover', event => {
    if (draggedCard) event.preventDefault();
  });
  destination.addEventListener('drop', event => {
    if (!draggedCard) return;
    event.preventDefault();
    placeCard(draggedCard, destination);
    draggedCard = null;
  });
}

const slots = translations.map(([, russian]) => {
  const row = document.createElement('div');
  row.className = 'word-row';
  const label = document.createElement('span');
  label.textContent = russian;
  const slot = document.createElement('div');
  slot.className = 'word-slot';
  const target = document.createElement('button');
  target.type = 'button';
  target.className = 'word-target';
  target.textContent = 'Выбрать';
  target.setAttribute('aria-label', `Поставить карточку напротив слова «${russian}»`);
  target.addEventListener('click', () => {
    if (selectedCard) {
      const card = selectedCard;
      placeCard(card, slot);
      card.focus();
    }
  });
  slot.append(target);
  row.append(label, slot);
  wordRows.append(row);
  allowDrop(slot);
  return slot;
});

for (const word of englishWords) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'word-card';
  card.lang = 'en';
  card.draggable = true;
  card.textContent = word;
  card.setAttribute('aria-pressed', 'false');
  card.addEventListener('click', () => {
    const slot = card.closest('.word-slot');
    if (slot && selectedCard && selectedCard !== card) {
      const selected = selectedCard;
      placeCard(selected, slot);
      selected.focus();
      return;
    }
    selectCard(selectedCard === card ? null : card);
  });
  card.addEventListener('dragstart', event => {
    draggedCard = card;
    event.dataTransfer.setData('text/plain', word);
    event.dataTransfer.effectAllowed = 'move';
    selectCard(card);
  });
  card.addEventListener('dragend', () => {
    draggedCard = null;
    selectCard(null);
  });
  wordBank.append(card);
}
allowDrop(wordBank);

const mathExamples = document.querySelector('#math-examples');
const mathInputs = Array.from(mathExamples.querySelectorAll('input'));
const answers = [8, 45, 920];

mathExamples.addEventListener('input', () => {
  result.textContent = '';
});

document.querySelector('#show-result').addEventListener('click', () => {
  const wordScore = slots.filter((slot, index) =>
    slot.querySelector('.word-card')?.textContent === translations[index][0]
  ).length;
  const mathScore = mathInputs.filter((input, index) => {
    const value = input.value.trim();
    return /^\d+$/.test(value) && Number(value) === answers[index];
  }).length;
  result.textContent = `Набрано баллов: ${trainerScore + wordScore + mathScore}`;
});
