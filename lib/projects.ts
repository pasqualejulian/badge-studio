import {validateEngraving,type EngravingSettings} from './engraving-settings.ts';
import type {BadgeSettings,ReliefLayer} from './badge-engine';
import type {MotionOptions} from './animation';
import type {MapSettings,MapKind} from './material-maps';
export interface SceneSnapshot{engraving?:EngravingSettings;basePoints:number[][];baseSVG:string|null;designSVG:string|null;raster:string|null;settings:BadgeSettings;layers:ReliefLayer[];maps:Record<string,{settings:MapSettings;images:Partial<Record<MapKind,string>>}>;camera:{position:number[];target:number[]}}
export interface BadgeProject{format:'badge-studio';version:1;id:string;name:string;system:string;kind:'piece'|'template';sourceTemplate:string|null;updatedAt:string;thumbnail:string;scene:SceneSnapshot;motion:MotionOptions;labels:{base:string;design:string}}
export const MAX_PROJECT_BYTES=100*1024*1024;
const fail=()=>{throw Error('El archivo .badge está incompleto o contiene valores no compatibles.');};
const obj=(v:any)=>v&&typeof v==='object'&&!Array.isArray(v)?v:fail();
const str=(v:any,n=200)=>typeof v==='string'&&v.length<=n?v:fail();
const num=(v:any,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max?v:fail();
const one=(v:any,values:unknown[])=>values.includes(v)?v:fail();
const bool=(v:any)=>typeof v==='boolean'?v:fail();
const image=(v:any)=>typeof v==='string'&&v.length<60_000_000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(v)?v:fail();
const vector=(v:any,min:number,max:number)=>Array.isArray(v)&&v.length===3?v.map(n=>num(n,min,max)):fail();
const surfaces=['smooth','grain','brushed','hammered','worn'];
export function validateProject(input:unknown):BadgeProject{
 const p=obj(input);if(p.format!=='badge-studio')fail();if(p.version!==1)throw Error('Esta versión de proyecto no es compatible.');
 const s=obj(p.scene);if(s.designSVG!==null&&s.raster!==null)fail();const settings=obj(s.settings),clean:any={};
 const ranges:Record<string,[number,number]>={faceTextureStrength:[0,1.5],frameRoughness:[.04,.9],frameTextureStrength:[0,1.5],textureStrength:[0,1.5],faceRoughness:[.04,.9],motionBlur:[0,.05],curvature:[-.45,.45],relief:[.015,.12],thickness:[.06,.4],rim:[.035,.16],roughness:[.04,.9],scale:[.25,2.5],x:[-70,70],y:[-70,70],rotation:[-180,180],light:[.3,2]};
 for(const [k,[min,max]] of Object.entries(ranges))clean[k]=num(settings[k],min,max);
 for(const k of ['metal','frameMetal'])clean[k]=one(settings[k],['gold','silver','black']);
 for(const k of ['surface','frameSurface','faceSurface'])clean[k]=one(settings[k],surfaces);
 const color=(v:any)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:fail();
 clean.face=color(settings.face);clean.title=str(settings.title,24);clean.number=str(settings.number,4);
 if(!Array.isArray(s.basePoints)||s.basePoints.length<3||s.basePoints.length>4096)fail();
 const points=s.basePoints.map((v:any)=>Array.isArray(v)&&v.length===2?v.map(n=>num(n,-10,10)):fail());
 if(Math.max(...points.map((v:number[])=>v[0]))-Math.min(...points.map((v:number[])=>v[0]))<.001)fail();
 if(Math.max(...points.map((v:number[])=>v[1]))-Math.min(...points.map((v:number[])=>v[1]))<.001)fail();
 const layers:ReliefLayer[]=Array.isArray(s.layers)&&s.layers.length<=160?s.layers.map((v:any)=>{const l=obj(v);return {id:str(l.id),name:str(l.name),color:color(l.color),metallic:bool(l.metallic),height:num(l.height,.2,3),surface:one(l.surface,surfaces),textureStrength:num(l.textureStrength,0,1.5),roughness:num(l.roughness,.04,.9)};}):fail();
 const ids=['body','frame','face',...layers.map(l=>l.id)];if(new Set(ids).size!==ids.length)fail();
 const maps:SceneSnapshot['maps']=Object.create(null);for(const [id,raw] of Object.entries(obj(s.maps))){if(!ids.includes(id))fail();const m=obj(raw),ms=obj(m.settings);const images:any={};for(const [k,v] of Object.entries(obj(m.images))){one(k,['color','normal','roughness']);images[k]=image(v);}maps[id]={settings:{repeat:num(ms.repeat,.5,12),rotation:num(ms.rotation,-180,180),normalStrength:num(ms.normalStrength,0,2),roughness:num(ms.roughness,0,1),colorEnabled:bool(ms.colorEnabled)},images};}
 const camera=obj(s.camera),position=vector(camera.position,-100,100),target=vector(camera.target,-20,20);if(Math.hypot(...position.map((v:number,i:number)=>v-target[i]))<.35)fail();
 const mo=obj(p.motion),labels=obj(p.labels);
 return {format:'badge-studio',version:1,id:str(p.id,100),name:str(p.name,100).trim()||'Sin título',system:str(p.system,100),kind:one(p.kind,['piece','template']),sourceTemplate:p.sourceTemplate===null?null:str(p.sourceTemplate,100),updatedAt:str(p.updatedAt,50),thumbnail:image(p.thumbnail),scene:{engraving:validateEngraving(s.engraving),basePoints:points,baseSVG:s.baseSVG===null?null:str(s.baseSVG,512000),designSVG:s.designSVG===null?null:str(s.designSVG,512000),raster:s.raster===null?null:image(s.raster),settings:clean,layers,maps,camera:{position,target}},motion:{preset:one(mo.preset,['turntable','sway']),duration:num(mo.duration,2,15),loop:bool(mo.loop),background:color(mo.background)},labels:{base:str(labels.base),design:str(labels.design)}};
}
export function parseProject(text:string){if(text.length>MAX_PROJECT_BYTES)throw Error('El proyecto supera el límite de 100 MB.');let value:unknown;try{value=JSON.parse(text);}catch{throw Error('No pudimos leer el archivo. Elegí un .badge exportado desde Badge Studio.');}return validateProject(value);}
export function serializeProject(p:BadgeProject){const text=JSON.stringify(validateProject(p));if(new Blob([text]).size>MAX_PROJECT_BYTES)throw Error('El proyecto supera los 100 MB. Reducí la resolución de las texturas.');return text;}
export function copyProject(p:BadgeProject,kind:'piece'|'template'=p.kind):BadgeProject{return {...structuredClone(p),id:crypto.randomUUID(),name:kind==='piece'&&p.kind==='template'?p.name.slice(0,85)+' · variante':p.name.slice(0,85)+' · copia',kind,sourceTemplate:p.kind==='template'?p.id:p.sourceTemplate,updatedAt:new Date().toISOString()};}
function database(){return new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('badge-studio-projects',1);request.onupgradeneeded=()=>request.result.createObjectStore('projects',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('No se pudo abrir el almacenamiento local. Podés exportar tu proyecto como archivo.'));});}
async function transaction<T>(mode:IDBTransactionMode,action:(store:IDBObjectStore)=>IDBRequest<T>){const db=await database();return new Promise<T>((resolve,reject)=>{const tx=db.transaction('projects',mode),request=action(tx.objectStore('projects'));tx.oncomplete=()=>{db.close();resolve(request.result);};tx.onerror=tx.onabort=()=>{db.close();reject(Error('No se pudo guardar el cambio local. Puede faltar espacio. Exportá una copia .badge.'));};});}
export const projectStore={list:()=>transaction('readonly',s=>s.getAll()) as Promise<BadgeProject[]>,put:(p:BadgeProject)=>transaction('readwrite',s=>s.put(p)),remove:(id:string)=>transaction('readwrite',s=>s.delete(id))};
