import type { CSSVariablesResolver, MantineThemeOverride } from '@mantine/core';
import { Extension, type ExtensionContext } from 'shared';
import './app.css';
import { AmbientPetalBackground } from './components/AmbientPetalBackground';
import { blushCssVariablesResolver, blushThemeConfig } from './theme/mantineTheme';

/**
 * Official Calagopus Frontend Extension Entrypoint (`io.calagopus.blush`).
 */
export class CalagopusBlushExtension extends Extension {
  public override initialize(ctx: ExtensionContext): void {
    // Support both Light and Dark Petalnodes schemes inside Calagopus
    // without breaking older 1.1.0 - 1.2.10 panels or disabling user switching.
    ctx.extensionRegistry?.enterGlobal?.((global) => {
      global.prependComponent?.(AmbientPetalBackground);
    });
  }

  public override initializeMantineTheme(_ctx: ExtensionContext): MantineThemeOverride {
    return blushThemeConfig;
  }

  public override initializeMantineCssResolver(
    _ctx: ExtensionContext,
  ): CSSVariablesResolver | null {
    return blushCssVariablesResolver;
  }
}

export * from './theme/tokens';
export * from './theme/mantineTheme';
export * from './components';
export * from './layout';
export * from './navigation/calagopusRoutes';
export * from './navigation/petalnodesBrand';
export * from './api/calagopusDashboard';
export * from './api/calagopusCore';
export * from './api/calagopusModules';
export * from './pages/ClientDashboardPage';
export * from './pages/AdminDashboardPage';
export * from './pages/AdminExtensionsPage';
export * from './pages/ServerOverviewPage';
export * from './pages/ServerConsolePage';
export * from './pages/ServerFilesPage';
export * from './pages/ServerDatabasesPage';
export * from './pages/ServerBackupsPage';
export * from './pages/ServerSchedulesPage';
export * from './pages/ServerNetworkPage';
export * from './pages/ServerStartupPage';
export * from './pages/ServerUsersPage';
export * from './pages/ServerSettingsPage';
export * from './pages/AccountProfilePage';
export * from './pages/AccountSecurityPage';
export * from './pages/AccountSshKeysPage';
export * from './pages/AccountApiKeysPage';
export * from './pages/ActivityLogPage';
export * from './pages/AdminResourcesPage';
export * from './pages/AdminNestsEggsPage';
export * from './pages/AdminAnalyticsPage';
export * from './pages/NotificationsPage';
export * from './utils/themeHelpers';
export * from './utils/themeMode';
export * from './utils/serverArtwork';
export * from './utils/serverArtworkAssets';
export * from './utils/panelEnhancements';
export * from './utils/eggCatalog';
export * from './utils/eggArtworkAssets';
export * from './utils/pwa';

export default new CalagopusBlushExtension();
