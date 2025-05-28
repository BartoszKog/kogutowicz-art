(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(o){if(o.ep)return;o.ep=!0;const r=e(o);fetch(o.href,r)}})();console.log("Portfolio artystyczne załadowane!");let c=[],u=[],h=[],i={};function p(){return window.location.hostname.includes("github.io")?"/kogutowicz-art":""}function l(t){const n=p(),e=window.location.pathname,s=t.startsWith("/")?t.substring(1):t;return e.includes("/pages/")||e.includes("/gallery.html")||e.includes("/about.html")||e.includes("/shop.html")?n?`${n}/${s}`:`../../${s}`:`${n}/${s}`}async function m(){try{const t=p();c=await(await fetch(`${t}/src/data/json/gallery.json`)).json(),u=await(await fetch(`${t}/src/data/json/featured.json`)).json(),h=await(await fetch(`${t}/src/data/json/shop.json`)).json(),i=await(await fetch(`${t}/src/data/json/about.json`)).json(),w()}catch(t){console.error("Błąd podczas ładowania danych:",t)}}function f(){const t=document.querySelector(".featured-artworks");t&&(t.innerHTML="",u.forEach(n=>{const e=document.createElement("div");e.className="bg-white rounded shadow-md overflow-hidden";const s=l(n.image);e.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${s}" alt="${n.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${n.title}</h3>
        <p class="text-gray-600">${n.description}</p>
      </div>
    `,t.appendChild(e)}))}function d(t=c){const n=document.querySelector(".gallery-artworks");n&&(n.innerHTML="",t.forEach(e=>{const s=document.createElement("div");s.className="bg-white rounded shadow-md overflow-hidden";const o=l(e.image);s.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${o}" alt="${e.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${e.title}</h3>
        <p class="text-gray-600">${e.technique}, ${e.dimensions}, ${e.year}</p>
        <p class="text-sm mt-2">${e.description}</p>
        <p class="mt-2 ${e.available?"text-green-600":"text-red-600"}">
          ${e.available?"Dostępny":"Sprzedany"}
        </p>
      </div>
    `,n.appendChild(s)}))}function g(){const t=document.querySelector(".shop-products");t&&(t.innerHTML="",h.forEach(n=>{const e=document.createElement("div");e.className="bg-white rounded shadow-md overflow-hidden";const s=l(n.image);e.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${s}" alt="${n.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${n.title}</h3>
        <p class="text-gray-600">${n.description}</p>
        <p class="text-purple-600 font-bold mt-2">${n.price} zł</p>
        <a href="${n.purchaseUrl}" target="_blank" rel="noopener noreferrer" 
           class="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block">
          Przejdź do zakupu
        </a>
      </div>
    `,t.appendChild(e)}))}function y(t){if(!t)return c;const n=t.toLowerCase();return c.filter(e=>e.categories.some(s=>s.toLowerCase()===n))}function b(){const t=document.querySelector(".category-filters");if(!t)return;const n=new Set;c.forEach(o=>{o.categories.forEach(r=>n.add(r))});const e=document.createElement("button");e.className="px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2",e.textContent="Wszystkie",e.addEventListener("click",()=>{d(),s(e)}),t.appendChild(e),n.forEach(o=>{const r=document.createElement("button");r.className="px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200",r.textContent=o,r.addEventListener("click",()=>{const a=y(o);d(a),s(r)}),t.appendChild(r)});function s(o){t.querySelectorAll("button").forEach(r=>{r.className="px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200"}),o.className="px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2"}s(e)}function v(){if(!document.querySelector(".about-artist-content"))return;const n=document.querySelector(".artist-photo"),e=document.querySelector(".artist-biography"),s=document.querySelector(".artist-education"),o=document.querySelector(".artist-achievements");document.querySelector("h1").textContent=i.artistName||"O Artyście",n&&i.artistPhoto&&(n.innerHTML=`
      <img src="${l(i.artistPhoto)}" alt="${i.artistName}" 
           class="w-full h-full object-cover rounded">
    `),e&&i.biography&&(e.innerHTML="",i.biography.forEach(r=>{const a=document.createElement("p");a.className="text-gray-700 mb-4",a.textContent=r,e.appendChild(a)})),s&&i.education&&(s.innerHTML="",i.education.forEach(r=>{const a=document.createElement("li");a.className="list-disc list-inside text-gray-700",a.textContent=r,s.appendChild(a)})),o&&i.achievements&&(o.innerHTML="",i.achievements.forEach(r=>{const a=document.createElement("li");a.className="list-disc list-inside text-gray-700",a.textContent=r,o.appendChild(a)}))}function w(){const t=window.location.pathname;t.includes("gallery.html")?(d(),b()):t.includes("shop.html")?g():t.includes("about.html")?v():f()}document.addEventListener("DOMContentLoaded",m);
