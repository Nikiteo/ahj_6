import Card from '../card/card';
import randomLoremIpsum from '../lorem/lorem';

export default class Column {
  constructor(appContainerEl, columnContainerEl, title, id, appCallbacks) {
    this.columnContainerEl = columnContainerEl;
    this.appContainerEl = appContainerEl;
    this.title = title;
    this.id = id;
    this.colEl = null;
    this.colTitleEl = null;
    this.colTaskList = null;
    this.colAddDialogOpenBtn = null;
    this.colAddDialog = null;
    this.colAddDialogText = null;
    this.colAddDialogConfirm = null;
    this.colAddDialogCancel = null;
    this.appCallbacks = appCallbacks;
  }

  init(cards) {
    this.colEl = document.createElement('div');
    this.colEl.classList.add('column-wrapper');
    this.colEl.innerHTML = `
      <div class="column" data-col-id="${this.id}">
        <div class="column-title">${this.title}</div>
        <div class="column-task-list"></div>
        <div class="dropable dropable-controls">
          <div class="column-addtask">
            <svg class="column-addtask-plus" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.54" fill-rule="evenodd" clip-rule="evenodd" d="M11 5V11H5V13H11V19H13V13H19V11H13V5H11Z" fill="currentcolor"/>
            </svg>
            <span class="column-addtask-text">Добавить</span>
          </div>
        </div>
        <div class="column-add-dialog display-none">
          <textarea class="add-dialog-text" placeholder="Новая задача"></textarea>
          <div class="add-dialog-controls">
            <span class="add-dialog-confirm">Добавить</span>
            <svg class="add-dialog-cancel" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.54" fill-rule="evenodd" clip-rule="evenodd" d="M19 6.4L17.6 5L12 10.6L6.4 5L5 6.4L10.6 12L5 17.6L6.4 19L12 13.4L17.6 19L19 17.6L13.4 12L19 6.4Z" fill="currentcolor"/>
            </svg>
          </div>
        </div>
      </div>
    `;
    this.columnContainerEl.appendChild(this.colEl);
    this.searchElements();
    this.initListeners();
    if (cards) {
      cards.forEach((card) => {
        this.loadSavedCard(card.text, card.id);
      });
    } else {
      this.createRandomCards();
    }
  }

  searchElements() {
    this.colTitleEl = this.colEl.querySelector('.column-title');
    this.colTaskList = this.colEl.querySelector('.column-task-list');
    this.colAddDialogOpenBtn = this.colEl.querySelector('.column-addtask');
    this.colAddDialog = this.colEl.querySelector('.column-add-dialog');
    this.colAddDialogText = this.colAddDialog.querySelector('.add-dialog-text');
    this.colAddDialogConfirm = this.colAddDialog.querySelector('.add-dialog-confirm');
    this.colAddDialogCancel = this.colAddDialog.querySelector('.add-dialog-cancel');
  }

  initListeners() {
    this.colAddDialogOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openAddDialog();
    });

    this.colAddDialogConfirm.addEventListener('click', (e) => {
      e.preventDefault();
      this.addCardByUser();
    });

    this.colAddDialogCancel.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeAddDialog();
    });
  }

  openAddDialog() {
    this.colAddDialog.classList.remove('display-none');
    this.colAddDialogOpenBtn.classList.add('display-none');
    this.colAddDialogText.focus();
  }

  closeAddDialog() {
    this.colAddDialog.classList.add('display-none');
    this.colAddDialogOpenBtn.classList.remove('display-none');
    this.colAddDialogText.value = '';
  }

  addCardByUser() {
    const text = this.colAddDialogText.value;
    if (!text) return;
    this.createCardByUser(text);
    this.closeAddDialog();
  }

  createCard(text, id) {
    const newCard = new Card(
      this.appContainerEl,
      text,
      id,
      {
        returnCardToOriginalPosition: this.returnCardToOriginalPosition.bind(this),
        removeCard: this.removeCard.bind(this),
        moveCard: this.moveCard.bind(this),
      },
      {
        getColumnElById: this.appCallbacks.getColumnElById,
        getCardPosition: this.appCallbacks.getCardPosition,
      },
    );
    newCard.create();
    return newCard;
  }

  setCardToPosition(card, position) {
    const { nextCardId } = position;
    if (nextCardId) {
      const nextEl = document.getElementById(nextCardId);
      this.colTaskList.insertBefore(card.getCardEl(), nextEl);
    } else {
      this.colTaskList.appendChild(card.getCardEl());
    }
  }

  loadSavedCard(text, id) {
    const card = this.createCard(text, id);
    this.addLastCard(card);
  }

  createCardByUser(text) {
    const id = this.appCallbacks.getNextCardId(true);
    const card = this.createCard(text, id);
    this.addLastCard(card);
  }

  addLastCard(card) {
    this.colTaskList.appendChild(card.getCardEl());
    const position = {
      columnId: this.id,
      nextCardId: 0,
    };
    this.appCallbacks.addCard(card, position);
  }

  returnCardToOriginalPosition(text, id, position) {
    const card = this.createCard(text, id);
    this.setCardToPosition(card, position);
  }

  removeCard(id) {
    this.appCallbacks.removeCard(id);
  }

  moveCard(text, id, position) {
    const card = this.createCard(text, id);
    this.setCardToPosition(card, position);
    this.appCallbacks.removeCard(id);
    this.appCallbacks.addCard(card, position);
  }

  createRandomCards() {
    const numOfCards = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numOfCards; i += 1) {
      this.createCardByUser(randomLoremIpsum());
    }
  }
}
