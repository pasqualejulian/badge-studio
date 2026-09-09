import * as T from 'three';
export interface BadgePick {kind:'body'|'frame'|'face'|'layer';id:string;label:string;clientX:number;clientY:number}
export function pickBadge(camera:T.Camera,objects:T.Object3D[],rect:{left:number;top:number;width:number;height:number},x:number,y:number):BadgePick|null{
  if(rect.width<=0||rect.height<=0)return null;
  camera.updateMatrixWorld();for(const o of objects)o.updateWorldMatrix(true,true);
  const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1),camera);
  const hit=ray.intersectObjects(objects,false).find(h=>h.object.userData.pick);
  return hit?{...hit.object.userData.pick,clientX:x,clientY:y}:null;
}
export function isSelectionGesture(start:{x:number;y:number},end:{x:number;y:number}){return Math.hypot(end.x-start.x,end.y-start.y)<=5;}
// Choose the dominant projection per triangle. Side walls need Z in their UVs.
export function surfaceUV(source:T.BufferGeometry,frontOnly=false):T.BufferGeometry{
  const g=source.index?source.toNonIndexed():source;if(g!==source)source.dispose();
  const p=g.getAttribute('position'),uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2);const n=b.sub(a).cross(c.sub(a));const x=Math.abs(n.x),y=Math.abs(n.y),z=Math.abs(n.z);const axis=frontOnly||z>=Math.max(x,y)?'z':x>=y?'x':'y';
    for(let j=0;j<3;j++){const k=i+j;uv[k*2]=((axis==='x'?p.getY(k):p.getX(k))+2)/4;uv[k*2+1]=((axis==='z'?p.getY(k):p.getZ(k))+2)/4;}}
  g.setAttribute('uv',new T.BufferAttribute(uv,2));return g;
}
