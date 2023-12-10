import {I18n} from 'i18n-js';
import {useEffect} from 'react';
import {env} from '~/src/constants';
import {LocaleConfig} from 'react-native-calendars';
import store, {useStoreSelector} from '~/src/features/store';
import slice from './slice';

export type TranslationKey =
  | string
  | [string, {[key: string]: string | number}];

const locales = {
  en: require('~/assets/locales/en-US.json'),
  uk: require('~/assets/locales/uk-UA.json'),
};

LocaleConfig.locales.en = LocaleConfig.locales[''];
LocaleConfig.locales.en.dayNamesShort = [
  'Su',
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'St',
];

LocaleConfig.locales.uk = {
  monthNames: [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень',
  ],
  monthNamesShort: [
    'Січ.',
    'Лют.',
    'Бер.',
    'Кві.',
    'Тра.',
    'Чер.',
    'Лип.',
    'Сер.',
    'Вер.',
    'Жов.',
    'Лис.',
    'Гру.',
  ],
  dayNames: [
    'Неділя',
    'Понеділок',
    'Вівторок',
    'Середа',
    'Четверг',
    "П'ятниця",
    'Субота',
  ],
  dayNamesShort: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
};

const i18n = new I18n(locales);
i18n.defaultLocale = env.defaultLanguage;
i18n.locale = i18n.defaultLocale;
i18n.translations = locales;

export const availableLocales = Object.keys(locales);

export const translate = (key: TranslationKey) => {
  if (!key?.length) {
    return '';
  }

  const array = Array.isArray(key);
  const translationKey = array ? key[0] : key;
  const translationParams = array ? key[1] : {};
  return i18n.t(translationKey, translationParams);
};

export const setCurrentLanguage = async (language: string) => {
  const validLocale = availableLocales.includes(language);
  if (!validLocale) {
    throw new Error(`Invalid locale: ${language}`);
  }
  i18n.locale = language;
  LocaleConfig.defaultLocale = language;
  return store.dispatch(slice.actions.setCurrentLanguage(language));
};

export const useCurrentLanguage = () =>
  useStoreSelector(state => state.system.currentLanguage);

export const getCurrentLanguage = () => store.getState().system.currentLanguage;

export const useLastUsedLanguage = () =>
  useStoreSelector(state => state.system.lastUsedLanguage);

export const useIsRTL = () => {
  const currentLanguage = useCurrentLanguage();
  return isRTL(currentLanguage);
};

export const useLocalisation = () => {
  const currentLanguage = useCurrentLanguage();
  const lastUsedLanguage = useLastUsedLanguage();
  useEffect(() => {
    const language = currentLanguage || lastUsedLanguage || i18n.locale;
    setCurrentLanguage(language).catch();
  }, []);
};

export const isRTL = (locale: string) =>
  [
    'ar',
    'arc',
    'dv',
    'fa',
    'ha',
    'he',
    'khw',
    'ks',
    'ku',
    'ps',
    'ur',
    'yi',
  ].includes(locale);
