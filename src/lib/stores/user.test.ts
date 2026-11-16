import { beforeEach, describe, expect, it, vi } from 'vitest';

const env = vi.hoisted(() => ({ dev: false, FORCE_ROLE: '' }));

vi.mock('$app/env', async (importOriginal) => ({
	...(await importOriginal<typeof import('$app/env')>()),
	get dev() {
		return env.dev;
	}
}));

vi.mock('$app/env/public', async (importOriginal) => ({
	...(await importOriginal<typeof import('$app/env/public')>()),
	get FORCE_ROLE() {
		return env.FORCE_ROLE;
	}
}));

import { toPermissions } from './user';

const user = (admin: 0 | 1, moderator: 0 | 1) => ({
	userid: 'tester',
	name: 'Tester',
	admin,
	moderator
});

describe('toPermissions', () => {
	beforeEach(() => {
		env.dev = false;
		env.FORCE_ROLE = '';
	});

	it('maps the roles returned by the API', () => {
		expect(toPermissions(user(1, 0))).toEqual({ isAdmin: true, isModerator: false });
		expect(toPermissions(user(0, 1))).toEqual({ isAdmin: false, isModerator: true });
		expect(toPermissions()).toEqual({ isAdmin: false, isModerator: false });
	});

	it('grants only the moderator role with FORCE_ROLE=moderator in development', () => {
		env.dev = true;
		env.FORCE_ROLE = 'moderator';
		expect(toPermissions()).toEqual({ isAdmin: false, isModerator: true });
	});

	it('ignores FORCE_ROLE outside development', () => {
		env.FORCE_ROLE = 'moderator';
		expect(toPermissions()).toEqual({ isAdmin: false, isModerator: false });
	});

	it('ignores FORCE_ROLE values other than moderator', () => {
		env.dev = true;
		env.FORCE_ROLE = 'admin';
		expect(toPermissions()).toEqual({ isAdmin: false, isModerator: false });
	});
});
