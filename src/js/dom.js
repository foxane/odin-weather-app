import { format } from 'date-fns';
import getIcon from './geticon';
import getData from './index';

// TODO: Ditch innerHTML, embrace element factory. :)

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

  // Element factory
  elementFactory(element) {
    const { type, classes, textContent } = element;
    const el = document.createElement(type);
    el.classList.add(...classes);
    el.textContent = textContent;

    if (type === 'img') {
      el.src = element.src;
      el.width = element.width;
      el.alt = element.alt;
    }

    return el;
  },

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

    this.hero.innerHTML = '';

    // Create elements
    const heroMain = this.elementFactory({
      type: 'div',
      classes: ['hero-main'],
    });

    const weatherAndIcon = this.elementFactory({
      type: 'div',
      classes: ['weather-and-icon'],
    });

    const weatherImage = this.elementFactory({
      type: 'img',
      classes: ['main-image'],
      src: getIcon(condition.code),
      width: '100',
      alt: 'weather-icon',
    });
    weatherAndIcon.appendChild(weatherImage);

    const weatherText = this.elementFactory({
      type: 'p',
      classes: ['weather'],
      textContent: condition.text,
    });
    weatherAndIcon.appendChild(weatherText);
    heroMain.appendChild(weatherAndIcon);

    const heroDetail = this.elementFactory({
      type: 'div',
      classes: ['hero-detail'],
    });

    const tempBlock = this.elementFactory({
      type: 'div',
      classes: ['temp-block'],
    });

    const temperature = this.elementFactory({
      type: 'p',
      classes: ['temperature'],
      textContent: this.isCelcius ? temp_c : temp_f,
    });
    tempBlock.appendChild(temperature);

    const tempUnit = this.elementFactory({
      type: 'span',
      classes: ['temp-unit'],
      textContent: '°',
    });
    const unit = this.elementFactory({
      type: 'span',
      classes: ['unit'],
      textContent: this.isCelcius ? 'C' : 'F',
    });
    tempUnit.appendChild(unit);
    tempBlock.appendChild(tempUnit);

    heroDetail.appendChild(tempBlock);

    const micella = this.elementFactory({
      type: 'div',
      classes: ['micella'],
    });

    const windParagraph = this.elementFactory({
      type: 'p',
      classes: [],
    });
    const windIcon = this.elementFactory({
      type: 'img',
      classes: [],
      alt: 'wind-speed',
      width: '16',
      src: getIcon('wind'),
    });
    windParagraph.appendChild(windIcon);
    windParagraph.appendChild(document.createTextNode('Wind speed: '));
    const windStrong = this.elementFactory({
      type: 'strong',
      classes: ['wind-speed'],
      textContent: wind_kph,
    });
    windParagraph.appendChild(windStrong);
    micella.appendChild(windParagraph);

    const humidityParagraph = this.elementFactory({
      type: 'p',
      classes: [],
    });
    const humidityIcon = this.elementFactory({
      type: 'img',
      classes: [],
      src: getIcon('humidity'),
      width: '26',
      alt: 'humidity',
    });
    humidityParagraph.appendChild(humidityIcon);
    humidityParagraph.appendChild(document.createTextNode('Humidity: '));

    const humidityStrong = this.elementFactory({
      type: 'strong',
      classes: ['humidity'],
      textContent: `${humidity} %`,
    });
    humidityParagraph.appendChild(humidityStrong);
    micella.appendChild(humidityParagraph);

    const feelsLikeParagraph = this.elementFactory({
      type: 'p',
      classes: [],
    });
    const feelsLikeIcon = this.elementFactory({
      type: 'img',
      classes: [],
      src: getIcon('icon'),
      width: '26',
      alt: 'humidity',
    });
    feelsLikeParagraph.appendChild(feelsLikeIcon);
    feelsLikeParagraph.appendChild(document.createTextNode('Feels Like: '));

    const feelsLikeStrong = this.elementFactory({
      type: 'strong',
      classes: ['feels-like'],
      textContent: this.isCelcius ? feelslike_c : feelslike_f,
    });
    feelsLikeParagraph.appendChild(feelsLikeStrong);
    const feelsLikeUnit = this.elementFactory({
      type: 'span',
      classes: ['unit2'],
      textContent: this.isCelcius ? '°C' : '°F',
    });
    feelsLikeStrong.appendChild(feelsLikeUnit);

    micella.appendChild(feelsLikeParagraph);

    heroDetail.appendChild(micella);
    heroMain.appendChild(heroDetail);

    const locationDiv = this.elementFactory({
      type: 'div',
      classes: ['location'],
    });

    const locationParagraph = this.elementFactory({
      type: 'p',
      classes: ['location'],
      textContent: `${(name, region, country)}`,
    });
    locationDiv.appendChild(locationParagraph);

    const dateParagraph = this.elementFactory({
      type: 'p',
      classes: ['date'],
      textContent: date,
    });
    locationDiv.appendChild(dateParagraph);

    const timeParagraph = this.elementFactory({
      type: 'p',
      classes: ['time'],
      textContent: time,
    });
    locationDiv.appendChild(timeParagraph);

    // Append all elements to this.hero
    this.hero.appendChild(heroMain);
    this.hero.appendChild(locationDiv);
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
    // Create elements using elementFactory
    const forecastCard = this.elementFactory({
      type: 'div',
      classes: ['forecast-card'],
    });

    const foreTime = this.elementFactory({
      type: 'p',
      classes: ['fore-time'],
      textContent: format(new Date(hourItem.time), 'kk : mm b'),
    });
    forecastCard.appendChild(foreTime);

    const weatherIcon = this.elementFactory({
      type: 'img',
      classes: [],
      src: getIcon(hourItem.condition.code),
      width: '50',
      alt: 'weather-icon',
    });
    forecastCard.appendChild(weatherIcon);

    const foreWeather = this.elementFactory({
      type: 'p',
      classes: ['fore-weather'],
      textContent: hourItem.condition.text,
    });
    forecastCard.appendChild(foreWeather);

    const foreTemp = this.elementFactory({
      type: 'p',
      classes: ['fore-temp'],
      textContent: this.isCelcius
        ? `${hourItem.temp_c}°C`
        : `${hourItem.temp_f}°F`,
    });
    forecastCard.appendChild(foreTemp);

    // Append the forecast card to this.forecast
    this.forecast.appendChild(forecastCard);
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
