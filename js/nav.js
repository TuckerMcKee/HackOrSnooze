"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  $allStoriesList.show();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $navUserLinks.show();
}

//toggling display of form for submitting new story
function navStoryForm() {
  console.debug("navStoryForm");
  $storyForm.toggle();
}

$navStorySubmit.on('click', navStoryForm);

//navigating to favorites list
function navFavorites() {
  $favoriteStoriesList.show();
  $allStoriesList.hide();
  $ownStoriesList.hide();
}

$navFavorites.on('click', navFavorites);

//navigating to own stories list
function navOwnStories() {
  $favoriteStoriesList.hide();
  $allStoriesList.hide();
  $ownStoriesList.show();
}

$navOwnStories.on('click', navOwnStories);

