const fs = require('fs');
const vm = require('vm');
const path = require('path');

const assetsCode = fs.readFileSync(path.join(__dirname,'../js/assets.js'),'utf8');
const assetMapCode = fs.readFileSync(path.join(__dirname,'../js/asset_map.js'),'utf8');
const dataCode = fs.readFileSync(path.join(__dirname,'../js/data.js'),'utf8');
// Title and NEW GAME/CONTINUE are covered by exploration_browser.cjs.
// Bypass the title here to retain coverage of each existing screen renderer.
const gameCode = fs.readFileSync(path.join(__dirname,'../js/game.js'),'utf8').replace('let titleActive=true;', 'let titleActive=false;');

function makeElement(){
  const el = {
    innerHTML:'', textContent:'', hidden:false, value:'', disabled:false, dataset:{}, style:{},
    className:'', onclick:null, onchange:null, oninput:null,
    classList:{add(){},remove(){},toggle(){}},
    addEventListener(){}, insertAdjacentHTML(_where,html){this.innerHTML+=html;}, querySelector(){return makeElement();}, querySelectorAll(){return [];},
    remove(){}, closest(){return null;}, focus(){}, setAttribute(){},
  };
  return el;
}

function runScreen(screen){
  const elements = new Map();
  const get = key => { if(!elements.has(key)) elements.set(key, makeElement()); return elements.get(key); };
  const document = {
    querySelector(sel){ return get(sel); },
    querySelectorAll(sel){ return sel && sel.startsWith('#') ? [get(sel)] : []; },
    addEventListener(){},
  };
  const seeded = {
    version:1,gold:1200,screen,owned:[],party:[],souls:{},
    inventory:{little_music:5,soul_boost_07:3,soul_boost_12:2,soul_boost_20:1,anti_paralyze:3},
    soulBoost:0,
    story:{completedNodes:{},completedAreas:{},completedSeasons:{},current:{season:1,area:'草原',floor:1,areaNo:1},resume:null,roseUnlocked:false},
    arena:{progress:{},currentRank:'F'},flags:{demoSeeded:true},settings:{battleSpeed:1}
  };
  const localStorage = {getItem(){return JSON.stringify(seeded)},setItem(){}};
  const context = {
    window:{}, document, localStorage, console, setTimeout, clearTimeout,
    confirm(){return false;}, alert(){}, Math, Date, Intl,
  };
  context.window.window=context.window;
  context.window.document=document;
  vm.createContext(context);
  vm.runInContext(assetsCode, context, {filename:'assets.js'});
  vm.runInContext(assetMapCode, context, {filename:'asset_map.js'});
  vm.runInContext(dataCode, context, {filename:'data.js'});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/dialogue.js'),'utf8'), context, {filename:'dialogue.js'});
  vm.runInContext(gameCode, context, {filename:'game.js'});
  if(!get('#screen').innerHTML) throw new Error(`${screen}: screen was not rendered`);
}

for(const s of ['home','story','party','monsters','soul','arena','settings','castle','shop','gacha']) runScreen(s);
console.log('MOB MONSTERS v0.2.3 UI runtime render smoke: OK');
