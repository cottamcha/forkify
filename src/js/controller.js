import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import { mark } from 'regenerator-runtime';
import 'core-js/stable';

// const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    //CAPTURE RECIPE ID
    const id = window.location.hash.slice(1);
    if (!id) return;

    //RENDER THE LOADING SPINNER
    recipeView.renderSpinner();

    // 0) RESULTS VIEW TO MARK SELECTED
    resultsView.update(model.getSearchResultsPage());

    // 1) LOAD RECIPE
    await model.loadRecipe(id);

    // 2) RENDERING RECIPE
    recipeView.render(model.state.recipe);

    // 3) UPDATING BOOK MARKS VIEW
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) GET SEARCH RESULTS
    const query = searchView.getQuery();
    if (!query) return;

    // 2) LOAD SEARCH RESULTS
    await model.loadSearchResults(query);

    // 3) RENDER RESULTS
    resultsView.render(model.getSearchResultsPage());

    // 4) RENDER INITIAL PAGINATION BUTTONS
    paginationView.render(model.state.search);

    console.log(model);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotToPage) {
  // 1) RENDER NEW RESULTS
  resultsView.render(model.getSearchResultsPage(gotToPage));

  // 2) RENDER NEW PAGINATION BUTTONS
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // UPDATE RECIPE SERVINGS
  model.updateServings(newServings);

  //UPDATING THE VIEW
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) ADD/REMOVE BOOKMARKS
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) UPDATE RECIPE VIEW
  recipeView.update(model.state.recipe);

  // 3) RENDER BOOKMARKS
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //SHOW SPINNER
    addRecipeView.renderSpinner();

    //UPLOAD THE NEW RECIPE
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //RENDER RECIPE
    recipeView.render(model.state.recipe);

    //SUCCESS MESSAGE
    addRecipeView.renderMessage();

    //RENDER BOOKMARK VIEW
    bookmarksView.render(model.state.bookmarks);

    //CHANGE ID IN URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //CLOSE FORM WINDOW
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};

init();
