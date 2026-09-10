import assert from 'node:assert/strict';
import * as T from 'three';
import {withSelectionFocus} from '../lib/selection-focus.ts';
const make=(id,kind)=>{const mesh=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({color:'#cc9933',roughness:.2,metalness:1}));mesh.userData.pick={id,kind};return mesh;};
const selected=make('one','layer'),other=make('two','layer'),body=make('body','body');
const objects=[selected,other,body],before=objects.map(o=>o.material.toJSON());
withSelectionFocus(objects,selected.userData.pick,1,true,()=>{
 assert.equal(selected.visible,true);assert.equal(other.visible,false);assert.equal(body.visible,true);
 assert.equal(body.material.opacity,1);assert.equal(body.material.transparent,false);
 assert.equal(selected.material.roughness,.2);assert(other.material.roughness>.2);
});
assert.deepEqual(objects.map(o=>o.material.toJSON()),before);assert(objects.every(o=>o.visible));
assert.throws(()=>withSelectionFocus(objects,selected.userData.pick,1,true,()=>{throw Error('render failed');}));
assert.deepEqual(objects.map(o=>o.material.toJSON()),before);assert(objects.every(o=>o.visible));
withSelectionFocus(objects,null,1,true,()=>{assert.deepEqual(objects.map(o=>o.material.toJSON()),before);assert(objects.every(o=>o.visible));});
console.log('Selection focus restores materials and visibility, including failed renders; base stays opaque.');
