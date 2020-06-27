import React, { Suspense, useContext } from 'react';
import {
  Route, Switch, Redirect,
} from 'react-router-dom';
import routes from './constants/routes';
import MainPage from './pages/home/MainPage';
import TeamPage from './pages/team/TeamPage';
// import PuzzlePage from './pages/puzzle/PuzzlePage';
import WordBuilder from './pages/wordbuilder/WordBuilder';
import Loader from './components/loader/Loader';
import SpeakIt from './pages/speakit/SpeakIt';
import StoreContext from './app/store';
import MiniGamesPage from './pages/minigames/MiniGamesPage';

const App = () => {
  const store = useContext(StoreContext);

  return (
    <Suspense fallback={<Loader />}>
      <StoreContext.Provider value={store}>
        <Switch>
          <Route path={routes.LANDING} exact>
            <MainPage />
          </Route>
          <Route path={routes.TEAM} exact>
            <TeamPage />
          </Route>
          {/* <Route path={routes.PUZZLE} exact>
            <PuzzlePage game="puzzle" />
          </Route> */}
          <Route path={routes.SPEAKIT} exact>
            <SpeakIt />
          </Route>
          <Route path={routes.WORD_BUILDER} exact>
            <WordBuilder />
          </Route>
          <Route path={routes.MINI_GAMES} exact>
            <MiniGamesPage />
          </Route>
          <Route>
            <Redirect to={routes.LANDING} />
          </Route>
        </Switch>
      </StoreContext.Provider>
    </Suspense>
  );
};

export default App;
