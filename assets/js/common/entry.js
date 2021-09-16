import "core-js/stable";
import "regenerator-runtime/runtime";

import PhotoSwipe from 'photoswipe'
import PhotoSwipeUI_Default from 'photoswipe/src/js/ui/photoswipe-ui-default.js'

export default class Main {
  constructor() {
    this.photoswipe = [];
    this.photoswipeUi = PhotoSwipeUI_Default;
    this.initPhotoswipe('.js-gallery');
  }

  async initPhotoswipe(elemName) {
    const template = this.addTemplate();
    const pswpElement = template.querySelector('.pswp');
    if(!pswpElement){
      return;
    }

    const galleryElements = document.querySelectorAll(elemName);
    if(!galleryElements[0]){
      return;
    }

    for(let i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute('data-pswp-uid', i+1);
      const items = await this.parseThumbnailElements(galleryElements[i]);

      const options = this.initOptions(galleryElements[i], items);

      this.onThumbnailsClick(pswpElement, items, options, i);

      this.openByHash(pswpElement, items, options, i);
    }
  }

  //ポップアップ用のHTMLを追加
  addTemplate() {
    const elem = document.createElement("div");
    elem.innerHTML = '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"><div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button><button class="pswp__button pswp__button--share" title="Share"></button><button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button><button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div> </div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button><button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div></div>';
    document.body.appendChild(elem);
    return elem;
  }

  //画像情報
  async parseThumbnailElements(target) {

    const items = [];
    let index = 0;

    for(let el of target.children){
      let src, width, height, size;

      const linkEl = el.getElementsByTagName('a')[0];
      if(!linkEl){
        return;
      }

      src = linkEl.href;

      const imgEl = el.getElementsByTagName('img')[0];
      if(!imgEl){
        return;
      }


      if(linkEl.getAttribute('data-size')){
        size = linkEl.getAttribute('data-size').split('x');
        width = parseInt(size[0], 10);
        height = parseInt(size[1], 10);
      }
      else{
        const img = await this.loadImage(src);
        width = img.naturalWidth;
        height = img.naturalHeight;
      }

      const item = {
        src : src,
        w: width,
        h: height,
        el: linkEl,
        index : index
      }

      items.push(item);

      ++index;
    };

    return items;
  }

  //画像の非同期読み込み
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
    });
  }

  //オプションの初期設定
  initOptions(galleryElement, items) {
    const options = {
      galleryUID       : galleryElement.getAttribute('data-pswp-uid'),
      getThumbBoundsFn : (index) => {
        const thumbnail = items[index].el.getElementsByTagName('img')[0],
        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
        rect = thumbnail.getBoundingClientRect();

        return {
          x:rect.left,
          y:rect.top + pageYScroll,
          w:rect.width
        };
      },
      index: 0
    }
    return options;
  }

  //画像のクリック
  onThumbnailsClick(pswpElement, items, options, i) {
    items.forEach((item, index) => {
      item.el.addEventListener('click', (e) => {
        e.preventDefault();
        options.index = index;
        this.photoswipe[i] = new PhotoSwipe( pswpElement, this.photoswipeUi, items, options);
        this.photoswipe[i].init();
      }, {passive: false});
    });
  }

  //起動時にURLに付くハッシュ値を解析
  parseHash() {
    const hash = window.location.hash.substring(1),
    params = {};

    if(hash.length < 5) {
      return params;
    }

    const vars = hash.split('&');
    for (let i = 0; i < vars.length; i++) {
      if(!vars[i]) {
        continue;
      }
      const pair = vars[i].split('=');
      if(pair.length < 2) {
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if(params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  }

  //ハッシュ値に応じて起動
  openByHash(pswpElement, items, options, i) {
    const hashData = this.parseHash();
    if(hashData.pid && hashData.gid) {
      options.index = hashData.pid;
      this.photoswipe[i] = new PhotoSwipe(pswpElement, this.photoswipeUi, items, options);
      this.photoswipe[i].init();
    }
  }

}

new Main();