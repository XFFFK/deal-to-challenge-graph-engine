const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const elements = new Map();
function makeElement(id){
  const listeners={};
  return {id,value:id==="sampleSelect"?"clinical":"all",textContent:"",innerHTML:"",className:"",style:{},listeners,classList:{add(){},remove(){}},addEventListener(type,fn){listeners[type]=fn;},querySelectorAll(){return []}};
}
const document={getElementById(id){if(!elements.has(id))elements.set(id,makeElement(id));return elements.get(id);},createElement(){return {href:"",download:"",click(){}};}};
class CaptureBlob{constructor(parts,options){this.data=parts.join("");this.type=options?.type;CaptureBlob.last=this;}}
const URLShim={createObjectURL(){return "blob:sample";},revokeObjectURL(){}};
const context={document,Blob:CaptureBlob,URL:URLShim,setTimeout,clearTimeout,console};
vm.createContext(context);
const appPath=path.join(__dirname,"app.js");
const source=fs.readFileSync(appPath,"utf8")+"\nthis.__app={getState:()=>state,exportGraph,buildHumanPlan};";
vm.runInContext(source,context,{filename:appPath});
const app=context.__app;
const select=document.getElementById("sampleSelect");
const load=elements.get("loadSampleBtn");
const outDir=path.join(__dirname,"sample-outputs");
fs.mkdirSync(outDir,{recursive:true});
for(const key of ["claims","clinical","member","supply"]){
  select.value=key;
  load.listeners.click();
  app.exportGraph();
  fs.writeFileSync(path.join(outDir,`${key}.graph.json`),CaptureBlob.last.data,"utf8");
  fs.writeFileSync(path.join(outDir,`${key}.execution-plan.md`),app.buildHumanPlan(),"utf8");
}
console.log(`generated ${fs.readdirSync(outDir).length} sample outputs`);


