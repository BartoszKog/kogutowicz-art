(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const e of i)if(e.type==="childList")for(const s of e.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const e={};return i.integrity&&(e.integrity=i.integrity),i.referrerPolicy&&(e.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?e.credentials="include":i.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function r(i){if(i.ep)return;i.ep=!0;const e=n(i);fetch(i.href,e)}})();console.log("Portfolio artystyczne załadowane!");let l=[],h=[],p=[],c={};function m(){return window.location.hostname.includes("github.io")?"/kogutowicz-art":""}function u(t){const o=m(),n=window.location.pathname,r=t.startsWith("/")?t.substring(1):t;return n.includes("/pages/")||n.includes("/gallery.html")||n.includes("/about.html")||n.includes("/shop.html")?o?`${o}/${r}`:`../../${r}`:`${o}/${r}`}async function g(){try{const t=m(),o=window.location.pathname;let n=t;o.includes("/pages/")&&!t&&(n="../.."),l=await(await fetch(`${n}/src/data/json/gallery.json`)).json(),h=await(await fetch(`${n}/src/data/json/featured.json`)).json(),p=await(await fetch(`${n}/src/data/json/shop.json`)).json(),c=await(await fetch(`${n}/src/data/json/about.json`)).json(),L()}catch(t){console.error("Błąd podczas ładowania danych:",t)}}function y(){const t=document.querySelector(".featured-artworks");t&&(t.innerHTML="",h.forEach(o=>{const n=document.createElement("div");n.className="bg-white rounded shadow-md overflow-hidden";const r=u(o.image);n.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${r}" alt="${o.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${o.title}</h3>
        <p class="text-gray-600">${o.description}</p>
      </div>
    `,t.appendChild(n)}))}function f(t=l){const o=document.querySelector(".gallery-artworks");o&&(o.innerHTML="",t.forEach(n=>{const r=document.createElement("div");r.className="bg-white rounded shadow-md overflow-hidden";const i=u(n.image);r.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${i}" alt="${n.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${n.title}</h3>
        <p class="text-gray-600">${n.technique}, ${n.dimensions}, ${n.year}</p>
        <p class="text-sm mt-2">${n.description}</p>
        <p class="mt-2 ${n.available?"text-green-600":"text-red-600"}">
          ${n.available?"Dostępny":"Sprzedany"}
        </p>
      </div>
    `,o.appendChild(r)}))}function v(){const t=document.querySelector(".shop-products");t&&(t.innerHTML="",p.forEach(o=>{const n=document.createElement("div");n.className="bg-white rounded shadow-md overflow-hidden";const r=u(o.image);n.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${r}" alt="${o.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${o.title}</h3>
        <p class="text-gray-600">${o.description}</p>
        <p class="text-purple-600 font-bold mt-2">${o.price} zł</p>
        <a href="${o.purchaseUrl}" target="_blank" rel="noopener noreferrer" 
           class="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block">
          Przejdź do zakupu
        </a>
      </div>
    `,t.appendChild(n)}))}function b(t){if(!t)return l;const o=t.toLowerCase();return l.filter(n=>n.categories.some(r=>r.toLowerCase()===o))}function w(){const t=document.querySelector(".category-filters");if(!t)return;t.className="category-filters loading";const o=new Map;l.forEach(e=>{e.categories.forEach(s=>{o.set(s,(o.get(s)||0)+1)})});const n=Array.from(o.entries()).sort((e,s)=>s[1]-e[1]).map(e=>e[0]);t.innerHTML="";const r=document.createElement("button");r.className="category-chip category-chip-active",r.textContent=`Wszystkie (${l.length})`,r.setAttribute("data-category","wszystkie"),r.addEventListener("click",()=>{f(),i(r)}),t.appendChild(r),n.forEach(e=>{const s=o.get(e),a=document.createElement("button");a.className="category-chip category-chip-inactive",a.textContent=`${e} (${s})`,a.setAttribute("data-category",e),a.addEventListener("click",()=>{const d=b(e);f(d),i(a)}),t.appendChild(a)});function i(e){t.querySelectorAll(".category-chip").forEach(s=>{s.className="category-chip category-chip-inactive"}),e.className="category-chip category-chip-active"}i(r),setTimeout(()=>{t.classList.remove("loading")},300)}function E(){if(!document.querySelector(".about-artist-content"))return;const o=document.querySelector(".artist-photo"),n=document.querySelector(".artist-biography"),r=document.querySelector(".artist-education"),i=document.querySelector(".artist-achievements");document.querySelector("h1").textContent=c.artistName||"O Artyście",o&&c.artistPhoto&&(o.innerHTML=`
      <img src="${u(c.artistPhoto)}" alt="${c.artistName}" 
           class="w-full h-full object-cover rounded">
    `),n&&c.biography&&(n.innerHTML="",c.biography.forEach(e=>{const s=document.createElement("p");s.className="text-gray-700 mb-4",s.textContent=e,n.appendChild(s)})),r&&c.education&&(r.innerHTML="",c.education.forEach(e=>{const s=document.createElement("li");s.className="list-disc list-inside text-gray-700",s.textContent=e,r.appendChild(s)})),i&&c.achievements&&(i.innerHTML="",c.achievements.forEach(e=>{const s=document.createElement("li");s.className="list-disc list-inside text-gray-700",s.textContent=e,i.appendChild(s)}))}function L(){const t=window.location.pathname;t.includes("gallery.html")?(f(),w()):t.includes("shop.html")?v():t.includes("about.html")?E():y()}function x(){const t=document.getElementById("mobile-menu-button"),o=document.getElementById("mobile-menu");if(!t||!o)return;let n=!1;function r(){n=!n,n?(o.classList.remove("hidden"),t.setAttribute("aria-expanded","true"),t.setAttribute("aria-label","Zamknij menu"),t.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `,o.focus()):(o.classList.add("hidden"),t.setAttribute("aria-expanded","false"),t.setAttribute("aria-label","Otwórz menu"),t.innerHTML=`
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      `)}t.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),r()}),t.addEventListener("keydown",e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),e.stopPropagation(),r())}),window.addEventListener("resize",()=>{window.innerWidth>=768&&n&&r()}),o.querySelectorAll("a").forEach(e=>{e.addEventListener("click",()=>{n&&r()})}),document.addEventListener("keydown",e=>{e.key==="Escape"&&n&&(r(),t.focus())}),document.addEventListener("click",e=>{n&&!o.contains(e.target)&&!t.contains(e.target)&&r()}),o.addEventListener("keydown",e=>{const s=o.querySelectorAll("a"),a=Array.from(s).indexOf(document.activeElement);if(e.key==="ArrowDown"){e.preventDefault();const d=a<s.length-1?a+1:0;s[d].focus()}else if(e.key==="ArrowUp"){e.preventDefault();const d=a>0?a-1:s.length-1;s[d].focus()}else e.key==="Home"?(e.preventDefault(),s[0].focus()):e.key==="End"&&(e.preventDefault(),s[s.length-1].focus())})}document.addEventListener("DOMContentLoaded",()=>{g(),x()});
