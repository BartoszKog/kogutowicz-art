(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=o(r);fetch(r.href,n)}})();console.log("Portfolio artystyczne załadowane!");let f=[],E=[],k=[],l={};function $(){return window.location.hostname.includes("github.io")?"/kogutowicz-art":""}function p(e){const t=$(),o=window.location.pathname,i=e.startsWith("/")?e.substring(1):e;return o.includes("/pages/")||o.includes("/gallery.html")||o.includes("/about.html")||o.includes("/shop.html")?t?`${t}/${i}`:`../../${i}`:`${t}/${i}`}async function P(){try{const e=$(),t=window.location.pathname;let o=e;t.includes("/pages/")&&!e&&(o="../.."),f=await(await fetch(`${o}/src/data/json/gallery.json`)).json(),E=await(await fetch(`${o}/src/data/json/featured.json`)).json(),k=await(await fetch(`${o}/src/data/json/shop.json`)).json(),l=await(await fetch(`${o}/src/data/json/about.json`)).json(),T()}catch(e){console.error("Błąd podczas ładowania danych:",e)}}function j(){const e=document.querySelector(".featured-artworks");e&&(e.innerHTML="",E.forEach(t=>{const o=document.createElement("div");o.className="bg-white rounded shadow-md overflow-hidden";const i=p(t.image);o.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${i}" alt="${t.title||"Obraz"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title||"Bez tytułu"}</h3>
        ${t.description?`<p class="text-gray-600">${t.description}</p>`:""}
      </div>
    `,e.appendChild(o)}))}function y(e=f){const t=document.querySelector(".gallery-artworks");t&&(t.innerHTML="",e.forEach((o,i)=>{const r=document.createElement("div");r.className="bg-white rounded shadow-md overflow-hidden",r.setAttribute("data-artwork-index",i);const n=p(o.image);r.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${n}" alt="${o.title||"Obraz"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${o.title||"Bez tytułu"}</h3>
        ${o.technique||o.dimensions||o.year?`<p class="text-gray-600">${[o.technique,o.dimensions,o.year].filter(Boolean).join(", ")}</p>`:""}
        ${o.description?`<p class="text-sm mt-2">${o.description}</p>`:""}
        <p class="mt-2 ${o.available?"text-green-600":"text-gray-400"}">
          ${o.available?"Dostępny":"Niedostępny"}
        </p>
      </div>
    `,r.addEventListener("click",()=>{I(i,e)}),t.appendChild(r)}))}function q(){const e=document.querySelector(".shop-products");e&&(e.innerHTML="",k.forEach(t=>{const o=document.createElement("div");o.className="bg-white rounded shadow-md overflow-hidden";const i=p(t.image),r=t.available!==!1,n=r?"shop-purchase-button bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 inline-block font-semibold transition-all duration-300 transform":"bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed inline-block",s=r?"Przejdź do zakupu":"Niedostępne",a=r?`href="${t.purchaseUrl}" target="_blank" rel="noopener noreferrer"`:'onclick="return false;"';o.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${i}" alt="${t.title||"Produkt"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title||"Bez tytułu"}</h3>
        ${t.description?`<p class="text-gray-600">${t.description}</p>`:""}
        ${t.price?`<p class="text-purple-600 font-bold mt-2">${t.price} zł</p>`:""}        <div class="mt-4 flex items-center justify-between">
          <a ${a} class="${n}">
            ${s}
          </a>
          ${r?"":'<span class="text-gray-400 font-semibold text-sm">Sprzedane</span>'}
        </div>
      </div>
    `,e.appendChild(o)}))}function B(e){if(!e)return f;const t=e.toLowerCase();return f.filter(o=>o.categories&&Array.isArray(o.categories)&&o.categories.some(i=>i&&i.toLowerCase()===t))}function H(){const e=document.querySelector(".category-filters");if(!e)return;e.className="category-filters loading";const t=new Map;f.forEach(n=>{n.categories&&Array.isArray(n.categories)&&n.categories.forEach(s=>{s&&s.trim()&&t.set(s,(t.get(s)||0)+1)})});const o=Array.from(t.entries()).sort((n,s)=>s[1]-n[1]).map(n=>n[0]);e.innerHTML="";const i=document.createElement("button");i.className="category-chip category-chip-active",i.textContent=`Wszystkie (${f.length})`,i.setAttribute("data-category","wszystkie"),i.addEventListener("click",()=>{y(),r(i)}),e.appendChild(i),o.forEach(n=>{const s=t.get(n),a=document.createElement("button");a.className="category-chip category-chip-inactive",a.textContent=`${n} (${s})`,a.setAttribute("data-category",n),a.addEventListener("click",()=>{const d=B(n);y(d),r(a)}),e.appendChild(a)});function r(n){e.querySelectorAll(".category-chip").forEach(s=>{s.className="category-chip category-chip-inactive"}),n.className="category-chip category-chip-active"}r(i),setTimeout(()=>{e.classList.remove("loading")},300)}function N(){if(!document.querySelector(".about-artist-content"))return;const t=document.querySelector(".artist-photo"),o=document.querySelector(".artist-biography"),i=document.querySelector(".artist-education"),r=document.querySelector(".artist-achievements"),n=document.querySelector("h1");if(n&&(n.textContent=l.artistName||"O Artyście"),t&&l.artistPhoto){t.innerHTML=`
      <img src="${p(l.artistPhoto)}" alt="${l.artistName||"Artysta"}" 
           class="w-full h-full object-cover rounded">
    `,t.classList.add("has-image");const s=t.querySelector("img");s&&(s.onload=()=>{u&&u(),u=x()},s.complete&&(u&&u(),u=x()))}o&&l.biography&&Array.isArray(l.biography)&&l.biography.length>0&&(o.innerHTML="",l.biography.forEach(s=>{if(s&&s.trim()){const a=document.createElement("p");a.className="text-gray-700 mb-4";const d=s.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");a.innerHTML=d,o.appendChild(a)}})),i&&l.education&&Array.isArray(l.education)&&l.education.length>0&&(i.innerHTML="",l.education.forEach(s=>{if(s&&s.trim()){const a=document.createElement("li");a.className="list-disc list-inside text-gray-700";const d=s.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");a.innerHTML=d,i.appendChild(a)}})),r&&l.achievements&&Array.isArray(l.achievements)&&l.achievements.length>0&&(r.innerHTML="",l.achievements.forEach(s=>{if(s&&s.trim()){const a=document.createElement("li");a.className="list-disc list-inside text-gray-700";const d=s.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");a.innerHTML=d,r.appendChild(a)}}))}function T(){const e=window.location.pathname;e.includes("gallery.html")?(y(),H()):e.includes("shop.html")?q():e.includes("about.html")?N():j()}function O(){const e=document.getElementById("mobile-menu-button"),t=document.getElementById("mobile-menu");if(!e||!t)return;let o=!1;function i(){o=!o,o?(t.classList.remove("hidden"),e.setAttribute("aria-expanded","true"),e.setAttribute("aria-label","Zamknij menu"),e.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `,t.focus()):(t.classList.add("hidden"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-label","Otwórz menu"),e.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      `)}e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),i()}),e.addEventListener("keydown",n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),n.stopPropagation(),i())}),window.addEventListener("resize",()=>{window.innerWidth>=768&&o&&i()}),t.querySelectorAll("a").forEach(n=>{n.addEventListener("click",()=>{o&&i()})}),document.addEventListener("keydown",n=>{n.key==="Escape"&&o&&(i(),e.focus())}),document.addEventListener("click",n=>{o&&!t.contains(n.target)&&!e.contains(n.target)&&i()}),t.addEventListener("keydown",n=>{const s=t.querySelectorAll("a"),a=Array.from(s).indexOf(document.activeElement);if(n.key==="ArrowDown"){n.preventDefault();const d=a<s.length-1?a+1:0;s[d].focus()}else if(n.key==="ArrowUp"){n.preventDefault();const d=a>0?a-1:s.length-1;s[d].focus()}else n.key==="Home"?(n.preventDefault(),s[0].focus()):n.key==="End"&&(n.preventDefault(),s[s.length-1].focus())})}let c={isOpen:!1,currentIndex:0,artworks:[],overlay:null};function I(e,t){c.currentIndex=e,c.artworks=t,c.isOpen=!0,document.body.classList.add("focus-mode-open"),c.overlay||D(),b(),c.overlay.classList.add("active"),F()}function g(){c.isOpen&&(c.isOpen=!1,document.body.classList.remove("focus-mode-open"),c.overlay&&(c.overlay.classList.remove("active"),setTimeout(()=>{c.overlay&&!c.isOpen&&(c.overlay.remove(),c.overlay=null)},300)),W())}function D(){const e=document.createElement("div");e.className="focus-mode-overlay",e.innerHTML=`
    <button class="focus-close-button" aria-label="Zamknij tryb skupienia">
      <svg class="focus-close-icon" viewBox="0 0 24 24">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="focus-nav-button prev" aria-label="Poprzedni obraz">
      <svg class="focus-nav-icon" viewBox="0 0 24 24">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="focus-nav-button next" aria-label="Następny obraz">
      <svg class="focus-nav-icon" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div class="focus-mode-container">
      <img class="focus-mode-image" src="" alt="" />
      
      <div class="focus-mode-info">
        <h3 class="text-2xl font-bold mb-2"></h3>
        <div class="focus-mode-details"></div>
        <p class="focus-mode-description mt-3 text-gray-700"></p>
        <p class="focus-mode-availability mt-2"></p>
      </div>
    </div>
  `,document.body.appendChild(e),c.overlay=e;const t=e.querySelector(".focus-close-button"),o=e.querySelector(".focus-nav-button.prev"),i=e.querySelector(".focus-nav-button.next");t.addEventListener("click",g),o.addEventListener("click",()=>m("prev")),i.addEventListener("click",()=>m("next")),e.addEventListener("click",r=>{r.target===e&&g()})}function b(){if(!c.overlay)return;const e=c.artworks[c.currentIndex];if(!e)return;const t=c.overlay.querySelector(".focus-mode-image"),o=c.overlay.querySelector(".focus-mode-info h3"),i=c.overlay.querySelector(".focus-mode-details"),r=c.overlay.querySelector(".focus-mode-description"),n=c.overlay.querySelector(".focus-mode-availability");t.classList.add("loading");const s=p(e.image);t.src=s,t.alt=e.title||"Obraz",t.onload=()=>{t.classList.remove("loading")},o.textContent=e.title||"Bez tytułu";const a=[];e.technique&&a.push(e.technique),e.dimensions&&a.push(e.dimensions),e.year&&a.push(e.year),i.innerHTML=a.length>0?`<p class="text-gray-500">${a.join(" • ")}</p>`:"",r.textContent=e.description||"",r.style.display=e.description?"block":"none",n.innerHTML=`
    <span class="${e.available?"text-green-600":"text-gray-400"} font-semibold">
      ${e.available?"Dostępny":"Niedostępny"}
    </span>
  `,R()}function m(e){const t=c.artworks.length;e==="next"?c.currentIndex=(c.currentIndex+1)%t:e==="prev"&&(c.currentIndex=(c.currentIndex-1+t)%t),b()}function R(){if(!c.overlay)return;const e=c.overlay.querySelector(".focus-nav-button.prev"),t=c.overlay.querySelector(".focus-nav-button.next"),o=c.artworks.length>1;e.style.display=o?"flex":"none",t.style.display=o?"flex":"none"}let h,v;function F(){h=e=>{if(c.isOpen)switch(e.key){case"Escape":e.preventDefault(),g();break;case"ArrowLeft":e.preventDefault(),m("prev");break;case"ArrowRight":e.preventDefault(),m("next");break}},v=()=>{c.isOpen&&b()},document.addEventListener("keydown",h),window.addEventListener("resize",v)}function W(){h&&document.removeEventListener("keydown",h),v&&window.removeEventListener("resize",v)}document.addEventListener("DOMContentLoaded",()=>{P(),O()});window.addEventListener("beforeunload",()=>{u&&(u(),u=null)});function x(){const e=document.querySelector(".artist-photo");if(!e)return;const t=e.querySelector("img");if(!t)return;const o=3,i=1e3;function r(s){const a=e.getBoundingClientRect();a.left+a.width/2,a.top+a.height/2;const d=s.clientX,M=s.clientY,w=window.innerWidth/2,L=window.innerHeight/2,A=(d-w)/w,C=(M-L)/L,z=A*o,S=-C*o;t&&(t.style.transform=`
        perspective(${i}px)
        rotateX(${S}deg)
        rotateY(${z}deg)
        scale3d(1.02, 1.02, 1.02)
      `),e.classList.add("active")}function n(){t&&(t.style.transform=`
        perspective(${i}px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `),e.classList.remove("active")}return document.addEventListener("mousemove",r),document.addEventListener("mouseleave",n),document.addEventListener("touchstart",n),document.addEventListener("touchend",n),function(){document.removeEventListener("mousemove",r),document.removeEventListener("mouseleave",n),document.removeEventListener("touchstart",n),document.removeEventListener("touchend",n),n()}}let u=null;
