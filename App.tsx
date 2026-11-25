import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from './src/context/AuthContext';
import AppNavigation from './src/navigation/AppNavigation';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
