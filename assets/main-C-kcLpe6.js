(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function o(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=o(s);fetch(s.href,n)}})();console.log("Portfolio artystyczne załadowane!");let p=[],k=[],$=[],d={};function M(){return window.location.hostname.includes("github.io")?"/kogutowicz-art":""}function m(e){const t=M(),o=window.location.pathname,i=e.startsWith("/")?e.substring(1):e;return o.includes("/pages/")||o.includes("/gallery.html")||o.includes("/about.html")||o.includes("/shop.html")?t?`${t}/${i}`:`../../${i}`:`${t}/${i}`}async function q(){try{const e=M(),t=window.location.pathname;let o=e;t.includes("/pages/")&&!e&&(o="../.."),p=await(await fetch(`${o}/src/data/json/gallery.json`)).json(),k=await(await fetch(`${o}/src/data/json/featured.json`)).json(),$=await(await fetch(`${o}/src/data/json/shop.json`)).json(),d=await(await fetch(`${o}/src/data/json/about.json`)).json(),T()}catch(e){console.error("Błąd podczas ładowania danych:",e)}}function P(){const e=document.querySelector(".featured-artworks");e&&(e.innerHTML="",k.forEach(t=>{const o=document.createElement("div");o.className="bg-white rounded shadow-md overflow-hidden";const i=m(t.image);o.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${i}" alt="${t.title||"Obraz"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title||"Bez tytułu"}</h3>
        ${t.description?`<p class="text-gray-600">${t.description}</p>`:""}
      </div>
    `,e.appendChild(o)}))}function g(e=p){const t=document.querySelector(".gallery-artworks");t&&(t.innerHTML="",e.forEach((o,i)=>{const s=document.createElement("div");s.className="bg-white rounded shadow-md overflow-hidden",s.setAttribute("data-artwork-index",i);const n=m(o.image);s.innerHTML=`
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
    `,s.addEventListener("click",()=>{I(i,e)}),t.appendChild(s)}))}function j(){const e=document.querySelector(".shop-products");e&&(e.innerHTML="",$.forEach(t=>{const o=document.createElement("div");o.className="bg-white rounded shadow-md overflow-hidden";const i=m(t.image),s=t.available!==!1,n=s?"shop-purchase-button bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 inline-block font-semibold transition-all duration-300 transform":"bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed inline-block",a=s?"Przejdź do zakupu":"Niedostępne",r=s?`href="${t.purchaseUrl}" target="_blank" rel="noopener noreferrer"`:'onclick="return false;"';o.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${i}" alt="${t.title||"Produkt"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title||"Bez tytułu"}</h3>
        ${t.description?`<p class="text-gray-600">${t.description}</p>`:""}
        ${t.price?`<p class="text-purple-600 font-bold mt-2">${t.price} zł</p>`:""}        <div class="mt-4 flex items-center justify-between">
          <a ${r} class="${n}">
            ${a}
          </a>
          ${s?"":'<span class="text-gray-400 font-semibold text-sm">Sprzedane</span>'}
        </div>
      </div>
    `,e.appendChild(o)}))}function B(e){if(!e)return p;const t=e.toLowerCase();return p.filter(o=>o.categories&&Array.isArray(o.categories)&&o.categories.some(i=>i&&i.toLowerCase()===t))}function H(){const e=document.querySelector(".category-filters");if(!e)return;e.className="category-filters loading";const t=new Map;p.forEach(n=>{n.categories&&Array.isArray(n.categories)&&n.categories.forEach(a=>{a&&a.trim()&&t.set(a,(t.get(a)||0)+1)})});const o=Array.from(t.entries()).sort((n,a)=>a[1]-n[1]).map(n=>n[0]);e.innerHTML="";const i=document.createElement("button");i.className="category-chip category-chip-active",i.textContent=`Wszystkie (${p.length})`,i.setAttribute("data-category","wszystkie"),i.addEventListener("click",()=>{g(),s(i)}),e.appendChild(i),o.forEach(n=>{const a=t.get(n),r=document.createElement("button");r.className="category-chip category-chip-inactive",r.textContent=`${n} (${a})`,r.setAttribute("data-category",n),r.addEventListener("click",()=>{const l=B(n);g(l),s(r)}),e.appendChild(r)});function s(n){e.querySelectorAll(".category-chip").forEach(a=>{a.className="category-chip category-chip-inactive"}),n.className="category-chip category-chip-active"}s(i),setTimeout(()=>{e.classList.remove("loading")},300)}function N(){if(!document.querySelector(".about-artist-content"))return;const t=document.querySelector(".artist-photo"),o=document.querySelector(".artist-biography"),i=document.querySelector(".artist-education"),s=document.querySelector(".artist-achievements"),n=document.querySelector(".artist-exhibitions"),a=document.querySelector("h1");if(a&&(a.textContent=d.artistName||"O Artyście"),t&&d.artistPhoto){t.innerHTML=`
      <img src="${m(d.artistPhoto)}" alt="${d.artistName||"Artysta"}" 
           class="w-full h-full object-cover rounded">
    `,t.classList.add("has-image");const r=t.querySelector("img");r&&(r.onload=()=>{f&&f(),f=E()},r.complete&&(f&&f(),f=E()))}o&&d.biography&&Array.isArray(d.biography)&&d.biography.length>0&&(o.innerHTML="",d.biography.forEach(r=>{if(r&&r.trim()){const l=document.createElement("p");l.className="text-gray-700 mb-4";const u=r.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");l.innerHTML=u,o.appendChild(l)}})),i&&d.education&&Array.isArray(d.education)&&d.education.length>0&&(i.innerHTML="",d.education.forEach(r=>{if(r&&r.trim()){const l=document.createElement("li");l.className="list-disc list-inside text-gray-700";const u=r.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");l.innerHTML=u,i.appendChild(l)}})),s&&d.achievements&&Array.isArray(d.achievements)&&d.achievements.length>0&&(s.innerHTML="",d.achievements.forEach(r=>{if(r&&r.trim()){const l=document.createElement("li");l.className="list-disc list-inside text-gray-700";const u=r.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");l.innerHTML=u,s.appendChild(l)}})),n&&d.exhibitions&&Array.isArray(d.exhibitions)&&d.exhibitions.length>0&&(n.innerHTML="",d.exhibitions.forEach(r=>{if(r&&r.trim()){const l=document.createElement("li");l.className="list-disc list-inside text-gray-700";const u=r.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");l.innerHTML=u,n.appendChild(l)}}))}function T(){const e=window.location.pathname;e.includes("gallery.html")?(g(),H()):e.includes("shop.html")?j():e.includes("about.html")?N():P()}function O(){const e=document.getElementById("mobile-menu-button"),t=document.getElementById("mobile-menu");if(!e||!t)return;let o=!1;function i(){o=!o,o?(t.classList.remove("hidden"),e.setAttribute("aria-expanded","true"),e.setAttribute("aria-label","Zamknij menu"),e.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `,t.focus()):(t.classList.add("hidden"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-label","Otwórz menu"),e.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      `)}e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),i()}),e.addEventListener("keydown",n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),n.stopPropagation(),i())}),window.addEventListener("resize",()=>{window.innerWidth>=768&&o&&i()}),t.querySelectorAll("a").forEach(n=>{n.addEventListener("click",()=>{o&&i()})}),document.addEventListener("keydown",n=>{n.key==="Escape"&&o&&(i(),e.focus())}),document.addEventListener("click",n=>{o&&!t.contains(n.target)&&!e.contains(n.target)&&i()}),t.addEventListener("keydown",n=>{const a=t.querySelectorAll("a"),r=Array.from(a).indexOf(document.activeElement);if(n.key==="ArrowDown"){n.preventDefault();const l=r<a.length-1?r+1:0;a[l].focus()}else if(n.key==="ArrowUp"){n.preventDefault();const l=r>0?r-1:a.length-1;a[l].focus()}else n.key==="Home"?(n.preventDefault(),a[0].focus()):n.key==="End"&&(n.preventDefault(),a[a.length-1].focus())})}let c={isOpen:!1,currentIndex:0,artworks:[],overlay:null};function I(e,t){c.currentIndex=e,c.artworks=t,c.isOpen=!0,document.body.classList.add("focus-mode-open"),c.overlay||D(),w(),c.overlay.classList.add("active"),F()}function b(){c.isOpen&&(c.isOpen=!1,document.body.classList.remove("focus-mode-open"),c.overlay&&(c.overlay.classList.remove("active"),setTimeout(()=>{c.overlay&&!c.isOpen&&(c.overlay.remove(),c.overlay=null)},300)),W())}function D(){const e=document.createElement("div");e.className="focus-mode-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),c.overlay=e;const t=e.querySelector(".focus-close-button"),o=e.querySelector(".focus-nav-button.prev"),i=e.querySelector(".focus-nav-button.next");t.addEventListener("click",b),o.addEventListener("click",()=>h("prev")),i.addEventListener("click",()=>h("next")),e.addEventListener("click",s=>{s.target===e&&b()})}function w(){if(!c.overlay)return;const e=c.artworks[c.currentIndex];if(!e)return;const t=c.overlay.querySelector(".focus-mode-image"),o=c.overlay.querySelector(".focus-mode-info h3"),i=c.overlay.querySelector(".focus-mode-details"),s=c.overlay.querySelector(".focus-mode-description"),n=c.overlay.querySelector(".focus-mode-availability");t.classList.add("loading");const a=m(e.image);t.src=a,t.alt=e.title||"Obraz",t.onload=()=>{t.classList.remove("loading")},o.textContent=e.title||"Bez tytułu";const r=[];e.technique&&r.push(e.technique),e.dimensions&&r.push(e.dimensions),e.year&&r.push(e.year),i.innerHTML=r.length>0?`<p class="text-gray-500">${r.join(" • ")}</p>`:"",s.textContent=e.description||"",s.style.display=e.description?"block":"none",n.innerHTML=`
    <span class="${e.available?"text-green-600":"text-gray-400"} font-semibold">
      ${e.available?"Dostępny":"Niedostępny"}
    </span>
  `,R()}function h(e){const t=c.artworks.length;e==="next"?c.currentIndex=(c.currentIndex+1)%t:e==="prev"&&(c.currentIndex=(c.currentIndex-1+t)%t),w()}function R(){if(!c.overlay)return;const e=c.overlay.querySelector(".focus-nav-button.prev"),t=c.overlay.querySelector(".focus-nav-button.next"),o=c.artworks.length>1;e.style.display=o?"flex":"none",t.style.display=o?"flex":"none"}let y,v;function F(){y=e=>{if(c.isOpen)switch(e.key){case"Escape":e.preventDefault(),b();break;case"ArrowLeft":e.preventDefault(),h("prev");break;case"ArrowRight":e.preventDefault(),h("next");break}},v=()=>{c.isOpen&&w()},document.addEventListener("keydown",y),window.addEventListener("resize",v)}function W(){y&&document.removeEventListener("keydown",y),v&&window.removeEventListener("resize",v)}document.addEventListener("DOMContentLoaded",()=>{q(),O()});window.addEventListener("beforeunload",()=>{f&&(f(),f=null)});function E(){const e=document.querySelector(".artist-photo");if(!e)return;const t=e.querySelector("img");if(!t)return;const o=3,i=1e3;function s(a){const r=e.getBoundingClientRect();r.left+r.width/2,r.top+r.height/2;const l=a.clientX,u=a.clientY,x=window.innerWidth/2,L=window.innerHeight/2,A=(l-x)/x,C=(u-L)/L,z=A*o,S=-C*o;t&&(t.style.transform=`
        perspective(${i}px)
        rotateX(${S}deg)
        rotateY(${z}deg)
        scale3d(1.02, 1.02, 1.02)
      `),e.classList.add("active")}function n(){t&&(t.style.transform=`
        perspective(${i}px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `),e.classList.remove("active")}return document.addEventListener("mousemove",s),document.addEventListener("mouseleave",n),document.addEventListener("touchstart",n),document.addEventListener("touchend",n),function(){document.removeEventListener("mousemove",s),document.removeEventListener("mouseleave",n),document.removeEventListener("touchstart",n),document.removeEventListener("touchend",n),n()}}let f=null;
