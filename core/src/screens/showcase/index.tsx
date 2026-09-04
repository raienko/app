import { View } from "react-native";

import Accordion from "@/components/accordion";
import Icon from "@/components/icon";
import Screen from "@/components/screen";
import Text from "@/components/text";
import env from "@/constants/env";
import { useLocale, type TranslationKey } from "@/features/localization";
import { createStyles, useSizes } from "@/features/responsive";

import AccessibilitySection from "./sections/accessibility";
import ButtonsSection from "./sections/buttons";
import CardSection from "./sections/card";
import CarouselSection from "./sections/carousel";
import CheckboxesSection from "./sections/checkboxes";
import DeepLinksSection from "./sections/deep-links";
import GridSection from "./sections/grid";
import HeaderSection from "./sections/header";
import IconsSection from "./sections/icons";
import ImagePickerSection from "./sections/image-picker";
import ImagesSection from "./sections/images";
import InputsSection from "./sections/inputs";
import LocalizationSection from "./sections/localization";
import LoggerSection from "./sections/logger";
import ModalsSection from "./sections/modals";
import PermissionsSection from "./sections/permissions";
import PopupsSection from "./sections/popups";
import ProgressBarSection from "./sections/progress-bar";
import RadioButtonsSection from "./sections/radio-buttons";
import ResponsiveSection from "./sections/responsive";
import StorageSection from "./sections/storage";
import StateViewsSection from "./sections/state-views";
import SegmentedControlSection from "./sections/segmented-control";
import SlidersSection from "./sections/sliders";
import SpacerSection from "./sections/spacer";
import SwitchesSection from "./sections/switches";
import TabBarSection from "./sections/tab-bar";
import ThemeSection from "./sections/theme";
import ToastsSection from "./sections/toasts";
import TypographySection from "./sections/typography";
import UtilitiesSection from "./sections/utilities";

/**
 * One entry per feature or component that can be demonstrated on screen.
 * Ordered foundations-first — the styleguides and app-wide settings that
 * everything else is built out of, then the components that consume them.
 *
 * Each section is its own file under ./sections. They're screen-local (the
 * showcase is the only consumer) but split out for the same reason Modal's
 * internals are: one file per concern beats one file that renders eleven.
 */
const SECTIONS: {
  title: TranslationKey;
  Component: () => React.JSX.Element;
}[] = [
  { title: "showcase.typography", Component: TypographySection },
  { title: "showcase.theme", Component: ThemeSection },
  { title: "showcase.localization", Component: LocalizationSection },
  { title: "showcase.accessibility", Component: AccessibilitySection },
  { title: "showcase.responsive", Component: ResponsiveSection },
  { title: "showcase.grid", Component: GridSection },
  { title: "showcase.spacer", Component: SpacerSection },
  { title: "showcase.icons", Component: IconsSection },
  { title: "showcase.buttons", Component: ButtonsSection },
  { title: "showcase.header", Component: HeaderSection },
  { title: "showcase.tabBar", Component: TabBarSection },
  { title: "showcase.checkboxes", Component: CheckboxesSection },
  { title: "showcase.radioButtons", Component: RadioButtonsSection },
  { title: "showcase.switches", Component: SwitchesSection },
  { title: "showcase.sliders", Component: SlidersSection },
  { title: "showcase.progress", Component: ProgressBarSection },
  { title: "showcase.segmentedControl", Component: SegmentedControlSection },
  { title: "showcase.stateViews", Component: StateViewsSection },
  { title: "showcase.inputs", Component: InputsSection },
  { title: "showcase.images", Component: ImagesSection },
  { title: "showcase.cards", Component: CardSection },
  { title: "showcase.carousel", Component: CarouselSection },
  { title: "showcase.imagePicker", Component: ImagePickerSection },
  { title: "showcase.modals", Component: ModalsSection },
  { title: "showcase.popups", Component: PopupsSection },
  { title: "showcase.toasts", Component: ToastsSection },
  { title: "showcase.permissions", Component: PermissionsSection },
  { title: "showcase.deepLinks", Component: DeepLinksSection },
  { title: "showcase.storage", Component: StorageSection },
  { title: "showcase.logger", Component: LoggerSection },
  { title: "showcase.utilities", Component: UtilitiesSection },
];

export default function Showcase() {
  const { t } = useLocale();
  const { spacing } = useSizes();
  const styles = useStyles();

  return (
    <Screen scrollable style={styles.container}>
      <View style={styles.title}>
        <Icon name="grid" size={spacing.x24} />
        {/* The screen's own title, so it takes the page-title type — which
            is also what makes it the top-level heading. */}
        <Text value={env.appName} type="largeTitle" />
      </View>

      {SECTIONS.map(({ title, Component }) => (
        <Accordion key={title} title={t(title)}>
          <Component />
        </Accordion>
      ))}
    </Screen>
  );
}

const useStyles = createStyles(({ isRTL, spacing, sizes }) => ({
  container: {
    gap: spacing.x16,
    // Sections stretch to this column rather than to the window, so the
    // showcase stays readable on a desktop-width screen while still being
    // wide enough for the grid section to actually reflow.
    width: "100%",
    maxWidth: sizes.contentMaxWidth,
  },
  title: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: spacing.x8,
  },
}));
