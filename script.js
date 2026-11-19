const trainerWrap = document.querySelector('#trainer-wrap');
const trainerFrame = trainerWrap.querySelector('iframe');
const trainerStart = document.querySelector('#trainer-start');

trainerStart.addEventListener('click', () => {
  trainerStart.parentElement.hidden = true;
  trainerFrame.inert = false;
  trainerFrame.contentWindow.focus();
});

const translations = [
  ['color', 'цвет'],
  ['house', 'дом'],
  ['car', 'машина'],
  ['light', 'свет'],
];
const words = translations.flat();
for (let i = words.length - 1; i > 0; i -= 1) {
  const j = Math.floor(Math.random() * (i + 1));
  [words[i], words[j]] = [words[j], words[i]];
}

const wordCards = document.querySelector('#word-cards');
const wordPairs = document.querySelector('#word-pairs');
const wordFeedback = document.querySelector('#word-feedback');
let selectedCard = null;
let draggedCard = null;

function selectCard(card) {
  selectedCard?.setAttribute('aria-pressed', 'false');
  selectedCard = card;
  selectedCard?.setAttribute('aria-pressed', 'true');
}

function matchCards(first, second) {
  selectCard(null);
  const pair = translations.find(words => words.includes(first.textContent) && words.includes(second.textContent));
  wordFeedback.dataset.error = String(!pair);
  if (!pair) {
    wordFeedback.textContent = 'Эти слова не подходят друг другу. Попробуй ещё раз.';
    return;
  }

  const [english, russian] = pair;
  const item = document.createElement('li');
  const englishWord = document.createElement('span');
  englishWord.lang = 'en';
  englishWord.textContent = english;
  item.append(englishWord, ' — ', russian);
  wordPairs.append(item);
  first.remove();
  second.remove();
  wordCards.querySelector('button')?.focus();

  const matched = wordPairs.children.length;
  wordFeedback.textContent = matched === translations.length
    ? 'Все пары собраны!'
    : `Собрано пар: ${matched} из ${translations.length}.`;
}

for (const word of words) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'word-card';
  card.lang = /^[a-z]+$/.test(word) ? 'en' : 'ru';
  card.draggable = true;
  card.textContent = word;
  card.setAttribute('aria-pressed', 'false');

  card.addEventListener('click', () => {
    if (selectedCard && selectedCard !== card) {
      matchCards(selectedCard, card);
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
  card.addEventListener('dragover', event => {
    if (draggedCard && draggedCard !== card) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  });
  card.addEventListener('drop', event => {
    event.preventDefault();
    if (draggedCard && draggedCard !== card) {
      matchCards(draggedCard, card);
      draggedCard = null;
    }
  });
  wordCards.append(card);
}

const mathForm = document.querySelector('#math-form');
const mathInputs = Array.from(mathForm.querySelectorAll('input'));
const mathFeedback = document.querySelector('#math-feedback');
const answers = [8, 45, 920, 24];

mathForm.addEventListener('submit', event => {
  event.preventDefault();
  let correctCount = 0;
  mathInputs.forEach((input, index) => {
    const value = input.value.trim();
    const correct = /^\d+$/.test(value) && Number(value) === answers[index];
    input.dataset.correct = String(correct);
    input.setAttribute('aria-invalid', String(!correct));
    correctCount += Number(correct);
  });
  mathFeedback.dataset.error = String(correctCount !== answers.length);
  mathFeedback.textContent = correctCount === answers.length
    ? 'Все ответы верны!'
    : `Верных ответов: ${correctCount} из ${answers.length}. Проверь выделенные поля.`;
});

for (const input of mathInputs) {
  input.addEventListener('input', () => {
    delete input.dataset.correct;
    input.removeAttribute('aria-invalid');
    mathFeedback.textContent = '';
  });
}
