"use strict";

const resultsNav = document.getElementById("resultsNav");
const favoritesNav = document.getElementById("favoritesNav");
const imagesContainer = document.getElementById("imagesContainer");
const saveConfirmed = document.getElementById("saveConfirmed");
const loader = document.getElementById("loader");

// NASA API
const count = 10; // images per request
const apiKey = "DEMO_KEY"; // Limits: 30 requests per hour / 50 requests per day
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let requestsArray = [];
let favorites = {};

const showContent = (page) => {
  window.scrollTo({
    top: 0,
    behavior: "instant",
  });

  if (page === "results") {
    resultsNav.classList.remove("hidden");
    favoritesNav.classList.add("hidden");
  } else {
    favoritesNav.classList.remove("hidden");
    resultsNav.classList.add("hidden");
  }

  loader.classList.add("hidden");
};

const createDOMNodes = function (page) {
  const currentArray =
    page === "results" ? requestsArray : Object.values(favorites);

  currentArray.forEach((result) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const link = document.createElement("a");
    link.href = result.hdurl;
    link.title = "View full image";
    link.target = "_blank";

    const image = document.createElement("img");
    image.classList.add("card-img-top");
    image.src = result.url;
    image.alt = result.title;
    image.loading = "lazy";

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = result.title;

    const saveText = document.createElement("p");
    saveText.classList.add("clickable");

    if (page === "results") {
      saveText.textContent = "Add to Favorites";
      saveText.setAttribute("onclick", `saveFavorite('${result.url}')`);
    } else {
      saveText.textContent = "Remove Favorite";
      saveText.setAttribute("onclick", `removeFavorite('${result.url}')`);
    }

    const cardText = document.createElement("p");
    cardText.classList.add("card-text");
    cardText.textContent = result.explanation;

    const footer = document.createElement("small");
    footer.classList.add("text-muted");

    const data = document.createElement("strong");
    data.textContent = result.date;

    const copyright = document.createElement("span");
    copyright.textContent = result.copyright
      ? ` ${result.copyright}`
      : " NASA (c)";

    // append elements
    footer.append(data, copyright);
    cardBody.append(cardTitle, saveText, cardText, footer);
    link.appendChild(image);
    card.append(link, cardBody);

    imagesContainer.appendChild(card);
  });
};

const updateDom = (page) => {
  if (localStorage.getItem("nasaFavorites")) {
    favorites = JSON.parse(localStorage.getItem("nasaFavorites"));
  }

  imagesContainer.textContent = "";
  createDOMNodes(page);

  // remove loader and up to page top
  showContent(page);
};

const getNasaPictures = async function () {
  loader.classList.remove("hidden");

  try {
    const response = await fetch(apiUrl);
    requestsArray = await response.json();
    updateDom("results");
  } catch (error) {
    console.error(error);
  }
};

const saveFavorite = (itemUrl) => {
  requestsArray.forEach((item) => {
    if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
      favorites[itemUrl] = item;

      //show ADDED mark to 2 sec
      saveConfirmed.hidden = false;
      setTimeout(() => {
        saveConfirmed.hidden = true;
      }, 2000);

      // localStorage
      localStorage.setItem("nasaFavorites", JSON.stringify(favorites));
    }
  });
};

const removeFavorite = (itemUrl) => {
  if (favorites[itemUrl]) {
    delete favorites[itemUrl];
    localStorage.setItem("nasaFavorites", JSON.stringify(favorites));

    updateDom("favorites");
  }
};

getNasaPictures();
