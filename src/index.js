/* global document */
import "./style.css";

// IMPORT ALL SVGS IN AN OBJECT
const svgContext = require.context("./assets/weather_icons", false, /\.svg$/);
const svgObject = svgContext.keys().reduce((acc, fileName) => {
  const key = fileName.replace("./", "").replace(".svg", ""); // Clean the filename
  acc[key] = svgContext(fileName); // Import each SVG
  return acc;
}, {});

let neededData;

function updateDOMAfterFetchingData(data) {
  const iconContainer = document.querySelector(".weather-icon");
  const cityNameContainer = document.querySelector(".city-name");
  const weatherSunriseContainer = document.querySelector(".weather-sunrise");
  const weatherSunsetContainer = document.querySelector(".weather-sunset");
  const tempContainer = document.querySelector(".weather-temp");
  const feelsLikeContainer = document.querySelector(".weather-feelslike");
  const conditionContainer = document.querySelector(".weather-conditions");

  const icon = document.createElement("img");
  const tempDiv = document.createElement("div");

  tempContainer.append(tempDiv);
  iconContainer.append(icon);

  icon.src = svgObject[data.icon];
  icon.setAttribute("alt", `${data.icon} Icon`);

  cityNameContainer.textContent = data.address;
  tempDiv.textContent = data.temp;
  feelsLikeContainer.textContent = `${data.feelsLike}°`;
  conditionContainer.textContent = data.conditions;
  weatherSunriseContainer.textContent = data.sunrise;
  weatherSunsetContainer.textContent = data.sunset;
}

async function getWeatherData(location) {
  if (!location) return;
  try {
    const data = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=A9DLK3F7L33TUFZXEVW6GKL53`,
    );

    const dataStorage = await data.json();

    neededData = {
      address: dataStorage.resolvedAddress,
      conditions: dataStorage.currentConditions.conditions,
      temp: dataStorage.currentConditions.temp,
      icon: dataStorage.currentConditions.icon,
      sunrise: dataStorage.currentConditions.sunrise,
      sunset: dataStorage.currentConditions.sunset,
      feelsLike: dataStorage.currentConditions.feelslike,
    };

    updateDOMAfterFetchingData(neededData);
  } catch (err) {
    console.log(err);
  }
}

getWeatherData("stsebastien sur loire");
