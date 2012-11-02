/*******************************
 *  存放 不在当前目录的 依赖文件
 */
define('mod/lang', '../../Ozjs/mod/lang.js');

/**********************************************/

//zepto
define('zepto', ['../../zepto/src/zepto'], function() {
	return Zepto;
});

define('mod/event', '../../Ozjs/mod/event.js');
define('observer', ['mod/event'], function(ob) {
	return ob();
});

define('tool', [], function() {
	return {
		copy : function( source ,target ){
			for( var k in source){
				target[k] = source[k] ;
			}
			return target ;
		}
		
	};
});

	/**
	 * @author  
	 */
define('XMLDoc', [], function() {
	// 定义一个XMLDoc类
	function XMLDoc() {
			// 具体内容
			this.xmlFile = "";
			// 加载路径
			this.url = "";
			this.xmlHttp = new XMLHttpRequest();
	};

	
	// 属性
	XMLDoc.prototype.parseXMLDoc = function() {
		// 加载解析XML文件的成员方法
		var docParser;
		if (window.ActiveXObject) {// IE浏览器支持
			docParser = new ActiveXObject("Microsoft.XMLDOM");
			docParser.async = "false";
			docParser.load(this.xmlFile);
			return docParser;
		} else if (window.DOMParser) {// 非ie浏览器支持
			docParser = new DOMParser()
			return docParser.parseFromString(this.xmlFile, "text/xml");
		} else {// 如果不是IE和Mozillia浏览器则无法解析，返回false。
			return false;
		}
	}
	XMLDoc.prototype.print = function(readTagName, readTagCnt) {
		// 打印输出读取的XML文件的内容信息
		var xmlDoc = this.parseXMLDoc();
		// 调用成员方法parseXMLDoc()加载解析XML文件
		var users = xmlDoc.getElementsByTagName(readTagName);
		// 获取指定标签名称的数据的一个数组users
		var item ;
		for (var i = 0; i < users.length; i++) {// 双重循环迭代输出
			document.write("<B>第" + (i + 1) + "条记录信息：</B><BR>");
			for (var j = 0; j < users[i].childNodes.length; j++) {
				item = users[i].childNodes[j] ;
				if(item&&item.nodeType==1){
					var tagname = item.tagName;
					var textvalue =  item.textContent;
					document.write(tagname + " = " + textvalue + ".<BR>");
				}
			}
		}
	}
	
	XMLDoc.prototype.loadXMLDoc = function (url , callback) {
		url = url || this.url ;
		var xd = this ;
		var xmlHttp = this.xmlHttp ;
		xmlHttp.onreadystatechange =  function(event) {
				if (this.readyState != 4) {
					return;
				}
				xd.xmlFile = this.responseText ;
				callback.call(xd);
			};
	
		this.xmlHttp.open("GET", url, false);
		this.xmlHttp.send(null);
	}
	
	return XMLDoc ;
}); 

// modules ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 引用进来的对象, 创建成的模块名需要和 引用名一致
define('canvas', ["observer"], function(observer) {
	var worker = new Worker('script/workerCanvas.js');
	worker.onmessage = function(event) {
		//console.log(event.data);
		// 得到绘画值
		var data = event.data;
		observer.fire('worker:onmessage', [data]);
	}
	// 设置 canavas 对象

	//
	var _canvas = null;
	var _context = null;
	var _cellWH = [];

	function __clearCell(x, y) {
		if(_context.fillStyle != "#CCCCCC"){
			_context.fillStyle = "#CCCCCC";
		}
		//_context.clearRect(x * _cellWH[0]-1, y * _cellWH[1]-1, _cellWH[0]+2, _cellWH[1]+2);
		//_context.fillRect(x * _cellWH[0]-1, y * _cellWH[1]-1, _cellWH[0]+2, _cellWH[1]+2);
		//_context.strokeRect(x * _cellWH[0], y * _cellWH[1], _cellWH[0], _cellWH[1]);
		
		_context.fillRect(x * _cellWH[0], y * _cellWH[1], _cellWH[0], _cellWH[1]);
	}

	function __drawCell(x, y) {
		if(_context.strokeStyle != "#000000"){
			_context.strokeStyle = "#000000";
			//_context. //和 lineWidth
		}
		_context.strokeRect(x * _cellWH[0]+1, y * _cellWH[1]+1, _cellWH[0]-2, _cellWH[1]-2);
	}

	/************************************************************
	 *   list 级的刷新
	 */
	function __clearList(list) {
		console.log("__clearList : 1   "+ (new Date()).getTime());
		var item = null ;
		for (var j = 0; j < list.length; j++) {
			item = list[j];
			__clearCell(item.x, item.y);
		}
		console.log("__clearList : 2   " + (new Date()).getTime());
	}
	
	function __drawList(list) {
		console.log("__drawList : 1   "+ (new Date()).getTime());
		var item = null ;
		for (var j = 0; j < list.length; j++) {
			item = list[j];
			__drawCell(item.x, item.y);
		}
		console.log("__drawList : 1   "+ (new Date()).getTime());
	}
	/* end *********************************************************/
	
	/************************************************************
	 *   map 级的刷新
	 */
	function __clearMap(map) {
		var ilen = map[0].length;
		var jlen = map.length;
		for (var j = 0; j < jlen; j++) {
			for (var i = 0; i < ilen; i++) {
				if (map[j][i]) {
					__clearCell(i, j);
				};
			}
		}
	}
	
	function __drawMap(map) {
		var ilen = map[0].length;
		var jlen = map.length;
		for (var j = 0; j < jlen; j++) {
			for (var i = 0; i < ilen; i++) {
				if (map[j][i]) {
					__drawCell(i, j);
				};
			}
		}
	}
	/* end *********************************************************/
	
	function __rebuildMap(map) {
		var body = {
			map : map
		};
		//console.log(JSON.stringify(body));
		worker.postMessage(JSON.stringify(body));

		_context.fillStyle = "#CCCCCC";
		_context.fillRect(0, 0, _canvas.width, _canvas.height);

		var ilen = map[0].length;
		var jlen = map.length;

		_cellWH = [_canvas.width / ilen, _canvas.height / jlen];
		
		//_context.fillStyle = "#000000";
		__drawMap(map);
	}

	function __refresh() {
		
	}

	var it = {
		create : function(config) {
			_canvas = document.querySelector("#" + config.id);
			_canvas.width = config.width;
			_canvas.height = config.height;
			_context = _canvas.getContext("2d");
			__rebuildMap(config.map);
		},
		refresh:function(data){
			__clearList(data[0]);
			__drawList(data[1]);
		}
		
	};

	return it;
});

// end~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
 altKey: false
bubbles: true
button: 0
cancelBubble: false
cancelable: true
charCode: 0
clientX: 1089
clientY: 329
clipboardData: undefined
ctrlKey: false
currentTarget: HTMLBodyElement
dataTransfer: null
defaultPrevented: false
detail: 1
eventPhase: 2
fromElement: null
keyCode: 0
layerX: 1089
layerY: 329
metaKey: false
offsetX: 1089
offsetY: 329
pageX: 1089
pageY: 329
relatedTarget: null
returnValue: true
screenX: 1118
screenY: 417
shiftKey: false
srcElement: HTMLBodyElement
target: HTMLBodyElement
timeStamp: 1350311791223
toElement: HTMLBodyElement
type: "mousedown"
view: Window
webkitMovementX: 0
webkitMovementY: 0
which: 1
x: 1089
y: 329
 * 
 */

/*
 
 var curIdentifier = event.changedTouches
				? event.changedTouches[0].identifier
				: 1;
		var curPageX = event.changedTouches
				? event.changedTouches[0].pageX
				: event.pageX;
		var curPageY = event.changedTouches
				? event.changedTouches[0].pageY
				: event.pageY;
		// 过滤第二个指头的事件
		if (!this.touchIdentifier || event.touches && event.touches.length == 1) {
			// 初始化变量
			this.touchIdentifier = curIdentifier;
			this.startPageX = curPageX;
			this.startPageY = curPageY;
		}
  
 */

/*
 if (!this.isActivate || this.startPageX == undefined
				|| this.startPageY == undefined) {
			return;
		}

		var curIdentifier = event.changedTouches
				? event.changedTouches[0].identifier
				: 1;
		var curPageX = event.changedTouches
				? event.changedTouches[0].pageX
				: event.pageX;
		var curPageY = event.changedTouches
				? event.changedTouches[0].pageY
				: event.pageY;
		// 过滤不是同一个指头的事件
		if (this.touchIdentifier != curIdentifier)
			return;
		this.touchIdentifier = undefined;
 
 
 
 */


/*
  	var y = document.body.scrollTop ;
		// 目标坐标在点击和释放时不同
		// 释放不在源上
		if (this.clickCallback) {
			this.clickRuntime = this.clickRuntime || this.downRuntime;
			if (curPageX > rect.left && curPageX < rect.right) {
				if (curPageY > (rect.top+y) && curPageY < (rect.bottom+y) ) {
					if (this.clickRuntime) {
						this.clickCallback.call(this.clickRuntime, event);
					} else {
						this.clickCallback.call(event);
					}
				}
			}
		}
		this.touchIdentifier = undefined;
		this.startPageX = undefined;
		this.startPageY = undefined;
  
  
  
 */

/**
 * 事件委派
 *  封装全局事件
 */
define('uiProxy', ['zepto'], function($) {
	// 接收 指定 ui , 及 响应 callback 
	var body =document.body;
	var etype = "1";
	if(body.ontouchstart !== undefined){
			body.addEventListener("touchstart", __touchstartListener,false);
			//
	}else{
			body.addEventListener("mousedown", __mousedownListener,false);
	}

	// 取出对象的 id
	var _idMap = {};
	// 取出对象  className
	var _styleMap = {};
	// 取出 对象 html类型
	var _elMap = {};
	// 取出对象 name
	var _nameMap = {}; 

	var Const = {};				
	
	var _proxyMap = {};
	
	// 目标和点触对象
	var target = null ;
	function __click(event){
		target = event.srcElement ;
		var id = target.id ;
		var idMap = _proxyMap["click"]["id"] ;
		var callback = idMap[id];
		if(callback){
			callback(event);
		}
		
		var el = target.tagName ;
		
		var style = target.className;
		
		var name = target.name;
	}
	
	function __down(event){
		target = event.srcElement ;
		var id = target.id ;
		var idMap = _proxyMap["down"]["id"] ;
		var callback = idMap[id];
		if(callback){
			callback(event);
		}
	}
	
	function __touchstartListener(event){
		__down(event);
		//target = event
		body.addEventListener("touchend", __touchendlistener,false);
	}
	
	function __touchendlistener(event){
		
		//target = event
		__click(event);
	}
	
	
	function __mousedownListener(event){
		__down(event);
		
		target = event.srcElement ;
		// 取出对象的 id
		var id ;
		// 取出 对象 html类型
		var el ;
		// 取出对象  className
		var className ;
		// 取出对象 name
		var name ;
		/*
		var idMap = _proxyMap.id ;
		var idObj = idMap[id];
		if(idObj){
			idObj.callback();
		}
		*/
		// 链接 up
		body.addEventListener("mouseup", __mouseupListener,false);
	}
	
	function __mouseupListener(event){
		
		
		__click(event);
	}
	
	// 全局监听
	function listener(event){
		 
	}
	// 事件 分发 
	function __inductionEvent(type  , marker ,callback){
		_proxyMap[type] = _proxyMap[type] || {};
			_proxyMap[type]["id"] = _proxyMap[type]["id"] || {};
			_proxyMap[type]["style"] = _proxyMap[type]["style"] || {};
			_proxyMap[type]["el"] = _proxyMap[type]["el"] || {};
			_proxyMap[type]["name"] = _proxyMap[type]["name"] || {};
			// 取第一个字符
			var first = marker.charAt(0);
			if (first === "#") {
				// 取出对象的 id
				_proxyMap[type]["id"][marker.substr(1)] = callback;
			} else if (first === ".") {
				// 取出对象  className
				_proxyMap[type]["style"][marker.substr(1)] = callback;
			} else if (first.match(/[A-Z]/)) {
				// 取出 对象 html类型
				_proxyMap[type]["el"][marker] = callback;
			} else {
				// 取出对象 name
				_proxyMap[type]["name"][marker] = callback;
			}
	};
	
	var proxy = {
		/**
		 * addConfige : function(...)<br>
		 * 添加委托配置<br>
		 * 
		 * @param marker
		 *            string 必填 对象的标示( #a  /   .a   /  DIV   )。<br>
		 * @param event
		 *            string 必填 对响应的事件。 null则默认 <br>
		 * @param callback
		 *            function  必填 对响应的回调。 <br>
		 */

		addClick : function(marker   , callback) {
			__inductionEvent("click" , marker   , callback);
			return this;
		},
		addDown : function(marker   , callback) {
			__inductionEvent("down" , marker   , callback);
			return this;
		}
		
	};

	
	return proxy;
});

/**
 * view
 *
 */
define('view', ['zepto', 'observer', 'canvas','uiProxy'], function($, observer, canvas, uiProxy) {
	function __init(map) {
		canvas.create({
			id : "mc",
			width : 600,
			height : 800,
			map : map
		});
		
		// 推入委派
		uiProxy.addClick("#change" , function(event){
			observer.fire("view:change");
		}).addDown("#left" , function(event){
			observer.fire("view:move" , [{"x":-1}]);
		}).addDown("#right" , function(event){
			observer.fire("view:move" , [{"x":1}]);
		}).addDown("#down" , function(event){
			observer.fire("view:move" , [{"y":1}]);
		}).addDown("#next" , function(event){
			observer.fire("view:next" , []);
		}).addDown("#returned" , function(event){
			observer.fire("view:returned" , []);
		})
		//  对象名   
		// 事件名
		// 回调
	};
	
	
	function __clearCat(map){
		//canvas.
	}
	
	function __drawCat(map){
		//canvas.
	}
			
	
	function __refresh(data){
		canvas.refresh(data);
		observer.fire('view:drawComplete');
	}

	/**
	 * 1. 复原界面
	 * 2. 初始化状态
	 */
	function __recover() {

	}

	function __draw() {

	}

	return {
		init : function(map) {
			//observer.fire('view:begin');
			__init(map);
		},
		refresh : function(data){
			//__clearCat(data[0]);
			//__drawCat(data[1]);
			__refresh(data);
		}
	}
});

/**
 *	model
 */
define('model', ['zepto', 'observer' ,'tool'], function($, observer ,tool) {
	var _backup = false ;
	var _row = 12;
	var _line = 16;
	var _map = [];
	// 生成 初始 map ;
	(function() {
		for (var i = 0; i < _line; i++) {
			_map[i] = [];
			for (var j = 0; j < _row; j++) {
				_map[i][j] = 0;
			}
		}
	})();

	// 起始出现的位置
	var _startXY =  {x:_row * 0.5, y:0};
	function __getStartXY(){
		return tool.copy( _startXY , {}) ;
	}

	//  组别
	var _typeRect = {
		"0" : [[1]],
		"1" : [[1], [1], [1], [1]],
		"2" : [[1, 1, 0], [0, 1, 1]],
		"3" : [[0, 1, 0], [1, 1, 1]],
		"4" : [[1, 1], [1, 0], [1, 0]],
		"5" : [[1, 1], [1, 1]],
	};

	/**
	 *  0  :  单个
	 *  1 :  4个长条
	 *  2 : Z形
	 *  3 :  凸形
	 *  4 :  F形
	 */
	var _type = ["0", "1", "2", "3", "4","5"];
	/**
	 * 0 : 上
	 *  1： 右
	 *  2： 下
	 *  3 : 左
	 */
	var _direction = ["0", "1", "2", "3"];
	/*
	 *  0 : 正
	 *  1 :  左右反换
	 */
	var _scale = ["0", "1"];

	var _drawList = [];
	var _clearList = [];

	// 当前对象
	var _cat = {
		initialRect : null,
		rect : null
	};
	
	function __initCat(){
		_cat = {
			initialRect : null,
			rect : null
		};
	}

	function __rebuildCat() {
		__initCat();
		var $type = _type[Math.floor(Math.random() * _type.length)];
		var $direction = "0";//_direction[Math.floor(Math.random() * _direction.length)];
		var $scale = _scale[Math.floor(Math.random() * _scale.length)];

		var id = $type + $direction + $scale;
		//$type = "5";
		var rect = _typeRect[$type];
		//_direction = "3" ;
		rect = __getDirection($direction, rect);
		rect = __getScale($scale, rect);

		_cat.initialRect = rect;
		_cat.rect = rect;
		_cat.id = id;
		_cat.direction = $direction ;
		// 计算初始位置
		_cat.xy = __getStartXY();
		// 给出绘制
		_drawList = __getGlobalList(rect);
		
		// 计算当前是否已经碰触底部
		
		// 刷新map
		
		//notify();
		// 不把计算逻辑交给外部 .   
		//  计算应该绘制和清除的xy
		
		// 将绘制 和清除的 xy组比较, 凡是都有的则不清理
	}
	
	function __getGlobalList( rect){
		var list  = [] ;
		for(var i = 0 ; i  < rect.length ; i++){
			for(var j = 0 ; j < rect[i].length ; j++){
				if(rect[i][j]){
					list.push( {
												x:  _cat.xy.x + j ,
												y: _cat.xy.y + i ,
											} )
				}
			}
		}
		return list ;
	}

	// 变更方向
	function __getDirection(type, rect) {
		var map = [];
		var _rect = {};
		if(!_cat.initialRect){
			_rect = rect;
		}else{
			_rect =  _cat.initialRect ;
		}
		// 过滤  非变形
		if(_rect.length == _rect[0].length){
			type = ""+0 ;
		}
		// 针对原图形的翻转
		switch(type) {
			case "0" :
				map = _cat.initialRect;
				return map ? map : _rect;

			case "1" :
				// 反转->
				for (var j = 0; j < _rect[0].length; j++) {
					map[j] = [];
					for (var i = _rect.length - 1; i >= 0; i--) {
						map[j].push(_rect[i][j]);
					}
				}
				return map;

			case "2" :
				//  翻转  ||
				//map  = rect.reverse();
				for (var i = _rect.length - 1; i >= 0; i--) {
					map.push(_rect[i].reverse());
				};
				return map ;

			case "3" :
				// 反转<-
				var k = 0;
				for (var j = _rect[0].length - 1; j >= 0; j--) {
					map[k] = [];
					for (var i = 0; i < _rect.length; i++) {
						map[k].push(_rect[i][j]);
					}	;
					k++;
				}
				return map;
		}
		console.error("输入的错误的方向: [type] " + type );
	}

	// 变更翻转
	function __getScale(type, rect) {
		if (type == "0")
			return rect;
		var map = [];
		for (var i = 0; i < rect.length; i++) {
			map.push(rect[i].reverse());
		};
		return map;
	}

	// 验证xy边界
	function __verifyXY(x,y){
		if(x+ _cat.rect[0].length  > _row  ){
			x = _row - _cat.rect[0].length ;
		}else if(x <0){
			x = 0;
		} 
		_cat.xy.x  = x ;
		
		if(y+ _cat.rect.length  >= _line ){
			y = _line - _cat.rect.length ;
			clearInterval(_interval);
			_interval = 1 ;
		}
		_cat.xy.y  = y ;
	}
	// 变更X
	function __changeX(x) {
		if(x+ _cat.rect[0].length  > _row  || x <0){
			return; 
		} 
		_cat.xy.x  = x ;
		// 判定边界
		__updateList();
	}

	// 变更Y
	function __changeY(y) {
		if(y+ _cat.rect.length  >= _line ){
			y = _line - _cat.rect.length ;
			clearInterval(_interval);
			_interval = 1 ;
		}
		_cat.xy.y  = y ;
		// 判定边界
		__updateList();
	}

	// 影响值
	//function (){};
	var _interval = null ;
	function __running() {
		console.log((new Date()).getTime());
		_backup = false ;
		 if (_interval) { return};
		 return;
			_interval = setInterval(function() {
				__refreshCat();
				__notify();
			}, 1000);
		
		
	}
	
	function __changeDirectionCat(){
		//var $direction = ""+(Number(_cat.direction)+1) ; //Number(_cat.direction)+1 <= Number(_direction[_direction.length-1]) ? ""+(Number(_cat.direction)+1) : "0";
		var $direction = "";
		if(Number(_cat.direction) < Number(_direction[_direction.length-1]) ){
			$direction = 	""+(Number(_cat.direction)+1) ;
		}else{
			$direction = 	""+0;
		}
		_cat.direction= $direction ;
		console.log(_cat.direction);
		var rect = __getDirection($direction);
		_cat.rect = rect ;
		// 改变方向后,超出 右/下 ; 退位
		__verifyXY(_cat.xy.x,_cat.xy.y);
	}
	
	function __nextNew(){
		// 清理掉 _clearList旧记录
		_clearList = [];
		_cat = null ;
		// 创建个新的
		__rebuildCat();
	}
	
	function __returnedGood(){
		//删除已绘制
		_clearList = _drawList ;
		_drawList = [];
		// 创建个新的
		//__rebuildCat();
	}
	
	function __updateList(){
		_clearList = _drawList ;
		_drawList = __getGlobalList(_cat.rect);
	}

	// 刷新
	function __refreshCat() {
		__changeY(_cat.xy.y + 1 );
	}

	// 发起 绘制 和清除的通知
	function __notify() {
		_backup = true ;
		
		var clearList = _clearList.concat() ,drawList =_drawList.concat();
		
		for(var i = 0 ; i < clearList.length ; i++){
			for (var j=0; j < drawList.length; j++) {
			  if (clearList[i].x == drawList[j].x && clearList[i].y == drawList[j].y) {
			  		clearList.splice(i , 1);
			  		drawList.splice(j , 1);
			  		i--;
			  		break;
			  	};
			};
		}
		
		// 过滤map表
		
		
		//TODO 生成坐标记录
		/*
		console.log((new Date()).getTime());
		console.log((function(){
			var str = "";
			for(var i  = 0 ; i <  clearList.length ; i++ ){
				for(var j  in clearList[i] ){
						str+=clearList[i] +" : "+ clearList[i][j] + " \n";
					}
			}
			str +="-----" ;
			for(var i  = 0 ; i <  drawList.length ; i++ ){
				for(var j  in drawList[i] ){
						str+=drawList[i] +" : "+ drawList[i][j] + " \n";
					}
			}
			
			return str ;
		})());
		*/
		observer.fire('model:draw', [[clearList, drawList]]);
	}

	//  计算 对象,如果在当前y轴, 旋转后,超出负Y轴,设区不绘制

	// 计算出 要绘制和清除的 xy

	return {
		init : function() {
			observer.fire('view:begin');
		},
		getMap : function() {
			return _map;
		},
		rebuild : function() {
			__rebuildCat();
			__notify();
		},
		/**
		 * 绘制下一步 
		 */
		drawNext : function(){
			__running();
		},
		changeDirection : function(){
			// data 
			if(_backup){
				return ;
			}
			__changeDirectionCat();
			__updateList();
			__notify();
		},
		move : function(data){
			if(_backup){
				return ;
			}
			if (data.x != null) {
				__changeX(_cat.xy.x + Number(data.x) );
			}
			 if(data.y != null){
				__changeY(_cat.xy.y + Number(data.y) );
			}
			__notify();
		},
		next : function(data){
			// data : 预留 新增可选
			__nextNew(data);
			__notify();
		},
		returned : function(data){
			// data : 预留可选
			__returnedGood(data);
			__notify();
		}
		
	}
});

/**
 * app
 *
 */
define('app', ['zepto', 'observer', 'view', 'model' , 'XMLDoc'], function($, observer, view, model ,XMLDoc) {

	observer.bind('view:begin', function() {
		//console.log('sd');
		//worker.postMessage("{first:347734080,second:3423744400}");
	}).bind('worker:onmessage', function(data) {
		//console.log("b:  " + data);
	}).bind('model:draw', function(data) {
	  	view.refresh(data);
	}).bind('view:drawComplete', function() {
	  	model.drawNext();
	}).bind('view:change', function() {
	  	model.changeDirection();
	}).bind('view:move', function(data) {
	   model.move(data);
	}).bind('view:next', function(data) {
	   model.next(data);
	}).bind('view:returned', function(data) {
	   model.returned(data);
	})

	function test(){
		return;
		var a = new XMLDoc();
		a.url = "a.xml";
		a.loadXMLDoc(null, function(){
			this.print("item");
		});
	}


	return {
		init : function() {
			//console.log('this' + $ +  '       ' + observer);
			view.init(model.getMap());
			model.rebuild();
			
			//test();
		}
	}
});
