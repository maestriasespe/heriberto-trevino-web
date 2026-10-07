const menu = document.querySelector('.menu-button');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
  document.querySelector('#main-nav')?.classList.toggle('open', open);
});
document.addEventListener('keydown', event => { if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true') {menu.click();menu.focus();} });
for (const comparison of document.querySelectorAll('[data-comparison]')) {
  const range = comparison.querySelector('input[type=range]');
  range?.addEventListener('input',()=>{
    comparison.style.setProperty('--compare', `${range.value}%`);
    range.setAttribute('aria-valuetext', `${range.value}% de la imagen anterior visible`);
  });
}
for (const container of document.querySelectorAll('[data-video]')) {
  container.querySelector('[data-play-video]')?.addEventListener('click', () => {
    const id=container.dataset.video;
    if(!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    const frame=document.createElement('iframe');
    frame.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    frame.title='Reproductor del video publicado';
    frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    frame.referrerPolicy='strict-origin-when-cross-origin';
    frame.allowFullscreen=true;
    container.replaceChildren(frame);
  }, {once:true});
}
