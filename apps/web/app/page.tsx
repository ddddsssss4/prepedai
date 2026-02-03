'use client';

import { useAppStore } from './store/appStore';
import IntentScreen from './components/IntentScreen';
import PlanningScreen from './components/PlanningScreen';
import ExecutionScreen from './components/ExecutionScreen';
import { Navbar } from './components/Navbar';

export default function Home() {
  const currentScreen = useAppStore((state) => state.currentScreen);

  return (
    <>
      <Navbar />
      {currentScreen === 'intent' && <IntentScreen />}
      {currentScreen === 'planning' && <PlanningScreen />}
      {currentScreen === 'execution' && <ExecutionScreen />}
    </>
  );
}
