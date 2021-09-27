import "core-js/stable";
import "regenerator-runtime/runtime";

import PhotoSwipe from 'photoswipe'
import PhotoSwipeUI_Default from 'photoswipe/src/js/ui/photoswipe-ui-default.js'

import Swiper, { Navigation, Pagination, EffectCreative } from 'swiper';

export default class Main {
  constructor() {
    this.photoswipe = [];
    this.photoswipeUi = PhotoSwipeUI_Default;

    this.initPhotoswipe('[data-photoswipe="1"]');

    this.initPhotoswipe('[data-photoswipe="not-link"]');

    this.initPhotoswipe('[data-photoswipe="2"]', {
      history: true,
      bgOpacity: 0.8,
      showHideOpacity : true,
      shareEl : true,
      shareButtons: [
      {id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
      {id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
      {id:'download', label:'Download image', url:'{{raw_image_url}}', download:true}
      ],
    });
  }

  /**
  * Swiperの初期化
  * @param {string} elemNode - Swiperを適用するのHTML要素
  * @return {Object} - Swiperインスタンス
  **/
  initSwiper(elemNode) {

    const swiperOptions = {
      grabCursor: true,
      modules: [Navigation, Pagination, EffectCreative],
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      slidesPerView: 1,
      effect: "creative",
      creativeEffect: {
        prev: {
          shadow: true,
          translate: ["-125%", 0, -800],
          rotate: [0, 0, -90],
        },
        next: {
          shadow: true,
          translate: ["125%", 0, -800],
          rotate: [0, 0, 90],
        },
      }
    };

    return new Swiper(elemNode, swiperOptions);
  }

  /**
  * PhotoSwipeの初期化
  * @param {string} elemName - 画像グループのHTML要素名
  * @param {object} options - PhotoSwipeのオプション
  * @return {void}
  **/
  initPhotoswipe(elemName, options = {}) {
    const galleryElements = document.querySelectorAll(elemName);
    if(!galleryElements[0]){
      return;
    }

    const template = this.addTemplate();
    const pswpElement = template.querySelector('.pswp');
    if(!pswpElement){
      return;
    }

    for(let i = 0, l = galleryElements.length; i < l; i++) {
      this.attachPhotoswipe(galleryElements[i], pswpElement, options, i);
    }
  }

  /**
  * Photoswipeの適用
  * @param {HTMLElement} elem - PhotoSwipeを適用するHTML要素
  * @param {HTMLElement} pswpElement - ポップアップテンプレートのHTML要素
  * @param {object} - PhotoSwipeのオプション
  * @param {number} -i 画像グループのインデックス
  * @return {void}
  **/
  async attachPhotoswipe(elem, pswpElement, options, i){

    const uid = this.addUid(elem, i);
    const items = await this.parseThumbnailElements(elem);
    const _options = this.initOptions(elem, items, options);

    let swiper;
    if(elem.classList.contains('swiper-wrapper')){
      swiper = this.initSwiper(elem.parentNode);
    }

    swiper =  elem.getAttribute('data-photoswipe') !== 'not-link' ? swiper : null;
    this.onThumbnailsClick(pswpElement, items, _options, uid, swiper);

    if(('history' in _options) && _options.history){
      this.openByHash(pswpElement, items, _options, uid);
    }
  }

  /**
  * ポップアップ用のHTMLを追加
  * @return {void}
  **/
  addTemplate() {
    const elem = document.createElement("div");
    elem.innerHTML = '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"><div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button><button class="pswp__button pswp__button--share" title="Share"></button><button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button><button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div> </div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button><button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div></div>';
    document.body.appendChild(elem);
    return elem;
  }

  /**
  * 画像グループごとのユニークIDをdata属性に設定
  * @param {HTMLElement} - PhotoSwipeを適用するHTML要素
  * @param {number} -i 画像グループのインデックス
  * @return {string} uid
  **/
  addUid(elem, i) {
    const uidPrefix = elem.getAttribute('data-photoswipe');
    const uid = !uidPrefix ? i+1 : `${uidPrefix}-${i+1}`;
    elem.setAttribute('data-pswp-uid', uid);
    return uid;
  }

  /**
  * 画像情報の配列を取得
  * @param {HTMLElement} target - 画像グループのHTML要素
  * @return {promise} - 画像情報の配列をPromiseで返す
  **/
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

  /**
  * 画像の非同期読み込み
  * @param {string} src - 画像のURL
  * @return {promise} - imageオブジェクトをPromiseで返す
  **/
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  /**
  * オプションの初期化
  * @param {HTMLElement} galleryElement - 画像グループのHTML要素
  * @param {array} items - 画像情報の配列
  * @param {object} options - PhotoSwipeのオプション
  * @return {object}
  **/
  initOptions(galleryElement, items, options = {}) {
    const _options = JSON.parse(JSON.stringify(options));
    if(!('galleryUID' in _options)){
      _options.galleryUID = galleryElement.getAttribute('data-pswp-uid');
    }

    if(!('getThumbBoundsFn' in _options)){
      _options.getThumbBoundsFn = (index) => {
        const thumbnail = items[index].el.getElementsByTagName('img')[0],
        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
        rect = thumbnail.getBoundingClientRect();

        return {
          x:rect.left,
          y:rect.top + pageYScroll,
          w:rect.width
        };
      }
    }

    if(!('index' in _options)){
      _options.index = 0;
    }

    if(!('history' in _options)){
      _options.history = false;
    }

    if(!('shareEl' in _options)){
      _options.shareEl = false;
    }

    return _options;
  }

  /**
  * 画像のクリック
  * @param {HTMLElement} pswpElement - ポップアップテンプレートのHTML要素
  * @param {array} items - 画像情報の配列
  * @param {object} options - PhotoSwipeのオプション
  * @param {string} uid - 画像グループのuid
  * @param {Object} swiper - Swiperインスタンス
  * @return {void}
  **/
  onThumbnailsClick(pswpElement, items, options, uid, swiper) {
    items.forEach((item, index) => {
      item.el.addEventListener('click', (e) => {
        e.preventDefault();
        options.index = index;
        this.photoswipe[uid] = new PhotoSwipe( pswpElement, this.photoswipeUi, items, options);
        this.photoswipe[uid].init();

        if(swiper){
          this.photoswipe[uid].listen('afterChange', () => {
            swiper.slideTo(this.photoswipe[uid].getCurrentIndex());
          });
        }

      }, {passive: false});
    });
  }


  /**
  * 起動時にURLに付くハッシュ値を解析
  * @return {void}
  **/
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

    return params;
  }

  /**
  * ハッシュ値に応じて起動
  * @param {HTMLElement} pswpElement - ポップアップテンプレートのHTML要素
  * @param {array} items - 画像情報の配列
  * @param {object} options - PhotoSwipeのオプション
  * @param {string} uid - 画像グループのuid
  * @return {void}
  **/
  openByHash(pswpElement, items, options, uid) {
    const hashData = this.parseHash();
    if(hashData.pid && hashData.gid) {
      options.galleryUID = hashData.gid;
      options.index = hashData.pid;
      this.photoswipe[uid] = new PhotoSwipe(pswpElement, this.photoswipeUi, items, options);
      this.photoswipe[uid].init();
    }
  }

}

new Main();