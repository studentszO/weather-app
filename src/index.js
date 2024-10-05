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

function updateDOMAfterFetchingData(data) {
  // QUERIES
  const mainContainer = document.querySelector(".weather-container");
  const iconContainer = document.querySelector(".weather-icon");
  const cityNameContainer = document.querySelector(".city-name");
  const tempContainer = document.querySelector(".weather-temp");
  const conditionContainer = document.querySelector(".weather-conditions");

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

  degreeDiv.textContent = "°";
  cityNameContainer.textContent = data.cityAddress;
  countryNameContainer.textContent = data.countryAddress;
  tempDiv.textContent = temp.toFahrenheit;
  weatherMinTemp.textContent = minTemp.toFahrenheit;
  weatherMaxTemp.textContent = maxTemp.toFahrenheit;
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
}

async function getWeatherData(location) {
  if (!location) return;
  try {
    const data = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=A9DLK3F7L33TUFZXEVW6GKL53`,
    );

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
