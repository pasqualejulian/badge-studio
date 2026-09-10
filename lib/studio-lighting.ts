import * as T from 'three';
// Reflected softboxes define polished metal. Kept outside the exported badge.
export function studioEnvironment(){
 const scene=new T.Scene();
 const wall=new T.Mesh(new T.BoxGeometry(24,24,24),new T.MeshBasicMaterial({color:'#79766f',side:T.BackSide}));scene.add(wall);
 const box=(width:number,height:number,position:[number,number,number],color:string,intensity:number)=>{
  const panel=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide}));panel.position.set(...position);panel.lookAt(0,0,0);scene.add(panel);
 };
 box(5,4,[-1,-2,6],'#fff8ec',3);
 box(4,6,[-4,4,5],'#fff2dc',7);
 box(1.4,7,[5,1,2],'#edf3ff',6);
 box(5,2,[0,6,-2],'#fffaf0',5);
 box(3,5,[-3,0,-5],'#f3f4ff',3);
 return scene;
}
export function disposeEnvironmentScene(scene:T.Scene){scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
