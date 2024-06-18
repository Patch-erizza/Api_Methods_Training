// повешать на крестик слушатель событий
// по клику вызывается функция
// создать функцию удаления постов
// по клику придет событие клика, нужно свойство target
// у target вызвать closest()
// получаем data-id поста, который нужно удалить
// вызвать fetch метод delete, body не указывать URL "http://localhost:3000/posts/{postId}"
runApp();

async function runApp() {
  const posts = await fetchPosts();
  const authors = await fetchPostAuthors(posts);

  const comments = await fetchComments();

  showPostsList(posts, authors);

  for (const comment of comments) {
    const forPostId = comment.forPostId;
    const postIdQuery = 'div[data-id="'+forPostId+'"]'; //конструируется строка запроса к элементу с атрибутом data-id искомого поста
    console.log(postIdQuery);
    const postElement = document.querySelector(postIdQuery);
    console.log(postElement);
    if (postElement){
    const containComments = postElement.querySelector(".comments-contain");
    const commentElement = getCommentElement(comment);
    containComments.appendChild(commentElement);
    }
  }


  let postButtonElement = document.getElementById("add-button");
  postButtonElement.addEventListener("click", addPostsElement);
}

async function addNewPost(submitEvent) {
  submitEvent.preventDefault();
  let newTitleElement = document.getElementById("new-title");
  let newTitle = newTitleElement.value;
  let newPostElement = document.getElementById("new-post-body");
  let newPostText = newPostElement.value;
  const newPost = await fetch("http://localhost:3000/posts", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: newTitle,
      body: newPostText,
      authorId: 3
    }),
  });
}
async function editCurrentPost(submitEvent){
  console.log("editCurrentPost");
  const formElement = submitEvent.target;
  const editCurrentTitleElement = formElement.querySelector(".edit-title");
  const updatedTitle = editCurrentTitleElement.value;
  const editCurrentBodyElement = formElement.querySelector(".edit-post-body");
  const updatedBody = editCurrentBodyElement.value;
  const updatedPostId = formElement.querySelector(".hidden-id-post");
  const postId = updatedPostId.value;
  const editPost = await fetch("http://localhost:3000/posts/" + postId, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: updatedTitle,
      body: updatedBody})
  })
}

async function deletePost(event) {
  const eventTarget = event.target;
  const parentWithPostId = eventTarget.closest(".post-contain");
  const postIdToDelete = parentWithPostId.getAttribute("data-id");
  const delPost = await fetch("http://localhost:3000/posts/" + postIdToDelete, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
    }
  })
}


function showPostsList(postsList, authorsList) {
  for (const post of postsList) {
    const authorId = post.authorId;
    const author = authorsList.find(author => author.id === authorId);
    showAuthorAndPost(post, author);
  }
}

async function fetchPosts() {
  let response = await fetch("http://localhost:3000/posts");
  const postsList = await response.json();
  return postsList;
}
async function fetchComments() {
  let comments = await fetch("http://localhost:3000/comments");
  const commentsList = await comments.json();
  return commentsList;
}

async function fetchPostAuthors(postsList) {
  const authorsIds = postsList.map(post => post.authorId);
  const authorsPromises = authorsIds.map(authorId => fetch(`http://localhost:3000/profiles/${authorId}`));
  const allAuthorsPromise = Promise.all(authorsPromises);
  const authorsResponse = await allAuthorsPromise;
  const authorsData = await Promise.all(authorsResponse.map(authorResponse => authorResponse.json()));
  return authorsData;
}

function showAuthorAndPost(post, author) {
  let postContainerElement = document.createElement("div");
  postContainerElement.className = "post-contain";
  postContainerElement.setAttribute("data-id", post.id);
  const postElement = getPostElement(post);
  const authorElement = getAuthorElement(author);
  const editPostElement = document.createElement("div");
  editPostElement.className = "edit-post-button";
  editPostElement.title = "Редактировать";
  editPostElement.addEventListener("click", openEditPostModal);
  let delPostElement = document.createElement("div");
  delPostElement.className = "delete-post-button";
  delPostElement.title = "Удалить пост";
  delPostElement.addEventListener("click", deletePost);
  postContainerElement.appendChild(postElement);
  postContainerElement.appendChild(authorElement);
  postContainerElement.appendChild(delPostElement);
  postContainerElement.appendChild(editPostElement);
  document.body.appendChild(postContainerElement);
}

function getPostElement(post) {
  let postTitle = post.title;
  let postBody = post.body;
  let postRowElement = document.createElement("div");
  postRowElement.className = "posts-row";
  let postTitleElement = document.createElement("span");
  postTitleElement.textContent = postTitle;
  let postBodyElement = document.createElement("p");
  postBodyElement.textContent = postBody;
  let commentsWrapperElement = document.createElement("div");
  commentsWrapperElement.className = "comments-contain";
  postRowElement.appendChild(postTitleElement);
  postRowElement.appendChild(postBodyElement);
  postRowElement.appendChild(commentsWrapperElement);
  return postRowElement;
}

function getAuthorElement(author) {
  let authorName = author.name;
  let authorAvatar = author.avatar;
  let authorItemElement = document.createElement("div");
  authorItemElement.className = "author-item";
  let authorAvatarElement = document.createElement("img");
  authorAvatarElement.src = authorAvatar;
  let authorNameElement = document.createElement("p");
  authorNameElement.textContent = authorName;
  authorItemElement.appendChild(authorAvatarElement);
  authorItemElement.appendChild(authorNameElement);
  return authorItemElement;
}

function addPostsElement() {
  const createPostModalBackdropElement = document.createElement("div");
  createPostModalBackdropElement.className = "create-post-modal-backdrop";

  const closeModalButton = document.createElement("div");
  closeModalButton.className = "close-modal-button";
  closeModalButton.addEventListener("click", ()=>{
    wrapperPostElement.removeEventListener("submit", addNewPost);
    createPostModalBackdropElement.parentElement.removeChild(createPostModalBackdropElement);
  });
  closeModalButton.title = "ТЫ ТОЛЬКО НАЖМИ СЮДА, ПИДОР!";
  createPostModalBackdropElement.appendChild(closeModalButton);

  const wrapperPostElement = document.createElement("form");
  wrapperPostElement.id = "post-wrapper";
  wrapperPostElement.addEventListener("submit", addNewPost);

  const newPostTitleElement = document.createElement("input");
  newPostTitleElement.placeholder = "Введите хуй...";

  const postTitleLabelElement = createLabelElement("Заголовок", "new-title");
  newPostTitleElement.id = "new-title";

  const newPostBodyElement = document.createElement("textarea");
  newPostBodyElement.placeholder = "Введите глубже...";

  const postBodyLabelElement = createLabelElement("Текст поста", "new-post-body");
  newPostBodyElement.id = "new-post-body";

  const postAddElement = document.createElement("button")
  postAddElement.type = "submit";
  postAddElement.id = "create-post-button";
  postAddElement.textContent = "Опубликовать!";

  wrapperPostElement.appendChild(postTitleLabelElement);
  wrapperPostElement.appendChild(newPostTitleElement);
  wrapperPostElement.appendChild(postBodyLabelElement);
  wrapperPostElement.appendChild(newPostBodyElement);
  wrapperPostElement.appendChild(postAddElement);
  createPostModalBackdropElement.appendChild(wrapperPostElement);
  document.body.appendChild(createPostModalBackdropElement);
}

function createLabelElement(labelTitle, forId) {
  const labelElement = document.createElement("label");
  labelElement.className = "input-label";
  labelElement.textContent = labelTitle;
  labelElement.setAttribute('for', forId);
  return labelElement;
}
function getCommentElement(comment) {
  let commentBody = comment.body;
  let commentRowElement = document.createElement("div");
  commentRowElement.className = "comment-row";
  commentRowElement.textContent = commentBody;
  return commentRowElement;
}
function openEditPostModal(event) {
  const editPostButtonElement = event.target;
  const parentEventPostButton = editPostButtonElement.closest(".post-contain");
  // console.log(parentEventPostButton)
  const postTitleElement = parentEventPostButton.querySelector(".posts-row > span");
  const postBodyElement = parentEventPostButton.querySelector(".posts-row > p");
  console.log(postTitleElement.textContent);
  console.log(postBodyElement.textContent);

  const editPostModalBackdropElement = document.createElement("div");
  editPostModalBackdropElement.className = "edit-post-modal-backdrop";

  const closeEditModalButton = document.createElement("div");
  closeEditModalButton.className = "close-modal-button";
  closeEditModalButton.addEventListener("click", ()=>{
    wrapperEditElement.removeEventListener("submit", editCurrentPost);
    editPostModalBackdropElement.parentElement.removeChild(editPostModalBackdropElement);
  });
  closeEditModalButton.title = "ТЫ ТОЛЬКО НАЖМИ СЮДА, ПИДОР!";
  editPostModalBackdropElement.appendChild(closeEditModalButton);

  const wrapperEditElement = document.createElement("form");
  wrapperEditElement.className = "edit-wrapper";
  wrapperEditElement.addEventListener("submit", editCurrentPost);

  const postIdElement = document.createElement("input");
  postIdElement.type = "hidden";
  postIdElement.className = "hidden-id-post";
  postIdElement.value = parentEventPostButton.getAttribute("data-id");

  const editPostTitleElement = document.createElement("input");
  editPostTitleElement.className = "edit-title";
  editPostTitleElement.value = postTitleElement.textContent;
  const editPostTitleLabelElement = createLabelElement("Заголовок", "edit-title");

  const editPostBodyElement = document.createElement("textarea");
  editPostBodyElement.className = "edit-post-body";
  editPostBodyElement.value = postBodyElement.textContent;
  const editPostBodyLabelElement = createLabelElement("Текст поста", "edit-post-body");

  const postEditElement = document.createElement("button");
  postEditElement.type = "submit";
  postEditElement.className = "save-post-button";
  postEditElement.textContent = "Сохранить";

  wrapperEditElement.appendChild(postIdElement);
  wrapperEditElement.appendChild(editPostTitleLabelElement);
  wrapperEditElement.appendChild(editPostTitleElement);
  wrapperEditElement.appendChild(editPostBodyLabelElement);
  wrapperEditElement.appendChild(editPostBodyElement);
  wrapperEditElement.appendChild(postEditElement);
  editPostModalBackdropElement.appendChild(wrapperEditElement);
  document.body.appendChild(editPostModalBackdropElement);
}
//   const newPostBodyElement = document.createElement("textarea");
//   newPostBodyElement.placeholder = "Введите глубже...";
//
//   const postBodyLabelElement = createLabelElement("Текст поста", "new-post-body");
//   newPostBodyElement.id = "new-post-body";
//
//   const postAddElement = document.createElement("button")
//   postAddElement.type = "submit";
//   postAddElement.id = "create-post-button";
//   postAddElement.textContent = "Опубликовать!";
//
//   wrapperPostElement.appendChild(postTitleLabelElement);
//   wrapperPostElement.appendChild(newPostTitleElement);
//   wrapperPostElement.appendChild(postBodyLabelElement);
//   wrapperPostElement.appendChild(newPostBodyElement);
//   wrapperPostElement.appendChild(postAddElement);
//   createPostModalBackdropElement.appendChild(wrapperPostElement);
//   document.body.appendChild(createPostModalBackdropElement);
// }

//3. По клику на кнопку редатирования открывать предзаполненную (заголовок и тект поста) модалку
// с кнопками закрыть и сохранить
//2. Предзаполнить текстом поста из html элементов
//
//
//
//
//


// function showAuthorAndPost(post, author) {
//   let postContainerElement = document.createElement("div");
//   postContainerElement.className = "post-contain";
//   postContainerElement.setAttribute("data-id", post.id);
//   const postElement = getPostElement(post);
//   const authorElement = getAuthorElement(author);
//   postContainerElement.appendChild(postElement);
//   postContainerElement.appendChild(authorElement);
//   postContainerElement.appendChild(delPostElement);
//   document.body.appendChild(postContainerElement);
// }
// function getPostElement(post) {
//   let postTitle = post.title;
//   let postBody = post.body;
//   let postRowElement = document.createElement("div");
//   postRowElement.className = "posts-row";
//   let postTitleElement = document.createElement("p");
//   postTitleElement.textContent = postTitle;
//   let postBodyElement = document.createElement("span");
//   postBodyElement.textContent = postBody;
//   postRowElement.appendChild(postTitleElement);
//   postRowElement.appendChild(postBodyElement)
//   return postRowElement;
// }
