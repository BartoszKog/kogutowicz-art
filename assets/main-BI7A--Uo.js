(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function o(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(s){if(s.ep)return;s.ep=!0;const n=o(s);fetch(s.href,n)}})();console.log("Portfolio artystyczne załadowane!");let u=[],b=[],w=[],l={};function x(){return window.location.hostname.includes("github.io")?"/kogutowicz-art":""}function f(e){const t=x(),o=window.location.pathname,r=e.startsWith("/")?e.substring(1):e;return o.includes("/pages/")||o.includes("/gallery.html")||o.includes("/about.html")||o.includes("/shop.html")?t?`${t}/${r}`:`../../${r}`:`${t}/${r}`}async function L(){try{const e=x(),t=window.location.pathname;let o=e;t.includes("/pages/")&&!e&&(o="../.."),u=await(await fetch(`${o}/src/data/json/gallery.json`)).json(),b=await(await fetch(`${o}/src/data/json/featured.json`)).json(),w=await(await fetch(`${o}/src/data/json/shop.json`)).json(),l=await(await fetch(`${o}/src/data/json/about.json`)).json(),C()}catch(e){console.error("Błąd podczas ładowania danych:",e)}}function k(){const e=document.querySelector(".featured-artworks");e&&(e.innerHTML="",b.forEach(t=>{const o=document.createElement("div");o.className="bg-white rounded shadow-md overflow-hidden";const r=f(t.image);o.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${r}" alt="${t.title||"Obraz"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title||"Bez tytułu"}</h3>
        ${t.description?`<p class="text-gray-600">${t.description}</p>`:""}
      </div>
    `,e.appendChild(o)}))}function h(e=u){const t=document.querySelector(".gallery-artworks");t&&(t.innerHTML="",e.forEach((o,r)=>{const s=document.createElement("div");s.className="bg-white rounded shadow-md overflow-hidden",s.setAttribute("data-artwork-index",r);const n=f(o.image);s.innerHTML=`
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
    `,s.addEventListener("click",()=>{j(r,e)}),t.appendChild(s)}))}function E(){const e=document.querySelector(".shop-products");e&&(e.innerHTML="",w.forEach(t=>{const o=document.createElement("div");o.className="bg-white rounded shadow-md overflow-hidden";const r=f(t.image),s=t.available!==!1,n=s?"bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block":"bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed inline-block",i=s?"Przejdź do zakupu":"Niedostępne",c=s?`href="${t.purchaseUrl}" target="_blank" rel="noopener noreferrer"`:'onclick="return false;"';o.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${r}" alt="${t.title||"Produkt"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title||"Bez tytułu"}</h3>
        ${t.description?`<p class="text-gray-600">${t.description}</p>`:""}
        ${t.price?`<p class="text-purple-600 font-bold mt-2">${t.price} zł</p>`:""}
        <div class="mt-4 flex items-center justify-between">
          <a ${c} class="${n}">
            ${i}
          </a>
          ${s?"":'<span class="text-gray-400 font-semibold text-sm">Sprzedane</span>'}
        </div>
      </div>
    `,e.appendChild(o)}))}function M(e){if(!e)return u;const t=e.toLowerCase();return u.filter(o=>o.categories&&Array.isArray(o.categories)&&o.categories.some(r=>r&&r.toLowerCase()===t))}function $(){const e=document.querySelector(".category-filters");if(!e)return;e.className="category-filters loading";const t=new Map;u.forEach(n=>{n.categories&&Array.isArray(n.categories)&&n.categories.forEach(i=>{i&&i.trim()&&t.set(i,(t.get(i)||0)+1)})});const o=Array.from(t.entries()).sort((n,i)=>i[1]-n[1]).map(n=>n[0]);e.innerHTML="";const r=document.createElement("button");r.className="category-chip category-chip-active",r.textContent=`Wszystkie (${u.length})`,r.setAttribute("data-category","wszystkie"),r.addEventListener("click",()=>{h(),s(r)}),e.appendChild(r),o.forEach(n=>{const i=t.get(n),c=document.createElement("button");c.className="category-chip category-chip-inactive",c.textContent=`${n} (${i})`,c.setAttribute("data-category",n),c.addEventListener("click",()=>{const d=M(n);h(d),s(c)}),e.appendChild(c)});function s(n){e.querySelectorAll(".category-chip").forEach(i=>{i.className="category-chip category-chip-inactive"}),n.className="category-chip category-chip-active"}s(r),setTimeout(()=>{e.classList.remove("loading")},300)}function A(){if(!document.querySelector(".about-artist-content"))return;const t=document.querySelector(".artist-photo"),o=document.querySelector(".artist-biography"),r=document.querySelector(".artist-education"),s=document.querySelector(".artist-achievements"),n=document.querySelector("h1");n&&(n.textContent=l.artistName||"O Artyście"),t&&l.artistPhoto&&(t.innerHTML=`
      <img src="${f(l.artistPhoto)}" alt="${l.artistName||"Artysta"}" 
           class="w-full h-full object-cover rounded">
    `),o&&l.biography&&Array.isArray(l.biography)&&l.biography.length>0&&(o.innerHTML="",l.biography.forEach(i=>{if(i&&i.trim()){const c=document.createElement("p");c.className="text-gray-700 mb-4";const d=i.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");c.innerHTML=d,o.appendChild(c)}})),r&&l.education&&Array.isArray(l.education)&&l.education.length>0&&(r.innerHTML="",l.education.forEach(i=>{if(i&&i.trim()){const c=document.createElement("li");c.className="list-disc list-inside text-gray-700";const d=i.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");c.innerHTML=d,r.appendChild(c)}})),s&&l.achievements&&Array.isArray(l.achievements)&&l.achievements.length>0&&(s.innerHTML="",l.achievements.forEach(i=>{if(i&&i.trim()){const c=document.createElement("li");c.className="list-disc list-inside text-gray-700";const d=i.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");c.innerHTML=d,s.appendChild(c)}}))}function C(){const e=window.location.pathname;e.includes("gallery.html")?(h(),$()):e.includes("shop.html")?E():e.includes("about.html")?A():k()}function z(){const e=document.getElementById("mobile-menu-button"),t=document.getElementById("mobile-menu");if(!e||!t)return;let o=!1;function r(){o=!o,o?(t.classList.remove("hidden"),e.setAttribute("aria-expanded","true"),e.setAttribute("aria-label","Zamknij menu"),e.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `,t.focus()):(t.classList.add("hidden"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-label","Otwórz menu"),e.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      `)}e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),r()}),e.addEventListener("keydown",n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),n.stopPropagation(),r())}),window.addEventListener("resize",()=>{window.innerWidth>=768&&o&&r()}),t.querySelectorAll("a").forEach(n=>{n.addEventListener("click",()=>{o&&r()})}),document.addEventListener("keydown",n=>{n.key==="Escape"&&o&&(r(),e.focus())}),document.addEventListener("click",n=>{o&&!t.contains(n.target)&&!e.contains(n.target)&&r()}),t.addEventListener("keydown",n=>{const i=t.querySelectorAll("a"),c=Array.from(i).indexOf(document.activeElement);if(n.key==="ArrowDown"){n.preventDefault();const d=c<i.length-1?c+1:0;i[d].focus()}else if(n.key==="ArrowUp"){n.preventDefault();const d=c>0?c-1:i.length-1;i[d].focus()}else n.key==="Home"?(n.preventDefault(),i[0].focus()):n.key==="End"&&(n.preventDefault(),i[i.length-1].focus())})}let a={isOpen:!1,currentIndex:0,artworks:[],overlay:null};function j(e,t){a.currentIndex=e,a.artworks=t,a.isOpen=!0,document.body.classList.add("focus-mode-open"),a.overlay||S(),g(),a.overlay.classList.add("active"),q()}function v(){a.isOpen&&(a.isOpen=!1,document.body.classList.remove("focus-mode-open"),a.overlay&&(a.overlay.classList.remove("active"),setTimeout(()=>{a.overlay&&!a.isOpen&&(a.overlay.remove(),a.overlay=null)},300)),B())}function S(){const e=document.createElement("div");e.className="focus-mode-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),a.overlay=e;const t=e.querySelector(".focus-close-button"),o=e.querySelector(".focus-nav-button.prev"),r=e.querySelector(".focus-nav-button.next");t.addEventListener("click",v),o.addEventListener("click",()=>p("prev")),r.addEventListener("click",()=>p("next")),e.addEventListener("click",s=>{s.target===e&&v()})}function g(){if(!a.overlay)return;const e=a.artworks[a.currentIndex];if(!e)return;const t=a.overlay.querySelector(".focus-mode-image"),o=a.overlay.querySelector(".focus-mode-info h3"),r=a.overlay.querySelector(".focus-mode-details"),s=a.overlay.querySelector(".focus-mode-description"),n=a.overlay.querySelector(".focus-mode-availability");t.classList.add("loading");const i=f(e.image);t.src=i,t.alt=e.title||"Obraz",t.onload=()=>{t.classList.remove("loading")},o.textContent=e.title||"Bez tytułu";const c=[];e.technique&&c.push(e.technique),e.dimensions&&c.push(e.dimensions),e.year&&c.push(e.year),r.innerHTML=c.length>0?`<p class="text-gray-500">${c.join(" • ")}</p>`:"",s.textContent=e.description||"",s.style.display=e.description?"block":"none",n.innerHTML=`
    <span class="${e.available?"text-green-600":"text-gray-400"} font-semibold">
      ${e.available?"Dostępny":"Niedostępny"}
    </span>
  `,P()}function p(e){const t=a.artworks.length;e==="next"?a.currentIndex=(a.currentIndex+1)%t:e==="prev"&&(a.currentIndex=(a.currentIndex-1+t)%t),g()}function P(){if(!a.overlay)return;const e=a.overlay.querySelector(".focus-nav-button.prev"),t=a.overlay.querySelector(".focus-nav-button.next"),o=a.artworks.length>1;e.style.display=o?"flex":"none",t.style.display=o?"flex":"none"}let m,y;function q(){m=e=>{if(a.isOpen)switch(e.key){case"Escape":e.preventDefault(),v();break;case"ArrowLeft":e.preventDefault(),p("prev");break;case"ArrowRight":e.preventDefault(),p("next");break}},y=()=>{a.isOpen&&g()},document.addEventListener("keydown",m),window.addEventListener("resize",y)}function B(){m&&document.removeEventListener("keydown",m),y&&window.removeEventListener("resize",y)}document.addEventListener("DOMContentLoaded",()=>{L(),z()});
