"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    let parsedUrl = this.url.slice(8, this.url.length);
    return parsedUrl.slice(0,parsedUrl.indexOf("/"));
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addOwnStory(user, storyObj) {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {token : user.loginToken, story : storyObj}
    });
    let currStory = new Story(response.data.story);
    this.stories.push(currStory);
    currentUser.ownStories.push(currStory);
    return currStory;
  }

  //delete story from API and from storyList
  async deleteOwnStory(user, storyObj) {
    const response = await axios({
      url: `${BASE_URL}/stories/${storyObj.storyId}`,
      method: "DELETE",
      data: { token : user.loginToken },
    });
    //removing from storyList 
    this.stories.splice(this.stories.findIndex(val => val.storyId === response.data.story.storyId),1);
    //removing from currentUser.ownStories
    const ownStoriesIndex = currentUser.ownStories.findIndex(val => val.storyId === response.data.story.storyId);
    currentUser.ownStories.splice(ownStoriesIndex,1);
    //removing from currentUser.favorites
    const favIndex = currentUser.favorites.findIndex(val => val.storyId === response.data.story.storyId);
    if (favIndex !== -1) currentUser.favorites.splice(favIndex,1);
    console.debug("STORY DELETED");
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  //adding/removing favorite stories
  static async toggleFavorite(story) {
    const token = currentUser.loginToken;
    //checking if story is in favorites
    if (currentUser.favorites.findIndex(val => val.storyId === story.storyId) === -1){
      const response = await axios({
        url: `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
        method: "POST",
        params: { token }
      });
      //updating currentUser favorites from API data
      currentUser.favorites.length = 0;
      for (let fav of response.data.user.favorites){
        let storyObj = new Story(fav);
        currentUser.favorites.push(storyObj);
      }
    }
    //deleting favorite, updating currentUser favorites
    else {
      const response = await axios({
        url: `${BASE_URL}/users/${currentUser.username}/favorites/${story.storyId}`,
        method: "DELETE",
        params: { token }
      });
      currentUser.favorites.length = 0;
      for (let fav of response.data.user.favorites){
        let storyObj = new Story(fav);
        currentUser.favorites.push(storyObj);
      }
    } 
  }
}