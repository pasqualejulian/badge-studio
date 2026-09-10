import * as T from 'three';
import type {BadgePick} from './interaction';
/** Apply an editor-only view for one synchronous render, restoring even on failure. */
export function withSelectionFocus(objects:T.Object3D[],selected:BadgePick|null,amount:number,isolate:boolean,render:()=>void){
 const colors=new Map<T.MeshStandardMaterial,{color:T.Color;roughness:number;env:number}>();
 const hidden:T.Object3D[]=[];
 try{
  if(selected)for(const object of objects){
   const pick=object.userData.pick;
   if(!pick||pick.id===selected.id)continue;
   if(isolate&&selected.kind==='layer'&&pick.kind==='layer'&&object.visible){object.visible=false;hidden.push(object);}
   const mesh=object as T.Mesh;
   for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
    if(!(material instanceof T.MeshStandardMaterial)||colors.has(material))continue;
    colors.set(material,{color:material.color.clone(),roughness:material.roughness,env:material.envMapIntensity});
    material.color.multiplyScalar(1-.45*amount);
    material.envMapIntensity*=1-.55*amount;
    material.roughness=T.MathUtils.lerp(material.roughness,Math.max(.55,material.roughness),amount);
   }
  }
  render();
 }finally{
  for(const [material,original] of colors){material.color.copy(original.color);material.roughness=original.roughness;material.envMapIntensity=original.env;}
  for(const object of hidden)object.visible=true;
 }
}
