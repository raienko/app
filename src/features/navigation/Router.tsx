import * as React from 'react';
import {
  DocumentTitleOptions,
  NavigationContainer,
} from '@react-navigation/native';
import {env} from '~/src/constants';
import {System} from '~/src/screens';
import ref from './ref';
import Main from './Main';

const webPageTitle: DocumentTitleOptions = {
  formatter: (options: any) => `${options?.title ?? env.appName}`,
};

export default function Router() {
  const Navigator = Main;

  return (
    <>
      <NavigationContainer ref={ref} documentTitle={webPageTitle}>
        <Navigator />
      </NavigationContainer>
      <System />
    </>
  );
}
