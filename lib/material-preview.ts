import * as T from 'three';
import {studioEnvironment,disposeEnvironmentScene} from './studio-lighting';
// Build-time gallery artwork. One renderer, released after all six samples.
export async function renderMaterialPreviews(ids:string[]){
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(320,264);renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;
 const scene=new T.Scene();scene.background=new T.Color('#292925');const studio=studioEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.035);scene.environment=env.texture;
 const shape=new T.Shape(),r=.22,w=.85,h=.8;shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);
 const geometry=new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSize:.065,bevelThickness:.055,bevelSegments:5,steps:1,curveSegments:24});
 const uv=geometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+w)/(2*w),(uv.getY(i)+h)/(2*h));
 const material=new T.MeshStandardMaterial({metalness:.85,roughness:.5});const mesh=new T.Mesh(geometry,material);mesh.rotation.z=-.12;scene.add(mesh);
 const camera=new T.PerspectiveCamera(32,320/264,.1,30);camera.position.set(1.8,1.2,4.8);camera.lookAt(0,0,0);
 const loader=new T.TextureLoader(),result:Record<string,string>={};
 try{for(const id of ids){const maps:T.Texture[]=[];try{for(const name of ['color','normal','roughness']){const map=await loader.loadAsync(`/materials/${id}/${name}.jpg`);map.colorSpace=name==='color'?T.SRGBColorSpace:T.NoColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;maps.push(map);}
 material.map=maps[0];material.normalMap=maps[1];material.roughnessMap=maps[2];material.normalScale.setScalar(.35);material.metalness=id.includes('plaster')?.12:.85;material.needsUpdate=true;renderer.render(scene,camera);result[id]=renderer.domElement.toDataURL('image/png');
 }finally{maps.forEach(t=>t.dispose());}}
 return result;
 }finally{geometry.dispose();material.dispose();env.dispose();disposeEnvironmentScene(studio);pmrem.dispose();renderer.dispose();renderer.forceContextLoss();}
}
