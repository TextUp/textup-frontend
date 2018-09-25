import tz from 'npm:jstz';
import countriesAndTimezones from 'npm:countries-and-timezones';

export function getTimezone() {
  return tz.determine().name();
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
