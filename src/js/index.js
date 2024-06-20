import '../css/main.css';
import submitControl from './dom'; //eslint-disable-line

async function getData(city) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=a257537d02f84ee08ce113837241706&q=${city}&days=3&aqi=no&alerts=no`,
      { mode: 'cors' },
    );
    const data = await response.json();
    // why here and not after response, is to get the actual message error
    console.log(data);
    if (Object.prototype.hasOwnProperty.call(data, 'error')) {
      throw new Error(data.error.message);
    }

    return data;
  } catch (error) {
    // Not much to do, dom will handle it

    return error;
  }
}

// Init
submitControl(getData('london'));

export default getData;
