import assert from 'node:assert/strict';
import {motionAngle,recordingFormat} from '../lib/animation.ts';
for(const preset of ['turntable','sway']){
 assert(Math.abs(Math.sin(motionAngle(preset,0))-Math.sin(motionAngle(preset,1)))<1e-12);
 assert(Number.isFinite(motionAngle(preset,.33)));
}
assert.equal(motionAngle('turntable',.5),Math.PI);
assert(Math.abs(motionAngle('sway',.25)-Math.PI/6)<1e-12);
assert.equal(recordingFormat(),null);
globalThis.MediaRecorder={isTypeSupported:t=>t==='video/mp4'};
assert.equal(recordingFormat(),'video/mp4');
globalThis.MediaRecorder={isTypeSupported:()=>false};assert.equal(recordingFormat(),null);
console.log('Motion loop endpoints, deterministic poses and codec fallback passed.');
