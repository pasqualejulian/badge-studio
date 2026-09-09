import assert from 'node:assert/strict';
import * as T from 'three';
import {surfacePixels,SurfaceLibrary} from '../lib/surfaces.ts';
for(const kind of ['smooth','grain','brushed','hammered','worn']){
  const data=surfacePixels(kind,64);assert.equal(data.normal.length,64*64*4);
  assert.deepEqual(data.normal,surfacePixels(kind,64).normal);
  const values=new Set();for(let i=0;i<data.normal.length;i+=4){values.add(data.normal[i]);assert.equal(data.normal[i+3],255);const n=[0,1,2].map(k=>data.normal[i+k]/255*2-1);assert(Math.abs(Math.hypot(...n)-1)<.015);}
  assert(kind==='smooth'?values.size===1:values.size>5);
}
const lib=new SurfaceLibrary(pixels=>new T.DataTexture(pixels,256,256)),mat=new T.MeshStandardMaterial();lib.apply(mat,'grain',.6);assert(mat.normalMap);assert(mat.roughnessMap);assert.equal(mat.normalScale.x,.6);lib.apply(mat,'smooth',1);assert.equal(mat.normalMap,null);assert.equal(mat.roughnessMap,null);lib.dispose();mat.dispose();
console.log('Five deterministic surface maps, normalized normals and material switching passed.');
