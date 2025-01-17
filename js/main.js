"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoriteStoriesList = $("#favorite-stories-list");
const $ownStoriesList = $("#own-stories-list");

const $storyForm = $("#story-form");
const $storyAuthor = $("#storyAuthor");
const $storyTitle = $("#storyTitle");
const $storyUrl = $("#storyUrl");
const $storyContainers = $(".story-container");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navUserLinks = $(".nav-user-links");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $navStorySubmit = $("#nav-story-submit");
const $navFavorites = $("#nav-favorites");
const $navOwnStories = $("#nav-own-stories");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $favoriteStoriesList,
    $ownStoriesList
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");
  //hiding user links in nav bar(shown when logged in)
  $navUserLinks.hide();
  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();

  //adding event listeners for adding favorites, adding/deleting own stories
  $body.on("click",".fa-star", favoriteHandler);
  $body.on("click",".deleteBtn", storyDeleteHandler);
  $storyForm.on('submit', storySubmitHandler);
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
