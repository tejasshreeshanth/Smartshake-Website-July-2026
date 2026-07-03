'use strict';

/* Cursor */
(function(){
const dot=document.getElementById('cDot'),ring=document.getElementById('cRing');
if(!dot||!ring)return;
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px)`;});
(function loop(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop);})();
document.querySelectorAll('a,button,[role="button"],.model-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('c-hover'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('c-hover'));
});
})();

/* Navbar scroll */
(function(){
const nav=document.getElementById('nav');
let t=false;
window.addEventListener('scroll',()=>{
    if(t)return;t=true;
    requestAnimationFrame(()=>{nav.classList.toggle('scrolled',window.scrollY>40);t=false;});
},{passive:true});
})();

/* Scroll reveal */
(function(){
const obs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const siblings=[...entry.target.parentElement.querySelectorAll('.reveal:not(.vis)')];
    const idx=siblings.indexOf(entry.target);
    setTimeout(()=>entry.target.classList.add('vis'),Math.min(idx*80,280));
    obs.unobserve(entry.target);
    });
},{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
})();

document.querySelectorAll(".spec-toggle").forEach(btn => {

    const panel = document.getElementById(
        btn.getAttribute("aria-controls")
    );

    const layout = btn.closest(".spec-layout");

    const rows = panel.querySelectorAll(".tech-row");

    rows.forEach((row,i)=>{
        row.style.transitionDelay = `${i*40}ms`;
    });

    btn.addEventListener("click",()=>{

        const open = btn.getAttribute("aria-expanded")==="true";

        btn.setAttribute("aria-expanded", !open);

        layout.classList.toggle("open");
        panel.classList.toggle("open");

        btn.childNodes[0].textContent =
            open ? "Technical Specs " : "Hide Specs ";

        if(!open){
            panel.scrollIntoView({
                behavior:"smooth",
                block:"nearest"
            });
        }

    });

});
