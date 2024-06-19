/* eslint-disable camelcase */
/* eslint-disable indent */
/* eslint-disable no-undef */
import { daysToWeeks, format, isFuture } from 'date-fns'; //eslint-disable-line
import getIcon from './geticon'; //eslint-disable-line
import getData from './index'; //eslint-disable-line

// Template elements
const hero = document.querySelector('.hero');
const forecast = document.querySelector('.forecast');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const unitBtn = document.querySelector('.temp-btn');
const modal = document.querySelector('.modal');

let g_isCelcius = true;
let g_currentLocation = '';
let g_data;
const hoursArr = [];

// Main
const dom = {
  updateAll() {
    this.updateHero(g_data);
    this.updateForecast(g_data);
  },

  updateHero(data) {
    const isMetric = true;
    const { localtime, name, region, country } = data.location; //eslint-disable-line
    const {
      condition,
      temp_c,
      temp_f,
      wind_kph,
      wind_mph,
      humidity,
      feelslike_c,
      feelslike_f,
    } = data.current;
    const date = format(new Date(localtime), 'eee do MMM yyy');
    const time = format(new Date(localtime), 'kk : mm b');

    hero.innerHTML = `
    <div class="hero-main">
          <div class="weather-and-icon">
            <img src="${getIcon(
              condition.code,
            )}" alt="weather-image" width="100px" class="main-image"/>
            <p class="weather">${condition.text}</p>
          </div>
          <div class="hero-detail">
            <div class="temp-block">
              <p class="temperature">${g_isCelcius ? temp_c : temp_f}</p>
              <span class="temp-unit">&deg;<span class="unit">${
                g_isCelcius ? 'C' : 'F'
              }</span></span>
            </div>
            <div class="micella">
              <p><img 
              src="${getIcon('wind')}" 
              alt="wind-speed" 
              width="16" 
              />Wind speed: <strong class="wind-speed">${
                isMetric ? `${wind_kph} Km/h` : `${wind_mph} Mp/h`
              }</strong></p>
              <p><img
                  src="${getIcon('humidity')}"
                  alt="humidity"
                  width="16"
                />Humidity: <strong class="humidity">${humidity} %</strong></p>
              <p><img 
                  src="${getIcon('feel')}" 
                  alt="feels-like" 
                  width="16" 
                  />Feels like: <strong class="feels-like">${
                    g_isCelcius ? feelslike_c : feelslike_f
                  } &deg;<span class="unit2">${
      g_isCelcius ? 'C' : 'F'
    }</span></strong></p>
            </div>
          </div>
        </div>
        <div class="location">
          <p class="location">${name}, ${region}, ${country}</p>
          <p class="date">${date}</p>
          <p class="time">${time}</p>
        </div>
    `;
  },
  updateForecast(data) {
    // Filter 5 hour forecast, NOTE: To add more, make sure container have space
    hoursArr.length = 0;
    const localTimeStamp = data.location.localtime_epoch;
    console.log(localTimeStamp);
    data.forecast.forecastday.forEach((day) => {
      // Only fetch 2 day, forEach is fine
      for (let i = 0; i < day.hour.length; i += 1) {
        if (hoursArr.length === 5) break;
        if (day.hour[i].time_epoch - localTimeStamp > 0) {
          console.log(day.hour[i]);
          hoursArr.push(day.hour[i]);
        }
      }
    });

    // Create Card
    function renderCard(hourItem) {
      forecast.innerHTML += `
          <div class="forecast-card">
            <p class="fore-time">${format(
              new Date(hourItem.time),
              'kk : mm b',
            )}</p>
            <img src="${getIcon(
              hourItem.condition.code,
            )}" alt="weather-icon" width="50" />
            <p class="fore-weather">${hourItem.condition.text}</p>
            <p class="fore-temp">${
              g_isCelcius
                ? `  ${hourItem.temp_c}&deg;C`
                : `  ${hourItem.temp_f}&deg;F`
            }</p>
          </div>
      `;
    }

    // Render card
    forecast.innerHTML = '<h2>Forecast</h2>';
    console.log(hoursArr);
    hoursArr.forEach((item) => renderCard(item));
  },
  changeUnit() {
    const temp1 = document.querySelector('.temperature');
    const temp2 = document.querySelector('.feels-like');
    const unit = document.querySelector('.unit');
    const foreTemp = document.querySelectorAll('.fore-temp');

    const temp2html = g_isCelcius
      ? `${g_data.current.feelslike_c}&deg;C`
      : `${g_data.current.feelslike_f}&deg;F`;

    temp1.textContent = g_isCelcius
      ? g_data.current.temp_c
      : g_data.current.temp_f;
    unit.textContent = g_isCelcius ? 'C' : 'F';
    temp2.innerHTML = temp2html;

    for (let i = 0; i < hoursArr.length; i += 1) {
      foreTemp[i].innerHTML = g_isCelcius
        ? `  ${hoursArr[i].temp_c}&deg;C`
        : `  ${hoursArr[i].temp_f}&deg;F`;
    }
  },

  showLoading() {
    modal.innerHTML = `<img src="${getIcon(
      'loading',
    )}" alt="loading-icon" width="100" />`;
    modal.classList.remove('hidden');
  },
  hideLoading() {
    modal.classList.add('hidden');
  },
  showError(msg) {
    modal.innerHTML = `<img src="${getIcon(
      'error',
    )}" alt="loading-icon" width="100" />
    <h2>${msg}</h2>
    <button>Confirm</button>
    `;
    modal.classList.add('error');
    modal.classList.remove('hidden');
    modal.addEventListener('click', this.hideError);
  },
  hideError() {
    modal.classList.remove('error');
    modal.classList.add('hidden');
    modal.removeEventListener('click', this.hideError);
  },
};

// Top level fn
async function submitControl(initVal) {
  dom.showLoading();
  // On page load
  if (initVal) {
    g_currentLocation = 'london';
    g_data = await initVal;
  } else {
    g_currentLocation = searchInput.value;
    g_data = await getData(searchInput.value);
  }

  if (g_data instanceof Error) {
    searchInput.value = '';
    dom.hideLoading();
    dom.showError(g_data);
  } else {
    searchInput.value = '';
    dom.updateAll();
    dom.hideLoading();
  }
}

// Event handler
searchInput.addEventListener('keypress', (e) => {
  if (e.key !== 'Enter') return;
  if (searchInput.value === '' || searchInput.value === g_currentLocation) {
    return;
  }
  submitControl();
});
searchBtn.addEventListener('click', () => {
  if (searchInput.value === '' || searchInput.value === g_currentLocation) {
    return;
  }
  submitControl();
});
unitBtn.addEventListener('click', () => {
  g_isCelcius = !g_isCelcius; // FUNKING COOOL
  unitBtn.innerHTML = g_isCelcius ? '&deg;F' : '&deg;C';
  dom.changeUnit();
});

export default submitControl;
