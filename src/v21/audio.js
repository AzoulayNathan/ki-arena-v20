import {audioSettings} from '../v19/media.js';
let ac,noise,active=new Set();
const spec={slash:[1800,300,'sawtooth'],crosscut:[2200,250,'sawtooth'],volley:[1000,120,'square'],beam:[220,880,'sawtooth'],orb:[180,620,'sine'],lightning:[2400,120,'sawtooth'],nova:[110,35,'triangle'],heal:[440,880,'sine'],revive:[330,1320,'sine'],barrier:[660,330,'sine'],intercept:[300,650,'triangle'],bind:[600,180,'square'],burn:[260,80,'sawtooth'],weaken:[300,120,'sine'],shatter:[100,25,'triangle'],heavy:[130,32,'triangle'],combo:[180,48,'triangle'],evade:[1400,700,'sine'],awaken:[160,640,'sawtooth']};
export function stopCues(){for(const n of active){try{n.osc.stop();n.src.stop();n.bus.disconnect();}catch{}}active.clear();}
export function playCue(p,total,reduced=false){
 if(audioSettings.muted||!audioSettings.sfx)return;
 try{ac??=new(globalThis.AudioContext||globalThis.webkitAudioContext)();ac.resume().catch(()=>{});if(active.size>=6)return;
 const [from,to,wave]=spec[p.variant]||[180,45,'triangle'],t=ac.currentTime+(reduced?0:total*.48/1000),duration=Math.min(.36,total/1000*.65),bus=ac.createGain();bus.gain.value=Math.min(.07,audioSettings.sfx*.26);bus.connect(ac.destination);
 const osc=ac.createOscillator(),gain=ac.createGain();osc.type=wave;osc.frequency.setValueAtTime(from,t);osc.frequency.exponentialRampToValueAtTime(to,t+duration);gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.3,t+.008);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain).connect(bus);osc.start(t);osc.stop(t+duration+.01);
 if(!noise){noise=ac.createBuffer(1,Math.floor(ac.sampleRate*.28),ac.sampleRate);const d=noise.getChannelData(0);let n=113;for(let i=0;i<d.length;i++){n=n*16807%2147483647;d[i]=(n/1073741824-1)*Math.pow(1-i/d.length,2);}}
 const src=ac.createBufferSource(),filter=ac.createBiquadFilter(),ng=ac.createGain();src.buffer=noise;filter.type='bandpass';filter.frequency.value=p.family==='weapon'?2400:p.family==='energy'?1000:350;ng.gain.value=p.family==='support'?.08:.55;src.connect(filter).connect(ng).connect(bus);src.start(t);const h={osc,src,bus};active.add(h);src.onended=()=>{bus.disconnect();active.delete(h);};
 }catch{}
}

