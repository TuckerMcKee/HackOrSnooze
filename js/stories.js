"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
  $allStoriesList.show();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup");
  let favStar = "";
  let deleteBtn = "";
  //checking if user is logged in
  if (currentUser){
    //checking if story is favorited, changing HTML markup accordingly
    let isFavorite = 'far ';
    if (currentUser.favorites.find(val => val.storyId === story.storyId) !== undefined) {
      isFavorite = 'fa ';
    };
    favStar = `<span class="${isFavorite}fa-star"></span>`;
    //adding delete button if story was added by current user
    if (currentUser.ownStories.find(val => val.storyId === story.storyId) !== undefined) {
      deleteBtn = `<button class="deleteBtn">X</button>`;
      };
  };
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <section class="story-container">
          <div class="favorite-delete-container">
            ${favStar}
            ${deleteBtn}
          </div>
          <div class="story-details-container">
            <h5 class="story-title">
              <a href="${story.url}" target="a_blank" class="story-link">
              ${story.title}
              </a>
              <small class="story-hostname">(${hostName})</small>
            </h5>
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
          </div>
        </section>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  };
  if (currentUser) {
    putFavoriteStoriesOnPage();
    putOwnStoriesOnPage();
  };
}

//gets list of favorites from current user and add to favorites list
function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStoriesList.empty();

  // loop through favorite stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }
  //message display if no favorites
  if ($favoriteStoriesList.text() === ""){
    $favoriteStoriesList.text("You haven't added any favorites!")
  }
}

//getts list of current user's own submitted stories and adds to own stories list 
function putOwnStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $ownStoriesList.empty();

  // loop through own stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $ownStoriesList.append($story);
  }
  //message display if no stories added
  if ($ownStoriesList.text() === ""){
    $ownStoriesList.text("You haven't submitted any stories!")
  }
}

//event handler for submitting new stories through form 
async function storySubmitHandler(e) {
  e.preventDefault();
  console.debug("storySubmitHandler");
  const title = $storyTitle.val();
  const author = $storyAuthor.val();
  const url = $storyUrl.val();
  const storyObj = {title, author, url};
  await storyList.addOwnStory(currentUser, storyObj);
  putStoriesOnPage();
}

//event handler for deleting own stories through delete buttons
async function storyDeleteHandler(e) {
  e.preventDefault();
  const currStoryId = e.target.parentElement.parentElement.parentElement.id;
  const storyObj = storyList.stories.filter(val => val.storyId === currStoryId)[0];
  await storyList.deleteOwnStory(currentUser,storyObj);
  putStoriesOnPage();
}

//event handler for adding/removing from favorites
async function favoriteHandler(e) {
  e.preventDefault();
  const currStoryId = e.target.parentElement.parentElement.parentElement.id;
  const storyObj = storyList.stories.filter(val => val.storyId === currStoryId)[0];
  await User.toggleFavorite(storyObj);
  e.target.className = e.target.className === "fa fa-star favorite" ? "fa fa-star" : "fa fa-star favorite";
  putStoriesOnPage();
}
