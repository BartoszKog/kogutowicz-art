(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(o){if(o.ep)return;o.ep=!0;const r=t(o);fetch(o.href,r)}})();console.log("Portfolio artystyczne załadowane!");let c=[],u=[],p=[],i={};function l(e){const n=h();return window.location.pathname.includes("/pages/")?`../../${e}`:`${n}/${e}`}function h(){return window.location.hostname.includes("github.io")?"/kogutowicz-art":""}async function f(){try{const e=h();c=await(await fetch(`${e}/src/data/json/gallery.json`)).json(),u=await(await fetch(`${e}/src/data/json/featured.json`)).json(),p=await(await fetch(`${e}/src/data/json/shop.json`)).json(),i=await(await fetch(`${e}/src/data/json/about.json`)).json(),w()}catch(e){console.error("Błąd podczas ładowania danych:",e)}}function m(){const e=document.querySelector(".featured-artworks");e&&(e.innerHTML="",u.forEach(n=>{const t=document.createElement("div");t.className="bg-white rounded shadow-md overflow-hidden";const s=l(n.image);t.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${s}" alt="${n.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${n.title}</h3>
        <p class="text-gray-600">${n.description}</p>
      </div>
    `,e.appendChild(t)}))}function d(e=c){const n=document.querySelector(".gallery-artworks");n&&(n.innerHTML="",e.forEach(t=>{const s=document.createElement("div");s.className="bg-white rounded shadow-md overflow-hidden";const o=l(t.image);s.innerHTML=`
      <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img src="${o}" alt="${t.title}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">${t.title}</h3>
        <p class="text-gray-600">${t.technique}, ${t.dimensions}, ${t.year}</p>
        <p class="text-sm mt-2">${t.description}</p>
        <p class="mt-2 ${t.available?"text-green-600":"text-red-600"}">
          ${t.available?"Dostępny":"Sprzedany"}
        </p>
      </div>
    `,n.appendChild(s)}))}function g(){const e=document.querySelector(".shop-products");e&&(e.innerHTML="",p.forEach(n=>{const t=document.createElement("div");t.className="bg-white rounded shadow-md overflow-hidden";const s=l(n.image);t.innerHTML=`
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
    `,e.appendChild(t)}))}function y(e){if(!e)return c;const n=e.toLowerCase();return c.filter(t=>t.categories.some(s=>s.toLowerCase()===n))}function b(){const e=document.querySelector(".category-filters");if(!e)return;const n=new Set;c.forEach(o=>{o.categories.forEach(r=>n.add(r))});const t=document.createElement("button");t.className="px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2",t.textContent="Wszystkie",t.addEventListener("click",()=>{d(),s(t)}),e.appendChild(t),n.forEach(o=>{const r=document.createElement("button");r.className="px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200",r.textContent=o,r.addEventListener("click",()=>{const a=y(o);d(a),s(r)}),e.appendChild(r)});function s(o){e.querySelectorAll("button").forEach(r=>{r.className="px-3 py-1 bg-gray-200 text-gray-800 rounded mr-2 mb-2 hover:bg-purple-200"}),o.className="px-3 py-1 bg-purple-500 text-white rounded mr-2 mb-2"}s(t)}function v(){if(!document.querySelector(".about-artist-content"))return;const n=document.querySelector(".artist-photo"),t=document.querySelector(".artist-biography"),s=document.querySelector(".artist-education"),o=document.querySelector(".artist-achievements");document.querySelector("h1").textContent=i.artistName||"O Artyście",n&&i.artistPhoto&&(n.innerHTML=`
      <img src="${l(i.artistPhoto)}" alt="${i.artistName}" 
           class="w-full h-full object-cover rounded">
    `),t&&i.biography&&(t.innerHTML="",i.biography.forEach(r=>{const a=document.createElement("p");a.className="text-gray-700 mb-4",a.textContent=r,t.appendChild(a)})),s&&i.education&&(s.innerHTML="",i.education.forEach(r=>{const a=document.createElement("li");a.className="list-disc list-inside text-gray-700",a.textContent=r,s.appendChild(a)})),o&&i.achievements&&(o.innerHTML="",i.achievements.forEach(r=>{const a=document.createElement("li");a.className="list-disc list-inside text-gray-700",a.textContent=r,o.appendChild(a)}))}function w(){const e=window.location.pathname;e.includes("gallery.html")?(d(),b()):e.includes("shop.html")?g():e.includes("about.html")?v():m()}document.addEventListener("DOMContentLoaded",f);
