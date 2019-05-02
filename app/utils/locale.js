import tz from 'npm:jstz';
import countriesAndTimezones from 'npm:countries-and-timezones';

// Can cache to only calculate once because we likely never will use the app and cross timezones
const cachedTimezoneId = tz.determine().name();

export function getTimezone() {
  return cachedTimezoneId;
}

export function getCountryCode() {
  const tz = getTimezone();
  if (tz) {
    const countries = countriesAndTimezones.getCountriesForTimezone(tz);
    if (countries && countries[0]) {
      return countries[0].id;
    }
  }
}
