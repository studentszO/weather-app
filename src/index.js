/* global document */
import "./style.css";

// IMPORT ALL SVGS IN AN OBJECT
const svgContext = require.context("./assets/weather_icons", false, /\.svg$/);
const svgObject = svgContext.keys().reduce((acc, fileName) => {
  const key = fileName.replace("./", "").replace(".svg", ""); // Clean the filename
  acc[key] = svgContext(fileName); // Import each SVG
  return acc;
}, {});

function FtoCCalcul(temp) {
  const toCelsius = Math.round((temp - 32) * (5 / 9));
  const toFahrenheit = Math.round(temp);

  return { toCelsius, toFahrenheit };
}

function loading() {
  const textContainer = document.querySelector(".city-name");
  const loaderContainer = document.querySelector(".weather-icon");

  // REMOVE FOOTER AND TEMP CONTENT WHEN SEARCHING AGAIN
  const tempContainer = document.querySelector(".weather-temp");
  const conditionContainer = document.querySelector(".weather-conditions");
  const footerContainer = document.querySelector(".footer");

  // SET THE COLOR BACK TO NORMAL IF AN ERROR HAPPENED
  textContainer.style.color = "";

  // RESET THE DISPLAY OF THE ERROR SVG TO NONE IF AN ERROR HAPPENED
  document.querySelector(".weather-icon > svg").style.display = "none";

  if (tempContainer) tempContainer.textContent = "";
  if (conditionContainer) conditionContainer.textContent = "";
  if (footerContainer) footerContainer.textContent = "";

  loaderContainer.style = "";
  loaderContainer.classList.add("loader");
  textContainer.textContent = "LOADING";
}

function updateDOMAfterFetchingData(data) {
  // QUERIES
  const mainContainer = document.querySelector(".weather-container");
  const iconContainer = document.querySelector(".weather-icon");
  const cityNameContainer = document.querySelector(".city-name");
  const tempContainer = document.querySelector(".weather-temp");
  const conditionContainer = document.querySelector(".weather-conditions");

  // REMOVE FOOTER AND TEMP CONTENT WHEN SEARCHING AGAIN
  const footerContainer = document.querySelector(".footer");
  if (footerContainer) footerContainer.remove();
  tempContainer.textContent = "";

  // REMOVE LOADER FROM ICON CONTAINER
  iconContainer.classList.remove("loader");

  // ELEMENTS CREATION
  const tempDiv = document.createElement("div");
  const degreeDiv = document.createElement("div");
  const countryNameContainer = document.createElement("div");
  const footer = document.createElement("div");
  const weatherMinMaxTemp = document.createElement("div");
  const weatherMinTemp = document.createElement("div");
  const weatherMaxTemp = document.createElement("div");
  const weatherSunriseSunset = document.createElement("div");
  const weatherSunrise = document.createElement("div");
  const weatherSunset = document.createElement("div");

  // ADDING CLASSES
  footer.classList.add("footer");
  weatherMinMaxTemp.classList.add("weather-minmax-temp");
  weatherMinTemp.classList.add("weather-min-temp");
  weatherMaxTemp.classList.add("weather-max-temp");
  weatherSunriseSunset.classList.add("weather-sunrise-sunset");
  weatherSunrise.classList.add("weather-sunrise");
  weatherSunset.classList.add("weather-sunset");

  // SET THE BACKGROUND IMAGE FOR THE ICON
  iconContainer.style.backgroundImage = `url("${svgObject[data.icon]}")`;

  // ADDING CONTENT TO THE DOM ELEMENTS
  const minTemp = FtoCCalcul(data.temp);
  const temp = FtoCCalcul(data.maxTemp);
  const maxTemp = FtoCCalcul(data.minTemp);

  function tempHandler() {
    tempDiv.textContent =
      Number(tempDiv.textContent) === temp.toFahrenheit
        ? temp.toCelsius
        : temp.toFahrenheit;
    weatherMinTemp.textContent =
      Number(weatherMinTemp.textContent) === minTemp.toFahrenheit
        ? minTemp.toCelsius
        : minTemp.toFahrenheit;
    weatherMaxTemp.textContent =
      Number(weatherMaxTemp.textContent) === maxTemp.toFahrenheit
        ? maxTemp.toCelsius
        : maxTemp.toFahrenheit;
  }

  const switchInput = document.querySelector("input[type='checkbox']");
  switchInput.onclick = () => tempHandler();

  degreeDiv.textContent = "°";
  cityNameContainer.textContent = data.cityAddress;
  if (!data.countryAddress.includes(undefined))
    countryNameContainer.textContent = data.countryAddress;
  tempDiv.textContent = switchInput.checked
    ? temp.toCelsius
    : temp.toFahrenheit;
  weatherMinTemp.textContent = switchInput.checked
    ? minTemp.toCelsius
    : minTemp.toFahrenheit;
  weatherMaxTemp.textContent = switchInput.checked
    ? maxTemp.toCelsius
    : maxTemp.toFahrenheit;
  conditionContainer.textContent = data.conditions;
  weatherSunrise.textContent = data.sunrise;
  weatherSunset.textContent = data.sunset;

  // APPEND EVERYTHING
  cityNameContainer.append(countryNameContainer);
  tempContainer.prepend(tempDiv, degreeDiv);
  weatherMinMaxTemp.appendChild(weatherMinTemp);
  weatherMinMaxTemp.appendChild(weatherMaxTemp);
  weatherSunriseSunset.appendChild(weatherSunrise);
  weatherSunriseSunset.appendChild(weatherSunset);
  footer.appendChild(weatherMinMaxTemp);
  footer.appendChild(weatherSunriseSunset);
  mainContainer.append(footer);
}

function HTTPErrorHandler(statusCode) {
  const errorCodeContainer = document.querySelector(".city-name");
  const errorDescriptionContainer = document.createElement("div");
  const errorMarkSVG = document.querySelector(".weather-icon > svg");
  errorMarkSVG.style.display = "block";
  document.querySelector(".weather-icon").classList.remove("loader");

  errorCodeContainer.style.color = "#ff2600";
  errorDescriptionContainer.style.color = "#ff2600";

  switch (statusCode) {
    case 400:
      errorCodeContainer.textContent = "ERROR 400";
      errorDescriptionContainer.textContent =
        "REQUEST INVALID: location not found.";
      break;

    case 401:
      errorCodeContainer.textContent = "ERROR 401";
      errorDescriptionContainer.textContent =
        "API KEY invalid / ACCOUNT INACTIVE";
      break;

    case 429:
      errorCodeContainer.textContent = "ERROR 429";
      errorDescriptionContainer.textContent = "SUBMIT QUERIES EXCEEDED";
      break;

    case 500:
      errorCodeContainer.textContent = "ERROR 500";
      errorDescriptionContainer.textContent =
        "API SERVER ERROR. PLEASE TRY AGAIN";
      break;

    default:
      break;
  }

  errorCodeContainer.appendChild(errorDescriptionContainer);
}

async function getWeatherData(location) {
  if (!location) return;
  try {
    loading();
    const data = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=A9DLK3F7L33TUFZXEVW6GKL53`,
    );

    if (!data.ok) {
      //   throw new Error(`Response status: ${data.status}`);
      HTTPErrorHandler(data.status);
    }
    const dataStorage = await data.json();

    const neededData = {
      cityAddress: dataStorage.resolvedAddress.split(", ")[0],
      countryAddress: `${dataStorage.resolvedAddress.split(", ")[1]}, ${dataStorage.resolvedAddress.split(", ")[2]}`,
      conditions: dataStorage.currentConditions.conditions,
      temp: dataStorage.currentConditions.temp,
      icon: dataStorage.currentConditions.icon,
      sunrise: dataStorage.currentConditions.sunrise,
      sunset: dataStorage.currentConditions.sunset,
      minTemp: dataStorage.days[0].tempmin,
      maxTemp: dataStorage.days[0].tempmax,
    };

    updateDOMAfterFetchingData(neededData);
  } catch (err) {
    console.log(err);
  }
}

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  const input = document.querySelector("input[type='search']");

  event.preventDefault();

  if (input.value.length > 0) getWeatherData(input.value);
});

let arr = [1, 2, 3];
let arrCp = [...arr];
arr.pop();
console.log(arr);
console.log(arrCp);
