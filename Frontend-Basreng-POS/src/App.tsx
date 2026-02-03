import { Redirect, Route } from 'react-router-dom'
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'
import { images, square, receiptOutline, list, storefront } from 'ionicons/icons'
import Tab2 from './pages/Tab2'
import Tab3 from './pages/Tab3'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css'

/* Theme variables */
import './theme/variables.css'
import StudentAdd from './pages/StudentAdd';
import StudentEdit from './pages/StudentEdit';

import { StudentProvider } from './context/StudentContext'
import LoginForm from './pages/LoginForm';
import KasirPage from "./pages/kasir/KasirPage";
import TransactionHistory from './pages/transaction_history/TransactionHistory';
import Dashboard from './pages/dashboard/Dashboard';
import ProductListPage from './pages/products/ProductListPage';
import CategoryListPage from './pages/categories/CategoryListPage';
import BranchListPage from './pages/branch/BranchListPage';
import UsersListPage from './pages/users/UsersListPage';
import ReportPage from './pages/reports/ReportPage';

setupIonicReact();

const App: React.FC = () => (
  <StudentProvider>
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path={`/login`}>
              <LoginForm />
            </Route>
            {/* <Route exact path={`/student-list`}>
              <StudentList />
            </Route> */}
            <Route exact path={`/student-add`}>
              <StudentAdd />
            </Route>
            <Route exact path={`/student-edit`}>
              <StudentEdit />
            </Route>
            <Route exact path={`/kasir`}>
              <KasirPage />
            </Route>
            <Route exact path={`/transaction-history`}>
              <TransactionHistory />
            </Route>
            <Route exact path={`/dashboard`}>
              <Dashboard />
            </Route>
            <Route exact path={`/`}>
              <Dashboard />
            </Route>
            <Route exact path={`/product-list`}>
              <ProductListPage />
            </Route>
            <Route exact path={`/categories`}>
              <CategoryListPage />
            </Route>
            <Route exact path={`/branch`}>
              <BranchListPage />
            </Route>
            <Route exact path={`/users`}>
              <UsersListPage />
            </Route>
            <Route exact path={`/report`}>
              <ReportPage />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="dashboard" href={`/dashboard`}>
              <IonIcon aria-hidden="true" icon={storefront} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>
            <IonTabButton tab="kasir" href={`/kasir`}>
              <IonIcon aria-hidden="true" icon={receiptOutline} />
              <IonLabel>Kasir</IonLabel>
            </IonTabButton>
            <IonTabButton tab="transaction-history" href={`/transaction-history`}>
              <IonIcon aria-hidden="true" icon={list} />
              <IonLabel>Riwayat Transaksi</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  </StudentProvider>
);

export default App;
