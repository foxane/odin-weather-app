import dayClear from '../images/weather/day-clear.svg';
import dayCloud from '../images/weather/day-cloud.svg';
import dayRain from '../images/weather/day-rain.svg';
import nightClear from '../images/weather/night-clear.svg';
import nightCloud from '../images/weather/night-cloud.svg';
import nightRain from '../images/weather/night-rain.svg';

// Non-weather images
// Idk if i should put it here or in dom module, but dumping all images into one sounds good
import wind from '../images/wind.svg';
import feels from '../images/feel.svg';
import humidity from '../images/humidity.svg';
import loading from '../images/loading.svg';
import error from '../images/error.svg';

export default function getIcon(code, isDay) {
  if (code === 'wind') {
    return wind;
  }
  if (code === 'feel') {
    return feels;
  }
  if (code === 'humidity') {
    return humidity;
  }
  if (code === 'loading') {
    return loading;
  }
  if (code === 'error') {
    return error;
  }

  if (isDay) {
    switch (code) {
      case 1000:
        console.log(dayClear);
        return dayClear;

      case 1003:
      case 1006:
      case 1009:
      case 1030:
      case 1063:
      case 1066:
      case 1069:
      case 1072:
      case 1087:
      case 1114:
      case 1135:
      case 1147:
        return dayCloud;

      default:
        return dayRain;
    }
  } else {
    switch (code) {
      case 1000:
        return nightClear;

      case 1003:
      case 1006:
      case 1009:
      case 1030:
      case 1063:
      case 1066:
      case 1069:
      case 1072:
      case 1087:
      case 1114:
      case 1135:
      case 1147:
        return nightCloud;

      default:
        return nightRain;
    }
  }
}
