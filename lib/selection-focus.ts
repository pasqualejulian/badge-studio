import * as T from 'three';
import type {BadgePick} from './interaction';
/** Temporary materials are only attached during the interactive render. */
export class SelectionFocus {
 private ghosts=new Map<T.Material,T.Material>();
 render(objects:T.Object3D[],selected:BadgePick|null,amount:number,isolate:boolean,render:()=>void){
  const restored:{mesh:T.Mesh;material:T.Material|T.Material[];visible:boolean}[]=[];
  const used=new Set<T.Material>();
  const ghost=(source:T.Material)=>{
   used.add(source);
   let copy=this.ghosts.get(source);
   if(!copy){copy=source.clone();this.ghosts.set(source,copy);}
   copy.copy(source);copy.transparent=true;copy.opacity=source.opacity*(1-.9*amount);copy.depthWrite=false;
   if(copy instanceof T.MeshStandardMaterial){copy.color.multiplyScalar(1-.35*amount);copy.envMapIntensity*=1-.7*amount;copy.roughness=Math.max(copy.roughness,.55);}
   return copy;
  };
  try{
   if(selected)for(const object of objects){
    if(!(object instanceof T.Mesh)||object.userData.pick?.id===selected.id)continue;
    restored.push({mesh:object,material:object.material,visible:object.visible});
    if(isolate)object.visible=false;
    else object.material=Array.isArray(object.material)?object.material.map(ghost):ghost(object.material);
   }
   render();
  }finally{
   for(const {mesh,material,visible} of restored){mesh.material=material;mesh.visible=visible;}
   for(const [source,copy] of this.ghosts)if(!used.has(source)){copy.dispose();this.ghosts.delete(source);}
  }
 }
 dispose(){for(const copy of this.ghosts.values())copy.dispose();this.ghosts.clear();}
}
