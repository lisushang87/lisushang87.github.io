/* Original vector fan-art and browser simulation. No game assets, remote scripts or tracking.
 * Character inspiration: Honkai Impact 3rd / Seele / Stygian Nymph (HoYoverse).
 * Pointer release velocity uses a short, time-weighted motion window; physics runs at 120 Hz.
 */
(() => {
  'use strict';
  const world = document.querySelector('#world');
  const fxRoot = document.querySelector('#effects');
  const announcer = document.querySelector('#announcer');
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  const rand = (a,b) => a+Math.random()*(b-a);
  const choose = a => a[Math.floor(Math.random()*a.length)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONFIG = {gravity:1800,bounce:.32,wallBounce:.60,maxThrow:2100,step:1/120,maxParticles:64};
  const colors = [
    {id:'seele',name:'希儿',accent:'#7e9be8',outline:'#41415c',hair:'#252b48',tip:'#718bd0',eye:'#518bcf',dress:'#fcfbff',fold:'#d4daf2',trim:'#879eda',ribbon:'#8da9e7'},
    {id:'veliona',name:'另一个希儿',accent:'#ce738f',outline:'#433448',hair:'#282538',tip:'#925070',eye:'#c64d76',dress:'#383347',fold:'#252234',trim:'#d07b93',ribbon:'#a94e70'}
  ];

  function doll(c) {
    const id=c.id, dark=id==='veliona';
    const eye=(x)=>`<g transform="translate(${x} 0)"><path d="M-10 78Q0 71 10 78L9 91Q0 100-9 91Z" fill="#fffafb"/><ellipse cx="0" cy="84" rx="7.7" ry="10" fill="url(#${id}-eye)"/><ellipse cx="0" cy="83" rx="3.5" ry="6.9" fill="#34304c"/><path d="M-5 91Q0 94 5 91" fill="none" stroke="#ffffffaa" stroke-width="2"/><ellipse cx="-3" cy="77.5" rx="3" ry="3.3" fill="white"/><circle cx="4" cy="87" r="1.5" fill="white"/><path d="M-11 78Q-2 71 10 77M-11 78L-14 75" fill="none" stroke="${c.outline}" stroke-width="2" stroke-linecap="round"/></g>`;
    const open=`<g class="open-eyes">${eye(65)}${eye(107)}</g>`;
    const cheeks=`<ellipse cx="51" cy="98" rx="8" ry="3.5" fill="#f3a5b7" opacity=".45"/><ellipse cx="122" cy="98" rx="8" ry="3.5" fill="#f3a5b7" opacity=".45"/>`;
    const closed='<path d="M55 86Q64 77 74 86M98 86Q107 77 117 86" fill="none" stroke="var(--outline)" stroke-width="2" stroke-linecap="round"/>';
    const mouths={smile:'<path d="M81 100Q86 106 92 100" fill="none" class="line"/>',happy:'<path d="M79 99Q86 116 95 99Z" fill="#b16b86" class="fine"/><path d="M83 106Q87 102 92 106" fill="#f7b3c0"/>',small:'<path d="M83 102Q87 104 91 101" fill="none" class="line"/>'};
    return `<svg class="doll" viewBox="0 0 180 232" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${id}-hair" x2=".3" y2="1"><stop stop-color="${c.hair}"/><stop offset=".64" stop-color="${c.hair}"/><stop offset="1" stop-color="${c.tip}"/></linearGradient>
      <linearGradient id="${id}-eye" x2="0" y2="1"><stop stop-color="#393650"/><stop offset=".5" stop-color="${c.eye}"/><stop offset="1" stop-color="${c.accent}"/></linearGradient>
      <linearGradient id="${id}-skin" x2="0" y2="1"><stop stop-color="#fff5ef"/><stop offset="1" stop-color="#f8dedf"/></linearGradient>
      <linearGradient id="${id}-cloth" x2=".2" y2="1"><stop stop-color="${c.dress}"/><stop offset="1" stop-color="${c.fold}"/></linearGradient>
    </defs>
    <g class="ribbon line" fill="${c.ribbon}"><path d="M65 143Q40 154 33 195L47 186 51 207Q55 173 81 151Z"/><path d="M106 145Q135 158 148 197L132 190 129 210Q121 170 96 152Z"/><path d="M44 185Q50 163 65 156M130 189Q124 168 110 158" fill="none" stroke="#ffffff66"/></g>
    <g class="leg-l line"><path d="M66 175L83 174 83 210Q76 217 68 210Z" fill="${dark?'#3d354c':'#ecedf9'}"/><path d="M68 195L82 195 83 212Q89 216 86 222L64 222Q62 215 68 211Z" fill="${dark?'#302939':'#55516b'}"/><path d="M67 203L82 203M69 194L79 210M80 194L69 210" fill="none" stroke="${c.trim}"/><path d="M65 220H85" stroke="${c.accent}"/></g>
    <g class="leg-r line"><path d="M96 174L112 175 111 210Q104 217 97 210Z" fill="${dark?'#3d354c':'#ecedf9'}"/><path d="M97 195L111 195 111 211Q118 216 115 222L94 222Q91 216 97 212Z" fill="${dark?'#302939':'#55516b'}"/><path d="M97 203L111 203M98 194L109 210M110 194L99 210" fill="none" stroke="${c.trim}"/><path d="M95 220H114" stroke="${c.accent}"/></g>
    <g class="arm-l line"><path d="M68 129Q53 127 48 141L55 149 67 144Z" fill="${c.dress}"/><path d="M52 144Q46 158 44 170Q48 177 54 171L64 147Z" fill="url(#${id}-skin)"/><path d="M51 149L61 151 55 169 45 166Z" fill="${dark?'#45394e':'#fbfaff'}"/><path d="M44 166L55 169 54 174 43 171Z" fill="${c.trim}"/><path d="M44 172Q38 179 44 183Q52 186 55 175" fill="url(#${id}-skin)"/></g>
    <g class="arm-r line"><path d="M110 129Q125 127 130 141L123 149 111 144Z" fill="${c.dress}"/><path d="M126 144Q132 158 134 170Q130 177 124 171L114 147Z" fill="url(#${id}-skin)"/><path d="M117 151L127 149 135 166 125 169Z" fill="${dark?'#45394e':'#fbfaff'}"/><path d="M124 169L136 166 137 171 125 174Z" fill="${c.trim}"/><path d="M125 175Q129 186 136 183Q143 179 136 172" fill="url(#${id}-skin)"/></g>
    <g class="line">
      <path d="M77 113L100 113 103 130 77 131Z" fill="url(#${id}-skin)"/>
      <path d="M65 132L77 123 89 132 102 123 114 132 109 151 120 180Q89 198 58 180L70 151Z" fill="url(#${id}-cloth)"/>
      <path d="M64 169L58 181 62 187 68 184 73 190 81 187 89 193 97 187 105 190 111 184 118 187 122 181 115 169Z" fill="${dark?'#aaa2bb':'#fffdfd'}"/>
      <path d="M70 150Q89 159 109 150L120 179 105 183 90 178 73 184 59 179Z" fill="url(#${id}-cloth)"/>
      <path d="M77 156L72 179M89 158L90 176M101 156L107 179" stroke="${c.trim}" fill="none" opacity=".7"/>
      <path d="M74 130L89 138 105 130 101 151Q90 157 78 151Z" fill="${dark?'#282739':'#3d405b'}"/>
      <path d="M78 136L99 145M99 136L79 145M79 145L98 150M99 145L80 150" stroke="${c.trim}" fill="none" stroke-width=".9"/>
      <path d="M75 123L89 132 78 140 67 131Z M102 123L89 132 101 140 113 131Z" fill="${dark?'#d5ccdf':'#fffdfd'}"/>
      <path d="M86 131Q73 117 72 132Q74 140 86 136M92 131Q106 117 107 132Q104 140 92 136" fill="${c.accent}"/>
      <path d="M89 130L94 135 89 140 84 135Z" fill="${dark?'#eab8c9':'#dfebff'}"/>
      <path d="M79 150L99 150 99 155 79 155Z" fill="${c.trim}"/>
      <path d="M89 148L94 153 89 158 84 153Z" fill="${dark?'#f4b6c5':'#eef5ff'}"/>
    </g>
    <g class="head">
      <path class="line" d="M37 91Q23 72 33 44Q40 14 84 17Q128 13 143 44Q155 69 140 96L151 115 134 112 129 126 115 116 55 116 43 127 42 112 27 114Z" fill="url(#${id}-hair)"/>
      <path class="line" d="M44 69Q32 62 33 79Q33 90 45 89M129 69Q143 61 143 78Q143 90 131 89" fill="url(#${id}-skin)"/>
      <path class="line" d="M44 51Q87 30 130 52L133 83Q133 108 89 120Q47 112 42 87Z" fill="url(#${id}-skin)"/>
      ${cheeks}
      <g class="face-state face-neutral">${open}${mouths.smile}</g>
      <g class="face-state face-happy">${closed}${mouths.happy}</g>
      <g class="face-state face-shy">${closed}<path d="M48 98L46 103M53 99L51 104M58 99L56 104M116 99L114 104M121 99L119 104M126 98L124 103" stroke="#e397ad" stroke-width="1"/>${mouths.small}</g>
      <g class="face-state face-surprised">${open}<ellipse cx="87" cy="103" rx="4" ry="5" fill="#ad7589"/><path d="M54 68Q64 63 74 68M98 68Q108 63 118 68" fill="none" class="fine"/></g>
      <g class="face-state face-pout">${open}<path d="M54 71L74 75M99 75L117 71" class="line" fill="none"/><path d="M80 104Q88 100 95 104" fill="none" class="line"/><ellipse cx="48" cy="100" rx="6" ry="4" fill="#ee9db3" opacity=".55"/></g>
      <g class="face-state face-sleepy"><path d="M55 84Q65 91 75 84M98 84Q108 91 118 84" class="line" fill="none"/><ellipse cx="87" cy="103" rx="2.5" ry="1.5" fill="#c68e9b"/></g>
      <g class="face-state face-dizzy"><path d="M58 78L72 91M72 78L58 91M101 78L115 91M115 78L101 91M79 103Q83 98 87 103T95 103" fill="none" class="line"/></g>
      <g class="face-state face-curious">${open}<path d="M54 68L72 68M99 70L117 66" class="fine" fill="none"/><ellipse cx="88" cy="103" rx="3" ry="2" fill="#c18599"/></g>
      <g class="face-state face-smug">${open}<path d="M54 77L75 79M98 79L118 77" fill="none" stroke="${c.outline}" stroke-width="2"/><path d="M80 102Q89 107 96 99" fill="none" class="line"/></g>
      <g class="line" fill="url(#${id}-hair)">
        <path d="M39 75Q27 41 57 25Q81 13 103 22Q137 21 142 52L135 99 124 107Q132 74 115 58L115 78 102 66 97 76 83 48Q82 65 69 76L65 63Q59 78 44 83L45 102 37 94Z"/>
        <path d="M40 77Q47 87 47 107L58 119Q37 119 35 97Z"/>
        <path d="M129 80Q127 96 121 108L120 119Q142 114 140 90Z"/>
      </g>
      <path d="M47 49Q53 32 71 32M78 28Q94 23 110 32M116 37Q128 41 132 55" fill="none" stroke="${c.tip}" stroke-width="4" opacity=".45" stroke-linecap="round"/>
      <path d="M51 56L58 45M70 48L75 35M114 55L109 40" fill="none" stroke="#e4dbff" stroke-width="1.6" opacity=".35"/>
      <path d="M81 19Q71 5 87 9Q98 11 100 19M96 18Q105 3 116 10" class="line" fill="none"/>
      <g transform="translate(41 38) rotate(-19)" class="line">
        <path d="M0 3Q-26-22-21-2Q-19 10-4 10Q-21 25-10 24Q2 23 4 7Q19 22 25 12Q31 2 7 3Q30-17 13-13Q4-11 0 3Z" fill="${dark?'#312837':'#c1d2ff'}"/>
        <path d="M-12 18L-18 42-6 35 0 48 6 18M8 15L20 35 24 27 33 30 22 10" fill="${c.ribbon}"/>
        ${dark?`<path d="M-7-3Q-2-12 5-7Q16-9 14 1Q21 9 11 13Q5 22-2 13Q-14 16-12 6Q-18-1-7-3Z" fill="#b75477"/><path d="M-5 1Q7-8 10 3Q14 13 2 12Q-8 11-5 1Z" fill="#d57a93"/><path d="M-2 4Q7-2 8 6Q6 12 1 7Z" fill="#8c3d61"/>`:`<path d="M0 2Q-14-17-14-6Q-14 5-1 7Q-18 12-9 17Q0 20 4 9Q12 24 16 14Q17 7 6 5Q19-5 10-8Q3-7 0 2Z" fill="#f5f4ff"/><circle cx="3" cy="6" r="3" fill="#b5c6fb"/>`}
      </g>
    </g></svg>`;
  }

  let width=innerWidth,height=innerHeight,floor=height-8,time=0,paused=false,accumulator=0,last=0;
  let nextSocial=5,social=null,socialCount=0;
  const particles=[];
  const pets=colors.map((c,i)=>{
    const el=document.createElement('div');
    el.className='pet';el.tabIndex=0;el.setAttribute('role','button');
    el.setAttribute('aria-label',c.name+'：点击互动，拖动抛出');el.setAttribute('aria-describedby','instructions');
    el.style.setProperty('--accent',c.accent);el.style.setProperty('--outline',c.outline);el.style.setProperty('--bubble-border',c.accent+'55');
    el.dataset.face='neutral';el.dataset.mode='idle';
    el.innerHTML=`<div class="figure">${doll(c)}</div><div class="bubble" aria-hidden="true"></div>`;
    const shadow=document.createElement('div');shadow.className='shadow';shadow.setAttribute('aria-hidden','true');
    world.append(shadow,el);
    return {i,c,el,shadow,figure:el.querySelector('.figure'),bubble:el.querySelector('.bubble'),x:width*(i?.64:.36),y:floor,vx:0,vy:0,w:140,h:181,dir:i?-1:1,ground:true,mode:'idle',face:'neutral',faceEnd:0,talkEnd:0,decision:1+i,rest:0,blinkAt:rand(1,4),blinkEnd:0,phase:rand(0,6),squash:0,rotation:0,grab:null,clicks:0};
  });
  function say(p,text,seconds=2.4){p.bubble.textContent=text;p.talkEnd=time+seconds;p.el.classList.add('talking');}
  function mood(p,face,seconds=2){p.face=face;p.faceEnd=time+seconds;p.el.dataset.face=face;}
  function mode(p,value){p.mode=value;p.el.dataset.mode=value;}
  function particle(x,y,color,type='heart',count=4){
    if(reduced&&type!=='word')count=Math.min(count,1);
    for(let i=0;i<count&&particles.length<CONFIG.maxParticles;i++){
      const el=document.createElement('span');el.className='effect';el.style.color=color;
      const symbols={heart:'<path d="M8 14C-8 4 2-5 8 3 14-5 24 4 8 14Z" fill="currentColor"/>',star:'<path d="M8 0L10 5 16 8 10 10 8 16 6 10 0 8 6 6Z" fill="currentColor"/>',butterfly:'<path d="M8 8C-7-9-2 15 7 10-5 13 6 22 8 11 10 22 21 13 9 10 18 15 23-9 8 8Z" fill="currentColor"/>'};
      if(type==='sleep'){el.classList.add('word');el.textContent='z';}else el.innerHTML=`<svg viewBox="0 0 16 18">${symbols[type]||symbols.star}</svg>`;
      fxRoot.append(el);particles.push({el,x:x+rand(-15,15),y:y+rand(-5,5),vx:rand(-55,55),vy:rand(-95,-40),life:rand(.9,1.8),age:0,spin:rand(-.6,.6),type});
    }
  }
  function size(){
    const old=floor;width=world.clientWidth;height=world.clientHeight;
    // env() is resolved by CSS, including iPhone's home-indicator safe area.
    const probe=document.createElement('div');probe.style.cssText='padding-bottom:env(safe-area-inset-bottom,0px)';world.append(probe);
    floor=height-8-(parseFloat(getComputedStyle(probe).paddingBottom)||0);probe.remove();
    for(const p of pets){
      p.w=Math.min(144,width*.28,height*.40);p.h=p.w*232/180;
      p.el.style.setProperty('--w',p.w+'px');p.el.style.setProperty('--h',p.h+'px');
      p.x=clamp(p.x,p.w*.5,width-p.w*.5);p.y=p.ground?floor:clamp(p.y+(floor-old),p.h+2,floor);
      if(p.grab)release(p,null,true);
    }
  }
  size();addEventListener('resize',size);visualViewport?.addEventListener('resize',size);

  function react(p){
    p.clicks++;p.rest=time+2.4;p.vx=0;
    const lines=p.i?['哼…才没有很开心。','别、别揉我的头！','再陪一会儿也不是不行。','我会看着你的。']:['诶嘿，谢谢你。','今天也一起玩吧。','希儿在这里哦。','摸摸头…很暖和呢。'];
    mood(p,p.i?(p.clicks%2?'pout':'shy'):(p.clicks%2?'happy':'shy'),2.6);
    say(p,lines[(p.clicks-1)%lines.length]);
    particle(p.x,p.y-p.h*.72,p.c.accent,p.i?'star':'heart',5);
    if(p.ground&&!reduced){p.vy=-235;p.ground=false;mode(p,'hop');}
    announcer.textContent=p.c.name+'回应了你的点击。';
  }
  function interruptSocial(){
    if(!social)return;social=null;nextSocial=time+8;
    for(const p of pets){p.rest=time+.7;p.decision=time+1;}
  }
  function release(p,e,cancel=false){
    const g=p.grab;if(!g||e&&e.pointerId!==g.id)return;
    if(e&&!cancel)track(p,e);
    p.grab=null;
    if(p.el.hasPointerCapture(g.id))p.el.releasePointerCapture(g.id);
    if(!g.moved&&!cancel){mode(p,'idle');react(p);return;}
    let vx=0,vy=0;
    if(!cancel){
      const now=performance.now(),samples=g.samples.filter(s=>now-s.t<=110);
      if(samples.length>1){
        const first=samples[0],latest=samples.at(-1),dt=(latest.t-first.t)/1000;
        if(dt>.008){vx=(latest.x-first.x)/dt;vy=(latest.y-first.y)/dt;}
      }
    }
    const speed=Math.hypot(vx,vy),scale=speed?Math.min(1,CONFIG.maxThrow/speed):1;
    p.vx=vx*scale;p.vy=vy*scale;p.ground=false;p.rest=time+1;mode(p,'fall');
    mood(p,speed>650?'surprised':'curious',1.5);
    if(!cancel&&speed>650)say(p,p.i?'喂——接住我！':'哇、飞起来了！',1.4);
  }
  function track(p,e){
    const g=p.grab;if(!g||g.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-g.startX,e.clientY-g.startY)>6)g.moved=true;
    const stamp=performance.now();g.samples.push({x:e.clientX,y:e.clientY,t:stamp});
    g.samples=g.samples.filter(s=>stamp-s.t<160);
    if(!g.moved)return;
    p.x=clamp(e.clientX-g.offsetX,p.w*.5,width-p.w*.5);
    p.y=clamp(e.clientY-g.offsetY,p.h+2,floor);p.vx=p.vy=0;p.ground=false;
    p.rotation=clamp((e.clientX-g.lastX)*.7,-20,20);g.lastX=e.clientX;
  }
  for(const p of pets){
    p.el.addEventListener('pointerdown',e=>{
      if(e.button!==0||p.grab)return;e.preventDefault();interruptSocial();
      p.el.classList.add('pointer-focused');p.el.focus({preventScroll:true});
      p.grab={id:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,offsetX:e.clientX-p.x,offsetY:e.clientY-p.y,moved:false,samples:[{x:e.clientX,y:e.clientY,t:performance.now()}]};
      p.el.setPointerCapture(e.pointerId);p.vx=p.vy=0;mode(p,'held');mood(p,p.i?'pout':'surprised',10);
    });
    p.el.addEventListener('pointermove',e=>track(p,e));
    p.el.addEventListener('pointerup',e=>release(p,e));
    p.el.addEventListener('pointercancel',e=>release(p,e,true));
    p.el.addEventListener('lostpointercapture',e=>{if(p.grab)release(p,e,true);});
    p.el.addEventListener('contextmenu',e=>e.preventDefault());
    p.el.addEventListener('keydown',e=>{
      if([' ','Enter','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
      if(e.repeat||p.grab)return;
      if(e.key===' '||e.key==='Enter')react(p);
      if(e.key==='ArrowUp'){interruptSocial();p.vy=-650;p.ground=false;mode(p,'hop');mood(p,'happy');}
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){interruptSocial();p.dir=e.key==='ArrowLeft'?-1:1;p.x=clamp(p.x+p.dir*24,p.w*.5,width-p.w*.5);p.decision=time+1;}
    });
  }
  addEventListener('blur',()=>pets.forEach(p=>release(p,null,true)));
  addEventListener('keydown',e=>{
    if(e.key==='Tab')pets.forEach(p=>p.el.classList.remove('pointer-focused'));
    if(e.key==='Escape')pets.forEach(p=>release(p,null,true));
    if(e.key.toLowerCase()==='p'){paused=!paused;announcer.textContent=paused?'已暂停':'已恢复';}
    if(e.key.toLowerCase()==='r'){
      interruptSocial();pets.forEach((p,i)=>{release(p,null,true);p.x=width*(i?.64:.36);p.y=floor;p.vx=p.vy=p.rotation=0;p.ground=true;p.rest=time+.5;mode(p,'idle');mood(p,'happy');});
      announcer.textContent='两位小伙伴回到底部了。';
    }
  });

  function startSocial(){
    const kind=['greet','nuzzle','dance','chase'][socialCount++%4];
    social={kind,start:time,end:time+(kind==='chase'?5:3.4),mid:(pets[0].x+pets[1].x)/2};nextSocial=time+14;
    pets.forEach(p=>{p.vx=0;p.rest=time+3.4;mode(p,'social');});
    if(kind==='greet'){say(pets[0],'找到你啦！');say(pets[1],'我一直都在。');mood(pets[0],'happy',4);mood(pets[1],'shy',4);}
    if(kind==='nuzzle'){say(pets[0],'靠近一点点…');say(pets[1],'嗯，别走远。');pets.forEach(p=>mood(p,'shy',4));}
    if(kind==='dance'){say(pets[0],'一起转个圈吧！');say(pets[1],'只陪你这一次。');pets.forEach(p=>mood(p,'happy',4));}
    if(kind==='chase'){say(pets[0],'来追希儿呀～');say(pets[1],'抓到就不许跑了。');mood(pets[0],'happy',5);mood(pets[1],'smug',5);}
    particle(social.mid,floor-pets[0].h*.85,'#bb93cb',kind==='dance'?'butterfly':'heart',6);
  }
  function socialTick(dt){
    if(!social)return;
    if(time>=social.end){social=null;pets.forEach(p=>{p.rest=time+.3;p.decision=time+rand(1.2,2.5);p.dir=p.x<width/2?-1:1;p.vx=p.dir*32;mode(p,'walk');});return;}
    const s=social,t=time-s.start,a=pets[0],b=pets[1];
    if(s.kind==='chase'){
      const lead=a.x<b.x?-1:1;a.dir=lead;b.dir=Math.sign(a.x-b.x)||1;
      if(a.x<a.w*.6)a.dir=1;if(a.x>width-a.w*.6)a.dir=-1;
      a.vx=a.dir*85;b.vx=b.dir*69;a.rest=b.rest=time+1;
    }else{
      const distance=a.w*(s.kind==='nuzzle'?.52:.73);
      const left=a.x<=b.x?a:b,right=left===a?b:a;
      const mid=clamp(s.mid,distance/2+a.w*.5,width-distance/2-a.w*.5);
      left.x+=(mid-distance/2-left.x)*Math.min(1,dt*5);right.x+=(mid+distance/2-right.x)*Math.min(1,dt*5);
      left.dir=1;right.dir=-1;a.vx=b.vx=0;
      if(s.kind==='dance'&&!reduced){for(const p of pets)if(p.ground&&Math.sin(t*5+p.i*.5)>.93){p.vy=-195;p.ground=false;}}
    }
  }
  function think(p){
    if(time<p.decision||time<p.rest||!p.ground||p.grab||social)return;
    p.decision=time+rand(3,6);
    if(reduced){p.vx=0;mode(p,'idle');return;}
    const r=time<3?.2:Math.random();
    if(r<.67){
      const other=pets[1-p.i];p.dir=time<3||Math.random()<.45&&time>nextSocial?Math.sign(other.x-p.x)||1:(Math.random()<.5?-1:1);
      p.vx=p.dir*rand(25,48);mode(p,'walk');mood(p,choose(['neutral','happy','curious']),1.5);
    }else if(r<.85){p.vx=0;mode(p,'idle');mood(p,'curious',3);if(Math.random()<.35)say(p,p.i?'在看什么？':'这里好安静呀。');}
    else{p.vx=0;mode(p,'sleep');mood(p,'sleepy',4);p.decision=time+4;particle(p.x+15,p.y-p.h*.9,p.c.accent,'sleep',1);}
  }
  function tick(dt){
    time+=dt;
    socialTick(dt);
    for(const p of pets){
      if(p.talkEnd<time)p.el.classList.remove('talking');
      if(p.faceEnd<time&&p.face!=='neutral'&&!p.grab)mood(p,'neutral',99);
      if(time>p.blinkAt){p.blinkEnd=time+.13;p.blinkAt=time+rand(2.3,5.5);}
      p.el.classList.toggle('blink',time<p.blinkEnd);
      if(p.grab)continue;
      think(p);
      if(p.ground)p.vy=0;
      if(!p.ground){p.vy+=CONFIG.gravity*dt;p.vx*=Math.exp(-.23*dt);}
      else if(p.mode==='fall'||time<p.rest&&!social)p.vx*=Math.exp(-8*dt);
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      const lo=p.w*.5+2,hi=width-p.w*.5-2;
      if(p.x<lo||p.x>hi){p.x=clamp(p.x,lo,hi);p.vx=-p.vx*(p.ground?1:CONFIG.wallBounce);p.dir=p.x<=lo?1:-1;if(!p.ground)mood(p,'surprised',.5);}
      if(p.y<p.h+2){p.y=p.h+2;p.vy=Math.abs(p.vy)*.4;}
      if(p.y>=floor){
        p.y=floor;
        if(!p.ground){const impact=p.vy;p.squash=Math.min(.18,impact/6500);
          if(impact>430){p.vy=-impact*CONFIG.bounce;p.ground=false;mode(p,'fall');mood(p,impact>1150?'dizzy':'surprised',impact>1150?2:.7);if(impact>850)particle(p.x,floor-8,p.c.accent,'star',4);}
          else{p.vy=0;p.ground=true;p.rest=time+.6;p.decision=Math.max(p.decision,time+1);mode(p,social?'social':'idle');}
        }
      }
      if(p.ground&&p.mode==='idle')p.vx*=Math.exp(-10*dt);
      p.rotation+=(0-p.rotation)*Math.min(1,dt*6);p.squash*=Math.exp(-9*dt);
      if(Math.abs(p.vx)>10)p.dir=Math.sign(p.vx);
    }
    const a=pets[0],b=pets[1],dx=b.x-a.x,dy=(b.y-b.h*.45)-(a.y-a.h*.45);
    if(!a.grab&&!b.grab&&!social){
      if(a.ground&&b.ground&&Math.abs(dx)<a.w*.9&&time>nextSocial)startSocial();
      else if((!a.ground||!b.ground)&&Math.hypot(dx,dy)<a.w*.55){
        const d=Math.hypot(dx,dy)||1,nx=dx/d||1,ny=dy/d,overlap=a.w*.55-d;
        a.x-=nx*overlap*.5;b.x+=nx*overlap*.5;a.y-=ny*overlap*.5;b.y+=ny*overlap*.5;
        const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(relative<0){const impulse=-relative*.65;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;mood(a,'surprised',.7);mood(b,'pout',.7);}
        for(const q of pets){if(q.vy< -15||q.y<floor-.5){q.ground=false;mode(q,'fall');}else if(q.ground){q.y=floor;q.vy=0;}}
      }
    }
    for(let i=particles.length-1;i>=0;i--){const f=particles[i];f.age+=dt;if(f.age>f.life){f.el.remove();particles.splice(i,1);continue;}f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=20*dt;}
  }
  function render(){
    for(const p of pets){
      const moving=p.ground&&Math.abs(p.vx)>9&&!p.grab;const cycle=time*(social?.kind==='chase'?14:9)+p.phase;
      const walk=moving&&!reduced?Math.sin(cycle):0;
      let ll=walk*19,lr=-ll,al=-walk*14,ar=walk*14,head=p.face==='curious'?Math.sin(time*1.4)*5:Math.sin(time*1.5+p.i)*1.6;
      let bob=moving?-Math.abs(Math.sin(cycle))*2:Math.sin(time*2+p.i)*.65,rot=p.rotation;
      if(p.grab){al=-40;ar=40;ll=Math.sin(time*12)*10;lr=-ll;head=-4;}
      else if(!p.ground){al=-53;ar=53;ll=-9;lr=12;rot+=clamp(p.vx*.025,-24,24);bob=0;}
      if(p.face==='sleepy'){head=8;al=8;ar=-8;}
      if(social&&!p.grab){
        const s=social.kind;if(s==='greet'){al=-45+Math.sin(time*9)*15;ar=10;}
        if(s==='nuzzle'){head=p.dir*9;al=-15;ar=15;}
        if(s==='dance'){al=-55;ar=55;rot=Math.sin(time*5+p.i)*9;}
      }
      if(reduced&&!p.grab){head=0;bob=0;}
      p.el.style.transform=`translate3d(${(p.x-p.w/2).toFixed(2)}px,${(p.y-p.h).toFixed(2)}px,0)`;
      p.figure.style.transform=`translateY(${bob.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${p.dir<0?-1:1},1) scale(${1+p.squash},${1-p.squash})`;
      for(const [key,v] of Object.entries({ll,lr,al,ar,head,ribbon:walk*5+Math.sin(time*2.4)*2}))p.el.style.setProperty('--'+key,v.toFixed(1)+'deg');
      const elevation=Math.max(0,floor-p.y),scale=clamp(1-elevation/650,.25,1);
      p.shadow.style.width=p.w*.53+'px';p.shadow.style.transform=`translate3d(${p.x-p.w*.265}px,${floor-3}px,0) scale(${scale},${scale})`;p.shadow.style.opacity=clamp(1-elevation/750,.15,1);
      const bubbleX=clamp(p.x,110,width-110)-p.x;p.bubble.style.marginLeft=bubbleX+'px';
      p.bubble.style.bottom=`calc(100% - 4px + ${Math.abs(p.x-pets[1-p.i].x)<110&&p.i?36:0}px)`;
    }
    for(const f of particles){const ratio=f.age/f.life;f.el.style.transform=`translate3d(${f.x}px,${f.y}px,0) rotate(${f.spin*f.age*80}deg) scale(${Math.sin(Math.min(1,ratio*3)*Math.PI/2)})`;f.el.style.opacity=Math.min(1,(1-ratio)*3);}
  }
  function frame(stamp){
    const dt=last?Math.min(.05,(stamp-last)/1000):0;last=stamp;
    if(!paused&&!document.hidden){accumulator+=dt;while(accumulator>=CONFIG.step){tick(CONFIG.step);accumulator-=CONFIG.step;}}
    render();requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;if(document.hidden)pets.forEach(p=>release(p,null,true));});
  // Inspection is opt-in and read-only; no debug controls or telemetry on the normal page.
  if(new URLSearchParams(location.search).has('debug'))Object.defineProperty(window,'petDebug',{value:()=>({time,paused,social:social?.kind||null,particles:particles.length,pets:pets.map(p=>({id:p.c.id,x:p.x,y:p.y,vx:p.vx,vy:p.vy,ground:p.ground,mode:p.mode,face:p.face,held:!!p.grab,w:p.w,h:p.h})),width,height,floor}),writable:false});
  render();requestAnimationFrame(frame);
})();
