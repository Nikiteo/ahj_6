export default class Card {
  constructor(appContainerEl, text, id, columnCallbacks, appCallbacks) {
    this.appContainerEl = appContainerEl;
    this.text = text;
    this.id = id;
    this.columnCallbacks = columnCallbacks;
    this.appCallbacks = appCallbacks;
    this.cardEl = null;
    this.cardDelEl = null;
    this.move = {
      el: null,
      elHeight: null,
      elWidth: null,
      underEl: null,
      originalPosition: null,
      afterEl: null,
    };
  }

  create() {
    this.cardEl = document.createElement('div');
    this.cardEl.classList.add('dropable-card');
    this.cardEl.id = this.id;
    this.cardEl.innerHTML = `
      <div class="card">
        <div class="card-text">${this.text}</div>
          <div class="card-delete js-del-card">
          <svg class="card-delete-img js-del-card" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="js-del-card" opacity="0.54" fill-rule="evenodd" clip-rule="evenodd" d="M19 6.4L17.6 5L12 10.6L6.4 5L5 6.4L10.6 12L5 17.6L6.4 19L12 13.4L17.6 19L19 17.6L13.4 12L19 6.4Z" fill="currentcolor"/>
          </svg>
        </div>
      </div>
    `;
    this.searchElements();
    this.initListeners();
  }

  searchElements() {
    this.cardDelEl = this.cardEl.querySelector('.card-delete');
  }

  initListeners() {
    this.cardDelEl.addEventListener('click', (e) => {
      e.preventDefault();
      this.delete();
    });

    this.cardEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.target.style.cursor = 'grabbing';
      this.dragCard(e);
    });
  }

  delete() {
    this.columnCallbacks.removeCard(this.id);
    this.cardEl.remove();
  }

  getCardEl() {
    return this.cardEl;
  }

  getNextCard() {
    return this.appContainerEl
      .querySelector(`#${this.move.originalPosition.nextCardId}`)
      .closest('.dropable-card');
  }

  dragCard(e) {
    if (e.target.classList.contains('js-del-card')) return;
    this.move.el = e.currentTarget;
    this.move.originalPosition = this.appCallbacks.getCardPosition(this.id);
    const originalWidth = e.currentTarget.getBoundingClientRect().width;
    this.moveOriginalColumn = Number(e.target.closest('.column').dataset.colId);
    this.move.el.classList.add('drag');
    this.move.elWidth = this.move.el.getBoundingClientRect().width;
    this.move.elHeight = this.move.el.getBoundingClientRect().height;

    const { left } = e.currentTarget.getBoundingClientRect();
    const { top } = e.currentTarget.getBoundingClientRect();

    const leftPosition = left + window.scrollX;
    const topPosition = top + window.scrollY;

    this.move.el.style.left = `${leftPosition}px`;
    this.move.el.style.top = `${topPosition}px`;

    this.move.el.style.width = `${originalWidth}px`;
    this.appContainerEl.appendChild(this.move.el);

    const elMouseX = e.pageX - left;
    const elMouseY = e.pageY - top;

    this.move.el.addEventListener('mousemove', (e1) => {
      e1.preventDefault();
      this.moveCard(e1, elMouseX, elMouseY);
    });

    this.move.el.addEventListener('mouseup', (e2) => {
      e2.preventDefault();
      this.dropCard(e2, elMouseX, elMouseY);
    });
  }

  cleanSavedUnderEl() {
    if (this.move.underEl) {
      this.move.underEl.style.paddingTop = 0;
      this.move.underEl = null;
    }
  }

  moveCard(e, elMouseX, elMouseY) {
    const left = e.pageX - elMouseX;
    const top = e.pageY - elMouseY;

    const leftPosition = left + window.scrollX;
    const topPosition = top + window.scrollY;

    this.move.el.style.left = `${leftPosition}px`;
    this.move.el.style.top = `${topPosition}px`;

    const targetEl = document.elementFromPoint(left - 1, top - 1);

    const underCard = targetEl.closest('.dropable-card');
    const underControls = targetEl.closest('.dropable-controls');
    const underElement = underCard || underControls;

    if (underElement) {
      underElement.style.paddingTop = `${this.move.elHeight + 50}px`;
      this.move.underEl = underElement;
    } else {
      this.cleanSavedUnderEl();
    }
  }

  dropCard(e, elMouseX, elMouseY) {
    const left = e.pageX - elMouseX;
    const top = e.pageY - elMouseY;
    const targetEl = document.elementFromPoint(left - 1, top - 1);

    if (!targetEl) {
      this.returnToOriginalPosition();
      return;
    }

    const nextIsCard = targetEl.closest('.dropable-card');
    const nextIsControls = targetEl.closest('.dropable-controls');
    const drop = nextIsCard || nextIsControls;

    if (!drop) {
      this.returnToOriginalPosition();
      return;
    }

    const columnId = Number(drop.closest('.column').dataset.colId);
    const column = this.appCallbacks.getColumnElById(columnId);

    const position = {
      columnId,
      nextCardId: nextIsCard ? nextIsCard.id : 0,
    };

    column.moveCard(this.text, this.id, position);

    this.clearDnD();
  }

  returnToOriginalPosition() {
    const column = this.appCallbacks.getColumnElById(this.move.originalPosition.columnId);
    column.returnCardToOriginalPosition(this.text, this.id, this.move.originalPosition);
    this.clearDnD();
  }

  clearDnD() {
    this.move.el.remove();
    this.cleanSavedUnderEl();
    this.move.el = null;
    this.move.elHeight = null;
    this.move.elWidth = null;
    this.move.underEl = null;
    this.move.originalPosition = null;
    this.move.afterEl = null;
  }
}
