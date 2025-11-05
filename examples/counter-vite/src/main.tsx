import { 
  createApp, 
  createRouter,
  provide,
  ErrorBoundary,
  type FC, 
} from 'drift-spa';

import { ThemeService } from './services/theme.service';
import { LoggerService } from './services/logger.service';
import { CounterService } from './services/counter.service';
import { ApiService } from './services/api.service';

import { Home } from './pages/Home';
import { Async } from './pages/Async';
import { AdvancedEffect } from './pages/AdvancedEffect';
import { Test } from './pages/Test';
import { Context } from './pages/Context';
import { NestedContext } from './pages/NestedContext';
import { DI } from './pages/DI';
import { Services } from './pages/Services';
import { ApiServicePage } from './pages/ApiService';
import { ErrorBoundaryExample } from './pages/ErrorBoundaryExample';
import { CustomFallback } from './pages/CustomFallback';
import { NestedErrors } from './pages/NestedErrors';
import { PortalModal } from './pages/PortalModal';
import { PortalTooltip } from './pages/PortalTooltip';
import { PortalNotifications } from './pages/PortalNotifications';
import { PortalFunction } from './pages/PortalFunction';

provide(LoggerService);
provide(ThemeService);
provide(ApiService);
provide(CounterService, { deps: [LoggerService] });

const { RouterView, push } = createRouter({
  mode: 'history',
  routes: {
    '/': Home,
    '/async': Async,
    '/advanced-effect': AdvancedEffect,
    '/context': Context,
    '/nested-context': NestedContext,
    '/di': DI,
    '/services': Services,
    '/api-service': ApiServicePage,
    '/error-boundary': ErrorBoundaryExample,
    '/custom-fallback': CustomFallback,
    '/nested-errors': NestedErrors,
    '/portal-modal': PortalModal,
    '/portal-tooltip': PortalTooltip,
    '/portal-notifications': PortalNotifications,
    '/portal-function': PortalFunction,
    '/test': Test,
    '*': () => <div>404</div>
  }
});

const App: FC = () => (
  <div>
    <nav style={{ padding: '1rem', background: '#f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      <a href="/" onClick={(e) => { e.preventDefault(); push('/'); }}>Home</a>
      <a href="/async" onClick={(e) => { e.preventDefault(); push('/async'); }}>Async</a>
      <a href="/advanced-effect" onClick={(e) => { e.preventDefault(); push('/advanced-effect'); }}>Effects</a>
      <a href="/context" onClick={(e) => { e.preventDefault(); push('/context'); }}>Context</a>
      <a href="/nested-context" onClick={(e) => { e.preventDefault(); push('/nested-context'); }}>Nested</a>
      <a href="/di" onClick={(e) => { e.preventDefault(); push('/di'); }}>DI Old</a>
      <a href="/services" onClick={(e) => { e.preventDefault(); push('/services'); }}>Services</a>
      <a href="/api-service" onClick={(e) => { e.preventDefault(); push('/api-service'); }}>API</a>
      <a href="/error-boundary" onClick={(e) => { e.preventDefault(); push('/error-boundary'); }}>Errors</a>
      <a href="/custom-fallback" onClick={(e) => { e.preventDefault(); push('/custom-fallback'); }}>Custom</a>
      <a href="/nested-errors" onClick={(e) => { e.preventDefault(); push('/nested-errors'); }}>Nested</a>
      <a href="/portal-modal" onClick={(e) => { e.preventDefault(); push('/portal-modal'); }}>Modal</a>
      <a href="/portal-tooltip" onClick={(e) => { e.preventDefault(); push('/portal-tooltip'); }}>Tooltip</a>
      <a href="/portal-notifications" onClick={(e) => { e.preventDefault(); push('/portal-notifications'); }}>Notify</a>
      <a href="/portal-function" onClick={(e) => { e.preventDefault(); push('/portal-function'); }}>Portal Fn</a>
      <a href="/test" onClick={(e) => { e.preventDefault(); push('/test'); }}>Test</a>
    </nav>
    <ErrorBoundary>
    <RouterView />
    </ErrorBoundary>
  </div>
);

createApp(App).mount('#app');
