import React from 'react'
import { useStore } from './store.jsx'
import Rail from './components/Rail.jsx'
import TopBar from './components/TopBar.jsx'
import NotifPanel from './components/NotifPanel.jsx'
import Toast from './components/Toast.jsx'
import BuyModal from './components/BuyModal.jsx'
import RulesModal from './components/RulesModal.jsx'

import TournamentView from './views/TournamentView.jsx'
import LeaderboardView from './views/LeaderboardView.jsx'
import TerminalView from './views/TerminalView.jsx'
import PerformanceView from './views/PerformanceView.jsx'
import FeedView from './views/FeedView.jsx'
import InvitesView from './views/InvitesView.jsx'
import AffiliateView from './views/AffiliateView.jsx'
import Placeholder from './views/Placeholder.jsx'

const VIEWS = {
  tournament: TournamentView,
  leaderboard: LeaderboardView,
  terminal: TerminalView,
  performance: PerformanceView,
  feed: FeedView,
  invites: InvitesView,
  affiliate: AffiliateView
}

export default function App() {
  const { S } = useStore()
  const View = VIEWS[S.view] || Placeholder
  return (
    <>
      <div className="app">
        <Rail />
        <div className="main">
          <TopBar />
          <div className="view" id="view"><View /></div>
        </div>
      </div>
      <NotifPanel />
      <Toast />
      <BuyModal />
      <RulesModal />
    </>
  )
}
