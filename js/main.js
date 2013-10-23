var App;

window.dhtmlHistory.create({
	toJSON: function(o) {
		return JSON.stringify(o);
	}
	, fromJSON: function(s) {
		return JSON.parse(s);
	}
});

(function(window){
	"use strict";

	var web_travi = function(){
		var t = this;
		this.initialize(function(r){
			t.setupApp(r);
		});
	}

	web_travi.prototype.initialize = function(callback) {
		new Vi({url:'config.json', response: 'object'}).server(function(r){
			if(typeof callback === 'function'){
				callback(r);
			}
		});
	};

	web_travi.prototype.setupApp = function(r) {
		var modules = r.modules;
		var lang = this.browserLanguage();

		var j = {modules: {}, name: 'web_travi', div: '#main', currentLang: lang};
		for(var m in modules){
			if(modules.hasOwnProperty(m)){
				j.modules[m] = {nombre: m, url:r.modules_path};
			}
		}

		App = new AppSystem(j);
		App._original = {div: App.div};
		this.a = App;
		this.a._data = r;
		var t = this;

		dhtmlHistory.initialize();
		dhtmlHistory.addListener(t.handleHistory);

		this.buildMenu();
		this.a.init(function(){
			t.loadSystem();

			var alogo = document.getElementById('a-logo');
			if(alogo !== null){
				alogo.addEventListener('click', function(){
					t.loadCategory('inicio');
				}, false);
			}
		});
	};

	web_travi.prototype.loadSystem = function() {
		var initialModule = dhtmlHistory.getCurrentLocation();
		if(initialModule.length <= 1){
			initialModule = 'inicio';
		}

		this.loadCategory(initialModule);
	};

	web_travi.prototype.loadCategory = function(location) {
		var url = this.handleURL(location);
		dhtmlHistory.add(location, {message: "Module " +url[0]});
		this.activeMenuCategory(url[0]);

		switch(url[0]){
			case 'inicio':
				this.cleanMenuCategory();
				this.automaticTransition();
			break;
			default:
				this.disableAutomaticTransition();
			break;
		}

		var banned = {inicio: ''};
		this.a.getModule(url[0]);

		this.a.current._url = url;
		if(!banned.hasOwnProperty(url[0])){
			this.containerHandler(url[0]);
		}else{
			this.a.div = this.a._original.div;
			var parent = document.querySelector(this.a._original.div);
			var t = this;
			$(parent).fadeOut('fast', function(){
				t.a.current.start(function(){
					$(parent).fadeIn('fast');
				});
			});
		}
	};

	web_travi.prototype.containerHandler = function(category) {
		var parent = document.querySelector(this.a._original.div);

		var t = this;
		$(parent).fadeOut('fast', function(){
			var container = t.createContainer(parent, category);
			t.a.div = '#'+container.id;
			t.a.current.start(function(){
				$(parent).fadeIn('fast');
			});
		});
	};

	web_travi.prototype.createContainer = function(parent, category) {
		parent.innerHTML = '';

		var container = document.createElement('div');
		container.id = 'web_travi-container';
		parent.appendChild(container);

	
		var contentHolder = document.createElement('div');
		contentHolder.id = 'contentHolder';
		container.appendChild(contentHolder);


		return contentHolder;
	};

	web_travi.prototype.subMenuCreator = function(module) {
		var mod = this.a._data.modules[module];

		var ul = document.createElement('ul');
		ul.id = 'sub-menu';
		ul.className = 'nav nav-justified';

		for(var sub in mod){
			if(mod.hasOwnProperty(sub)){
				var li = document.createElement('li');
				var a = document.createElement('a');
				var tag = sub;
				a.setAttribute('data-ltag', tag);
				li.appendChild(a);
				ul.appendChild(li);
			}
		}

		return ul;
	};

	web_travi.prototype.handleURL = function(url) {
		url = url.match(/([^/]+)/gi);
		return url;
	};

	web_travi.prototype.handleHistory = function(newLocation, historyData) {
		if(typeof bio.a.current === 'object'){
			bio.loadCategory(newLocation);
		}
	};

	web_travi.prototype.backgroundGenerator = function() {
		var imgs = this.a._data.images;
		this.a._data.imgs = {};
		this.background = document.getElementById('background');

		for(var i in imgs){
			if(imgs.hasOwnProperty(i)){
				var el = document.createElement('div');
				this.a._data.imgs[i] = {dom: el, img: imgs[i]};
				el.className = 'background-img';
				$(el).css('background-image', 'url('+imgs[i].src+')');
				this.background.appendChild(el);
			}
		}

		this.images = this.a._data.imgs;
	};

	web_travi.prototype.automaticTransition = function(time) {
		if(typeof this.automatic !== 'undefined'){
			this.disableAutomaticTransition();
		}

		time = (typeof time !== 'number') ? 10000 : time;

		var t = this;
		this.automatic = setInterval(function(){
			t.getNextImage();
		}, time);
	};

	web_travi.prototype.disableAutomaticTransition = function() {
		clearInterval(this.automatic);
	};

	web_travi.prototype.buildMenu = function() {
		this.menu = document.querySelectorAll('ul.main-menu');

		for(var k = 0, len2 = this.menu.length; k < len2; k++){
			var menu = this.menu[k];
			menu.innerHTML = '';

			var modules = Object.keys(this.a._data.modules);
			var banned = {cart: ''};

			if(menu.id === 'side-menu'){
				var menuWidth = $(menu).outerWidth();
				var aWidth = menuWidth - 40 - 6; // El 50 corresponde al icono
			}

			for(var i = 0, len = modules.length; i < len; i++){
				var m = modules[i];
				if(banned.hasOwnProperty(m) === false){
					var li = this.buildMenuCategory(m, menu);
					var a = li.getElementsByTagName('a')[0];
					if(menu.id === 'side-menu'){
						$(a).css('width', aWidth+'px');
					}
					menu.appendChild(li);
				}
			}
		}
	};

	web_travi.prototype.buildMenuCategory = function(module, menu) {
		var helperPull = '';
		if(menu.id === 'side-menu'){
			helperPull = 'pull-left';
		}

		var li = document.createElement('li');
		li.setAttribute('data-module', module);

		var iconHolder = document.createElement('div');
		iconHolder.className = helperPull+' hidden-xs';
		var icon = document.createElement('div');
		icon.className = 'menu-icon';
		icon.id = 'ico-'+module;
		iconHolder.appendChild(icon);
		li.appendChild(iconHolder);

		var a = document.createElement('a');
		a.setAttribute('data-module', module);
		a.className = helperPull;

		var textHolder = document.createElement('span');
		textHolder.setAttribute('data-ltag', module);
		a.appendChild(textHolder);
		li.appendChild(a);

		var clear = document.createElement('div');
		clear.className = 'clearfix';
		li.appendChild(clear);

		a.t = this;
		a.addEventListener('click', function(){
			var category = this.getAttribute('data-module');
			this.t.loadCategory(category);
		}, false);

		return li;
	};

	web_travi.prototype.cleanMenuCategory = function() {
		var lis = document.querySelectorAll('.main-menu>li');
		for(var i = 0, len = lis.length; i < len; i++){
			var li = lis[i];
			li.className = '';
		}
	};

	web_travi.prototype.activeMenuCategory = function(category) {
		var elms = document.querySelectorAll('li[data-module="'+category+'"]');
		this.cleanMenuCategory();
		for(var i = 0, len = elms.length; i < len; i++){
			var el = elms[i];
			el.className = 'active';
		}
	};

	web_travi.prototype.setCurrentImage = function(i) {
		var fkey = Object.keys(this.images)[i];
		var img = this.images[fkey];
		
		this.cImg = img; // c es por current
		this.cFkey = fkey;
		$(img.dom).css('z-index', 2);
		$(img.dom).fadeIn('slow');
	};

	web_travi.prototype.prepareNextImage = function() {
		if(typeof this.cImg !== 'undefined'){
			$(this.cImg.dom).css('z-index', '');
			$(this.cImg.dom).fadeOut('slow');
		}
	};

	web_travi.prototype.getNextImage = function() {
		this.prepareNextImage();

		var keys = Object.keys(this.images);
		var next;
		for(var i = 0, len = keys.length; i < len; i++){
			var k = keys[i];
			if(this.images.hasOwnProperty(k)){
				if(this.cFkey === k){
					next = typeof keys[i + 1] === 'undefined' ? 0 : i + 1;
					break;
				}
			}
		}

		this.setCurrentImage(next);
	};

	web_travi.prototype.getPrevImage = function() {
		this.prepareNextImage();

		var keys = Object.keys(this.images);
		var prev;
		for(var i = 0, len = keys.length; i < len; i++){
			var k = keys[i];
			if(this.images.hasOwnProperty(k)){
				if(this.cFkey === k){
					prev = typeof keys[i - 1] === 'undefined' ? keys.length - 1 : i - 1;
					break;
				}
			}
		}

		this.setCurrentImage(prev);
	};

	web_travi.prototype.browserLanguage = function() {
		var lang = navigator.language || navigator.userLanguage;
		lang = lang.match(/([a-z]+)/gi);
		if(lang !== null){
			lang = lang[0];
		}

		var l = '';
		switch(lang){
			case 'en':
			case 'de':
			case 'es':
				l = lang;
			break;
			default:
				l = 'en';
			break;
		}

		return l;
	};

	var bio = new web_travi();
	window.bio = bio;
})(window);