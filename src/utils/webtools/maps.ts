import {env} from '~/src/constants';

// @ts-ignore
const mapsActivationScript = document.createElement('script');

mapsActivationScript.setAttribute(
  'src',
  `https://maps.googleapis.com/maps/api/js?key=${env.googleMapsKey}`,
);

// @ts-ignore
document.head.appendChild(mapsActivationScript);
