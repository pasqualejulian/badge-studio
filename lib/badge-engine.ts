import {SelectionFocus} from './selection-focus';
import {Engraving,engravingGeometry} from './engraving';
import {defaultEngraving,type EngravingSettings} from './engraving-settings';
import type {SceneSnapshot} from './projects';
import {MaterialMaps,type MapKind,type MapSettings} from './material-maps';
import {MotionController,recordVideo} from './motion-controller';
import type {MotionOptions} from './animation';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import {studioEnvironment,disposeEnvironmentScene} from './studio-lighting';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { parseRelief, bendGeometry, type ReliefLayer, type ReliefPart } from './relief';
import { SurfaceLibrary, type Surface } from './surfaces';
import {parseBaseSVG} from './base-shape';
import {badgeFrame} from './framing';
import { MotionPreview } from './motion-preview';
import { pickBadge, isSelectionGesture, surfaceUV, type BadgePick } from './interaction';
export type { BadgePick } from './interaction';
export type { ReliefLayer } from './relief';
export interface BadgeSettings {faceTextureStrength:number;frameMetal:'gold'|'silver'|'black';frameSurface:Surface;frameRoughness:number;frameTextureStrength:number;surface:Surface;faceSurface:Surface;textureStrength:number;faceRoughness:number;motionBlur:number;curvature:number;relief:number;metal:'gold'|'silver'|'black';thickness:number;rim:number;roughness:number;face:string;scale:number;x:number;y:number;rotation:number;light:number;title:string;number:string}
export class BadgeEngine {
  private engraving=new Engraving();private inscription:EngravingSettings={...defaultEngraving};
  private baseSVG:string|null=null;private designSVG:string|null=null;
  private maps=new MaterialMaps();
  private playback!:MotionController;
  private recording:AbortController|null=null;
  onMotionState?:(s:'playing'|'paused'|'idle')=>void;
  private lastFrameTime=performance.now();
  private hasFramed=false;
  private cameraTween:{orbit?:boolean;start:number;from:THREE.Vector3;to:THREE.Vector3;targetFrom:THREE.Vector3;targetTo:THREE.Vector3}|null=null;
  private cancelCamera=()=>{this.cameraTween=null;};
  onSelect?: (pick:BadgePick|null)=>void;
  private selected:BadgePick|null=null; private selectionOutline=new THREE.Group(); private outlineMaterial=new THREE.LineBasicMaterial({color:'#d8be91',transparent:true,opacity:.9,depthTest:false});
  private down:{x:number;y:number}|null=null; private pointers=new Set<number>();
  private pointerDown=(e:PointerEvent)=>{if(this.playback?.active||this.exporting)return;this.cameraTween=null;if(e.button!==0)return;this.pointers.add(e.pointerId);this.down=this.pointers.size===1?{x:e.clientX,y:e.clientY}:null;};
  private pointerUp=(e:PointerEvent)=>{if(this.playback.active||this.exporting)return;const start=this.down;const single=this.pointers.size===1;this.pointers.delete(e.pointerId);this.down=null;if(!start||!single||!isSelectionGesture(start,{x:e.clientX,y:e.clientY}))return;const picked=pickBadge(this.camera,this.badge.children.filter(o=>!this.isolateLayer||!this.selected||o.userData.pick?.id===this.selected.id),this.renderer.domElement.getBoundingClientRect(),e.clientX,e.clientY);this.select(picked);};
  private pointerCancel=()=>{this.down=null;this.pointers.clear();};
  private selectionFocus=new SelectionFocus(); private focusEnabled=false; private focusAmount=0; private isolateLayer=false;
  setFocusEnabled(value:boolean){this.focusEnabled=value;this.focusAmount=0;if(!value)this.isolateLayer=false;}
  setIsolateLayer(value:boolean){this.isolateLayer=this.focusEnabled&&value;}
  select(pick:BadgePick|null){if(this.playback?.active)this.playback.stop();this.selected=pick;this.isolateLayer=false;this.highlight();this.frameBadge();this.onSelect?.(pick);}
  private highlight(){for(const child of [...this.selectionOutline.children]){this.selectionOutline.remove(child);(child as THREE.LineSegments).geometry.dispose();}if(!this.selected)return;for(const obj of this.badge.children){if(obj.userData.pick?.id!==this.selected.id)continue;const mesh=obj as THREE.Mesh;const lines=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,40),this.outlineMaterial);lines.renderOrder=5;this.selectionOutline.add(lines);}}
  private surfaces=new SurfaceLibrary(); private motion=new MotionPreview(); private previousCamera=new THREE.Vector3(); private exporting=false;
  private parts:ReliefPart[]=[]; private layers:ReliefLayer[]=[]; private reliefMaterials=new Map<string,THREE.MeshStandardMaterial>();
  private scene=new THREE.Scene(); private camera=new THREE.PerspectiveCamera(33,1,.1,100);
  private renderer:THREE.WebGLRenderer; private controls:OrbitControls; private badge=new THREE.Group(); private points:THREE.Vector2[]=[];private bocaPoints:THREE.Vector2[]=[];
  private metal=new THREE.MeshStandardMaterial({metalness:1,roughness:.16});
  private frameMaterial=new THREE.MeshStandardMaterial({metalness:1,roughness:.16});
  private enamel=new THREE.MeshPhysicalMaterial({metalness:.12,roughness:.23,clearcoat:1,clearcoatRoughness:.18});
  private canvas=document.createElement('canvas'); private texture:THREE.CanvasTexture; private image:HTMLImageElement|null=null;
  private settings?:BadgeSettings; private geometryKey=''; private raf=0; private resize:ResizeObserver; private disposed=false; private env?:THREE.WebGLRenderTarget;
  constructor(private host:HTMLElement){
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setClearColor(0,0);this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    host.appendChild(this.renderer.domElement);this.renderer.domElement.addEventListener('pointerdown',this.pointerDown);this.renderer.domElement.addEventListener('pointerup',this.pointerUp);this.renderer.domElement.addEventListener('pointercancel',this.pointerCancel);this.renderer.domElement.style.touchAction='none';
    this.canvas.width=1024;this.canvas.height=1024;this.texture=new THREE.CanvasTexture(this.canvas);this.texture.colorSpace=THREE.SRGBColorSpace;this.enamel.map=this.texture;
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.playback=new MotionController(this.camera,this.controls);this.playback.onState=s=>{if(s==='idle')this.selectionOutline.visible=true;this.onMotionState?.(s);};this.controls.enableDamping=true;this.controls.enablePan=false;this.controls.minDistance=.35;this.controls.maxDistance=18;this.camera.position.set(2.3,.8,9);this.controls.update();this.renderer.domElement.addEventListener('wheel',this.cancelCamera,{passive:true});
    this.scene.add(this.badge,this.selectionOutline);this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(host);this.fit();
  }
  async init(){const response=await fetch('/escudo.svg');if(!response.ok)throw Error('SVG missing');const svg=await response.text();if(this.disposed)return;
    const parsed=new SVGLoader().parse(svg);this.points=parsed.paths[1].subPaths[0].getPoints(32).map(p=>new THREE.Vector2((p.x-1314)/3139*4,(1569.5-p.y)/3139*4));
    this.baseSVG=svg;this.bocaPoints=this.points.map(p=>p.clone());
    const room=studioEnvironment();const pmrem=new THREE.PMREMGenerator(this.renderer);this.env=pmrem.fromScene(room,.035);this.scene.environment=this.env.texture;disposeEnvironmentScene(room);pmrem.dispose();this.animate();
  }
  private animate=()=>{if(this.disposed)return;const now=performance.now(),dt=Math.max(1/240,Math.min(.1,(now-this.lastFrameTime)/1000)),automatic=!!this.cameraTween;this.lastFrameTime=now;this.previousCamera.copy(this.camera.position);if(this.cameraTween){const t=this.cameraTween,k=Math.min(1,(performance.now()-t.start)/450),ease=1-Math.pow(1-k,3);this.controls.target.lerpVectors(t.targetFrom,t.targetTo,ease);if(t.orbit){const from=t.from.clone().sub(t.targetFrom),to=t.to.clone().sub(t.targetTo);const q=new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(),to.clone().normalize());this.camera.position.copy(from.normalize().applyQuaternion(new THREE.Quaternion().slerp(q,ease)).multiplyScalar(THREE.MathUtils.lerp(t.from.distanceTo(t.targetFrom),t.to.distanceTo(t.targetTo),ease)).add(this.controls.target));}else this.camera.position.lerpVectors(t.from,t.to,ease);if(k===1)this.cameraTween=null;}if(!this.playback.tick(now))this.controls.update();const delta=this.camera.position.clone().sub(this.previousCamera);const right=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,1);const strength=automatic?0:Math.min(.05,Math.max(0,this.settings?.motionBlur||0));const blur=new THREE.Vector2(delta.dot(right),delta.dot(up)).multiplyScalar(strength*.3/(dt*60));blur.clampLength(0,strength*.03);this.focusAmount=THREE.MathUtils.damp(this.focusAmount,this.selected?1:0,14,dt);if(!this.exporting)this.selectionFocus.render(this.badge.children,this.playback.active||!this.focusEnabled?null:this.selected,window.matchMedia('(prefers-reduced-motion: reduce)').matches?1:this.focusAmount,this.isolateLayer,()=>this.motion.render(this.renderer,this.scene,this.camera,blur));this.raf=requestAnimationFrame(this.animate);};
  private fit(){
    if(this.exporting)return;
    this.playback?.stop();
    const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;
    this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
    this.frameBadge(true);
    // Resizing clears the drawing buffer after RAF. Redraw before the browser paints.
    if(!this.exporting)this.renderer.render(this.scene,this.camera);
  }
  resetView(){this.select(null);}
  private frameBadge(retarget=false){
    if(!this.badge.children.length)return;
    this.badge.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(this.badge),picked=new THREE.Box3();
    if(this.selected)for(const mesh of this.badge.children)if(mesh.userData.pick?.id===this.selected.id)picked.expandByObject(mesh);
    const {target,distance}=badgeFrame(bounds,picked.isEmpty()?null:picked,this.camera.aspect,this.camera.fov);
    this.controls.maxDistance=Math.max(18,distance*2);
    const direction=this.camera.position.clone().sub(this.controls.target).normalize();
    const to=target.clone().addScaledVector(direction,distance);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){this.camera.position.copy(to);this.controls.target.copy(target);this.controls.update();this.cameraTween=null;return;}
    // A changing inspector width updates the destination of the same movement.
    if(retarget&&this.cameraTween){this.cameraTween.to.copy(to);this.cameraTween.targetTo.copy(target);return;}
    this.cameraTween={start:performance.now(),from:this.camera.position.clone(),to,targetFrom:this.controls.target.clone(),targetTo:target};
  }
  update(s:BadgeSettings){this.settings={...s};if(!this.points.length)return;this.metal.color.set(s.metal==='gold'?'#e8bc69':s.metal==='silver'?'#dbe0e8':'#4b5260');this.metal.roughness=s.roughness;this.scene.environmentIntensity=s.light;this.enamel.roughness=s.faceRoughness;this.enamel.clearcoat=1-s.faceRoughness;this.enamel.clearcoatRoughness=s.faceRoughness;this.surfaces.apply(this.metal,s.surface,s.textureStrength);this.frameMaterial.color.set(s.frameMetal==='gold'?'#e8bc69':s.frameMetal==='silver'?'#dbe0e8':'#4b5260');this.frameMaterial.roughness=s.frameRoughness;this.surfaces.apply(this.frameMaterial,s.frameSurface,s.frameTextureStrength);this.surfaces.apply(this.enamel,s.faceSurface,s.faceTextureStrength);const key=`${s.thickness}-${s.rim}-${s.curvature}-${s.relief}-${this.parts.length ? [s.scale,s.x,s.y,s.rotation].join() : ""}`;if(key!==this.geometryKey){this.geometryKey=key;this.build(s);}this.maps.apply('body',this.metal);this.maps.apply('frame',this.frameMaterial);this.maps.apply('face',this.enamel,this.texture);this.paint();}
  private build(s:BadgeSettings){for(const obj of [...this.badge.children]){this.badge.remove(obj);(obj as THREE.Mesh).geometry.dispose();}
    const shape=new THREE.Shape(this.points);const options={depth:s.thickness,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.014,bevelThickness:.014,curveSegments:32};
    const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,options),this.metal);body.name='Chapa';body.userData.pick={kind:'body',id:'body',label:'Chapa · laterales y reverso'};this.badge.add(body);
    const inner=this.points.map(p=>p.clone().multiplyScalar(1-s.rim));const ring=new THREE.Shape(this.points);ring.holes.push(new THREE.Path([...inner].reverse()));
    const frame=new THREE.Mesh(new THREE.ExtrudeGeometry(ring,{...options,depth:.045,bevelSize:.009,bevelThickness:.009}),this.frameMaterial);frame.position.z=s.thickness;frame.name='Marco';frame.userData.pick={kind:'frame',id:'frame',label:'Marco metálico'};this.badge.add(frame);
    const faceGeometry=new THREE.ShapeGeometry(new THREE.Shape(inner),32);const positions=faceGeometry.getAttribute('position');const uv=faceGeometry.getAttribute('uv');for(let i=0;i<positions.count;i++)uv.setXY(i,(positions.getX(i)+2)/4,(positions.getY(i)+2)/4);uv.needsUpdate=true;
    const face=new THREE.Mesh(faceGeometry,this.enamel);face.position.z=s.thickness+.025;face.name='Esmalte e impresion';face.userData.pick={kind:'face',id:'face',label:'Esmalte interior'};this.badge.add(face);
    const angle=-s.rotation*Math.PI/180;
    for(const part of this.parts){const layer=this.layers.find(l=>l.id===part.layer)!;const g=part.geometry.clone(),p=g.getAttribute('position');for(let i=0;i<p.count;i++){const x=p.getX(i)*s.scale,y=p.getY(i)*s.scale;p.setXYZ(i,x*Math.cos(angle)-y*Math.sin(angle)+s.x*.02,x*Math.sin(angle)+y*Math.cos(angle)-s.y*.02,p.getZ(i)*s.relief*layer.height+s.thickness+.027+part.order*.0015);}g.computeVertexNormals();const mesh=new THREE.Mesh(g,this.reliefMaterials.get(part.layer));mesh.name=part.layer;mesh.userData.pick={kind:'layer',id:part.layer,label:layer.name};this.badge.add(mesh);}
    for(const child of this.badge.children){const mesh=child as THREE.Mesh;mesh.geometry.translate(0,0,mesh.position.z);mesh.position.z=0;mesh.geometry=surfaceUV(mesh.geometry,mesh.userData.pick?.kind==='face');mesh.geometry=bendGeometry(mesh.geometry,s.curvature);}
    this.buildEngraving();this.highlight();if(!this.hasFramed){this.frameBadge();this.hasFramed=true;}

  }
  private buildEngraving(){const previous=this.badge.getObjectByName('Inscripción visual');if(previous){this.badge.remove(previous);(previous as THREE.Mesh).geometry.dispose();}if(!this.inscription.text.trim()||!this.settings)return;this.engraving.paint(this.inscription);const mesh=new THREE.Mesh(engravingGeometry(this.points,this.settings.curvature),this.engraving.material);mesh.name='Inscripción visual';mesh.userData.pick={kind:'body',id:'body',label:'Chapa · laterales y reverso'};mesh.renderOrder=1;this.badge.add(mesh);}
  setEngraving(s:EngravingSettings){this.inscription={...s};this.buildEngraving();}
  viewSide(back:boolean){this.stopMotion();this.selected=null;this.highlight();if(!this.badge.children.length)return;const bounds=new THREE.Box3().setFromObject(this.badge);const {target,distance}=badgeFrame(bounds,null,this.camera.aspect,this.camera.fov);const to=target.clone().add(new THREE.Vector3(0,0,back?-distance:distance));if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){this.cameraTween=null;this.camera.position.copy(to);this.controls.target.copy(target);this.controls.update();}else this.cameraTween={orbit:true,start:performance.now(),from:this.camera.position.clone(),to,targetFrom:this.controls.target.clone(),targetTo:target};}
  private paint(){const s=this.settings;if(!s)return;const ctx=this.canvas.getContext('2d')!;ctx.fillStyle=s.face;ctx.fillRect(0,0,1024,1024);const custom=this.maps.face();if(custom){ctx.save();ctx.translate(512,512);ctx.rotate(-custom.settings.rotation*Math.PI/180);const tile=1024/custom.settings.repeat;ctx.scale(tile/custom.image.width,tile/custom.image.height);const pattern=ctx.createPattern(custom.image,'repeat');if(pattern){ctx.fillStyle=pattern;ctx.fillRect(-10000,-10000,20000,20000);}ctx.restore();}ctx.save();ctx.translate(512+s.x*5,512+s.y*5);ctx.rotate(s.rotation*Math.PI/180);ctx.scale(s.scale,s.scale);
    if(this.image){const factor=Math.min(820/this.image.naturalWidth,820/this.image.naturalHeight);ctx.drawImage(this.image,-this.image.naturalWidth*factor/2,-this.image.naturalHeight*factor/2,this.image.naturalWidth*factor,this.image.naturalHeight*factor);}
    else if(!this.parts.length){ctx.textAlign='center';ctx.fillStyle='#f3ce79';ctx.font='600 40px sans-serif';ctx.fillText(s.title,0,-210);ctx.font='900 290px sans-serif';ctx.fillText(s.number,0,60);ctx.fillRect(-180,115,360,3);ctx.font='500 23px sans-serif';ctx.fillText('LA BOMBONERA',0,165);ctx.font='400 18px sans-serif';ctx.fillText('BUENOS AIRES · 1905',0,206);}ctx.restore();this.texture.needsUpdate=true;
  }
  setBaseSVG(svg:string){const points=parseBaseSVG(svg);this.baseSVG=svg;this.points=points;this.select(null);this.geometryKey='';if(this.settings)this.update(this.settings);}
  resetBase(){this.baseSVG=null;this.points=this.bocaPoints.map(p=>p.clone());this.select(null);this.geometryKey='';if(this.settings)this.update(this.settings);}
  async setImage(file:File){const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(img.naturalWidth*img.naturalHeight>40_000_000)throw Error('Image too large');this.clearRelief();this.image=img;this.geometryKey='';if(this.settings)this.update(this.settings);}finally{URL.revokeObjectURL(url);}}
  clearImage(){this.clearRelief();this.image=null;this.geometryKey='';if(this.settings)this.update(this.settings);}
  private clearRelief(){this.designSVG=null;this.maps.clearLayers();this.select(null);for(const p of this.parts)p.geometry.dispose();this.parts=[];for(const m of this.reliefMaterials.values())m.dispose();this.reliefMaterials.clear();this.layers=[];}
  setSVG(svg:string){const parsed=parseRelief(svg);this.clearRelief();this.designSVG=svg;this.image=null;this.parts=parsed.parts;this.layers=parsed.layers;for(const l of this.layers){const material=new THREE.MeshStandardMaterial({color:l.color,metalness:l.metallic?1:.1,roughness:l.roughness});this.surfaces.apply(material,l.surface,l.textureStrength);this.reliefMaterials.set(l.id,material);}this.geometryKey='';if(this.settings)this.update(this.settings);return this.layers.map(l=>({...l}));}
  setLayer(id:string,changes:Partial<ReliefLayer>){const layer=this.layers.find(l=>l.id===id),m=this.reliefMaterials.get(id);if(!layer||!m)return;Object.assign(layer,changes);m.color.set(layer.color);m.metalness=layer.metallic?1:.1;m.roughness=layer.roughness;this.surfaces.apply(m,layer.surface,layer.textureStrength);this.maps.apply(id,m);if(changes.height!==undefined&&this.settings)this.build(this.settings);}

  snapshot():SceneSnapshot{if(!this.settings)throw Error('El visor todavía está cargando.');this.stopMotion();this.cameraTween=null;let raster:string|null=null;if(this.image){const c=document.createElement('canvas');c.width=this.image.naturalWidth;c.height=this.image.naturalHeight;c.getContext('2d')!.drawImage(this.image,0,0);raster=c.toDataURL('image/png');}return {engraving:{...this.inscription},basePoints:this.points.map(p=>[p.x,p.y]),baseSVG:this.baseSVG,designSVG:this.designSVG,raster,settings:{...this.settings},layers:this.layers.map(l=>({...l,color:'#'+new THREE.Color(l.color).getHexString()})),maps:this.maps.snapshot(),camera:{position:this.camera.position.toArray(),target:this.controls.target.toArray()}};}
  thumbnail(){const visible=this.selectionOutline.visible;try{this.selectionOutline.visible=false;this.renderer.render(this.scene,this.camera);const c=document.createElement('canvas');c.width=360;c.height=280;const ctx=c.getContext('2d')!;ctx.fillStyle='#292925';ctx.fillRect(0,0,360,280);const src=this.renderer.domElement,scale=Math.min(360/src.width,280/src.height);ctx.drawImage(src,(360-src.width*scale)/2,(280-src.height*scale)/2,src.width*scale,src.height*scale);return c.toDataURL('image/jpeg',.8);}finally{this.selectionOutline.visible=visible;}}
  async restoreSnapshot(s:SceneSnapshot){
    const parsed=s.designSVG?parseRelief(s.designSVG):{parts:[],layers:[]};const maps=new MaterialMaps();let img:HTMLImageElement|null=null;
    try{if(parsed.layers.length!==s.layers.length||parsed.layers.some(l=>!s.layers.some(saved=>saved.id===l.id)))throw Error('Los grupos no coinciden con el SVG del proyecto.');
      if(s.raster){img=new Image();img.src=s.raster;await img.decode();if(img.naturalWidth*img.naturalHeight>40_000_000)throw Error('La imagen del proyecto es demasiado grande.');}
      for(const [id,m] of Object.entries(s.maps)){await maps.load(id,m.images);maps.configure(id,m.settings);}
    }catch(error){maps.dispose();parsed.parts.forEach(p=>p.geometry.dispose());throw error;}
    this.stopMotion();this.inscription={...(s.engraving||defaultEngraving)};this.clearRelief();this.maps.dispose();this.maps=maps;this.baseSVG=s.baseSVG;this.designSVG=s.designSVG;this.points=s.basePoints.map(p=>new THREE.Vector2(p[0],p[1]));this.image=img;this.parts=parsed.parts;this.layers=s.layers.map(l=>({...l}));
    for(const l of this.layers){const m=new THREE.MeshStandardMaterial();this.reliefMaterials.set(l.id,m);this.setLayer(l.id,{});}
    this.geometryKey='';this.hasFramed=true;this.update(s.settings);await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));this.cameraTween=null;const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.camera.position.fromArray(s.camera.position);this.controls.target.fromArray(s.camera.target);this.controls.update();this.controls.enableDamping=damping;this.renderer.render(this.scene,this.camera);
  }
  async loadMaps(id:string,files:Partial<Record<MapKind,File|string>>){const applied=await this.maps.load(id,files);if(applied)this.refreshMaps(id);}
  configureMaps(id:string,patch:Partial<MapSettings>){this.maps.configure(id,patch);this.refreshMaps(id);}
  clearMaps(id:string){this.maps.clear(id);this.refreshMaps(id);}
  private refreshMaps(id:string){if(this.settings)this.update(this.settings);if(this.reliefMaterials.has(id))this.setLayer(id,{});}
  playMotion(options:MotionOptions){this.cameraTween=null;this.selectionOutline.visible=false;this.playback.play(options);}
  pauseMotion(){this.playback.pause();}
  stopMotion(){this.playback.stop();this.selectionOutline.visible=true;}
  cancelVideo(){this.recording?.abort();}
  async downloadVideo(options:MotionOptions,onProgress:(n:number)=>void){
    if(this.exporting)throw Error('Ya hay una exportación en curso.');
    this.cameraTween=null;this.exporting=true;this.selectionOutline.visible=false;this.recording=new AbortController();
    try{const {blob,extension}=await recordVideo(this.renderer,this.scene,this.camera,this.playback,options,this.recording.signal,onProgress);this.saveBlob(blob,'mi-badge.'+extension);}
    finally{this.recording=null;this.exporting=false;this.selectionOutline.visible=true;}
  }
  private saveBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  async download(kind:'png'|'glb'){this.stopMotion();let blob:Blob;if(kind==='png'){const old=this.renderer.getSize(new THREE.Vector2()),ratio=this.renderer.getPixelRatio(),aspect=this.camera.aspect;try{this.exporting=true;this.selectionOutline.visible=false;this.renderer.setPixelRatio(1);this.renderer.setSize(2048,2048,false);this.camera.aspect=1;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);blob=await new Promise<Blob>((resolve,reject)=>this.renderer.domElement.toBlob(b=>b?resolve(b):reject(Error('PNG failed')),'image/png'));}finally{this.exporting=false;this.selectionOutline.visible=true;this.renderer.setPixelRatio(ratio);this.renderer.setSize(old.x,old.y,false);this.camera.aspect=aspect;this.camera.updateProjectionMatrix();}}else{const result=await new GLTFExporter().parseAsync(this.badge,{binary:true});blob=new Blob([result as ArrayBuffer],{type:'model/gltf-binary'});}const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=`mi-badge.${kind}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  dispose(){this.selectionFocus.dispose();this.engraving.dispose();this.recording?.abort();this.playback.stop();this.maps.dispose();this.disposed=true;this.renderer.domElement.removeEventListener('wheel',this.cancelCamera);this.renderer.domElement.removeEventListener('pointerdown',this.pointerDown);this.renderer.domElement.removeEventListener('pointerup',this.pointerUp);this.renderer.domElement.removeEventListener('pointercancel',this.pointerCancel);this.select(null);this.outlineMaterial.dispose();cancelAnimationFrame(this.raf);this.resize.disconnect();this.controls.dispose();this.badge.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});this.clearRelief();this.metal.dispose();this.frameMaterial.dispose();this.enamel.dispose();this.texture.dispose();this.env?.dispose();this.surfaces.dispose();this.motion.dispose();this.renderer.dispose();this.renderer.domElement.remove();}
}
