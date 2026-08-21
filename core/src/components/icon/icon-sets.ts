import {
  AntDesign,
  type AntDesignIconName,
} from "@react-native-vector-icons/ant-design";
import {
  Feather,
  type FeatherIconName,
} from "@react-native-vector-icons/feather";
import {
  FontAwesome6,
  type FontAwesome6IconName,
} from "@react-native-vector-icons/fontawesome6";
import {
  Ionicons,
  type IoniconsIconName,
} from "@react-native-vector-icons/ionicons";
import {
  MaterialIcons,
  type MaterialIconsIconName,
} from "@react-native-vector-icons/material-icons";

/**
 * Every react-native-vector-icons family Icon supports. Add a new family by
 * adding one line here (component) and one line to IconNameByType below
 * (its glyph-name type) — nothing else needs to change.
 */
export const ICON_SETS = {
  Feather,
  MaterialIcons,
  Ionicons,
  FontAwesome6,
  AntDesign,
};

export type IconSetType = keyof typeof ICON_SETS;

export type IconNameByType = {
  Feather: FeatherIconName;
  MaterialIcons: MaterialIconsIconName;
  Ionicons: IoniconsIconName;
  FontAwesome6: FontAwesome6IconName;
  AntDesign: AntDesignIconName;
};
