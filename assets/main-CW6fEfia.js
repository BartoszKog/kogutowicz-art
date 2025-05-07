(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function e(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=e(r);fetch(r.href,o)}})();console.log("Portfolio artystyczne załadowane!");let c=[],u=[],p=[],i={};function l(t){return window.location.pathname.includes("/pages/")?"../../"+t:t}async function f(){try{c=await(await fetch("/src/data/json/gallery.json")).json(),u=await(await fetch("/src/data/json/featured.json")).json(),p=await(await fetch("/src/data/json/shop.json")).json(),i=await(await fetch("/src/data/json/about.json")).json(),v()}catch(t){console.error("Błąd podczas ładowania danych:",t)}}function m(){const t=document.querySelector(".featured-artworks");t&&(t.innerHTML="",u.forEach(n=>{const e=document.createElement("div");e.className="bg-white rounded shadow-md overflow-hidden";const s=l(n.image);e.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${s}" alt="${n.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${n.title}</h3>
        <p class="text-gray-600">${n.description}</p>
      </div>
    `,t.appendChild(e)}))}function d(t=c){const n=document.querySelector(".gallery-artworks");n&&(n.innerHTML="",t.forEach(e=>{const s=document.createElement("div");s.className="bg-white rounded shadow-md overflow-hidden";const r=l(e.image);s.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${r}" alt="${e.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${e.title}</h3>
        <p class="text-gray-600">${e.technique}, ${e.dimensions}, ${e.year}</p>
        <p class="text-sm mt-2">${e.description}</p>
        <p class="mt-2 ${e.available?"text-green-600":"text-red-600"}">
          ${e.available?"Dostępny":"Sprzedany"}
        </p>
      </div>
    `,n.appendChild(s)}))}function h(){const t=document.querySelector(".shop-products");t&&(t.innerHTML="",p.forEach(n=>{const e=document.createElement("div");e.className="bg-white rounded shadow-md overflow-hidden";const s=l(n.image);e.innerHTML=`
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
    `,t.appendChild(e)}))}function g(t){if(!t)return c;const n=t.toLowerCase();return c.filter(e=>e.categories.some(s=>s.toLowerCase()===n))}function y(){const t=document.querySelector(".category-filters");if(!t)return;const n=new Set;c.forEach(r=>{r.categories.forEach(o=>n.add(o))});const e=document.createElement("button");e.className="px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2",e.textContent="Wszystkie",e.addEventListener("click",()=>{d(),s(e)}),t.appendChild(e),n.forEach(r=>{const o=document.createElement("button");o.className="px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200",o.textContent=r,o.addEventListener("click",()=>{const a=g(r);d(a),s(o)}),t.appendChild(o)});function s(r){t.querySelectorAll("button").forEach(o=>{o.className="px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200"}),r.className="px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2"}s(e)}function b(){if(!document.querySelector(".about-artist-content"))return;const n=document.querySelector(".artist-photo"),e=document.querySelector(".artist-biography"),s=document.querySelector(".artist-education"),r=document.querySelector(".artist-achievements");document.querySelector("h1").textContent=i.artistName||"O Artyście",n&&i.artistPhoto&&(n.innerHTML=`
      <img src="${l(i.artistPhoto)}" alt="${i.artistName}" 
           class="w-full h-full object-cover rounded">
    `),e&&i.biography&&(e.innerHTML="",i.biography.forEach(o=>{const a=document.createElement("p");a.className="text-gray-700 mb-4",a.textContent=o,e.appendChild(a)})),s&&i.education&&(s.innerHTML="",i.education.forEach(o=>{const a=document.createElement("li");a.className="list-disc list-inside text-gray-700",a.textContent=o,s.appendChild(a)})),r&&i.achievements&&(r.innerHTML="",i.achievements.forEach(o=>{const a=document.createElement("li");a.className="list-disc list-inside text-gray-700",a.textContent=o,r.appendChild(a)}))}function v(){const t=window.location.pathname;t.includes("gallery.html")?(d(),y()):t.includes("shop.html")?h():t.includes("about.html")?b():m()}document.addEventListener("DOMContentLoaded",f);
