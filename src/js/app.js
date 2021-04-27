import Column from './column/column';

class App {
  constructor() {
    this.LOCALSTORAGE_NAME = 'DnD';
    this.NUM_OF_COLUMNNS = 3;
    this.nextCardId = 1;
    this.nextColId = 1;
    this.appContainerEl = document.querySelector('.app');
    this.columnContainerEl = null;
    this.columns = [];
  }

  save() {
    const saved = {
      nextCardId: this.nextCardId,
      nextColId: this.nextColId,
      columns: this.columns,
    };
    window.localStorage.setItem(this.LOCALSTORAGE_NAME, JSON.stringify(saved));
  }

  load() {
    const loadedString = window.localStorage.getItem(this.LOCALSTORAGE_NAME);

    if (!loadedString) {
      return false;
    }

    try {
      const loaded = JSON.parse(loadedString);
      this.nextCardId = loaded.nextCardId;
      this.nextColId = loaded.nextColId;
      return loaded;
    } catch (e) {
      return false;
    }
  }

  init() {
    this.initColumns(this.load());
  }

  initColumns(loaded) {
    this.columnContainerEl = document.createElement('div');
    this.columnContainerEl.classList.add('column-container');
    this.appContainerEl.appendChild(this.columnContainerEl);

    if (!loaded) {
      for (let i = 0; i < this.NUM_OF_COLUMNNS; i += 1) {
        this.addColumn(`Column ${i + 1}`, i + 1);
        this.nextColId += 1;
      }
    } else {
      loaded.columns.forEach((col) => {
        this.addColumn(col.column.title, col.column.id, col.cards);
      });
    }
  }

  addColumn(colName, colId, cards) {
    const newColumn = new Column(
      this.appContainerEl,
      this.columnContainerEl,
      colName,
      colId,
      {
        getNextCardId: this.getNextCardId.bind(this),
        updateNextCardId: this.updateNextCardId.bind(this),
        getColumnElById: this.getColumnElById.bind(this),
        addCard: this.addCard.bind(this),
        getCardPosition: this.getCardPosition.bind(this),
        removeCard: this.removeCard.bind(this),
      },
    );
    this.columns.push({
      column: newColumn,
      cards: [],
    });
    newColumn.init(cards);
    this.save();
  }

  getNextCardId(needUpdate) {
    const currentNextCardId = this.nextCardId;
    if (needUpdate) {
      this.updateNextCardId();
    }
    return currentNextCardId;
  }

  updateNextCardId() {
    this.nextCardId += 1;
    this.save();
  }

  addCard(card, position) {
    const { columnId } = position;
    const { nextCardId } = position;
    const columnCards = this.getColumnById(columnId).cards;
    if (nextCardId) {
      const index = columnCards.findIndex((c) => c.id === nextCardId);
      columnCards.splice(0, index - 1, card);
    } else {
      columnCards.push(card);
    }
    this.save();
  }

  getCardPosition(id) {
    for (let i = 0; i < this.columns.length; i += 1) {
      for (let j = 0; j < this.columns[i].cards.length; j += 1) {
        if (this.columns[i].cards[j].id === id) {
          const col = this.columns[i];
          return {
            columnIndex: i,
            columnId: col.column.id,
            cardIndex: j,
            nextCardId: j === col.cards.length - 1 ? 0 : col.cards[j + 1].id,
          };
        }
      }
    }
    return false;
  }

  removeCard(id) {
    const position = this.getCardPosition(id);
    const { columnIndex } = position;
    const { cardIndex } = position;
    this.columns[columnIndex].cards.splice(cardIndex, 1);
    this.save();
  }

  getColumnById(id) {
    return this.columns.find((c) => c.column.id === id);
  }

  getColumnElById(id) {
    return this.getColumnById(id).column;
  }
}

const app = new App();
app.init();

document.addEventListener('keydown', (e) => {
  if (e.code === 'F2') {
    // eslint-disable-next-line no-console
    console.log(app.columns);
  }
});
