import { format } from 'date-fns';
import getIcon from './geticon';
import getData from './index';

const dom = {
  // DOM elements
  hero: document.querySelector('.hero'),
  forecast: document.querySelector('.forecast'),
  searchInput: document.querySelector('.search-input'),
  searchBtn: document.querySelector('.search-btn'),
  unitBtn: document.querySelector('.temp-btn'),
  modal: document.querySelector('.modal'),

  // State variables
  isCelcius: true,
  currentLocation: '',
  data: null,
  hoursArr: [],

  // Update functions
  updateAll() {
    this.updateHero();
    this.updateForecast();
  },

  updateHero() {
    if (!this.data) return;
    const { location, current } = this.data;
    const { localtime, name, region, country } = location;
    const {
      condition,
      temp_c,
      temp_f,
      wind_kph,
      wind_mph,
      humidity,
      feelslike_c,
      feelslike_f,
    } = current;

    const date = format(new Date(localtime), 'eee do MMM yyy');
    const time = format(new Date(localtime), 'kk : mm b');

    this.hero.innerHTML = `
      <div class="hero-main">
        <div class="weather-and-icon">
          <img src="${getIcon(
            condition.code,
          )}" alt="weather-image" width="100px" class="main-image"/>
          <p class="weather">${condition.text}</p>
        </div>
        <div class="hero-detail">
          <div class="temp-block">
            <p class="temperature">${this.isCelcius ? temp_c : temp_f}</p>
            <span class="temp-unit">&deg;<span class="unit">${
              this.isCelcius ? 'C' : 'F'
            }</span></span>
          </div>
          <div class="micella">
            <p><img src="${getIcon(
              'wind',
            )}" alt="wind-speed" width="16" />Wind speed: <strong class="wind-speed">${
      this.isCelcius ? `${wind_kph} Km/h` : `${wind_mph} Mp/h`
    }</strong></p>
            <p><img src="${getIcon(
              'humidity',
            )}" alt="humidity" width="16" />Humidity: <strong class="humidity">${humidity} %</strong></p>
            <p><img src="${getIcon(
              'feel',
            )}" alt="feels-like" width="16" />Feels like: <strong class="feels-like">${
      this.isCelcius ? feelslike_c : feelslike_f
    } &deg;<span class="unit2">${this.isCelcius ? 'C' : 'F'}</span></strong></p>
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

  updateForecast() {
    if (!this.data) return;
    const { forecast } = this.data;
    this.hoursArr.length = 0;

    const localTimeStamp = this.data.location.localtime_epoch;
    forecast.forecastday.forEach((day) => {
      for (let i = 0; i < day.hour.length; i += 1) {
        if (this.hoursArr.length === 5) break;
        if (day.hour[i].time_epoch - localTimeStamp > 0) {
          this.hoursArr.push(day.hour[i]);
        }
      }
    });

    this.forecast.innerHTML = '<h2>Forecast</h2>';
    this.hoursArr.forEach((item) => this.renderCard(item));
  },

  renderCard(hourItem) {
    this.forecast.innerHTML += `
      <div class="forecast-card">
        <p class="fore-time">${format(new Date(hourItem.time), 'kk : mm b')}</p>
        <img src="${getIcon(
          hourItem.condition.code,
        )}" alt="weather-icon" width="50" />
        <p class="fore-weather">${hourItem.condition.text}</p>
        <p class="fore-temp">${
          this.isCelcius
            ? `${hourItem.temp_c}&deg;C`
            : `${hourItem.temp_f}&deg;F`
        }</p>
      </div>
    `;
  },

  changeUnit() {
    if (!this.data) return;
    const { current } = this.data;
    const temp1 = document.querySelector('.temperature');
    const temp2 = document.querySelector('.feels-like');
    const unit = document.querySelector('.unit');
    const foreTemp = document.querySelectorAll('.fore-temp');

    temp1.textContent = this.isCelcius ? current.temp_c : current.temp_f;
    unit.textContent = this.isCelcius ? 'C' : 'F';
    temp2.innerHTML = `${
      this.isCelcius ? current.feelslike_c : current.feelslike_f
    } &deg;<span class="unit2">${this.isCelcius ? 'C' : 'F'}</span>`;

    for (let i = 0; i < this.hoursArr.length; i += 1) {
      foreTemp[i].innerHTML = `${
        this.isCelcius
          ? `${this.hoursArr[i].temp_c}&deg;C`
          : `${this.hoursArr[i].temp_f}&deg;F`
      }`;
    }
  },

  showLoading() {
    this.modal.innerHTML = `<img src="${getIcon(
      'loading',
    )}" alt="loading-icon" width="100" />`;
    this.modal.classList.remove('hidden');
  },

  hideLoading() {
    this.modal.classList.add('hidden');
  },

  showError(msg) {
    this.modal.innerHTML = `<img src="${getIcon(
      'error',
    )}" alt="error-icon" width="100" />
      <h2>${msg}</h2>
      <button>Confirm</button>
    `;

    console.log(this.modal);
    this.modal.classList.add('error');
    this.modal.classList.remove('hidden');
    this.modal.addEventListener('click', dom.hideError);
  },

  hideError() {
    console.log(dom.modal);
    dom.modal.classList.remove('error');
    dom.modal.classList.add('hidden');
    dom.modal.removeEventListener('click', dom.hideError);
  },
};

async function submitControl(initVal) {
  dom.showLoading();

  if (initVal) {
    dom.currentLocation = 'london'; // Default location
    dom.data = await initVal;
  } else {
    dom.currentLocation = dom.searchInput.value;
    dom.data = await getData(dom.searchInput.value);
  }

  if (dom.data instanceof Error) {
    dom.searchInput.value = '';
    dom.hideLoading();
    dom.showError(dom.data.message);
  } else {
    dom.searchInput.value = '';
    dom.updateAll();
    dom.hideLoading();
  }
}

// Event listeners
dom.searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && dom.searchInput.value !== dom.currentLocation) {
    submitControl();
  }
});

dom.searchBtn.addEventListener('click', () => {
  if (dom.searchInput.value !== dom.currentLocation) {
    submitControl();
  }
});

dom.unitBtn.addEventListener('click', () => {
  dom.isCelcius = !dom.isCelcius;
  dom.unitBtn.innerHTML = dom.isCelcius ? '&deg;F' : '&deg;C';
  dom.changeUnit();
});

export default submitControl;
