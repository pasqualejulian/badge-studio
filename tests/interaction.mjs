import assert from 'node:assert/strict';
import * as T from 'three';
import {pickBadge,isSelectionGesture,surfaceUV} from '../lib/interaction.ts';
const camera=new T.PerspectiveCamera(45,1,.1,100);camera.position.z=5;camera.lookAt(0,0,0);camera.updateProjectionMatrix();
const back=new T.Mesh(new T.PlaneGeometry(3,3),new T.MeshBasicMaterial());back.userData.pick={kind:'face',id:'face',label:'Esmalte'};
const front=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial());front.position.z=.3;front.userData.pick={kind:'layer',id:'star',label:'Estrellas'};
const rect={left:100,top:50,width:400,height:400};
assert.equal(pickBadge(camera,[back,front],rect,300,250)?.id,'star');
assert.equal(pickBadge(camera,[back,front],rect,400,250)?.id,'face');
assert.equal(pickBadge(camera,[back,front],rect,499,51),null);
assert(isSelectionGesture({x:1,y:1},{x:3,y:3}));assert(!isSelectionGesture({x:1,y:1},{x:10,y:10}));
const g=surfaceUV(new T.BoxGeometry(2,2,.2)),uv=g.getAttribute('uv'),p=g.getAttribute('position');
for(let i=0;i<p.count;i+=3){const area=Math.abs((uv.getX(i+1)-uv.getX(i))*(uv.getY(i+2)-uv.getY(i))-(uv.getY(i+1)-uv.getY(i))*(uv.getX(i+2)-uv.getX(i)));assert(area>0,'Side texture UVs must not collapse into lines');}
const plane=surfaceUV(new T.PlaneGeometry(2,2),true);assert.equal(plane.getAttribute('uv').getX(0),.25);
console.log('Nearest visible piece, blank click, click-vs-drag threshold and noncollapsed lateral UVs passed.');
