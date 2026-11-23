import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_NAV_GROUPS,
  buildBreadcrumbsForPath,
  filterNavGroupsByPermissions,
  hasPermission,
  inferScopeFromPath,
  isRouteActive,
  SERVER_NAV_GROUPS,
} from './calagopusRoutes';

test('hasPermission enforces admin bypass, exact match, and wildcard namespace', () => {
  assert.equal(
    hasPermission({ isAdmin: true, permissions: [] }, 'admin.nodes.read'),
    true,
  );
  assert.equal(
    hasPermission({ isAdmin: false, permissions: ['backup.read'] }, 'backup.read'),
    true,
  );
  assert.equal(
    hasPermission({ isAdmin: false, permissions: ['file.*'] }, 'file.read'),
    true,
  );
  assert.equal(
    hasPermission({ isAdmin: false, permissions: ['backup.read'] }, 'database.read'),
    false,
  );
});

test('filterNavGroupsByPermissions strips unauthorized admin and server routes', () => {
  const standardUser = { isAdmin: false, permissions: [] };
  assert.equal(filterNavGroupsByPermissions(ADMIN_NAV_GROUPS, standardUser).length, 0);

  const limitedSubuser = {
    isAdmin: false,
    permissions: ['control.console', 'file.read'],
  };
  const visibleServer = filterNavGroupsByPermissions(SERVER_NAV_GROUPS, limitedSubuser);
  assert.equal(visibleServer.length, 1);
  assert.deepEqual(
    visibleServer[0].items.map((item) => item.id),
    ['server-overview', 'server-console', 'server-files'],
  );
});

test('isRouteActive handles exact root routes and nested sub-routes', () => {
  assert.equal(isRouteActive('/', '/', true), true);
  assert.equal(isRouteActive('/account', '/', true), false);
  assert.equal(isRouteActive('/admin/nodes/node-1', '/admin/nodes', false), true);
  assert.equal(isRouteActive('/admin/nodes', '/admin', true), false);
});

test('inferScopeFromPath and buildBreadcrumbsForPath resolve Calagopus scopes', () => {
  assert.equal(inferScopeFromPath('/auth/login'), 'auth');
  assert.equal(inferScopeFromPath('/admin/users'), 'admin');
  assert.equal(inferScopeFromPath('/server/alpha-01/files'), 'server');
  assert.equal(inferScopeFromPath('/account/api-keys'), 'client');

  assert.deepEqual(buildBreadcrumbsForPath('/admin/nodes'), [
    { label: 'Workspace', path: '/' },
    { label: 'Admin', path: '/admin' },
    { label: 'Nodes' },
  ]);

  assert.deepEqual(buildBreadcrumbsForPath('/server/alpha-01/backups', 'Survival SMP'), [
    { label: 'Servers', path: '/' },
    { label: 'Survival SMP', path: '/server/alpha-01' },
    { label: 'Backups' },
  ]);
});
