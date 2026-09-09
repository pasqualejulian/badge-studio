import * as T from 'three';
export function safeFrameDistance(bounds:T.Box3,aspect:number,fov:number,target=new T.Vector3()):number{
  let radius=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])radius=Math.max(radius,new T.Vector3(x,y,z).distanceTo(target));
  const vertical=T.MathUtils.degToRad(fov)/2,horizontal=Math.atan(Math.tan(vertical)*Math.max(aspect,.1));
  return radius/Math.sin(Math.min(vertical,horizontal))*1.08;
}

// Automatic framing is independent from the user's manual orbit/zoom limits.
export function badgeFrame(bounds:T.Box3,picked:T.Box3|null,aspect:number,fov:number){
  const target=(picked??bounds).getCenter(new T.Vector3());
  const overview=safeFrameDistance(bounds,aspect,fov,bounds.getCenter(new T.Vector3()));
  const distance=picked
    ? Math.max(.8,Math.min(overview*.78,safeFrameDistance(picked,aspect,fov,target)))
    : overview*1.08;
  return {target,distance};
}
