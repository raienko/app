// @ts-nocheck
import MaterialCommunityIcons from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';
import MaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf';
import FontAwesome from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import Ionicons from 'react-native-vector-icons/Fonts/Ionicons.ttf';
import Feather from 'react-native-vector-icons/Fonts/Feather.ttf';
import Volia from '~/assets/fonts/Volja-Black.ttf';

const customFonts = {
  // icons
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
  Ionicons,
  Feather,
  // fonts
  'Volia-Black': Volia,
};

const fontStyles = [];
for (let fontName in customFonts) {
  fontStyles.push(`@font-face {
    src: url(${customFonts[fontName]});
    font-family: ${fontName};
  }`);
}

const style = document.createElement('style');
style.type = 'text/css';

if (style.styleSheet) {
  style.styleSheet.cssText = fontStyles[0];
} else {
  fontStyles.forEach(fontStyle =>
    style.appendChild(document.createTextNode(fontStyle)),
  );
}

document.head.appendChild(style);
