import assert from 'node:assert/strict';
import {DOMParser} from 'linkedom';
import * as T from 'three';
import {parseBaseSVG} from '../lib/base-shape.ts';
import {safeFrameDistance} from '../lib/framing.ts';
globalThis.DOMParser=DOMParser;
for(const shape of ['<rect x="0" y="0" width="100" height="50"/>','<circle cx="30" cy="30" r="20"/>','<path d="M0 0 L100 0 L50 80 Z"/>']){
 const points=parseBaseSVG('<svg xmlns="http://www.w3.org/2000/svg">'+shape+'</svg>');assert(points.length>=3);const bounds=new T.Box2().setFromPoints(points);assert(Math.abs(Math.max(bounds.getSize(new T.Vector2()).x,bounds.getSize(new T.Vector2()).y)-4)<1e-5);
}
assert.throws(()=>parseBaseSVG('<svg><path d="M0 0 L10 10"/></svg>'),/cerrado/);
const bounds=new T.Box3(new T.Vector3(-2,-2,-.3),new T.Vector3(2,2,.3));assert(safeFrameDistance(bounds,.5,33)>safeFrameDistance(bounds,1.5,33));
console.log('Custom rectangular/circular/triangular bases, open contour rejection and responsive safe framing passed.');
