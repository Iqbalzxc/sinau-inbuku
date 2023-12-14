document.addEventListener("DOMContentLoaded", () => {
  const inputBook = document.getElementById("input-book");
  inputBook.addEventListener("submit", (e) => {
    e.preventDefault();
    addBook();
  });

  // load storage
  if (typeof Storage !== undefined) {
    loadBooksData();
  } else {
    createToast("warning", `you're browser didn't support browser storage`);
  }

  // search Book form
  const search = document.getElementById("searchBook");
  search.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBook();
  });

  // change arrow diredtion on progressSection
  function updateProgressStyle() {
    let progressSlider = document.querySelector(".progressBookList");
    if (window.innerWidth <= 860) {
      if (progressSlider.classList.contains("upDown")) {
        progressSlider.classList.remove("upDown");
      }
      // left arrow or up arrow
      document
        .querySelector(".progressSlider .left-slide")
        .classList.add("fa-arrow-left");
      document
        .querySelector(".progressSlider .left-slide")
        .classList.remove("fa-arrow-up");

      // right arrow or down arrow
      document
        .querySelector(".progressSlider .right-slide")
        .classList.add("fa-arrow-right");
      document
        .querySelector(".progressSlider .right-slide")
        .classList.remove("fa-arrow-down");
    } else {
      progressSlider.classList.add("upDown");
      // right arrow or down arrow
      document
        .querySelector(".progressSlider .left-slide")
        .classList.add("fa-arrow-up");
      document
        .querySelector(".progressSlider .left-slide")
        .classList.remove("fa-arrow-left");

      document
        .querySelector(".progressSlider .right-slide")
        .classList.add("fa-arrow-down");
      document
        .querySelector(".progressSlider .right-slide")
        .classList.remove("fa-arrow-right");
    }
  }

  // initial update for arrow in progressSection
  updateProgressStyle();

  // Update arrow progressSection when window resized
  window.addEventListener("resize", updateProgressStyle);
});

// Define globalvariable
const books = [];
let booksFilter = [];

const STORAGE_KEY = "BOOK_SHELF_APPS";
const RENDER_BOOK = "render-book";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// RENDERING book to display on bookList (readingBooks, complitedBooks, progressBookList)
document.addEventListener(RENDER_BOOK, () => {
  const uncomplitedBookList = document.getElementById("uncompletedBooks");
  uncomplitedBookList.innerHTML = "";

  const complitedBookList = document.getElementById("completedBooks");
  complitedBookList.innerHTML = "";

  const progressBookList = document.getElementById("progressBookList");
  progressBookList.innerHTML = "";

  // if user have to search something than it will render books inside booksFilter
  let bookRender = booksFilter.length !== 0 ? booksFilter : books;

  // displaying book
  for (let book of bookRender) {
    let node = createBook(book);
    let cardNode = createProgressCard(book);
    if (!book.isComplete) {
      uncomplitedBookList.appendChild(node);
    } else {
      complitedBookList.appendChild(node);
    }
    progressBookList.append(cardNode);
  }
});

// renderProgress card
function createProgressCard(bookObject) {
  let progressCard = document.createElement("div");
  progressCard.classList.add("progress-card", "card");
  progressCard.innerHTML = `
		<img class="progress-img" src="assets/img/minimalist-poster.jpg" alt="book cover">
		<div class="progress-content">
			<h3>${bookObject.title}</h3>
			<span>50/100 pages</span>
		</div>`;

  return progressCard;
}

// Searching book
function searchBook() {
  let searchTitle = document.getElementById("searchBookTitle").value;
  // Set BooksFilter to initial

  // remove all spaces at the beginning of string
  searchTitle = searchTitle.trim();
  if (searchTitle === "") {
    booksFilter = [];
    document.dispatchEvent(new Event(RENDER_BOOK));
    return;
  }

  booksFilter = books.filter((book) => book.title.includes(searchTitle));
  if (booksFilter.length === 0) {
    document.dispatchEvent(new Event(RENDER_BOOK));
    createToast("error", "Buku yang anda cari tidak ada");
  } else {
    document.dispatchEvent(new Event(RENDER_BOOK));
    // turn back slide position to initial if any book to search is found
    document
      .querySelector(".uncompletedSlider .right-slide")
      .dispatchEvent(new Event("click"));
    document
      .querySelector(".completedSlider .right-slide")
      .dispatchEvent(new Event("click"));
    document
      .querySelector(".progressSlider .right-slide")
      .dispatchEvent(new Event("click"));
  }
}

// store new data to books list
function addBook() {
  const id = generateId();
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = Number(document.getElementById("inputBookYear").value);
  const isComplete = document.getElementById("isComplete").checked;

  const book = generateBookObject(id, title, author, year, isComplete);
  books.push(book);
  saveData();
  document.dispatchEvent(new Event(RENDER_BOOK));
  createToast("success", "Buku telah ditambahkan");
}
// create book node
function createBook(bookObject) {
  // spread the data
  const { id, title, author, year, isComplete } = bookObject;

  // book container
  const book = document.createElement("div");
  book.classList.add("book", "card");
  book.innerHTML = `<img class="book-cover-img" src="assets/img/minimalist-poster.jpg" alt="book cover">`;

  // book content
  const content = document.createElement("div");
  content.classList.add("book-content");

  // content add info with innerHtml
  const bookInfo = document.createElement("div");
  bookInfo.classList.add("book-info");
  bookInfo.innerHTML = `
		<h3 class="title">${title}</h3>
		<span>author: ${author}</span>
		<span>tahun: ${year}</span>`;

  content.appendChild(bookInfo);

  // interactButton
  const interactButton = document.createElement("div");
  interactButton.classList.add("intract-btn");
  // edit button
  const editBtn = document.createElement("span");
  editBtn.classList.add("btn", "edit");
  editBtn.innerText = "edit";
  editBtn.addEventListener("click", () => openEditBook(id));
  // remove button
  const removeBtn = document.createElement("span");
  removeBtn.classList.add("btn", "remove");
  removeBtn.innerText = "hapus";
  removeBtn.addEventListener("click", () => removeBook(id));

  // when the book isComplete add button(complete) if not then add button(unComplete)
  // Complete or Uncomplete button
  if (!isComplete) {
    const completeBtn = document.createElement("span");
    completeBtn.classList.add("btn", "complete");
    completeBtn.innerText = "selesai";

    // append all the button to interactButton
    interactButton.appendChild(editBtn);
    interactButton.appendChild(completeBtn);
    interactButton.appendChild(removeBtn);

    completeBtn.addEventListener("click", () => uncompleteToComplete(id));
  } else {
    const uncompleteBtn = document.createElement("span");
    uncompleteBtn.classList.add("btn", "uncomplete");
    uncompleteBtn.innerText = "belum selesai";

    // append all the button to interactButton
    interactButton.appendChild(editBtn);
    interactButton.appendChild(uncompleteBtn);
    interactButton.appendChild(removeBtn);

    uncompleteBtn.addEventListener("click", () => completeToUncomplete(id));
  }

  content.appendChild(interactButton);

  book.appendChild(content);
  return book;
}
// Buttons interact event handler function exept for edit event handler
function uncompleteToComplete(bookId) {
  const book = findBook(bookId);
  if (book === null) return;

  book.isComplete = true;
  saveData();
  document.dispatchEvent(new Event(RENDER_BOOK));
}
function completeToUncomplete(bookId) {
  const book = findBook(bookId);
  if (book === null) return;

  book.isComplete = false;
  saveData();
  document.dispatchEvent(new Event(RENDER_BOOK));
}
function removeBook(bookId) {
  const index = findIndex(bookId);

  if (index === -1) return;

  books.splice(index, 1);
  saveData();
  searchBook();
  document.dispatchEvent(new Event(RENDER_BOOK));
  createToast("warning", "Anda telah menghapus buku");
}

// Load the data
function loadBooksData() {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data !== null) {
    for (const item of data) {
      books.push(item);
    }

    createToast("success", "Data berhasil di load");
  }

  document.dispatchEvent(new Event(RENDER_BOOK));
}
// Save the data
function saveData() {
  if (typeof Storage !== undefined) {
    const data = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, data);
  } else {
    createToast("warning", "Data tidak terupdate");
  }
}

// ==== Helper funtion ===

// findBook return book object with id = bookId
function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }

  return null;
}
// findIndex return index of book based on bookId
function findIndex(bookId) {
  for (const index in books) {
    if (books[index].id == bookId) {
      return index;
    }
  }

  return -1;
}

// ============== SLIDE SECTION ==============
// for indexing the number of element we have
const indexing = {
  uncompletedIndex: 1,
  completedIndex: 1,
  progressIndex: 1,
};

function initSlider(n, nodeList, slideIndex) {
  // n is number of element we want to reach
  // nodeList is parent element for all card or container of card
  // slideIndex is the name we want to slide (uncompletedIndex, completedIndex, progressIndex)
  const totalSlides = nodeList.querySelectorAll(".card").length;

  if (n > totalSlides) {
    indexing[slideIndex] = 1;
  } else if (n < 1) {
    indexing[slideIndex] = totalSlides;
  }

  // -- vertical there is class upDown if horizontal there no special class
  // and for progress slide we have different layout of card then we create exeption with if
  // -- the number of negativ define that the overflow of element is to the right if the overflow of
  // element is to the left then the number is positive
  if (slideIndex === "progressIndex") {
    if (nodeList.classList.contains("upDown")) {
      nodeList.style.transform = `translateY(${
        -7.5 * (indexing[slideIndex] - 1)
      }rem)`;
    } else {
      nodeList.style.transform = `translateX(${
        -19.5 * (indexing[slideIndex] - 1)
      }rem)`;
    }
  } else {
    nodeList.style.transform = `translateX(${
      -24 * (indexing[slideIndex] - 1)
    }rem)`;
  }
}

// plusSlide to keep in tract the number of element
function plusSlide(n, nodeList, slideIndex) {
  initSlider((indexing[slideIndex] += n), nodeList, slideIndex);
}

// uncomplitedSlide button
document
  .querySelector(".uncompletedSlider .left-slide")
  .addEventListener("click", () =>
    plusSlide(
      -1,
      document.querySelector("#uncompletedBooks"),
      "uncompletedIndex"
    )
  );
document
  .querySelector(".uncompletedSlider .right-slide")
  .addEventListener("click", () =>
    plusSlide(
      1,
      document.querySelector("#uncompletedBooks"),
      "uncompletedIndex"
    )
  );

// complitedSlide button
document
  .querySelector(".completedSlider .left-slide")
  .addEventListener("click", () =>
    plusSlide(-1, document.querySelector("#completedBooks"), "completedIndex")
  );
document
  .querySelector(".completedSlider .right-slide")
  .addEventListener("click", () =>
    plusSlide(1, document.querySelector("#completedBooks"), "completedIndex")
  );

// ProgressSlide button
document
  .querySelector(".progressSlider .left-slide")
  .addEventListener("click", () =>
    plusSlide(-1, document.querySelector(".progressBookList"), "progressIndex")
  );
document
  .querySelector(".progressSlider .right-slide")
  .addEventListener("click", () =>
    plusSlide(1, document.querySelector(".progressBookList"), "progressIndex")
  );

// ============== MODAL EDIT FUNCTION ==============

// Event submit edit book modal
document.getElementById("editBook").addEventListener("submit", (e) => {
  e.preventDefault();
  saveChanges();
  createToast("success", "Data berhasil di update");
});
// Event to close the edit modal
document
  .querySelector("#editModal .edit-close-btn")
  .addEventListener("click", () => closeModal());

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

// Function to open edit modal
function openEditBook(bookId) {
  const book = findBook(bookId); // findBook
  document.getElementById("editTitle").value = book.title;
  document.getElementById("editAuthor").value = book.author;
  document.getElementById("editYear").value = book.year;

  document.getElementById("editModal").setAttribute("data-id", bookId); // id
  document.getElementById("editModal").style.display = "block";
}
// Function to save changes from the edit modal
function saveChanges() {
  const id = document.getElementById("editModal").getAttribute("data-id");
  const book = findBook(parseInt(id));
  const editedTitle = document.getElementById("editTitle").value;
  const editedAuthor = document.getElementById("editAuthor").value;
  const editedYear = Number(document.getElementById("editYear").value);

  // Update the book details
  book.title = editedTitle;
  book.author = editedAuthor;
  book.year = editedYear;

  // Close the modal and display the updated card-books
  closeModal();
  saveData();
  document.dispatchEvent(new Event(RENDER_BOOK));
}

// ============== Toast Notification ==============
// Toast iconClass have key based on type of notification
// source of icon From https://fontawesome.com/
const toastIcon = {
  success: "fa-solid fa-circle-check",
  warning: "fa-solid fa-triangle-exclamation",
  error: "fa-solid fa-circle-xmark",
};

// notificationBox (container for all toast notification)
const notificationBox = document.getElementById("toastNotification");

// createToast notification with two parameter
function createToast(type, msgtext) {
  // type is string parameter for consider what type of notification you want to display
  // based on toastIcon you have ('success', 'warning', 'error', etc)
  // msgtext is the text you want to display

  // exeption if you didn't input the second parameter
  if (msgtext === undefined) {
    msgtext = `You have ${type} message`;
  }

  // Create container name toast
  const toast = document.createElement("li");
  toast.classList.add("toast", `${type}`);
  // set all necessery element for toast
  toast.innerHTML = `<div class="message">
                            <i class="${toastIcon[type]}"></i>
                            <span>${type.toUpperCase()}: ${msgtext}</span>
                        </div>
                        <i class="fa-solid fa-xmark close" onclick=removeToast(this.parentElement)></i>`;
  notificationBox.appendChild(toast);

  // remove toast in 4s
  setTimeout(() => removeToast(toast), 4000);
}

// function to remove toastNotification
function removeToast(toast) {
  toast.classList.add("closed");
  setTimeout(() => toast.remove(), 400); // toast node will be removed after .4s
}
