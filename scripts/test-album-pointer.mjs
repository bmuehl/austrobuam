import assert from 'node:assert/strict';
import { albumPointerTilt } from '../src/lib/album-pointer.ts';

const rect = { left: 100, top: 100, width: 400, height: 400 };
assert.deepEqual(albumPointerTilt(300, 300, rect), { x: 0, y: 0 });
const near = albumPointerTilt(520, 300, rect);
const far = albumPointerTilt(1000, 300, rect);
assert.ok(near.x > far.x && far.x > 0);
assert.ok(albumPointerTilt(80, 300, rect).x < 0);
assert.ok(albumPointerTilt(300, 80, rect).y < 0);
assert.ok(albumPointerTilt(300, 520, rect).y > 0);
assert.ok(Math.abs(albumPointerTilt(501, 300, rect).x - albumPointerTilt(499, 300, rect).x) < 0.01);
assert.ok(Number.isFinite(albumPointerTilt(10, 10, { left: 0, top: 0, width: 0, height: 0 }).x));
console.log('Album pointer tests passed.');
