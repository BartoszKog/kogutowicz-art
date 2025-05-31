(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const e of r)if(e.type==="childList")for(const s of e.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const e={};return r.integrity&&(e.integrity=r.integrity),r.referrerPolicy&&(e.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?e.credentials="include":r.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function i(r){if(r.ep)return;r.ep=!0;const e=t(r);fetch(r.href,e)}})();console.log("Portfolio artystyczne załadowane!");let d=[],h=[],p=[],c={};function m(){return window.location.hostname.includes("github.io")?"/kogutowicz-art":""}function u(n){const o=m(),t=window.location.pathname,i=n.startsWith("/")?n.substring(1):n;return t.includes("/pages/")||t.includes("/gallery.html")||t.includes("/about.html")||t.includes("/shop.html")?o?`${o}/${i}`:`../../${i}`:`${o}/${i}`}async function g(){try{const n=m(),o=window.location.pathname;let t=n;o.includes("/pages/")&&!n&&(t="../.."),d=await(await fetch(`${t}/src/data/json/gallery.json`)).json(),h=await(await fetch(`${t}/src/data/json/featured.json`)).json(),p=await(await fetch(`${t}/src/data/json/shop.json`)).json(),c=await(await fetch(`${t}/src/data/json/about.json`)).json(),x()}catch(n){console.error("Błąd podczas ładowania danych:",n)}}function y(){const n=document.querySelector(".featured-artworks");n&&(n.innerHTML="",h.forEach(o=>{const t=document.createElement("div");t.className="bg-white rounded shadow-md overflow-hidden";const i=u(o.image);t.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${i}" alt="${o.title||"Obraz"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${o.title||"Bez tytułu"}</h3>
        ${o.description?`<p class="text-gray-600">${o.description}</p>`:""}
      </div>
    `,n.appendChild(t)}))}function f(n=d){const o=document.querySelector(".gallery-artworks");o&&(o.innerHTML="",n.forEach(t=>{const i=document.createElement("div");i.className="bg-white rounded shadow-md overflow-hidden";const r=u(t.image);i.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${r}" alt="${t.title||"Obraz"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title||"Bez tytułu"}</h3>
        ${t.technique||t.dimensions||t.year?`<p class="text-gray-600">${[t.technique,t.dimensions,t.year].filter(Boolean).join(", ")}</p>`:""}
        ${t.description?`<p class="text-sm mt-2">${t.description}</p>`:""}
        <p class="mt-2 ${t.available?"text-green-600":"text-gray-400"}">
          ${t.available?"Dostępny":"Niedostępny"}
        </p>
      </div>
    `,o.appendChild(i)}))}function b(){const n=document.querySelector(".shop-products");n&&(n.innerHTML="",p.forEach(o=>{const t=document.createElement("div");t.className="bg-white rounded shadow-md overflow-hidden";const i=u(o.image),r=o.available!==!1,e=r?"bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block":"bg-gray-400 text-gray-600 px-4 py-2 rounded cursor-not-allowed inline-block",s=r?"Przejdź do zakupu":"Niedostępne",a=r?`href="${o.purchaseUrl}" target="_blank" rel="noopener noreferrer"`:'onclick="return false;"';t.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${i}" alt="${o.title||"Produkt"}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${o.title||"Bez tytułu"}</h3>
        ${o.description?`<p class="text-gray-600">${o.description}</p>`:""}
        ${o.price?`<p class="text-purple-600 font-bold mt-2">${o.price} zł</p>`:""}
        <div class="mt-4 flex items-center justify-between">
          <a ${a} class="${e}">
            ${s}
          </a>
          ${r?"":'<span class="text-gray-400 font-semibold text-sm">Sprzedane</span>'}
        </div>
      </div>
    `,n.appendChild(t)}))}function v(n){if(!n)return d;const o=n.toLowerCase();return d.filter(t=>t.categories&&Array.isArray(t.categories)&&t.categories.some(i=>i&&i.toLowerCase()===o))}function w(){const n=document.querySelector(".category-filters");if(!n)return;n.className="category-filters loading";const o=new Map;d.forEach(e=>{e.categories&&Array.isArray(e.categories)&&e.categories.forEach(s=>{s&&s.trim()&&o.set(s,(o.get(s)||0)+1)})});const t=Array.from(o.entries()).sort((e,s)=>s[1]-e[1]).map(e=>e[0]);n.innerHTML="";const i=document.createElement("button");i.className="category-chip category-chip-active",i.textContent=`Wszystkie (${d.length})`,i.setAttribute("data-category","wszystkie"),i.addEventListener("click",()=>{f(),r(i)}),n.appendChild(i),t.forEach(e=>{const s=o.get(e),a=document.createElement("button");a.className="category-chip category-chip-inactive",a.textContent=`${e} (${s})`,a.setAttribute("data-category",e),a.addEventListener("click",()=>{const l=v(e);f(l),r(a)}),n.appendChild(a)});function r(e){n.querySelectorAll(".category-chip").forEach(s=>{s.className="category-chip category-chip-inactive"}),e.className="category-chip category-chip-active"}r(i),setTimeout(()=>{n.classList.remove("loading")},300)}function $(){if(!document.querySelector(".about-artist-content"))return;const o=document.querySelector(".artist-photo"),t=document.querySelector(".artist-biography"),i=document.querySelector(".artist-education"),r=document.querySelector(".artist-achievements"),e=document.querySelector("h1");e&&(e.textContent=c.artistName||"O Artyście"),o&&c.artistPhoto&&(o.innerHTML=`
      <img src="${u(c.artistPhoto)}" alt="${c.artistName||"Artysta"}" 
           class="w-full h-full object-cover rounded">
    `),t&&c.biography&&Array.isArray(c.biography)&&c.biography.length>0&&(t.innerHTML="",c.biography.forEach(s=>{if(s&&s.trim()){const a=document.createElement("p");a.className="text-gray-700 mb-4";const l=s.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");a.innerHTML=l,t.appendChild(a)}})),i&&c.education&&Array.isArray(c.education)&&c.education.length>0&&(i.innerHTML="",c.education.forEach(s=>{if(s&&s.trim()){const a=document.createElement("li");a.className="list-disc list-inside text-gray-700";const l=s.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");a.innerHTML=l,i.appendChild(a)}})),r&&c.achievements&&Array.isArray(c.achievements)&&c.achievements.length>0&&(r.innerHTML="",c.achievements.forEach(s=>{if(s&&s.trim()){const a=document.createElement("li");a.className="list-disc list-inside text-gray-700";const l=s.replace(/\b([aiozwunazeprzypod])\s+/gi,"$1&nbsp;");a.innerHTML=l,r.appendChild(a)}}))}function x(){const n=window.location.pathname;n.includes("gallery.html")?(f(),w()):n.includes("shop.html")?b():n.includes("about.html")?$():y()}function L(){const n=document.getElementById("mobile-menu-button"),o=document.getElementById("mobile-menu");if(!n||!o)return;let t=!1;function i(){t=!t,t?(o.classList.remove("hidden"),n.setAttribute("aria-expanded","true"),n.setAttribute("aria-label","Zamknij menu"),n.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `,o.focus()):(o.classList.add("hidden"),n.setAttribute("aria-expanded","false"),n.setAttribute("aria-label","Otwórz menu"),n.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      `)}n.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),i()}),n.addEventListener("keydown",e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),e.stopPropagation(),i())}),window.addEventListener("resize",()=>{window.innerWidth>=768&&t&&i()}),o.querySelectorAll("a").forEach(e=>{e.addEventListener("click",()=>{t&&i()})}),document.addEventListener("keydown",e=>{e.key==="Escape"&&t&&(i(),n.focus())}),document.addEventListener("click",e=>{t&&!o.contains(e.target)&&!n.contains(e.target)&&i()}),o.addEventListener("keydown",e=>{const s=o.querySelectorAll("a"),a=Array.from(s).indexOf(document.activeElement);if(e.key==="ArrowDown"){e.preventDefault();const l=a<s.length-1?a+1:0;s[l].focus()}else if(e.key==="ArrowUp"){e.preventDefault();const l=a>0?a-1:s.length-1;s[l].focus()}else e.key==="Home"?(e.preventDefault(),s[0].focus()):e.key==="End"&&(e.preventDefault(),s[s.length-1].focus())})}document.addEventListener("DOMContentLoaded",()=>{g(),L()});
