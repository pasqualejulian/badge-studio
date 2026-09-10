'use client';
import {useEffect,useState} from 'react';
import {CircleHelp,MousePointer2,SlidersHorizontal,FolderOpen,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import './canvas-guide.css';
const STORAGE_KEY='badge-studio.canvas-guide.v1';
export function CanvasGuide({ready,onStart}:{ready:boolean;onStart:()=>void}){
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(!ready)return;try{if(!localStorage.getItem(STORAGE_KEY))setOpen(true);}catch{setOpen(true);}},[ready]);
 function dismiss(){setOpen(false);try{localStorage.setItem(STORAGE_KEY,'seen');}catch{/* The guide remains usable when browser storage is unavailable. */}}
 return <><Button className="canvas-help" variant="outline" disabled={!ready} onClick={()=>setOpen(true)}><CircleHelp size={16}/>Ayuda</Button>
 <Dialog open={open} onOpenChange={value=>{if(!value)dismiss();}}><DialogContent className="canvas-guide" showCloseButton={false}>
 <div className="guide-heading"><div><p className="guide-kicker">EMPEZÁ POR EL OBJETO</p><DialogTitle>Editá tu primera pieza</DialogTitle></div><Button variant="ghost" aria-label="Cerrar guía" onClick={dismiss}><X size={20}/></Button></div>
 <DialogDescription>Tocá lo que querés cambiar. Los controles aparecen junto a tu selección.</DialogDescription>
 <ol className="guide-steps">
 <li><MousePointer2 aria-hidden="true"/><div><h3>1. Seleccioná en el canvas</h3><p>Tocá el borde, la base o una capa del SVG. Arrastrá para girar y usá la rueda o dos dedos para acercarte.</p></div></li>
 <li><SlidersHorizontal aria-hidden="true"/><div><h3>2. Probá un acabado</h3><p>Cambiá el material, el color o la textura de esa parte. Tocá el fondo para volver a ver la pieza completa.</p></div></li>
 <li><FolderOpen aria-hidden="true"/><div><h3>3. De una pieza a una colección</h3><p>En <strong>Mis badges</strong>, guardá tu estilo como plantilla. Creá una colección desde ella y agregá piezas: cada una se edita y guarda por separado.</p></div></li>
 </ol>
 <p className="guide-storage">Tu biblioteca se guarda en este navegador. Exportá un archivo .badge para llevarte una copia editable.</p>
 <div className="guide-actions"><Button variant="ghost" onClick={dismiss}>Explorar por mi cuenta</Button><Button onClick={()=>{dismiss();onStart();}}>Probar en el canvas</Button></div>
 </DialogContent></Dialog></>;
}
