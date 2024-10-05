/* global document */
import "./style.css";

// IMPORT ALL SVGS IN AN OBJECT
const svgContext = require.context("./assets/weather_icons", false, /\.svg$/);
const svgObject = svgContext.keys().reduce((acc, fileName) => {
  const key = fileName.replace("./", "").replace(".svg", ""); // Clean the filename
  acc[key] = svgContext(fileName); // Import each SVG
  return acc;
}, {});

function updateDOMAfterFetchingData(data) {
  const iconContainer = document.querySelector(".weather-icon");
  const cityNameContainer = document.querySelector(".city-name");
  const weatherSunriseContainer = document.querySelector(".weather-sunrise");
  const weatherSunsetContainer = document.querySelector(".weather-sunset");
  const tempContainer = document.querySelector(".weather-temp");
  const minTempContainer = document.querySelector(".weather-min-temp");
  const maxTempContainer = document.querySelector(".weather-max-temp");
  const conditionContainer = document.querySelector(".weather-conditions");

  const tempDiv = document.createElement("div");
  const countryNameContainer = document.createElement("div");

  iconContainer.style.backgroundImage = `url("${svgObject[data.icon]}")`;

  cityNameContainer.textContent = data.cityAddress;
  countryNameContainer.textContent = data.countryAddress;
  tempDiv.textContent = data.temp;
  minTempContainer.textContent = `${data.minTemp}°`;
  maxTempContainer.textContent = `${data.maxTemp}°`;
  conditionContainer.textContent = data.conditions;
  weatherSunriseContainer.textContent = data.sunrise;
  weatherSunsetContainer.textContent = data.sunset;

  cityNameContainer.append(countryNameContainer);
  tempContainer.prepend(tempDiv);
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

getWeatherData("stsebastien sur loire");
