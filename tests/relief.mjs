import { DOMParser } from 'linkedom';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as T from 'three';
import { parseRelief, bendGeometry } from '../lib/relief.ts';
globalThis.DOMParser=DOMParser;
const {parts,layers}=parseRelief(readFileSync(new URL('../public/illustrations.svg',import.meta.url),'utf8'));
assert.equal(parts.length,26);assert.equal(layers.length,5);
assert(layers.some(l=>l.name==='Contornos'));assert(layers.some(l=>l.name==='Cornetas'));
for(const p of parts){const bent=bendGeometry(p.geometry.clone(),.3);assert(Array.from(bent.getAttribute('position').array).every(Number.isFinite));bent.dispose();}
for(const curvature of [-.4,.4]){
  const g=bendGeometry(new T.PlaneGeometry(2,2),curvature);g.computeBoundingBox();
  if(curvature>0)assert(g.boundingBox.max.z>.39);else assert(g.boundingBox.min.z<-.39);
  assert(g.getAttribute('position').count>6);g.dispose();
}
assert.throws(()=>parseRelief('<svg xmlns="http://www.w3.org/2000/svg"><text>no</text></svg>'),/compatibles/);
assert.throws(()=>parseRelief('<svg xmlns="http://www.w3.org/2000/svg"/>'),/visibles/);
console.log('SVG: 26 pieces, 5 groups, finite geometry, positive/negative curvature, unsupported input rejection passed.');
