import assert from 'node:assert/strict';
import * as T from 'three';
import {engravingGeometry} from '../lib/engraving.ts';
import {validateEngraving,defaultEngraving} from '../lib/engraving-settings.ts';
assert.deepEqual(validateEngraving(undefined),defaultEngraving);
assert.throws(()=>validateEngraving({...defaultEngraving,text:'a\nb\nc\nd'}));
for(const points of [[[-1,-1],[1,-1],[1,1],[-1,1]],[[0,-1],[1,1],[-1,1]]])for(const curvature of [-.4,0,.4]){
 const g=engravingGeometry(points.map(p=>new T.Vector2(...p)),curvature),p=g.getAttribute('position'),uv=g.getAttribute('uv');
 assert([...p.array].every(Number.isFinite));assert(g.getAttribute('normal').getZ(0)<0);assert([...uv.array].every(x=>x>=0&&x<=1));
 for(let i=0;i<p.count;i++){assert(Math.abs(p.getZ(i)-(-.0145+curvature*(1-p.getX(i)**2/3.0625-p.getY(i)**2/4)))<1e-6);assert(Math.abs(uv.getX(i)-(1-p.getX(i))/2)<1e-6);}
 g.dispose();
}
console.log('Reverse UV orientation, multiple bases, curved rear surface and legacy inscription defaults passed.');
